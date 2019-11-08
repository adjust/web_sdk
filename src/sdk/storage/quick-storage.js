import {convertRecord} from './converter'
import {entries} from '../utilities'
import Config from '../config'
import SchemeMap from './scheme-map'

const _storageName = Config.namespace
const _storeNames = SchemeMap.storeNames.left

/**
 * Get the value for specified key
 *
 * @param {string} key
 * @returns {*}
 * @private
 */
function _get (key) {
  const value = JSON.parse(localStorage.getItem(`${_storageName}.${key}`))
  return (value instanceof Array
    ? value
    : convertRecord({
      storeName: 'disabled',
      dir: 'right',
      record: value
    })) || null
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
    localStorage.setItem(`${_storageName}.${key}`, JSON.stringify(
      value instanceof Array
        ? value
        : convertRecord({
          storeName: 'disabled',
          dir: 'left',
          record: value
        })
    ))
  }
}

/**
 * Clear all data related to the sdk
 */
function clear () {
  entries(_storeNames)
    .forEach(([, store]) => {
      if (!store.permanent) {
        localStorage.removeItem(`${_storageName}.${store.name}`)
      }
    })
}

const QuickStorage = {
  storeNames: _storeNames,
  stores: {},
  clear
}

entries(_storeNames)
  .forEach(([, store]) => {
    Object.defineProperty(QuickStorage.stores, store.name, {
      get () { return _get(store.name) },
      set (value) { return _set(store.name, value) }
    })
  })

Object.freeze(QuickStorage.stores)

export default QuickStorage
