import Config from './config'
import request from './request'
import backOff from './backoff'
import StorageManager from './storage-manager'
import {extend} from './utilities'

/**
 * Timeout id and wait when pending request is about to happen
 *
 * @type {Object}
 * @private
 */
let _timeout = {id: null, attempts: 0, wait: 150}

/**
 * Remove from the top and continue running pending requests
 *
 * @private
 */
function _continue (timestamp) {
  return StorageManager.deleteItem('queue', timestamp)
    .then(() => {

      _timeout.attempts = 0
      _timeout.wait = 150

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

  return run()
}

/**
 * Push request to the queue
 *
 * @param {string} url
 * @param {string} method
 * @param {Object} params
 */
function push ({url, method, params}) {
  return StorageManager.addItem('queue', extend({timestamp: Date.now()}, {url, method, params}))
    .then(() => _timeout.id ? {} : run())
}

/**
 * Make the request and retry if necessary
 *
 * @param {Object} pending
 * @returns {Promise<any>}
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
 * @returns {Promise}
 * @private
 */
function _delayedRequest (pending) {

  clearTimeout(_timeout.id)
  _timeout.id = null

  if (!pending) {
    return Promise.resolve({})
  }

  return new Promise(() => {
    _timeout.id = setTimeout(() => {
      return _request(pending)
    }, _timeout.wait)
  })
}

/**
 * Run all pending requests
 *
 * @param {boolean=} cleanUpFirst
 */
function run (cleanUpFirst) {

  let chain = Promise.resolve([])

  if (cleanUpFirst) {
    chain = chain.then(_cleanUp)
  }

  return chain
    .then(() => StorageManager.getFirst('queue'))
    .then(_delayedRequest)
}

/**
 * Clean up stale pending requests
 *
 * @private
 * @returns {Promise}
 */
function _cleanUp () {
  return StorageManager.deleteBulk('queue', {upperBound: Date.now() - Config.requestValidityWindow})
}

export default {
  push,
  run
}
