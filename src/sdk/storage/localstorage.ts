import ActivityState from '../activity-state'
import Logger from '../logger'
import { recover as recoverPreferences } from '../preferences'
import { entries, findIndex, isEmpty, reducer, isLocalStorageSupported } from '../utilities'
import { convertRecord, convertStoreName, Direction } from './converter'
import QuickStorage from './quick-storage'
import { isCompositeKeyStoreField, ShortStoreName, StoreOptions } from './scheme'
import SchemeMap from './scheme-map'
import { Error, IStorage, KeyRangeCondition, StoredRecord, StoredRecordId, StoredValue, valueIsRecord } from './types'

type ActionParameters = { keys: Array<string>, items: Array<StoredRecord>, index: number, options: StoreOptions, lastId: Maybe<number> }

type RequestParameters = { storeName: ShortStoreName; id?: StoredRecordId; item?: StoredRecord }

type Action<T = StoredRecord | StoredRecordId | Array<StoredRecordId>> = (
  resolve: (value: T) => void,
  reject: (reason: Error) => void,
  parameters: ActionParameters
) => void

type StorageOpenStatus = { status: string; error?: Error }

class LocalStorageWrapper implements IStorage {

  /**
   * Cached promise of LocalStorage validation
   */
  private static isSupportedPromise: Nullable<Promise<boolean>> = null

  /**
   * Check if LocalStorage is supported in the current browser
   */
  static isSupported(): Promise<boolean> {

    if (LocalStorageWrapper.isSupportedPromise) {
      return LocalStorageWrapper.isSupportedPromise
    } else {
      LocalStorageWrapper.isSupportedPromise = new Promise((resolve: (value: boolean) => void) => {
        resolve(isLocalStorageSupported())
      })
        .catch(() => {
          Logger.warn('LocalStorage is not supported in this browser')
          return Promise.resolve(false)
        })
    }

    return LocalStorageWrapper.isSupportedPromise
  }

  /**
   * Prepare schema details if not existent
   */
  private open(): Promise<StorageOpenStatus> {

    return LocalStorageWrapper.isSupported()
      .then(supported => {
        if (!supported) {
          return { status: 'error', error: { name: 'LSNotSupported', message: 'LocalStorage is not supported' } }
        }

        const storeNames = SchemeMap.storeNames.left
        const activityState = ActivityState.current || {}
        const inMemoryAvailable = activityState && !isEmpty(activityState)

        entries(storeNames)
          .filter(([, store]) => !store.permanent)
          .forEach(([longStoreName, store]) => {
            const shortStoreName = store.name
            if (shortStoreName === ShortStoreName.ActivityState && !QuickStorage.stores[shortStoreName]) {
              QuickStorage.stores[shortStoreName] = inMemoryAvailable
                ? [convertRecord(longStoreName, Direction.left, activityState)]
                : []
            } else if (!QuickStorage.stores[shortStoreName]) {
              QuickStorage.stores[shortStoreName] = []
            }
          })

        recoverPreferences()

        return { status: 'success' }
      })
  }

  /**
   * Get list of composite keys if available
   */
  private getCompositeKeys(options: StoreOptions): Nullable<Array<string>> {
    const field = options.fields[options.keyPath]

    return isCompositeKeyStoreField(field) ? field.composite : null
  }

  /**
   * Get composite keys when defined or fallback to primary key for particular store
   */
  private getKeys(storeName: ShortStoreName): Array<string> {
    const name = convertStoreName(storeName, Direction.right)
    const options: StoreOptions = SchemeMap.right[name]

    return this.getCompositeKeys(options) || [options.keyPath]
  }

  /**
   * Return next index using the current one and undefined if current is undefined
   */
  private nextIndex(current: Maybe<number>): Maybe<number> {
    return typeof current === 'number' ? current + 1 : undefined
  }

  /**
   * Initiate quasi-database request
   */
  private initRequest<T>({ storeName, id, item }: RequestParameters, action: Action<T>): Promise<T> {

    const options = SchemeMap.right[convertStoreName(storeName, Direction.right)]

    return this.open()
      .then(open => {
        if (open.status === 'error') {
          return Promise.reject(open.error)
        }

        return new Promise<T>((resolve, reject) => {
          const items: Array<StoredRecord> = QuickStorage.stores[storeName]
          const keys = this.getKeys(storeName)
          const lastId = ((items[items.length - 1] || {})[options.keyPath] || 0) as number

          let target: StoredRecord

          if (!id) {
            target = { ...item }
          } else {
            const ids = Array.isArray(id) ? id.slice() : [id]
            target = keys
              .map((key, index) => [key, ids[index]])
              .reduce(reducer, {})
          }

          const index = target ? findIndex(items, keys, target) : 0

          return action(resolve, reject, { keys, items, index, options, lastId })
        })
      })
  }

  /**
   * Sort the array by provided key (key can be a composite one)
   * - by default sorts in ascending order by primary keys
   * - force order by provided value
   */
  private sort<T>(items: Array<T>, keys: Array<string>, exact?: Nullable<StoredValue>): Array<T> {
    const clone = [...items]
    const reversed = keys.slice().reverse()

    function compare(a: T, b: T, key: string) {
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
   */
  private prepareTarget(options: StoreOptions, target: StoredRecord, next?: number): StoredRecord {
    const composite = this.getCompositeKeys(options)
    return composite
      ? { [options.keyPath]: composite.map(key => target[key]).join(''), ...target }
      : options.autoIncrement && next
        ? { [options.keyPath]: next, ...target }
        : { ...target }
  }

  /**
   * Prepare the result to be return depending on the composite key definition
   */
  private prepareResult(options: StoreOptions, target: StoredRecord): StoredRecordId {
    const composite = this.getCompositeKeys(options)

    if (composite) {
      return composite
        .map(key => target[key])
        .filter((value): value is StoredValue => !valueIsRecord(value))
    }

    return target[options.keyPath] as StoredValue
  }

  /**
   * Get all records from particular store
   */
  getAll(storeName: ShortStoreName, firstOnly = false): Promise<Array<StoredRecord>> {
    return this.open()
      .then(open => {
        if (open.status === 'error') {
          return Promise.reject(open.error)
        }

        return new Promise((resolve, reject) => {
          const value = QuickStorage.stores[storeName]

          if (value instanceof Array) {
            resolve(firstOnly ? [value[0]] : this.sort(value, this.getKeys(storeName)))
          } else {
            reject({ name: 'NotFoundError', message: `No objectStore named ${storeName} in this database` })
          }
        })
      })
  }

  /**
   * Get the first row from the store
   */
  getFirst(storeName: ShortStoreName): Promise<Maybe<StoredRecord>> {
    return this.getAll(storeName, true)
      .then(all => all.length ? all[0] : undefined)
  }

  /**
   * Get item from a particular store
   */
  getItem(storeName: ShortStoreName, id: StoredRecordId): Promise<StoredRecord> {
    const action: Action<StoredRecord> = (resolve, reject, { items, index, options }) => {
      if (index === -1) {
        reject({ name: 'NotRecordFoundError', message: `Requested record not found in "${storeName}" store` })
      } else {
        resolve(this.prepareTarget(options, items[index]))
      }
    }

    return this.initRequest({ storeName, id }, action)
  }

  /**
   * Return filtered result by value on available index
   */
  filterBy(storeName: ShortStoreName, by: StoredValue): Promise<Array<StoredRecord>> {
    return this.getAll(storeName)
      .then((result: Array<StoredRecord>) => {
        return result.filter(item => {
          const store = SchemeMap.right[convertStoreName(storeName, Direction.right)]
          const indexedValue = store.index && item[store.index]
          return indexedValue === by
        })
      })
  }

  /**
   * Add item to a particular store
   */
  addItem(storeName: ShortStoreName, item: StoredRecord): Promise<StoredRecordId> {
    return this.initRequest({ storeName, item }, (resolve, reject, { items, index, options, lastId }) => {
      if (index !== -1) {
        reject({ name: 'ConstraintError', message: `Constraint was not satisfied, trying to add existing item into "${storeName}" store` })
      } else {
        items.push(this.prepareTarget(options, item, this.nextIndex(lastId)))
        QuickStorage.stores[storeName] = items
        resolve(this.prepareResult(options, item))
      }
    })
  }

  /**
   * Add multiple items into particular store
   */
  addBulk(storeName: ShortStoreName, target: Array<StoredRecord>, overwrite: boolean): Promise<Array<StoredRecordId>> {
    return this.initRequest({ storeName }, (resolve, reject, { keys, items, options, lastId }) => {
      if (!target || target && !target.length) {
        reject({ name: 'NoTargetDefined', message: `No array provided to perform add bulk operation into "${storeName}" store` })
        return
      }

      let id = lastId
      const newItems = target.map(item => this.prepareTarget(options, item, id = this.nextIndex(id)))

      const overlapping = newItems
        .filter(item => findIndex(items, keys, item) !== -1)
        .map(item => item[options.keyPath])

      const currentItems = overwrite ? items.filter(item => overlapping.indexOf(item[options.keyPath]) === -1) : [...items]

      if (overlapping.length && !overwrite) {
        reject({ name: 'ConstraintError', message: `Constraint was not satisfied, trying to add existing items into "${storeName}" store` })
      } else {
        QuickStorage.stores[storeName] = this.sort([...currentItems, ...newItems], keys)
        const result = target.map(item => this.prepareResult(options, item))
        resolve(result)
      }
    })
  }

  /**
   * Update item in a particular store
   */
  updateItem(storeName: ShortStoreName, item: StoredRecord): Promise<StoredRecordId> {
    return this.initRequest({ storeName, item }, (resolve, _, { items, index, options, lastId }) => {
      const nextId = index === -1 ? this.nextIndex(lastId) : undefined
      const target = this.prepareTarget(options, item, nextId)

      if (index === -1) {
        items.push(target)
      } else {
        items.splice(index, 1, target)
      }

      QuickStorage.stores[storeName] = items
      resolve(this.prepareResult(options, item))
    })
  }

  /**
   * Delete item from a particular store
   */
  deleteItem(storeName: ShortStoreName, id: StoredRecordId): Promise<StoredRecordId> {
    return this.initRequest({ storeName, id }, (resolve, _, { items, index }) => {
      if (index !== -1) {
        items.splice(index, 1)
        QuickStorage.stores[storeName] = items
      }

      resolve(id)
    })
  }

  /**
   * Find index of the item with the closest value to the bound
   */
  private findMax(array: Array<StoredRecord>, key: string, value: StoredValue): number {

    if (!array.length) {
      return -1
    }

    let max = { index: -1, value: (typeof value === 'string' ? '' : 0) }

    for (let i = 0; i < array.length; i += 1) {
      if (array[i][key] <= value) {
        if (array[i][key] >= max.value) {
          max = { value: array[i][key] as StoredValue, index: i }
        }
      } else {
        return max.index
      }
    }

    return max.index
  }

  /**
   * Delete items until certain bound (primary key as a bound scope)
   * Returns array of deleted elements
   */
  deleteBulk(storeName: ShortStoreName, value: StoredValue, condition?: KeyRangeCondition): Promise<Array<StoredRecordId>> {
    return this.getAll(storeName)
      .then((items: Array<StoredRecord>) => {

        const keys = this.getKeys(storeName)
        const key = SchemeMap.right[convertStoreName(storeName, Direction.right)].index || keys[0]
        const exact = condition ? null : value
        const sorted: Array<StoredRecord> = this.sort(items, keys, exact)
        const index = this.findMax(sorted, key, value)

        if (index === -1) {
          return []
        }

        const start = condition === KeyRangeCondition.LowerBound ? index : 0
        const end = !condition || condition === KeyRangeCondition.UpperBound ? (index + 1) : sorted.length
        const deleted: Array<StoredRecordId> = sorted
          .splice(start, end)
          .map(item => keys.length === 1
            ? item[key]
            : keys.map(k => item[k])) as Array<StoredRecordId>

        QuickStorage.stores[storeName] = sorted

        return deleted
      })
  }

  /**
   * Trim the store from the left by specified length
   */
  trimItems(storeName: ShortStoreName, length: number): Promise<Array<StoredRecordId>> {
    const convertedName = convertStoreName(storeName, Direction.right)
    const options: StoreOptions = SchemeMap.right[convertedName]

    return this.getAll(storeName)
      .then((records: Array<Record<string, StoredValue>>) => records.length ? records[length - 1] : null)
      .then(record => record ? this.deleteBulk(storeName, record[options.keyPath], KeyRangeCondition.UpperBound) : [])
  }

  /**
   * Count the number of records in the store
   */
  count(storeName: ShortStoreName): Promise<number> {
    return this.open()
      .then(open => {
        if (open.status === 'error') {
          return Promise.reject(open.error)
        }

        const records = QuickStorage.stores[storeName]
        return Promise.resolve(records instanceof Array ? records.length : 1)
      })
  }

  /**
   * Clear all records from a particular store
   */
  clear(storeName: ShortStoreName): Promise<void> {
    return this.open()
      .then(open => {
        if (open.status === 'error') {
          return Promise.reject(open.error)
        }

        return new Promise(resolve => {
          QuickStorage.stores[storeName] = []
          resolve()
        })
      })
  }

  /**
   * Does nothing, it simply matches the common storage interface
   */
  destroy() { } // eslint-disable-line

  /**
   * Does nothing, it simply matches the common storage interface
   */
  deleteDatabase() { } // eslint-disable-line

}

export { LocalStorageWrapper as LocalStorage }
