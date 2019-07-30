import StorageManager from './storage/storage-manager'
import ActivityState from './activity-state'
import State from './state'
import Logger from './logger'
import {REASON_GDPR, REASON_GENERAL} from './constants'
import {extend} from './utilities'

/**
 * Name of the store used by activityState
 *
 * @type {string}
 * @private
 */
const _storeName = 'activityState'

/**
 * Generate random  uuid v4
 *
 * @returns {string}
 * @private
 */
function _generateUuid () {
  let seed = Date.now()
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (seed + Math.random() * 16) % 16 | 0
    seed = Math.floor(seed / 16)
    return (c === 'x' ? r : r & (0x3|0x8)).toString(16)
  })
}

/**
 * Cache stored activity state into running memory
 *
 * @returns {Promise}
 */
function start () {
  return StorageManager.getFirst(_storeName)
    .then(stored => {
      if (stored) {
        return stored.uuid === 'unknown' ? disable(REASON_GDPR) : stored
      }

      const activityState = ActivityState.current || {uuid: _generateUuid()}

      return StorageManager.addItem(_storeName, activityState)
        .then(() => {
          State.reload()
          return ActivityState.current = activityState
        })
    })
    .then(stored => ActivityState.current = stored)
}

/**
 * Persist changes made directly in activity state and update lastActive flag
 *
 * @returns {Promise}
 */
function persist () {
  if (State.disabled === REASON_GDPR) {
    return Promise.resolve({})
  }

  const activityState = extend({}, ActivityState.current, {lastActive: Date.now()})
  return StorageManager.updateItem(_storeName, activityState)
    .then(() => ActivityState.current = activityState)
}

/**
 * Sync in-memory activityState with the one from store
 * - should be used when change from another tab is possible and critical
 *
 * @returns {Promise}
 */
function sync () {
  return StorageManager.getFirst(_storeName)
    .then((activityState = {}) => {
      const lastActive = ActivityState.current.lastActive || 0

      if (!State.disabled && lastActive < activityState.lastActive) {
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
 * @private
 */
function disable (reason) {

  const logReason = reason === REASON_GDPR ? ' due to GDPR-Forget-Me request' : ''

  if (State.disabled) {
    Logger.log('Adjust SDK is already disabled' + logReason)
    return false
  }

  Logger.log('Adjust SDK has been disabled' + logReason)

  State.disabled = reason || REASON_GENERAL

  return true
}

/**
 * Enable sdk if not GDPR forgotten
 */
function enable () {

  if (State.disabled === REASON_GDPR) {
    Logger.log('Adjust SDK is disabled due to GDPR-Forget-me request and it can not be re-enabled')
    return false
  }

  if (!State.disabled) {
    Logger.log('Adjust SDK is already enabled')
    return false
  }

  Logger.log('Adjust SDK has been enabled')

  State.disabled = null

  return true
}

/**
 * Clear activity state store - set uuid to be unknown
 */
function clear () {

  const newActivityState = {uuid: 'unknown'}

  ActivityState.current = newActivityState

  return StorageManager.getFirst(_storeName)
    .then(current => current ? StorageManager.deleteItem(_storeName, current.uuid) : null)
    .then(() => StorageManager.addItem(_storeName, newActivityState))
}

/**
 * Destroy current activity state
 */
function destroy () {
  ActivityState.destroy()
}

export {
  start,
  persist,
  sync,
  disable,
  enable,
  clear,
  destroy
}
