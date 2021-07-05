import { STORAGE_TYPES } from '../constants'
import Logger from '../logger'
import { entries, reducer } from '../utilities'
import {
  Direction,
  convertRecord,
  convertRecords,
  convertStoreName,
  convertValues,
  decodeErrorMessage,
  encodeValue,
} from './converter'
import { IndexedDB } from './indexeddb'
import { LocalStorage } from './localstorage'
import QuickStorage from './quick-storage'
import { ShortStoreName, StoreName } from './scheme'
import { IStorage, KeyRangeCondition, StoredRecord, StoredRecordId, StoredValue } from './types'

type OtherArgs = any[]  // eslint-disable-line @typescript-eslint/no-explicit-any

type CommonStorageMethod = (storage: IStorage, store: ShortStoreName, ...args: OtherArgs) => Promise<unknown> | void

type CommonStorageMethods = Record<keyof IStorage, CommonStorageMethod> & { deleteDatabase: CommonStorageMethod }

type StorageMethod = (store: StoreName, ...args: OtherArgs) => Promise<unknown>

type MethodName = keyof CommonStorageMethods

type StorageMethods = Record<MethodName, StorageMethod>

enum StorageType {
  noStorage = STORAGE_TYPES.NO_STORAGE,
  indexedDB = STORAGE_TYPES.INDEXED_DB,
  localStorage = STORAGE_TYPES.LOCAL_STORAGE
}

type Storage = {
  type: StorageType;
  storage: Nullable<IStorage>;
}

/**
 * Methods to extend
 */
const _methods: CommonStorageMethods = {
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
  destroy: _destroy,
  deleteDatabase: _deleteDatabase
}

/**
 * Extends storage's getAll method by decoding returned records
 */
function _getAll(storage: IStorage, storeName: ShortStoreName, firstOnly: boolean) {
  return storage.getAll(storeName, firstOnly)
    .then(records => convertRecords(storeName, Direction.right, records))
}

/**
 * Extends storage's getFirst method by decoding returned record
 */
function _getFirst(storage: IStorage, storeName: ShortStoreName) {
  return storage.getFirst(storeName)
    .then(record => convertRecord(storeName, Direction.right, record))
}

/**
 * Extends storage's getItem method by encoding target value and then decoding returned record
 */
function _getItem(storage: IStorage, storeName: ShortStoreName, target: StoredRecordId) {
  return storage.getItem(storeName, convertValues(storeName, Direction.left, target))
    .then(record => convertRecord(storeName, Direction.right, record))
    .catch(error => Promise.reject(decodeErrorMessage(storeName, error)))
}

/**
 * Extends storage's filterBy method by encoding target value and then decoding returned records
 */
function _filterBy(storage: IStorage, storeName: ShortStoreName, target: string) {
  return storage.filterBy(storeName, encodeValue(target))
    .then(records => convertRecords(storeName, Direction.right, records))
}

/**
 * Extends storage's addItem method by encoding target record and then decoding returned keys
 */
function _addItem(storage: IStorage, storeName: ShortStoreName, record: StoredRecord) {
  const convertedRecord = convertRecord(storeName, Direction.left, record)
  return storage.addItem(storeName, convertedRecord)
    .then(target => convertValues(storeName, Direction.right, target))
    .catch(error => Promise.reject(decodeErrorMessage(storeName, error)))
}

/**
 * Extends storage's addBulk method by encoding target records and then decoding returned keys
 */
function _addBulk(storage: IStorage, storeName: ShortStoreName, records: Array<StoredRecord>, overwrite: boolean) {
  const convertedRecords: Array<StoredRecord> = convertRecords(storeName, Direction.left, records)
  return storage.addBulk(storeName, convertedRecords, overwrite)
    .then(values => values.map(target => convertValues(storeName, Direction.right, target)))
    .catch(error => Promise.reject(decodeErrorMessage(storeName, error)))
}

/**
 * Extends storage's updateItem method by encoding target record and then decoding returned keys
 */
function _updateItem(storage: IStorage, storeName: ShortStoreName, record: StoredRecord) {
  const convertedRecord = convertRecord(storeName, Direction.left, record)
  return storage.updateItem(storeName, convertedRecord)
    .then(target => convertValues(storeName, Direction.right, target))
}

/**
 * Extends storage's deleteItem method by encoding target value and then decoding returned keys
 */
function _deleteItem(storage: IStorage, storeName: ShortStoreName, target: StoredRecordId) {
  return storage.deleteItem(storeName, convertValues(storeName, Direction.left, target))
    .then(target => convertValues(storeName, Direction.right, target))
}

/**
 * Extends storage's deleteBulk method by encoding target value and then decoding returned records that are deleted
 */
function _deleteBulk(storage: IStorage, storeName: ShortStoreName, value: StoredValue, condition?: KeyRangeCondition) {
  return storage.deleteBulk(storeName, encodeValue(value), condition)
    .then(records => records.map(record => convertValues(storeName, Direction.right, record)))
}

/**
 * Extends storage's trimItems method by passing encoded storage name
 */
function _trimItems(storage: IStorage, storeName: ShortStoreName, length: number) {
  return storage.trimItems(storeName, length)
}

/**
 * Extends storage's count method by passing encoded storage name
 */
function _count(storage: IStorage, storeName: ShortStoreName) {
  return storage.count(storeName)
}

/**
 * Extends storage's clear method by passing encoded storage name
 */
function _clear(storage: IStorage, storeName: ShortStoreName) {
  return storage.clear(storeName)
}

/**
 * Calls storage's destroy method
 */
function _destroy(storage: IStorage) {
  return storage.destroy()
}

/**
 * Calls storage's deleteDatabase method
 */
function _deleteDatabase(storage: IndexedDB | LocalStorage) {
  return storage.deleteDatabase()
}

/**
 * Augment whitelisted methods with encoding/decoding functionality
 */
function _augment(): StorageMethods {
  const methods: Array<[MethodName, StorageMethod]> = entries(_methods)
    .map(([methodName, method]: [MethodName, CommonStorageMethod]) => {

      const augmentedMethod: StorageMethod = (storeName: StoreName, ...args) => {
        return init()
          .then(({ storage }) => {
            if (storage) {
              return method.call(null, storage, convertStoreName(storeName, Direction.left), ...args)
            }
          })
      }

      return [methodName, augmentedMethod]
    })

  return methods.reduce(reducer, {} as StorageMethods)
}

/**
 * Type of available storage
 */
let type: StorageType

/**
 * Returns type of used storage which is one of possible values INDEXED_DB, LOCAL_STORAGE or NO_STORAGE if there is no
 * storage available
 */
function getType(): StorageType {
  return type
}

/**
 * Cached promise of Storage initialization
 */
let _initializationPromise: Nullable<Promise<Storage>> = null

/**
 * Check which storage is available and pick it up
 * Prefer indexedDB over localStorage
 */
function init(dbName?: string): Promise<Storage> {
  let storage: Nullable<IStorage> = null

  if (_initializationPromise !== null) {
    return _initializationPromise
  } else {
    _initializationPromise = Promise.all([IndexedDB.isSupported(), LocalStorage.isSupported()])
      .then(([idbSupported, lsSupported]) => {
        QuickStorage.setCustomName(dbName)

        if (idbSupported) {
          type = StorageType.indexedDB
          const idb = new IndexedDB()
          return idb.setCustomName(dbName).then(() => storage = idb)
        } else if (lsSupported) {
          type = StorageType.localStorage
          storage = new LocalStorage()
          return Promise.resolve(storage)
        } else {
          Logger.error('There is no storage available, app will run with minimum set of features')
          type = StorageType.noStorage
          storage = null
          return Promise.resolve(storage)
        }
      })
      .then(() => {
        return {
          type,
          storage
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
