// @flow

export type AttributionMapT = $ReadOnly<{|
  adid: string,
  tracker_token: string,
  tracker_name: string,
  network?: string,
  campaign?: string,
  adgroup?: string,
  creative?: string,
  click_label?: string,
  state: string
|}>

export type AttributionWhiteListT = $ReadOnlyArray<$Keys<AttributionMapT>>

export type ActivityStateMapT = $Shape<{|
  uuid: string,
  lastActive: number,
  lastInterval: number,
  timeSpent: number,
  sessionWindow: number,
  sessionLength: number,
  sessionCount: number,
  eventCount: number,
  installed: boolean,
  attribution: AttributionMapT
|}>

export type SessionParamsT = $Shape<{|
  timeSpent: $PropertyType<ActivityStateMapT, 'timeSpent'>,
  sessionLength: $PropertyType<ActivityStateMapT, 'sessionLength'>,
  sessionCount: $PropertyType<ActivityStateMapT, 'sessionCount'>,
  lastInterval: $PropertyType<ActivityStateMapT, 'lastInterval'>
|}>

export type HttpResultT = $ReadOnly<{
  adid: string,
  continue_in: number,
  retry_in: number,
  ask_in: number,
  attribution: AttributionMapT
}>

type HttpFinishCb = () => void

type HttpRetryCb = (number) => Promise<HttpResultT>

export type HttpContinueCbT = (HttpResultT, HttpFinishCb, HttpRetryCb) => mixed

export type AttributionStateT = {|
  state: 'same' | 'changed'
|}

export type BackOffStrategyT = 'long' | 'short' | 'test'

export type GlobalParamsT = {|
  key: string,
  value: string
|}

export type GlobalParamsMapT = {
  callbackParams: Array<GlobalParamsT>,
  partnerParams: Array<GlobalParamsT>
}

export type EventParamsT = {|
  eventToken: string,
  revenue?: number,
  currency?: string,
  deduplicationId?: string,
  callbackParams?: Array<GlobalParamsT>,
  partnerParams?: Array<GlobalParamsT>
|}

export type BaseParamsT = $ReadOnly<$Shape<{
  appToken: string,
  environment: 'production' | 'sandbox',
  defaultTracker: string
}>>

export type CustomConfigT = $ReadOnly<$Shape<{
  customUrl: string,
  eventDeduplicationListLimit: number
}>>

export type LogOptionsT = $ReadOnly<$Shape<{|
  logLevel: 'none' | 'error' | 'info' | 'verbose',
  logOutput: string
|}>>

export type InitOptionsT = $ReadOnly<$Shape<{|
  appToken: $PropertyType<BaseParamsT, 'appToken'>,
  environment: $PropertyType<BaseParamsT, 'environment'>,
  defaultTracker: $PropertyType<BaseParamsT, 'defaultTracker'>,
  customUrl: $PropertyType<CustomConfigT, 'customUrl'>,
  eventDeduplicationListLimit: $PropertyType<CustomConfigT, 'eventDeduplicationListLimit'>,
  attributionCallback: (string, Object) => mixed
|}>>

export type BaseParamsListT = $ReadOnlyArray<$Keys<BaseParamsT>>
export type BaseParamsMandatoryListT = $ReadOnlyArray<'appToken' | 'environment'>
export type CustomConfigListT = $ReadOnlyArray<$Keys<CustomConfigT>>

