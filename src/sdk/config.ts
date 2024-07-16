import { type Attribution } from './ts-types'
import { MINUTE, SECOND, DAY } from './constants'
import { buildList, reducer } from './utilities'
import Logger from './logger'

type MandatoryParams = {
  appToken: string,
  environment: 'production' | 'sandbox',
}

/** Base parameters set by client */
type BaseParams = MandatoryParams & {
  defaultTracker?: string,
  externalDeviceId?: string
}

/** Custom config set by client */
type CustomConfig = {
  customUrl?: string,
  urlStrategy?: 'india' | 'china',
  dataResidency?: 'EU' | 'TR' | 'US',
  eventDeduplicationListLimit?: number,
  namespace?: string
}

export type InitOptions = BaseParams & CustomConfig & {
  attributionCallback: (eventName: string, attribution: Attribution) => unknown
}

let _baseParams: BaseParams | null = null

let _customConfig: CustomConfig | null = null

/** Mandatory fields to set for sdk initialization */
const _mandatory: Array<(keyof MandatoryParams)> = [
  'appToken',
  'environment'
]

/** Allowed params to be sent with each request */
const _allowedParams: Array<(keyof BaseParams)> = [
  ..._mandatory,
  'defaultTracker',
  'externalDeviceId'
]

/** Allowed configuration overrides */
const _allowedConfig: Array<(keyof CustomConfig)> = [
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
  return _mandatory.reduce((acc, key) => acc && (!!_baseParams && !!_baseParams[key]), true)
}

/**
 * Set base params and custom config for the sdk to run
 */
function set(options: InitOptions): void {
  if (hasMissing(options)) {
    return
  }

  _baseParams = _allowedParams
    .filter(key => !!options[key])
    .map(key => [key, options[key]] as [keyof MandatoryParams, string])
    .reduce((acc, item) => reducer(acc, item) as BaseParams, {} as BaseParams)

  _customConfig = _allowedConfig
    .filter(key => !!options[key])
    .map(key => [key, options[key]] as [string, string])
    .reduce(reducer, {} as CustomConfig)
}

/**
 * Get base params set by client
 */
function getBaseParams(): Partial<BaseParams> {
  return _baseParams
    ? { ..._baseParams } // intentionally returns a copy
    : {}
}

/**
 * Get custom config set by client
 */
function getCustomConfig(): CustomConfig {
  return _customConfig
    ? { ..._customConfig } // intentionally returns a copy
    : {}
}

/**
 * Check if there are  missing mandatory parameters
 */
function hasMissing(params: BaseParams): boolean {
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
