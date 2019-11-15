// @flow
declare var __ADJUST__NAMESPACE: string
declare var __ADJUST__SDK_VERSION: string

import {
  type BaseParamsT,
  type CustomConfigT,
  type InitConfigT,
  type BaseParamsListT,
  type BaseParamsMandatoryListT,
} from './types'
import {MINUTE, SECOND, DAY} from './constants'
import {buildList, reducer} from './utilities'
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
let _baseParams: BaseParamsT = {}

/**
 * Custom config set by client
 * - url override
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
 * Allowed fields to set for sdk initialization
 *
 * @type {string[]}
 * @private
 */
const _allowed: BaseParamsListT = [
  ..._mandatory,
  'defaultTracker'
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
  namespace: __ADJUST__NAMESPACE || 'adjust-sdk',
  version: __ADJUST__SDK_VERSION || '0.0.0',
  sessionWindow: 30 * MINUTE,
  sessionTimerWindow: 60 * SECOND,
  requestValidityWindow: 28 * DAY,
  baseUrl: process.env.NODE_ENV === 'test'
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
 * Set base params for the sdk to run and custom ones when provided
 *
 * @param {Object} params
 */
function setBaseParams (params: InitConfigT): void {
  if (hasMissing(params)) {
    return
  }

  _customConfig = {url: params.customUrl}
  _baseParams = _allowed
    .filter(key => !!params[key])
    .map(key => [key, params[key]])
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
  getBaseParams,
  setBaseParams,
  getCustomConfig,
  isInitialised,
  hasMissing,
  destroy
}

export default Config
