import request from './request'
import {extend, isEmpty} from './utilities'
import {getTimestamp} from './time'
import Config from './config'
import Logger from './logger'
import backOff from './backoff'

const DEFAULT_ATTEMPTS = 0
const DEFAULT_WAIT = 150

const Package = ({url, method = 'GET', params = {}, strategy, continueCb}) => {

  /**
   * Url param per instance
   */
  let _url = url

  /**
   * Method param per instance, defaults to `GET`
   */
  let _method = method

  /**
   * Request params per instance or per request
   */
  let _params = params

  /**
   * Back-off strategy
   */
  const _strategy = strategy

  /**
   * Optional continue callback per instance or per request
   */
  let _continueCb = continueCb

  /**
   * Timeout id to be used for clearing
   *
   * @type {number|null}
   * @private
   */
  let _timeoutId = null

  /**
   * Number of request attempts
   *
   * @type {number}
   * @private
   */
  let _attempts = DEFAULT_ATTEMPTS

  /**
   * Waiting time for the request to be sent
   *
   * @type {number}
   * @private
   */
  let _wait = DEFAULT_WAIT

  /**
   * Flag which marks if request is about to be sent
   *
   * @type {boolean}
   * @private
   */
  let _running = false

  /**
   * Send the request after specified or default waiting period
   *
   * @param {Object=} params
   * @param {number=} wait
   * @param {boolean=false} retrying
   * @param {Function=} continueCb
   * @returns {Promise}
   */
  function send ({params = {}, wait, retrying, continueCb} = {}) {

    _running = true

    if (_timeoutId) {
      clear()
    }

    if (!isEmpty(params)) {
      _params = params
    }

    if (wait) {
      _wait = wait
    }

    if (typeof continueCb === 'function') {
      _continueCb = continueCb
    }

    _params = extend({
      createdAt: getTimestamp(),
    }, _params, Config.baseParams)

    Logger.log(`${retrying ? 'Re-trying' : 'Trying'} request ${_url} in ${_wait}ms`)

    return new Promise(() => {
      _timeoutId = setTimeout(_request, _wait)
    })
  }

  /**
   * Finish the request and clear
   */
  function finish () {

    Logger.log(`Request ${_url} has been finished`)

    _attempts = DEFAULT_ATTEMPTS
    _wait = DEFAULT_WAIT
    _running = false

    clear()
  }

  /**
   * Retry request with optional new waiting period
   *
   * @param {number=} wait
   * @returns {Promise}
   */
  function retry ({wait}) {

    _attempts += 1
    _wait = backOff(_attempts, _strategy)
    _running = false

    clear()

    return send({wait, retrying: true})

  }

  /**
   * Calls custom success callback or finish request if callback not provided
   *
   * @param result
   * @private
   */
  function _continue (result) {
    if (typeof _continueCb === 'function') {
      _continueCb(result)
    } else {
      finish()
    }
  }

  /**
   * Do the request with retry mechanism
   *
   * @returns {Promise}
   * @private
   */
  function _request () {
    return request({
      url: _url,
      method: _method,
      params: _params
    }).then(_continue)
      .catch(retry)
  }

  /**
   * Clear the current request
   */
  function clear () {

    const wasRunning = _running

    clearTimeout(_timeoutId)
    _timeoutId = null
    _running = false

    if (wasRunning) {
      _wait = DEFAULT_WAIT
      _attempts = DEFAULT_ATTEMPTS

      Logger.log(`Previous ${_url} request attempt canceled`)
    }
  }

  return {
    send,
    finish,
    retry,
    clear
  }
}

export default Package


