// @flow
import {
  type NavigatorT,
  type CreatedAtT,
  type SentAtT,
  type WebUuidT,
  type TrackEnabledT,
  type PlatformT,
  type LanguageT,
  type MachineTypeT,
  type QueueSizeT,
  type DefaultParamsT
} from './types'
import {getTimestamp} from './time'
import ActivityState from './activity-state'
import Storage from './storage/storage'

/**
 * Get created at timestamp
 *
 * @returns {{createdAt: string}}
 * @private
 */
function _getCreatedAt (): CreatedAtT {
  return {
    createdAt: getTimestamp()
  }
}

/**
 * Get sent at timestamp
 *
 * @returns {{sentAt: string}}
 * @private
 */
function _getSentAt (): SentAtT {
  return {
    sentAt: getTimestamp()
  }
}

/**
 * Read uuid from the activity state
 *
 * @returns {{webUuid: string}}
 * @private
 */
function _getWebUuid (): WebUuidT {
  return {webUuid: ActivityState.current.uuid}
}

/**
 * Get track enabled parameter by reading doNotTrack
 *
 * @returns {{trackingEnabled: boolean}|null}
 * @private
 */
function _getTrackEnabled (): ?TrackEnabledT {
  const navigatorExt = (navigator: NavigatorT)
  const isNavigatorDNT = typeof navigatorExt.doNotTrack !== 'undefined'
  const isWindowDNT = typeof window.doNotTrack !== 'undefined'
  const isMsDNT = typeof navigatorExt.msDoNotTrack !== 'undefined'
  const dnt = isNavigatorDNT ? navigatorExt.doNotTrack : (isWindowDNT ? window.doNotTrack : (isMsDNT ? navigatorExt.msDoNotTrack : null))

  if (parseInt(dnt, 10) === 0 || dnt === 'no') {
    return {trackingEnabled: true}
  }

  if (parseInt(dnt, 10) === 1 || dnt === 'yes') {
    return {trackingEnabled: false}
  }

  return null
}

/**
 * Get platform parameter => hardcoded to `web`
 *
 * @returns {{platform: string}}
 * @private
 */
function _getPlatform (): PlatformT {
  return {platform: 'web'}
}

/**
 * Get language preferences
 *
 * @returns {{language: string, country: string|undefined}}
 * @private
 */
function _getLanguage (): LanguageT {
  const navigatorExt = (navigator: NavigatorT)
  const [language, country] = (navigatorExt.language || navigatorExt.userLanguage || 'en').split('-')
  return {language, country: (country ? '' + country.toLowerCase() : undefined)}
}

/**
 * Get machine type from navigator.platform property
 *
 * @returns {{machineType: (string|undefined)}}
 */
function _getMachineType (): MachineTypeT {
  const ua = navigator.userAgent || navigator.vendor
  const overrideWin32 = navigator.platform === 'Win32' && (ua.indexOf('WOW64') !== -1 || ua.indexOf('Win64') !== -1)

  return {machineType: overrideWin32 ? 'Win64' : navigator.platform}
}

/**
 * Get the current queue size
 *
 * @returns {Promise}
 * @private
 */
function _getQueueSize (): Promise<QueueSizeT> {
  return Storage.getAll('queue')
    .then(records => ({queueSize: records.length}))
}

export default function defaultParams (): Promise<DefaultParamsT> {
  return _getQueueSize()
    .then(queueSize => ({
      ..._getCreatedAt(),
      ..._getSentAt(),
      ..._getWebUuid(),
      ..._getTrackEnabled(),
      ..._getPlatform(),
      ..._getLanguage(),
      ..._getMachineType(),
      ...queueSize
    }))
}
