import { entries } from '../utilities'
import {
  isComplexStoreField,
  isCompositeKeyStoreField,
  isNestingStoreField,
  isPredefinedValuesField,
  StoreFields,
  StoreFieldScheme,
  StoreNames,
  ShortStoreNames,
  StoreOptions,
} from './scheme'
import SchemeMap from './scheme-map'
import { Error, StoredRecord, StoredRecordId, StoredValue, valueIsRecord } from './types'

enum Direction {
  right = 'right',
  left = 'left'
}

type StoreNameType = StoreNames | ShortStoreNames

/**
 * Get value from the map if available
 */
function _getValue(map: Nullable<Record<string, StoredValue>>, value: StoredValue): StoredValue {
  return map ? (map[value] !== undefined ? map[value] : value) : value
}

/**
 * Convert key and value by defined scheme
 */
function _convert(storeName: StoreNameType, dir: Direction, key: string, value: StoredValue | StoredRecord, scheme?: StoreFieldScheme): [string, unknown] {
  if (!scheme) {
    return [key, value]
  }

  const encodedKey = isComplexStoreField(scheme) ? scheme.key : scheme

  if (valueIsRecord(value)) {
    const keys = isNestingStoreField(scheme) ? scheme.keys : null
    return [
      encodedKey,
      convertRecord(storeName, dir, value, keys)
    ]
  }

  const valuesMap = isPredefinedValuesField(scheme) ? scheme.values : null
  return [encodedKey, _getValue(valuesMap, value)]
}

/**
 * Convert record by defined direction and scheme
 */
function convertRecord(storeName: StoreNameType, dir: Direction, record: StoredRecord, scheme?: Nullable<StoreFields>): StoredRecord

/**
 * Convert record by defined direction and scheme
 */
function convertRecord(storeName: StoreNameType, dir: Direction, record: Maybe<StoredRecord>, scheme?: StoreFields): Maybe<StoredRecord>

/**
 * Convert record by defined direction and scheme
 * Note: the function signature is duplicated because TS hides function implementation
 */
function convertRecord(storeName: StoreNameType, dir: Direction, record: Maybe<StoredRecord>, scheme?: StoreFields): Maybe<StoredRecord> {
  if (!record) {
    return undefined
  }

  const _scheme: StoreFields = scheme || SchemeMap[dir][convertStoreName(storeName, Direction.right)].fields

  return entries(record)
    .map(([key, value]) => _convert(storeName, dir, key, value, _scheme[key]))
    .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {})
}

/**
 * Convert records by defined direction
 */
function convertRecords(storeName: StoreNameType, dir: Direction, records: Array<StoredRecord> = []): Array<StoredRecord> {
  return records
    .map(record => convertRecord(storeName, dir, record))
}

/**
 * Convert values by defined direction
 */
function convertValues(storeName: StoreNameType, dir: Direction, target: StoredRecordId): StoredValue | Array<StoredValue> {
  const scheme: StoreOptions = SchemeMap[dir][convertStoreName(storeName, Direction.right)]
  const keyPathScheme = scheme.fields[scheme.keyPath]

  const values = target instanceof Array ? target.slice() : [target]
  const keys = isCompositeKeyStoreField(keyPathScheme) ? keyPathScheme.composite : [scheme.keyPath]

  const converted = keys
    .map((key: string, index: number) => {
      const field = scheme.fields[key]
      const predefinedValuesMap = isPredefinedValuesField(field) ? field.values : null
      return _getValue(predefinedValuesMap, values[index])
    })

  return converted.length === 1 ? converted[0] : converted
}

/**
 * Encode value by defined scheme
 */
function encodeValue(target: StoredValue): StoredValue {
  return SchemeMap.values[target] || target
}

/**
 * Convert store name by defined direction
 */
function convertStoreName(storeName: StoreNameType, dir: Direction): StoreNameType {
  return (SchemeMap.storeNames[dir][storeName] || {}).name || storeName
}

/**
 * Decode error message by replacing short store name with long readable one
 */
function decodeErrorMessage(storeName: ShortStoreNames, error: Error): Error {
  return {
    name: error.name,
    message: error.message.replace(`"${storeName}"`, convertStoreName(storeName, Direction.right))
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
