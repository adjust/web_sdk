import request from './request'
import {setItem, getItem} from './storage'
import {publish} from './pub-sub'
import backOff from './backoff'
import {getTimestamp} from './utilities'

/**
 * Timeout id and wait when delayed attribution check is about to happen
 *
 * @type {Object}
 * @private
 */
let _timeout = {id: null, attempts: 0}

/**
 * Check if new attribution is the same as old one
 *
 * @param {string} adid
 * @param {Object} newAttr
 * @returns {boolean}
 * @private
 */
function _isSame (adid, newAttr) {

  const oldAttr = getItem('attribution', {})
  const check = [
    'tracker_token',
    'tracker_name',
    'network',
    'campaign',
    'adgroup',
    'creative',
    'click_label'
  ]

  const anyDifferent = check.some(attr => {
    return oldAttr[attr] !== newAttr[attr]
  })

  return !anyDifferent && adid === oldAttr.adid
}

/**
 * Set new attribution and notify client's callback
 *
 * @param {Object} result
 * @param {Object} result.attribution
 * @private
 */
function _setAttribution (result = {}) {

  const adid = result.adid || null
  const attribution = result.attribution || {}

  if (_isSame(adid, attribution)) { return }

  setItem('attribution', Object.assign({adid: adid}, attribution))
  publish('attribution:change', result)

}

/**
 * Make delayed request after provided time
 *
 * @param {number} wait
 * @param {Object} params
 * @returns {Promise}
 * @private
 */
function _delayedRequest (wait, params) {

  clearTimeout(_timeout.id)

  return new Promise(resolve => {
    _timeout.id = setTimeout(() => {
      return _request(resolve, params)
    }, wait)
  })
}

/**
 * Retry request after some pre-calculated time
 *
 * @param {Object} params
 * @returns {Promise}
 * @private
 */
function _retry (params) {

  _timeout.attempts += 1

  return _delayedRequest(backOff(_timeout.attempts), params)
}

/**
 * Make the request and retry if necessary
 *
 * @param {Function} resolve
 * @param {Object} params
 * @returns {Promise}
 * @private
 */
function _request (resolve, params) {
  return request({
    url: '/attribution',
    params: Object.assign((params.base || params), {created_at: params.created_at})
  }).then(result => resolve(_requestAttribution(result, params)))
    .catch(() => _retry(params))
}

/**
 * Request the attribution if needed and when retrieved then try to preserve it
 *
 * @param {Object} result
 * @param {Object} params
 * @returns {Promise}
 * @private
 */
function _requestAttribution (result = {}, params) {

  if (!result.ask_in) {
    _setAttribution(result)
    return Promise.resolve(result)
  }

  _timeout.attempts = 0

  return _delayedRequest(result.ask_in, params)
}

/**
 * Check attribution of the user and perform certain actions if retrieved
 *
 * @param {Object} sessionResult
 * @param {number} sessionResult.ask_in
 * @param {Object} params
 */
export function checkAttribution (sessionResult = {}, params) {

  if (!sessionResult.ask_in) {
    return Promise.resolve(sessionResult)
  }

  params.created_at = getTimestamp()

  return _requestAttribution(sessionResult, params)
}

