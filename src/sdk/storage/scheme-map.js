import {reducer, entries} from '../utilities'
import Scheme from './scheme'

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
 * @param {string} storeName
 * @param {string} key
 * @param {Object} scheme
 * @returns {Object}
 * @private
 */
function _flipStoreScheme (storeName, key, scheme) {
  const values = scheme.values ? {values: _flipObject(scheme.values)} : {}
  const keys = scheme.keys ? {keys: _flipScheme(storeName, scheme.keys)} : {}
  const composite = scheme.composite ? {composite: scheme.composite.map(key => _getShortKey(storeName, key))} : {}

  return {key, ...values, ...keys, ...composite}
}

/**
 * Flip general scheme recursivelly
 *
 * @param {string} storeName
 * @param {Object} fieldsScheme
 * @returns {Object}
 * @private
 */
function _flipScheme (storeName, fieldsScheme) {
  return entries(fieldsScheme)
    .map(([key, scheme]) => scheme.key
      ? [scheme.key, _flipStoreScheme(storeName, key, scheme)]
      : [scheme, key])
    .reduce(reducer, {})
}

/**
 * Extend base scheme with some more maps for encoding
 *
 * @returns {Object}
 * @private
 */
function _prepareLeft () {
  return entries(Scheme)
    .map(([storeName, storeScheme]) => [
      storeName,
      {
        keyPath: storeScheme.keyPath,
        autoIncrement: storeScheme.autoIncrement,
        index: storeScheme.index,
        fields: storeScheme.fields
      }
    ])
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
        keyPath: _getShortKey(storeName, storeScheme.keyPath),
        autoIncrement: storeScheme.autoIncrement,
        index: _getShortKey(storeName, storeScheme.index),
        fields: _flipScheme(storeName, storeScheme.fields)
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
  return entries(Scheme)
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
 * @private
 */
function _getShortKey (storeName, key) {
  const map = Scheme[storeName].fields[key]
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
  }
}
