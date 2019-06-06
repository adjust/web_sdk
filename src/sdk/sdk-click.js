import Package from './package'
import {getHostName} from './utilities'

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
 * Check the following:
 * - redirected from somewhere other then client's website
 * - there are query params which are prefixed with `adj_` or `adjust_`
 *
 * @returns {boolean}
 * @private
 */
function _shouldSendClick () {
  return _wasRedirected() && window.location.search
    .substring(1)
    .split('&')
    .map(pair => pair.split('='))
    .some(([key]) => /^(adjust|adj)_/.test(key))
}

/**
 * Check if there are parameters to send through sdk_click request
 */
function check () {
  if (_shouldSendClick()) {
    _request.send({
      params: {
        source: 'referrer',
        referrer: window.location.search.substring(1)
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
