// @flow
import {publish} from './pub-sub'
import QuickStorage from './storage/quick-storage'
import Scheme from './storage/scheme'
import {REASON_GDPR, REASON_GENERAL} from './constants'

type SdkDisabledT = {|
  reason: REASON_GENERAL | REASON_GDPR,
  pending: boolean
|}

type ThirdPartySharingDisabledT = {|
  reason: REASON_GENERAL,
  pending: boolean
|}

type PreferencesT = {|
  thirdPartySharingDisabled?: ?ThirdPartySharingDisabledT,
  sdkDisabled?: ?SdkDisabledT
|}

/**
 * Name of the store used by preferences
 *
 * @type {string}
 * @private
 */
let _storeName: string = Scheme.preferences.name

/**
 * Local reference to be used for recovering preserved state
 *
 * @type {Object}
 * @private
 */
let _preferences: ?PreferencesT = _getPreferences()

/**
 * Get preferences stored in the localStorage
 *
 * @returns {Object}
 * @private
 */
function _getPreferences (): ?PreferencesT {
  if (!_preferences) {
    _setPreferences()
  }

  return _preferences ? {..._preferences} : null
}

/**
 * Set local reference of the preserved preferences
 *
 * @private
 */
function _setPreferences (): void {
  _preferences = QuickStorage.stores[_storeName]
}

/**
 * Get current disabled state
 *
 * @returns {Object|null}
 */
function getDisabled (): ?SdkDisabledT {
  const preferences = _getPreferences()

  return preferences ? preferences.sdkDisabled : null
}

/**
 * Set current disabled state
 *
 * @param {Object|null} value
 */
function setDisabled (value: ?SdkDisabledT): void {
  const sdkDisabled = value ? {...value} : null

  QuickStorage.stores[_storeName] = {..._getPreferences(), sdkDisabled}

  _setPreferences()
}

/**
 * Get current third-party-sharing disabled state
 *
 * @returns {Object}
 * @private
 */
function getThirdPartySharing (): ?ThirdPartySharingDisabledT {
  const preferences = _getPreferences()

  return preferences ? preferences.thirdPartySharingDisabled : null
}

/**
 * Set current third-party-sharing disabled state
 *
 * @param {Object=} value
 * @private
 */
function setThirdPartySharing (value: ?ThirdPartySharingDisabledT): void {
  const thirdPartySharingDisabled = value ? {...value} : null

  QuickStorage.stores[_storeName] = {..._getPreferences(), thirdPartySharingDisabled}

  _setPreferences()
}

/**
 * Reload current preferences from localStorage if changed outside of current scope (e.g. tab)
 */
function reload (): void {
  const stored: PreferencesT = QuickStorage.stores[_storeName] || {}
  const sdkDisabled: ?SdkDisabledT = (_preferences || {}).sdkDisabled || null

  if (stored.sdkDisabled && !sdkDisabled) {
    publish('sdk:shutdown')
  }

  _setPreferences()
}

/**
 * Recover preferences from memory if storage was lost
 */
function recover (): void {
  const stored: ?PreferencesT = QuickStorage.stores[_storeName]

  if (!stored) {
    QuickStorage.stores[_storeName] = {..._preferences}
  }
}

export {
  getDisabled,
  setDisabled,
  getThirdPartySharing,
  setThirdPartySharing,
  reload,
  recover
}
