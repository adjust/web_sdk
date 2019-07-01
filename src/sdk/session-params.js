import ActivityState from './activity-state'
import {SECOND} from './constants'
import {timePassed} from './time'
import {extend} from './utilities'
import Config from './config'
import Logger from './logger'

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
 * @param {boolean=} sync
 * @private
 */
function _updateLastActive (sync) {
  const activityState = ActivityState.current || {}
  _lastActive = sync ? activityState.lastActive : Date.now()
}

/**
 * Update activity state with new session params
 *
 * @param {Object} params
 * @private
 */
function _update (params) {
  ActivityState.current = extend(ActivityState.current || {}, params)
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
 * Get time offset from the last active point
 *
 * @returns {number}
 * @private
 */
function _getOffset () {
  return Math.round(timePassed(_lastActive, Date.now()) / SECOND)
}

/**
 * Get time spent with optional offset from last point
 *
 * @returns {number}
 * @private
 */
function _getTimeSpent () {
  const activityState = ActivityState.current || {}
  const timeSpent = activityState.timeSpent

  if (timeSpent === null) {
    return 0
  }

  return (timeSpent || 0) + (_active ? _getOffset() : 0)
}

/**
 * Get session length with optional offset from last point
 *
 * @returns {number}
 * @private
 */
function _getSessionLength () {
  const activityState = ActivityState.current || {}
  const sessionLength = activityState.sessionLength

  if (sessionLength === null) {
    return 0
  }

  const withinWindow = timePassed(_lastActive, Date.now()) < Config.sessionWindow
  const withOffset = _active || withinWindow

  return (sessionLength || 0) + (withOffset ? _getOffset() : 0)
}

/**
 * Get total number of sessions so far
 *
 * @returns {number}
 * @private
 */
function _getSessionCount () {
  const activityState = ActivityState.current || {}
  return activityState.sessionCount || 0
}

/**
 * Get all available session params
 *
 * @returns {Object}
 */
function getAll () {
  return {
    timeSpent: _getTimeSpent(),
    sessionLength: _getSessionLength(),
    sessionCount: _getSessionCount()
  }
}

/**
 * Update particular session parameter
 *
 * @param key
 */
function updateSessionParam (key) {
  let param

  switch (key) {
    case 'timeSpent':
      param = _getTimeSpent()
      break
    case 'sessionLength':
      param = _getSessionLength()
      break
    case 'sessionCount':
      param = _getSessionCount() + 1
      break
    default:
      Logger.error(`Key ${key} does not exist in Activity State`)
  }

  if (param !== undefined) {
    _update({[key]: param})
    _updateLastActive()
  }
}

/**
 * Update session params which have time offset from last measure point
 */
function updateOffset () {
  const timeSpent = _getTimeSpent()
  const sessionLength = _getSessionLength()

  _update({timeSpent, sessionLength})
  _updateLastActive()
}

/**
 * Reset session params to zero
 */
function reset () {
  _updateLastActive()
  _update({timeSpent: 0, sessionLength: 0})
}

/**
 * Mark session params as destroyed by setting their values to null
 */
function destroy () {
  _updateLastActive()
  _update({timeSpent: null, sessionLength: null})
}

export {
  toForeground,
  toBackground,
  getAll,
  updateSessionParam,
  updateOffset,
  reset,
  destroy
}
