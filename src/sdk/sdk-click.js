import Package from './package'
import {extend} from './utilities'

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
  return _read()
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
