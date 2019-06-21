import {push} from './queue'
import State from './state'
import Logger from './logger'
import Config from './config'
import {REASON_GDPR} from './constants'

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

  if (State.disabled === REASON_GDPR) {
    Logger.log('adjustSDK is already GDPR forgotten')
    return
  }

  if (State.disabled) {
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
    Logger.log('adjustSDK will run GDPR Forget Me request after initialisation')
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
    Logger.log('adjustSDK is running pending GDPR Forget Me request')
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
