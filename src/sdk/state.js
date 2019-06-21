import {publish} from './pub-sub'
import QuickStorage from './quick-storage'

/**
 * Reference to the disabled state
 *
 * @type {Object}
 * @private
 */
let _disabled = QuickStorage.disabled

/**
 * Get current disabled state
 *
 * @returns {Object}
 */
function _disabledGetter () {
  if (!_disabled) {
    _disabled = QuickStorage.disabled
  }

  return _disabled
}

/**
 * Set current disabled state
 *
 * @param {string|null} reason
 */
function _disabledSetter (reason) {
  QuickStorage.disabled = reason
  _disabled = reason
}

/**
 * Reload current disabled state from localStorage
 */
function reload () {
  if (QuickStorage.disabled && !_disabled) {
    publish('sdk:shutdown', true)
  }

  _disabled = QuickStorage.disabled
}

/**
 * Recover states from memory
 */
function recover () {
  if (!QuickStorage.disabled) {
    QuickStorage.disabled = _disabled
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
