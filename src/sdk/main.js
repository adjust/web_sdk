// @flow
import {
  type InitOptionsT,
  type LogOptionsT,
  type EventParamsT,
  type GlobalParamsT,
  type CustomErrorT,
  type ActivityStateMapT,
  type SmartBannerOptionsT,
  type AttributionMapT
} from './types'
import Config from './config'
import Storage from './storage/storage'
import Logger from './logger'
import {run as queueRun, setOffline, clear as queueClear, destroy as queueDestroy} from './queue'
import {subscribe, unsubscribe, destroy as pubSubDestroy} from './pub-sub'
import {watch as sessionWatch, destroy as sessionDestroy} from './session'
import {start, clear as identityClear, destroy as identityDestroy} from './identity'
import {add, remove, removeAll, clear as globalParamsClear} from './global-params'
import {check as attributionCheck, destroy as attributionDestroy} from './attribution'
import {disable, restore, status} from './disable'
import {check as gdprForgetCheck, forget, disable as gdprDisable, finish as gdprDisableFinish, destroy as gdprForgetDestroy} from './gdpr-forget-device'
import {check as sharingDisableCheck, optOut as sharingOptOut, disable as sharingDisable, finish as sharingDisableFinish} from './third-party-sharing'
import {register as listenersRegister, destroy as listenersDestroy} from './listeners'
import {delay, flush, destroy as schedulerDestroy} from './scheduler'
import event from './event'
import sdkClick from './sdk-click'
import ActivityState from './activity-state'
import { STORAGE_TYPES } from './constants'
import { SmartBanner } from './smart-banner/smart-banner'

type InitConfigT = $ReadOnly<{|...InitOptionsT, ...LogOptionsT|}>

/**
 * In-memory parameters to be used if restarting
 *
 * @type {Object}
 * @private
 */
let _options: ?InitOptionsT = null

/**
 * Flag to mark id sdk is in starting process
 *
 * @type {boolean}
 * @private
 */
let _isInitialising: boolean = false

/**
 * Flag to mark if sdk is started
 *
 * @type {boolean}
 * @private
 */
let _isStarted: boolean = false

/**
 * Flag to mark if sdk is installed to delay public methods until SDK is ready to perform them
 *
 * @type {boolean}
 * @private
 */
let _isInstalled: boolean = false

/**
 * SmartBanner instance
 *
 * @private
 */
let _smartBanner: ?SmartBanner = null

/**
 * Initiate the instance with parameters
 *
 * @param {Object} options
 * @param {string} logLevel
 * @param {string} logOutput
 */
function initSdk ({logLevel, logOutput, ...options}: InitConfigT = {}): void {
  Logger.setLogLevel(logLevel, logOutput)

  if (_isInitialised()) {
    Logger.error('You already initiated your instance')
    return
  }

  if (Config.hasMissing(options)) {
    return
  }

  _isInitialising = true

  Storage.init(options.namespace)
    .then(availableStorage => {

      if (availableStorage.type === STORAGE_TYPES.NO_STORAGE) {
        Logger.error('Adjust SDK can not start, there is no storage available')
        return
      }

      Logger.info(`Available storage is ${availableStorage.type}`)

      _options = { ...options }

      _start(options)
    })
}

/**
 * Get user's current attribution information
 *
 * @returns {AttributionMapT|undefined} current attribution information if available or `undefined` otherwise
 */
function getAttribution (): ?AttributionMapT {
  return _preCheck('get attribution', () => ActivityState.getAttribution())
}

/**
 * Get `web_uuid` - a unique ID of user generated per subdomain and per browser
 *
 * @returns {string|undefined} `web_uuid` if available or `undefined` otherwise
 */
function getWebUUID (): ?string {
  return _preCheck('get web_uuid', () => ActivityState.getWebUUID())
}

function setReferrer (referrer: string) {
  if (!referrer || typeof referrer !== 'string') {
    Logger.error('You must provide a string referrer')
    return
  }

  _preCheck('setting reftag', (timestamp) => sdkClick(referrer, timestamp), {
    schedule: true,
    waitForInitFinished: true,
    optionalInit: true
  })
}

/**
 * Track event with already initiated instance
 *
 * @param {Object} params
 */
function trackEvent (params: EventParamsT): void {
  _preCheck('track event', (timestamp) => event(params, timestamp), {
    schedule: true,
    waitForInitFinished: true
  })
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
function removeGlobalPartnerParameter (key: string): void {
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
  const done = restore()

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

  done = gdprDisable()

  if (done && Config.isInitialised()) {
    _pause()
  }
}

/**
 * Disable third party sharing
 */
function disableThirdPartySharing (): void {
  _preCheck('disable third-party sharing', _handleDisableThirdPartySharing, {
    schedule: true,
    waitForInitFinished: false
  })
}

function initSmartBanner (options: SmartBannerOptionsT): void {
  if (_smartBanner) {
    Logger.error('Smart Banner already initialised')
    return
  }

  _smartBanner = new SmartBanner(options)
}

function showSmartBanner (): void {
  if (!_smartBanner) {
    Logger.error('Smart Banner is not initialised yet')
    return
  }

  _smartBanner.show()
}

function hideSmartBanner (): void {
  if (!_smartBanner) {
    Logger.error('Smart Banner is not initialised yet')
    return
  }

  _smartBanner.hide()
}

/**
 * Handle third party sharing disable
 *
 * @private
 */
function _handleDisableThirdPartySharing (): void {
  let done = sharingOptOut()

  if (!done) {
    return
  }

  sharingDisable()
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

  gdprDisableFinish()

  Promise.all([
    identityClear(),
    globalParamsClear(),
    queueClear()
  ]).then(_destroy)

}

/**
 * Check if sdk initialisation was started
 *
 * @private
 */
function _isInitialised (): boolean {
  return _isInitialising || Config.isInitialised()
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
  _isInitialising = false
  _isStarted = false

  schedulerDestroy()
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
  _isInstalled = false

  _shutdown()
  gdprForgetDestroy()

  _options = null

  Logger.log('Adjust SDK instance has been destroyed')
}

/**
 * Check the sdk status and proceed with certain actions
 *
 * @param {Object} activityState
 * @returns {Promise|boolean}
 * @private
 */
function _continue (activityState: ActivityStateMapT): Promise<void> {
  Logger.log(`Adjust SDK is starting with web_uuid set to ${activityState.uuid}`)

  const isInstalled = ActivityState.current.installed

  gdprForgetCheck()

  if (!isInstalled) {
    sharingDisableCheck()
  }

  const sdkStatus = status()
  let message = (rest) => `Adjust SDK start has been interrupted ${rest}`

  if (sdkStatus === 'off') {
    _shutdown()
    return Promise.reject({interrupted: true, message: message('due to complete async disable')})
  }

  if (sdkStatus === 'paused') {
    _pause()
    return Promise.reject({interrupted: true, message: message('due to partial async disable')})
  }

  if (_isStarted) {
    return Promise.reject({interrupted: true, message: message('due to multiple synchronous start attempt')})
  }

  queueRun({cleanUp: true})

  return sessionWatch()
    .then(() => {
      _isInitialising = false
      _isStarted = true

      if (isInstalled) {
        _handleSdkInstalled()
        sharingDisableCheck()
      }
    })
}

/**
 * Handles SDK installed and runs delayed tasks
 */
function _handleSdkInstalled () {
  _isInstalled = true

  flush()

  unsubscribe('sdk:installed')
}

/**
 * Handle error coming from the chain of commands
 *
 * @param {Object|Error} error
 * @private
 */
function _error (error: CustomErrorT | Error) {
  if (error.interrupted) {
    Logger.log(error.message)
    return
  }

  _shutdown()
  Logger.error('Adjust SDK start has been canceled due to an error', error)

  if (error.stack) {
    throw error
  }
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
 * @param {string=} options.externalDeviceId
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

  subscribe('sdk:installed', _handleSdkInstalled)
  subscribe('sdk:shutdown', () => _shutdown(true))
  subscribe('sdk:gdpr-forget-me', _handleGdprForgetMe)
  subscribe('sdk:third-party-sharing-opt-out', sharingDisableFinish)
  subscribe('attribution:check', (e, result) => attributionCheck(result))

  if (typeof options.attributionCallback === 'function') {
    subscribe('attribution:change', options.attributionCallback)
  }

  start()
    .then(_continue)
    .then(sdkClick)
    .catch(_error)
}

/**
 * Check if it's possible to run provided method
 *
 * @param {string} description
 * @param {Function} callback
 * @param {boolean=false} schedule
 * @private
 */
function _preCheck (description: string, callback: () => mixed, {schedule, waitForInitFinished, optionalInit}: {schedule?: boolean, waitForInitFinished?: boolean, optionalInit?: boolean} = {}): mixed {
  if (Storage.getType() === STORAGE_TYPES.NO_STORAGE) {
    Logger.log(`Adjust SDK can not ${description}, no storage available`)
    return
  }

  if (status() !== 'on') {
    Logger.log(`Adjust SDK is disabled, can not ${description}`)
    return
  }

  if (!optionalInit && waitForInitFinished && !_isInitialised()) {
    Logger.error(`Adjust SDK can not ${description}, sdk instance is not initialized`)
    return
  }

  if (typeof callback === 'function') {
    if (schedule && !(_isInstalled && _isStarted) && (_isInitialised() || optionalInit)) {
      delay(callback, description)
      Logger.log(`Running ${description} is delayed until Adjust SDK is up`)
    } else {
      return callback()
    }
  }
}

function _clearDatabase () {
  return Storage.deleteDatabase()
}

function _restartAfterAsyncEnable () {
  if (_options) {
    _start(_options)
  }
}

const Adjust = {
  initSdk,
  getAttribution,
  getWebUUID,
  setReferrer,
  trackEvent,
  addGlobalCallbackParameters,
  addGlobalPartnerParameters,
  removeGlobalCallbackParameter,
  removeGlobalPartnerParameter,
  clearGlobalCallbackParameters,
  clearGlobalPartnerParameters,
  switchToOfflineMode,
  switchBackToOnlineMode,
  stop,
  restart,
  gdprForgetMe,
  disableThirdPartySharing,
  initSmartBanner,
  showSmartBanner,
  hideSmartBanner,
  __testonly__: {
    destroy: _destroy,
    clearDatabase: _clearDatabase
  },
  __internal__: {
    restartAfterAsyncEnable: _restartAfterAsyncEnable
  }
}

export default Adjust
