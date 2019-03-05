import Config from './config'
import Queue from './queue'
import {setItem, getItem} from './storage'
import {on, off, getVisibilityApiAccess} from './utilities'
import {getTimestamp, timePassed} from './time'

/**
 * Flag to mark if session watch is already on
 *
 * @type {boolean}
 * @private
 */
let _started = false

/**
 * Interval id to use when stopping the timer
 *
 * @type {number}
 * @private
 */
let _intervalId

/**
 * Browser-specific prefixes for accessing Page Visibility API
 *
 * @type {{hidden, visibilitychange}}
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
    on(document, _adapter.visibilitychange, _handleVisibilityChange)
  }
}

/**
 * Set last active timestamp
 */
function setLastActive () {
  setItem('lastActive', Date.now())
}

/**
 * Destroy session watch
 */
function destroy () {

  _started = false

  _stopTimer()

  if (_adapter) {
    off(document, _adapter.visibilitychange, _handleVisibilityChange)
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
  if (document[_adapter.hidden]) {
    _stopTimer()
    setLastActive()
  } else {
    _checkSession()
  }
}

/**
 * Start the session timer - every N seconds last active timestamp is updated automatically
 *
 * @private
 */
function _startTimer () {

  _stopTimer()

  _intervalId = setInterval(setLastActive, Config.sessionTimerWindow)
}

/**
 * Stop the session timer
 *
 * @private
 */
function _stopTimer () {
  clearInterval(_intervalId)
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
    params: Object.assign({
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

  const lastActive = getItem('lastActive', 0)
  const diff = timePassed(lastActive, Date.now())

  if (!lastActive || diff >= Config.sessionWindow) {
    _trackSession()
  }
}

export {
  watchSession,
  setLastActive,
  destroy
}
