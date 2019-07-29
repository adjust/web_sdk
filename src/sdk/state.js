import {publish} from './pub-sub'
import QuickStorage from './storage/quick-storage'
import {REASON_GENERAL, REASON_GDPR} from './constants'

/**
 * Encoded values for each reason
 *
 * @type {Object}
 * @private
 */
const _reasons = {
  [REASON_GENERAL]: 1,
  [REASON_GDPR]: 2
}

/**
 * Name of the store used by disabled
 *
 * @type {string}
 * @private
 */
let _storeName = QuickStorage.names.disabled

/**
 * Reference to the disabled state
 *
 * @type {Object}
 * @private
 */
let _disabled = _decodeDisabled()

/**
 * Decode disabled value from storage
 *
 * @returns {string}
 * @private
 */
function _decodeDisabled () {
  const reason = QuickStorage.stores[_storeName]
  return reason === 1 ? REASON_GENERAL : (reason === 2 ? REASON_GDPR : null)
}

/**
 * Get current disabled state
 *
 * @returns {Object}
 */
function _disabledGetter () {
  if (!_disabled) {
    _disabled = _decodeDisabled()
  }

  return _disabled
}

/**
 * Set current disabled state
 *
 * @param {string|null} reason
 */
function _disabledSetter (reason) {
  QuickStorage.stores[_storeName] = _reasons[reason]
  _disabled = reason
}

/**
 * Reload current disabled state from localStorage
 */
function reload () {
  if (QuickStorage.stores[_storeName] && !_disabled) {
    publish('sdk:shutdown', true)
  }

  _disabled = _decodeDisabled()
}

/**
 * Recover states from memory
 */
function recover () {
  if (!QuickStorage.stores[_storeName]) {
    QuickStorage.stores[_storeName] = _reasons[_disabled]
  }
}

const State = {
  reload,
  recover
}

Object.defineProperty(State, 'disabled', {
  get () { return _disabledGetter() },
  set (value) { return _disabledSetter(value) }
})

export default State
