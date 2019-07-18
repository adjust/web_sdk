import SchemeMap from './scheme-map'
import {extend, isObject} from '../utilities'

/**
 * Get value from the map if available
 *
 * @param {Object} map
 * @param {*} value
 * @returns {*}
 * @private
 */
function _getValue (map, value) {
  return map ? (map[value] || value) : value
}

/**
 * Convert key and value by defined scheme
 *
 * @param {string} storeName
 * @param {Object} scheme
 * @param {string} dir
 * @param {string} key
 * @param {*} value
 * @returns {[string, *]}
 * @private
 */
function _convert ({storeName, scheme, dir, key, value}) {
  if  (!scheme) {
    return [key, value]
  }

  const encodedKey = scheme.key || scheme

  if (isObject(value)) {
    return [encodedKey, convertRecord({storeName, dir, record: value, scheme: scheme.keys})]
  }

  return [encodedKey, _getValue(scheme.values, value)]
}

/**
 * Convert record by defined direction and scheme
 *
 * @param {string} storeName
 * @param {string} dir
 * @param {Object} record
 * @param {Object=} scheme
 * @returns {Object|undefined}
 */
function convertRecord ({storeName, dir, record, scheme}) {
  if (!record) {
    return
  }

  scheme = scheme || SchemeMap[dir][storeName].fields

  return Object
    .entries(record)
    .map(([key, value]) => _convert({storeName, scheme: scheme[key], dir, key, value}))
    .reduce((acc, [key, value]) => extend(acc, {[key]: value}), {})
}

/**
 * Convert records by defined direction
 *
 * @param {string} storeName
 * @param {string} dir
 * @param {Array} records
 * @returns {Object[]}
 */
function convertRecords ({storeName, dir, records = []}) {
  return records
    .map(record => convertRecord({storeName, dir, record}))
}

/**
 * Convert values by defined direction
 *
 * @param {string} storeName
 * @param {string} dir
 * @param {*|*[]} target
 * @returns {*|*[]}
 */
function convertValues ({storeName, dir, target}) {
  const scheme = SchemeMap[dir][storeName]
  const values = target instanceof Array ? target.slice() : [target]
  const keys = scheme.keyPath.list
  const converted = keys
    .map((key, index) => _getValue(scheme.fields[key].values, values[index]))

  return converted.length === 1 ? converted[0] : converted
}

/**
 * Encode value by defined scheme
 *
 * @param {*} target
 * @returns {*}
 */
function encodeValue (target) {
  return SchemeMap.values[target] || target
}

export {
  convertRecord,
  convertRecords,
  convertValues,
  encodeValue
}
