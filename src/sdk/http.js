// @flow
import {
  type UrlT,
  type DefaultParamsT,
  type HttpSuccessResponseT,
  type HttpErrorResponseT,
  type HttpRequestParamsT,
  type ErrorCodeT
} from './types'
import {HTTP_ERRORS} from './constants'
import Config from './config'
import {isObject, isValidJson, isRequest, entries, isEmptyEntry} from './utilities'
import {publish} from './pub-sub'
import defaultParams from './default-params'

type ParamsWithAttemptsT = $PropertyType<HttpRequestParamsT, 'params'>

/**
 * Get filtered response from successful request
 *
 * @param {Object} xhr
 * @param {String} url
 * @returns {Object}
 * @private
 */
function _getSuccessResponse (xhr: XMLHttpRequest, url: UrlT): HttpSuccessResponseT {
  const result = JSON.parse(xhr.responseText)
  let response = {
    status: 'success',
    adid: result.adid,
    timestamp: result.timestamp,
    ask_in: result.ask_in,
    retry_in: result.retry_in,
    continue_in: result.continue_in,
    tracking_state: result.tracking_state,
    attribution: undefined,
    message: undefined
  }

  if (isRequest(url, 'attribution')) {
    response.attribution = result.attribution
    response.message = result.message
  }

  return response
}

/**
 * Get an error object which is about to be passed to resolve or reject method
 *
 * @param {Object} xhr
 * @param {string} code
 * @param {boolean=} proceed
 * @returns {Object}
 * @private
 */
function _getErrorResponse (xhr: XMLHttpRequest, code: ErrorCodeT, proceed: boolean = false): HttpErrorResponseT {
  return {
    status: 'error',
    action: proceed ? 'CONTINUE' : 'RETRY',
    response: isValidJson(xhr.responseText) ? JSON.parse(xhr.responseText) : xhr.responseText,
    message: HTTP_ERRORS[code],
    code
  }
}

/**
 * Encode parameter depending on the type
 *
 * @param {string} key
 * @param {*} value
 * @returns {string}
 * @private
 */
function _encodeParam ([key, value]: [$Keys<ParamsWithAttemptsT>, $Values<ParamsWithAttemptsT>]): string {
  const encodedKey = encodeURIComponent(key.replace(/([A-Z])/g, ($1) => `_${$1.toLowerCase()}`))
  let encodedValue = value

  if (typeof value === 'string') {
    encodedValue = encodeURIComponent(value)
  }

  if (isObject(value)) {
    encodedValue = encodeURIComponent(JSON.stringify(value) || '')
  }

  return [encodedKey, encodedValue].join('=')
}

/**
 * Encode key-value pairs to be used in url
 *
 * @param {Object} params
 * @param {Object} defaultParams
 * @returns {string}
 * @private
 */
function _encodeParams (params: ParamsWithAttemptsT, defaultParams: DefaultParamsT): string {
  return entries({...Config.getBaseParams(), ...defaultParams, ...params})
    .filter(([, value]) => isEmptyEntry(value))
    .map(_encodeParam)
    .join('&')
}

/**
 * Handle xhr response from server
 *
 * @param {Function} reject
 * @param {Function} resolve
 * @param {Object} xhr
 * @param {string} url
 * @private
 */
function _handleReadyStateChange (reject, resolve, {xhr, url}: {xhr: XMLHttpRequest, url: UrlT}) {
  if (xhr.readyState !== 4) {
    return
  }

  const okStatus = xhr.status >= 200 && xhr.status < 300
  const validJson = isValidJson(xhr.responseText)

  if (xhr.status === 0) {
    reject(_getErrorResponse(xhr, 'NO_CONNECTION'))
  } else {
    if (validJson) {
      return okStatus
        ? resolve(_getSuccessResponse(xhr, url))
        : resolve(_getErrorResponse(xhr, 'SERVER_CANNOT_PROCESS', true))
    } else {
      return okStatus
        ? reject(_getErrorResponse(xhr, 'SERVER_MALFORMED_RESPONSE'))
        : reject(_getErrorResponse(xhr, 'SERVER_INTERNAL_ERROR'))
    }
  }
}

/**
 * Prepare url and params depending on the resource type
 *
 * @param {string} url
 * @param {string} method
 * @param {Object} params
 * @param {Object} defaultParams
 * @returns {{encodedParams: string, fullUrl: string}}
 * @private
 */
function _prepareUrlAndParams ({url, method, params}: HttpRequestParamsT, defaultParams: DefaultParamsT): {fullUrl: string, encodedParams: string} {
  const encodedParams = _encodeParams(params, defaultParams)
  const base = url === '/gdpr_forget_device' ? 'gdpr' : 'app'
  const customConfig = Config.getCustomConfig()
  const baseUrl = customConfig.customUrl || Config.baseUrl[base]

  return {
    fullUrl: baseUrl + url + (method === 'GET' ? `?${encodedParams}` : ''),
    encodedParams
  }
}

/**
 * Build xhr to perform all kind of api requests
 *
 * @param {string} url
 * @param {string} [method='GET']
 * @param {Object} [params={}]
 * @param {Object} defaultParams
 * @returns {Promise}
 */
function _buildXhr ({url, method = 'GET', params = {}}: HttpRequestParamsT, defaultParams: DefaultParamsT): Promise<HttpSuccessResponseT | HttpErrorResponseT> {
  const {fullUrl, encodedParams} = _prepareUrlAndParams({url, method, params}, defaultParams)

  return new Promise((resolve, reject) => {
    let xhr = new XMLHttpRequest()

    xhr.open(method, fullUrl, true)
    xhr.setRequestHeader('Client-SDK', `js${Config.version}`)
    if (method === 'POST') {
      xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded')
    }

    xhr.onreadystatechange = () => _handleReadyStateChange(reject, resolve, {xhr, url})
    xhr.onerror = () => reject(_getErrorResponse(xhr, 'TRANSACTION_ERROR'))

    xhr.send(method === 'GET' ? undefined : encodedParams)
  })
}

/**
 * Intercept response from backend
 *
 * @param {Object} result
 * @param {string} result.status
 * @param {string} url
 * @returns {Object}
 * @private
 */
function _interceptResponse (result: HttpSuccessResponseT | HttpErrorResponseT, url: UrlT): HttpSuccessResponseT | HttpErrorResponseT {
  if (result.status === 'success') {
    return _interceptSuccess(result, url)
  }

  return result
}

/**
 * Intercept successful response from backend and:
 * - always check if tracking_state is set to `opted_out` and if yes disable sdk
 * - check if ask_in parameter is present in order to check if attribution have been changed
 * - emit session finish event if session request
 *
 * @param {Object} result
 * @param {string} result.tracking_state
 * @param {number} result.ask_in
 * @param {string} url
 * @returns {Object}
 * @private
 */
function _interceptSuccess (result: HttpSuccessResponseT, url): HttpSuccessResponseT {
  const isGdprRequest = isRequest(url, 'gdpr_forget_device')
  const isAttributionRequest = isRequest(url, 'attribution')
  const isSessionRequest = isRequest(url, 'session')
  const optedOut = result.tracking_state === 'opted_out'

  if (!isGdprRequest && optedOut) {
    publish('sdk:gdpr-forget-me', true)
    return result
  }

  if (!isAttributionRequest && !isGdprRequest && !optedOut && result.ask_in) {
    publish('attribution:check', result)
  }

  if (isSessionRequest) {
    publish('session:finished', result)
  }

  return result
}

/**
 * Http request factory to perform all kind of api requests
 *
 * @param {Object} options
 * @returns {Promise}
 */
export default function http (options: HttpRequestParamsT): Promise<HttpSuccessResponseT | HttpErrorResponseT> {
  return defaultParams()
    .then(defaultParams => _buildXhr(options, defaultParams))
    .then(result => _interceptResponse(result, options.url))
}
