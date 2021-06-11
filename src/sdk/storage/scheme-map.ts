import { reducer, entries } from '../utilities'
import Scheme from './scheme'

/**
 * Cast value into it's original type
 *
 * @param {string} value
 * @returns {*}
 * @private
 */
function _parseValue(value) {
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
function _flipObject(obj) {
  return entries(obj)
    .map(([key, value]) => [value, _parseValue(key)])
    .reduce(reducer, {})
}

/**
 * Flip store name definition names:
 * - short key pointing the long one along with additional configuration
 *
 * @param {Object} obj
 * @returns {Object}
 * @private
 */
function _flipStoreNames(obj) {
  return entries(obj)
    .map(([name, options]) => [options.name, {
      name,
      permanent: options.permanent
    }])
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
function _flipStoreScheme(storeName, key, scheme) {
  const values = scheme.values ? { values: _flipObject(scheme.values) } : {}
  const keys = scheme.keys ? { keys: _flipScheme(storeName, scheme.keys) } : {}
  const composite = scheme.composite ? { composite: scheme.composite.map(key => _getShortKey(storeName, key)) } : {}

  return { key, ...values, ...keys, ...composite }
}

/**
 * Flip general scheme recursivelly
 *
 * @param {string} storeName
 * @param {Object} fieldsScheme
 * @returns {Object}
 * @private
 */
function _flipScheme(storeName, fieldsScheme) {
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
function _prepareLeft() {
  return entries(Scheme)
    .map(([storeName, store]) => [
      storeName,
      {
        keyPath: store.scheme.keyPath,
        autoIncrement: store.scheme.autoIncrement,
        index: store.scheme.index,
        fields: store.scheme.fields
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
function _prepareRight() {
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
function _getValuesMap() {
  return entries(Scheme)
    .reduce((acc, [, store]) => acc.concat(store.scheme.fields), [])
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
function _getShortKey(storeName, key) {
  const map = Scheme[storeName].scheme.fields[key]
  return map ? (map.key || map) : key
}

/**
 * Get store names and their general configuration (if store is permanent or not)
 *
 * @returns {Object}
 * @private
 */
function _getStoreNames(): {[shortName: string]: {name: string; permanent: boolean}} {
  return entries(Scheme)
    .map(([storeName, scheme]) => [storeName, {
      name: scheme.name,
      permanent: scheme.permanent
    }])
    .reduce(reducer, {})
}

const Left = _prepareLeft()
const Right = _prepareRight()
const Values = _getValuesMap()
const StoreNames = _getStoreNames()

export default {
  left: Left,
  right: Right,
  values: Values,
  storeNames: {
    left: StoreNames,
    right: _flipStoreNames(StoreNames)
  }
}
