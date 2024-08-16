import { DISABLE_REASONS } from './constants'
import { getDisabled, setDisabled } from './preferences'
import Logger from './logger'

type StatusT = 'on' | 'off' | 'paused'
type ReasonT = DISABLE_REASONS
type ReasonMapT = {
  reason?: ReasonT,
  pending: boolean
}

/**
 * Get the disable action name depending on the reason
 *
 * @param {string} reason
 * @returns {string}
 * @private
 */
const _disableReason = (reason?: ReasonT) => reason === DISABLE_REASONS.REASON_GDPR ? 'GDPR disable' : 'disable'

/**
 * Get log messages depending on the disable reason
 *
 * @param {string} reason
 * @returns {Object}
 * @private
 */
const _logMessages = (reason?: ReasonT) => ({
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
function _disable({ reason, pending }: ReasonMapT, expectedAction: 'start' | 'finish'): boolean {
  const { reason: savedReason, pending: savedPending } = getDisabled() || {}
  const action = expectedAction === 'start' && savedPending ? 'start' : 'finish'
  const shouldNotStart = expectedAction === 'start' && savedReason
  const shouldNotFinish = expectedAction === 'finish' && savedReason && !savedPending

  if (shouldNotStart || shouldNotFinish) {
    Logger.log(_logMessages(savedReason)[action].inProgress)
    return false
  }

  Logger.log(_logMessages(reason)[action].done)

  setDisabled({
    reason: reason || DISABLE_REASONS.REASON_GENERAL,
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
function disable(reason?: ReasonT, pending = false): boolean {
  return _disable({ reason, pending }, 'start')
}

/**
 * Finish disable process if previously set to pending state
 *
 * @param {string} reason
 * @returns {boolean}
 */
function finish(reason: ReasonT): boolean {
  return _disable({ reason, pending: false }, 'finish')
}

/**
 * Enable sdk if not GDPR forgotten
 */
function restore(): boolean {
  const { reason } = getDisabled() || {}

  if (reason === DISABLE_REASONS.REASON_GDPR) {
    Logger.log('Adjust SDK is disabled due to GDPR-Forget-Me request and it can not be re-enabled')
    return false
  }

  if (!reason) {
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
function status(): StatusT {
  const { reason, pending } = getDisabled() || {}

  if (reason === DISABLE_REASONS.REASON_GENERAL || reason === DISABLE_REASONS.REASON_GDPR && !pending) {
    return 'off'
  } else if (reason === DISABLE_REASONS.REASON_GDPR && pending) {
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
