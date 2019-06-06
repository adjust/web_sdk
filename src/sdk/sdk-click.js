import Package from './package'
import {extend, getHostName} from './utilities'

/**
 * Package request instance
 *
 * @type {Object}
 * @private
 */
const _request = Package({
  url: '/sdk_click',
  method: 'POST',
  strategy: 'short'
})

/**
 * Check if user got redirected from another domain
 *
 * @returns {boolean}
 * @private
 */
function _wasRedirected () {
  const currentUrl = getHostName(window.location.href)
  const referrerUrl = getHostName(document.referrer)

  return document.referrer && currentUrl !== referrerUrl
}

/**
 * Read query string and return it as array of [key, value] pairs
 *
 * @returns {Array}
 * @private
 */
function _read () {
  return window.location.search
    .substring(1)
    .split('&')
    .map(pair => pair.split('='))
}

/**
 * Check if there are query params which are prefixed with `adj_` or `adjust_`
 *
 * @returns {boolean}
 * @private
 */
function _hasParams () {
  return _wasRedirected() && _read()
    .some(([key]) => /^(adjust|adj)_/.test(key))
}

/**
 * Get query params as key:value pairs
 *
 * @returns {Object}
 * @private
 */
function _getParams () {
  return _read()
    .reduce((acc, [key, value]) => extend(acc, {[key]: value}), {})
}

/**
 * Check if there are parameters to send through sdk_click request
 */
function check () {
  if (_hasParams()) {
    _request.send({
      params: {
        source: 'referrer',
        referrer: encodeURIComponent(JSON.stringify(_getParams()))
      }
    })
  }
}

/**
 * Destroy sdk_click by clearing running request
 */
function destroy () {
  _request.clear()
}

export {
  check,
  destroy
}
