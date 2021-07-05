import { entries, reducer, values } from '../utilities'
import Scheme, {
  isComplexStoreField,
  isCompositeKeyStoreField,
  isNestingStoreField,
  isPredefinedValuesField,
  Store,
  StoreFields,
  StoreFieldScheme,
  StoreName,
  StoreNames,
  ShortStoreNames,
  StoreOptions,
  StoreOptionsOptionalKey
} from './scheme'

type StoreConfiguration = { name: ShortStoreNames; permanent: Maybe<boolean> }

type StoresConfigurationMap = Record<StoreNames, StoreConfiguration>

type StoreConfigurationFlipped = { name: StoreNames; permanent: Maybe<boolean> }

type StoresConfigurationMapFlipped = Record<ShortStoreNames, StoreConfigurationFlipped>

type StoreScheme = Record<StoreNames, StoreOptions | StoreOptionsOptionalKey>

/**
 * Cast value into it's original type
 */
function _parseValue(value: string): any { // eslint-disable-line @typescript-eslint/no-explicit-any
  try {
    return JSON.parse(value)
  } catch (e) {
    return value
  }
}

/**
 * Flip key/value pairs
 */
function _flipObject(obj: Record<string, unknown>): Record<string, unknown> {
  return entries(obj)
    .map(([key, value]) => [value, _parseValue(key)])
    .reduce(reducer, {})
}

/**
 * Flip store name definition names:
 * - short key pointing the long one along with additional configuration
 */
function _flipStoreNames(obj: StoresConfigurationMap): StoresConfigurationMapFlipped {
  const flippedConfigs: Array<[ShortStoreNames, StoreConfigurationFlipped]> = entries<StoreNames, StoreConfiguration>(obj)
    .map(([name, options]: [StoreName, StoreConfiguration]) => {
      const config = {
        name,
        permanent: options.permanent
      }

      return [options.name, config]
    })

  return flippedConfigs.reduce(reducer, {} as StoresConfigurationMapFlipped)
}

/**
 * Flip store scheme values
 */
function _flipStoreScheme(storeName: StoreNames, key: string, scheme: StoreFieldScheme) {
  const values = isPredefinedValuesField(scheme) ? { values: _flipObject(scheme.values) } : {}
  const keys = isNestingStoreField(scheme) ? { keys: _flipScheme(storeName, scheme.keys) } : {}
  const composite = isCompositeKeyStoreField(scheme) ? { composite: scheme.composite.map(key => _getShortKey(storeName, key)) } : {}

  return { key, ...values, ...keys, ...composite }
}

/**
 * Flip general scheme recursivelly
 */
function _flipScheme(storeName: StoreNames, fieldsScheme: StoreFields) {
  return entries<string, StoreFieldScheme>(fieldsScheme)
    .map(([key, scheme]: [string, StoreFieldScheme]) => {
      return isComplexStoreField(scheme)
        ? [scheme.key, _flipStoreScheme(storeName, key, scheme)]
        : [scheme, key]
    })
    .reduce(reducer, {})
}

/**
 * Extend base scheme with some more maps for encoding
 */
function _prepareLeft(): StoreScheme {
  const storesOptions: Array<[StoreNames, StoreOptionsOptionalKey]> = entries<StoreNames, Store>(Scheme)
    .map(([storeName, store]: [StoreNames, Store]) => {
      const options: StoreOptionsOptionalKey = {
        keyPath: store.scheme.keyPath,
        autoIncrement: store.scheme.autoIncrement,
        index: store.scheme.index,
        fields: store.scheme.fields
      }

      return [storeName, options]
    })

  return storesOptions.reduce(reducer, {} as StoreScheme)
}

/**
 * Prepare scheme for decoding
 */
function _prepareRight(): StoreScheme {
  const storesOptionsEncoded: Array<[StoreNames, StoreOptionsOptionalKey]> = entries(Left)
    .map(([storeName, storeScheme]) => {
      const options: StoreOptionsOptionalKey = {
        keyPath: _getShortKey(storeName, storeScheme.keyPath),
        autoIncrement: storeScheme.autoIncrement,
        index: _getShortKey(storeName, storeScheme.index),
        fields: _flipScheme(storeName, storeScheme.fields)
      }

      return [storeName, options]
    })

  return storesOptionsEncoded.reduce(reducer, {} as StoreScheme)
}

/**
 * Get available values for encoding
 */
function _getValuesMap(): Record<string, number> {
  // all pairs of predefined keys and values such as {GET: 1}
  return entries(Scheme)
    .reduce((acc, [, store]) => acc.concat(store.scheme.fields), [] as Array<StoreFields>)
    .map(scheme => values(scheme)
      .filter(isPredefinedValuesField)
      .map(map => entries(map.values))
      .reduce((acc, map) => acc.concat(map), []))
    .reduce((acc, map) => acc.concat(map), [])
    .reduce(reducer, {})
}

/**
 * Get short key version of a specified key
 */
function _getShortKey(storeName: StoreNames, key: Maybe<string>): Maybe<string> {
  if (!key) {
    return undefined
  }

  const map = Scheme[storeName].scheme.fields[key]

  if (isComplexStoreField(map)) {
    return map.key
  }

  return map || key
}

/**
 * Get store names and their general configuration (if store is permanent or not)
 */
function _getStoreNames(): StoresConfigurationMap {
  const storeNames: Array<[StoreName, StoreConfiguration]> = entries<StoreName, Store>(Scheme)
    .map(([name, store]) => {
      const config = {
        name: store.name,
        permanent: store.permanent
      }
      return [name, config]
    })

  return storeNames.reduce(reducer, {} as Record<StoreNames, StoreConfiguration>)
}


const Left = _prepareLeft()
const Right = _prepareRight()
const Values = _getValuesMap()
const StoreNamesAndConfigs = _getStoreNames()

export default {
  left: Left,
  right: Right,
  values: Values,
  storeNames: {
    left: StoreNamesAndConfigs,
    right: _flipStoreNames(StoreNamesAndConfigs)
  }
}
