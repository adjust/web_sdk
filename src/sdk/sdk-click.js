import {getHostName} from './utilities'
import {getTimestamp} from './time'
import {push} from './queue'

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
export default function sdkClick () {
  if (_shouldSendClick()) {
    push({
      url: '/sdk_click',
      method: 'POST',
      params: {
        source: 'referrer',
        referrer: window.location.search.substring(1),
        clickTime: getTimestamp()
      }
    })
  }
}
