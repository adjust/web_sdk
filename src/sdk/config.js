// @flow
declare var __ADJUST__NAMESPACE: string
declare var __ADJUST__SDK_VERSION: string

import {type BaseParamsT, type BaseParamsListT, type BaseParamsMandatoryListT} from './types'
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
 * baseUrl: {app: string, gdpr: string},
 * sessionWindow: number,
 * sessionTimerWindow: number,
 * requestValidityWindow: number,
 * baseParams: Object
 * }}
 */
const _baseConfig = {
  namespace: __ADJUST__NAMESPACE || 'adjust-sdk',
  version: __ADJUST__SDK_VERSION || '0.0.0',
  baseUrl: process.env.NODE_ENV === 'test' ? {} : {
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
 * Set base params for the sdk to run
 *
 * @param {Object} params
 */
function setBaseParams (params: BaseParamsT): void {

  if (hasMissing(params)) {
    return
  }

  _baseParams = _allowed
    .map(key => [key, params[key]])
    .reduce(reducer, {})

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
}

const Config = {
  ..._baseConfig,
  getBaseParams,
  setBaseParams,
  isInitialised,
  hasMissing,
  destroy
}

export default Config
