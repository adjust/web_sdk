import request from './request'
import backOff from './backoff'
import {getItem, setItem} from './storage'
import {timePassed} from './utilities'

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
function _continue () {

  const pending = getItem('queue', [])

  pending.shift()

  setItem('queue', pending)

  _timeout.attempts = 0
  _timeout.wait = 150

  run()
}

/**
 * Retry pending request after some time
 *
 * @private
 */
function _retry () {

  _timeout.attempts += 1
  _timeout.wait = backOff(_timeout.attempts)

  run()
}

/**
 * Push request to the queue
 *
 * @param {string} url
 * @param {string} method
 * @param {Object} params
 */
function push ({url, method, params}) {

  const pending = getItem('queue', [])

  pending.push({url, method, params})

  setItem('queue', pending)

  if (!_timeout.id) {
    run()
  }

}

/**
 * Run all pending requests
 * @param {boolean} cleanUpFirst
 */
function run (cleanUpFirst) {

  if (cleanUpFirst) {
    _cleanUp()
  }

  const pending = getItem('queue', [])
  const params = pending[0]

  clearTimeout(_timeout.id)
  _timeout.id = null

  if (!params) {
    return
  }

  _timeout.id = setTimeout(() => {
    return request(params)
      .then(_continue)
      .catch(_retry)
  }, _timeout.wait)
}

/**
 * Clean up stale pending requests
 *
 * @private
 */
function _cleanUp () {

  const pending = getItem('queue', [])

  setItem('queue', pending.filter(call => {
    return timePassed(call.params.created_at, Date.now()) <= 28
  }))
}

export default {
  push,
  run
}
