import request from './request'
import {buildList} from './utilities'
import {checkAttribution} from './attribution'
import {subscribe} from './pub-sub'

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
 * Available parameters to set
 *
 * @type {{app_token: string, environment: string, os_name: string, device_ids: {}}}
 * @private
 */
let _params = {
  app_token: '',
  environment: '',
  os_name: '',
  device_ids: {},
}

/**
 * Get app token parameter
 *
 * @returns {string}
 */
function getAppToken () {
  return _params.app_token
}

/**
 * Get environment parameter
 *
 * @returns {string}
 */
function getEnvironment () {
  return _params.environment
}

/**
 * Get os name parameter
 *
 * @returns {string}
 */
function getOsName () {
  return _params.os_name
}

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

  _params = Object.assign({}, params)

  if (typeof cb === 'function') {
    subscribe('attribution:changed', cb)
  }

}

/**
 * Track session with already initiated instance
 *
 * @returns {Promise}
 */
function trackSession () {

  if (!_isInitiated()) {
    throw new Error('You must init your instance')
  }

  const params = _getBaseParams()

  return request({
    url: '/session',
    method: 'POST',
    params
  }).then(result => checkAttribution(result, params))
}

/**
 * Track event with already initiated instance
 *
 * @param {Object} params
 * @returns {Promise}
 */
function trackEvent (params = {}) {

  if (!_isInitiated()) {
    throw new Error('You must init your instance')
  }

  return request({
    url: '/event',
    method: 'POST',
    params:  Object.assign(
      _getBaseParams(),
      Object.assign({
        event_token: params.eventToken,
        callback_params: _convertToMap(params.callbackParams),
        partner_params: _convertToMap(params.partnerParams),
      }, _getRevenue(params.revenue, params.currency))
    )
  })
}

/**
 * Destroy the instance
 */
function destroy () {
  _clear()
  // TODO destroy everything else that is needed
}

/**
 * Get base params for api calls
 *
 * @returns {Object}
 * @private
 */
function _getBaseParams () {
  return Object.assign({
    app_token: _params.app_token,
    environment: _params.environment,
    os_name: _params.os_name
  }, _params.device_ids)
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
  return !!(_params.app_token && _params.environment && _params.os_name)
}

/**
 * Clear the instance
 *
 * @private
 */
function _clear () {
  _params = {
    app_token: '',
    environment: '',
    os_name: '',
    device_ids: {},
  }
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
  getAppToken,
  getEnvironment,
  getOsName,
  init,
  trackSession,
  trackEvent,
  destroy
}

Object.freeze(Adjust)

export default Adjust
