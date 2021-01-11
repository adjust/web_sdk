import * as IndexedDB from './indexeddb'
import * as LocalStorage from './localstorage'
import Logger from '../logger'
import { reducer, entries } from '../utilities'
import {
  convertRecord,
  convertRecords,
  convertValues,
  encodeValue,
  convertStoreName,
  decodeErrorMessage
} from './converter'
import { STORAGE_TYPES } from '../constants'

/**
 * Methods to extend
 *
 * @type {Object}
 * @private
 */
const _methods = {
  getAll: _getAll,
  getFirst: _getFirst,
  getItem: _getItem,
  filterBy: _filterBy,
  addItem: _addItem,
  addBulk: _addBulk,
  updateItem: _updateItem,
  deleteItem: _deleteItem,
  deleteBulk: _deleteBulk,
  trimItems: _trimItems,
  count: _count,
  clear: _clear,
  destroy: _destroy
}

/**
 * Extends storage's getAll method by decoding returned records
 *
 * @param {Object} storage
 * @param {string} storeName
 * @returns {Promise}
 * @private
 */
function _getAll (storage, storeName) {
  return storage.getAll(storeName)
    .then(records => convertRecords({storeName, dir: 'right', records}))
}

/**
 * Extends storage's getFirst method by decoding returned record
 *
 * @param {Object} storage
 * @param {string} storeName
 * @returns {Promise}
 * @private
 */
function _getFirst (storage, storeName) {
  return storage.getFirst(storeName)
    .then(record => convertRecord({storeName, dir: 'right', record}))
}

/**
 * Extends storage's getItem method by encoding target value and then decoding returned record
 *
 * @param {Object} storage
 * @param {string} storeName
 * @param {string|string[]} target
 * @returns {Promise}
 * @private
 */
function _getItem (storage, storeName, target) {
  return storage.getItem(storeName, convertValues({storeName, dir: 'left', target}))
    .then(record => convertRecord({storeName, dir: 'right', record}))
    .catch(error => Promise.reject(decodeErrorMessage({storeName, error})))
}

/**
 * Extends storage's filterBy method by encoding target value and then decoding returned records
 *
 * @param {Object} storage
 * @param {string} storeName
 * @param {string} target
 * @returns {Promise}
 * @private
 */
function _filterBy (storage, storeName, target) {
  return storage.filterBy(storeName, encodeValue(target))
    .then(records => convertRecords({storeName, dir: 'right', records}))
}

/**
 * Extends storage's addItem method by encoding target record and then decoding returned keys
 *
 * @param {Object} storage
 * @param {string} storeName
 * @param {Object} record
 * @returns {Promise}
 * @private
 */
function _addItem (storage, storeName, record) {
  return storage.addItem(storeName, convertRecord({storeName, dir: 'left', record}))
    .then(target => convertValues({storeName, dir: 'right', target}))
    .catch(error => Promise.reject(decodeErrorMessage({storeName, error})))
}

/**
 * Extends storage's addBulk method by encoding target records and then decoding returned keys
 *
 * @param {Object} storage
 * @param {string} storeName
 * @param {Object[]} records
 * @param {boolean} overwrite
 * @returns {Promise}
 * @private
 */
function _addBulk (storage, storeName, records, overwrite) {
  return storage.addBulk(storeName, convertRecords({storeName, dir: 'left', records}), overwrite)
    .then(values => values.map(target => convertValues({storeName, dir: 'right', target})))
    .catch(error => Promise.reject(decodeErrorMessage({storeName, error})))
}

/**
 * Extends storage's updateItem method by encoding target record and then decoding returned keys
 *
 * @param {Object} storage
 * @param {string} storeName
 * @param record
 * @returns {Promise}
 * @private
 */
function _updateItem (storage, storeName, record) {
  return storage.updateItem(storeName, convertRecord({storeName, dir: 'left', record}))
    .then(target => convertValues({storeName, dir: 'right', target}))
}

/**
 * Extends storage's deleteItem method by encoding target value and then decoding returned keys
 *
 * @param {Object} storage
 * @param {string} storeName
 * @param {string|string[]} target
 * @returns {Promise}
 * @private
 */
function _deleteItem (storage, storeName, target) {
  return storage.deleteItem(storeName, convertValues({storeName, dir: 'left', target}))
    .then(target => convertValues({storeName, dir: 'right', target}))
}

/**
 * Extends storage's deleteBulk method by encoding target value and then decoding returned records that are deleted
 *
 * @param {Object} storage
 * @param {string} storeName
 * @param {string} target
 * @param {string?} condition
 * @returns {Promise}
 * @private
 */
function _deleteBulk (storage, storeName, target, condition) {
  return storage.deleteBulk(storeName, encodeValue(target), condition)
    .then(records => records.map(record => convertValues({storeName, dir: 'right', target: record})))
}

/**
 * Extends storage's trimItems method by passing encoded storage name
 *
 * @param {Object} storage
 * @param {string} storeName
 * @param {number} length
 * @returns {Promise}
 * @private
 */
function _trimItems (storage, storeName, length) {
  return storage.trimItems(storeName, length)
}

/**
 * Extends storage's count method by passing encoded storage name
 *
 * @param {Object} storage
 * @param {string} storeName
 * @returns {Promise}
 * @private
 */
function _count (storage, storeName) {
  return storage.count(storeName)
}

/**
 * Extends storage's clear method by passing encoded storage name
 *
 * @param {Object} storage
 * @param {string} storeName
 * @returns {Promise}
 * @private
 */
function _clear (storage, storeName) {
  return storage.clear(storeName)
}

/**
 * Calls storage's destroy method
 *
 * @param {Object} storage
 * @private
 */
function _destroy (storage) {
  return storage.destroy()
}

/**
 * Augment whitelisted methods with encoding/decoding functionality
 *
 * @param {Object} storage
 * @returns {Object}
 * @private
 */
function _augment () {
  return entries(_methods)
    .map(([methodName, method]) => {
      return [methodName, (storeName, ...args) => {
        return init().then(storage => {
          if (storage) {
            return method.call(null, storage, convertStoreName({ storeName, dir: 'left' }), ...args)
          }
        })
      }]
    })
    .reduce(reducer, {})
}

/**
 * Type of available storage
 */
let type

/**
 * Returns type of used storage which is one of possible values INDEXED_DB, LOCAL_STORAGE or NO_STORAGE if there is no
 * storage available
 */
function getType () {
  return type
}

/**
 * Cached promise of Storage initialization
 */
let _initializationPromise = null

/**
 * Check which storage is available and pick it up
 * Prefer indexedDB over localStorage
 *
 * @returns Promise<{
 * getAll,
 * getFirst,
 * getItem,
 * filterBy,
 * addItem,
 * addBulk,
 * updateItem,
 * deleteItem,
 * deleteBulk,
 * trimItems,
 * count,
 * clear,
 * destroy
 * }|null>
 */
function init () {
  let storage

  if (_initializationPromise) {
    return _initializationPromise
  } else {
    _initializationPromise = IndexedDB.isSupported()
      .then(supported => {
        if (supported) {
          storage = IndexedDB
          type = STORAGE_TYPES.INDEXED_DB
        } else if (LocalStorage.isSupported()) {
          storage = LocalStorage
          type = STORAGE_TYPES.LOCAL_STORAGE
        }

        if (!type) {
          type = STORAGE_TYPES.NO_STORAGE
          Logger.error('There is no storage available, app will run with minimum set of features')
          return null
        }

        return {
          type,
          ...storage
        }
      })
  }

  return _initializationPromise
}

export default {
  init,
  getType,
  ..._augment()
}
