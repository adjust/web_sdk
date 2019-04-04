import Config from './config'
import request from './request'
import backOff from './backoff'
import {publish} from './pub-sub'
import {getTimestamp} from './time'
import {extend} from './utilities'
import {updateActivityState} from './identity'
import ActivityState from './activity-state'

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
 * @param {Object} attribution
 * @returns {boolean}
 * @private
 */
function _isSame ({adid = '', attribution = {}}) {

  const check = [
    'tracker_token',
    'tracker_name',
    'network',
    'campaign',
    'adgroup',
    'creative',
    'click_label'
  ]

  const oldAttribution = ActivityState.current.attribution || {}
  const anyDifferent = check.some(key => {
    return oldAttribution[key] !== attribution[key]
  })

  return !anyDifferent && adid === oldAttribution.adid
}

/**
 * Update attribution and initiate client's callback
 *
 * @param {Object} result
 * @private
 */
function _setAttribution (result = {}) {
  if (_isSame(result)) {
    return Promise.resolve(result)
  }

  const attribution = extend({adid: result.adid}, result.attribution)

  return updateActivityState({attribution})
    .then(() => {
      publish('attribution:change', attribution)
      return attribution
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

