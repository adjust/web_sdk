// @flow
import Package from './package'
import ActivityState from './activity-state'
import Logger from './logger'
import Config from './config'
import {status} from './identity'
import {publish} from './pub-sub'

/**
 * Package request instance
 *
 * @type {Object}
 * @private
 */
const _request = Package({
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
    params: ActivityState.getParams()
  }).then(() => {
    publish('sdk:gdpr-forget-me', true)
  })

  return true
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
  check,
  destroy
}
