import Config from './config'
import Constants from './constants'
import Queue from './queue'
import {setItem, getItem} from './storage'
import {on, off, isEmpty} from './utilities'
import {getTimestamp, timePassed} from './time'

/**
 * Interval id to use when stopping the timer
 *
 * @type {number}
 * @private
 */
let _intervalId

/**
 * Cached base params coming from the initialization
 *
 * @type {Object}
 * @private
 */
let _baseParams = {}

/**
 * Browser-specific prefixes for accessing Page Visibility API
 *
 * @type {{hidden, visibilitychange}}
 * @private
 */
const _adapter = _getVisibilityApiAccess()

/**
 * Initiate session watch:
 * - check session initially
 * - set the timer to update last active timestamp
 * - bind to visibility change event to track window state (if out of focus or closed)
 *
 * @param {Object} params
 */
function watchSession (params) {

  if (!isEmpty(_baseParams)) {
    throw new Error('Session watch already initiated')
  }

  _baseParams = Object.assign({}, params)

  _checkSession()

  on(document, _adapter.visibilitychange, _handleVisibilityChange)
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

  _baseParams = {}

  _stopTimer()

  off(document, _adapter.visibilitychange, _handleVisibilityChange)
}

/**
 * Get Page Visibility API attributes that can be accessed depending on the browser implementation
 *
 * @returns {{hidden: string, visibilitychange: string}}
 * @private
 */
function _getVisibilityApiAccess () {

  if (typeof document.hidden !== 'undefined') {
    return {
      hidden: 'hidden',
      visibilitychange: 'visibilitychange'
    }
  }

  const prefixes = ['moz', 'ms', 'o', 'webkit']

  for (let i = 0; i <= prefixes.length; i += 1) {
    if (typeof document[`${prefixes[i]}Hidden`] !== 'undefined') {
      return {
        hidden: `${prefixes[i]}Hidden`,
        visibilitychange: `${prefixes[i]}visibilitychange`
      }
    }
  }

  throw new Error('Page Visibility API is not supported')
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

  _intervalId = setInterval(() => setLastActive, 60 * Constants.second)
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
    }, _baseParams)
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
  const diff = timePassed(lastActive, Date.now(), 'minute')

  if (!lastActive || diff >= Config.sessionWindow) {
    _trackSession()
  }
}

export {
  watchSession,
  setLastActive,
  destroy
}
