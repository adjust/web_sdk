import {convertToMap} from './utilities'
import StorageManager from './storage-manager'

/**
 * Get callback and partner global parameters
 *
 * @returns {Promise<{callbackParams: Array, partnerParams: Array}>}
 */
function get () {
  return Promise.all([
    StorageManager.filterBy('globalParams', 'callback'),
    StorageManager.filterBy('globalParams', 'partner')
  ]).then(([callbackParams = [], partnerParams = []]) => ({callbackParams, partnerParams}))
}
/**
 * Add global parameters, either callback or partner params
 *
 * @param {Array} params
 * @param {string} [type='callback']
 * @returns {Promise}
 */
function add (params, type = 'callback') {
  const map = convertToMap(params)
  const prepared = Object
    .keys(map)
    .map(key => ({key, value: map[key], type}))

  return StorageManager.addBulk('globalParams', prepared, true)
}

/**
 * Remove global parameter by key and type
 *
 * @param {string} key
 * @param {string} [type='callback']
 * @returns {Promise}
 */
function remove (key, type = 'callback') {
  return StorageManager.deleteItem('globalParams', [key, type])
}

/**
 * Remove all global parameters of certain type
 * @param {string} [type='callback']
 * @returns {Promise}
 */
function removeAll (type = 'callback') {
  return StorageManager.deleteBulk('globalParams', type)
}

export {
  get,
  add,
  remove,
  removeAll
}
