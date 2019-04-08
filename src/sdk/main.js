import Config from './config'
import Queue from './queue'
import StorageManager from './storage-manager'
import {buildList, extend, convertToMap, getRevenue} from './utilities'
import {getTimestamp} from './time'
import {subscribe, destroy as pubSubDestroy} from './pub-sub'
import {watchSession, destroy as sessionDestroy} from './session'
import {startActivityState, destroy as identityDestroy} from './identity'

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

  _start(params, cb)
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
    params: extend({
      created_at: getTimestamp()
    }, Config.baseParams, extend({
      event_token: params.eventToken,
      callback_params: convertToMap(params.callbackParams),
      partner_params: convertToMap(params.partnerParams),
    }, getRevenue(params.revenue, params.currency)))
  })
}

/**
 * Destroy the instance
 */
function destroy () {
  pubSubDestroy()
  sessionDestroy()
  identityDestroy()
  StorageManager.destroy()
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
 * Start the execution by preparing the environment for the current usage
 * - subscribe to the attribution change
 * - register activity state if doesn't exist
 * - run the package queue if not empty
 * - start watching the session
 *
 * @param {Object} params
 * @param {Function=} cb
 * @private
 */
function _start (params = {}, cb) {

  extend(Config.baseParams, params)

  if (typeof cb === 'function') {
    subscribe('attribution:change', cb)
  }

  startActivityState()
    .then(() => {
      Queue.run(true)
      watchSession()
    })
}

/**
 * Clear the instance
 *
 * @private
 */
function _clear () {
  extend(Config.baseParams, {
    app_token: '',
    environment: '',
    os_name: ''
  })
}

const Adjust = {
  init,
  trackEvent,
  destroy
}

Object.freeze(Adjust)

export default Adjust
