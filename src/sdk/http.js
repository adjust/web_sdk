import Config from './config'
import {isEmpty, isObject, isValidJson, isRequest, entries} from './utilities'
import {publish} from './pub-sub'
import defaultParams from './default-params'

const _errors = {
  TRANSACTION_ERROR: 'XHR transaction failed due to an error',
  SERVER_MALFORMED_RESPONSE: 'Response from server is malformed',
  SERVER_INTERNAL_ERROR: 'Internal error occurred on the server',
  SERVER_CANNOT_PROCESS: 'Server was not able to process the request, probably due to error coming from the client',
  NO_CONNECTION: 'No internet connectivity'
}

/**
 * Get filtered response from successful request
 *
 * @param {Object} xhr
 * @param {String} url
 * @returns {Object}
 * @private
 */
function _getSuccessResponse (xhr, url) {
  const response = JSON.parse(xhr.responseText)
  const append = isRequest(url, 'attribution') ? [
    'attribution',
    'message'
  ] : []

  return [
    'adid',
    'timestamp',
    'ask_in',
    'retry_in',
    'tracking_state',
    ...append
  ].filter(key => response[key])
    .reduce((acc, key) => ({...acc, [key]: response[key]}), {})
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
function _getErrorResponse (xhr, code, proceed = false) {
  return {
    action: proceed ? 'CONTINUE' : 'RETRY',
    response: isValidJson(xhr.responseText) ? JSON.parse(xhr.responseText) : xhr.responseText,
    message: _errors[code],
    code
  }
}

/**
 * Encode key-value pairs to be used in url
 *
 * @param {Object} params
 * @param {Object} defaultParams
 * @returns {string}
 * @private
 */
function _encodeParams (params, defaultParams) {
  params = {...Config.getBaseParams(), ...defaultParams, ...params}

  return entries(params)
    .filter(([, value]) => {
      if (isObject(value)) {
        return !isEmpty(value)
      }
      return !!value || (value === 0)
    })
    .map(pair => pair.map((value, index) => {
      if (index === 0) {
        value = value.replace(/([A-Z])/g, ($1) => `_${$1.toLowerCase()}`)
      }

      if (isObject(value)) {
        value = JSON.stringify(value)
      }
      return encodeURIComponent(value)
    }).join('='))
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
function _handleReadyStateChange (reject, resolve, {xhr, url}) {
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
function _prepareUrlAndParams (url, method, params, defaultParams) {
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
function _buildXhr ({url, method = 'GET', params = {}}, defaultParams = {}) {
  const {fullUrl, encodedParams} = _prepareUrlAndParams(url, method, params, defaultParams)

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
 * Intercept response from backend and:
 * - always check if tracking_state is set to `opted_out` and if yes disable sdk
 * - check if ask_in parameter is present in order to check if attribution have been changed
 *
 * @param {Object} result
 * @param {string} result.tracking_state
 * @param {number} result.ask_in
 * @param {Object} options
 * @returns {Object}
 * @private
 */
function _interceptResponse (result, options) {
  const isGdprRequest = isRequest(options.url, 'gdpr_forget_device')
  const isAttributionRequest = isRequest(options.url, 'attribution')
  const isSessionRequest = isRequest(options.url, 'session')
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
export default function http (options) {
  return defaultParams()
    .then(params => _buildXhr(options, params))
    .then(result => _interceptResponse(result, options))
}
