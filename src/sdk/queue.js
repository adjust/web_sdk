import Config from './config'
import StorageManager from './storage-manager'
import ActivityState from './activity-state'
import Logger from './logger'
import request from './request'
import backOff from './backoff'
import {extend} from './utilities'

const DEFAULT_ATTEMPTS = 0
const DEFAULT_WAIT = 150
const DEFAULT_URL = null

/**
 * Timeout id and wait when pending request is about to happen
 *
 * @type {Object}
 * @private
 */
let _timeout = {
  id: null,
  attempts: DEFAULT_ATTEMPTS,
  wait: DEFAULT_WAIT,
  url: DEFAULT_URL
}

/**
 * Check if in offline mode
 *
 * @type {boolean}
 * @private
 */
let _isOffline = false

/**
 * Name of the store used by queue
 *
 * @type {string}
 * @private
 */
const _storeName = 'queue'

/**
 * Remove from the top and continue running pending requests
 *
 * @private
 */
function _continue (timestamp) {
  return StorageManager.deleteItem(_storeName, timestamp)
    .then(() => {

      Logger.log(`Request ${_timeout.url} has been finished`)

      _timeout.attempts = DEFAULT_ATTEMPTS
      _timeout.wait = DEFAULT_WAIT
      _timeout.url = DEFAULT_URL

      _clearTimeout()

      return run()
    })
}

/**
 * Retry pending request after some time
 *
 * @private
 */
function _retry () {

  _timeout.attempts += 1
  _timeout.wait = backOff(_timeout.attempts)
  _timeout.url = null

  _clearTimeout()

  return run({retrying: true})
}

/**
 * Push request to the queue
 *
 * @param {string} url
 * @param {string} method
 * @param {Object} params
 */
function push ({url, method, params}) {
  return StorageManager.addItem(_storeName, extend({timestamp: Date.now()}, {url, method, params}))
    .then(() => _timeout.id ? {} : run())
}

/**
 * Make the request and retry if necessary
 *
 * @param {Object} pending
 * @returns {Promise}
 * @private
 */
function _request (pending) {
  return request({
    url: pending.url,
    method: pending.method,
    params: pending.params
  }).then(() => _continue(pending.timestamp))
    .catch(_retry)
}

/**
 * Make delayed request after some time
 *
 * @param {Object} pending
 * @param {boolean=false} retrying
 * @returns {Promise}
 * @private
 */
function _delayedRequest (pending, retrying) {

  if (!pending) {
    return Promise.resolve({})
  }

  _timeout.url = pending.url

  if (_timeout.id) {
    _clearTimeout()
  }

  Logger.log(`${retrying ? 'Re-trying' : 'Trying'} request ${pending.url} in ${_timeout.wait}ms`)

  return new Promise(() => {
    _timeout.id = setTimeout(() => {
      return _request(pending)
    }, _timeout.wait)
  })
}

/**
 * Run all pending requests
 *
 * @param {Object=} options
 * @param {boolean=} options.cleanUp
 * @param {boolean=false} options.retrying
 */
function run ({cleanUp, retrying} = {}) {

  let chain = Promise.resolve([])

  if (cleanUp) {
    chain = chain.then(_cleanUp)
  }

  return chain
    .then(() => StorageManager.getFirst(_storeName))
    .then(pending => {

      const activityState = ActivityState.current || {}
      const firstSession = pending && pending.url === '/session' && !activityState.attribution

      if (_isOffline && !firstSession) {
        return []
      }

      return _delayedRequest(pending, retrying)
    })
}

/**
 * Set offline mode to on or off
 * - if on then all requests are queued
 * - if off then run all pending requests
 *
 * @param {boolean=false} state
 */
function setOffline (state = false) {

  const wasOffline = _isOffline

  _isOffline = state

  if (!state && wasOffline) {
    run()
  }

  Logger.info(`The app is now in ${(state ? 'offline' : 'online')} mode`)
}

/**
 * Clean up stale pending requests
 *
 * @private
 * @returns {Promise}
 */
function _cleanUp () {
  return StorageManager.deleteBulk(_storeName, {upperBound: Date.now() - Config.requestValidityWindow})
}

/**
 * Clear previous pending request
 *
 * @private
 */
function _clearTimeout () {

  const url = _timeout.url

  clearTimeout(_timeout.id)
  _timeout.id = null
  _timeout.url = DEFAULT_URL

  if (url) {
    _timeout.wait = DEFAULT_WAIT
    _timeout.attempts = DEFAULT_ATTEMPTS

    Logger.log(`Previous ${url} request attempt canceled`)
  }

}

/**
 * Check if there is pending timeout to be flushed
 * i.e. if queue is running
 *
 * @returns {boolean}
 */
function isRunning () {
  return !!_timeout.id
}

/**
 * Clear queue store
 */
function clear () {
  return StorageManager.clear(_storeName)
}

/**
 * Destroy queue by clearing current timeout
 */
function destroy () {
  _clearTimeout()
}

export {
  push,
  run,
  setOffline,
  isRunning,
  clear,
  destroy
}
