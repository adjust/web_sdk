import {extend} from '../utilities'
import Config from '../config'
import SchemeMap from './scheme-map'

const _disabledName = 'disabled'
const _schemeKeys = Object.values(SchemeMap.storeNames)
const _storageFields = [_disabledName,  ..._schemeKeys]
const _storageName = Config.namespace

/**
 * Get the value for specified key
 *
 * @param {string} key
 * @returns {*}
 * @private
 */
function _get (key) {
  return JSON.parse(localStorage.getItem(`${_storageName}.${key}`))
}

/**
 * Set the value for specified key
 *
 * @param {string} key
 * @param {*} value
 * @private
 */
function _set (key, value) {
  if (!value) {
    localStorage.removeItem(`${_storageName}.${key}`)
  } else {
    localStorage.setItem(`${_storageName}.${key}`, JSON.stringify(value))
  }
}

/**
 * Clear all data related to the sdk
 */
function clear () {
  _schemeKeys.forEach(key => {
    localStorage.removeItem(`${_storageName}.${key}`)
  })
}

const QuickStorage = {
  names: extend({disabled: _disabledName}, SchemeMap.storeNames),
  stores: {},
  clear
}

_storageFields.forEach(key => {
  Object.defineProperty(QuickStorage.stores, key, {
    get () { return _get(key) },
    set (value) { return _set(key, value) }
  })
})

Object.freeze(QuickStorage.stores)

export default QuickStorage
