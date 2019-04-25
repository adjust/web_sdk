import {convertToMap, intersection} from './utilities'
import StorageManager from './storage-manager'
import Logger from './logger'

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

  return Promise.all([
    StorageManager.filterBy('globalParams', type),
    StorageManager.addBulk('globalParams', prepared, true)
  ]).then(([oldParams, newParams]) => {

    const intersecting = intersection(
      oldParams.map(param => param.key),
      newParams.map(param => param[0])
    )

    Logger.log(`Following ${type} parameters have been saved: ${prepared.map(p => `${p.key}:${p.value}`).join(', ')}`)

    if (intersecting.length) {
      Logger.log(`Keys: ${intersecting.join(', ')} already existed so their values have been updated`)
    }

    return newParams
  })

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
    .then(result => {
      Logger.log(`${key} ${type} parameter has been deleted`)
      return result
    })
}

/**
 * Remove all global parameters of certain type
 * @param {string} [type='callback']
 * @returns {Promise}
 */
function removeAll (type = 'callback') {
  return StorageManager.deleteBulk('globalParams', type)
    .then(result => {
      Logger.log(`All ${type} parameters have been deleted`)
      return result
    })
}

export {
  get,
  add,
  remove,
  removeAll
}
