import config from './config'
import {isEmpty, isObject} from './utilities'

/**
 * Get an error object with necessary data
 *
 * @param {Object} xhr
 * @returns {Object}
 * @private
 */
function _getErrorObject (xhr) {
  return {
    status: xhr.status,
    statusText: xhr.statusText,
    response: JSON.parse(xhr.response),
    responseText: xhr.responseText
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
 * Request factory to perform all kind of api requests
 *
 * @param {string} url
 * @param {string} [method='GET']
 * @param {Object} [params={}]
 * @returns {Promise}
 */
export default function request ({url, method = 'GET', params = {}}) {

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

    xhr.onreadystatechange = () => {

      if (xhr.readyState !== 4) return

      if (xhr.status >= 200 && xhr.status < 300) {
        // TODO expose fixed structure
        resolve(JSON.parse(xhr.response))
      } else {
        reject(_getErrorObject(xhr))
      }
    }

    xhr.onerror = () => reject(_getErrorObject(xhr))

    xhr.send(method === 'GET' ? undefined : encodedParams)

  })
}
