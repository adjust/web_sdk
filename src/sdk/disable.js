// @flow
import {REASON_GDPR, REASON_GENERAL} from './constants'
import {getDisabled, setDisabled} from './preferences'
import Logger from './logger'

type StatusT = 'on' | 'off' | 'paused'
type ReasonT = REASON_GDPR | REASON_GENERAL
type PendingT = boolean
type ReasonMapT = {|
  reason: ReasonT,
  pending: PendingT
|}

/**
 * Get the disable action name depending on the reason
 *
 * @param {string} reason
 * @returns {string}
 * @private
 */
const _disableReason = (reason: ReasonT) => reason === REASON_GDPR ? 'GDPR disable' : 'disable'

/**
 * Get log messages depending on the disable reason
 *
 * @param {string} reason
 * @returns {Object}
 * @private
 */
const _logMessages = (reason: ReasonT) => ({
  start: {
    inProgress: `Adjust SDK ${_disableReason(reason)} process has already started`,
    done: `Adjust SDK ${_disableReason(reason)} process is now started`
  },
  finish: {
    inProgress: `Adjust SDK ${_disableReason(reason)} process has already finished`,
    done: `Adjust SDK ${_disableReason(reason)} process is now finished`
  }
})

/**
 * Start or finish disable process
 *
 * @param {string} reason
 * @param {boolean} pending
 * @param {string} expectedAction
 * @returns {boolean}
 * @private
 */
function _disable ({reason, pending}: ReasonMapT, expectedAction: 'start' | 'finish'): boolean {
  const disabled = getDisabled() || {}
  const action = expectedAction === 'start' && disabled.pending ? 'start': 'finish'
  const shouldNotStart = expectedAction === 'start' && disabled.reason
  const shouldNotFinish = expectedAction === 'finish' && disabled.reason && !disabled.pending

  if (shouldNotStart || shouldNotFinish) {
    Logger.log(_logMessages(disabled.reason)[action].inProgress)
    return false
  }

  Logger.log(_logMessages(reason)[action].done)

  setDisabled({
    reason: reason || REASON_GENERAL,
    pending
  })

  return true
}

/**
 * Disable sdk due to a particular reason
 *
 * @param {string} reason
 * @param {boolean} pending
 * @private
 */
function disable (reason: ?ReasonT, pending: ?PendingT = false): boolean {
  return _disable({reason, pending: pending || false}, 'start')
}

/**
 * Finish disable process if previously set to pending state
 *
 * @param {string} reason
 * @returns {boolean}
 */
function finish (reason: ReasonT): boolean {
  return _disable({reason, pending: false}, 'finish')
}

/**
 * Enable sdk if not GDPR forgotten
 */
function restore (): boolean {
  const disabled = getDisabled() || {}

  if (disabled.reason === REASON_GDPR) {
    Logger.log('Adjust SDK is disabled due to GDPR-Forget-Me request and it can not be re-enabled')
    return false
  }

  if (!disabled.reason) {
    Logger.log('Adjust SDK is already enabled')
    return false
  }

  Logger.log('Adjust SDK has been enabled')

  setDisabled(null)

  return true
}

/**
 * Get the current status of the sdk
 * - on: not disabled
 * - paused: partially disabled, waiting for the opt-out confirmation from the backend
 * - off: completely disabled
 *
 * @returns {string}
 */
function status (): StatusT {
  const disabled = getDisabled() || {}

  if (disabled.reason === REASON_GENERAL || disabled.reason === REASON_GDPR && !disabled.pending) {
    return 'off'
  } else if (disabled.reason === REASON_GDPR && disabled.pending) {
    return 'paused'
  }

  return 'on'
}

export {
  disable,
  restore,
  finish,
  status
}
