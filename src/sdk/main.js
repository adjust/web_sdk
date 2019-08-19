import Config from './config'
import StorageManager from './storage/storage-manager'
import Logger from './logger'
import {run as queueRun, setOffline, clear as queueClear, destroy as queueDestroy} from './queue'
import {extend} from './utilities'
import {subscribe, destroy as pubSubDestroy} from './pub-sub'
import {watch as sessionWatch, destroy as sessionDestroy} from './session'
import {start, status, disable as identityDisable, enable as identityEnable, clear as identityClear, destroy as identityDestroy} from './identity'
import {add, remove, removeAll, clear as globalParamsClear} from './global-params'
import {check as attributionCheck, destroy as attributionDestroy} from './attribution'
import {check as gdprForgetCheck, forget, destroy as gdprForgetDestroy} from './gdpr-forget-device'
import event from './event'
import sdkClick from './sdk-click'
import {REASON_GDPR} from './constants'

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

  if (!StorageManager) {
    Logger.error('Adjust SDK can not start, there is no storage available')
    return
  }

  Logger.info(`Available storage is ${StorageManager.type}`)

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
  _run('track event', event, params)
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
  _run(`set ${state ? 'offline' : 'online'} mode`, setOffline, state)
}

/**
 * Disable SDK
 */
function disable () {
  const done = identityDisable()

  if (done && Config.isInitialised()) {
    _shutdown()
  }
}

/**
 * Enable sdk if not GDPR forgotten
 */
function enable () {
  const done = identityEnable()

  if (done && _params) {
    _start(_params)
  }
}

/**
 * Disable sdk and send GDPR-Forget-Me request
 */
function gdprForgetMe () {
  let done = forget()

  if (!done) {
    return
  }

  done = identityDisable({reason: REASON_GDPR, pending: true})

  if (done && Config.isInitialised()) {
    _pause()
  }
}

/**
 * Handle GDPR-Forget-Me response
 *
 * @private
 */
function _handleGdprForgetMe () {
  if (status() !== 'paused') {
    return
  }

  Promise.all([
    identityClear(),
    globalParamsClear(),
    queueClear()
  ]).then(destroy)

}

/**
 * Pause sdk by canceling:
 * - queue execution
 * - session watch
 * - attribution listener
 *
 * @private
 */
function _pause () {
  _isStarted = false

  queueDestroy()
  sessionDestroy()
  attributionDestroy()
}

/**
 * Shutdown all dependencies
 * @private
 */
function _shutdown (async) {
  if (async) {
    Logger.log('Adjust SDK has been shutdown due to asynchronous disable')
  }

  _pause()

  pubSubDestroy()
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

  Logger.log('Adjust SDK instance has been destroyed')
}

/**
 * Check the sdk status and proceed with certain actions
 *
 * @returns {Promise|boolean}
 * @private
 */
function _continue () {
  gdprForgetCheck()

  const sdkStatus = status()
  let message = (rest) => `Adjust SDK start has been interrupted ${rest}`

  if (sdkStatus === 'off') {
    _shutdown()
    return Promise.reject({message: message('due to complete async disable')})
  }

  if (sdkStatus === 'paused') {
    _pause()
    return Promise.reject({message: message('due to partial async disable')})
  }

  if (_isStarted) {
    return Promise.reject({message: message('due to multiple synchronous start attempt')})
  }

  _isStarted = true

  queueRun(true)

  return sessionWatch()
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
function _start (params) {

  if (status() === 'off') {
    Logger.log('Adjust SDK is disabled, can not start the sdk')
    return
  }

  Config.baseParams = params

  subscribe('sdk:shutdown', () => _shutdown(true))
  subscribe('sdk:gdpr-forget-me', _handleGdprForgetMe)
  subscribe('attribution:check', (e, result) => attributionCheck(result))

  if (typeof params.attributionCallback === 'function') {
    subscribe('attribution:change', params.attributionCallback)
  }

  start()
    .then(_continue)
    .then(sdkClick)
    .catch(error => {
      if (error && error.message) {
        Logger.log(error.message)
      } else {
        _shutdown()
        Logger.error('Adjust SDK start has been canceled due to an error', error)
      }
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

  if (!StorageManager) {
    Logger.log(`Adjust SDK can not ${description}, no storage available`)
    return
  }

  if (status() !== 'on') {
    Logger.log(`Adjust SDK is disabled, can not ${description}`)
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
