import IndexedDB from './indexeddb'
import LocalStorage from './localstorage'
import Logger from './logger'

let StorageManager = {}

if (IndexedDB.isSupported()) {
  StorageManager = IndexedDB
  StorageManager.type = 'indexedDB'
} else if (LocalStorage.isSupported()) {
  StorageManager = LocalStorage
  StorageManager.type = 'localStorage'
}

if (StorageManager.type) {
  Logger.info(`Storage set to ${StorageManager.type}`)
} else {
  Logger.error('There is no storage available, app will run with minimum set of features')
}

export default StorageManager
