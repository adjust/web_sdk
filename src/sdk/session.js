import Config from './config'
import ActivityState from './activity-state'
import Logger from './logger'
import {run as queueRun, push} from './queue'
import {on, off, getVisibilityApiAccess, convertToMap} from './utilities'
import {sync, persist} from './identity'
import {get as getGlobalParams} from './global-params'
import {publish} from './pub-sub'
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
const _pva = getVisibilityApiAccess()

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

  if (_running) {
    Logger.error('Session watch already initiated')
    return
  }

  _running = true

  if (_pva) {
    on(document, _pva.visibilityChange, _handleVisibilityChange)
  }

  if (_pva && document[_pva.hidden]) {
    return
  }

  ActivityState.initParams()

  return _checkSession(true)
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

  return sync().then(() => _checkSession())
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
 * Check if there is attribution missing and fire an event to request it
 *
 * @private
 */
function _checkAttribution () {
  if (!(ActivityState.current || {}).attribution) {
    publish('attribution:check', {})
  }
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
 * @param {Array=} [globalCallbackParams=[]]
 * @param {Array} [globalPartnerParams=[]]
 * @returns {Object}
 * @private
 */
function _prepareParams (globalCallbackParams = [], globalPartnerParams = []) {

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
 * @param {boolean=false} cleanUp
 * @private
 */
function _trackSession (cleanUp = false) {
  return getGlobalParams()
    .then(({callbackParams, partnerParams}) => {
      push({
        url: '/session',
        method: 'POST',
        params: _prepareParams(callbackParams, partnerParams)
      }, {
        auto: true,
        cleanUp
      })
    })
}

/**
 * Check if session needs to be tracked
 *
 * @param {boolean=false} cleanUp
 * @private
 */
function _checkSession (cleanUp = false) {

  _startTimer()

  const lastInterval = (ActivityState.current || {}).lastInterval
  const currentWindow = lastInterval * SECOND

  if (lastInterval === -1 || currentWindow >= Config.sessionWindow) {
    return _trackSession(cleanUp)
  }

  if (cleanUp) {
    _checkAttribution()
    queueRun(cleanUp)
  }

  return persist()
}

export {
  watch,
  isRunning,
  destroy
}
