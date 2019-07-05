import {MINUTE, SECOND, DAY} from './constants'
import {extend, buildList} from './utilities'
import Logger from './logger'

/**
 * Base parameters set by client
 * - app token
 * - environment
 * - default tracker
 *
 * @type {Object}
 * @private
 */
let _baseParams = {}

/**
 * Mandatory fields to set for sdk initialization
 *
 * @type {string[]}
 * @private
 */
const _mandatory = [
  'appToken',
  'environment'
]

/**
 * Allowed fields to set for sdk initialization
 *
 * @type {string[]}
 * @private
 */
const _fields = [
  ..._mandatory,
  'defaultTracker'
]

/**
 * Global configuration object used across the sdk
 *
 * @type {{
 * namespace: string,
 * version: string,
 * baseUrl: {app: string, gdpr: string},
 * sessionWindow: number,
 * sessionTimerWindow: number,
 * requestValidityWindow: number,
 * baseParams: Object
 * }}
 */
const _baseConfig = {
  namespace: __ADJUST__NAMESPACE,
  version: `js${__ADJUST__SDK_VERSION}`,
  baseUrl: {
    app: 'https://app.adjust.com',
    gdpr: 'https://gdpr.adjust.com'
  },
  sessionWindow: 30 * MINUTE,
  sessionTimerWindow: 60 * SECOND,
  requestValidityWindow: 28 * DAY
}

/**
 * Check of configuration has been initialized
 *
 * @returns {boolean}
 */
function isInitialised () {
  return _mandatory.reduce((acc, key) => acc && !!_baseParams[key], true)
}

/**
 * Get base params set by client
 *
 * @returns {any}
 * @private
 */
function _getParams () {
  return extend({}, _baseParams)
}

/**
 * Set base params for the sdk to run
 *
 * @param {Object} params
 * @private
 */
function _setParams (params) {

  if (hasMissing(params)) {
    return
  }

  _fields.forEach(key => {
    extend(_baseParams, {[key]: params[key]})
  })
}

/**
 * Check if there are  missing mandatory parameters
 *
 * @param {Object} params
 * @returns {boolean}
 * @private
 */
function hasMissing (params) {

  const missing = _mandatory.filter(value => !params[value])

  if (missing.length) {
    Logger.error(`You must define ${buildList(missing)}`)
    return true
  }

  return false
}

/**
 * Restore config to its default state
 */
function destroy () {
  _baseParams = {}
}

const Config = extend(_baseConfig, {
  isInitialised,
  hasMissing,
  destroy
})

Object.defineProperty(Config, 'baseParams', {
  get () { return _getParams() },
  set (params) { return _setParams(params) }
})

export default Config
