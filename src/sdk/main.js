import Config from './config'
import Queue from './queue'
import StorageManager from './storage-manager'
import {buildList, extend} from './utilities'
import {subscribe, destroy as pubSubDestroy} from './pub-sub'
import {watchSession, destroy as sessionDestroy} from './session'
import {startActivityState, destroy as identityDestroy} from './identity'
import {add, remove, removeAll} from './global-params'
import event from './event'

/**
 * Definition of mandatory fields
 *
 * @type {string[]}
 * @private
 */
const _mandatory = [
  'appToken',
  'environment'
]

/**
 * Initiate the instance with parameters
 *
 * @param {Object} params
 */
function init (params = {}) {

  if (_isInitiated()) {
    throw new Error('You already initiated your instance')
  }

  const missingParamsMessage = _getMissingParams(params)

  if (missingParamsMessage) {
    throw new Error(missingParamsMessage)
  }

  _start(params)
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

  event(params)
}

/**
 * Add global callback parameters
 *
 * @param {Array} params
 * @returns {Promise}
 */
function addGlobalCallbackParameters (params) {
  return add(params, 'callback')
}

/**
 * Add global partner parameters
 *
 * @param {Array} params
 * @returns {Promise}
 */
function addGlobalPartnerParameters (params) {
  return add(params, 'partner')
}

/**
 * Remove global callback parameter by key
 *
 * @param {string} key
 * @returns {Promise}
 */
function removeGlobalCallbackParameter (key) {
  return remove(key, 'callback')
}

/**
 * Remove global partner parameter by key
 *
 * @param {string} key
 * @returns {Promise}
 */
function removePartnerCallbackParameter (key) {
  return remove(key, 'partner')
}

/**
 * Remove all global callback parameters
 *
 * @returns {Promise}
 */
function removeAllGlobalCallbackParameters () {
  return removeAll('callback')
}

/**
 * Remove all global partner parameters
 *
 * @returns {Promise}
 */
function removeAllGlobalPartnerParameters () {
  return removeAll('partner')
}

/**
 * Set offline mode to on or off
 *
 * @param {boolean} state
 */
function setOfflineMode (state) {
  Queue.setOfflineMode(state)
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

  return _mandatory.reduce((acc, key) => acc && !!params[key], true)
}

/**
 * Start the execution by preparing the environment for the current usage
 * - subscribe to the attribution change
 * - register activity state if doesn't exist
 * - run the package queue if not empty
 * - start watching the session
 *
 * @param {Object} params
 * @param {string} params.appToken
 * @param {string} params.environment
 * @param {Function=} params.attributionCallback
 * @private
 */
function _start (params = {}) {

  _mandatory.forEach(key => {
    extend(Config.baseParams, {[key]: params[key]})
  })

  if (typeof params.attributionCallback === 'function') {
    subscribe('attribution:change', params.attributionCallback)
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
  Config.clear()
}

const Adjust = {
  init,
  trackEvent,
  addGlobalCallbackParameters,
  addGlobalPartnerParameters,
  removeGlobalCallbackParameter,
  removePartnerCallbackParameter,
  removeAllGlobalCallbackParameters,
  removeAllGlobalPartnerParameters,
  setOfflineMode,
  destroy
}

Object.freeze(Adjust)

export default Adjust
