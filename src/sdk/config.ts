import {
  type BaseParamsT,
  type CustomConfigT,
  type InitOptionsT,
  type BaseParamsListT,
  type BaseParamsMandatoryListT,
  type CustomConfigListT
} from './types'
import { MINUTE, SECOND, DAY } from './constants'
import { buildList, reducer } from './utilities'
import Logger from './logger'


/** Base parameters set by client */
interface BaseParams {
  appToken: string,
  environment: 'production' | 'sandbox',
  defaultTracker: string,
  externalDeviceId: string
}

/** Custom config set by client */
interface CustomConfig {
  customUrl: string,
  urlStrategy: 'india' | 'china',
  dataResidency: 'EU' | 'TR' | 'US',
  eventDeduplicationListLimit: number,
  namespace: string
}

let _baseParams: BaseParams | null = null

let _customConfig: CustomConfig | null = null

/**
 * Mandatory fields to set for sdk initialization
 */
const _mandatory: BaseParamsMandatoryListT = [
  'appToken',
  'environment'
]

/**
 * Allowed params to be sent with each request
 */
const _allowedParams: BaseParamsListT = [
  ..._mandatory,
  'defaultTracker',
  'externalDeviceId'
]

/**
 * Allowed configuration overrides
 */
const _allowedConfig: CustomConfigListT = [
  'customUrl',
  'dataResidency',
  'urlStrategy',
  'eventDeduplicationListLimit',
  'namespace'
]

/**
 * Check of configuration has been initialized
 */
function isInitialised(): boolean {
  return _mandatory.reduce((acc, key) => acc && (_baseParams && !!_baseParams[key]), true)
}

/**
 * Get base params set by client
 */
function getBaseParams(): BaseParamsT {
  return { ..._baseParams }
}

/**
 * Set base params and custom config for the sdk to run
 */
function set(options: InitOptionsT): void {
  if (hasMissing(options)) {
    return
  }

  const filteredParams = [..._allowedParams, ..._allowedConfig]
    .filter(key => !!options[key])
    .map(key => [key, options[key]])

  // @ts-expect-error inferring wrong type
  _baseParams = filteredParams
    .filter(([key]) => _allowedParams.indexOf(key) !== -1)
    .reduce(reducer, {})

  // @ts-expect-error inferring wrong type
  _customConfig = filteredParams
    .filter(([key]) => _allowedConfig.indexOf(key) !== -1)
    .reduce(reducer, {})
}

/**
 * Get custom config set by client
 */
function getCustomConfig(): CustomConfigT {
  return { ..._customConfig }
}

/**
 * Check if there are  missing mandatory parameters
 */
function hasMissing(params: BaseParamsT): boolean {
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
function destroy(): void {
  _baseParams = null
  _customConfig = null
}

const Config = {
  sessionWindow: 30 * MINUTE,
  sessionTimerWindow: 60 * SECOND,
  requestValidityWindow: 28 * DAY,
  set,
  getBaseParams,
  getCustomConfig,
  isInitialised,
  hasMissing,
  destroy
}

export default Config
