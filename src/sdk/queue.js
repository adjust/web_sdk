import Config from './config'
import StorageManager from './storage/storage-manager'
import ActivityState from './activity-state'
import Logger from './logger'
import Package from './package'
import {extend, isRequest} from './utilities'
import {persist} from './identity'
import {getTimestamp} from './time'

/**
 * Package request instance
 *
 * @type {Object}
 * @private
 */
const _request = Package({
  strategy: 'long',
  continueCb: _continue
})

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
 * Current running state and task timestamp
 *
 * @type {{running: boolean, timestamp: null|number}}
 * @private
 */
const _current = {
  running: false,
  timestamp: null
}

/**
 * Remove from the top and continue running pending requests
 *
 * @returns {Promise}
 * @private
 */
function _continue (result) {
  const wait = result && result.continue_in || null
  return StorageManager.getFirst(_storeName)
    .then(pending => pending ? StorageManager.deleteItem(_storeName, pending.timestamp) : null)
    .then(() => {
      _request.finish()
      _current.running = false
      return run({wait})
    })
}

/**
 * Prepare parameters which are about to be sent with the request
 *
 * @param url
 * @param params
 * @returns {any}
 * @private
 */
function _prepareParams (url, params) {
  const baseParams = isRequest(url, 'event') ? {
    eventCount: ActivityState.current.eventCount
  } : {}

  return extend(baseParams, ActivityState.getParams(), params)
}

/**
 * Correct timestamp if equal or less then previous one to avoid constraint errors
 * Cases when needed:
 * - test environment
 * - when pushing to queue synchronously, one after an other
 *
 * @returns {number}
 * @private
 */
function _prepareTimestamp () {
  let timestamp = Date.now()

  if (timestamp <= _current.timestamp) {
    timestamp = _current.timestamp + 1
  }

  _current.timestamp = timestamp

  return timestamp
}

/**
 * Persist activity state change with session offset reset after session request
 *
 * @param {string} url
 * @returns {Promise}
 * @private
 */
function _persist (url) {

  if (isRequest(url, 'session')) {
    ActivityState.resetSessionOffset()
  }

  ActivityState.updateLastActive()

  return persist()
}

/**
 * Push request to the queue
 *
 * @param {string} url
 * @param {string} method
 * @param {Object=} params
 * @param {boolean=} auto
 * @returns {Promise}
 */
function push ({url, method, params}, auto) {

  ActivityState.updateParams(url, auto)

  params = _prepareParams(url, params)

  const pending = extend({timestamp: _prepareTimestamp()}, {url, method, params})

  return StorageManager.addItem(_storeName, pending)
    .then(() => _persist(url))
    .then(() => _current.running ? {} : run())
}

/**
 * Prepare to send pending request if available
 *
 * @param {number} timestamp
 * @param {string=} url
 * @param {string=} method
 * @param {Object=} params
 * @param {number=} wait
 * @returns {Promise}
 * @private
 */
function _prepareToSend ({timestamp, url, method, params} = {}, wait) {
  const activityState = ActivityState.current || {}
  const firstSession = url === '/session' && !activityState.attribution
  const noPending = !url && !method && !params

  if (_isOffline && !firstSession || noPending) {
    _current.running = false
    return Promise.resolve({})
  }

  return _request.send({
    url,
    method,
    params: extend({}, params, {
      createdAt: getTimestamp(timestamp)
    }),
    wait
  })
}

/**
 * Run all pending requests
 *
 * @param {boolean=false} cleanUp
 * @param {number=} wait
 * @returns {Promise}
 */
function run ({cleanUp, wait} = {}) {
  _current.running = true

  let chain = Promise.resolve({})

  if (cleanUp) {
    chain = chain.then(_cleanUp)
  }

  return chain
    .then(() => StorageManager.getFirst(_storeName))
    .then(pending => _prepareToSend(pending, wait))
}

/**
 * Set offline mode to on or off
 * - if on then all requests are queued
 * - if off then run all pending requests
 *
 * @param {boolean} state
 */
function setOffline (state) {
  if (state === undefined) {
    Logger.error('State not provided, true or false has to be defined')
    return
  }

  if (state === _isOffline) {
    Logger.error(`The app is already in ${(state ? 'offline' : 'online')} mode`)
    return
  }

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
  const upperBound = Date.now() - Config.requestValidityWindow
  return StorageManager.deleteBulk(_storeName, {upperBound})
}

/**
 * Check if there is pending timeout to be flushed
 * i.e. if queue is running
 *
 * @returns {boolean}
 */
function isRunning () {
  return _current.running
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
  _request.clear()
  _current.running = false
  _current.timestamp = null
}

export {
  push,
  run,
  setOffline,
  isRunning,
  clear,
  destroy
}
