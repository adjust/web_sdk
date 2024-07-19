import { push } from './queue'
import { getThirdPartySharing, setThirdPartySharing } from './preferences'
import Config from './config'
import Logger from './logger'
import { DISABLE_REASONS } from './constants'

type ThirdPartySharingStatusT = 'pending' | 'on' | 'off'

/**
 * Log messages used in different scenarios
 */
const _logMessages = {
  running: 'Adjust SDK is running pending third-party sharing opt-out request',
  delayed: 'Adjust SDK will run third-party sharing opt-out request after initialisation',
  pending: 'Adjust SDK already queued third-party sharing opt-out request',
  off: 'Third-party sharing opt-out is already done',
  start: {
    inProgress: 'Third-party sharing opt-out has already started',
    done: 'Third-party sharing opt-out is now started'
  },
  finish: {
    inProgress: 'Third-party sharing opt-out has already finished',
    done: 'Third-party sharing opt-out is now finished'
  }
}

/**
 * Get the status of the third-party sharing
 */
function _status(): ThirdPartySharingStatusT {
  const { reason, pending } = getThirdPartySharing() || {}

  if (reason) {
    return pending ? 'pending' : 'off'
  }

  return 'on'
}

/**
 * Request third-party sharing opt-out request
 */
function optOut(force?: boolean) {
  const status = _status()

  if (!force && status !== 'on') {
    Logger.log(_logMessages[status])
    return false
  }

  if (!Config.isInitialised()) {
    Logger.log(_logMessages.delayed)
    return true
  }

  push({
    url: '/disable_third_party_sharing',
    method: 'POST'
  })

  return true
}

/**
 * Start or finish thrid-party sharing disable process
 */
function _disable(pending: boolean, expectedAction: 'start' | 'finish'): boolean {
  const { reason: savedReason, pending: savedPending } = getThirdPartySharing() || {}
  const action = expectedAction === 'start' && pending ? 'start' : 'finish'
  const shouldNotStart = expectedAction === 'start' && savedReason
  const shouldNotFinish = expectedAction === 'finish' && savedReason && !savedPending

  if (shouldNotStart || shouldNotFinish) {
    Logger.log(_logMessages[action].inProgress)
    return false
  }

  Logger.log(_logMessages[action].done)

  setThirdPartySharing({
    reason: DISABLE_REASONS.REASON_GENERAL,
    pending: pending
  })

  return true
}

/**
 * Start the third-party sharing disable process
 */
function disable(): boolean {
  return _disable(true, 'start')
}

/**
 * Finalize the third-party sharing process
 */
function finish() {
  return _disable(false, 'finish')
}

/**
 * Check if there s pending third-party sharing opt-out request
 */
function check(): void {
  if (_status() === 'pending') {
    Logger.log(_logMessages.running)
    optOut(true)
  }
}

export {
  optOut,
  disable,
  finish,
  check
}
