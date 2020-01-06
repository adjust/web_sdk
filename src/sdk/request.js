// @flow
import {
  type HttpSuccessResponseT,
  type HttpErrorResponseT,
  type HttpContinueCbT,
  type BackOffStrategyT,
  type WaitT,
  type UrlT,
  type MethodT,
  type RequestParamsT,
  type HttpRequestParamsT
} from './types'
import http from './http'
import {entries, isEmpty, reducer, isEmptyEntry} from './utilities'
import {getTimestamp} from './time'
import Logger from './logger'
import backOff from './backoff'
import {isConnected} from './listeners'
import {SECOND, HTTP_ERRORS} from './constants'

type RequestConfigT = {|
  url?: UrlT,
  method?: MethodT,
  params?: RequestParamsT,
  continueCb?: HttpContinueCbT,
  strategy?: BackOffStrategyT,
  wait?: ?WaitT
|}

type DefaultConfigT = {|
  url?: UrlT,
  method: MethodT,
  params?: RequestParamsT,
  continueCb?: HttpContinueCbT
|}

type AttemptsT = number
type StartAtT = number

const DEFAULT_ATTEMPTS: AttemptsT = 0
const DEFAULT_WAIT: WaitT = 150
const MAX_WAIT: WaitT = 0x7FFFFFFF // 2^31 - 1
const NO_CONNECTION_WAIT = 60 * SECOND

const Request = ({url, method = 'GET', params = {}, continueCb, strategy, wait}: RequestConfigT = {}) => {
  /**
   * Global param values set on request instantiation and later used for restore
   *
   * @type {{url: string, method: string, params: Object, continueCb: Function}}
   * @private
   */
  let _default: DefaultConfigT = {url, method, params, continueCb}

  /**
   * Url param per instance or per request
   *
   * @type {string}
   * @private
   */
  let _url: ?UrlT = url

  /**
   * Method param per instance or per request, defaults to `GET`
   *
   * @type {string}
   * @private
   */
  let _method: MethodT = method

  /**
   * Request params per instance or per request
   *
   * @type {Object}
   * @private
   */
  let _params: RequestParamsT = {...params}

  /**
   * Optional continue callback per instance or per request
   *
   * @type {Function}
   * @private
   */
  let _continueCb: ?HttpContinueCbT = continueCb

  /**
   * Back-off strategy
   *
   * @type {string|null}
   * @private
   */
  const _strategy: ?BackOffStrategyT = strategy

  /**
   * Timeout id to be used for clearing
   *
   * @type {number|null}
   * @private
   */
  let _timeoutId: ?TimeoutID = null

  /**
   * Number of request and connection attempts
   *
   * @type {{request: number, connection: number}}
   * @private
   */
  const _attempts: {
    request: AttemptsT,
    connection: AttemptsT
  } = {
    request: DEFAULT_ATTEMPTS,
    connection: DEFAULT_ATTEMPTS
  }

  /**
   * Waiting time for the request to be sent
   *
   * @type {number}
   * @private
   */
  let _wait: WaitT = _prepareWait(wait)

  /**
   * Timestamp when the request has been scheduled
   *
   * @type {Date|null}
   * @private
   */
  let _startAt: ?StartAtT = null

  /**
   * Ensure that wait is not more than maximum 32int so it does not cause overflow in setTimeout
   *
   * @param {number} wait
   * @returns {number}
   * @private
   */
  function _prepareWait (wait?: ?WaitT): WaitT {
    wait = wait || DEFAULT_WAIT

    return wait > MAX_WAIT ? MAX_WAIT : wait
  }

  /**
   * Override current parameters if available
   *
   * @param {string=} url
   * @param {string=} method
   * @param {Object=} params
   * @param {Function=} continueCb
   * @private
   */
  function _prepareParams ({url, method, params, continueCb}: RequestConfigT): void {
    if (url) {
      _url = url
    }

    if (method) {
      _method = method
    }

    if (!isEmpty(params)) {
      _params = {...params}
    }

    _params = {
      createdAt: getTimestamp(),
      ..._params
    }

    if (typeof continueCb === 'function') {
      _continueCb = continueCb
    }
  }

  /**
   * Clear previous attempt if new one is about to happen faster
   *
   * @param {number} wait
   * @returns {boolean}
   * @private
   */
  function _skip (wait: ?WaitT): boolean {
    if (!_startAt) {
      return false
    }

    if (_timeoutId) {
      const remainingTime = _wait - (Date.now() - _startAt)

      if (wait && remainingTime < wait) {
        return true
      }

      clear()
    }

    return false
  }

  /**
   * Prepare request to be sent away
   *
   * @param {number=} wait
   * @param {boolean=false} retrying
   * @returns {Promise}
   * @private
   */
  function _prepareRequest ({wait, retrying}: {wait?: ?WaitT, retrying?: boolean}): Promise<HttpSuccessResponseT | HttpErrorResponseT> {
    _wait = wait ? _prepareWait(wait) : _wait

    if (_skip(wait)) {
      return Promise.resolve({
        status: 'error',
        action: 'CONTINUE',
        response: '',
        message: HTTP_ERRORS['SKIP'],
        code: 'SKIP'
      })
    }

    if (!_url) {
      Logger.error('You must define url for the request to be sent')
      return Promise.reject({
        status: 'error',
        action: 'CONTINUE',
        response: '',
        message: HTTP_ERRORS['MISSING_URL'],
        code: 'MISSING_URL'
      })
    }

    Logger.log(`${retrying ? 'Re-trying' : 'Trying'} request ${_url} in ${_wait}ms`)

    _startAt = Date.now()

    return _preRequest({
      url: _url,
      method: _method,
      params: {
        attempts: 1,
        ..._params
      }
    })
  }

  /**
   * Check if there is internet connect and if not then setup the timeout
   *
   * @param {Object} options
   * @returns {Promise}
   * @private
   */
  function _preRequest (options: HttpRequestParamsT): Promise<HttpSuccessResponseT | HttpErrorResponseT> {
    _clearTimeout()

    if (isConnected()) {
      return _request(options)
    }

    _attempts.connection += 1

    Logger.log(`No internet connectivity, trying request ${options.url} in ${NO_CONNECTION_WAIT}ms`)

    return new Promise(resolve => {
      _timeoutId = setTimeout(() => {
        resolve(_preRequest(options))
      }, NO_CONNECTION_WAIT)
    })
  }

  /**
   * Do the timed-out request with retry mechanism
   *
   * @param {Object} options
   * @returns {Promise}
   * @private
   */
  function _request (options: HttpRequestParamsT): Promise<HttpSuccessResponseT | HttpErrorResponseT> {
    return new Promise((resolve, reject) => {
      _timeoutId = setTimeout(() => {
        _startAt = null

        const filteredParams = entries(options.params)
          .filter(([, value]) => isEmptyEntry(value))
          .reduce(reducer, {})

        return http({
          url: options.url,
          method: options.method,
          params: {
            ...filteredParams,
            attempts: (_attempts.request ? (_attempts.request + 1) : 1) + _attempts.connection
          }
        })
          .then(result => _continue(result, resolve))
          .catch(result => _error(result, resolve, reject))
      }, _wait)
    })
  }

  /**
   * Restore to global parameters
   *
   * @private
   */
  function _restore (): void {
    _url = _default.url
    _method = _default.method
    _params = {..._default.params}
    _continueCb = _default.continueCb
  }

  /**
   * Finish the request by restoring and clearing
   *
   * @param {boolean=false} failed
   * @private
   */
  function _finish (failed?: boolean): void {
    Logger.log(`Request ${_url || 'unknown'} ${failed ? 'failed' : 'has been finished'}`)

    _attempts.request = DEFAULT_ATTEMPTS
    _attempts.connection = DEFAULT_ATTEMPTS
    _wait = DEFAULT_WAIT

    _restore()

    clear()
  }

  /**
   * Retry request with optional new waiting period
   *
   * @param {number=} wait
   * @returns {Promise}
   * @private
   */
  function _retry (wait?: WaitT): Promise<HttpSuccessResponseT | HttpErrorResponseT> {
    _attempts.request += 1

    clear()

    return _prepareRequest({
      wait: wait || backOff(_attempts.request, _strategy),
      retrying: true
    })
  }

  /**
   * Decide how to continue, either:
   * - retry if requested
   * - call custom success callback
   * - or finish the request by default
   *
   * @param {Object} result
   * @param {number} result.retry_in
   * @param {Function} resolve
   * @private
   */
  function _continue (result: HttpSuccessResponseT | HttpErrorResponseT, resolve): void {
    if (result && result.retry_in) {
      resolve(_retry(result.retry_in))
      return
    }

    if (typeof _continueCb === 'function') {
      _continueCb(result, _finish, _retry)
    } else {
      _finish()
    }

    resolve(result)
  }

  /**
   * Ensure to resolve on retry and finish request when unknown error
   *
   * @param {Object} result
   * @param {Function} resolve
   * @param {Function} reject
   * @private
   */
  function _error (result: HttpErrorResponseT, resolve, reject): void {
    if (result && result.action === 'RETRY') {
      resolve(_retry(result.code === 'NO_CONNECTION' ? NO_CONNECTION_WAIT : undefined))
      return
    }

    _finish(true)
    reject(result || {})
  }

  /**
   * Send the request after specified or default waiting period
   *
   * @param {string=} url
   * @param {string=} method
   * @param {Object=} params
   * @param {Function=} continueCb
   * @param {number=} wait
   * @returns {Promise}
   */
  function send ({url, method, params = {}, continueCb, wait}: RequestConfigT = {}): Promise<HttpSuccessResponseT | HttpErrorResponseT> {
    _prepareParams({url, method, params, continueCb})

    return _prepareRequest({wait})
  }

  /**
   * Check if request is running
   *
   * @returns {boolean}
   */
  function isRunning (): boolean {
    return !!_timeoutId
  }

  /**
   * Clear request/connection timeout
   *
   * @private
   */
  function _clearTimeout (): void {
    if (_timeoutId) {
      clearTimeout(_timeoutId)
    }

    _timeoutId = null
  }

  /**
   * Clear the current request
   */
  function clear (): void {
    const stillRunning = !!_startAt

    _clearTimeout()
    _startAt = null

    if (stillRunning) {
      _wait = DEFAULT_WAIT
      _attempts.request = DEFAULT_ATTEMPTS
      _attempts.connection = DEFAULT_ATTEMPTS

      Logger.log(`Previous ${_url || 'unknown'} request attempt canceled`)

      _restore()
    }
  }

  return {
    send,
    isRunning,
    clear
  }
}

export default Request


