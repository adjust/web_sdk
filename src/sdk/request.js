import Config from './config'
import {extend, isEmpty, isObject, isValidJson} from './utilities'
import {getTimestamp} from './time'
import {checkAttribution} from './attribution'
import {updateLastActive} from './identity'
import {publish} from './pub-sub'
import ActivityState from './activity-state'

/**
 * Check if attribution requst
 *
 * @param {string} url
 * @returns {boolean}
 * @private
 */
function _isAttributionRequest (url) {
  return /\/attribution/.test(url)
}

/**
 * Get filtered response from successful request
 *
 * @param {Object} xhr
 * @param {String} url
 * @returns {Object}
 * @private
 */
function _getSuccessObject (xhr, url) {

  const response = xhr.response ? JSON.parse(xhr.response) : {}
  const append = _isAttributionRequest(url) ? [
    'attribution',
    'message'
  ] : []

  return [
    'adid',
    'timestamp',
    'ask_in',
    'tracking_state',
    ...append
  ].filter(key => response[key])
    .reduce((acc, key) => extend(acc, {[key]: response[key]}), {})
}

/**
 * Get an error object with necessary data
 *
 * @param {Object} xhr
 * @param {boolean=} onlyResponse
 * @returns {Object}
 * @private
 */
function _getErrorObject (xhr, onlyResponse) {

  if (onlyResponse) {
    return JSON.parse(xhr.response)
  }

  const error = {error: 'Unknown error, retry will follow'}

  return {
    status: xhr.status,
    statusText: xhr.statusText,
    response: error,
    responseText: JSON.stringify(error)
  }
}

/**
 * Encode key-value pairs to be used in url
 *
 * @param {Object} params
 * @returns {string}
 * @private
 */
function _encodeParams (params) {

  params = extend({
    createdAt: getTimestamp(),
    sentAt: getTimestamp()
  }, params)

  params.web_uuid = ActivityState.current.uuid
  // TODO this will be remove once backend fully supports web_sdk
  params.gps_adid = params.web_uuid

  return Object
    .entries(params)
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

  if (xhr.readyState !== 4) return

  if (xhr.status >= 200 && xhr.status < 300) {
    if (isValidJson(xhr.response)) {
      resolve(_getSuccessObject(xhr, url))
    } else {
      reject(_getErrorObject(xhr))
    }
  } else if (xhr.status === 0) {
    reject(_getErrorObject(xhr))
  } else {
    resolve(_getErrorObject(xhr, true))
  }

}

/**
 * Build xhr to perform all kind of api requests
 *
 * @param {string} url
 * @param {string} [method='GET']
 * @param {Object} [params={}]
 * @returns {Promise}
 */
function _buildXhr ({url, method = 'GET', params = {}}) {

  const encodedParams = _encodeParams(params)

  let fullUrl = Config.baseUrl + url

  if (method === 'GET') {
    fullUrl += `?${encodedParams}`
  }

  return new Promise((resolve, reject) => {

    let xhr = new XMLHttpRequest()

    xhr.open(method, fullUrl, true)
    xhr.setRequestHeader('Client-SDK', Config.version)
    if (method === 'POST') {
      xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded')
    }

    xhr.onreadystatechange = () => _handleReadyStateChange(reject, resolve, {xhr, url})
    xhr.onerror = () => reject(_getErrorObject(xhr))

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
function _interceptResponse (result = {}, options) {

  if (result.tracking_state === 'opted_out') {
    publish('sdk:gdpr-forget-me', true)
    return result
  }

  if (!_isAttributionRequest(options.url) && result.ask_in) {
    checkAttribution(result)
  }

  return result
}

/**
 * Request factory to perform all kind of api requests
 *
 * @param {Object} options
 * @returns {Promise}
 */
export default function request (options) {
  return _buildXhr(options)
    .then(result => _interceptResponse(result, options))
    .then(result => {
      updateLastActive()
      return result
    })
}
