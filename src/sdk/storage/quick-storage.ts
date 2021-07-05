import { convertRecord, Direction } from './converter'
import { values } from '../utilities'
import Globals from '../globals'
import SchemeMap from './scheme-map'
import { ShortPreferencesStoreName, ShortStoreName } from './scheme'
import { StoredRecord } from './types'

type StoreContent = Array<StoredRecord> | StoredRecord

type StoresMap = Record<ShortStoreName, Nullable<Array<StoredRecord>>> | Record<ShortPreferencesStoreName, StoredRecord>

class QuickStorage {
  private defaultName = Globals.namespace

  private storageName = this.defaultName

  private storeNames = SchemeMap.storeNames.left

  private storesMap: StoresMap

  /**
 * Get the value for specified key
 */
  private read(key: ShortStoreName | ShortPreferencesStoreName): Nullable<StoreContent> {
    const valueToParse = localStorage.getItem(`${this.storageName}.${key}`)
    const value = valueToParse ? JSON.parse(valueToParse) : null

    if (key === ShortPreferencesStoreName.Preferences && value) {
      return convertRecord(ShortPreferencesStoreName.Preferences, Direction.right, value)
    }

    return value
  }

  /**
   * Set the value for specified key
   */
  private write(key: ShortStoreName | ShortPreferencesStoreName, value: StoreContent) {
    if (!value) {
      localStorage.removeItem(`${this.storageName}.${key}`)
    } else {
      localStorage.setItem(`${this.storageName}.${key}`, JSON.stringify(
        value instanceof Array
          ? value
          : convertRecord(ShortPreferencesStoreName.Preferences, Direction.left, value)
      ))
    }
  }

  /**
   * Clear all data related to the sdk
   */
  clear() {
    this.deleteData()
  }

  /**
   * Clear all data related to the sdk
   *
   * @param wipe if true then also remove permanent data such as user's preferences
   */
  private deleteData(wipe = false) {
    values(this.storeNames)
      .forEach((store) => {
        if (wipe || !store.permanent) {
          localStorage.removeItem(`${this.storageName}.${store.name}`)
        }
      })
  }

  constructor() {
    this.storesMap = {} as StoresMap

    const read = this.read.bind(this)
    const write = this.write.bind(this)

    values(this.storeNames)
      .forEach((store) => {
        const shortStoreName = store.name
        Object.defineProperty(this.storesMap, shortStoreName, {
          get() { return read(shortStoreName) },
          set(value) { write(shortStoreName, value) }
        })
      })

    Object.freeze(this.storesMap)
  }

  /**
   * Sets custom name to use in data keys and updates existing keys in localStorage
   */
  setCustomName(customName?: string) {
    if (!customName || !customName.length) {
      return
    }

    const newName = `${Globals.namespace}-${customName}`

    // Clone data
    values(this.storeNames)
      .forEach((store) => {
        const key = store.name
        const rawData = localStorage.getItem(`${this.storageName}.${key}`) // Get data from the store, no need to encode it
        if (rawData) {
          localStorage.setItem(`${newName}.${key}`, rawData) // Put data into a new store
        }
      })

    this.deleteData(true)

    this.storageName = newName
  }

  get stores() { return this.storesMap }
}

export default new QuickStorage()
