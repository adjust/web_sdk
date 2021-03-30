import { convertRecord, Direction } from './converter'
import { entries } from '../utilities'
import Globals from '../globals'
import SchemeMap from './scheme-map'
import { ShortStoreName } from './scheme'

interface Store<T = unknown> {
  get: () => T | T[]
  set: (value: T[]) => void
}

type StoresMap = { [key in ShortStoreName]: Store }

class QuickStorage {
  private storageName = Globals.namespace

  private storeNames = SchemeMap.storeNames.left

  private storesMap: StoresMap

  /**
 * Get the value for specified key
 */
  private read(key: string) {
    const raw = localStorage.getItem(`${this.storageName}.${key}`)
    const value = JSON.parse(raw || 'null')
    return (value instanceof Array
      ? value
      : convertRecord({
        storeName: this.storeNames.preferences.name,
        dir: Direction.right,
        record: value
      })) || null
  }

  /**
   * Set the value for specified key
   */
  private write(key: string, value: any) {
    if (!value) {
      localStorage.removeItem(`${this.storageName}.${key}`)
    } else {
      localStorage.setItem(`${this.storageName}.${key}`, JSON.stringify(
        value instanceof Array
          ? value
          : convertRecord({
            storeName: this.storeNames.preferences.name,
            dir: Direction.left,
            record: value
          })
      ))
    }
  }

  /**
   * Clear all data related to the sdk
   */
  clear() {
    entries(this.storeNames)
      .forEach(([, store]) => {
        if (!store.permanent) {
          localStorage.removeItem(`${this.storageName}.${store.name}`)
        }
      })
  }

  constructor() {
    this.storesMap = {} as StoresMap

    const read = this.read.bind(this)
    const write = this.write.bind(this)

    entries(this.storeNames)
      .forEach(([, store]) => {
        Object.defineProperty(this.storesMap, store.name, {
          get() { return read(store.name) },
          set(value) { write(store.name, value) }
        })
      })

    Object.freeze(this.storesMap)
  }

  get stores() { return this.storesMap }
}

export default new QuickStorage()
