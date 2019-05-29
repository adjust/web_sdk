import Config from './config'
import request from './request'
import backOff from './backoff'
import {publish} from './pub-sub'
import {getTimestamp} from './time'
import {extend} from './utilities'
import {updateActivityState} from './identity'
import ActivityState from './activity-state'
import Logger from './logger'

const DEFAULT_ATTEMPTS = 0
const DEFAULT_WAIT = 150

/**
 * Timeout id and wait when delayed attribution check is about to happen
 *
 * @type {Object}
 * @private
 */
let _timeout = {
  id: null,
  attempts: DEFAULT_ATTEMPTS,
  running: false
}

/**
 * Cache create_at date when trying to check attribution
 *
 * @type {string}
 * @private
 */
let _createdAt = ''

/**
 * Initiated by flag to send to the attribution request
 * - `sdk` - when initiated by the sdk itself after initial session without ask_in
 * - `backend` - by default, when initiated due to ask_in parameter from session
 *
 * @type {string}
 * @private
 */
let _initiatedBy = ''

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

  Logger.log('Request /attribution has been finished')

  if (_isSame(result)) {
    return Promise.resolve(result)
  }

  const attribution = extend({adid: result.adid}, result.attribution)

  return updateActivityState({attribution})
    .then(() => {
      publish('attribution:change', attribution)
      Logger.info('Attribution has been updated')
      Logger.log('Updated attribution:', attribution)
      return attribution
    })
}

/**
 * Make delayed request after provided time
 *
 * @param {number} wait
 * @param {boolean=false} retrying
 * @returns {Promise}
 * @private
 */
function _delayedRequest (wait, retrying) {

  _timeout.running = true

  if (_timeout.id) {
    _clearTimeout()
  }

  Logger.log(`${retrying ? 'Re-trying' : 'Trying'} request /attribution in ${wait}ms`)

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
  _timeout.running = false

  _clearTimeout()

  return _delayedRequest(backOff(_timeout.attempts, 'short'), true)
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
      createdAt: _createdAt,
      initiatedBy: _initiatedBy
    }, Config.baseParams)
  }).then(_requestAttribution)
    .catch(_retry)
}

/**
 * Request the attribution if needed and when retrieved then try to preserve it
 *
 * @param {Object} result
 * @param {number=} selfInitiatedAskIn
 * @returns {Promise}
 * @private
 */
function _requestAttribution (result = {}, selfInitiatedAskIn) {

  const askIn = result.ask_in || selfInitiatedAskIn

  if (!askIn) {
    _timeout.attempts = DEFAULT_ATTEMPTS
    _timeout.running = false

    _clearTimeout()

    return _setAttribution(result)
  }

  return _delayedRequest(askIn)
}

/**
 * Check current attribution and perform certain actions if retrieved
 *
 * @param {Object} sessionResult
 * @param {number=} sessionResult.ask_in
 */
function checkAttribution (sessionResult = {}) {

  if (!sessionResult.ask_in && ActivityState.current.attribution) {
    return Promise.resolve(sessionResult)
  }

  _createdAt = getTimestamp()
  _initiatedBy = !sessionResult.ask_in ? 'sdk' : 'backend'

  return _requestAttribution(sessionResult, sessionResult.ask_in || DEFAULT_WAIT)
}

/**
 * Clear pending attribution request
 */
function _clearTimeout () {

  const running = _timeout.running

  clearTimeout(_timeout.id)
  _timeout.id = null
  _timeout.running = false

  if (running) {
    Logger.log('Previous /attribution request attempt canceled')
  }
}

/**
 * Destroy attribution by clearing current timeout
 */
function destroy () {
  _clearTimeout()
}

export {
  checkAttribution,
  destroy
}


