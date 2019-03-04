import config from './config'
import {isEmpty, isObject, isValidJson} from './utilities'
import {getTimestamp} from './time'
import {checkAttribution} from './attribution'

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
  const append = _isAttributionRequest(url) ? ['attribution', 'message'] : []

  return ['adid', 'timestamp', 'ask_in', ...append]
    .filter(key => response[key])
    .reduce((acc, key) => Object.assign(acc, {[key]: response[key]}), {})
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

  const baseParams = params.base || {}
  const otherParams = params.other || {}
  const autoParams = {
    created_at: getTimestamp(),
    sent_at: getTimestamp()
  }

  params = params.base
    ? Object.assign(autoParams, baseParams, otherParams)
    : Object.assign(autoParams, params)

  return Object
    .entries(params)
    .filter(pair => {
      if (isObject(pair[1])) {
        return !isEmpty(pair[1])
      }
      return !!pair[1] || (pair[1] === 0)
    })
    .map(pair => pair.map(value => {
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

  url = config.baseUrl + url

  if (method === 'GET') {
    url += `?${encodedParams}`
  }

  return new Promise((resolve, reject) => {

    let xhr = new XMLHttpRequest()

    xhr.open(method, url, true)
    xhr.setRequestHeader('Client-SDK', config.version)
    if (method === 'POST') {
      xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded')
    }

    xhr.onreadystatechange = () => _handleReadyStateChange(reject, resolve, {xhr, url})
    xhr.onerror = () => reject(_getErrorObject(xhr))

    xhr.send(method === 'GET' ? undefined : encodedParams)

  })
}

/**
 * Check attribution asynchronously and pass the previous result immediately
 *
 * @param {Object} result
 * @param {Object} options
 * @returns {Object}
 * @private
 */
function _checkAttribution (result, options) {

  if (!_isAttributionRequest(options.url) && result.ask_in) {
    checkAttribution(result, options.params)
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
    .then(result => _checkAttribution(result, options))
}
