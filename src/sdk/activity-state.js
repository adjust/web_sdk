import {extend, isEmpty} from './utilities'
import {publish} from './pub-sub'
import QuickStorage from './quick-storage'

/**
 * Reference to the activity state
 *
 * @type {Object}
 * @private
 */
let _activityState = null

/**
 * Reference to the disabled state
 *
 * @type {Object}
 * @private
 */
let _disabledState = extend({}, QuickStorage.state)

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
   * @param {Object} params
   */
  set current (params) {
    _activityState = extend({}, params)
  },

  /**
   * Get current disabled state
   *
   * @returns {Object}
   */
  get state () {
    if (isEmpty(_disabledState)) {
      return _disabledState = extend({}, QuickStorage.state)
    } else {
      return extend({}, _disabledState)
    }
  },

  /**
   * Set current disabled state
   *
   * @param state
   */
  set state (state) {
    QuickStorage.state = state
    _disabledState = extend({}, state)
  },

  /**
   * Reload current disabled state from localStorage
   */
  reloadState () {
    if (QuickStorage.state.disabled && !_disabledState.disabled) {
      publish('sdk:shutdown', true)
    }

    _disabledState = extend({}, QuickStorage.state)
  },

  /**
   * Destroy current activity state
   */
  destroy () {
    _activityState = null
  }
}
