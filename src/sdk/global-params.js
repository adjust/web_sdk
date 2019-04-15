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
  ]).then(([callbackParams, partnerParams]) => ({callbackParams, partnerParams}))
}
/**
 * Add global parameters, either callback or partner params
 *
 * @param {Array} params
 * @param {string} type
 * @returns {Promise}
 */
function add (params, type = 'callback') {
  const map = convertToMap(params)
  const prepared = Object
    .keys(map)
    .map(key => ({key, value: map[key], type}))

  return StorageManager.addBulk('globalParams', prepared, true)
}

export {
  get,
  add
}
