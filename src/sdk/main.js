import Config from './config'
import Queue from './queue'
import {buildList} from './utilities'
import {getTimestamp} from './time'
import {subscribe, destroy as pubSubDestroy} from './pub-sub'
import {watchSession, destroy as sessionDestroy} from './session'

/**
 * Definition of mandatory fields
 *
 * @type {string[]}
 * @private
 */
const _mandatory = [
  'app_token',
  'environment',
  'os_name'
]

/**
 * Initiate the instance with parameters
 *
 * @param {Object} params
 * @param {Function=} cb
 */
function init (params = {}, cb) {

  if (_isInitiated()) {
    throw new Error('You already initiated your instance')
  }

  const missingParamsMessage = _getMissingParams(params)

  if (missingParamsMessage) {
    throw new Error(missingParamsMessage)
  }

  Object.assign(Config.baseParams, params)

  if (typeof cb === 'function') {
    subscribe('attribution:change', cb)
  }

  watchSession()

  Queue.run(true)
}

/**
 * Track event with already initiated instance
 *
 * @param {Object} params
 */
function trackEvent (params = {}) {

  if (!_isInitiated()) {
    throw new Error('You must init your instance')
  }

  Queue.push({
    url: '/event',
    method: 'POST',
    params: Object.assign({
      created_at: getTimestamp()
    }, Config.baseParams, Object.assign({
      event_token: params.eventToken,
      callback_params: _convertToMap(params.callbackParams),
      partner_params: _convertToMap(params.partnerParams),
    }, _getRevenue(params.revenue, params.currency)))
  })
}

/**
 * Destroy the instance
 */
function destroy () {
  sessionDestroy()
  pubSubDestroy()
  _clear()
}

/**
 * Get missing parameters that are defined as mandatory
 *
 * @param {Object} params
 * @returns {string}
 * @private
 */
function _getMissingParams (params) {

  const missing = _mandatory.filter(value => !params[value])

  if (missing.length) {
    return `You must define ${buildList(missing)}`
  }

  return ''
}

/**
 * Check if instance is initiated
 *
 * @returns {boolean}
 * @private
 */
function _isInitiated () {

  const params = Config.baseParams

  return !!(params.app_token && params.environment && params.os_name)
}

/**
 * Clear the instance
 *
 * @private
 */
function _clear () {
  Object.assign(Config.baseParams, {
    app_token: '',
    environment: '',
    os_name: ''
  })
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
 * Convert array like map into object map
 *
 * @param {Array} params
 * @returns {Object}
 * @private
 */
function _convertToMap (params = []) {
  return params.reduce((acc, o) => Object.assign(acc, {[o.key]: o.value}), {})
}

const Adjust = {
  init,
  trackEvent,
  destroy
}

Object.freeze(Adjust)

export default Adjust
