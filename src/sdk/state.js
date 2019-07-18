import {publish} from './pub-sub'
import QuickStorage from './storage/quick-storage'

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
let _disabled = QuickStorage.stores[_storeName]

/**
 * Get current disabled state
 *
 * @returns {Object}
 */
function _disabledGetter () {
  if (!_disabled) {
    _disabled = QuickStorage.stores[_storeName]
  }

  return _disabled
}

/**
 * Set current disabled state
 *
 * @param {string|null} reason
 */
function _disabledSetter (reason) {
  QuickStorage.stores[_storeName] = reason
  _disabled = reason
}

/**
 * Reload current disabled state from localStorage
 */
function reload () {
  if (QuickStorage.stores[_storeName] && !_disabled) {
    publish('sdk:shutdown', true)
  }

  _disabled = QuickStorage.stores[_storeName]
}

/**
 * Recover states from memory
 */
function recover () {
  if (!QuickStorage.stores[_storeName]) {
    QuickStorage.stores[_storeName] = _disabled
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
