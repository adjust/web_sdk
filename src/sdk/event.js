// @flow
import {
  type EventParamsT,
  type EventRequestParamsT,
  type GlobalParamsMapT,
  type GlobalKeyValueParamsT
} from './types'
import {isEmpty, convertToMap} from './utilities'
import {push} from './queue'
import {get as getGlobalParams} from './global-params'
import Storage from './storage/storage'
import Logger from './logger'
import Config from './config'

type RevenueT = {
  revenue: string,
  currency: string
}

const DEFAULT_EVENT_DEDUPLICATION_LIST_LIMIT = 10

/**
 * Name of the store used by event deduplication ids
 *
 * @type {string}
 * @private
 */
const _storeName = 'eventDeduplication'

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
function _prepareParams (params: EventParamsT, {callbackParams, partnerParams}: $ReadOnly<GlobalParamsMapT>): EventRequestParamsT {
  const globalParams = {}
  const baseParams = {
    eventToken: params.eventToken,
    deduplicationId: params.deduplicationId,
    ..._getRevenue(params.revenue, params.currency)
  }

  const eventCallbackParams: GlobalKeyValueParamsT = {
    ...convertToMap(callbackParams),
    ...convertToMap(params.callbackParams)
  }
  const eventPartnerParams: GlobalKeyValueParamsT = {
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
 * Get event deduplication ids
 *
 * @returns {Promise}
 * @private
 */
function _getEventDeduplicationIds (): Promise<Array<string>> {
  return Storage.getAll(_storeName)
    .then(records => records.map(record => record.id))
}

/**
 * Push event deduplication id and trim the store if out of the limit
 *
 * @param {string} id
 * @returns {Promise}
 * @private
 */
function _pushEventDeduplicationId (id: string): Promise<number> {
  const customLimit = Config.getCustomConfig().eventDeduplicationListLimit
  const limit = customLimit > 0 ? customLimit : DEFAULT_EVENT_DEDUPLICATION_LIST_LIMIT

  return Storage.count(_storeName)
    .then(count => {
      let chain = Promise.resolve()

      if (count >= limit) {
        const removeLength = count - limit + 1
        Logger.log(`Event deduplication list limit has been reached. Oldest ids are about to be removed (${removeLength} of them)`)
        chain = Storage.trimItems(_storeName, removeLength)
      }

      return chain
    })
    .then(() => {
      Logger.info(`New event deduplication id is added to the list: ${id}`)
      return Storage.addItem(_storeName, {id})
    })
}

/**
 * Check if deduplication id is already stored
 * - if yes then reject
 * - if not then push the id into storage
 *
 * @param {string=} id
 * @returns {Promise}
 * @private
 */
function _checkEventDeduplicationId (id?: string): Promise<?number> {
  if (!id) {
    return Promise.resolve()
  }

  return _getEventDeduplicationIds()
    .then(list => {
      return list.indexOf(id) === -1
        ? _pushEventDeduplicationId(id)
        : Promise.reject({message: `Event won't be tracked, since it was previously tracked with the same deduplication id ${id}`})
    })
}

/**
 * Track event by sending the request to the server
 *
 * @param {Object} params
 * @param {number=} timestamp
 * @return Promise
 */
export default function event (params: EventParamsT, timestamp?: number): void | Promise<void> {
  if (!params || (params && (isEmpty(params) || !params.eventToken))) {
    Logger.error('You must provide event token in order to track event')
    return
  }

  return _checkEventDeduplicationId(params.deduplicationId)
    .then(getGlobalParams)
    .then(globalParams => {
      push({
        url: '/event',
        method: 'POST',
        params: _prepareParams(params, globalParams)
      }, {timestamp})
    })
    .catch(error => {
      if (error && error.message) {
        Logger.error(error.message)
      }
    })

}

