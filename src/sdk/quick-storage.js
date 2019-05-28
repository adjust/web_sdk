import Config from './config'
import Scheme from './scheme'

const _schemeKeys = Object.keys(Scheme)
const _storageFields = ['state', ..._schemeKeys]
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
  localStorage.setItem(`${_storageName}.${key}`, JSON.stringify(value))
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
  clear
}

_storageFields.forEach(key => {
  Object.defineProperty(QuickStorage, key, {
    get () { return _get(key) },
    set (value) { return _set(key, value) }
  })
})

Object.freeze(QuickStorage)

export default QuickStorage
