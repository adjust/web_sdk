import ActivityState from './activity-state'
import QuickStorage from './quick-storage'
import {isEmpty, findIndex} from './utilities'

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

  const scheme = QuickStorage._scheme || {}

  if (isEmpty(scheme)) {
    scheme.queue = {primaryKey: 'timestamp'}
    scheme.activityState = {primaryKey: 'uuid'}

    QuickStorage._scheme = scheme
  }

  if (!QuickStorage.queue) {
    QuickStorage.queue = []
  }
  if (!QuickStorage.activityState) {
    QuickStorage.activityState = ActivityState.current ? [ActivityState.current] : []
  }

}

/**
 * Initiate quasi-database request
 *
 * @param {string} storeName
 * @param {Function} action
 * @returns {Promise}
 * @private
 */
function _initRequest (storeName, action) {

  _open()

  return new Promise((resolve, reject) => {

    const items = QuickStorage[storeName]
    const key = QuickStorage._scheme[storeName].primaryKey

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

    const value = QuickStorage[storeName]

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
  return _initRequest(storeName, (resolve, reject, key, items) => {

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
  return _initRequest(storeName, (resolve, reject, key, items) => {

    const index = findIndex(items, key, item[key])

    if (index !== -1) {
      reject({name: 'ConstraintError', message: `Item with ${key} ${item[key]} already exists`})
    } else {
      items.push(item)
      QuickStorage[storeName] = items
      resolve(item[key])
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
  return _initRequest(storeName, (resolve, _, key, items) => {

    const index = findIndex(items, key, item[key])

    if (index === -1) {
      items.push(item)
    } else {
      items.splice(index, 1, item)
    }

    QuickStorage[storeName] = items
    resolve(item[key])
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
  return _initRequest(storeName, (resolve, _, key, items) => {

    const index = findIndex(items, key, id)

    if (index !== -1) {
      items.splice(index, 1)
      QuickStorage[storeName] = items
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

      const key = QuickStorage._scheme[storeName].primaryKey
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

      QuickStorage[storeName] = items

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
    QuickStorage[storeName] = []
    resolve({})
  })
}

/**
 * Does nothing, it simply matches the common storage interface
 */
function destroy () {}

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
