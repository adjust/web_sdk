import IndexedDB from './indexeddb'
import LocalStorage from './localstorage'

let StorageManager = {}

if (IndexedDB.isSupported()) {
  StorageManager = IndexedDB
  StorageManager.type = 'indexedDB'
} else if (LocalStorage.isSupported()) {
  StorageManager = LocalStorage
  StorageManager.type = 'localStorage'
} else {
  StorageManager.type = 'no-storage-available'
}

export default StorageManager
