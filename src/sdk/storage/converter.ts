import SchemeMap from './scheme-map'
import { isObject, entries } from '../utilities'
import { Error } from './types'

enum Direction {
  right = 'right',
  left = 'left'
}

interface StoreConverterParameters {
  storeName: string;
  dir: Direction;
}

interface ConverterParameters extends StoreConverterParameters {
  scheme?: any;
}

interface RecordConverterParameters extends ConverterParameters {
  record: any;
}

interface KeyValueConverterParameters extends ConverterParameters {
  key: string;
  value: any;
}

interface RecordsConverterParameters extends StoreConverterParameters {
  records: Array<any>;
}

interface TargetConverterParameters extends StoreConverterParameters {
  target: any;
}

/**
 * Get value from the map if available
 *
 * @private
 */
function _getValue(map, value) {
  return map ? (map[value] !== undefined ? map[value] : value) : value
}

/**
 * Convert key and value by defined scheme
 *
 * @private
 */
function _convert({ storeName, scheme, dir, key, value }: KeyValueConverterParameters): [string, any] {
  if (!scheme) {
    return [key, value]
  }

  const encodedKey = scheme.key || scheme

  if (isObject(value)) {
    return [encodedKey, convertRecord({ storeName, dir, record: value, scheme: scheme.keys })]
  }

  return [encodedKey, _getValue(scheme.values, value)]
}

/**
 * Convert record by defined direction and scheme
 */
function convertRecord({ storeName, dir, record, scheme }: RecordConverterParameters) {
  if (!record) {
    return
  }

  scheme = scheme || SchemeMap[dir][convertStoreName({ storeName, dir: Direction.right })].fields

  return entries(record)
    .map(([key, value]) => _convert({ storeName, scheme: scheme[key], dir, key, value }))
    .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {})
}

/**
 * Convert records by defined direction
 */
function convertRecords({ storeName, dir, records = [] }: RecordsConverterParameters): Array<{ [key: string]: any }> {
  return records
    .map(record => convertRecord({ storeName, dir, record }))
}

/**
 * Convert values by defined direction
 */
function convertValues({ storeName, dir, target }: TargetConverterParameters) {
  const scheme = SchemeMap[dir][convertStoreName({ storeName, dir: Direction.right })]
  const keyPathScheme = scheme.fields[scheme.keyPath]
  const values = target instanceof Array ? target.slice() : [target]
  const keys = keyPathScheme.composite || [scheme.keyPath]
  const converted = keys
    .map((key, index) => _getValue(scheme.fields[key].values, values[index]))

  return converted.length === 1 ? converted[0] : converted
}

/**
 * Encode value by defined scheme
 */
function encodeValue(target: any) {
  return SchemeMap.values[target] || target
}

/**
 * Convert store name by defined direction
 */
function convertStoreName({ storeName, dir }: StoreConverterParameters): string {
  return (SchemeMap.storeNames[dir][storeName] || {}).name || storeName
}

/**
 * Decode error message by replacing short store name with long readable one
 */
function decodeErrorMessage({ storeName, error }: { storeName: string; error: Error }): Error {
  return {
    name: error.name,
    message: error.message.replace(`"${storeName}"`, convertStoreName({ storeName, dir: Direction.right }))
  }
}

export {
  Direction,
  convertRecord,
  convertRecords,
  convertValues,
  encodeValue,
  convertStoreName,
  decodeErrorMessage
}
