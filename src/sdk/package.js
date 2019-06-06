import request from './request'
import {extend, isEmpty} from './utilities'
import {getTimestamp} from './time'
import Config from './config'
import Logger from './logger'
import backOff from './backoff'

const DEFAULT_ATTEMPTS = 0
const DEFAULT_WAIT = 150

const Package = ({url, method = 'GET', params = {}, continueCb, strategy}) => {

  /**
   * Url param per instance or per request
   *
   * @type {{current: string, global: string}}
   * @private
   */
  let _url = {current: url, global: url}

  /**
   * Method param per instance or per request, defaults to `GET`
   *
   * @type {{current: string, global: string}}
   * @private
   */
  let _method = {current: method, global: method}

  /**
   * Request params per instance or per request
   *
   * @type {{current: Object, global: Object}}
   * @private
   */
  let _params = {current: extend({}, params), global: extend({}, params)}

  /**
   * Optional continue callback per instance or per request
   *
   * @type {{current: Function, global: Function}}
   * @private
   */
  let _continueCb = {current: continueCb, global: continueCb}

  /**
   * Back-off strategy
   *
   * @type {string|null}
   * @private
   */
  const _strategy = strategy

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
   * Override current parameters if available
   *
   * @param {string=} url
   * @param {string=} method
   * @param {Object=} params
   * @param {Function=} continueCb
   * @private
   */
  function _prepare ({url, method, params = {}, continueCb}) {
    if (url) {
      _url.current = url
    }

    if (method) {
      _method.current = method
    }

    if (!isEmpty(params)) {
      _params.current = extend({}, params)
    }

    if (typeof continueCb === 'function') {
      _continueCb.current = continueCb
    }
  }

  /**
   * Restore to global parameters
   *
   * @private
   */
  function _restore () {

    _url.current = _url.global
    _method.current = _method.global
    _params.current = extend({}, _params.global)
    _continueCb.current = _continueCb.global
  }

  /**
   * Send the request after specified or default waiting period
   *
   * @param {string=} url
   * @param {string=} method
   * @param {Object=} params
   * @param {Function=} continueCb
   * @param {number=} wait
   * @param {boolean=false} retrying
   * @returns {Promise}
   */
  function send ({url, method, params = {}, continueCb, wait, retrying} = {}) {

    if (!_url.current && !url) {
      Logger.error('You must define url for the request to be sent')
      return Promise.reject({error: 'No url specified'})
    }

    _prepare({url, method, params, continueCb})

    return _request({wait, retrying})
  }

  /**
   * Finish the request by restoring and clearing
   */
  function finish () {

    Logger.log(`Request ${_url.current} has been finished`)

    _attempts = DEFAULT_ATTEMPTS
    _wait = DEFAULT_WAIT
    _running = false

    _restore()

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

    return _request({wait, retrying: true})
  }

  /**
   * Calls custom success callback or finish request when callback not provided
   *
   * @param {Object} result
   * @param {Function} resolve
   * @private
   */
  function _continue (result, resolve) {
    if (typeof _continueCb.current === 'function') {
      _continueCb.current(result)
    } else {
      finish()
    }

    resolve(result)
  }

  /**
   * Do the timed-out request with retry mechanism
   *
   * @param {number=} wait
   * @param {boolean=false} retrying
   * @returns {Promise}
   * @private
   */
  function _request ({wait, retrying}) {

    _running = true

    if (_timeoutId) {
      clear()
    }

    if (wait) {
      _wait = wait
    }

    Logger.log(`${retrying ? 'Re-trying' : 'Trying'} request ${_url.current} in ${_wait}ms`)

    return new Promise((resolve) => {
      _timeoutId = setTimeout(() => {
        return request({
          url: _url.current,
          method: _method.current,
          params: extend({
            createdAt: getTimestamp()
          }, _params.current, Config.baseParams)
        }).then((result) => _continue(result, resolve))
          .catch(retry)
      }, _wait)
    })
  }

  /**
   * Check if request is running
   *
   * @returns {boolean}
   */
  function isRunning () {
    return _running && !!_timeoutId
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

      Logger.log(`Previous ${_url.current} request attempt canceled`)

      _restore()
    }
  }

  return {
    send,
    finish,
    retry,
    isRunning,
    clear
  }
}

export default Package


