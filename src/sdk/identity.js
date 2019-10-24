// @flow
import {type ActivityStateMapT} from './types'
import StorageManager from './storage/storage-manager'
import ActivityState from './activity-state'
import State from './state'
import Logger from './logger'
import {REASON_GDPR, REASON_GENERAL} from './constants'

type StatusT = 'on' | 'off' | 'paused'
type ReasonT = {|
  reason: REASON_GDPR | REASON_GENERAL,
  pending?: boolean
|}
type InterceptT = {|
  continue: boolean,
  activityState?: ?ActivityStateMapT
|}

/**
 * Name of the store used by activityState
 *
 * @type {string}
 * @private
 */
const _storeName = 'activityState'

/**
 * Boolean used in start in order to avoid duplicated activity state
 *
 * @type {boolean}
 * @private
 */
let _starting: boolean = false

/**
 * Generate random  uuid v4
 *
 * @returns {string}
 * @private
 */
function _generateUuid (): string {
  let seed = Date.now()
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (seed + Math.random() * 16) % 16 | 0
    seed = Math.floor(seed / 16)
    return (c === 'x' ? r : r & (0x3|0x8)).toString(16)
  })
}

/**
 * Inspect stored activity state and check if disable needs to be repeated
 *
 * @param {Object=} stored
 * @returns {Object}
 * @private
 */
function _intercept (stored: ActivityStateMapT): InterceptT {
  if (!stored) {
    return {continue: true}
  }

  if (stored.uuid === 'unknown') {
    disable({reason: REASON_GDPR})
    ActivityState.destroy()
    return {continue: false, activityState: null}
  }

  ActivityState.current = stored

  return {continue: false, activityState: stored}
}

/**
 * Cache stored activity state into running memory
 *
 * @returns {Promise}
 */
function start (): Promise<?ActivityStateMapT> {
  if (_starting) {
    return Promise.reject({message: 'Adjust SDK start already in progress'})
  }
  _starting = true

  return StorageManager.getFirst(_storeName)
    .then(stored => {
      const intercepted = _intercept(stored)

      if (!intercepted.continue) {
        _starting = false
        return intercepted.activityState
      }

      const activityState = ActivityState.current || {uuid: _generateUuid()}

      return StorageManager.addItem(_storeName, activityState)
        .then(() => {
          State.reload()
          _starting = false
          return ActivityState.current = activityState
        })
    })
}

/**
 * Persist changes made directly in activity state and update lastActive flag
 *
 * @returns {Promise}
 */
function persist (): Promise<?ActivityStateMapT> {
  if (status() === 'off') {
    return Promise.resolve(null)
  }

  const activityState = {...ActivityState.current, lastActive: Date.now()}
  return StorageManager.updateItem(_storeName, activityState)
    .then(() => ActivityState.current = activityState)
}

/**
 * Sync in-memory activityState with the one from store
 * - should be used when change from another tab is possible and critical
 *
 * @returns {Promise}
 */
function sync (): Promise<ActivityStateMapT> {
  return StorageManager.getFirst(_storeName)
    .then(activityState => {
      const lastActive = ActivityState.current.lastActive || 0

      if (status() !== 'off' && lastActive < activityState.lastActive) {
        ActivityState.current = activityState
        State.reload()
      }

      return activityState
    })
}

/**
 * Disable sdk due to a particular reason
 *
 * @param {string=} reason
 * @param {boolean=} pending
 * @private
 */
function disable ({reason, pending = false}: ReasonT = {}): boolean {
  const logReason = (reason) => reason === REASON_GDPR ? ' due to GDPR-Forget-Me request' : ''
  const disabled = State.disabled || {}

  if (disabled.reason) {
    Logger.log('Adjust SDK is already disabled' + logReason(disabled.reason))
    return false
  }

  Logger.log('Adjust SDK has been disabled' + logReason(reason))

  State.disabled = {
    reason: reason || REASON_GENERAL,
    pending
  }

  return true
}

/**
 * Enable sdk if not GDPR forgotten
 */
function enable (): boolean {
  const disabled = State.disabled || {}

  if (disabled.reason === REASON_GDPR) {
    Logger.log('Adjust SDK is disabled due to GDPR-Forget-Me request and it can not be re-enabled')
    return false
  }

  if (!disabled.reason) {
    Logger.log('Adjust SDK is already enabled')
    return false
  }

  Logger.log('Adjust SDK has been enabled')

  State.disabled = null

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
  const disabled = State.disabled || {}

  if (disabled.reason === REASON_GENERAL || disabled.reason === REASON_GDPR && !disabled.pending) {
    return 'off'
  } else if (disabled.reason === REASON_GDPR && disabled.pending) {
    return 'paused'
  }

  return 'on'
}

/**
 * Clear activity state store - set uuid to be unknown
 */
function clear (): void {
  const newActivityState = {uuid: 'unknown'}

  ActivityState.current = newActivityState
  State.disabled = {
    reason: REASON_GDPR,
    pending: false
  }

  return StorageManager.clear(_storeName)
    .then(() => StorageManager.addItem(_storeName, newActivityState))
}

/**
 * Destroy current activity state
 */
function destroy (): void {
  ActivityState.destroy()
}

export {
  start,
  persist,
  sync,
  disable,
  enable,
  status,
  clear,
  destroy
}
