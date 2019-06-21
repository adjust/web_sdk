import ActivityState from './activity-state'
import {SECOND} from './constants'
import {timePassed} from './time'
import {extend} from './utilities'

/**
 * Last point when user was active
 *
 * @type {number}
 * @private
 */
let _lastActive = 0

/**
 * Active flag, if in foreground
 *
 * @type {boolean}
 * @private
 */
let _active = false

/**
 * Update last active point
 *
 * @private
 */
function _updateLastActive (sync) {
  const activityState = ActivityState.current || {}
  _lastActive = sync ? activityState.lastActive : Date.now()
}

/**
 * Update time spent from last active point
 *
 * @param {number|null} timeSpent
 * @private
 */
function _updateTimeSpent (timeSpent) {
  ActivityState.current = extend(ActivityState.current || {}, {timeSpent})
}

/**
 * Set active flag to true when going foreground and update last active
 *
 * @param {boolean=false} sync
 */
function toForeground (sync) {
  _active = true

  _updateLastActive(sync)
}

/**
 * Set active flag to false when going background
 */
function toBackground () {
  _active = false
}

/**
 * Get the time spent plus time offset when it was requested
 *
 * @returns {number}
 */
function get () {
  const activityState = ActivityState.current || {}
  const offset = Math.round(timePassed(_lastActive, Date.now()) / SECOND)
  const timeSpent = activityState.timeSpent || 0

  if (!_active) {
    return timeSpent
  }

  return timeSpent + offset
}

/**
 * Update time spent
 *
 * @returns {number}
 */
function update () {
  const timeSpent = get()

  _updateTimeSpent(timeSpent)
  _updateLastActive()

  return timeSpent
}

/**
 * Reset time spent to zero
 */
function reset () {
  _updateLastActive()
  _updateTimeSpent(0)
}

export {
  toForeground,
  toBackground,
  get,
  update,
  reset
}
