// @flow
import Request from './request'
import ActivityState from './activity-state'
import Logger from './logger'
import Config from './config'
import {publish} from './pub-sub'
import {status, disable as sdkDisable, finish as sdkDisableFinish} from './disable'
import {REASON_GDPR} from './constants'

/**
 * Http request instance
 *
 * @type {Object}
 * @private
 */
const _request = Request({
  url: '/gdpr_forget_device',
  method: 'POST',
  strategy: 'short'
})

/**
 * Log messages used in different scenarios
 *
 * @type {Object}
 * @private
 */
const _logMessages = {
  running: 'Adjust SDK is running pending GDPR Forget Me request',
  pending: 'Adjust SDK will run GDPR Forget Me request after initialisation',
  paused: 'Adjust SDK is already prepared to send GDPR Forget Me request',
  off: 'Adjust SDK is already disabled'
}

/**
 * Request GDPR-Forget-Me in order to disable sdk
 *
 * @param {boolean} force
 * @returns {boolean}
 */
function forget (force?: boolean): boolean {
  const sdkStatus = status()

  if (!force && sdkStatus !== 'on') {
    Logger.log(_logMessages[sdkStatus])
    return false
  }

  if (!Config.isInitialised()) {
    Logger.log(_logMessages.pending)
    return true
  }

  _request.send({
    params: {...ActivityState.getParams()}
  }).then(() => {
    publish('sdk:gdpr-forget-me', true)
  })

  return true
}

/**
 * Start disable of the sdk due to GDPR-Forget-me request
 *
 * @returns {boolean}
 */
function disable () {
  return sdkDisable(REASON_GDPR, true)
}

/**
 * Finish disable of the sdk due to GDRP-Forget-me request
 *
 * @returns {boolean}
 */
function finish () {
  return sdkDisableFinish(REASON_GDPR)
}

/**
 * Check if there is pending GDPR-Forget-Me request
 */
function check (): void {
  if (status() === 'paused') {
    Logger.log(_logMessages.running)
    forget(true)
  }
}

/**
 * Destroy by clearing running request
 */
function destroy (): void {
  _request.clear()
}

export {
  forget,
  disable,
  finish,
  check,
  destroy
}
