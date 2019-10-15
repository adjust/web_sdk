// @flow
import {isEmpty, convertToMap} from './utilities'
import {push} from './queue'
import {type GlobalParamsT, type GlobalParamsObjectT, get} from './global-params'
import Logger from './logger'
import Config from './config'

type keyValueT = {[key: string]: string}

export type EventParamsT = {|
  eventToken: string,
  revenue?: number,
  currency?: string,
  callbackParams?: Array<GlobalParamsT>,
  partnerParams?: Array<GlobalParamsT>
|}

type EventParamsTransformedT = {|
  eventToken: string,
  revenue?: string,
  currency?: string,
  callbackParams?: keyValueT,
  partnerParams?: keyValueT
|}

type RevenueT = {
  revenue: string,
  currency: string
}

/**
 * Get revenue value if positive and limit to 5 decimal places
 *
 * @param {number=} revenue
 * @param {string=} currency
 * @returns {Object}
 * @private
 */
function _getRevenue (revenue: number | void, currency: string | void): RevenueT {
  if (isNaN(revenue)) {
    return {}
  }

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
 * @param {string} params.eventToken
 * @param {number=} params.revenue
 * @param {string=} params.currency
 * @param {Array=} params.callbackParams
 * @param {Array=} params.partnerParams
 * @param {Array} callbackParams
 * @param {Array} partnerParams
 * @returns {Object}
 * @private
 */
function _prepareParams (params: EventParamsT, {callbackParams, partnerParams}: GlobalParamsObjectT): EventParamsTransformedT {
  const globalParams = {}
  const baseParams = {
    eventToken: params.eventToken,
    ..._getRevenue(params.revenue, params.currency)
  }

  const eventCallbackParams: keyValueT = {
    ...convertToMap(callbackParams),
    ...convertToMap(params.callbackParams)
  }
  const eventPartnerParams: keyValueT = {
    ...convertToMap(partnerParams),
    ...convertToMap(params.partnerParams)
  }

  if (!isEmpty(eventCallbackParams)) {
    globalParams.callbackParams = eventCallbackParams
  }

  if (!isEmpty(eventPartnerParams)) {
    globalParams.partnerParams = eventPartnerParams
  }

  return {...baseParams, ...globalParams}
}

/**
 * Track event by sending the request to the server
 *
 * @param {Object} params
 * @return Promise
 */
export default function event (params: EventParamsT): void | Promise<void> {
  if (!Config.isInitialised()) {
    Logger.error('Adjust SDK is not initiated, can not track event')
    return
  }

  if (!params || (params && (isEmpty(params) || !params.eventToken))) {
    Logger.error('You must provide event token in order to track event')
    return
  }

  return get()
    .then(globalParams => {
      push({
        url: '/event',
        method: 'POST',
        params: _prepareParams(params, globalParams)
      })
    })
}

