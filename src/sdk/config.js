// @flow
import {
  type BaseParamsT,
  type CustomConfigT,
  type InitOptionsT,
  type BaseParamsListT,
  type BaseParamsMandatoryListT,
  type CustomConfigListT
} from './types'
import Globals from './globals'
import {MINUTE, SECOND, DAY} from './constants'
import {buildList, reducer} from './utilities'
import Logger from './logger'

/**
 * Base parameters set by client
 * - app token
 * - environment
 * - default tracker
 * - external device ID
 *
 * @type {Object}
 * @private
 */
let _baseParams: BaseParamsT = {}

/**
 * Custom config set by client
 * - url override
 * - event deduplication list limit
 *
 * @type {Object}
 * @private
 */
let _customConfig: CustomConfigT = {}

/**
 * Mandatory fields to set for sdk initialization
 *
 * @type {string[]}
 * @private
 */
const _mandatory: BaseParamsMandatoryListT = [
  'appToken',
  'environment'
]

/**
 * Allowed params to be sent with each request
 *
 * @type {string[]}
 * @private
 */
const _allowedParams: BaseParamsListT = [
  ..._mandatory,
  'defaultTracker',
  'externalDeviceId'
]

/**
 * Allowed configuration overrides
 *
 * @type {string[]}
 * @private
 */
const _allowedConfig: CustomConfigListT = [
  'customUrl',
  'eventDeduplicationListLimit'
]

/**
 * Global configuration object used across the sdk
 *
 * @type {{
 * namespace: string,
 * version: string,
 * sessionWindow: number,
 * sessionTimerWindow: number,
 * requestValidityWindow: number,
 * baseUrl: {app: string, gdpr: string}
 * }}
 */
const _baseConfig = {
  sessionWindow: 30 * MINUTE,
  sessionTimerWindow: 60 * SECOND,
  requestValidityWindow: 28 * DAY,
  baseUrl: Globals.env === 'test'
    ? {app: 'app', gdpr: 'gdpr'}
    : {app: 'https://app.adjust.com', gdpr: 'https://gdpr.adjust.com'}
}

/**
 * Check of configuration has been initialized
 *
 * @returns {boolean}
 */
function isInitialised (): boolean {
  return _mandatory.reduce((acc, key) => acc && !!_baseParams[key], true)
}

/**
 * Get base params set by client
 *
 * @returns {Object}
 */
function getBaseParams (): BaseParamsT {
  return {..._baseParams}
}

/**
 * Set base params and custom config for the sdk to run
 *
 * @param {Object} options
 */
function set (options: InitOptionsT): void {
  if (hasMissing(options)) {
    return
  }

  const filteredParams = [..._allowedParams, ..._allowedConfig]
    .filter(key => !!options[key])
    .map(key => [key, options[key]])

  _baseParams = filteredParams
    .filter(([key]) => _allowedParams.indexOf(key) !== -1)
    .reduce(reducer, {})

  _customConfig = filteredParams
    .filter(([key]) => _allowedConfig.indexOf(key) !== -1)
    .reduce(reducer, {})
}

/**
 * Get custom config set by client
 *
 * @returns {Object}
 */
function getCustomConfig (): CustomConfigT {
  return {..._customConfig}
}

/**
 * Check if there are  missing mandatory parameters
 *
 * @param {Object} params
 * @returns {boolean}
 * @private
 */
function hasMissing (params: BaseParamsT): boolean {
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
function destroy (): void {
  _baseParams = {}
  _customConfig = {}
}

const Config = {
  ..._baseConfig,
  set,
  getBaseParams,
  getCustomConfig,
  isInitialised,
  hasMissing,
  destroy
}

export default Config
