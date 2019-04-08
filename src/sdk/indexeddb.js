import Config from './config'
import ActivityState from './activity-state'
import QuickStorage from './quick-storage'
import {isEmpty} from './utilities'

const _dbName = Config.namespace
const _dbVersion = 1
let _db

/**
 * Check if IndexedDB is supported in the current browser (exclude iOS forcefully)
 *
 * @param {boolean=} toThrow
 * @returns {boolean}
 */
function isSupported (toThrow) {
  const indexedDB = _getIDB()
  const iOS = !!navigator.platform && /iPad|iPhone|iPod/.test(navigator.platform)
  const supported = !!indexedDB && !iOS

  if (toThrow && !supported) {
    throw Error('IndexedDB is not supported in this browser')
  } else {
    return supported
  }
}

/**
 * Get indexedDB instance
 *
 * @returns {IDBFactory}
 * @private
 */
function _getIDB () {
  return window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB
}

/**
 * Return data to migrate from localStorage if available
 *
 * @returns {Object|null}
 * @private
 */
function _migrationNeeded () {

  const scheme = QuickStorage._scheme

  const validScheme = !!(scheme && scheme.queue && scheme.activityState)

  if (validScheme) {
    return {
      queue: QuickStorage.queue || [],
      activityState: QuickStorage.activityState[0]
    }
  }

  return null
}

/**
 * Handle database upgrade/initialization
 * - store activity state from memory if database unexpectedly got lost in the middle of the window session
 * - migrate data from localStorage if available on browser upgrade
 *
 * @param {Object} e
 * @param {Function} reject
 * @private
 */
function _handleUpgradeNeeded (e, reject) {

  const db = e.target.result

  e.target.transaction.onerror = reject
  e.target.transaction.onabort = reject

  const migration = _migrationNeeded()
  const inMemoryAvailable = ActivityState.current && !isEmpty(ActivityState.current)
  const activityStateStore = db.createObjectStore('activityState', {keyPath: 'uuid', autoIncrement: false})
  const queueStore = db.createObjectStore('queue', {keyPath: 'timestamp', autoIncrement: false})

  if (inMemoryAvailable) {
    activityStateStore.add(ActivityState.current)
  }

  if (migration) {
    migration.queue.forEach(pending => queueStore.add(pending))

    if (!inMemoryAvailable && migration.activityState) {
      activityStateStore.add(migration.activityState)
    }

    QuickStorage.clear()
  }
}

/**
 * Handle successful database opening
 *
 * @param {Object} e
 * @param {Function} resolve
 * @private
 */
function _handleOpenSuccess (e, resolve) {

  _db = e.target.result

  resolve({success: true})

  _db.onclose = destroy
}

/**
 * Open the database connection and create store if not existent
 *
 * @returns {Promise}
 * @private
 */
function _open () {

  const indexedDB = _getIDB()

  isSupported(true)

  return new Promise((resolve, reject) => {

    if (_db) {
      resolve({success: true})
      return
    }

    const request = indexedDB.open(_dbName, _dbVersion)

    request.onupgradeneeded = e => _handleUpgradeNeeded(e, reject)
    request.onsuccess = e => _handleOpenSuccess(e, resolve)
    request.onerror = reject
  })
}

/**
 * Get transaction and the store
 *
 * @param {string} storeName
 * @param {string} [mode=readonly]
 * @param {Function} reject
 * @returns {{transaction, store: *|IDBObjectStore}}
 * @private
 */
function _getTranStore ({storeName, mode = 'readonly'}, reject) {

  const transaction = _db.transaction([storeName], mode)
  const store = transaction.objectStore(storeName)

  transaction.onerror = reject
  transaction.onabort = reject

  return {transaction, store}
}

/**
 * Initiate the database request
 *
 * @param {string} storeName
 * @param {Object=} target
 * @param {string} action
 * @param {string} [mode=readonly]
 * @returns {Promise}
 * @private
 */
function _initRequest ({storeName, target, action, mode = 'readonly'}) {
  return _open()
    .then(() => {
      return new Promise((resolve, reject) => {
        const {store} = _getTranStore({storeName, mode}, reject)
        const request = store[action](target)

        request.onsuccess = () => {
          if (action === 'get' && !request.result) {
            reject({name: 'NotFoundError', message: `No record found with ${store.keyPath} ${target} in ${storeName} store`})
          } else {
            resolve(request.result || target)
          }
        }
        request.onerror = reject
      })
    })
}

/**
 * Open cursor for bulk operations or listing
 *
 * @param {string} storeName
 * @param {string} action
 * @param {IDBKeyRange=} range
 * @param {boolean=} firstOnly
 * @param {string} [mode=readonly]
 * @returns {Promise}
 * @private
 */
function _openCursor ({storeName, action, range, firstOnly, mode = 'readonly'}) {
  return _open()
    .then(() => {
      return new Promise((resolve, reject) => {
        const {transaction, store} = _getTranStore({storeName, mode}, reject)
        const cursorRequest = store.openCursor(range)
        const items = []

        transaction.oncomplete = () => resolve(firstOnly ? items[0] : items)

        cursorRequest.onsuccess = e => {

          const cursor = e.target.result

          if (cursor) {
            items.push(cursor.value)

            if (action === 'delete') {
              cursor.delete()
            }

            if (!firstOnly) {
              cursor.continue()
            }
          }
        }

        cursorRequest.onerror = reject
      })
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
  return _openCursor({storeName, action: 'list', firstOnly})
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
  return _initRequest({storeName, target: id, action: 'get'})
}

/**
 * Add item to a particular store
 *
 * @param {string} storeName
 * @param {Object} item
 * @returns {Promise}
 */
function addItem (storeName, item) {
  return _initRequest({storeName, target: item, action: 'add', mode: 'readwrite'})
}

/**
 * Update item in a particular store
 *
 * @param {string} storeName
 * @param {Object} item
 * @returns {Promise}
 */
function updateItem (storeName, item) {
  return _initRequest({storeName, target: item, action: 'put', mode: 'readwrite'})
}

/**
 * Delete item from a particular store
 *
 * @param {string} storeName
 * @param {*} id
 * @returns {Promise}
 */
function deleteItem (storeName, id) {
  return _initRequest({storeName, target: id, action: 'delete', mode: 'readwrite'})
}

/**
 * Delete items until certain bound (primary key as a bound scope)
 *
 * @param {string} storeName
 * @param {*} upperBound
 * @returns {Promise}
 */
function deleteBulk (storeName, upperBound) {

  const range = IDBKeyRange.upperBound(upperBound)

  return _openCursor({storeName, action: 'delete', range, mode: 'readwrite'})
}

/**
 * Clear all records from a particular store
 *
 * @param {string} storeName
 * @returns {Promise}
 */
function clear (storeName) {
  return _initRequest({storeName, action: 'clear', mode: 'readwrite'})
}

/**
 * Close the database and destroy the reference to it
 */
function destroy () {
  if (_db) {
    _db.close()
  }
  _db = null
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

