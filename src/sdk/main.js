// @flow
import {
  type InitOptionsT,
  type LogOptionsT,
  type EventParamsT,
  type GlobalParamsT
} from './types'
import Config from './config'
import Storage from './storage/storage'
import Logger from './logger'
import {run as queueRun, setOffline, clear as queueClear, destroy as queueDestroy} from './queue'
import {subscribe, destroy as pubSubDestroy} from './pub-sub'
import {watch as sessionWatch, destroy as sessionDestroy} from './session'
import {start, status, disable, enable, clear as identityClear, destroy as identityDestroy} from './identity'
import {add, remove, removeAll, clear as globalParamsClear} from './global-params'
import {check as attributionCheck, destroy as attributionDestroy} from './attribution'
import {check as gdprForgetCheck, forget, destroy as gdprForgetDestroy} from './gdpr-forget-device'
import {register as listenersRegister, destroy as listenersDestroy} from './listeners'
import event from './event'
import sdkClick from './sdk-click'
import {REASON_GDPR} from './constants'

type IntiConfigT = $ReadOnly<{|...InitOptionsT, ...LogOptionsT|}>

/**
 * In-memory parameters to be used if restarting
 *
 * @type {Object}
 * @private
 */
let _options: ?InitOptionsT = null

/**
 * Flag to mark if sdk is started
 *
 * @type {boolean}
 * @private
 */
let _isStarted: boolean = false

/**
 * Initiate the instance with parameters
 *
 * @param {Object} options
 * @param {string} logLevel
 * @param {string} logOutput
 */
function initSdk ({logLevel, logOutput, ...options}: IntiConfigT = {}): void {

  Logger.setLogLevel(logLevel, logOutput)

  if (!Storage) {
    Logger.error('Adjust SDK can not start, there is no storage available')
    return
  }

  Logger.info(`Available storage is ${Storage.type}`)

  if (Config.isInitialised()) {
    Logger.error('You already initiated your instance')
    return
  }

  if (Config.hasMissing(options)) {
    return
  }

  _options = {...options}

  _start(options)
}

/**
 * Track event with already initiated instance
 *
 * @param {Object} params
 */
function trackEvent (params: EventParamsT): void {
  _preCheck('track event', () => event(params))
}

/**
 * Add global callback parameters
 *
 * @param {Array} params
 */
function addGlobalCallbackParameters (params: Array<GlobalParamsT>): void {
  _preCheck('add global callback parameters', () => add(params, 'callback'))
}

/**
 * Add global partner parameters
 *
 * @param {Array} params
 */
function addGlobalPartnerParameters (params: Array<GlobalParamsT>): void {
  _preCheck('add global partner parameters', () => add(params, 'partner'))
}

/**
 * Remove global callback parameter by key
 *
 * @param {string} key
 */
function removeGlobalCallbackParameter (key: string): void {
  _preCheck('remove global callback parameter', () => remove(key, 'callback'))
}

/**
 * Remove global partner parameter by key
 *
 * @param {string} key
 */
function removePartnerCallbackParameter (key: string): void {
  _preCheck('remove global partner parameter', () => remove(key, 'partner'))
}

/**
 * Remove all global callback parameters
 */
function clearGlobalCallbackParameters (): void {
  _preCheck('remove all global callback parameters', () => removeAll('callback'))
}

/**
 * Remove all global partner parameters
 */
function clearGlobalPartnerParameters (): void {
  _preCheck('remove all global partner parameters', () => removeAll('partner'))
}

/**
 * Switch offline mode
 */
function switchToOfflineMode (): void {
  _preCheck('set offline mode', () => setOffline(true))
}

/**
 * Switch online mode
 */
function switchBackToOnlineMode (): void {
  _preCheck('set online mode', () => setOffline(false))
}

/**
 * Stop SDK
 */
function stop (): void {
  const done = disable()

  if (done && Config.isInitialised()) {
    _shutdown()
  }
}

/**
 * Restart sdk if not GDPR forgotten
 */
function restart (): void {
  const done = enable()

  if (done && _options) {
    _start(_options)
  }
}

/**
 * Disable sdk and send GDPR-Forget-Me request
 */
function gdprForgetMe (): void {
  let done = forget()

  if (!done) {
    return
  }

  done = disable({reason: REASON_GDPR, pending: true})

  if (done && Config.isInitialised()) {
    _pause()
  }
}

/**
 * Handle GDPR-Forget-Me response
 *
 * @private
 */
function _handleGdprForgetMe (): void {
  if (status() !== 'paused') {
    return
  }

  Promise.all([
    identityClear(),
    globalParamsClear(),
    queueClear()
  ]).then(_destroy)

}

/**
 * Pause sdk by canceling:
 * - queue execution
 * - session watch
 * - attribution listener
 *
 * @private
 */
function _pause (): void {
  _isStarted = false

  queueDestroy()
  sessionDestroy()
  attributionDestroy()
}

/**
 * Shutdown all dependencies
 * @private
 */
function _shutdown (async): void {
  if (async) {
    Logger.log('Adjust SDK has been shutdown due to asynchronous disable')
  }

  _pause()

  pubSubDestroy()
  identityDestroy()
  listenersDestroy()
  Storage.destroy()
  Config.destroy()
}

/**
 * Destroy the instance
 *
 * @private
 */
function _destroy (): void {
  _shutdown()
  gdprForgetDestroy()

  _options = null

  Logger.log('Adjust SDK instance has been destroyed')
}

/**
 * Check the sdk status and proceed with certain actions
 *
 * @returns {Promise|boolean}
 * @private
 */
function _continue (): Promise<void> {
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

  queueRun({cleanUp: true})

  return sessionWatch()
}

/**
 * Start the execution by preparing the environment for the current usage
 * - prepares mandatory parameters
 * - register some global event listeners (online, offline events)
 * - subscribe to a GDPR-Forget-Me request event
 * - subscribe to the attribution change event
 * - register activity state if doesn't exist
 * - run pending GDPR-Forget-Me if pending
 * - run the package queue if not empty
 * - start watching the session
 *
 * @param {Object} options
 * @param {string} options.appToken
 * @param {string} options.environment
 * @param {string=} options.defaultTracker
 * @param {string=} options.customUrl
 * @param {number=} options.eventDeduplicationListLimit
 * @param {Function=} options.attributionCallback
 * @private
 */
function _start (options: InitOptionsT): void {
  if (status() === 'off') {
    Logger.log('Adjust SDK is disabled, can not start the sdk')
    return
  }

  Config.set(options)

  listenersRegister()

  subscribe('sdk:shutdown', () => _shutdown(true))
  subscribe('sdk:gdpr-forget-me', _handleGdprForgetMe)
  subscribe('attribution:check', (e, result) => attributionCheck(result))

  if (typeof options.attributionCallback === 'function') {
    subscribe('attribution:change', options.attributionCallback)
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
 * Check if it's possible to run provided method
 *
 * @param {string} description
 * @param {Function} callback
 * @private
 */
function _preCheck (description: string, callback: () => mixed) {
  if (!Storage) {
    Logger.log(`Adjust SDK can not ${description}, no storage available`)
    return
  }

  if (status() !== 'on') {
    Logger.log(`Adjust SDK is disabled, can not ${description}`)
    return
  }

  if (typeof callback === 'function') {
    callback()
  }
}

const Adjust = {
  initSdk,
  trackEvent,
  addGlobalCallbackParameters,
  addGlobalPartnerParameters,
  removeGlobalCallbackParameter,
  removePartnerCallbackParameter,
  clearGlobalCallbackParameters,
  clearGlobalPartnerParameters,
  switchToOfflineMode,
  switchBackToOnlineMode,
  stop,
  restart,
  gdprForgetMe,
  __testonly__: {
    destroy: _destroy
  }
}

export default Adjust
