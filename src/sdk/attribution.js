import Config from './config'
import Storage from './storage'
import request from './request'
import identity from './identity'
import backOff from './backoff'
import {publish} from './pub-sub'
import {getTimestamp} from './time'
import {extend} from './utilities'

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
 * @type {string}
 * @private
 */
let _createdAt = ''

/**
 * Check if new attribution is the same as old one
 *
 * @param {string} adid
 * @param {Object} newAttribution
 * @returns {Promise}
 * @private
 */
function _isSame (adid, newAttribution) {

  const check = [
    'tracker_token',
    'tracker_name',
    'network',
    'campaign',
    'adgroup',
    'creative',
    'click_label'
  ]

  return identity()
    .then(activityState => {
      const oldAttribution = activityState.attribution || {}
      const anyDifferent = check.some(key => {
        return oldAttribution[key] !== newAttribution[key]
      })
      const isSame = !anyDifferent && adid === oldAttribution.adid

      return {isSame, activityState}
    })
}

/**
 * Set new attribution and notify client's callback
 *
 * @param {Object} attributionResult
 * @param {Object} attributionResult.attribution
 * @private
 */
function _setAttribution (attributionResult = {}) {

  const adid = attributionResult.adid || null
  const attribution = attributionResult.attribution || {}

  return _isSame(adid, attribution)
    .then(result => {
      if (!result.isSame) {
        return Storage.updateItem(
          'activityState',
          extend({}, result.activityState, {attribution: extend({adid: adid}, attribution)})
        )
      }
      return null
    })
    .then(changed => {
      if (changed) {
        publish('attribution:change', attributionResult)
      }
      return attributionResult
    })
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

  return new Promise(() => {
    _timeout.id = setTimeout(() => {
      return _request()
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
 * @returns {Promise}
 * @private
 */
function _request () {
  return request({
    url: '/attribution',
    params: extend({
      created_at: _createdAt
    }, Config.baseParams)
  }).then(_requestAttribution)
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
    return _setAttribution(result)
  }

  _timeout.attempts = 0

  return _delayedRequest(result.ask_in)
}

/**
 * Check current attribution and perform certain actions if retrieved
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

