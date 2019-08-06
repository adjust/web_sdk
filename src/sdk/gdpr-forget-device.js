import Package from './package'
import ActivityState from './activity-state'
import Logger from './logger'
import Config from './config'
import {status} from './identity'

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
 * Request GDPR-Forget-Me in order to disable sdk
 */
function forget (force) {
  const sdkStatus = status()

  if (!force && sdkStatus !== 'on') {
    if (sdkStatus === 'paused') {
      Logger.log('Adjust SDK is already prepared to send GDPR Forget Me request')
    } else if (sdkStatus === 'off') {
      Logger.log('Adjust SDK is already disabled')
    }
    return false
  }

  if (!Config.isInitialised()) {
    Logger.log('Adjust SDK will run GDPR Forget Me request after initialisation')
    return true
  }

  _request.send({
    params: ActivityState.getParams()
  })

  return true
}

/**
 * Check if there is pending GDPR-Forget-Me request
 */
function check () {
  if (status() === 'paused') {
    Logger.log('Adjust SDK is running pending GDPR Forget Me request')
    forget(true)
  }
}

/**
 * Destroy by clearing running request
 */
function destroy () {
  _request.clear()
}

export {
  forget,
  check,
  destroy
}
