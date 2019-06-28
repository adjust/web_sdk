import ActivityState from './activity-state'
import {SECOND} from './constants'
import {timePassed} from './time'
import {extend} from './utilities'
import Config from './config'

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
 * Get particular session param, like time spent or session length
 *
 * @param {string} key
 * @returns {number}
 * @private
 */
function _getSessionParam (key) {
  const activityState = ActivityState.current || {}
  const param = activityState[key]

  if (param === null) {
    return 0
  }

  const withinWindow = timePassed(_lastActive, Date.now()) < Config.sessionWindow
  const withOffset = _active || (key === 'sessionLength' && withinWindow)

  return (param || 0) + (withOffset ? _getOffset() : 0)
}

/**
 * Get all available session params
 *
 * @returns {Object}
 */
function getAll () {
  return {
    timeSpent: _getSessionParam('timeSpent'),
    sessionLength: _getSessionParam('sessionLength')
  }
}

/**
 * Update all session params
 *
 * @returns {number}
 */
function updateAll () {
  const {timeSpent, sessionLength} = getAll()

  _update({timeSpent, sessionLength})
  _updateLastActive()

}

/**
 * Update particular session parameter
 *
 * @param key
 */
function updateSessionParam (key) {
  const param = _getSessionParam(key)

  _update({[key]: param})
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
  updateAll,
  updateSessionParam,
  reset,
  destroy
}
