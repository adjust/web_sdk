import {getTimestamp} from './time'
import ActivityState from './activity-state'
import Storage from './storage/storage'

/**
 * Get created at timestamp
 *
 * @returns {{createdAt: string}}
 * @private
 */
function _getCreatedAt () {
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
function _getSentAt () {
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
function _getWebUuid () {
  return {webUuid: ActivityState.current.uuid}
}

/**
 * Get track enabled parameter by reading doNotTrack
 *
 * @returns {{trackingEnabled: boolean}|{}}
 * @private
 */
function _getTrackEnabled () {

  const isNavigatorDNT = typeof navigator.doNotTrack !== 'undefined'
  const isWindowDNT = typeof window.doNotTrack !== 'undefined'
  const isMsDNT = typeof navigator.msDoNotTrack !== 'undefined'
  const dnt = isNavigatorDNT ? navigator.doNotTrack : (isWindowDNT ? window.doNotTrack : (isMsDNT ? navigator.msDoNotTrack : null))

  if (parseInt(dnt, 10) === 0 || dnt === 'no') {
    return {trackingEnabled: true}
  }

  if (parseInt(dnt, 10) === 1 || dnt === 'yes') {
    return {trackingEnabled: false}
  }

  return {}
}

/**
 * Get platform parameter => hardcoded to `web`
 *
 * @returns {{platform: string}}
 * @private
 */
function _getPlatform () {
  return {platform: 'web'}
}

/**
 * Get language preferences
 *
 * @returns {{language: string, country: string|undefined}}
 * @private
 */
function _getLanguage () {
  const [language, country] = (navigator.language || navigator.userLanguage || 'en').split('-')
  return {language, country: (country ? '' + country.toLowerCase() : undefined)}
}

/**
 * Get machine type from navigator.platform property
 *
 * @returns {{machineType: (string|undefined)}}
 */
function _getMachineType () {
  const ua = navigator.userAgent || navigator.vendor
  const overrideWin32 = navigator.platform === 'Win32' && (ua.indexOf('WOW64') !== -1 || ua.indexOf('Win64') !== -1)

  return {machineType: (overrideWin32 ? 'Win64' : navigator.platform) || undefined}
}

/**
 * Get the current queue size
 *
 * @returns {Promise}
 * @private
 */
function _getQueueSize () {
  return Storage.getAll('queue')
    .then(records => ({queueSize: records.length}))
}

export default function defaultParams () {
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
