import * as IndexedDB from './indexeddb'
import * as LocalStorage from './localstorage'
import Logger from '../logger'
import {extend, isObject, reducer} from '../utilities'
import {convertRecord, convertRecords, convertValues, encodeValue, convertStoreName, decodeErrorMessage} from './converter'

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
  clear: _clear
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
 * @param target
 * @returns {Promise}
 * @private
 */
function _deleteBulk (storage, storeName, target) {
  return storage.deleteBulk(storeName, isObject(target) ? target : encodeValue(target))
    .then(records => records.map(record => convertValues({storeName, dir: 'right', target: record})))
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
 * Augment whitelisted methods with encoding/decoding functionality
 *
 * @param {Object} storage
 * @returns {Object}
 * @private
 */
function _augment (storage) {
  return Object
    .entries(_methods)
    .map(([methodName, method]) => {
      return [methodName, (storeName, ...args) => {
        return method.call(null, storage, convertStoreName({storeName, dir: 'left'}), ...args)
      }]
    })
    .reduce(reducer, {})
}

/**
 * Check which storage is available and pick it up
 * Prefer indexedDB over localStorage
 *
 * @returns {{
 * isSupported?,
 * getAll?,
 * getFirst?,
 * getItem?,
 * filterBy?,
 * addItem?,
 * addBulk?,
 * updateItem?,
 * deleteItem?,
 * deleteBulk?,
 * clear?,
 * destroy?
 * }|null}
 */
function init () {
  let storage
  let type

  if (IndexedDB.isSupported()) {
    storage = IndexedDB
    type = 'indexedDB'
  } else if (LocalStorage.isSupported()) {
    storage = LocalStorage
    type = 'localStorage'
  }

  if (type) {
    return extend({
      type,
      isSupported: storage.isSupported,
      destroy: storage.destroy
    }, _augment(storage))
  }

  Logger.error('There is no storage available, app will run with minimum set of features')
  return null

}

export default init()

