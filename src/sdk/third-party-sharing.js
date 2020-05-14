// @flow
import {push} from './queue'
import {getThirdPartySharing, setThirdPartySharing} from './preferences'
import Config from './config'
import Logger from './logger'
import {REASON_GENERAL} from './constants'

type ThirdPartySharingStatusT = 'pending' | 'on' | 'off'

/**
 * Log messages used in different scenarios
 *
 * @type {Object}
 * @private
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
 *
 * @returns {string}
 * @private
 */
function _status (): ThirdPartySharingStatusT {
  const disabled = getThirdPartySharing() || {}

  if (disabled.reason) {
    return disabled.pending ? 'pending' : 'off'
  }

  return 'on'
}

/**
 * Request third-party sharing opt-out request
 *
 * @param {boolean} force
 * @returns {boolean}
 */
function optOut (force?: boolean) {
  let status = _status()

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
 *
 * @param {boolean} pending
 * @param {string} expectedAction
 * @returns {boolean}
 * @private
 */
function _disable (pending: boolean, expectedAction: 'start' | 'finish'): boolean {
  const disabled = getThirdPartySharing() || {}
  const action = expectedAction === 'start' && pending ? 'start': 'finish'
  const shouldNotStart = expectedAction === 'start' && disabled.reason
  const shouldNotFinish = expectedAction === 'finish' && disabled.reason && !disabled.pending

  if (shouldNotStart || shouldNotFinish) {
    Logger.log(_logMessages[action].inProgress)
    return false
  }

  Logger.log(_logMessages[action].done)

  setThirdPartySharing({
    reason: REASON_GENERAL,
    pending
  })

  return true
}

/**
 * Start the third-party sharing disable process
 *
 * @returns {boolean}
 */
function disable (): boolean {
  return _disable(true, 'start')
}

/**
 * Finalize the third-party sharing process
 *
 * @returns {boolean}
 */
function finish () {
  return _disable(false, 'finish')
}

/**
 * Check if there s pending third-party sharing opt-out request
 */
function check (): void {
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
