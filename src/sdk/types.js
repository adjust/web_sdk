// @flow
export type NavigatorT = Navigator & {
  msDoNotTrack?: any,
  userLanguage?: string
}

export type DocumentT = Document & {
  hidden: boolean,
  mozHidden?: boolean,
  msHidden?: boolean,
  oHidden?: boolean,
  webkitHidden?: boolean
}

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

export type UrlT = '/session' | '/attribution' | '/event' | '/gdpr_forget_device'

export type MethodT = 'GET' | 'POST' | 'PUT' | 'DELETE'

export type ParamsT = $Shape<{|
  createdAt?: string,
  initiatedBy?: string,
  ...SessionParamsT
|}>

export type HttpRequestParamsT = $ReadOnly<{|
  url: UrlT,
  method?: MethodT,
  params: $ReadOnly<{|
    attempts: number,
    ...ParamsT
  |}>
|}>

export type HttpSuccessResponseT = $ReadOnly<{|
  status: 'success',
  adid: string,
  timestamp: string,
  continue_in?: number,
  retry_in?: number,
  ask_in?: number,
  tracking_state?: number,
  attribution?: AttributionMapT,
  message?: string
|}>

export type ErrorCodeT =
  'TRANSACTION_ERROR' |
  'SERVER_MALFORMED_RESPONSE' |
  'SERVER_INTERNAL_ERROR' |
  'SERVER_CANNOT_PROCESS' |
  'NO_CONNECTION' |
  'SKIP' |
  'MISSING_URL'

export type HttpErrorResponseT = $ReadOnly<{|
  status: 'error',
  action: 'CONTINUE' | 'RETRY',
  response: {[string]: string} | string,
  message: string,
  code: ErrorCodeT
|}>

type HttpFinishCbT = () => void

type HttpRetryCbT = (number) => Promise<HttpSuccessResponseT | HttpErrorResponseT>

export type HttpContinueCbT = (HttpSuccessResponseT | HttpErrorResponseT, HttpFinishCbT, HttpRetryCbT) => mixed

export type AttributionStateT = {|
  state: 'same' | 'changed' | 'unknown'
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

export type CustomErrorT = {|
  name: string,
  message: string,
  interrupted?: boolean
|}

export type CreatedAtT = {|
  createdAt: string
|}

export type SentAtT = {|
  sentAt: string
|}

export type WebUuidT = {|
  webUuid: string
|}

export type TrackEnabledT = {|
  trackingEnabled?: boolean
|}

export type PlatformT = {|
  platform: string
|}

export type LanguageT = {|
  language: string,
  country?: string
|}

export type MachineTypeT = {|
  machineType?: string
|}

export type QueueSizeT = {|
  queueSize: number
|}

export type DefaultParamsT = {|
  ...CreatedAtT,
  ...SentAtT,
  ...WebUuidT,
  ...TrackEnabledT,
  ...PlatformT,
  ...LanguageT,
  ...MachineTypeT,
  ...QueueSizeT
|}

