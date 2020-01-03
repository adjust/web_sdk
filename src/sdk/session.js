import Config from './config'
import ActivityState from './activity-state'
import Logger from './logger'
import {push} from './queue'
import {convertToMap} from './utilities'
import {on, off, getVisibilityApiAccess} from './listeners'
import {sync, persist} from './identity'
import {get as getGlobalParams} from './global-params'
import {publish, subscribe} from './pub-sub'
import {SECOND} from './constants'

/**
 * Flag to mark if session watch is already on
 *
 * @type {boolean}
 * @private
 */
let _running = false

/**
 * Reference to interval id to be used for clearing
 *
 * @type {number}
 * @private
 */
let _idInterval

/**
 * Reference to timeout id to be used for clearing
 *
 * @type {number}
 * @private
 */
let _idTimeout

/**
 * Browser-specific prefixes for accessing Page Visibility API
 *
 * @type {{hidden, visibilityChange}}
 * @private
 */
let _pva

/**
 * Initiate session watch:
 * - bind to visibility change event to track window state (if out of focus or closed)
 * - initiate activity state params and visibility state
 * - check session initially
 * - set the timer to update last active timestamp
 *
 * @returns {Promise}
 */
function watch () {
  _pva = getVisibilityApiAccess()

  if (_running) {
    return Promise.reject({interrupted: true, message: 'Session watch already initiated'})
  }

  _running = true

  subscribe('session:finished', _handleSessionRequestFinish)

  if (_pva) {
    on(document, _pva.visibilityChange, _handleVisibilityChange)
  }

  if (_pva && document[_pva.hidden]) {
    Logger.log('Session request attempt canceled because the tab is still hidden')
    return Promise.resolve({})
  }

  ActivityState.initParams()

  return _checkSession()
}

/**
 * Check if session watch is running
 *
 * @returns {boolean}
 */
function isRunning () {
  return _running
}

/**
 * Destroy session watch
 */
function destroy () {
  _running = false

  ActivityState.toBackground()

  _stopTimer()

  if (_pva) {
    clearTimeout(_idTimeout)
    off(document, _pva.visibilityChange, _handleVisibilityChange)
  }
}

/**
 * Handle transit to background:
 * - stop the timer
 * - update session params
 * - persist changes (store updated activity state)
 *
 * @returns {Promise}
 * @private
 */
function _handleBackground () {
  _stopTimer()

  ActivityState.updateSessionOffset()
  ActivityState.toBackground()

  return persist()
}

/**
 * Handle transit to foreground:
 * - update session length
 * - check for the session and restart the timer
 *
 * @returns {Promise<any | never>}
 * @private
 */
function _handleForeground () {
  ActivityState.updateSessionLength()
  ActivityState.toForeground()

  return sync().then(_checkSession)
}

/**
 * Handle visibility change and perform appropriate actions
 *
 * @private
 */
function _handleVisibilityChange () {
  clearTimeout(_idTimeout)

  const handler = document[_pva.hidden] ? _handleBackground : _handleForeground

  _idTimeout = setTimeout(handler, 0)
}

/**
 * Handle session request finish; update installed state
 *
 * @param {Object} e
 * @param {Object} result
 * @returns {Promise|void}
 * @private
 */
function _handleSessionRequestFinish (e, result = {}) {
  if (result.response && result.response.error) { // TODO might not be needed anymore
    Logger.error(`Session was not successful, error was returned from the server: ${result.response.error}`)
    return
  }

  ActivityState.updateInstalled()

  return persist()
}

/**
 * Start the session timer, every N seconds:
 * - update session params
 * - persist changes (store updated activity state)
 *
 * @private
 */
function _startTimer () {
  _stopTimer()

  _idInterval = setInterval(() => {
    ActivityState.updateSessionOffset()
    return persist()
  }, Config.sessionTimerWindow)
}

/**
 * Stop the session timer
 *
 * @private
 */
function _stopTimer () {
  clearInterval(_idInterval)
}

/**
 * Prepare parameters for the session tracking
 *
 * @param {Array} globalCallbackParams
 * @param {Array} globalPartnerParams
 * @returns {Object}
 * @private
 */
function _prepareParams (globalCallbackParams, globalPartnerParams) {
  const baseParams = {}

  if (globalCallbackParams.length) {
    baseParams.callbackParams = convertToMap(globalCallbackParams)
  }

  if (globalPartnerParams.length) {
    baseParams.partnerParams = convertToMap(globalPartnerParams)
  }

  return baseParams
}

/**
 * Track session by sending the request to the server
 *
 * @private
 */
function _trackSession () {
  return getGlobalParams()
    .then(({callbackParams, partnerParams}) => {
      push({
        url: '/session',
        method: 'POST',
        params: _prepareParams(callbackParams, partnerParams)
      }, {auto: true})
    })
}

/**
 * Check if session needs to be tracked
 *
 * @private
 */
function _checkSession () {
  _startTimer()

  const activityState = ActivityState.current
  const lastInterval = activityState.lastInterval
  const isEnqueued = activityState.sessionCount > 0
  const currentWindow = lastInterval * SECOND

  if (!isEnqueued || (isEnqueued && currentWindow >= Config.sessionWindow)) {
    return _trackSession()
  }

  publish('attribution:check')

  return persist()
}

export {
  watch,
  isRunning,
  destroy
}
