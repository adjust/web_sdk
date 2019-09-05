// @flow
import StorageManager from './storage/storage-manager'
import Logger from './logger'
import {convertToMap, intersection} from './utilities'

export type GlobalParamsT = {|
  key: string,
  value: string
|}
export type GlobalParamsObjectT = {
  callbackParams: Array<GlobalParamsT>,
  partnerParams: Array<GlobalParamsT>
}
type TypeT = 'callback' | 'partner'
type KeysT = [string, TypeT]
type KeysArrayT = Array<KeysT>

/**
 * Name of the store used by global params
 *
 * @type {string}
 * @private
 */
const _storeName = 'globalParams'

/**
 * Error message for type missing
 *
 * @type {Object}
 * @private
 */
const _error = {
  short: 'No type provided',
  long: 'Global parameter type not provided, `callback` or `partner` types are available'
}

/**
 * Omit type parameter from the collection
 *
 * @param {Array} params
 * @returns {Array}
 * @private
 */
function _omitType (params): Array<GlobalParamsT> {
  return (params || []).map(({key, value}) => ({key, value}))
}

/**
 * Get callback and partner global parameters
 *
 * @returns {Promise}
 */
function get (): Promise<GlobalParamsObjectT> {
  return Promise.all([
    StorageManager.filterBy(_storeName, 'callback'),
    StorageManager.filterBy(_storeName, 'partner')
  ]).then(([callbackParams, partnerParams]) => {
    return {
      callbackParams: _omitType(callbackParams),
      partnerParams: _omitType(partnerParams)
    }
  })
}

/**
 * Add global parameters, either callback or partner params
 *
 * @param {Array} params
 * @param {string} type
 * @returns {Promise}
 */
function add (params: Array<GlobalParamsT>, type: TypeT): void | Promise<KeysArrayT> {
  if (type === undefined) {
    Logger.error(_error.long)
    return Promise.reject({message: _error.short})
  }

  type GlobalParamsWithTypeT = {|...GlobalParamsT, type: string|}
  const map: {[key: string]: string} = convertToMap(params)
  const prepared: Array<GlobalParamsWithTypeT> = Object
    .keys(map)
    .map(key => ({key, value: map[key], type}))

  return Promise.all([
    StorageManager.filterBy(_storeName, type),
    StorageManager.addBulk(_storeName, prepared, true)
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
 * @param {string} type
 * @returns {Promise}
 */
function remove (key: string, type: TypeT): void | Promise<KeysT> {
  if (type === undefined) {
    Logger.error(_error.long)
    return Promise.reject({message: _error.short})
  }

  return StorageManager.deleteItem(_storeName, [key, type])
    .then(result => {
      Logger.log(`${key} ${type} parameter has been deleted`)
      return result
    })
}

/**
 * Remove all global parameters of certain type
 * @param {string} type
 * @returns {Promise}
 */
function removeAll (type: TypeT): void | Promise<KeysArrayT> {
  if (type === undefined) {
    Logger.error(_error.long)
    return Promise.reject({message: _error.short})
  }

  return StorageManager.deleteBulk(_storeName, type)
    .then(result => {
      Logger.log(`All ${type} parameters have been deleted`)
      return result
    })
}

/**
 * Clear globalParams store
 */
function clear (): void {
  return StorageManager.clear(_storeName)
}

export {
  get,
  add,
  remove,
  removeAll,
  clear
}
