// @flow
import {getHostName, reducer} from './utilities'
import {getTimestamp} from './time'
import {push} from './queue'

/**
 * Check if user got redirected from another domain
 *
 * @returns {boolean}
 * @private
 */
function _wasRedirected (): boolean {
  const currentUrl = getHostName(window.location.href)
  const referrerUrl = getHostName(document.referrer)

  return !!document.referrer && currentUrl !== referrerUrl
}

/**
 * Check the following:
 * - redirected from somewhere other then client's website
 * - there is adjust_referrer query param
 *
 * @returns {boolean}
 * @private
 */
function _getReferrer (): ?string {
  return _wasRedirected()
    ? window.location.search
      .substring(1)
      .split('&')
      .map(pair => pair.split('='))
      .reduce(reducer, {})['adjust_referrer']
    : null
}

/**
 * Check if there are parameters to send through sdk_click request
 */
export default function sdkClick (): void {
  const referrer = _getReferrer()

  if (referrer) {
    push({
      url: '/sdk_click',
      method: 'POST',
      params: {
        clickTime: getTimestamp(),
        source: 'web_referrer',
        referrer: decodeURIComponent(referrer)
      }
    })
  }
}
