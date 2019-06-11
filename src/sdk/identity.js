import StorageManager from './storage-manager'
import ActivityState from './activity-state'
import {REASON_GDPR, REASON_GENERAL} from './constants'
import {extend} from './utilities'

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
 * Check if there is activity state, if not create one and sync with running memory
 *
 * @returns {Promise}
 * @private
 */
function _recover () {
  return StorageManager.getFirst('activityState')
    .then(stored => {
      if (stored) {
        return stored
      }

      const activityState = ActivityState.current || {uuid: _generateUuid()}
      const disabledState = ActivityState.state

      return StorageManager.addItem('activityState', activityState)
        .then(() => {
          ActivityState.state = disabledState
          return ActivityState.current = activityState
        })
    })
}

/**
 * Cache stored activity state into running memory
 *
 * @returns {Promise}
 */
function start () {
  return _recover()
    .then(stored => ActivityState.current = stored)
}

/**
 * Update activity state in memory and store it
 *
 * @param {Object} params
 * @returns {Promise}
 * @private
 */
function _updateActivityState (params) {
  return _recover()
    .then(stored => {

      const activityState = extend({}, stored, params)

      return StorageManager.updateItem('activityState', activityState)
        .then(() => ActivityState.current = activityState)
    })
}

/**
 * Update attribution information
 *
 * @param {Object} attribution
 * @returns {Promise}
 */
function updateAttribution (attribution) {
  return _updateActivityState({attribution})
}

/**
 * Update last active flag
 *
 * @param {boolean=false} ignore
 * @returns {Promise}
 */
function updateLastActive (ignore) {
  if (ignore) {
    return Promise.resolve(ActivityState.current)
  }

  return _updateActivityState({lastActive: Date.now()})
}

/**
 * Sync in-memory activityState with the one from store
 * - should be used when change from another tab is possible and critical
 *
 * @returns {Promise}
 */
function sync () {
  return StorageManager.getFirst('activityState')
    .then((activityState = {}) => {

      const lastActive = ActivityState.current.lastActive || 0

      if (!isDisabled() && lastActive < activityState.lastActive) {
        ActivityState.current = activityState
        ActivityState.reloadState()
      }

      return activityState
    })
}

/**
 * Check if sdk is disabled
 *
 * @returns {boolean}
 */
function isDisabled () {
  return ActivityState.state.disabled
}

/**
 * Set disabled flag
 *
 * @param {boolean} disabled
 * @param {string=} reason
 */
function setDisabled (disabled, reason) {
  const state = {disabled}

  if (disabled) {
    state.reason = reason || REASON_GENERAL
  }

  ActivityState.state = state
}

/**
 * Check if user has been disabled by issuing GDPR-Forgot-Me request
 *
 * @returns {boolean}
 */
function isGdprForgotten () {
  const state = ActivityState.state

  return state.disabled && state.reason === REASON_GDPR
}

/**
 * Clear activity state store - set uuid to be unknown
 */
function clear () {

  const newActivityState = {uuid: 'unknown'}

  ActivityState.current = newActivityState

  return StorageManager.getFirst('activityState')
    .then(current => current ? StorageManager.deleteItem('activityState', current.uuid) : null)
    .then(() => StorageManager.addItem('activityState', newActivityState))
}

/**
 * Destroy current activity state
 */
function destroy () {
  ActivityState.destroy()
}

export {
  start,
  updateAttribution,
  updateLastActive,
  sync,
  setDisabled,
  isDisabled,
  isGdprForgotten,
  clear,
  destroy
}
