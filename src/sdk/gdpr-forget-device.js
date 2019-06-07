import {isDisabled, isGdprForgotten} from './identity'
import {push} from './queue'
import Logger from './logger'
import Config from './config'

/**
 * Pending request flag
 *
 * @type {boolean}
 * @private
 */
let _pending = false

/**
 * Requested request flag
 *
 * @type {boolean}
 * @private
 */
let _requested = false

/**
 * Request GDPR-Forget-Me in order to disable sdk
 */
function forget () {

  if (isGdprForgotten()) {
    Logger.log('adjustSDK is already GDPR forgotten')
    return
  }

  if (isDisabled()) {
    Logger.log('adjustSDK is already disabled')
    return
  }

  if (_requested) {
    Logger.log('adjustSDK already sent GDPR Forget Me request')
    return
  }

  _requested = true

  if (!Config.isInitialised()) {
    _pending = true
    return
  }

  _pending = false

  push({
    url: '/gdpr_forget_device',
    method: 'POST'
  })
}

/**
 * Check if GDPR-Forget-Me request is already sent
 *
 * @returns {boolean}
 */
function requested () {
  return _requested
}

/**
 * Check if there is pending GDPR-Forget-Me request
 */
function check () {
  if (_pending) {
    _requested = false
    forget()
  }
}

/**
 * Restore initial flags' values
 */
function destroy () {
  _requested = false
  _pending = false
}

export {
  forget,
  requested,
  check,
  destroy
}
