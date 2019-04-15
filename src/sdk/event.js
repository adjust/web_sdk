import {extend, isEmpty, convertToMap} from './utilities'
import Config from './config'
import Queue from './queue'
import {getTimestamp} from './time'
import {get} from './global-params'

/**
 * Get revenue value if positive and limit to 5 decimal places
 *
 * @param {number} revenue
 * @param {string} currency
 * @returns {Object}
 * @private
 */
function _getRevenue (revenue, currency) {

  revenue = parseFloat(revenue)

  if (revenue < 0 || !currency) {
    return {}
  }

  return {
    revenue: revenue.toFixed(5),
    currency
  }
}

/**
 * Prepare parameters for the event tracking
 *
 * @param {Object} params
 * @param {string} params.event_token
 * @param {number=} params.revenue
 * @param {string=} params.currency
 * @param {Array=} params.callback_params
 * @param {Array=} params.partner_params
 * @param {Array=} [globalCallbackParams=[]]
 * @param {Array} [globalPartnerParams=[]]
 * @returns {Object}
 * @private
 */
function _prepareParams (params, globalCallbackParams = [], globalPartnerParams = []) {

  const baseParams = extend({
    created_at: getTimestamp()
  }, Config.baseParams, {
    event_token: params.event_token,
  }, _getRevenue(params.revenue, params.currency))

  const callbackParams = extend(
    convertToMap(globalCallbackParams),
    convertToMap(params.callback_params)
  )
  const partnerParams = extend(
    convertToMap(globalPartnerParams),
    convertToMap(params.partner_params)
  )

  return extend(baseParams, {
    callback_params: callbackParams,
    partner_params: partnerParams,
  })
}

/**
 * Track event by sending the request to the server
 *
 * @param {Object} params
 */
export default function event (params = {}) {

  if (isEmpty(params) || !params.event_token) {
    throw new Error('You must provide event token in order to track event')
  }

  return get()
    .then(({callbackParams, partnerParams}) => {
      Queue.push({
        url: '/event',
        method: 'POST',
        params: _prepareParams(params, callbackParams, partnerParams)
      })
    })
}

