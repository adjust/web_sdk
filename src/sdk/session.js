import Config from './config'
import Queue from './queue'
import Storage from './storage'
import identity from './identity'
import {on, off, getVisibilityApiAccess, extend} from './utilities'
import {getTimestamp, timePassed} from './time'

/**
 * Flag to mark if session watch is already on
 *
 * @type {boolean}
 * @private
 */
let _started = false

/**
 * Reference to interval id to be used for clearing
 *
 * @type {number}
 * @private
 */
let _idInterval

/**
 * Reference to timeout id to be used for clearing
 *
 * @type {number}
 * @private
 */
let _idTimeout

/**
 * Browser-specific prefixes for accessing Page Visibility API
 *
 * @type {{hidden, visibilityChange}}
 * @private
 */
const _adapter = getVisibilityApiAccess()

/**
 * Initiate session watch:
 * - check session initially
 * - set the timer to update last active timestamp
 * - bind to visibility change event to track window state (if out of focus or closed)
 */
function watchSession () {

  if (_started) {
    throw new Error('Session watch already initiated')
  }

  _started = true

  _checkSession()

  if (_adapter) {
    on(document, _adapter.visibilityChange, _handleVisibilityChange)
  }
}

/**
 * Set last active timestamp
 */
function setLastActive () {
  return identity()
    .then(activityState => Storage.updateItem(
      'activityState',
      extend({}, activityState, {lastActive: Date.now()})
    ))
}

/**
 * Destroy session watch
 */
function destroy () {

  _started = false

  _stopTimer()

  if (_adapter) {
    clearTimeout(_idTimeout)
    off(document, _adapter.visibilityChange, _handleVisibilityChange)
  }
}

/**
 * Handle visibility change and perform certain actions:
 * - if page is hidden then stop the timer and update last active timestamp
 * - if page is visible then check for the session and restart the timer
 *
 * @private
 */
function _handleVisibilityChange () {

  clearTimeout(_idTimeout)

  _idTimeout = setTimeout(() => {
    if (document[_adapter.hidden]) {
      _stopTimer()
      setLastActive()
    } else {
      _checkSession()
    }
  }, 0)
}

/**
 * Start the session timer - every N seconds last active timestamp is updated automatically
 *
 * @private
 */
function _startTimer () {

  _stopTimer()

  _idInterval = setInterval(setLastActive, Config.sessionTimerWindow)
}

/**
 * Stop the session timer
 *
 * @private
 */
function _stopTimer () {
  clearInterval(_idInterval)
}

/**
 * Track session by sending the request to the server
 *
 * @private
 */
function _trackSession () {
  Queue.push({
    url: '/session',
    method: 'POST',
    params: extend({
      created_at: getTimestamp()
    }, Config.baseParams)
  })
}

/**
 * Check if session needs to be tracked
 *
 * @private
 */
function _checkSession () {

  _startTimer()

  identity()
    .then(activityState => {
      const lastActive = activityState.lastActive || 0
      const diff = timePassed(lastActive, Date.now())

      if (!lastActive || diff >= Config.sessionWindow) {
        _trackSession()
      }
    })
}

export {
  watchSession,
  setLastActive,
  destroy
}
