// @flow
import {type SdkClickRequestParamsT} from './types'
import {reducer} from './utilities'
import {getTimestamp} from './time'
import {push} from './queue'

/**
 * Check the following:
 * - redirected from somewhere other then client's website
 * - there is adjust_referrer query param
 *
 * @returns {boolean}
 * @private
 */
function _getReferrer (): ?string {
  return window.location.search
    .substring(1)
    .split('&')
    .map(pair => pair.split('='))
    .reduce(reducer, {})['adjust_referrer']
}

/**
 * Prepare params for the sdk click request
 *
 * @param {string} referrer
 * @returns {Object}
 * @private
 */
function _prepareParams (referrer): SdkClickRequestParamsT {
  return {
    clickTime: getTimestamp(),
    source: 'web_referrer',
    referrer: decodeURIComponent(referrer)
  }
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
      params: _prepareParams(referrer)
    })
  }
}
