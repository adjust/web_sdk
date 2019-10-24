// @flow
import request from './request'
import {isEmpty} from './utilities'
import {getTimestamp} from './time'
import Logger from './logger'
import backOff, {type StrategyT} from './backoff'

type ResultT = $ReadOnly<{
  continue_in: number,
  retry_in: number,
  ask_in: number
}> // TODO precise result type will be derived from request module
type UrlT = string
type MethodT ='GET' | 'POST' | 'PUT' | 'DELETE'
type ParamsT = {[key: string]: mixed}
type ContinueCbT = (ResultT, () => mixed, (number) => mixed) => mixed
type WaitT = number
type PackageParamsT = {|
  url?: UrlT,
  method?: MethodT,
  params?: ParamsT,
  continueCb?: ?ContinueCbT,
  strategy?: StrategyT,
  wait?: WaitT
|}
type GlobalParamsT = {|
  url: ?UrlT,
  method: MethodT,
  params: ?ParamsT,
  continueCb: ?ContinueCbT
|}
type AttemptsT = number
type StartAtT = number

const DEFAULT_ATTEMPTS: AttemptsT = 0
const DEFAULT_WAIT: WaitT = 150
const MAX_WAIT: WaitT = 0x7FFFFFFF // 2^31 - 1

const Package = ({url, method = 'GET', params = {}, continueCb, strategy, wait}: PackageParamsT = {}) => {
  /**
   * Global param values set on package instantiation and later used for restore
   *
   * @type {{url: string, method: string, params: Object, continueCb: Function}}
   * @private
   */
  let _global: GlobalParamsT = {url, method, params, continueCb}

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
  let _params: ParamsT = {...params}

  /**
   * Optional continue callback per instance or per request
   *
   * @type {Function}
   * @private
   */
  let _continueCb: ?ContinueCbT = continueCb

  /**
   * Back-off strategy
   *
   * @type {string|null}
   * @private
   */
  const _strategy: ?StrategyT = strategy

  /**
   * Timeout id to be used for clearing
   *
   * @type {number|null}
   * @private
   */
  let _timeoutId: ?TimeoutID = null

  /**
   * Number of request attempts
   *
   * @type {number}
   * @private
   */
  let _attempts: AttemptsT = DEFAULT_ATTEMPTS

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
  function _prepareWait (wait?: WaitT): WaitT {
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
  function _prepareParams ({url, method, params, continueCb}: PackageParamsT): void {
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
  function _prepareRequest ({wait, retrying}: {wait?: WaitT, retrying?: boolean}): Promise<ResultT> {
    _wait = wait ? _prepareWait(wait) : _wait

    if (_skip(wait)) {
      return Promise.resolve({})
    }

    if (!_url) {
      Logger.error('You must define url for the request to be sent')
      return Promise.reject({error: 'No url specified'})
    }

    Logger.log(`${retrying ? 'Re-trying' : 'Trying'} request ${_url} in ${_wait}ms`)

    _startAt = Date.now()

    return _request()
  }

  /**
   * Do the timed-out request with retry mechanism
   *
   * @returns {Promise}
   * @private
   */
  function _request (): Promise<ResultT> {
    return new Promise((resolve, reject) => {
      _timeoutId = setTimeout(() => {
        _startAt = null

        return request({
          url: _url,
          method: _method,
          params: {
            attempts: _attempts ? (_attempts + 1) : 1,
            ..._params},
        })
          .then(result => _continue(result, resolve))
          .catch(({response = {}} = {}) => _error(response, resolve, reject))
      }, _wait)
    })
  }

  /**
   * Restore to global parameters
   *
   * @private
   */
  function _restore (): void {
    _url = _global.url
    _method = _global.method
    _params = {..._global.params}
    _continueCb = _global.continueCb
  }

  /**
   * Finish the request by restoring and clearing
   *
   * @param {boolean=false} failed
   * @private
   */
  function _finish (failed?: boolean): void {
    Logger.log(`Request ${_url || 'unknown'} ${failed ? 'failed' : 'has been finished'}`)

    _attempts = DEFAULT_ATTEMPTS
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
  function _retry (wait?: WaitT): Promise<ResultT> {
    _attempts += 1

    clear()

    return _prepareRequest({
      wait: wait || backOff(_attempts, _strategy),
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
  function _continue (result: ResultT, resolve): void {
    result = result || {}

    if (result.retry_in) {
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
   * @param {Object} response
   * @param {Function} resolve
   * @param {Function} reject
   * @private
   */
  function _error (response: ParamsT, resolve, reject): void {
    if (response.code === 'RETRY') {
      resolve(_retry())
      return
    }

    _finish(true)
    reject(response)
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
  function send ({url, method, params = {}, continueCb, wait}: PackageParamsT = {}): Promise<ResultT> {
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
   * Clear the current request
   */
  function clear (): void {
    const stillRunning = !!_startAt

    if (_timeoutId) {
      clearTimeout(_timeoutId)
    }

    _timeoutId = null
    _startAt = null

    if (stillRunning) {
      _wait = DEFAULT_WAIT
      _attempts = DEFAULT_ATTEMPTS

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

export default Package


