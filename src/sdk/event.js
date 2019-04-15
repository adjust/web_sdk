import {extend, isEmpty} from './utilities'
import StorageManager from './storage-manager'
import Config from './config'
import {getTimestamp} from './time'
import Queue from './queue'

/**
 * Convert array with key/value item structure into key/value pairs object
 *
 * @param {Array} array
 * @private
 */
function _convertToMap (array = []) {
  return array.reduce((acc, o) => extend(acc, {[o.key]: o.value}), {})
}

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
function _getParams (params, globalCallbackParams = [], globalPartnerParams = []) {

  const baseParams = extend({
    created_at: getTimestamp()
  }, Config.baseParams, {
    event_token: params.event_token,
  }, _getRevenue(params.revenue, params.currency))

  const callbackParams = extend(
    _convertToMap(globalCallbackParams),
    _convertToMap(params.callback_params)
  )
  const partnerParams = extend(
    _convertToMap(globalPartnerParams),
    _convertToMap(params.partner_params)
  )

  return extend(baseParams, {
    callback_params: callbackParams,
    partner_params: partnerParams,
  })
}

/**
 * Add global parameters, either callback or partner params
 *
 * @param {Array} params
 * @param {string} type
 * @returns {Promise}
 */
function addParams (params, type = 'callback') {
  const map = _convertToMap(params)
  const prepared = Object
    .keys(map)
    .map(key => ({key, value: map[key], type}))

  return StorageManager.addBulk('globalParams', prepared, true)
}

/**
 * Track event
 *
 * @param {Object} params
 */
function track (params = {}) {

  if (isEmpty(params) || !params.event_token) {
    throw new Error('You must provide event token in order to track event')
  }

  return Promise.all([
    StorageManager.filterBy('globalParams', 'callback'),
    StorageManager.filterBy('globalParams', 'partner')
  ]).then(([callbackParams, partnerParams]) => {
    Queue.push({
      url: '/event',
      method: 'POST',
      params: _getParams(params, callbackParams, partnerParams)
    })
  })
}

export {
  addParams,
  track
}
