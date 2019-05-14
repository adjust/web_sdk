import {extend} from './utilities'

/**
 * Reference to the activity state
 *
 * @type {Object}
 * @private
 */
let _activityState = null

export default {
  /**
   * Get current activity state
   *
   * @returns {Object|null}
   */
  get current () {
    return _activityState ? extend({}, _activityState) : null
  },

  /**
   * Set current activity state
   *
   * @param {Object} state
   */
  set current (state) {
    _activityState = extend({}, state)
  },

  /**
   * Check if uuid is unknown due to GDPR-Forget-Me request
   *
   * @returns {boolean}
   */
  isUnknown () {
    return  _activityState && _activityState.uuid === 'unknown'
  },

  /**
   * Destroy current activity state
   */
  destroy () {
    _activityState = null
  }
}
