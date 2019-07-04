import {SECOND} from './constants'
import {timePassed} from './time'
import {extend} from './utilities'
import Config from './config'
import Logger from './logger'

/**
 * Reference to the activity state
 *
 * @type {Object}
 * @private
 */
let _activityState = null

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
 * Update last active point
 *
 * @param {boolean=} sync
 * @private
 */
function _updateLastActive (sync) {
  _lastActive = sync && _activityState.lastActive ? _activityState.lastActive : Date.now()
}

/**
 * Update activity state with new session params
 *
 * @param {Object} params
 * @private
 */
function _update (params) {
  _activityState = extend(_activityState || {}, params)
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
 * @returns {number|null}
 * @private
 */
function _getTimeSpent () {
  return (_activityState.timeSpent || 0) + (_active ? _getOffset() : 0)
}

/**
 * Get session length with optional offset from last point
 *
 * @returns {number|null}
 * @private
 */
function _getSessionLength () {
  const withinWindow = timePassed(_lastActive, Date.now()) < Config.sessionWindow
  const withOffset = _active || !_active && withinWindow

  return (_activityState.sessionLength || 0) + (withOffset ? _getOffset() : 0)
}

/**
 * Get total number of sessions so far
 *
 * @returns {number|null}
 * @private
 */
function _getSessionCount () {
  return (_activityState || {}).sessionCount || 1
}

/**
 * Get total number of events so far
 *
 * @returns {number|null}
 * @private
 */
function _getEventCount () {
  return (_activityState || {}).eventCount || 0
}

/**
 * Get activity state params that are sent with each request
 *
 * @returns {Object}
 */
function getParams () {
  if (_activityState === null) {
    return {}
  }

  return {
    timeSpent: _activityState.timeSpent || 0,
    sessionLength: _activityState.sessionLength || 0,
    sessionCount: _activityState.sessionCount || 1
  }
}

/**
 * Update particular session parameter
 *
 * @param key
 */
function updateParam (key) {
  if (_activityState === null) {
    return
  }

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
    case 'eventCount':
      param = _getEventCount() + 1
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
 * Update session params which depend on the time offset since last measure point
 */
function updateSessionOffset () {
  if (_activityState === null) {
    return
  }

  const timeSpent = _getTimeSpent()
  const sessionLength = _getSessionLength()

  _update({timeSpent, sessionLength})
  _updateLastActive()
}

/**
 * Reset time spent and session length to zero
 */
function resetSessionOffset () {
  if (_activityState === null) {
    return
  }

  _updateLastActive()
  _update({timeSpent: 0, sessionLength: 0})
}

/**
 * Destroy current activity state
 */
function destroy () {
  _activityState = null
}

const ActivityState = {
  toForeground,
  toBackground,
  getParams,
  updateParam,
  updateSessionOffset,
  resetSessionOffset,
  destroy
}

Object.defineProperty(ActivityState, 'current', {
  get () { return currentGetter() },
  set (value) { return currentSetter(value) }
})

export default ActivityState
