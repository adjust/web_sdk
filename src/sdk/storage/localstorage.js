import ActivityState from '../activity-state'
import State from '../state'
import QuickStorage from '../storage/quick-storage'
import SchemeMap from './scheme-map'
import Scheme from './scheme'
import Logger from '../logger'
import {findIndex, isEmpty, isObject} from '../utilities'
import {convertRecord, convertStoreName} from './converter'

/**
 * Check if LocalStorage is supported in the current browser
 *
 * @returns {boolean}
 */
function isSupported () {

  let uid = (new Date).toString()
  let storage
  let result

  try {
    (storage = window.localStorage).setItem(uid, uid)
    result = storage.getItem(uid) === uid
    storage.removeItem(uid)
    return !!(result && storage)
  } catch (exception) {
    Logger.error('LocalStorage is not supported in this browser')
    return false
  }

}

/**
 * Prepare schema details if not existent
 *
 * @private
 */
function _open () {

  if (!isSupported()) {
    return {status: 'error', error: {name: 'LSNotSupported', message: 'LocalStorage is not supported'}}
  }

  const storeNames = Object.values(SchemeMap.storeNames.left)
  const activityState = ActivityState.current || {}
  const inMemoryAvailable = activityState && !isEmpty(activityState)

  storeNames.forEach(storeName => {
    const asStoreName = SchemeMap.storeNames.left.activityState

    if (storeName === asStoreName && !QuickStorage.stores[asStoreName]) {
      QuickStorage.stores[asStoreName] = inMemoryAvailable ? [convertRecord({storeName: convertStoreName({storeName, dir: 'right'}), record: activityState, dir: 'left'})] : []
    } else if (!QuickStorage.stores[storeName]) {
      QuickStorage.stores[storeName] = []
    }
  })

  State.recover()

  return {status: 'success'}
}

/**
 * Get primary keys for particular store
 *
 * @param {string} storeName
 * @returns {Array}
 * @private
 */
function _getKeys (storeName) {

  const keyPath = Scheme[storeName].options.keyPath

  return keyPath instanceof Array ? keyPath.slice() : [keyPath]
}

/**
 * Initiate quasi-database request
 *
 * @param {string} storeName
 * @param {*=} id
 * @param {Object=} item
 * @param {Function} action
 * @returns {Promise}
 * @private
 */
function _initRequest ({storeName, id, item}, action) {

  const open = _open()

  if (open.status === 'error') {
    return Promise.reject(open.error)
  }

  return new Promise((resolve, reject) => {

    const items = QuickStorage.stores[storeName]
    const keys = _getKeys(storeName)

    if (id) {
      const ids = id instanceof Array ? id.slice() : [id]
      item = keys.reduce((acc, key, index) => {
        acc[key] = ids[index]
        return acc
      }, {})
    }

    const index = item ? findIndex(items, keys, item) : null

    return action(resolve, reject, {keys, items, index})
  })
}

/**
 * Sort the array by provided key (key can be a composite one)
 * - by default sorts in ascending order by primary keys
 * - force order by provided value
 *
 * @param {array} items
 * @param {array} keys
 * @param {string} force
 * @param {string=} force
 * @returns {array}
 * @private
 */
function _sort (items, keys, force) {

  const reversed = keys.slice().reverse()

  function compare (a, b, key) {
    const expr1 = force ? force === a[key] : a[key] < b[key]
    const expr2 = force ? force > a[key] : a[key] > b[key]

    if (expr1) {
      return -1
    } else if (expr2) {
      return 1
    } else {
      return 0
    }
  }

  return items.sort((a, b) => {
    return reversed.reduce((acc, key) => {
      return acc || compare(a, b, key)
    }, 0)
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

  const open = _open()

  if (open.status === 'error') {
    return Promise.reject(open.error)
  }

  return new Promise((resolve, reject) => {

    const value = QuickStorage.stores[storeName]

    if (value instanceof Array) {
      resolve(firstOnly ? value[0] : _sort(value, _getKeys(storeName)))
    } else {
      reject({name: 'NotFoundError', message: `No objectStore named ${storeName} in this database`})
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
  return _initRequest({storeName, id}, (resolve, reject, {items, index}) => {
    if (index === -1) {
      reject({name: 'NotRecordFoundError', message: `Requested record not found in "${storeName}" store`})
    } else {
      resolve(items[index])
    }
  })
}

/**
 * Return filtered result by value on available index
 *
 * @param {string} storeName
 * @param {string} by
 * @returns {Promise}
 */
function filterBy (storeName, by) {
  return getAll(storeName)
    .then(result => {
      return result.filter(item => {
        return item[Scheme[storeName].index] === by
      })
    })
}

/**
 * Return values for primary keys of particular item
 *
 * @param {Array} keys
 * @param {Object} item
 * @returns {*}
 * @private
 */
function _return (keys, item) {
  return keys.length === 1 ? item[keys[0]] : keys.map((key) => item[key])
}

/**
 * Add item to a particular store
 *
 * @param {string} storeName
 * @param {Object} item
 * @returns {Promise}
 */
function addItem (storeName, item) {
  return _initRequest({storeName, item}, (resolve, reject, {keys, items, index}) => {
    if (index !== -1) {
      reject({name: 'ConstraintError', message: `Constraint was not satisfied, trying to add existing item into "${storeName}" store`})
    } else {
      items.push(item)
      QuickStorage.stores[storeName] = items
      resolve(_return(keys, item))
    }
  })
}

/**
 * Add multiple items into particular store
 *
 * @param {string} storeName
 * @param {Object} target
 * @param {boolean=} overwrite
 * @returns {Promise}
 */
function addBulk (storeName, target, overwrite) {
  return _initRequest({storeName}, (resolve, reject, {keys, items}) => {

    if (!target || target && !target.length) {
      return reject({name: 'NoTargetDefined', message: `No array provided to perform add bulk operation into "${storeName}" store`})
    }

    let existing = []

    target.forEach(item => {
      const index = findIndex(items, keys, item)
      if (index !== -1) {
        existing.push({target: item, index})
      }
    })

    if (overwrite) {
      const indexes = existing.map(i => i.index).sort((a, b) => { return b - a })
      indexes.forEach(index => items.splice(index, 1))
    }

    if (existing.length && !overwrite) {
      reject({name: 'ConstraintError', message: `Constraint was not satisfied, trying to add existing items into "${storeName}" store`})
    } else {
      QuickStorage.stores[storeName] = _sort([...items, ...target], keys)
      resolve(target.map((item) => keys.map(k => item[k])))
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
  return _initRequest({storeName, item}, (resolve, _, {keys, items, index}) => {
    if (index === -1) {
      items.push(item)
    } else {
      items.splice(index, 1, item)
    }

    QuickStorage.stores[storeName] = items
    resolve(_return(keys, item))
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
  return _initRequest({storeName, id}, (resolve, _, {items, index}) => {
    if (index !== -1) {
      items.splice(index, 1)
      QuickStorage.stores[storeName] = items
    }

    resolve(id)
  })
}

/**
 * Find index of the item with the closest value to the bound
 *
 * @param {Array} array
 * @param {string} key
 * @param {number|string} bound
 * @returns {number}
 * @private
 */
function _findMax (array, key, bound) {

  if (!array.length) {
    return -1
  }

  let max = {index: -1, value: (isNaN(bound) ? '' : 0)}

  for (let i = 0; i < array.length; i += 1) {
    if (array[i][key] <= bound) {
      if (array[i][key] >= max.value) {
        max = {value: array[i][key], index: i}
      }
    } else {
      return max.index
    }
  }

  return max.index
}

/**
 * Delete items until certain bound (primary key as a bound scope)
 *
 * @param {string} storeName
 * @param {string|Object} condition
 * @param {*=} condition.upperBound
 * @returns {Promise}
 */
function deleteBulk (storeName, condition) {
  return getAll(storeName)
    .then(items => {

      const keys = _getKeys(storeName)
      const key = Scheme[storeName].index || keys[0]
      const bound = isObject(condition) ? condition.upperBound : condition
      const force = isObject(condition) ? null : condition

      _sort(items, keys, force)

      const index = _findMax(items, key, bound)

      if (index === -1) {
        return []
      }

      const deleted = items.splice(0, index + 1)

      QuickStorage.stores[storeName] = items

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

  const open = _open()

  if (open.status === 'error') {
    return Promise.reject(open.error)
  }

  return new Promise(resolve => {
    QuickStorage.stores[storeName] = []
    resolve({})
  })
}

/**
 * Does nothing, it simply matches the common storage interface
 */
function destroy () {}

export {
  isSupported,
  getAll,
  getFirst,
  getItem,
  filterBy,
  addItem,
  addBulk,
  updateItem,
  deleteItem,
  deleteBulk,
  clear,
  destroy
}
