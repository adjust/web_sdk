// @flow
import {
  type UrlT,
  type ActivityStateMapT,
  type AttributionMapT,
  type CommonRequestParams
} from './types'
import {SECOND} from './constants'
import {timePassed} from './time'
import {isRequest} from './utilities'
import Config from './config'
import Logger from './logger'

/**
 * Reference to the activity state
 *
 * @type {Object}
 * @private
 */
let _activityState: ActivityStateMapT = {}

/**
 * Started flag, if activity state has been initiated
 *
 * @type {boolean}
 * @private
 */
let _started: boolean = false

/**
 * Active flag, if in foreground
 *
 * @type {boolean}
 * @private
 */
let _active: boolean = false


/**
 * Get current activity state
 *
 * @returns {Object}
 */
function currentGetter (): ActivityStateMapT {
  return _started ? {..._activityState} : {}
}

/**
 * Set current activity state
 *
 * @param {Object} params
 */
function currentSetter (params: ActivityStateMapT = {}) {
  _activityState = _started ? {...params} : {}
}

/**
 * Initiate in-memory activity state
 *
 * @param {Object} params
 */
function init (params: ActivityStateMapT) {
  _started = true
  currentSetter(params)
}

/**
 * Check if activity state is started
 *
 * @returns {boolean}
 */
function isStarted () {
  return _started
}

/**
 * Update last active point
 *
 * @private
 */
function updateLastActive (): void {
  if (!_started) {
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
function _update (params: ActivityStateMapT): void {
  _activityState = {..._activityState, ...params}
}

/**
 * Set active flag to true when going foreground
 */
function toForeground (): void {
  _active = true
}

/**
 * Set active flag to false when going background
 */
function toBackground (): void {
  _active = false
}

/**
 * Get time offset from the last active point
 *
 * @returns {number}
 * @private
 */
function _getOffset (): number {
  const lastActive = _activityState.lastActive
  return Math.round(timePassed(lastActive, Date.now()) / SECOND)
}

/**
 * Get time spent with optional offset from last point
 *
 * @returns {number}
 * @private
 */
function _getTimeSpent (): number {
  return (_activityState.timeSpent || 0) + (_active ? _getOffset() : 0)
}

/**
 * Get session length with optional offset from last point
 *
 * @returns {number}
 * @private
 */
function _getSessionLength (): number {
  const lastActive = _activityState.lastActive
  const withinWindow = timePassed(lastActive, Date.now()) < Config.sessionWindow
  const withOffset = _active || !_active && withinWindow

  return (_activityState.sessionLength || 0) + (withOffset ? _getOffset() : 0)
}

/**
 * Get total number of sessions so far
 *
 * @returns {number}
 * @private
 */
function _getSessionCount (): number {
  return _activityState.sessionCount || 0
}

/**
 * Get total number of events so far
 *
 * @returns {number}
 * @private
 */
function _getEventCount (): number {
  return _activityState.eventCount || 0
}

/**
 * Get time passed since last activity was recorded
 *
 * @returns {number}
 * @private
 */
function _getLastInterval (): number {
  const lastActive = _activityState.lastActive

  if (lastActive) {
    return Math.round(timePassed(lastActive, Date.now()) / SECOND)
  }

  return -1
}

/**
 * Initiate session params and go to foreground
 */
function initParams (): void {
  updateSessionOffset()
  toForeground()
}

/**
 * Get activity state params that are sent with each request
 *
 * @returns {Object}
 */
function getParams (url?: UrlT): ?CommonRequestParams {
  if (!_started) {
    return null
  }

  const lastInterval = _activityState.lastInterval >= 0 ? _activityState.lastInterval : 0

  const baseParams: CommonRequestParams = {
    timeSpent: _activityState.timeSpent || 0,
    sessionLength: _activityState.sessionLength || 0,
    sessionCount: _activityState.sessionCount || 1,
    lastInterval: lastInterval || 0
  }

  if (url && isRequest(url, 'event')) {
    baseParams.eventCount = _activityState.eventCount
  }

  return baseParams
}

/**
 * Update activity state parameters depending on the endpoint which has been run
 *
 * @param {string} url
 * @param {boolean=false} auto
 */
function updateParams (url: string, auto?: boolean): void {
  if (!_started) {
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
function updateInstalled (): void {
  if (!_started) {
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
function updateSessionOffset (): void {
  if (!_started) {
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
function updateSessionLength (): void {
  if (!_started) {
    return
  }

  const sessionLength = _getSessionLength()

  _update({sessionLength})
  updateLastActive()
}

/**
 * Reset time spent and session length to zero
 */
function resetSessionOffset (): void {
  if (!_started) {
    return
  }

  _update({timeSpent: 0, sessionLength: 0})
}

/**
 * Destroy current activity state
 */
function destroy (): void {
  _activityState = {}
  _started = false
  _active = false
}

function getAttribution (): AttributionMapT | null {
  if (!_started) {
    return null
  }

  if (!_activityState.attribution) {
    Logger.log('No attribution data yet')
    return null
  }

  return _activityState.attribution
}

function getWebUUID (): string {
  if (!_started) {
    return null
  }

  return _activityState.uuid
}

const ActivityState = {
  get current () { return currentGetter() },
  set current (value) { currentSetter(value) },
  init,
  isStarted,
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
  destroy,
  getAttribution,
  getWebUUID
}

export default ActivityState
