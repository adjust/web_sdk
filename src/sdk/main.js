import Config from './config'
import StorageManager from './storage-manager'
import Logger from './logger'
import {run as queueRun, setOffline, clear as queueClear, destroy as queueDestroy} from './queue'
import {extend} from './utilities'
import {subscribe, destroy as pubSubDestroy} from './pub-sub'
import {watch as sessionWatch, destroy as sessionDestroy} from './session'
import {start, isDisabled, isGdprForgotten, setDisabled, clear as identityClear, destroy as identityDestroy} from './identity'
import {add, remove, removeAll, clear as globalParamsClear} from './global-params'
import {check as attributionCheck, destroy as attributionDestroy} from './attribution'
import {check as sdkClickCheck, destroy as sdkClickDestroy} from './sdk-click'
import {check as gdprForgetCheck, forget as gdprForgetDevice, requested as gdprForgetRequested, destroy as gdprForgetDestroy} from './gdpr-forget-device'
import {REASON_GDPR} from './constants'
import event from './event'

/**
 * In-memory parameters to be used if restarting
 *
 * @type {Object}
 * @private
 */
let _params = null

/**
 * Flag to mark if sdk is started
 *
 * @type {boolean}
 * @private
 */
let _isStarted = false

/**
 * Initiate the instance with parameters
 *
 * @param {Object} params
 */
function init (params = {}) {

  Logger.setLogLevel(params.logLevel, params.logOutput)

  if (Config.isInitialised()) {
    Logger.error('You already initiated your instance')
    return
  }

  if (Config.hasMissing(params)) {
    return
  }

  _params = extend({}, params)

  _start(params)
}

/**
 * Track event with already initiated instance
 *
 * @param {Object} params
 */
function trackEvent (params = {}) {

  if (isDisabled()) {
    Logger.log('adjustSDK is disabled, can not track event')
    return
  }

  if (!Config.isInitialised()) {
    Logger.error('adjustSDK is not initiated, can not track event')
    return
  }

  event(params)
}

/**
 * Add global callback parameters
 *
 * @param {Array} params
 */
function addGlobalCallbackParameters (params) {
  _run('add global callback parameters', add, params, 'callback')
}

/**
 * Add global partner parameters
 *
 * @param {Array} params
 */
function addGlobalPartnerParameters (params) {
  _run('add global partner parameters', add, params, 'partner')
}

/**
 * Remove global callback parameter by key
 *
 * @param {string} key
 */
function removeGlobalCallbackParameter (key) {
  _run('remove global callback parameter', remove, key, 'callback')
}

/**
 * Remove global partner parameter by key
 *
 * @param {string} key
 */
function removePartnerCallbackParameter (key) {
  _run('remove global partner parameter', remove, key, 'partner')
}

/**
 * Remove all global callback parameters
 */
function removeAllGlobalCallbackParameters () {
  _run('remove all global callback parameters', removeAll, 'callback')
}

/**
 * Remove all global partner parameters
 */
function removeAllGlobalPartnerParameters () {
  _run('remove all global partner parameters', removeAll, 'partner')
}

/**
 * Set offline mode to on or off
 *
 * @param {boolean} state
 */
function setOfflineMode (state) {
  _run('set offline mode', setOffline, state)
}

/**
 * Disable sdk due to a particular reason
 *
 * @param {string=} reason
 * @private
 */
function _disable (reason) {

  if (isDisabled()) {
    Logger.log('adjustSDK is already disabled')
    return
  }

  const logMessage = reason === REASON_GDPR
    ? 'adjustSDK has been disabled due to GDPR-Forget-Me request'
    : 'adjustSDK has been disabled'

  Logger.log(logMessage)

  setDisabled(true, reason)

  if (Config.isInitialised()) {
    _shutdown()
  }

}

/**
 * General disable
 */
function disable () {
  if (gdprForgetRequested()) {

    const logMessage = isGdprForgotten()
      ? 'adjustSDK is already disabled due to GDPR-Forget-me request'
      : 'There is pending GDPR Forget Me request, can not disable at this moment'

    Logger.log(logMessage)
    return
  }

  _disable()
}

/**
 * Disable initiated through GDPR-Forget-Me request
 *
 * @private
 */
function _gdprDisable () {
  _disable(REASON_GDPR)
}

/**
 * Enable sdk if not GDPR forgotten
 */
function enable () {

  if (isGdprForgotten()) {
    Logger.log('adjustSDK is disabled due to GDPR-Forget-me request and it can not be re-enabled')
    return
  }

  if (!isDisabled()) {
    Logger.log('adjustSDK is already enabled')
    return
  }

  Logger.log('adjustSDK has been enabled')

  setDisabled(false)

  if (_params) {
    _start(_params)
  }

}

/**
 * Request GDPR-Forget-Me in order to disable sdk
 */
function gdprForgetMe () {
  gdprForgetDevice()
}

/**
 * Handle GDPR-Forget-Me response
 *
 * @private
 */
function _handleGdprForgetMe () {
  _gdprDisable()
  identityClear()
  globalParamsClear()
  queueClear()
}

/**
 * Shutdown all dependencies
 * @private
 */
function _shutdown (async) {

  if (async) {
    Logger.log('adjustSDK has been shutdown due to asynchronous disable')
  }

  _isStarted = false

  queueDestroy()
  pubSubDestroy()
  sessionDestroy()
  attributionDestroy()
  sdkClickDestroy()
  identityDestroy()
  StorageManager.destroy()
  Config.destroy()

}

/**
 * Destroy the instance
 */
function destroy () {

  _shutdown()
  gdprForgetDestroy()

  _params = null

  Logger.log('adjustSDK instance has been destroyed')
}

/**
 * Start the execution by preparing the environment for the current usage
 * - prepares mandatory parameters
 * - subscribe to a GDPR-Forget-Me request event
 * - subscribe to the attribution change event
 * - register activity state if doesn't exist
 * - run pending GDPR-Forget-Me if pending
 * - run the package queue if not empty
 * - start watching the session
 *
 * @param {Object} params
 * @param {string} params.appToken
 * @param {string} params.environment
 * @param {Function=} params.attributionCallback
 * @private
 */
function _start (params = {}) {

  if (isDisabled()) {
    Logger.log('adjustSDK is disabled, can not start the sdk')
    return
  }

  Config.setParams(params)

  subscribe('sdk:shutdown', () => _shutdown(true))
  subscribe('sdk:gdpr-forget-me', _handleGdprForgetMe)
  subscribe('attribution:check', (e, result) => attributionCheck(result))

  if (typeof params.attributionCallback === 'function') {
    subscribe('attribution:change', params.attributionCallback)
  }

  sdkClickCheck()

  start()
    .then(() => {
      if (isDisabled()) {
        _shutdown()
        return
      }

      if (_isStarted) {
        return
      }

      gdprForgetCheck()
      queueRun(true)
      sessionWatch()

      _isStarted = true
    })
}

/**
 * Run provided method only if sdk is enabled
 *
 * @param {string} description
 * @param {Function} method
 * @param {...Object} args
 * @private
 */
function _run (description, method, ...args) {

  if (isDisabled()) {
    Logger.log(`adjustSDK is disabled, can not ${description}`)
    return
  }

  if (typeof method === 'function') {
    method.call(null, ...args)
  }
}

const Adjust = {
  init,
  trackEvent,
  addGlobalCallbackParameters,
  addGlobalPartnerParameters,
  removeGlobalCallbackParameter,
  removePartnerCallbackParameter,
  removeAllGlobalCallbackParameters,
  removeAllGlobalPartnerParameters,
  setOfflineMode,
  disable,
  enable,
  gdprForgetMe,
  destroy
}

export default Adjust
