import IndexedDB from './indexeddb'
import LocalStorage from './localstorage'

let Storage = {}

if (IndexedDB.isSupported()) {
  Storage = IndexedDB
  Storage.type = 'indexedDB'
} else if (LocalStorage.isSupported()) {
  Storage = LocalStorage
  Storage.type = 'localStorage'
} else {
  Storage.type = 'no-storage-available'
}

export default Storage
