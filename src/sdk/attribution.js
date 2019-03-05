import Config from './config'
import request from './request'
import {setItem, getItem} from './storage'
import {publish} from './pub-sub'
import backOff from './backoff'
import {getTimestamp} from './time'

/**
 * Timeout id and wait when delayed attribution check is about to happen
 *
 * @type {Object}
 * @private
 */
let _timeout = {id: null, attempts: 0}

/**
 * Cache create_at date when trying to check attribution
 *
 * @type {Date}
 * @private
 */
let _createdAt = null

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
 * @returns {Promise}
 * @private
 */
function _delayedRequest (wait) {

  clearTimeout(_timeout.id)

  return new Promise(resolve => {
    _timeout.id = setTimeout(() => {
      return _request(resolve)
    }, wait)
  })
}

/**
 * Retry request after some pre-calculated time
 *
 * @returns {Promise}
 * @private
 */
function _retry () {

  _timeout.attempts += 1

  return _delayedRequest(backOff(_timeout.attempts))
}

/**
 * Make the request and retry if necessary
 *
 * @param {Function} resolve
 * @returns {Promise}
 * @private
 */
function _request (resolve) {
  return request({
    url: '/attribution',
    params: Object.assign({
      created_at: _createdAt
    }, Config.baseParams)
  }).then(result => resolve(_requestAttribution(result)))
    .catch(_retry)
}

/**
 * Request the attribution if needed and when retrieved then try to preserve it
 *
 * @param {Object} result
 * @returns {Promise}
 * @private
 */
function _requestAttribution (result = {}) {

  if (!result.ask_in) {
    _setAttribution(result)
    return Promise.resolve(result)
  }

  _timeout.attempts = 0

  return _delayedRequest(result.ask_in)
}

/**
 * Check attribution of the user and perform certain actions if retrieved
 *
 * @param {Object} sessionResult
 * @param {number} sessionResult.ask_in
 */
export function checkAttribution (sessionResult = {}) {

  if (!sessionResult.ask_in) {
    return Promise.resolve(sessionResult)
  }

  _createdAt = getTimestamp()

  return _requestAttribution(sessionResult)
}

