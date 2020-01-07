import ActivityState from '../activity-state'
import Preferences from '../preferences'
import QuickStorage from '../storage/quick-storage'
import SchemeMap from './scheme-map'
import Logger from '../logger'
import {entries, findIndex, isEmpty, isObject, reducer} from '../utilities'
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

  const storeNames = SchemeMap.storeNames.left
  const activityState = ActivityState.current || {}
  const inMemoryAvailable = activityState && !isEmpty(activityState)

  entries(storeNames)
    .filter(([, store]) => !store.permanent)
    .forEach(([longStoreName, store]) => {
      const asStoreName = storeNames.activityState.name

      if (store.name === asStoreName && !QuickStorage.stores[asStoreName]) {
        QuickStorage.stores[asStoreName] = inMemoryAvailable ? [convertRecord({
          storeName: longStoreName,
          record: activityState,
          dir: 'left'
        })] : []
      } else if (!QuickStorage.stores[store.name]) {
        QuickStorage.stores[store.name] = []
      }
    })

  Preferences.recover()

  return {status: 'success'}
}

/**
 * Get list of composite keys if available
 * @param options
 * @returns {Array|null}
 * @private
 */
function _getCompositeKeys (options) {
  return options.fields[options.keyPath].composite || null
}

/**
 * Get composite keys when defined or fallback to primary key for particular store
 *
 * @param {string} storeName
 * @returns {Array}
 * @private
 */
function _getKeys (storeName) {
  const options = SchemeMap.right[convertStoreName({storeName, dir: 'right'})]

  return _getCompositeKeys(options, true) || [options.keyPath]
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
  const options = SchemeMap.right[convertStoreName({storeName, dir: 'right'})]

  if (open.status === 'error') {
    return Promise.reject(open.error)
  }

  return new Promise((resolve, reject) => {
    const items = QuickStorage.stores[storeName]
    const keys = _getKeys(storeName)
    const ids = id instanceof Array ? id.slice() : [id]
    const lastId = (items[items.length - 1] || {})[options.keyPath] || 0
    const target = id
      ? keys
        .map((key, index) => [key, ids[index]])
        .reduce(reducer, {})
      : {...item}


    const index = target ? findIndex(items, keys, target) : null

    return action(resolve, reject, {keys, items, index, options, lastId})
  })
}

/**
 * Sort the array by provided key (key can be a composite one)
 * - by default sorts in ascending order by primary keys
 * - force order by provided value
 *
 * @param {Array} items
 * @param {Array} keys
 * @param {string=} exact
 * @returns {Array}
 * @private
 */
function _sort (items, keys, exact) {
  const clone = [...items]
  const reversed = keys.slice().reverse()

  function compare (a, b, key) {
    const expr1 = exact ? exact === a[key] : a[key] < b[key]
    const expr2 = exact ? exact > a[key] : a[key] > b[key]

    return expr1 ? -1 : (expr2 ? 1 : 0)
  }

  return clone.sort((a, b) => reversed
    .reduce((acc, key) => {
      return acc || compare(a, b, key)
    }, 0))
}

/**
 * Prepare the target to be queried depending on the composite key if defined
 *
 * @param {Object} options
 * @param {*} target
 * @param {number} next
 * @returns {*}
 * @private
 */
function _prepareTarget (options, target, next) {
  const composite = _getCompositeKeys(options)
  return composite
    ? {[options.keyPath]: composite.map(key => target[key]).join(''), ...target}
    : options.autoIncrement && next
      ? {[options.keyPath]: next, ...target}
      : {...target}
}

/**
 * Prepare the result to be return depending on the composite key definition
 *
 * @param {Object} options
 * @param {Object} target
 * @returns {*}
 * @private
 */
function _prepareResult (options, target) {
  const composite = _getCompositeKeys(options)
  return composite && isObject(target)
    ? composite.map(key => target[key])
    : (target[options.keyPath] || target)
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
  return _initRequest({storeName, id}, (resolve, reject, {items, index, options}) => {
    if (index === -1) {
      reject({name: 'NotRecordFoundError', message: `Requested record not found in "${storeName}" store`})
    } else {
      resolve(_prepareTarget(options, items[index]))
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
    .then(result => result
      .filter(item => {
        return item[SchemeMap.right[convertStoreName({storeName, dir: 'right'})].index] === by
      }))
}

/**
 * Add item to a particular store
 *
 * @param {string} storeName
 * @param {Object} item
 * @returns {Promise}
 */
function addItem (storeName, item) {
  return _initRequest({storeName, item}, (resolve, reject, {items, index, options, lastId}) => {
    if (index !== -1) {
      reject({name: 'ConstraintError', message: `Constraint was not satisfied, trying to add existing item into "${storeName}" store`})
    } else {
      items.push(_prepareTarget(options, item, (lastId + 1)))
      QuickStorage.stores[storeName] = items
      resolve(_prepareResult(options, item))
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
  return _initRequest({storeName}, (resolve, reject, {keys, items, options, lastId}) => {
    if (!target || target && !target.length) {
      return reject({name: 'NoTargetDefined', message: `No array provided to perform add bulk operation into "${storeName}" store`})
    }

    let id = lastId
    const newItems = target
      .map(item => _prepareTarget(options, item, ++id))

    const overlapping = newItems
      .filter(item => findIndex(items, keys, item) !== -1)
      .map(item => item[options.keyPath])

    const currentItems = overwrite ? items.filter(item => overlapping.indexOf(item[options.keyPath]) === -1) : [...items]

    if (overlapping.length && !overwrite) {
      reject({name: 'ConstraintError', message: `Constraint was not satisfied, trying to add existing items into "${storeName}" store`})
    } else {
      QuickStorage.stores[storeName] = _sort([...currentItems, ...newItems], keys)
      resolve(target.map(item => _prepareResult(options, item)))
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
  return _initRequest({storeName, item}, (resolve, _, {items, index, options, lastId}) => {
    const nextId = index === -1 ? (lastId + 1) : null
    const target = _prepareTarget(options, item, nextId)

    if (index === -1) {
      items.push(target)
    } else {
      items.splice(index, 1, target)
    }

    QuickStorage.stores[storeName] = items
    resolve(_prepareResult(options, item))
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
 * @param {number|string} value
 * @returns {number}
 * @private
 */
function _findMax (array, key, value) {

  if (!array.length) {
    return -1
  }

  let max = {index: -1, value: (isNaN(value) ? '' : 0)}

  for (let i = 0; i < array.length; i += 1) {
    if (array[i][key] <= value) {
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
 * @param {*} value
 * @param {string=} condition
 * @returns {Promise}
 */
function deleteBulk (storeName, value, condition) {
  return getAll(storeName)
    .then(items => {

      const keys = _getKeys(storeName)
      const key = SchemeMap.right[convertStoreName({storeName, dir: 'right'})].index || keys[0]
      const exact = condition ? null : value
      const sorted = _sort(items, keys, exact)
      const index = _findMax(sorted, key, value)

      if (index === -1) {
        return []
      }

      const start = condition === 'lowerBound' ? index : 0
      const end = !condition || condition === 'upperBound' ? (index + 1) : sorted.length
      const deleted = sorted
        .splice(start, end)
        .map(item => keys.length === 1
          ? item[key]
          : keys.map(k => item[k]))

      QuickStorage.stores[storeName] = sorted

      return deleted
    })
}

/**
 * Trim the store from the left by specified length
 *
 * @param {string} storeName
 * @param {number} length
 * @returns {Promise}
 */
function trimItems (storeName, length) {
  const open = _open()
  const options = SchemeMap.right[convertStoreName({storeName, dir: 'right'})]

  if (open.status === 'error') {
    return Promise.reject(open.error)
  }

  return getAll(storeName)
    .then(records => records.length ? records[length - 1] : null)
    .then(record => record ? deleteBulk(storeName, record[options.keyPath], 'upperBound') : [])
}

/**
 * Count the number of records in the store
 *
 * @param {string} storeName
 * @returns {Promise}
 */
function count (storeName) {
  const open = _open()

  if (open.status === 'error') {
    return Promise.reject(open.error)
  }

  return Promise.resolve(QuickStorage.stores[storeName].length)
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
  trimItems,
  count,
  clear,
  destroy
}
