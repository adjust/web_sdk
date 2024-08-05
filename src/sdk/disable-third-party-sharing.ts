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
function optOut(force?: boolean): boolean {
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
 * Start the third-party sharing disable process
 */
function disable(): boolean {
  const { reason: savedReason } = getThirdPartySharing() || {}
  const alreadyStarted = !!savedReason

  if (alreadyStarted) {
    Logger.log(_logMessages['start'].inProgress)
    return false
  }

  Logger.log(_logMessages['start'].done)

  setThirdPartySharing({
    reason: DISABLE_REASONS.REASON_GENERAL,
    pending: true
  })

  return true
}

/**
 * Finalize the third-party sharing process
 */
function finish() {
  const { reason: savedReason, pending: savedPending } = getThirdPartySharing() || {}
  const shouldNotFinish = savedReason && !savedPending

  if (shouldNotFinish) {
    Logger.log(_logMessages['finish'].inProgress)
    return false
  }

  Logger.log(_logMessages['finish'].done)

  setThirdPartySharing({
    reason: DISABLE_REASONS.REASON_GENERAL,
    pending: false
  })

  return true
}

/**
 * Check if there s pending third-party sharing opt-out request
 */
function runPendingOptOut(): void {
  if (_status() === 'pending') {
    Logger.log(_logMessages.running)
    optOut(true)
  }
}

export {
  optOut,
  disable,
  finish,
  runPendingOptOut
}
