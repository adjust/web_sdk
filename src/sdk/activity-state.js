import {SECOND} from './constants'
import {timePassed} from './time'
import {isRequest} from './utilities'
import Config from './config'

/**
 * Reference to the activity state
 *
 * @type {Object}
 * @private
 */
let _activityState = null

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
  return _activityState ? {..._activityState} : null
}

/**
 * Set current activity state
 *
 * @param {Object} params
 */
function currentSetter (params) {
  _activityState = {...params}
}

/**
 * Update last active point
 *
 * @private
 */
function updateLastActive () {
  if (_activityState === null) {
    return
  }

  _activityState.lastInterval = _getLastInterval()
  _activityState.lastActive = Date.now()
}

/**
 * Update activity state with new params
 *
 * @param {Object} params
 * @private
 */
function _update (params) {
  _activityState = {..._activityState, ...params}
}

/**
 * Set active flag to true when going foreground
 */
function toForeground () {
  _active = true
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
  const lastActive = _activityState.lastActive
  return Math.round(timePassed(lastActive, Date.now()) / SECOND)
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
  const lastActive = _activityState.lastActive
  const withinWindow = timePassed(lastActive, Date.now()) < Config.sessionWindow
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
  return _activityState.sessionCount || 0
}

/**
 * Get total number of events so far
 *
 * @returns {number|null}
 * @private
 */
function _getEventCount () {
  return _activityState.eventCount || 0
}

/**
 * Get time passed since last activity was recorded
 *
 * @returns {number}
 * @private
 */
function _getLastInterval () {
  const lastActive = _activityState.lastActive

  if (lastActive) {
    return Math.round(timePassed(lastActive, Date.now()) / SECOND)
  }

  return -1
}

/**
 * Initiate session params and go to foreground
 */
function initParams () {
  updateSessionOffset()
  toForeground()
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

  const lastInterval = _activityState.lastInterval >= 0 ? _activityState.lastInterval : 0

  return {
    timeSpent: _activityState.timeSpent || 0,
    sessionLength: _activityState.sessionLength || 0,
    sessionCount: _activityState.sessionCount || 1,
    lastInterval: lastInterval || 0
  }
}

/**
 * Update activity state parameters depending on the endpoint which has been run
 *
 * @param {string} url
 * @param {boolean=false} auto
 */
function updateParams (url, auto) {
  if (_activityState === null) {
    return
  }

  const params = {}
  params.timeSpent = _getTimeSpent()
  params.sessionLength = _getSessionLength()

  if (isRequest(url, 'session')) {
    params.sessionCount = _getSessionCount() + 1
  }

  if (isRequest(url, 'event')) {
    params.eventCount = _getEventCount() + 1
  }

  _update(params)

  if (!auto) {
    updateLastActive()
  }
}

/**
 * Update installed flag - first session has been finished
 */
function updateInstalled () {
  if (_activityState === null) {
    return
  }

  if (_activityState.installed) {
    return
  }

  _update({installed: true})
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
  updateLastActive()
}

/**
 * Update session length
 */
function updateSessionLength () {
  if (_activityState === null) {
    return
  }

  const sessionLength = _getSessionLength()

  _update({sessionLength})
  updateLastActive()
}

/**
 * Reset time spent and session length to zero
 */
function resetSessionOffset () {
  if (_activityState === null) {
    return
  }

  _update({timeSpent: 0, sessionLength: 0})
}

/**
 * Destroy current activity state
 */
function destroy () {
  _activityState = null
  _active = false
}

const ActivityState = {
  toForeground,
  toBackground,
  initParams,
  getParams,
  updateParams,
  updateInstalled,
  updateSessionOffset,
  updateSessionLength,
  resetSessionOffset,
  updateLastActive,
  destroy
}

Object.defineProperty(ActivityState, 'current', {
  get () { return currentGetter() },
  set (value) { return currentSetter(value) }
})

export default ActivityState
