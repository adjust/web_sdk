import Config from './config'
import ActivityState from './activity-state'
import Logger from './logger'
import {push} from './queue'
import {on, off, getVisibilityApiAccess, convertToMap} from './utilities'
import {timePassed} from './time'
import {sync, persist, updateLastActive} from './identity'
import {get as getGlobalParams} from './global-params'
import {getAll as getSessionParams, updateSessionParam, updateAll as updateSessionParams, reset as resetSessionParams, destroy as destroySessionParams, toForeground, toBackground} from './session-params'

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
const _adapter = getVisibilityApiAccess()

/**
 * Initiate session watch:
 * - check session initially
 * - set the timer to update last active timestamp
 * - bind to visibility change event to track window state (if out of focus or closed)
 */
function watch () {

  if (_running) {
    Logger.error('Session watch already initiated')
    return
  }

  _running = true

  toForeground(true)

  if (_adapter) {
    on(document, _adapter.visibilityChange, _handleVisibilityChange)
  }

  _checkSession()
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

  toBackground()
  destroySessionParams()

  _stopTimer()

  if (_adapter) {
    clearTimeout(_idTimeout)
    off(document, _adapter.visibilityChange, _handleVisibilityChange)
  }
}

/**
 * Handle transit to background
 *
 * @returns {Promise}
 * @private
 */
function _handleBackground () {
  _stopTimer()

  updateSessionParams()
  toBackground()

  return persist()
}

/**
 * Handle transit to foreground
 *
 * @returns {Promise<any | never>}
 * @private
 */
function _handleForeground () {
  updateSessionParam('sessionLength')
  toForeground()

  return sync().then(_checkSession)
}

/**
 * Handle visibility change and perform certain actions:
 * - if page is hidden then stop the timer and update last active timestamp
 * - if page is visible then check for the session and restart the timer
 *
 * @private
 */
function _handleVisibilityChange () {

  clearTimeout(_idTimeout)

  const handler = document[_adapter.hidden] ? _handleBackground : _handleForeground

  _idTimeout = setTimeout(handler, 0)
}

/**
 * Start the session timer, every N seconds:
 * - time spent and measure point are updated
 * - last active timestamp is updated automatically
 *
 * @private
 */
function _startTimer () {

  _stopTimer()

  _idInterval = setInterval(() => {
    updateSessionParams()
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
 * @param {Array=} [globalCallbackParams=[]]
 * @param {Array} [globalPartnerParams=[]]
 * @returns {Object}
 * @private
 */
function _prepareParams (globalCallbackParams = [], globalPartnerParams = []) {

  const {timeSpent, sessionLength} = getSessionParams()
  const baseParams = {timeSpent, sessionLength}

  if (globalCallbackParams.length) {
    baseParams.callbackParams = convertToMap(globalCallbackParams)
  }

  if (globalPartnerParams.length) {
    baseParams.partnerParams = convertToMap(globalPartnerParams)
  }

  resetSessionParams()

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
      })
    })
}

/**
 * Check if session needs to be tracked
 *
 * @private
 */
function _checkSession () {

  _startTimer()

  const activityState = ActivityState.current || {}
  const lastActive = activityState.lastActive
  const diff = timePassed(lastActive, Date.now())

  if (isNaN(lastActive) || diff >= Config.sessionWindow) {
    return _trackSession()
  } else {
    return updateLastActive()
  }
}

export {
  watch,
  isRunning,
  destroy
}
