import Config from './config'
import {isEmpty, findIndex} from './utilities'

const _storageName = Config.namespace
const _schemeKey = '_scheme'
let _storage

/**
 * Check if LocalStorage is supported in the current browser
 *
 * @param {boolean=} toThrow
 * @returns {boolean}
 */
function isSupported (toThrow) {

  let uid = (new Date).toString()
  let storage
  let result

  try {
    (storage = window.localStorage).setItem(uid, uid)
    result = storage.getItem(uid) === uid
    storage.removeItem(uid)
    return !!(result && storage)
  } catch (exception) {
    if (toThrow) {
      throw Error('LocalStorage is not supported in this browser')
    } else {
      return false
    }
  }

}

/**
 * Prepare schema details if not existent
 *
 * @private
 */
function _open () {

  isSupported(true)

  _storage = window.localStorage

  let scheme = _get(_schemeKey) || {}

  if (isEmpty(scheme)) {
    scheme.queue = {primaryKey: 'timestamp'}
    scheme.activityState = {primaryKey: 'uuid'}

    _set(_schemeKey, scheme)
  }

  if (!_get('queue')) { _set('queue', []) }
  if (!_get('activityState')) { _set('activityState', []) }

}

/**
 * Get the value for specific key
 *
 * @param {string} key
 * @returns {*}
 * @private
 */
function _get (key) {
  return JSON.parse(_storage.getItem(`${_storageName}.${key}`))
}

/**
 * Set the value for specific key
 *
 * @param {string} key
 * @param {*} value
 * @private
 */
function _set (key, value) {
  _storage.setItem(`${_storageName}.${key}`, JSON.stringify(value))
}

/**
 * Initiate quasi-transaction for requested action
 *
 * @param {string} storeName
 * @param {Function} action
 * @returns {Promise}
 * @private
 */
function _initTransaction (storeName, action) {

  _open()

  return new Promise((resolve, reject) => {

    const items = _get(storeName)
    const key = _get(_schemeKey)[storeName].primaryKey

    return action(resolve, reject, key, items)
  })
}

/**
 * Get all records from particular store
 *
 * @param {string} storeName
 * @param {boolean=} firstOnly
 * @returns {Promise}
 */
function getAll (storeName, firstOnly) {

  _open()

  return new Promise((resolve, reject) => {

    const value = _get(storeName)

    if (value instanceof Array) {
      resolve(firstOnly ? value[0] : value)
    } else {
      reject({name: 'NotFoundError', message: `No store named ${storeName} in this storage`})
    }
  })
}

/**
 * Get the first row from the store
 *
 * @param {string} storeName
 * @returns {Promise}
 */
function getFirst (storeName) {
  return getAll(storeName, true)
}

/**
 * Get item from a particular store
 *
 * @param {string} storeName
 * @param {*} id
 * @returns {Promise}
 */
function getItem (storeName, id) {
  return _initTransaction(storeName, (resolve, reject, key, items) => {

    const index = findIndex(items, key, id)

    if (index === -1) {
      reject({name: 'NotFoundError', message: `No record found with ${key} ${id} in ${storeName} store`})
    } else {
      resolve(items[index])
    }
  })
}

/**
 * Add item to a particular store
 *
 * @param {string} storeName
 * @param {Object} item
 * @returns {Promise}
 */
function addItem (storeName, item) {
  return _initTransaction(storeName, (resolve, reject, key, items) => {

    const index = findIndex(items, key, item[key])

    if (index !== -1) {
      reject({name: 'ConstraintError', message: `Item with ${key} ${item[key]} already exists`})
    } else {
      items.push(item)
      _set(storeName, items)
      resolve(item)
    }
  })
}

/**
 * Update item in a particular store
 *
 * @param {string} storeName
 * @param {Object} item
 * @returns {Promise}
 */
function updateItem (storeName, item) {
  return _initTransaction(storeName, (resolve, _, key, items) => {

    const index = findIndex(items, key, item[key])

    if (index === -1) {
      items.push(item)
    } else {
      items.splice(index, 1, item)
    }

    _set(storeName, items)
    resolve(item)
  })
}

/**
 * Delete item from a particular store
 *
 * @param {string} storeName
 * @param {*} id
 * @returns {Promise}
 */
function deleteItem (storeName, id) {
  return _initTransaction(storeName, (resolve, _, key, items) => {

    const index = findIndex(items, key, id)

    if (index !== -1) {
      items.splice(index, 1)
      _set(storeName, items)
    }

    resolve(id)
  })
}

/**
 * Find index of the item with the closest value to the bound
 *
 * @param {Array} array
 * @param {string} key
 * @param {number} bound
 * @returns {number}
 * @private
 */
function _findMax (array, key, bound) {

  if (!array.length) {
    return -1
  }

  let max = {index: -1, value: 0}

  for (let i = 0; i < array.length; i += 1) {
    if (array[i][key] <= bound) {
      if (array[i][key] > max.value) {
        max = {value: array[i][key], index: i}
      }
    } else {
      return max.index
    }
  }
}

/**
 * Delete items until certain bound (primary key as a bound scope)
 *
 * @param {string} storeName
 * @param {*} upperBound
 * @returns {Promise}
 */
function deleteBulk (storeName, upperBound) {

  return getAll(storeName)
    .then(items => {

      const key = _get(_schemeKey)[storeName].primaryKey
      const first = items[0]

      if (!first) {
        return []
      }

      items.sort(isNaN(first[key]) ? undefined : ((a, b) => a[key] - b[key]))

      const index = _findMax(items, key, upperBound)

      if (index === -1) {
        return []
      }

      const deleted = items.splice(0, index + 1)

      _set(storeName, items)

      return deleted
    })
}

/**
 * Clear all records from a particular store
 *
 * @param {string} storeName
 * @returns {Promise}
 */
function clear (storeName) {

  _open()

  return new Promise(resolve => {
    _set(storeName, [])
    resolve({})
  })

}

/**
 * Destroy the reference to the storage
 */
function destroy () {
  _storage = null
}

export default {
  isSupported,
  getAll,
  getFirst,
  getItem,
  addItem,
  updateItem,
  deleteItem,
  deleteBulk,
  clear,
  destroy
}
