import {extend} from './utilities'
import {getTimestamp} from './time'
import ActivityState from './activity-state'

/**
 * Get track enabled parameter by readon doNotTrack
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
 * Read uuid from the activity state
 *
 * @returns {{webUuid: string, gpsAdid: string}}
 * @private
 */
function _getWebUuid () {
  const webUuid = ActivityState.current.uuid

  return {
    webUuid: webUuid,
    gpsAdid: webUuid // TODO this will be remove once backend fully supports web_sdk
  }
}

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

export default function defaultParams () {
  return extend({},
    _getCreatedAt(),
    _getSentAt(),
    _getWebUuid(),
    _getTrackEnabled()
  )
}
