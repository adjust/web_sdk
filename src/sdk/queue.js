import request from './request'
import backOff from './backoff'
import {getItem, setItem} from './storage'

/**
 * Queue mechanism options
 *
 * @type {{defaultWait: number}}
 *
 * @private
 */
const _options = {
  defaultWait: 150
}

/**
 * Timeout id and wait when pending request is about to happen
 *
 * @type {Object}
 * @private
 */
let _timeout = {id: null, attempts: 0}

/**
 * Remove from the top and continue running pending requests
 *
 * @private
 */
function _continue () {

  const pending = getItem('queue', [])

  pending.shift()

  _timeout.attempts = 0

  setItem('queue', pending)
  setItem('wait', _options.defaultWait)
  run()
}

/**
 * Retry pending request after some time
 *
 * @private
 */
function _retry () {

  _timeout.attempts += 1

  setItem('wait', backOff(_timeout.attempts))
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
 */
function run () {

  const wait = getItem('wait', _options.defaultWait)
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
  }, wait)
}

export default {
  push,
  run
}
