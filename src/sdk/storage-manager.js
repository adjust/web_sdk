import * as IndexedDB from './indexeddb'
import * as LocalStorage from './localstorage'
import Logger from './logger'

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
    Logger.info(`Available storage is ${type}`)
    return storage
  }

  Logger.error('There is no storage available, app will run with minimum set of features')
  return null

}

export default init()

