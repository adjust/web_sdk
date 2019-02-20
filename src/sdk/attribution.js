import request from './request'
import {setItem, getItem} from './storage'
import {publish} from './pub-sub'

/**
 * Timeout id to keep when delayed attribution check is about to happen
 *
 * @type {Number}
 * @private
 */
let _timeoutId = null

/**
 * Check if new attribution is the same as old one
 *
 * @param {string} adid
 * @param {Object} newAttr
 * @returns {boolean}
 * @private
 */
function _isSame (adid, newAttr) {

  const oldAttr = getItem('attribution')
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

  clearTimeout(_timeoutId)

  return new Promise(resolve => {
    _timeoutId = setTimeout(() => {
      return request({url: '/attribution', params})
        .then(result => resolve(_requestAttribution(result, params)))
    }, result.ask_in)
  })


}

/**
 * Check attribution of the user and perform certain actions if retrieved
 *
 * @param {Object} sessionResult
 * @param {Number} sessionResult.ask_in
 * @param {Object} params
 */
export function checkAttribution (sessionResult = {}, params) {

  if (!sessionResult.ask_in) {
    return Promise.resolve(sessionResult)
  }

  return _requestAttribution(sessionResult, params)
}

