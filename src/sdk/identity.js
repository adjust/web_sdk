import Storage from './storage'
import ActivityState from './activity-state'
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
function _sync () {
  return Storage.getFirst('activityState')
    .then(stored => {
      if (stored) {
        return stored
      }

      const activityState = ActivityState.current || {uuid: _generateUuid()}

      return Storage.addItem('activityState', activityState)
        .then(() => ActivityState.current = activityState)
    })
}

/**
 * Cache stored activity state into running memory
 *
 * @returns {Promise}
 */
function startActivityState () {
  return _sync()
    .then(stored => ActivityState.current = stored)
}

/**
 * Update activity state in memory and store it
 *
 * @param {Object} params
 * @returns {Promise}
 */
function updateActivityState (params) {
  return _sync()
    .then(stored => {

      const activityState = extend({}, stored, params)

      return Storage.updateItem('activityState', activityState)
        .then(() => ActivityState.current = activityState)
    })
}

/**
 * Destroy current activity state
 */
function destroy () {
  ActivityState.destroy()
}

export {
  startActivityState,
  updateActivityState,
  destroy
}
