import {reducer, entries} from '../utilities'
import SchemeDef from './scheme-def'

const QUEUE_STORE = 'q'
const ACTIVITY_STATE_STORE = 'as'
const GLOBAL_PARAMS_STORE = 'gp'

const StoreNames = {
  queue: QUEUE_STORE,
  activityState: ACTIVITY_STATE_STORE,
  globalParams: GLOBAL_PARAMS_STORE
}

/**
 * Cast value into it's original type
 *
 * @param {string} value
 * @returns {*}
 * @private
 */
function _parseValue (value) {
  try {
    return JSON.parse(value)
  } catch (e) {
    return value
  }
}

/**
 * Flip keyPath list according to defined map
 *
 * @param {Object} keyPath
 * @returns {Array}
 * @private
 */
function _flipList (keyPath) {
  return keyPath.list
    .map(key => keyPath.map[key])
}

/**
 * Flip key/value pairs
 *
 * @param {Object} obj
 * @returns {Object}
 * @private
 */
function _flipObject (obj) {
  return entries(obj)
    .map(([key, value]) => [value, _parseValue(key)])
    .reduce(reducer, {})
}

/**
 * Flip store scheme values
 *
 * @param {string} key
 * @param {Object} scheme
 * @returns {Object}
 * @private
 */
function _flipStoreScheme (key, scheme) {
  const values = scheme.values ? {values: _flipObject(scheme.values)} : {}
  const keys = scheme.keys ? {keys: _flipScheme(scheme.keys)} : {}

  return {key, ...values, ...keys}
}

/**
 * Flip general scheme recursivelly
 *
 * @param {Object} scheme
 * @returns {Object}
 * @private
 */
function _flipScheme (scheme) {
  return entries(scheme)
    .map(([key, scheme]) => scheme.key
      ? [scheme.key, _flipStoreScheme(key, scheme)]
      : [scheme, key])
    .reduce(reducer, {})
}

/**
 * Get keyPath map for encoding
 *
 * @param {string} storeName
 * @param {Array} keyPath
 * @returns {Object}
 * @private
 */
function _getKeyPathMap (storeName, keyPath) {
  return keyPath
    .map(key => [key, getShortKey(storeName, key)])
    .reduce(reducer, {})
}

/**
 * Extend base scheme with some more maps for encoding
 *
 * @returns {Object}
 * @private
 */
function _prepareLeft () {
  return entries(SchemeDef)
    .map(([storeName, storeScheme]) => {
      return [
        storeName,
        {
          keyPath: {list: storeScheme.keyPath, map: _getKeyPathMap(storeName, storeScheme.keyPath)},
          fields: storeScheme.fields
        }
      ]
    })
    .reduce(reducer, {})
}

/**
 * Prepare scheme for decoding
 *
 * @returns {Object}
 * @private
 */
function _prepareRight () {
  return entries(Left)
    .map(([storeName, storeScheme]) => [
      storeName,
      {
        keyPath: {list: _flipList(storeScheme.keyPath), map: _flipObject(storeScheme.keyPath.map)},
        fields: _flipScheme(storeScheme.fields)
      }
    ])
    .reduce(reducer, {})
}

/**
 * Get available values for encoding
 *
 * @returns {Object}
 * @private
 */
function _getValuesMap () {
  return entries(SchemeDef)
    .reduce((acc, [, scheme]) => acc.concat(scheme.fields), [])
    .map(scheme => entries(scheme)
      .filter(([, map]) => map.values)
      .map(([, map]) => entries(map.values))
      .reduce((acc, map) => acc.concat(map), []))
    .reduce((acc, map) => acc.concat(map), [])
    .reduce(reducer, {})
}

/**
 * Get short key version of a specified key
 *
 * @param {string} storeName
 * @param {string} key
 * @returns {string}
 */
function getShortKey (storeName, key) {
  const map = SchemeDef[storeName].fields[key]
  return map ? (map.key || map) : key
}

const Left = _prepareLeft()
const Right = _prepareRight()
const Values = _getValuesMap()

export default {
  left: Left,
  right: Right,
  values: Values,
  storeNames: {
    left: StoreNames,
    right: _flipObject(StoreNames)
  },
  getShortKey
}
