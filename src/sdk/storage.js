/**
 * Storage namespace
 *
 * @type {string}
 * @private
 */
const _storeName = 'adjustStore'

/**
 * Main storage instance
 */
const _store = _getStorage()

/**
 * Check if storage is available and return it if yes
 *
 * @returns {boolean}
 * @private
 */
function _getStorage () {

  let uid = (new Date).toString()
  let storage
  let result

  try {
    (storage = window.localStorage).setItem(uid, uid)
    result = storage.getItem(uid) === uid
    storage.removeItem(uid)
    return result && storage
  } catch (exception) {
    throw new Error('Local storage is not supported in this browser!')
  }

}

/**
 * Set key-value pair into the storage
 *
 * @param {string} name
 * @param {*} value
 */
function setItem (name, value) {
  _store.setItem(`${_storeName}.${name}`, JSON.stringify(value))
}

/**
 * Get particular item from the storage and return parsed value
 *
 * @param {string} name
 * @param {*} [defaultValue={}]
 * @returns {Object}
 */
function getItem (name, defaultValue = {}) {
  const value = _store.getItem(`${_storeName}.${name}`)
  return value ? JSON.parse(value) : defaultValue
}

/**
 * Remove item from teh storage
 *
 * @param {string} name
 * @returns {*}
 */
function removeItem (name) {
  return _store.removeItem(`${_storeName}.${name}`)
}

export {
  setItem,
  getItem,
  removeItem
}
