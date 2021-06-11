import Globals from '../globals'
import SchemeMap from './scheme-map'
import ActivityState from '../activity-state'
import QuickStorage from './quick-storage'
import Logger from '../logger'
import { recover as recoverPreferences } from '../preferences'
import { isEmpty, isObject, entries, values } from '../utilities'
import { Direction, convertRecord, convertStoreName } from './converter'
import { IStorage } from './types'

enum Action {
  add = 'add',
  put = 'put',
  get = 'get',
  list = 'list',
  clear = 'clear',
  delete = 'delete',
}

type Request = {
  storeName: string;
  action: Action;
  target?: any;
  mode?: IDBTransactionMode;
  range?: Nullable<IDBKeyRange>;
  firstOnly?: boolean;
}

type Transaction = {
  transaction: IDBTransaction;
  store: IDBObjectStore;
  index: IDBIndex;
  options: any;
}

class IndexedDBWrapper implements IStorage {
  private static dbValidationName = 'validate-db-openable'

  private dbDefaultName = Globals.namespace

  private dbName = this.dbDefaultName

  private dbVersion = 1

  private idbFactory: IDBFactory

  private indexedDbConnection: Nullable<IDBDatabase> = null

  private notSupportedError = { name: 'IDBNotSupported', message: 'IndexedDB is not supported' }

  private databaseOpenError = { name: 'CannotOpenDatabaseError', message: 'Cannot open a database' }

  private noConnectionError = { name: 'NoDatabaseConnection', message: 'Cannot open a transaction' }

  /**
   * Cached promise of IndexedDB validation
   */
  private static isSupportedPromise: Nullable<Promise<boolean>> = null

  /**
   * Tries to open a temporary database
   */
  private static tryOpen(db: IDBFactory): Promise<boolean> {

    return new Promise((resolve) => {
      try {
        const request = db.open(IndexedDBWrapper.dbValidationName)

        request.onsuccess = () => {
          request.result.close()
          db.deleteDatabase(IndexedDBWrapper.dbValidationName)
          resolve(true)
        }
        request.onerror = () => resolve(false)
      } catch (error) {
        resolve(false)
      }
    })
  }

  /**
   * Check if IndexedDB is supported in the current browser (exclude iOS forcefully)
   */
  public static isSupported(): Promise<boolean> {
    if (IndexedDBWrapper.isSupportedPromise) {
      return IndexedDBWrapper.isSupportedPromise
    } else {
      IndexedDBWrapper.isSupportedPromise = new Promise(resolve => {
        const indexedDB = IndexedDBWrapper.getIndexedDB()
        const iOS = !!navigator.platform && /iPad|iPhone|iPod/.test(navigator.platform)

        if (!indexedDB || iOS) {
          Logger.warn('IndexedDB is not supported in this browser')
          resolve(false)
        } else {
          const dbOpenablePromise = IndexedDBWrapper.tryOpen(indexedDB)
            .then((dbOpenable) => {
              if (!dbOpenable) {
                Logger.warn('IndexedDB is not supported in this browser')
              }

              return dbOpenable
            })

          resolve(dbOpenablePromise)
        }
      })
    }

    return IndexedDBWrapper.isSupportedPromise
  }

  /**
   * Get indexedDB instance
   */
  private static getIndexedDB(): Maybe<IDBFactory> {
    return window.indexedDB ||
      window.mozIndexedDB ||
      window.webkitIndexedDB ||
      window.msIndexedDB
  }

  constructor() {
    const idb = IndexedDBWrapper.getIndexedDB()
    if (!idb) {
      throw this.notSupportedError
    }

    this.idbFactory = idb
  }

  /**
   * Sets custom name if provided and migrates database
   */
  setCustomName(customName?: string): Promise<void> {
    if (customName && customName.length > 0) {
      this.dbName = `${Globals.namespace}-${customName}`
      return this.migrateDb(this.dbDefaultName, this.dbName)
    }

    return Promise.resolve()
  }

  /**
   * Opens database with defined name and resolves with database connection if successed
   * @param name name of database to open
   * @param version optional version of database schema
   * @param upgradeCallback optional `IDBOpenRequest.onupgradeneeded` event handler
   */
  private openDatabase(name: string, version?: number, upgradeCallback?: (event: IDBVersionChangeEvent, reject: () => void) => void): Promise<IDBDatabase> {

    return IndexedDBWrapper.isSupported()
      .then(supported => {
        if (!supported) {
          return Promise.reject(this.notSupportedError)
        } else {

          return new Promise((resolve, reject) => {
            const request = this.idbFactory.open(name, version)

            if (upgradeCallback) {
              request.onupgradeneeded = (event) => upgradeCallback(event, reject)
            }

            request.onsuccess = (event: IDBOpenDBEvent) => {
              const connection = event.target.result
              if (connection) {
                resolve(connection)
              } else {
                reject(this.databaseOpenError)
              }
            }

            request.onerror = reject
          })
        }
      })
  }

  /**
   * Checks if database with passed name exists
   */
  private databaseExists(name: string): Promise<boolean> {
    return new Promise((resolve: (result: boolean) => void) => {
      let existed = true

      this.openDatabase(name, undefined, () => { existed = false })
        .then(connection => {
          connection.close()

          if (existed) {
            return
          }

          // We didn't have this database before the check, so remove it
          return this.deleteDatabaseByName(name)
        })
        .then(() => resolve(existed))
    })
  }

  private cloneData(defaultDbConnection: IDBDatabase, customDbConnection: IDBDatabase): Promise<void> {

    // Function to clone a single store
    const cloneStore = (storeName: string) => {
      const connection = this.indexedDbConnection
      this.indexedDbConnection = defaultDbConnection

      return this.getAll(storeName) // Get all records from default-named database
        .then((records: Array<any>) => {
          this.indexedDbConnection = customDbConnection

          if (records.length < 1) { // There is no records in the store
            return
          }

          return this.addBulk(storeName, records, true) // Put all records into custom-named database
        })
        .then(() => {
          this.indexedDbConnection = connection // Restore initial state
        })
    }

    // Get names of stores
    const storeNames: string[] = values(SchemeMap.storeNames.left)
      .filter(store => !store.permanent)
      .map(store => store.name)

    const cloneStorePromises = storeNames.map(name => () => cloneStore(name))

    // Run clone operations one by one
    return cloneStorePromises.reduce(
      (previousTask, currentTask) => previousTask.then(currentTask),
      Promise.resolve()
    )
  }

  /**
   * Migrates created database with default name to custom
   * The IndexedDb API doesn't provide method to rename existing database so we have to create a new database, clone
   * data and remove the old one.
   */
  private migrateDb(defaultName: string, customName: string): Promise<void> {
    return this.databaseExists(defaultName)
      .then((defaultExists) => {
        if (defaultExists) {
          // Migration hadn't finished yet
          return Promise.all([
            this.openDatabase(defaultName, this.dbVersion, this.handleUpgradeNeeded), // Open the default database, migrate version if needed
            this.openDatabase(customName, this.dbVersion, this.handleUpgradeNeeded), // Open or create a new database, migrate version if needed
          ])
            .then(([defaultDbConnection, customDbConnection]) => {
              return this.cloneData(defaultDbConnection, customDbConnection)
                .then(() => {
                  this.indexedDbConnection = customDbConnection

                  defaultDbConnection.close()
                  return this.deleteDatabaseByName(defaultName)
                })
            })
            .then(() => Logger.info('Database migration finished'))

        } else {
          // There is no default-named database, let's just create or open a custom-named one
          return this.openDatabase(customName, this.dbVersion, this.handleUpgradeNeeded)
            .then(customDbConnection => { this.indexedDbConnection = customDbConnection })
        }
      })
  }

  /**
   * Handle database upgrade/initialization
   * - store activity state from memory if database unexpectedly got lost in the middle of the window session
   * - migrate data from localStorage if available on browser upgrade
   */
  private handleUpgradeNeeded(e: IDBVersionChangeEvent, reject: (reason: any) => void) {
    const db = e.target.result

    e.target.transaction.onerror = reject
    e.target.transaction.onabort = reject

    const storeNames = SchemeMap.storeNames.left
    const activityState = ActivityState.current || {}
    const inMemoryAvailable = activityState && !isEmpty(activityState)

    entries(storeNames)
      .filter(([, store]) => !store.permanent)
      .forEach(([longStoreName, store]) => {
        const options = SchemeMap.right[longStoreName]
        const objectStore = db.createObjectStore(store.name, {
          keyPath: options.keyPath,
          autoIncrement: options.autoIncrement || false
        })

        if (options.index) {
          objectStore.createIndex(`${options.index}Index`, options.index)
        }

        if (store.name === storeNames.activityState.name && inMemoryAvailable) {
          objectStore.add(convertRecord({
            storeName: longStoreName,
            record: activityState,
            dir: Direction.left
          }))
          Logger.info('Activity state has been recovered')
        } else if (QuickStorage.stores[store.name]) {
          QuickStorage.stores[store.name].forEach(record => objectStore.add(record))
          Logger.info(`Migration from localStorage done for ${longStoreName} store`)
        }
      })

    recoverPreferences()
    QuickStorage.clear()
  }

  /**
   * Open the database connection and create store if not existent
   */
  private open(): Promise<{ success: boolean }> {
    if (this.indexedDbConnection) {
      return Promise.resolve({ success: true })
    }

    return this.openDatabase(this.dbName, this.dbVersion, this.handleUpgradeNeeded)
      .then(connection => {
        this.indexedDbConnection = connection
        this.indexedDbConnection.onclose = () => this.destroy
        return ({ success: true })
      })
  }

  /**
   * Get transaction and the store
   */
  private getTransactionStore({ storeName, mode }: { storeName: string, mode: IDBTransactionMode }, reject: (reason: any) => void, db: IDBDatabase): Transaction {
    const transaction: IDBTransaction = db.transaction([storeName], mode)
    const store = transaction.objectStore(storeName)
    const options = SchemeMap.right[convertStoreName({ storeName, dir: Direction.right })]
    let index

    if (options.index) {
      index = store.index(`${options.index}Index`)
    }

    transaction.onerror = reject
    transaction.onabort = reject

    return { transaction, store, index, options }
  }

  /**
   * Override the error by extracting only name and message of the error
   */
  private overrideError(reject, error): Promise<never> {
    const { name, message } = error.target.error
    return reject({ name, message })
  }

  /**
   * Get list of composite keys if available
   */
  private getCompositeKeys(options): Nullable<Array<string>> {
    return options.fields[options.keyPath].composite || null
  }

  /**
   * Prepare the target to be queried depending on the composite key if defined
   */
  private prepareTarget(options, target, action: Action) {
    const addOrPut = [Action.add, Action.put].indexOf(action) !== -1
    const composite = this.getCompositeKeys(options)

    return composite
      ? addOrPut
        ? { [options.keyPath]: composite.map(key => target[key]).join(''), ...target }
        : target ? target.join('') : null
      : target
  }

  /**
   * Prepare the result to be return depending on the composite key definition
   */
  private prepareResult(options, target) {
    const composite = this.getCompositeKeys(options)
    return composite && isObject(target)
      ? composite.map(key => target[key])
      : null
  }

  /**
   * Initiate the database request
   */
  private initRequest({ storeName, target = null, action, mode = 'readonly' as IDBTransactionMode }: Request): Promise<any> {
    return this.open()
      .then(() => {
        return new Promise((resolve, reject) => {
          if (!this.indexedDbConnection) {
            reject(this.noConnectionError)
          } else {
            const { store, options } = this.getTransactionStore({ storeName, mode }, reject, this.indexedDbConnection)
            const request = store[action](this.prepareTarget(options, target, action))
            const result = this.prepareResult(options, target)

            request.onsuccess = () => {
              if (action === Action.get && !request.result) {
                reject({ name: 'NotRecordFoundError', message: `Requested record not found in "${storeName}" store` })
              } else {
                resolve(result || request.result || target)
              }
            }

            request.onerror = error => this.overrideError(reject, error)
          }
        })
      })
  }

  /**
   * Initiate bulk database request by reusing the same transaction to perform the operation
   */
  private initBulkRequest({ storeName, target, action, mode = 'readwrite' }: Request): Promise<any> {
    if (!target || target && !target.length) {
      return Promise.reject({ name: 'NoTargetDefined', message: `No array provided to perform ${action} bulk operation into "${storeName}" store` })
    }

    return this.open()
      .then(() => {
        return new Promise((resolve, reject) => {
          if (!this.indexedDbConnection) {
            reject(this.noConnectionError)
          } else {
            const { transaction, store, options } = this.getTransactionStore({ storeName, mode }, reject, this.indexedDbConnection)
            const result = new Array<any>()
            let current = target[0]

            transaction.oncomplete = () => resolve(result)

            const request = (req) => {
              req.onerror = error => this.overrideError(reject, error)
              req.onsuccess = () => {
                result.push(this.prepareResult(options, current) || req.result)

                current = target[result.length]

                if (result.length < target.length) {
                  request(store[action](this.prepareTarget(options, current, action)))
                }
              }
            }

            request(store[action](this.prepareTarget(options, current, action)))
          }
        })
      })
  }

  /**
   * Open cursor for bulk operations or listing
   */
  private openCursor({ storeName, action, range = null, firstOnly = false, mode = 'readonly' }: Request): Promise<any | Array<any>> {
    return this.open()
      .then(() => {
        return new Promise((resolve, reject) => {
          if (!this.indexedDbConnection) {
            reject(this.noConnectionError)
          } else {
            const { transaction, store, index, options } = this.getTransactionStore({ storeName, mode }, reject, this.indexedDbConnection)

            const cursorRequest: OpenIDBCursorRequest = (index || store).openCursor(range)
            const items = new Array<any>()

            transaction.oncomplete = () => resolve(firstOnly ? items[0] : items)

            cursorRequest.onsuccess = e => {
              const cursor = e.target.result

              if (cursor) {
                if (action === Action.delete) {
                  cursor.delete()
                  items.push(this.prepareResult(options, cursor.value) || cursor.value[options.keyPath])
                } else {
                  items.push(cursor.value)
                }

                if (!firstOnly) {
                  cursor.continue()
                }
              }
            }

            cursorRequest.onerror = error => this.overrideError(reject, error)
          }
        })
      })
  }

  private deleteDatabaseByName(dbName: string): Promise<any> {
    return new Promise((resolve, reject) => {
      const request = this.idbFactory.deleteDatabase(dbName)

      request.onerror = error => this.overrideError(reject, error)
      request.onsuccess = resolve
      request.onblocked = e => reject(e.target)
    })
  }

  /**
   * Get all records from particular store
   */
  getAll(storeName: string, firstOnly = false): Promise<any | Array<any>> {
    return this.openCursor({ storeName, action: Action.list, firstOnly })
  }

  /**
   * Get the first row from the store
   */
  getFirst(storeName: string): Promise<any> {
    return this.getAll(storeName, true)
  }

  /**
   * Get item from a particular store
   */
  getItem(storeName: string, target: any): Promise<any> {
    return this.initRequest({ storeName, target, action: Action.get })
  }

  /**
   * Return filtered result by value on available index
   */
  filterBy(storeName: string, by: string): Promise<any> {

    const range = IDBKeyRange.only(by)

    return this.openCursor({ storeName, action: Action.list, range })
  }

  /**
   * Add item to a particular store
   */
  addItem(storeName: string, target): Promise<any> {
    return this.initRequest({ storeName, target, action: Action.add, mode: 'readwrite' })
  }

  /**
   * Add multiple items into particular store
   */
  addBulk(storeName: string, target, overwrite: boolean): Promise<any> {
    return this.initBulkRequest({ storeName, target, action: (overwrite ? Action.put : Action.add), mode: 'readwrite' })
  }

  /**
   * Update item in a particular store
   */
  updateItem(storeName: string, target): Promise<any> {
    return this.initRequest({ storeName, target, action: Action.put, mode: 'readwrite' })
  }

  /**
   * Delete item from a particular store
   */
  deleteItem(storeName: string, target): Promise<any> {
    return this.initRequest({ storeName, target, action: Action.delete, mode: 'readwrite' })
  }

  /**
   * Delete items until certain bound (primary key as a bound scope)
   */
  deleteBulk(storeName: string, value: any, condition?: 'lowerBound' | 'upperBound'): Promise<any> {
    const range = condition
      ? IDBKeyRange[condition](value)
      : IDBKeyRange.only(value)

    return this.openCursor({ storeName, action: Action.delete, range, mode: 'readwrite' })
  }

  /**
   * Trim the store from the left by specified length
   */
  trimItems(storeName: string, length: number): Promise<any> {
    const options = SchemeMap.right[convertStoreName({ storeName, dir: Direction.right })]

    return this.getAll(storeName)
      .then(records => records.length ? records[length - 1] : null)
      .then(record => record ? this.deleteBulk(storeName, record[options.keyPath], 'upperBound') : [])
  }

  /**
   * Count the number of records in the store
   */
  count(storeName: string): Promise<number> {
    return this.open()
      .then(() => {
        return new Promise((resolve, reject) => {
          if (!this.indexedDbConnection) {
            reject(this.noConnectionError)
          } else {
            const { store } = this.getTransactionStore({ storeName, mode: 'readonly' }, reject, this.indexedDbConnection)

            const request = store.count()

            request.onsuccess = () => resolve(request.result)
            request.onerror = error => this.overrideError(reject, error)
          }
        })
      })
  }

  /**
   * Clear all records from a particular store
   */
  clear(storeName: string): Promise<any> {
    return this.initRequest({ storeName, action: Action.clear, mode: 'readwrite' })
  }

  /**
   * Close the database and destroy the reference to it
   */
  destroy() {
    if (this.indexedDbConnection) {
      this.indexedDbConnection.close()
    }
    this.indexedDbConnection = null
  }

  /**
   * Close db connection and delete the db
   * WARNING: should be used only by adjust's demo app!
   */
  deleteDatabase(): Promise<any> {
    this.destroy()

    return this.deleteDatabaseByName(this.dbName)
  }

}

export { IndexedDBWrapper as IndexedDB }
