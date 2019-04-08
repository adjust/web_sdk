import Config from './config'

const _storageFields = ['_scheme', 'queue', 'activityState']
const _storageName = Config.namespace
const _storage = window.localStorage

/**
 * Get the value for specified key
 *
 * @param {string} key
 * @returns {*}
 * @private
 */
function _get (key) {
  return JSON.parse(_storage.getItem(`${_storageName}.${key}`))
}

/**
 * Set the value for specified key
 *
 * @param {string} key
 * @param {*} value
 * @private
 */
function _set (key, value) {
  _storage.setItem(`${_storageName}.${key}`, JSON.stringify(value))
}

/**
 * Clear all data related to the sdk
 */
function clear () {
  _storageFields.forEach(key => {
    _storage.removeItem(`${_storageName}.${key}`)
  })
}

const QuickStorage = {
  clear: clear
}

_storageFields.forEach(key => {
  Object.defineProperty(QuickStorage, key, {
    get () { return _get(key) },
    set (value) { return _set(key, value) }
  })
})

Object.freeze(QuickStorage)

export default QuickStorage
