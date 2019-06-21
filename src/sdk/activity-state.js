import {extend} from './utilities'

/**
 * Reference to the activity state
 *
 * @type {Object}
 * @private
 */
let _activityState = null

/**
 * Get current activity state
 *
 * @returns {Object|null}
 */
function currentGetter () {
  return _activityState ? extend({}, _activityState) : null
}

/**
 * Set current activity state
 *
 * @param {Object} params
 */
function currentSetter (params) {
  _activityState = extend({}, params)
}

/**
 * Destroy current activity state
 */
function destroy () {
  _activityState = null
}

const ActivityState = {
  destroy
}

Object.defineProperty(ActivityState, 'current', {
  get () { return currentGetter() },
  set (value) { return currentSetter(value) }
})

export default ActivityState
