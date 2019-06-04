import Config from './config'
import StorageManager from './storage-manager'
import Logger from './logger'
import {run as queueRun, push, setOffline, clear as queueClear, destroy as queueDestroy} from './queue'
import {buildList, extend} from './utilities'
import {subscribe, destroy as pubSubDestroy} from './pub-sub'
import {watch as sessionWatch, destroy as sessionDestroy} from './session'
import {start, isDisabled, isGdprForgotten, setDisabled, clear as identityClear, destroy as identityDestroy} from './identity'
import {add, remove, removeAll, clear as globalParamsClear} from './global-params'
import {destroy as attributionDestroy} from './attribution'
import {getTimestamp} from './time'
import {check as sdkClickCheck, destroy as sdkClickDestroy} from './sdk-click'
import {REASON_GDPR} from './constants'
import event from './event'

/**
 * Definition of mandatory fields
 *
 * @type {string[]}
 * @private
 */
const _mandatory = [
  'appToken',
  'environment'
]

/**
 * Flags for the pending/requested GDPR-Forget-Me request
 *
 * @type {Object}
 * @private
 */
const _gdpr = {
  pending: false,
  requested: false
}

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

  if (_isInitiated()) {
    Logger.error('You already initiated your instance')
    return
  }

  const missingParamsMessage = _getMissingParams(params)

  if (missingParamsMessage) {
    Logger.error(missingParamsMessage)
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

  if (!_isInitiated()) {
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

  if (_isInitiated()) {
    _shutdown()
  }

}

/**
 * General disable
 */
function disable () {
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

  if (isGdprForgotten()) {
    Logger.log('adjustSDK is already GDPR forgotten')
    return
  }

  if (isDisabled()) {
    Logger.log('adjustSDK is already disabled')
    return
  }

  if (_gdpr.requested) {
    Logger.log('adjustSDK already sent GDPR Forget Me request')
    return
  }

  _gdpr.requested = true

  if (!_isInitiated()) {
    _gdpr.pending = true
    return
  }

  _gdpr.pending = false

  push({
    url: '/gdpr_forget_device',
    method: 'POST',
    params: extend({
      createdAt: getTimestamp()
    }, Config.baseParams)
  })
}

/**
 * Handle GDPR-Forget-Me response
 *
 * @private
 */
function _handleGdprForgetMe () {

  if (!_gdpr.requested) {
    return
  }

  _gdprDisable()

  identityClear()
  globalParamsClear()
  queueClear()
}

/**
 * Shutdown all dependencies
 * @private
 */
function _shutdown () {

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

  _params = null
  _gdpr.requested = false
  _gdpr.pending = false

  Logger.log('adjustSDK instance has been destroyed')
}

/**
 * Get missing parameters that are defined as mandatory
 *
 * @param {Object} params
 * @returns {string}
 * @private
 */
function _getMissingParams (params) {

  const missing = _mandatory.filter(value => !params[value])

  if (missing.length) {
    return `You must define ${buildList(missing)}`
  }

  return ''
}

/**
 * Check if instance is initiated
 *
 * @returns {boolean}
 * @private
 */
function _isInitiated () {

  const params = Config.baseParams

  return _mandatory.reduce((acc, key) => acc && !!params[key], true)
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

  _mandatory.forEach(key => {
    extend(Config.baseParams, {[key]: params[key]})
  })

  subscribe('sdk:gdpr-forget-me', _handleGdprForgetMe)

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

      if (_gdpr.pending) {
        _gdpr.requested = false
        gdprForgetMe()
      }

      queueRun({cleanUp: true})
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
