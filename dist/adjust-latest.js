(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["Adjust"] = factory();
	else
		root["Adjust"] = factory();
})(self, () => {
return /******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	// The require scope
/******/ 	const __webpack_require__ = {};
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/define property getters */
/******/ 	// define getter/value functions for harmony exports
/******/ 	__webpack_require__.d = (exports, definition) => {
/******/ 		for(var key in definition) {
/******/ 			if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 				Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 			}
/******/ 		}
/******/ 	};
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop));
/******/ 	
/************************************************************************/
let __webpack_exports__ = {};

// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  "default": () => (/* binding */ main)
});

;// ./src/sdk/constants.ts
const SECOND = 1000;
const MINUTE = SECOND * 60;
const HOUR = MINUTE * 60;
const DAY = HOUR * 24;
let DISABLE_REASONS = /*#__PURE__*/function (DISABLE_REASONS) {
  DISABLE_REASONS["REASON_GENERAL"] = "general";
  DISABLE_REASONS["REASON_GDPR"] = "gdpr";
  return DISABLE_REASONS;
}({});
const HTTP_ERRORS = {
  'TRANSACTION_ERROR': 'XHR transaction failed due to an error',
  'SERVER_MALFORMED_RESPONSE': 'Response from server is malformed',
  'SERVER_INTERNAL_ERROR': 'Internal error occurred on the server',
  'SERVER_CANNOT_PROCESS': 'Server was not able to process the request, probably due to error coming from the client',
  'NO_CONNECTION': 'No internet connectivity',
  'SKIP': 'Skipping slower attempt',
  'MISSING_URL': 'Url is not provided'
};
let STORAGE_TYPES = /*#__PURE__*/function (STORAGE_TYPES) {
  STORAGE_TYPES["NO_STORAGE"] = "noStorage";
  STORAGE_TYPES["INDEXED_DB"] = "indexedDB";
  STORAGE_TYPES["LOCAL_STORAGE"] = "localStorage";
  return STORAGE_TYPES;
}({});
const ENDPOINTS = {
  default: 'adjust.com',
  india: 'adjust.net.in',
  china: 'adjust.world',
  world: 'adjust.world',
  EU: 'eu.adjust.com',
  TR: 'tr.adjust.com',
  US: 'us.adjust.com'
};
const BASE_URL_PREFIX = 'https://app.';
const GDPR_URL_PREFIX = 'https://gdpr.';
const BASE_URL_NO_SUB_DOMAIN_PREFIX = 'https://';
const PUB_SUB_EVENTS = {
  WEB_UUID_CREATED: 'activity:web_uuid',
  ATTRIBUTION_RECEIVED: 'activity:attribution'
};
;// ./src/sdk/utilities.ts
/**
 * Build human readable list
 */
function buildList(array /*: Array<unknown>*/) /*: string*/{
  if (!array.length) {
    return '';
  }
  if (array.length === 1) {
    return `${array[0]}`;
  }
  const lastIndex = array.length - 1;
  const firstPart = array.slice(0, lastIndex).join(', ');
  return `${firstPart} and ${array[lastIndex]}`;
}

/**
 * Check if object is empty
 */
function isEmpty(obj /*: Record<string, unknown>*/) /*: boolean*/{
  return !Object.keys(obj).length && obj.constructor === Object;
}

/**
 * Check if value is object
 */
function isObject(obj /*: any*/) /*: obj is Record<string, unknown>*/{
  // eslint-disable-line @typescript-eslint/no-explicit-any
  return typeof obj === 'object' && obj !== null && !(obj instanceof Array);
}

/**
 * Check if string is valid json
 */
function isValidJson(string /*: string*/) /*: boolean*/{
  try {
    const json = JSON.parse(string);
    return isObject(json);
  } catch {
    return false;
  }
}

/**
 * Find index of an element in the list and return it
 */
function findIndex /*:: <K extends string, T extends Record<K, unknown>>*/(array /*: Array<T>*/, key /*: K | Array<K>*/, target /*: T*/) /*: number*/{
  function isEqual(item /*: T*/) {
    return Array.isArray(key) ? key.every(k => item[k] === target[k]) : item[key] === target;
  }
  for (let i = 0; i < array.length; i += 1) {
    if (isEqual(array[i])) {
      return i;
    }
  }
  return -1;
}

/**
 * Convert array with key/value item structure into key/value pairs object
 */
function convertToMap /*:: <T>*/(array /*: Array<{ key: string, value: T }>*/ = []) /*: Record<string, T>*/{
  return array.reduce((acc, o) => ({
    ...acc,
    [o.key]: o.value
  }), {});
}

/**
 * Find intersecting values of provided array against given values
 */
function intersection /*:: <T>*/(array /*: Array<T>*/ = [], values /*: Array<T>*/ = []) /*: Array<T>*/{
  return array.filter(item => values.indexOf(item) !== -1);
}

/**
 * Check if particular url is a certain request
 */
function isRequest(url /*: string*/, requestName /*: string*/) /*: boolean*/{
  const regex = new RegExp(`\\/${requestName}(\\/.*|\\?.*){0,1}$`);
  return regex.test(url);
}

/**
 * Extract the host name for the url
 */
function getHostName(url = '') /*: string*/{
  return url.replace(/^(http(s)*:\/\/)*(www\.)*/, '').split('/')[0].split('?')[0];
}

/**
 * Transform array entry into object key:value pair entry
 */
function reducer /*:: <K extends string, T>*/(acc /*: Record<K, T>*/, [key, value]) /*: Record<K, T>*/{
  return {
    ...acc,
    [key]: value
  };
}

/**
 * Extracts object entries in the [key, value] format
 */
function entries /*:: <K extends string, T>*/(object /*: Record<K, T>*/) /*: Array<[K, T]>*/{
  return Object.keys(object).map((key /*: K*/) => [key, object[key]]);
}

/**
 * Extracts object values
 */
function values /*:: <T>*/(object /*: Record<string, T>*/) /*: Array<T>*/{
  return Object.keys(object).map((key /*: string*/) => object[key]);
}

/**
 * Check if value is empty in any way (empty object, false value, zero) and use it as predicate method
 */
function isEmptyEntry(value /*: any*/) /*: boolean*/{
  // eslint-disable-line @typescript-eslint/no-explicit-any
  if (isObject(value)) {
    return !isEmpty(value);
  }
  return !!value || value === 0;
}
function isLocalStorageSupported() /*: boolean*/{
  try {
    const uid = new Date().toString();
    const storage = window.localStorage;
    storage.setItem(uid, uid);
    const result = storage.getItem(uid) === uid;
    storage.removeItem(uid);
    const support = !!(result && storage);
    return support;
  } catch {
    return false;
  }
}

;// ./src/sdk/globals.js
/*:: declare var __ADJUST__NAMESPACE: string*/
/*:: declare var __ADJUST__SDK_VERSION: string*/
/*:: declare var process: {|
  env: {|
    NODE_ENV: 'development' | 'production' | 'test'
  |}
|}*/
const Globals = {
  namespace: "adjust-sdk" || 0,
  version: "5.8.4" || 0,
  env: "production"
};
/* harmony default export */ const globals = (Globals);
;// ./src/sdk/logger.js


/*:: import { type LogOptionsT } from './types';*/
/*:: type LogLevelT = LogOptionsT['logLevel']*/
/*:: type MethodNameT = 'log' | 'info' | 'error' | 'warn'*/
const LEVEL_NONE = 'none';
const LEVEL_ERROR = 'error';
const LEVEL_WARNING = 'warning';
const LEVEL_INFO = 'info';
const LEVEL_VERBOSE = 'verbose';

/**
 * Logger levels
 * - none -> nothing is printed to the console
 * - error -> prints only error
 * - info -> prints info and error
 * - verbose -> prints log, info and error
 *
 * @type {Object}
 * @private
 */
const _levels = {
  [LEVEL_NONE]: -1,
  [LEVEL_ERROR]: 0,
  [LEVEL_WARNING]: 1,
  [LEVEL_INFO]: 2,
  [LEVEL_VERBOSE]: 3
};

/**
 * Spaces placed after log level tag in console to align messages.
 *
 * @type {Object}
 * @private
 */
const _spaces = {
  'log': '  ',
  'info': ' ',
  'warn': ' ',
  'error': ''
};

/**
 * Default logger level per environment
 *
 * @type {Object}
 * @private
 */
const _envLogLevels = {
  development: LEVEL_VERBOSE,
  production: LEVEL_ERROR,
  test: LEVEL_VERBOSE
};

/**
 * Current logger level
 */
let _level = _getDefaultLogLevel();

/**
 * Optional output container to display logs for easier debugging
 *
 * @type {string}
 * @private
 */
let _output = '';

/**
 * Get default logger error per environment and fallback to error level when unknown env
 *
 * @returns {string}
 * @private
 */
function _getDefaultLogLevel() /*: LogLevelT*/{
  return _envLogLevels[globals.env] || LEVEL_ERROR;
}

/**
 * Set logger level, fallback to default log level
 *
 * @param {string=} logLevel
 * @param {string=} logOutput
 */
function setLogLevel(logLevel /*: LogLevelT*/, logOutput /*: string*/) /*: void*/{
  const exists = !logLevel || Object.keys(_levels).indexOf(logLevel) !== -1;
  if (!exists) {
    _log('error', 'error', 'You must set one of the available log levels: verbose, info, warning, error or none');
    return;
  }
  _level = logLevel || _getDefaultLogLevel();
  _output = logOutput || _output;
  _log('info', logLevel, `Log level set to ${_level}`);
}

/**
 * Output the message to the console
 *
 * @param {string} methodName
 * @param {string} logLevel
 * @param {Array} args
 * @private
 */
function _log(methodName /*: MethodNameT*/, logLevel /*: LogLevelT*/, ...args /*: Array<mixed>*/) /*: void*/{
  if (_levels[_level] < _levels[logLevel]) {
    return;
  }
  const time = new Date().toISOString();
  const spaces = _spaces[methodName];
  const messagePrefix = [`[${globals.namespace}]`, time, `${methodName.toUpperCase()}:${spaces}`];
  const outputContainer = _output ? document.querySelector(_output) : null;
  console[methodName](...messagePrefix, ...args);
  if (outputContainer) {
    outputContainer.textContent += `${messagePrefix.join(' ')} ${args.map(m => isObject(m) ? JSON.stringify(m) : m).join(' ')}\n`;
    outputContainer.scrollTop = outputContainer.scrollHeight;
  }
}

/**
 * Apply predefined log level and return log method
 *
 * @param {string} name
 * @param {string} logLevel
 * @returns {Function: (Array) => void}
 * @private
 */
function _applyLevel(name /*: MethodNameT*/, logLevel /*: LogLevelT*/) {
  return (...args /*: Array<mixed>*/) => {
    _log(name, logLevel, ...args);
  };
}
const Logger = {
  setLogLevel,
  log: _applyLevel('log', LEVEL_VERBOSE),
  info: _applyLevel('info', LEVEL_INFO),
  warn: _applyLevel('warn', LEVEL_WARNING),
  error: _applyLevel('error', LEVEL_ERROR)
};
/* harmony default export */ const logger = (Logger);
;// ./src/sdk/config.ts




/** Base parameters set by client */

/** Custom config set by client */
/*:: export type InitOptions = BaseParams & CustomConfig & {
  attributionCallback: (eventName: string, attribution: Attribution) => unknown
}*/
let _baseParams /*: BaseParams | null*/ = null;
let _customConfig /*: CustomConfig | null*/ = null;

/** Mandatory fields to set for sdk initialization */
const _mandatory /*: Array<(keyof MandatoryParams)>*/ = ['appToken', 'environment'];

/** Allowed params to be sent with each request */
const _allowedParams /*: Array<(keyof BaseParams)>*/ = [..._mandatory, 'defaultTracker', 'externalDeviceId', 'storeInfo'];

/** Allowed configuration overrides */
const _allowedConfig /*: Array<(keyof CustomConfig)>*/ = ['customUrl', 'dataResidency', 'urlStrategy', 'eventDeduplicationListLimit', 'namespace'];

/**
 * Check of configuration has been initialized
 */
function isInitialised() /*: boolean*/{
  return _mandatory.reduce((acc, key) => acc && !!_baseParams && !!_baseParams[key], true);
}

/**
 * Set base params and custom config for the sdk to run
 */
function set(options /*: InitOptions*/) /*: void*/{
  if (hasMissing(options)) {
    return;
  }
  checkConfiguration(options);
  _baseParams = _allowedParams.filter(key => !!options[key]).map(key => [key, options[key]]).reduce((acc, item) => reducer(acc, item), {});
  _customConfig = _allowedConfig.filter(key => !!options[key]).map(key => [key, options[key]]).reduce(reducer, {});
}

/**
 * Get base params set by client
 */
function getBaseParams() /*: Partial<BaseParams>*/{
  return _baseParams ? {
    ..._baseParams
  } // intentionally returns a copy
  : {};
}

/**
 * Get custom config set by client
 */
function getCustomConfig() /*: CustomConfig*/{
  return _customConfig ? {
    ..._customConfig
  } // intentionally returns a copy
  : {};
}

/**
 * Check if there are missing mandatory parameters
 */
function hasMissing(params /*: BaseParams*/) /*: boolean*/{
  const missing = _mandatory.filter(value => !params[value]);
  if (missing.length) {
    logger.error(`You must define ${buildList(missing)}`);
    return true;
  }
  return false;
}

/**
 * Log error if non-mandatory parameters are invalid
 */
function checkConfiguration(params /*: BaseParams*/) {
  if (isObject(params) && Object.prototype.hasOwnProperty.call(params, 'storeInfo')) {
    // Check if storeInfo present in parameters
    const storeInfo = params.storeInfo;
    if (!isObject(storeInfo)) {
      // Check if it's an object
      logger.error('storeInfo must be an object');
    } else if (typeof storeInfo.storeName !== 'string' || storeInfo.storeName.length <= 0) {
      // Check store name is not empty
      logger.error('storeName must be a non-empty string');
    }
  }
}

/**
 * Restore config to its default state
 */
function destroy() /*: void*/{
  _baseParams = null;
  _customConfig = null;
}
const Config = {
  sessionWindow: 30 * (/* inlined export .MINUTE */60000),
  sessionTimerWindow: 60 * (/* inlined export .SECOND */1000),
  requestValidityWindow: 28 * DAY,
  set,
  getBaseParams,
  getCustomConfig,
  isInitialised,
  hasMissing,
  destroy
};
/* harmony default export */ const config = (Config);
;// ./src/sdk/storage/scheme.ts


/**
 * Field with predefined values
 */

/**
 * Field containing a nested one
 */

/**
 * Composite key, stored as a field because of IE doesn't support composite keys feature
 */
var StoreName = /*#__PURE__*/function (StoreName) {
  StoreName["Queue"] = "queue";
  StoreName["ActivityState"] = "activityState";
  StoreName["GlobalParams"] = "globalParams";
  StoreName["EventDeduplication"] = "eventDeduplication";
  return StoreName;
}(StoreName || {});
var PreferencesStoreName = /*#__PURE__*/(/* unused pure expression or super */ null && (function (PreferencesStoreName) {
  PreferencesStoreName["Preferences"] = "preferences";
  return PreferencesStoreName;
}(PreferencesStoreName || {})));
var ShortStoreName = /*#__PURE__*/function (ShortStoreName) {
  ShortStoreName["Queue"] = "q";
  ShortStoreName["ActivityState"] = "as";
  ShortStoreName["GlobalParams"] = "gp";
  ShortStoreName["EventDeduplication"] = "ed";
  return ShortStoreName;
}(ShortStoreName || {});
var ShortPreferencesStoreName = /*#__PURE__*/function (ShortPreferencesStoreName) {
  ShortPreferencesStoreName["Preferences"] = "p";
  return ShortPreferencesStoreName;
}(ShortPreferencesStoreName || {});
const _queueScheme /*: StoreOptions*/ = {
  keyPath: 'timestamp',
  autoIncrement: false,
  fields: {
    url: {
      key: 'u',
      values: {
        '/session': 1,
        '/event': 2,
        '/gdpr_forget_device': 3,
        '/sdk_click': 4,
        '/disable_third_party_sharing': 5
      }
    },
    method: {
      key: 'm',
      values: {
        GET: 1,
        POST: 2,
        PUT: 3,
        DELETE: 4
      }
    },
    timestamp: 't',
    createdAt: 'ca',
    params: {
      key: 'p',
      keys: {
        timeSpent: 'ts',
        sessionLength: 'sl',
        sessionCount: 'sc',
        eventCount: 'ec',
        lastInterval: 'li',
        eventToken: 'et',
        revenue: 're',
        currency: 'cu',
        callbackParams: 'cp',
        partnerParams: 'pp'
      }
    }
  }
};
const _activityStateScheme /*: StoreOptions*/ = {
  keyPath: 'uuid',
  autoIncrement: false,
  fields: {
    uuid: {
      key: 'u',
      values: {
        unknown: '-'
      }
    },
    timeSpent: 'ts',
    sessionLength: 'sl',
    sessionCount: 'sc',
    eventCount: 'ec',
    lastActive: 'la',
    lastInterval: 'li',
    installed: {
      key: 'in',
      values: {
        false: 0,
        true: 1
      }
    },
    attribution: {
      key: 'at',
      keys: {
        adid: 'a',
        tracker_token: 'tt',
        tracker_name: 'tn',
        network: 'nt',
        campaign: 'cm',
        adgroup: 'ag',
        creative: 'cr',
        click_label: 'cl',
        state: {
          key: 'st',
          values: {
            installed: 1,
            reattributed: 2
          }
        }
      }
    }
  }
};
const _globalParamsScheme /*: StoreOptions*/ = {
  keyPath: 'keyType',
  autoIncrement: false,
  index: 'type',
  fields: {
    keyType: {
      key: 'kt',
      composite: ['key', 'type']
    },
    key: 'k',
    value: 'v',
    type: {
      key: 't',
      values: {
        callback: 1,
        partner: 2
      }
    }
  }
};
const _eventDeduplicationScheme /*: StoreOptions*/ = {
  keyPath: 'internalId',
  autoIncrement: true,
  fields: {
    internalId: 'ii',
    id: 'i'
  }
};
const _preferencesScheme /*: StoreOptionsOptionalKey*/ = {
  fields: {
    thirdPartySharingDisabled: {
      key: 'td',
      keys: {
        reason: {
          key: 'r',
          values: {
            [DISABLE_REASONS.REASON_GENERAL]: 1
          }
        },
        pending: {
          key: 'p',
          values: {
            false: 0,
            true: 1
          }
        }
      }
    },
    sdkDisabled: {
      key: 'sd',
      keys: {
        reason: {
          key: 'r',
          values: {
            [DISABLE_REASONS.REASON_GENERAL]: 1,
            [DISABLE_REASONS.REASON_GDPR]: 2
          }
        },
        pending: {
          key: 'p',
          values: {
            false: 0,
            true: 1
          }
        }
      }
    }
  }
};
const scheme /*: Scheme*/ = {
  queue: {
    name: ShortStoreName.Queue,
    scheme: _queueScheme
  },
  activityState: {
    name: ShortStoreName.ActivityState,
    scheme: _activityStateScheme
  },
  globalParams: {
    name: ShortStoreName.GlobalParams,
    scheme: _globalParamsScheme
  },
  eventDeduplication: {
    name: ShortStoreName.EventDeduplication,
    scheme: _eventDeduplicationScheme
  },
  preferences: {
    name: ShortPreferencesStoreName.Preferences,
    scheme: _preferencesScheme,
    permanent: true
  }
};
function isPredefinedValuesField(field /*: Maybe<StoreFieldScheme>*/) /*: field is StoreFieldPredefinedValues*/{
  return !!field && Object.prototype.hasOwnProperty.call(field, 'values');
}
function isNestingStoreField(field /*: Maybe<StoreFieldScheme>*/) /*: field is StoreFieldNestingFields*/{
  return !!field && Object.prototype.hasOwnProperty.call(field, 'keys');
}
function isCompositeKeyStoreField(field /*: Maybe<StoreFieldScheme>*/) /*: field is StoreFieldCompositeKey*/{
  return !!field && Object.prototype.hasOwnProperty.call(field, 'composite');
}
function isComplexStoreField(field /*: Maybe<StoreFieldScheme>*/) /*: field is StoreFieldComplex*/{
  return !!field && typeof field !== 'string';
}

/* harmony default export */ const storage_scheme = (scheme);
;// ./src/sdk/storage/scheme-map.ts


/**
 * Cast value into it's original type
 */
function _parseValue(value /*: string*/) /*: any*/{
  // eslint-disable-line @typescript-eslint/no-explicit-any
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
}

/**
 * Flip key/value pairs
 */
function _flipObject(obj /*: Record<string, unknown>*/) /*: Record<string, unknown>*/{
  return entries(obj).map(([key, value]) => [value, _parseValue(key)]).reduce(reducer, {});
}

/**
 * Flip store name definition names:
 * - short key pointing the long one along with additional configuration
 */
function _flipStoreNames(obj /*: StoresConfigurationMap*/) /*: StoresConfigurationMapFlipped*/{
  const flippedConfigs /*: Array<[ShortStoreNames, StoreConfigurationFlipped]>*/ = entries(obj).map(([name, options]) => {
    const config = {
      name,
      permanent: options.permanent
    };
    return [options.name, config];
  });
  return flippedConfigs.reduce(reducer, {});
}

/**
 * Flip store scheme values
 */
function _flipStoreScheme(storeName /*: StoreNames*/, key /*: string*/, scheme /*: StoreFieldScheme*/) {
  const values = isPredefinedValuesField(scheme) ? {
    values: _flipObject(scheme.values)
  } : {};
  const keys = isNestingStoreField(scheme) ? {
    keys: _flipScheme(storeName, scheme.keys)
  } : {};
  const composite = isCompositeKeyStoreField(scheme) ? {
    composite: scheme.composite.map(key => _getShortKey(storeName, key))
  } : {};
  return {
    key,
    ...values,
    ...keys,
    ...composite
  };
}

/**
 * Flip general scheme recursivelly
 */
function _flipScheme(storeName /*: StoreNames*/, fieldsScheme /*: StoreFields*/) {
  return entries(fieldsScheme).map(([key, scheme]) => {
    return isComplexStoreField(scheme) ? [scheme.key, _flipStoreScheme(storeName, key, scheme)] : [scheme, key];
  }).reduce(reducer, {});
}

/**
 * Extend base scheme with some more maps for encoding
 */
function _prepareLeft() /*: StoreScheme*/{
  const storesOptions /*: Array<[StoreNames, StoreOptionsOptionalKey]>*/ = entries(storage_scheme).map(([storeName, store]) => {
    const options /*: StoreOptionsOptionalKey*/ = {
      keyPath: store.scheme.keyPath,
      autoIncrement: store.scheme.autoIncrement,
      index: store.scheme.index,
      fields: store.scheme.fields
    };
    return [storeName, options];
  });
  return storesOptions.reduce(reducer, {});
}

/**
 * Prepare scheme for decoding
 */
function _prepareRight() /*: StoreScheme*/{
  const storesOptionsEncoded /*: Array<[StoreNames, StoreOptionsOptionalKey]>*/ = entries(Left).map(([storeName, storeScheme]) => {
    const options /*: StoreOptionsOptionalKey*/ = {
      keyPath: _getShortKey(storeName, storeScheme.keyPath),
      autoIncrement: storeScheme.autoIncrement,
      index: _getShortKey(storeName, storeScheme.index),
      fields: _flipScheme(storeName, storeScheme.fields)
    };
    return [storeName, options];
  });
  return storesOptionsEncoded.reduce(reducer, {});
}

/**
 * Get available values for encoding
 */
function _getValuesMap() /*: Record<string, number>*/{
  // all pairs of predefined keys and values such as {GET: 1}
  return entries(storage_scheme).reduce((acc, [, store]) => acc.concat(store.scheme.fields), []).map(scheme => values(scheme).filter(isPredefinedValuesField).map(map => entries(map.values)).reduce((acc, map) => acc.concat(map), [])).reduce((acc, map) => acc.concat(map), []).reduce(reducer, {});
}

/**
 * Get short key version of a specified key
 */
function _getShortKey(storeName /*: StoreNames*/, key /*: Maybe<string>*/) /*: Maybe<string>*/{
  if (!key) {
    return undefined;
  }
  const map = storage_scheme[storeName].scheme.fields[key];
  if (isComplexStoreField(map)) {
    return map.key;
  }
  return map || key;
}

/**
 * Get store names and their general configuration (if store is permanent or not)
 */
function _getStoreNames() /*: StoresConfigurationMap*/{
  const storeNames /*: Array<[StoreNames, StoreConfiguration]>*/ = entries(storage_scheme).map(([name, store]) => {
    const config = {
      name: store.name,
      permanent: store.permanent
    };
    return [name, config];
  });
  return storeNames.reduce(reducer, {});
}
const Left = _prepareLeft();
const Right = _prepareRight();
const Values = _getValuesMap();
const StoreNamesAndConfigs = _getStoreNames();
/* harmony default export */ const scheme_map = ({
  left: Left,
  right: Right,
  values: Values,
  storeNames: {
    left: StoreNamesAndConfigs,
    right: _flipStoreNames(StoreNamesAndConfigs)
  }
});
;// ./src/sdk/storage/types.ts

var KeyRangeCondition = /*#__PURE__*/function (KeyRangeCondition) {
  KeyRangeCondition["LowerBound"] = "lowerBound";
  KeyRangeCondition["UpperBound"] = "upperBound";
  return KeyRangeCondition;
}(KeyRangeCondition || {});
function valueIsRecord(value /*: StoredValue | Record<string, unknown>*/) /*: value is Record<string, unknown>*/{
  return isObject(value);
}

;// ./src/sdk/storage/converter.ts




var Direction = /*#__PURE__*/function (Direction) {
  Direction["right"] = "right";
  Direction["left"] = "left";
  return Direction;
}(Direction || {});
/**
 * Get value from the map if available
 */
function _getValue(map /*: Nullable<Record<string, StoredValue>>*/, value /*: StoredValue*/) /*: StoredValue*/{
  return map ? map[value] !== undefined ? map[value] : value : value;
}

/**
 * Convert key and value by defined scheme
 */
function _convert(storeName /*: StoreNameType*/, dir /*: Direction*/, key /*: string*/, value /*: StoredValue | StoredRecord*/, scheme /*: StoreFieldScheme*/) /*: [string, unknown]*/{
  if (!scheme) {
    return [key, value];
  }
  const encodedKey = isComplexStoreField(scheme) ? scheme.key : scheme;
  if (valueIsRecord(value)) {
    const keys = isNestingStoreField(scheme) ? scheme.keys : null;
    return [encodedKey, convertRecord(storeName, dir, value, keys)];
  }
  const valuesMap = isPredefinedValuesField(scheme) ? scheme.values : null;
  return [encodedKey, _getValue(valuesMap, value)];
}

/**
 * Convert record by defined direction and scheme
 */

/**
 * Convert record by defined direction and scheme
 */

/**
 * Convert record by defined direction and scheme
 * Note: the function signature is duplicated because TS hides function implementation
 */
function convertRecord(storeName /*: StoreNameType*/, dir /*: Direction*/, record /*: Maybe<StoredRecord>*/, scheme /*: StoreFields*/) /*: Maybe<StoredRecord>*/{
  if (!record) {
    return undefined;
  }
  const _scheme /*: StoreFields*/ = scheme || scheme_map[dir][convertStoreName(storeName, Direction.right)].fields;
  return entries(record).map(([key, value]) => _convert(storeName, dir, key, value, _scheme[key])).reduce((acc, [key, value]) => ({
    ...acc,
    [key]: value
  }), {});
}

/**
 * Convert records by defined direction
 */
function convertRecords(storeName /*: StoreNameType*/, dir /*: Direction*/, records /*: Array<StoredRecord>*/ = []) /*: Array<StoredRecord>*/{
  return records.map(record => convertRecord(storeName, dir, record));
}

/**
 * Convert values by defined direction
 */
function convertValues(storeName /*: StoreNameType*/, dir /*: Direction*/, target /*: StoredRecordId*/) /*: StoredValue | Array<StoredValue>*/{
  const scheme /*: StoreOptions*/ = scheme_map[dir][convertStoreName(storeName, Direction.right)];
  const keyPathScheme = scheme.fields[scheme.keyPath];
  const values = target instanceof Array ? target.slice() : [target];
  const keys = isCompositeKeyStoreField(keyPathScheme) ? keyPathScheme.composite : [scheme.keyPath];
  const converted = keys.map((key /*: string*/, index /*: number*/) => {
    const field = scheme.fields[key];
    const predefinedValuesMap = isPredefinedValuesField(field) ? field.values : null;
    return _getValue(predefinedValuesMap, values[index]);
  });
  return converted.length === 1 ? converted[0] : converted;
}

/**
 * Encode value by defined scheme
 */
function encodeValue(target /*: StoredValue*/) /*: StoredValue*/{
  return scheme_map.values[target] || target;
}

/**
 * Convert store name by defined direction
 */
function convertStoreName(storeName /*: StoreNameType*/, dir /*: Direction*/) /*: StoreNameType*/{
  return (scheme_map.storeNames[dir][storeName] || {}).name || storeName;
}

/**
 * Decode error message by replacing short store name with long readable one
 */
function decodeErrorMessage(storeName /*: ShortStoreNames*/, error /*: Error*/) /*: Error*/{
  return {
    name: error.name,
    message: error.message.replace(`"${storeName}"`, convertStoreName(storeName, Direction.right))
  };
}

;// ./src/sdk/time.js
/**
 * Prepend zero to be used in certain format
 *
 * @param {number} value
 * @param {number} power
 * @returns {string}
 * @private
 */
function _prependZero(value /*: number*/, power /*: number*/ = 1) /*: string*/{
  let formatted = value + '';
  for (let i = 1; i <= power; i += 1) {
    if (value < Math.pow(10, i)) {
      formatted = `0${formatted}`;
    }
  }
  return formatted;
}

/**
 * Get formatted date (YYYY-MM-DD)
 *
 * @param date
 * @returns {string}
 * @private
 */
function _getDate(date /*: Date*/) /*: string*/{
  const day = _prependZero(date.getDate());
  const month = _prependZero(date.getMonth() + 1);
  const year = date.getFullYear();
  return [year, month, day].join('-');
}

/**
 * Get formatted hours, minutes, seconds and milliseconds (HH:mm:ss.SSS)
 *
 * @param {Date} date
 * @returns {string}
 * @private
 */
function _getTime(date /*: Date*/) /*: string*/{
  const hours = _prependZero(date.getHours(), 1);
  const minutes = _prependZero(date.getMinutes());
  const seconds = _prependZero(date.getSeconds());
  const milliseconds = _prependZero(date.getMilliseconds(), 2);
  return [hours, minutes, seconds].join(':') + '.' + milliseconds;
}

/**
 * Get formatted timezone (ZZ)
 *
 * @param {Date} date
 * @returns {string}
 * @private
 */
function _getTimezone(date /*: Date*/) /*: string*/{
  const offsetInMinutes = date.getTimezoneOffset();
  const hoursOffset = _prependZero(Math.floor(Math.abs(offsetInMinutes) / 60));
  const minutesOffset = _prependZero(Math.abs(offsetInMinutes) % 60);
  const sign = offsetInMinutes > 0 ? '-' : '+';
  return sign + hoursOffset + minutesOffset;
}

/**
 * Get the timestamp in the backend format
 *
 * @param {number=} timestamp
 * @returns {string}
 */
function getTimestamp(timestamp /*: number*/) /*: string*/{
  const d = timestamp ? new Date(timestamp) : new Date();
  const date = _getDate(d);
  const time = _getTime(d);
  const timezone = _getTimezone(d);
  return `${date}T${time}Z${timezone}`;
}

/**
 * Calculate time passed between two dates in milliseconds
 *
 * @param {number} d1
 * @param {number} d2
 * @returns {number}
 */
function timePassed(d1 /*: number*/, d2 /*: number*/) /*: number*/{
  if (isNaN(d1) || isNaN(d2)) {
    return 0;
  }
  return Math.abs(d2 - d1);
}

;// ./src/sdk/pub-sub.ts

/**
 * List of events with subscribed callbacks
 */
let _list /*: Record<string, Array<CallbackWithId>>*/ = {};

/**
 * Reference to timeout ids so they can be cleared on destroy
 */
let _timeoutIds /*: Array<ReturnType<typeof setTimeout>>*/ = [];

/**
 * Get unique id for the callback to use for unsubscribe
 */
function _getId() /*: string*/{
  return 'id' + Math.random().toString(36).substring(2, 16);
}

/**
 * Subscribe to a certain event
 */
function subscribe /*:: <T>*/(name /*: string*/, cb /*: (name: string, arg: T) => unknown*/) /*: string*/{
  const id = _getId();
  const callback /*: CallbackWithId<T>*/ = {
    id,
    cb
  };
  if (!_list[name]) {
    _list[name] = [];
  }
  _list[name].push(callback);
  return id;
}

/**
 * Unsubscribe particular callback from an event
 */
function unsubscribe(id /*: string*/) {
  if (!id) {
    return;
  }
  entries(_list).some(([, callbacks]) => callbacks.some((callback /*: CallbackWithId<T>*/, i /*: number*/) /*:: <T>*/ => {
    if (callback.id === id) {
      callbacks.splice(i, 1);
    }
  }));
}

/**
 * Publish certain event with optional arguments
 */
function publish /*:: <T>*/(name /*: string*/, args /*: T*/) /*: void*/{
  if (!_list[name]) {
    return;
  }
  _list[name].forEach((item /*: CallbackWithId<T>*/) => {
    if (typeof item.cb === 'function') {
      _timeoutIds.push(setTimeout(() => item.cb(name, args)));
    }
  });
}

/**
 * Destroy all registered events with their callbacks
 */
function pub_sub_destroy() /*: void*/{
  _timeoutIds.forEach(clearTimeout);
  _timeoutIds = [];
  _list = {};
}

;// ./src/sdk/activity-state.js
/*:: // 
import { type UrlT, type ActivityStateMapT, type AttributionMapT, type CommonRequestParams } from './types';*/








/**
 * Reference to the activity state
 *
 * @type {Object}
 * @private
 */
let _activityState /*: ActivityStateMapT*/ = {};

/**
 * Started flag, if activity state has been initiated
 *
 * @type {boolean}
 * @private
 */
let _started /*: boolean*/ = false;

/**
 * Active flag, if in foreground
 *
 * @type {boolean}
 * @private
 */
let _active /*: boolean*/ = false;

/**
 * Get current activity state
 *
 * @returns {Object}
 */
function currentGetter() /*: ActivityStateMapT*/{
  return _started ? {
    ..._activityState
  } : {};
}

/**
 * Set current activity state
 *
 * @param {Object} params
 */
function currentSetter(params /*: ActivityStateMapT*/ = {}) {
  _activityState = _started ? {
    ...params
  } : {};
}

/**
 * Initiate in-memory activity state
 *
 * @param {Object} params
 */
function init(params /*: ActivityStateMapT*/) {
  _started = true;
  currentSetter(params);
}

/**
 * Check if activity state is started
 *
 * @returns {boolean}
 */
function isStarted() {
  return _started;
}

/**
 * Update last active point
 *
 * @private
 */
function updateLastActive() /*: void*/{
  if (!_started) {
    return;
  }
  _activityState.lastInterval = _getLastInterval();
  _activityState.lastActive = Date.now();
}

/**
 * Update activity state with new params
 *
 * @param {Object} params
 * @private
 */
function _update(params /*: ActivityStateMapT*/) /*: void*/{
  _activityState = {
    ..._activityState,
    ...params
  };
}

/**
 * Set active flag to true when going foreground
 */
function toForeground() /*: void*/{
  _active = true;
}

/**
 * Set active flag to false when going background
 */
function toBackground() /*: void*/{
  _active = false;
}

/**
 * Get time offset from the last active point
 *
 * @returns {number}
 * @private
 */
function _getOffset() /*: number*/{
  const lastActive = _activityState.lastActive;
  return Math.round(timePassed(lastActive, Date.now()) / (/* inlined export .SECOND */1000));
}

/**
 * Get time spent with optional offset from last point
 *
 * @returns {number}
 * @private
 */
function _getTimeSpent() /*: number*/{
  return (_activityState.timeSpent || 0) + (_active ? _getOffset() : 0);
}

/**
 * Get session length with optional offset from last point
 *
 * @returns {number}
 * @private
 */
function _getSessionLength() /*: number*/{
  const lastActive = _activityState.lastActive;
  const withinWindow = timePassed(lastActive, Date.now()) < config.sessionWindow;
  const withOffset = _active || !_active && withinWindow;
  return (_activityState.sessionLength || 0) + (withOffset ? _getOffset() : 0);
}

/**
 * Get total number of sessions so far
 *
 * @returns {number}
 * @private
 */
function _getSessionCount() /*: number*/{
  return _activityState.sessionCount || 0;
}

/**
 * Get total number of events so far
 *
 * @returns {number}
 * @private
 */
function _getEventCount() /*: number*/{
  return _activityState.eventCount || 0;
}

/**
 * Get time passed since last activity was recorded
 *
 * @returns {number}
 * @private
 */
function _getLastInterval() /*: number*/{
  const lastActive = _activityState.lastActive;
  if (lastActive) {
    return Math.round(timePassed(lastActive, Date.now()) / (/* inlined export .SECOND */1000));
  }
  return -1;
}

/**
 * Initiate session params and go to foreground
 */
function initParams() /*: void*/{
  updateSessionOffset();
  toForeground();
}

/**
 * Get activity state params that are sent with each request
 *
 * @returns {Object}
 */
function getParams(url /*: UrlT*/) /*: ?CommonRequestParams*/{
  if (!_started) {
    return null;
  }
  const lastInterval = _activityState.lastInterval >= 0 ? _activityState.lastInterval : 0;
  const baseParams /*: CommonRequestParams*/ = {
    timeSpent: _activityState.timeSpent || 0,
    sessionLength: _activityState.sessionLength || 0,
    sessionCount: _activityState.sessionCount || 1,
    lastInterval: lastInterval || 0
  };
  if (url && isRequest(url, 'event')) {
    baseParams.eventCount = _activityState.eventCount;
  }
  return baseParams;
}

/**
 * Update activity state parameters depending on the endpoint which has been run
 *
 * @param {string} url
 * @param {boolean=false} auto
 */
function updateParams(url /*: string*/, auto /*: boolean*/) /*: void*/{
  if (!_started) {
    return;
  }
  const params = {};
  params.timeSpent = _getTimeSpent();
  params.sessionLength = _getSessionLength();
  if (isRequest(url, 'session')) {
    params.sessionCount = _getSessionCount() + 1;
  }
  if (isRequest(url, 'event')) {
    params.eventCount = _getEventCount() + 1;
  }
  _update(params);
  if (!auto) {
    updateLastActive();
  }
}

/**
 * Update installed flag - first session has been finished
 */
function updateInstalled() /*: void*/{
  if (!_started) {
    return;
  }
  if (_activityState.installed) {
    return;
  }
  _update({
    installed: true
  });
}

/**
 * Update session params which depend on the time offset since last measure point
 */
function updateSessionOffset() /*: void*/{
  if (!_started) {
    return;
  }
  const timeSpent = _getTimeSpent();
  const sessionLength = _getSessionLength();
  _update({
    timeSpent,
    sessionLength
  });
  updateLastActive();
}

/**
 * Update session length
 */
function updateSessionLength() /*: void*/{
  if (!_started) {
    return;
  }
  const sessionLength = _getSessionLength();
  _update({
    sessionLength
  });
  updateLastActive();
}

/**
 * Reset time spent and session length to zero
 */
function resetSessionOffset() /*: void*/{
  if (!_started) {
    return;
  }
  _update({
    timeSpent: 0,
    sessionLength: 0
  });
}

/**
 * Destroy current activity state
 */
function activity_state_destroy() /*: void*/{
  _activityState = {};
  _started = false;
  _active = false;
}
function getAttribution() /*: AttributionMapT | null*/{
  if (!_started) {
    return null;
  }
  if (!_activityState.attribution) {
    logger.log('No attribution data yet');
    return null;
  }
  return _activityState.attribution;
}
function waitForAttribution() /*: Promise<AttributionMapT>*/{
  if (_activityState.attribution) {
    return Promise.resolve(_activityState.attribution);
  }
  return new Promise(resolve => subscribe(PUB_SUB_EVENTS.ATTRIBUTION_RECEIVED, (_name /*: string*/, attribution /*: AttributionMapT*/) => resolve(attribution)));
}
function getWebUUID() /*: string*/{
  if (!_started) {
    return null;
  }
  return _activityState.uuid;
}
function waitForWebUUID() /*: Promise<string>*/{
  if (_activityState.uuid) {
    return Promise.resolve(_activityState.uuid);
  }
  return new Promise(resolve => subscribe(PUB_SUB_EVENTS.WEB_UUID_CREATED, (_name /*: string*/, webUuid /*: string*/) => resolve(webUuid)));
}
const ActivityState = {
  get current() {
    return currentGetter();
  },
  set current(value) {
    currentSetter(value);
  },
  init,
  isStarted,
  toForeground,
  toBackground,
  initParams,
  getParams,
  updateParams,
  updateInstalled,
  updateSessionOffset,
  updateSessionLength,
  resetSessionOffset,
  updateLastActive,
  destroy: activity_state_destroy,
  getAttribution,
  getWebUUID,
  waitForAttribution,
  waitForWebUUID
};
/* harmony default export */ const activity_state = (ActivityState);
;// ./src/sdk/storage/quick-storage.ts






class InMemoryStorage /*:: implements LocalStorage*/{
  items = {};
  getItem(key /*: string*/) /*: string | null*/{
    return Object.prototype.hasOwnProperty.call(this.items, key) ? this.items[key] : null;
  }
  removeItem(key /*: string*/) /*: void*/{
    delete this.items[key];
  }
  setItem(key /*: string*/, value /*: string*/) /*: void*/{
    this.items[key] = value;
  }
}
class QuickStorage {
  defaultName = globals.namespace;
  storageName = this.defaultName;
  storeNames = scheme_map.storeNames.left;
  /**
   * Get the value for specified key
   */
  read(key /*: ShortStoreName | ShortPreferencesStoreName*/) /*: Nullable<StoreContent>*/{
    const valueToParse = this.storage.getItem(`${this.storageName}.${key}`);
    const value = valueToParse ? JSON.parse(valueToParse) : null;
    if (key === ShortPreferencesStoreName.Preferences && value) {
      return convertRecord(ShortPreferencesStoreName.Preferences, Direction.right, value);
    }
    return value;
  }

  /**
   * Set the value for specified key
   */
  write(key /*: ShortStoreName | ShortPreferencesStoreName*/, value /*: StoreContent*/) {
    if (!value) {
      this.storage.removeItem(`${this.storageName}.${key}`);
    } else {
      this.storage.setItem(`${this.storageName}.${key}`, JSON.stringify(value instanceof Array ? value : convertRecord(ShortPreferencesStoreName.Preferences, Direction.left, value)));
    }
  }

  /**
   * Clear all data related to the sdk
   */
  clear() {
    this.deleteData();
  }

  /**
   * Clear all data related to the sdk
   *
   * @param wipe if true then also remove permanent data such as user's preferences
   */
  deleteData(wipe = false) {
    values(this.storeNames).forEach(store => {
      if (wipe || !store.permanent) {
        this.storage.removeItem(`${this.storageName}.${store.name}`);
      }
    });
  }
  constructor() {
    this.storesMap = {};
    if (isLocalStorageSupported()) {
      this.storage = window.localStorage;
    } else {
      this.storage = new InMemoryStorage();
    }
    const read = this.read.bind(this);
    const write = this.write.bind(this);
    values(this.storeNames).forEach(store => {
      const shortStoreName = store.name;
      Object.defineProperty(this.storesMap, shortStoreName, {
        get() {
          return read(shortStoreName);
        },
        set(value) {
          write(shortStoreName, value);
        }
      });
    });
    Object.freeze(this.storesMap);
  }

  /**
   * Sets custom name to use in data keys and updates existing keys in localStorage
   */
  setCustomName(customName /*: string*/) {
    if (!customName || !customName.length) {
      return;
    }
    const newName = `${globals.namespace}-${customName}`;

    // Clone data
    values(this.storeNames).forEach(store => {
      const key = store.name;
      const rawData = this.storage.getItem(`${this.storageName}.${key}`); // Get data from the store, no need to encode it
      if (rawData) {
        this.storage.setItem(`${newName}.${key}`, rawData); // Put data into a new store
      }
    });
    this.deleteData(true);
    this.storageName = newName;
  }
  get stores() {
    return this.storesMap;
  }
}
/* harmony default export */ const quick_storage = (new QuickStorage());
;// ./src/sdk/preferences.ts



/**
 * Name of the store used by preferences
 */
const _storeName /*: string*/ = storage_scheme.preferences.name;

/**
 * Local reference to be used for recovering preserved state
 */
let _preferences /*: PreferencesT | null*/ = null;
_preferences = _getPreferences();

/**
 * Get preferences stored in the localStorage
 *
 * @returns {Object}
 * @private
 */
function _getPreferences() /*: PreferencesT | null*/{
  if (!_preferences) {
    _setPreferences();
  }
  return _preferences ? {
    ..._preferences
  } : null;
}

/**
 * Set local reference of the preserved preferences
 *
 * @private
 */
function _setPreferences() /*: void*/{
  _preferences = quick_storage.stores[_storeName];
}

/**
 * Get current disabled state
 *
 * @returns {Object|null}
 */
function getDisabled() /*: SdkDisabledT | null*/{
  const preferences = _getPreferences();
  return preferences && preferences.sdkDisabled || null;
}

/**
 * Set current disabled state
 *
 * @param {Object|null} value
 */
function setDisabled(value /*: SdkDisabledT | null*/) /*: void*/{
  const sdkDisabled = value ? {
    ...value
  } : null;
  quick_storage.stores[_storeName] = {
    ..._getPreferences(),
    sdkDisabled
  };
  _setPreferences();
}

/**
 * Reload current preferences from localStorage if changed outside of current scope (e.g. tab)
 */
function reload() /*: void*/{
  const stored /*: PreferencesT*/ = quick_storage.stores[_storeName] || {};
  const sdkDisabled /*: SdkDisabledT | null*/ = (_preferences || {}).sdkDisabled || null;
  if (stored.sdkDisabled && !sdkDisabled) {
    publish('sdk:shutdown');
  }
  _setPreferences();
}

/**
 * Recover preferences from memory if storage was lost
 */
function recover() /*: void*/{
  const stored /*: PreferencesT*/ = quick_storage.stores[_storeName];
  if (!stored) {
    quick_storage.stores[_storeName] = {
      ..._preferences
    };
  }
}

;// ./src/sdk/storage/indexeddb.ts










var Action = /*#__PURE__*/function (Action) {
  Action["add"] = "add";
  Action["put"] = "put";
  Action["get"] = "get";
  Action["list"] = "list";
  Action["clear"] = "clear";
  Action["delete"] = "delete";
  return Action;
}(Action || {});
var AccessMode = /*#__PURE__*/function (AccessMode) {
  AccessMode["readonly"] = "readonly";
  AccessMode["readwrite"] = "readwrite";
  return AccessMode;
}(AccessMode || {});
class IndexedDBWrapper /*:: implements IStorage*/{
  static dbValidationName = 'validate-db-openable';
  dbDefaultName = globals.namespace;
  dbName = this.dbDefaultName;
  dbVersion = 1;
  indexedDbConnection = null;
  notSupportedError = {
    name: 'IDBNotSupported',
    message: 'IndexedDB is not supported'
  };
  databaseOpenError = {
    name: 'CannotOpenDatabaseError',
    message: 'Cannot open a database'
  };
  noConnectionError = {
    name: 'NoDatabaseConnection',
    message: 'Cannot open a transaction'
  };

  /**
   * Cached promise of IndexedDB validation
   */
  static isSupportedPromise = null;

  /**
   * Tries to open a temporary database
   */
  static tryOpen(db /*: IDBFactory*/) /*: Promise<boolean>*/{
    return new Promise(resolve => {
      try {
        const request = db.open(IndexedDBWrapper.dbValidationName);
        request.onsuccess = () => {
          request.result.close();
          db.deleteDatabase(IndexedDBWrapper.dbValidationName);
          resolve(true);
        };
        request.onerror = () => resolve(false);
      } catch {
        resolve(false);
      }
    });
  }

  /**
   * Check if IndexedDB is supported in the current browser (exclude iOS forcefully)
   */
  static isSupported() /*: Promise<boolean>*/{
    if (IndexedDBWrapper.isSupportedPromise) {
      return IndexedDBWrapper.isSupportedPromise;
    } else {
      const notSupportedMessage = 'IndexedDB is not supported in this browser';
      IndexedDBWrapper.isSupportedPromise = new Promise(resolve => {
        const indexedDB = IndexedDBWrapper.getIndexedDB();
        const iOS = !!navigator.platform && /iPad|iPhone|iPod/.test(navigator.platform);
        if (!indexedDB || iOS) {
          logger.warn(notSupportedMessage);
          resolve(false);
        } else {
          const dbOpenablePromise = IndexedDBWrapper.tryOpen(indexedDB).then(dbOpenable => {
            if (!dbOpenable) {
              logger.warn(notSupportedMessage);
            }
            return dbOpenable;
          });
          resolve(dbOpenablePromise);
        }
      });
    }
    return IndexedDBWrapper.isSupportedPromise;
  }

  /**
   * Get indexedDB instance
   */
  static getIndexedDB() /*: Maybe<IDBFactory>*/{
    return window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
  }
  constructor() {
    const idb = IndexedDBWrapper.getIndexedDB();
    if (!idb) {
      throw this.notSupportedError;
    }
    this.idbFactory = idb;
  }

  /**
   * Sets custom name if provided and migrates database
   */
  setCustomName(customName /*: string*/) /*: Promise<void>*/{
    if (customName && customName.length > 0) {
      this.dbName = `${globals.namespace}-${customName}`;
      return this.migrateDb(this.dbDefaultName, this.dbName);
    }
    return Promise.resolve();
  }

  /**
   * Opens database with defined name and resolves with database connection if successed
   * @param name name of database to open
   * @param version optional version of database schema
   * @param upgradeCallback optional `IDBOpenRequest.onupgradeneeded` event handler
   */
  openDatabase(name /*: string*/, upgradeCallback /*: (event: IDBVersionChangeEvent, reject: () => void) => void*/, version /*: number*/) /*: Promise<IDBDatabase>*/{
    return IndexedDBWrapper.isSupported().then(supported => {
      if (!supported) {
        return Promise.reject(this.notSupportedError);
      } else {
        return new Promise((resolve, reject) => {
          const request = this.idbFactory.open(name, version);
          if (upgradeCallback) {
            request.onupgradeneeded = event => upgradeCallback(event, reject);
          }
          request.onsuccess = (event /*: IDBOpenDBEvent*/) => {
            const connection = event.target.result;
            if (connection) {
              resolve(connection);
            } else {
              reject(this.databaseOpenError);
            }
          };
          request.onerror = reject;
        });
      }
    });
  }

  /**
   * Checks if database with passed name exists
   */
  databaseExists(name /*: string*/) /*: Promise<boolean>*/{
    return new Promise((resolve /*: (result: boolean) => void*/) => {
      let existed = true;
      this.openDatabase(name, () => {
        existed = false;
      }).then(connection => {
        connection.close();
        if (existed) {
          return;
        }

        // We didn't have this database before the check, so remove it
        return this.deleteDatabaseByName(name);
      }).then(() => resolve(existed));
    });
  }
  cloneData(defaultDbConnection /*: IDBDatabase*/, customDbConnection /*: IDBDatabase*/) /*: Promise<void>*/{
    // Function to clone a single store
    const cloneStore = (storeName /*: ShortStoreName*/) => {
      const connection = this.indexedDbConnection;
      this.indexedDbConnection = defaultDbConnection;
      return this.getAll(storeName) // Get all records from default-named database
      .then(records => {
        this.indexedDbConnection = customDbConnection;
        if (records.length < 1) {
          // There is no records in the store
          return;
        }
        return this.addBulk(storeName, records, true); // Put all records into custom-named database
      }).then(() => {
        this.indexedDbConnection = connection; // Restore initial state
      });
    };

    // Type guard to filter stores
    function isStoreName(key /*: ShortStoreNames*/) /*: key is ShortStoreName*/{
      return key !== 'p';
    }

    // Get names of stores
    const storeNames /*: ShortStoreName[]*/ = values(scheme_map.storeNames.left).map(store => store.name).filter(isStoreName);
    const cloneStorePromises = storeNames.map(name => () => cloneStore(name));

    // Run clone operations one by one
    return cloneStorePromises.reduce((previousTask, currentTask) => previousTask.then(currentTask), Promise.resolve());
  }

  /**
   * Migrates created database with default name to custom
   * The IndexedDb API doesn't provide method to rename existing database so we have to create a new database, clone
   * data and remove the old one.
   */
  migrateDb(defaultName /*: string*/, customName /*: string*/) /*: Promise<void>*/{
    return this.databaseExists(defaultName).then(defaultExists => {
      if (defaultExists) {
        // Migration hadn't finished yet
        return Promise.all([this.openDatabase(defaultName, this.handleUpgradeNeeded, this.dbVersion),
        // Open the default database, migrate version if needed
        this.openDatabase(customName, this.handleUpgradeNeeded, this.dbVersion) // Open or create a new database, migrate version if needed
        ]).then(([defaultDbConnection, customDbConnection]) => {
          return this.cloneData(defaultDbConnection, customDbConnection).then(() => {
            this.indexedDbConnection = customDbConnection;
            defaultDbConnection.close();
            return this.deleteDatabaseByName(defaultName);
          });
        }).then(() => logger.info('Database migration finished'));
      } else {
        // There is no default-named database, let's just create or open a custom-named one
        return this.openDatabase(customName, this.handleUpgradeNeeded, this.dbVersion).then(customDbConnection => {
          this.indexedDbConnection = customDbConnection;
        });
      }
    });
  }

  /**
   * Handle database upgrade/initialization
   * - store activity state from memory if database unexpectedly got lost in the middle of the window session
   * - migrate data from localStorage if available on browser upgrade
   */
  handleUpgradeNeeded(e /*: IDBVersionChangeEvent*/, reject /*: (reason: Event) => void*/) {
    const db = e.target.result;
    e.target.transaction.onerror = reject;
    e.target.transaction.onabort = reject;
    const storeNames = scheme_map.storeNames.left;
    const activityState = activity_state.current || {};
    const inMemoryAvailable = activityState && !isEmpty(activityState);
    entries(storeNames).filter(([, store]) => !store.permanent).forEach(([longStoreName, store]) => {
      const shortStoreName = store.name;
      const options = scheme_map.right[longStoreName];
      const objectStore = db.createObjectStore(shortStoreName, {
        keyPath: options.keyPath,
        autoIncrement: options.autoIncrement || false
      });
      if (options.index) {
        objectStore.createIndex(`${options.index}Index`, options.index);
      }
      if (shortStoreName === ShortStoreName.ActivityState && inMemoryAvailable) {
        objectStore.add(convertRecord(longStoreName, Direction.left, activityState));
        logger.info('Activity state has been recovered');
        return;
      }
      const localStorageRecord /*: Nullable<Array<StoredRecord>>*/ = quick_storage.stores[shortStoreName];
      if (localStorageRecord) {
        localStorageRecord.forEach(record => objectStore.add(record));
        logger.info(`Migration from localStorage done for ${longStoreName} store`);
      }
    });
    recover();
    quick_storage.clear();
  }

  /**
   * Open the database connection and create store if not existent
   */
  open() /*: Promise<{ success: boolean }>*/{
    if (this.indexedDbConnection) {
      return Promise.resolve({
        success: true
      });
    }
    return this.openDatabase(this.dbName, this.handleUpgradeNeeded, this.dbVersion).then(connection => {
      this.indexedDbConnection = connection;
      this.indexedDbConnection.onclose = () => this.destroy();
      return {
        success: true
      };
    });
  }

  /**
   * Get transaction and the store
   */
  getTransactionStore({
    storeName,
    mode
  } /*: { storeName: ShortStoreName, mode: AccessMode }*/, reject /*: (reason: Event) => void*/, db /*: IDBDatabase*/) /*: Transaction*/{
    const transaction /*: IDBTransaction*/ = db.transaction([storeName], mode);
    const store = transaction.objectStore(storeName);
    const options = scheme_map.right[convertStoreName(storeName, Direction.right)];
    let index;
    if (options.index) {
      index = store.index(`${options.index}Index`);
    }
    transaction.onerror = reject;
    transaction.onabort = reject;
    return {
      transaction,
      store,
      index,
      options
    };
  }

  /**
   * Override the error by extracting only name and message of the error
   */
  overrideError(reject /*: (reason: Error) => void*/, error /*: IDBError*/) {
    const {
      name,
      message
    } = error.target.error;
    return reject({
      name,
      message
    });
  }

  /**
   * Get list of composite keys if available
   */
  getCompositeKeys(options /*: StoreOptions*/) /*: Nullable<Array<string>>*/{
    const keyField = options.fields[options.keyPath];
    return isCompositeKeyStoreField(keyField) ? keyField.composite : null;
  }

  /**
   * Check if target is an object
   */
  targetIsObject(target /*: Nullable<StoredRecord | StoredRecordId>*/) /*: target is Record<string, StoredValue>*/{
    return isObject(target);
  }

  /**
   * Prepare the target to be queried depending on the composite key if defined
   */
  prepareTarget(options /*: StoreOptions*/, target /*: Nullable<StoredRecord | StoredRecordId>*/, action /*: Action*/) /*: Nullable<StoredRecord | StoredRecordId>*/{
    if (action === Action.clear || !target) {
      return null; // No target needed when we clear the whole store
    }
    const composite = this.getCompositeKeys(options);
    const needObjectTarget = [Action.add, Action.put].indexOf(action) !== -1;
    if (needObjectTarget) {
      if (this.targetIsObject(target)) {
        // target is a StoredRecord
        // extend target with composite path if needed and return it
        return composite ? {
          [options.keyPath]: composite.map(key => target[key]).join(''),
          ...target
        } : target;
      }
      return null;
    }

    // target is StoredRecordId (plain or composite)
    return target instanceof Array ? target.join('') : target;
  }

  /**
   * Prepare the result to be return depending on the composite key definition
   */
  prepareResult(options /*: StoreOptions*/, target /*: Nullable<StoredRecord | StoredRecordId>*/) /*: Nullable<Array<StoredValue>>*/{
    const composite = this.getCompositeKeys(options);
    if (composite && this.targetIsObject(target)) {
      return composite.map(key => target[key]);
    }
    return null;
  }

  /**
   * Initiate the database request
   */
  initRequest({
    storeName,
    target = null,
    action,
    mode = AccessMode.readonly
  } /*: Request*/) /*: Promise<Maybe<StoredRecord | StoredRecordId>>*/{
    return this.open().then(() => {
      return new Promise((resolve, reject) => {
        if (!this.indexedDbConnection) {
          reject(this.noConnectionError);
        } else {
          const {
            store,
            options
          } = this.getTransactionStore({
            storeName,
            mode
          }, reject, this.indexedDbConnection);
          const request = store[action](this.prepareTarget(options, target, action));
          const result = this.prepareResult(options, target);
          request.onsuccess = () => {
            if (action === Action.get && !request.result) {
              reject({
                name: 'NotRecordFoundError',
                message: `Requested record not found in "${storeName}" store`
              });
            } else {
              resolve(result || request.result || target);
            }
          };
          request.onerror = (error /*: Event*/) => this.overrideError(reject, error);
        }
      });
    });
  }

  /**
   * Initiate bulk database request by reusing the same transaction to perform the operation
   */
  initBulkRequest({
    storeName,
    target,
    action,
    mode = AccessMode.readwrite
  } /*: BulkRequest*/) /*: Promise<Array<StoredRecord | StoredRecordId>>*/{
    if (!target || target && !target.length) {
      return Promise.reject({
        name: 'NoTargetDefined',
        message: `No array provided to perform ${action} bulk operation into "${storeName}" store`
      });
    }
    return this.open().then(() => {
      return new Promise((resolve, reject) => {
        if (!this.indexedDbConnection) {
          reject(this.noConnectionError);
        } else {
          const {
            transaction,
            store,
            options
          } = this.getTransactionStore({
            storeName,
            mode
          }, reject, this.indexedDbConnection);

          // Array contains or StoredRecord either RecordIds, but not both at the same time
          const result = new Array();
          let current = target[0];
          transaction.oncomplete = () => resolve(result);
          const request = req => {
            req.onerror = error => this.overrideError(reject, error);
            req.onsuccess = () => {
              result.push(this.prepareResult(options, current) || req.result);
              current = target[result.length];
              if (result.length < target.length) {
                request(store[action](this.prepareTarget(options, current, action)));
              }
            };
          };
          request(store[action](this.prepareTarget(options, current, action)));
        }
      });
    });
  }

  /**
   * Open cursor for bulk operations or listing
   */
  openCursor({
    storeName,
    action,
    range = null,
    firstOnly = false,
    mode = AccessMode.readonly
  } /*: BulkRequest*/) /*: Promise<Array<StoredRecord | StoredRecordId>>*/{
    return this.open().then(() => {
      return new Promise((resolve, reject) => {
        if (!this.indexedDbConnection) {
          reject(this.noConnectionError);
        } else {
          const {
            transaction,
            store,
            index,
            options
          } = this.getTransactionStore({
            storeName,
            mode
          }, reject, this.indexedDbConnection);
          const cursorRequest /*: OpenIDBCursorRequest*/ = (index || store).openCursor(range);
          const items = new Array();
          transaction.oncomplete = () => resolve(items);
          cursorRequest.onsuccess = e => {
            const cursor = e.target.result;
            if (cursor) {
              if (action === Action.delete) {
                cursor.delete();
                items.push(this.prepareResult(options, cursor.value) || cursor.value[options.keyPath]);
              } else {
                items.push(cursor.value);
              }
              if (!firstOnly) {
                cursor.continue();
              }
            }
          };
          cursorRequest.onerror = error => this.overrideError(reject, error);
        }
      });
    });
  }
  deleteDatabaseByName(dbName /*: string*/) /*: Promise<void>*/{
    return new Promise((resolve, reject) => {
      const request = this.idbFactory.deleteDatabase(dbName);
      request.onerror = error => this.overrideError(reject, error);
      request.onsuccess = () => resolve();
      request.onblocked = e => reject(e.target);
    });
  }

  /**
   * Get all records from particular store
   */
  getAll(storeName /*: ShortStoreName*/, firstOnly = false) /*: Promise<Array<StoredRecord>>*/{
    return this.openCursor({
      storeName,
      action: Action.list,
      firstOnly
    });
  }

  /**
   * Get the first row from the store
   */
  getFirst(storeName /*: ShortStoreName*/) /*: Promise<Maybe<StoredRecord>>*/{
    return this.getAll(storeName, true).then(all => all.length ? all[0] : undefined);
  }

  /**
   * Get item from a particular store
   */
  getItem(storeName /*: ShortStoreName*/, target /*: StoredRecordId*/) /*: Promise<StoredRecord>*/{
    return this.initRequest({
      storeName,
      target,
      action: Action.get
    });
  }

  /**
   * Return filtered result by value on available index
   */
  filterBy(storeName /*: ShortStoreName*/, by /*: StoredValue*/) /*: Promise<Array<StoredRecord>>*/{
    const range = IDBKeyRange.only(by);
    return this.openCursor({
      storeName,
      action: Action.list,
      range
    });
  }

  /**
   * Add item to a particular store
   */
  addItem(storeName /*: ShortStoreName*/, target /*: StoredRecord*/) /*: Promise<StoredRecordId>*/{
    return this.initRequest({
      storeName,
      target,
      action: Action.add,
      mode: AccessMode.readwrite
    });
  }

  /**
   * Add multiple items into particular store
   */
  addBulk(storeName /*: ShortStoreName*/, target /*: Array<StoredRecord>*/, overwrite /*: boolean*/) /*: Promise<Array<StoredRecordId>>*/{
    return this.initBulkRequest({
      storeName,
      target,
      action: overwrite ? Action.put : Action.add,
      mode: AccessMode.readwrite
    });
  }

  /**
   * Update item in a particular store
   */
  updateItem(storeName /*: ShortStoreName*/, target /*: StoredRecord*/) /*: Promise<StoredRecordId>*/{
    return this.initRequest({
      storeName,
      target,
      action: Action.put,
      mode: AccessMode.readwrite
    });
  }

  /**
   * Delete item from a particular store
   */
  deleteItem(storeName /*: ShortStoreName*/, target /*: StoredRecordId*/) /*: Promise<StoredRecordId>*/{
    return this.initRequest({
      storeName,
      target,
      action: Action.delete,
      mode: AccessMode.readwrite
    });
  }

  /**
   * Delete items until certain bound (primary key as a bound scope)
   */
  deleteBulk(storeName /*: ShortStoreName*/, value /*: StoredValue*/, condition /*: KeyRangeCondition*/) /*: Promise<Array<StoredRecordId>>*/{
    const range = condition ? IDBKeyRange[condition](value) : IDBKeyRange.only(value);
    return this.openCursor({
      storeName,
      action: Action.delete,
      range,
      mode: AccessMode.readwrite
    });
  }

  /**
   * Trim the store from the left by specified length
   */
  trimItems(storeName /*: ShortStoreName*/, length /*: number*/) /*: Promise<Array<StoredRecordId>>*/{
    const options = scheme_map.right[convertStoreName(storeName, Direction.right)];
    return this.getAll(storeName).then(records => records.length ? records[length - 1] : null).then(record => record ? this.deleteBulk(storeName, record[options.keyPath], KeyRangeCondition.UpperBound) : []);
  }

  /**
   * Count the number of records in the store
   */
  count(storeName /*: ShortStoreName*/) /*: Promise<number>*/{
    return this.open().then(() => {
      return new Promise((resolve, reject) => {
        if (!this.indexedDbConnection) {
          reject(this.noConnectionError);
        } else {
          const {
            store
          } = this.getTransactionStore({
            storeName,
            mode: AccessMode.readonly
          }, reject, this.indexedDbConnection);
          const request = store.count();
          request.onsuccess = () => resolve(request.result);
          request.onerror = error => this.overrideError(reject, error);
        }
      });
    });
  }

  /**
   * Clear all records from a particular store
   */
  clear(storeName /*: ShortStoreName*/) /*: Promise<void>*/{
    return this.initRequest({
      storeName,
      action: Action.clear,
      mode: AccessMode.readwrite
    });
  }

  /**
   * Close the database and destroy the reference to it
   */
  destroy() /*: void*/{
    if (this.indexedDbConnection) {
      this.indexedDbConnection.close();
    }
    this.indexedDbConnection = null;
  }

  /**
   * Close db connection and delete the db
   * WARNING: should be used only by adjust's demo app!
   */
  deleteDatabase() /*: Promise<void>*/{
    this.destroy();
    return this.deleteDatabaseByName(this.dbName);
  }
}

;// ./src/sdk/storage/localstorage.ts









class LocalStorageWrapper /*:: implements IStorage*/{
  /**
   * Cached promise of LocalStorage validation
   */
  static isSupportedPromise = null;

  /**
   * Check if LocalStorage is supported in the current browser
   */
  static isSupported() /*: Promise<boolean>*/{
    if (LocalStorageWrapper.isSupportedPromise) {
      return LocalStorageWrapper.isSupportedPromise;
    } else {
      LocalStorageWrapper.isSupportedPromise = new Promise((resolve /*: (value: boolean) => void*/) => {
        const supported = isLocalStorageSupported();
        if (!supported) {
          logger.warn('LocalStorage is not supported in this browser');
        }
        resolve(supported);
      });
    }
    return LocalStorageWrapper.isSupportedPromise;
  }

  /**
   * Prepare schema details if not existent
   */
  open() /*: Promise<StorageOpenStatus>*/{
    return LocalStorageWrapper.isSupported().then(supported => {
      if (!supported) {
        return {
          status: 'error',
          error: {
            name: 'LSNotSupported',
            message: 'LocalStorage is not supported'
          }
        };
      }
      const storeNames = scheme_map.storeNames.left;
      const activityState = activity_state.current || {};
      const inMemoryAvailable = activityState && !isEmpty(activityState);
      entries(storeNames).filter(([, store]) => !store.permanent).forEach(([longStoreName, store]) => {
        const shortStoreName = store.name;
        if (shortStoreName === ShortStoreName.ActivityState && !quick_storage.stores[shortStoreName]) {
          quick_storage.stores[shortStoreName] = inMemoryAvailable ? [convertRecord(longStoreName, Direction.left, activityState)] : [];
        } else if (!quick_storage.stores[shortStoreName]) {
          quick_storage.stores[shortStoreName] = [];
        }
      });
      recover();
      return {
        status: 'success'
      };
    });
  }

  /**
   * Get list of composite keys if available
   */
  getCompositeKeys(options /*: StoreOptions*/) /*: Nullable<Array<string>>*/{
    const field = options.fields[options.keyPath];
    return isCompositeKeyStoreField(field) ? field.composite : null;
  }

  /**
   * Get composite keys when defined or fallback to primary key for particular store
   */
  getKeys(storeName /*: ShortStoreName*/) /*: Array<string>*/{
    const name = convertStoreName(storeName, Direction.right);
    const options /*: StoreOptions*/ = scheme_map.right[name];
    return this.getCompositeKeys(options) || [options.keyPath];
  }

  /**
   * Return next index using the current one and undefined if current is undefined
   */
  nextIndex(current /*: Maybe<number>*/) /*: Maybe<number>*/{
    return typeof current === 'number' ? current + 1 : undefined;
  }

  /**
   * Initiate quasi-database request
   */
  initRequest({
    storeName,
    id,
    item
  } /*: RequestParameters*/, action /*: Action<T>*/) /*: Promise<T>*/{
    const options = scheme_map.right[convertStoreName(storeName, Direction.right)];
    return this.open().then(open => {
      if (open.status === 'error') {
        return Promise.reject(open.error);
      }
      return new Promise((resolve, reject) => {
        const items /*: Array<StoredRecord>*/ = quick_storage.stores[storeName];
        const keys = this.getKeys(storeName);
        const lastId = (items[items.length - 1] || {})[options.keyPath] || 0;
        let target /*: StoredRecord*/;
        if (!id) {
          target = {
            ...item
          };
        } else {
          const ids = Array.isArray(id) ? id.slice() : [id];
          target = keys.map((key, index) => [key, ids[index]]).reduce(reducer, {});
        }
        const index = target ? findIndex(items, keys, target) : 0;
        return action(resolve, reject, {
          keys,
          items,
          index,
          options,
          lastId
        });
      });
    });
  }
  /*:: <T>*/

  /**
   * Sort the array by provided key (key can be a composite one)
   * - by default sorts in ascending order by primary keys
   * - force order by provided value
   */
  sort(items /*: Array<T>*/, keys /*: Array<string>*/, exact /*: Nullable<StoredValue>*/) /*: Array<T>*/{
    const clone = [...items];
    const reversed = keys.slice().reverse();
    function compare(a /*: T*/, b /*: T*/, key /*: string*/) {
      const expr1 = exact ? exact === a[key] : a[key] < b[key];
      const expr2 = exact ? exact > a[key] : a[key] > b[key];
      return expr1 ? -1 : expr2 ? 1 : 0;
    }
    return clone.sort((a, b) => reversed.reduce((acc, key) => {
      return acc || compare(a, b, key);
    }, 0));
  }
  /*:: <T>*/

  /**
   * Prepare the target to be queried depending on the composite key if defined
   */
  prepareTarget(options /*: StoreOptions*/, target /*: StoredRecord*/, next /*: number*/) /*: StoredRecord*/{
    const composite = this.getCompositeKeys(options);
    return composite ? {
      [options.keyPath]: composite.map(key => target[key]).join(''),
      ...target
    } : options.autoIncrement && next ? {
      [options.keyPath]: next,
      ...target
    } : {
      ...target
    };
  }

  /**
   * Prepare the result to be return depending on the composite key definition
   */
  prepareResult(options /*: StoreOptions*/, target /*: StoredRecord*/) /*: StoredRecordId*/{
    const composite = this.getCompositeKeys(options);
    if (composite) {
      return composite.map(key => target[key]).filter(value => /*: value is StoredValue*/!valueIsRecord(value));
    }
    return target[options.keyPath];
  }

  /**
   * Get all records from particular store
   */
  getAll(storeName /*: ShortStoreName*/, firstOnly = false) /*: Promise<Array<StoredRecord>>*/{
    return this.open().then(open => {
      if (open.status === 'error') {
        return Promise.reject(open.error);
      }
      return new Promise((resolve, reject) => {
        const value = quick_storage.stores[storeName];
        if (value instanceof Array) {
          resolve(firstOnly ? [value[0]] : this.sort(value, this.getKeys(storeName)));
        } else {
          reject({
            name: 'NotFoundError',
            message: `No objectStore named ${storeName} in this database`
          });
        }
      });
    });
  }

  /**
   * Get the first row from the store
   */
  getFirst(storeName /*: ShortStoreName*/) /*: Promise<Maybe<StoredRecord>>*/{
    return this.getAll(storeName, true).then(all => all.length ? all[0] : undefined);
  }

  /**
   * Get item from a particular store
   */
  getItem(storeName /*: ShortStoreName*/, id /*: StoredRecordId*/) /*: Promise<StoredRecord>*/{
    const action /*: Action<StoredRecord>*/ = (resolve, reject, {
      items,
      index,
      options
    }) => {
      if (index === -1) {
        reject({
          name: 'NotRecordFoundError',
          message: `Requested record not found in "${storeName}" store`
        });
      } else {
        resolve(this.prepareTarget(options, items[index]));
      }
    };
    return this.initRequest({
      storeName,
      id
    }, action);
  }

  /**
   * Return filtered result by value on available index
   */
  filterBy(storeName /*: ShortStoreName*/, by /*: StoredValue*/) /*: Promise<Array<StoredRecord>>*/{
    return this.getAll(storeName).then((result /*: Array<StoredRecord>*/) => {
      return result.filter(item => {
        const store = scheme_map.right[convertStoreName(storeName, Direction.right)];
        const indexedValue = store.index && item[store.index];
        return indexedValue === by;
      });
    });
  }

  /**
   * Add item to a particular store
   */
  addItem(storeName /*: ShortStoreName*/, item /*: StoredRecord*/) /*: Promise<StoredRecordId>*/{
    return this.initRequest({
      storeName,
      item
    }, (resolve, reject, {
      items,
      index,
      options,
      lastId
    }) => {
      if (index !== -1) {
        reject({
          name: 'ConstraintError',
          message: `Constraint was not satisfied, trying to add existing item into "${storeName}" store`
        });
      } else {
        items.push(this.prepareTarget(options, item, this.nextIndex(lastId)));
        quick_storage.stores[storeName] = items;
        resolve(this.prepareResult(options, item));
      }
    });
  }

  /**
   * Add multiple items into particular store
   */
  addBulk(storeName /*: ShortStoreName*/, target /*: Array<StoredRecord>*/, overwrite /*: boolean*/) /*: Promise<Array<StoredRecordId>>*/{
    return this.initRequest({
      storeName
    }, (resolve, reject, {
      keys,
      items,
      options,
      lastId
    }) => {
      if (!target || target && !target.length) {
        reject({
          name: 'NoTargetDefined',
          message: `No array provided to perform add bulk operation into "${storeName}" store`
        });
        return;
      }
      let id = lastId;
      const newItems = target.map(item => this.prepareTarget(options, item, id = this.nextIndex(id)));
      const overlapping = newItems.filter(item => findIndex(items, keys, item) !== -1).map(item => item[options.keyPath]);
      const currentItems = overwrite ? items.filter(item => overlapping.indexOf(item[options.keyPath]) === -1) : [...items];
      if (overlapping.length && !overwrite) {
        reject({
          name: 'ConstraintError',
          message: `Constraint was not satisfied, trying to add existing items into "${storeName}" store`
        });
      } else {
        quick_storage.stores[storeName] = this.sort([...currentItems, ...newItems], keys);
        const result = target.map(item => this.prepareResult(options, item));
        resolve(result);
      }
    });
  }

  /**
   * Update item in a particular store
   */
  updateItem(storeName /*: ShortStoreName*/, item /*: StoredRecord*/) /*: Promise<StoredRecordId>*/{
    return this.initRequest({
      storeName,
      item
    }, (resolve, _, {
      items,
      index,
      options,
      lastId
    }) => {
      const nextId = index === -1 ? this.nextIndex(lastId) : undefined;
      const target = this.prepareTarget(options, item, nextId);
      if (index === -1) {
        items.push(target);
      } else {
        items.splice(index, 1, target);
      }
      quick_storage.stores[storeName] = items;
      resolve(this.prepareResult(options, item));
    });
  }

  /**
   * Delete item from a particular store
   */
  deleteItem(storeName /*: ShortStoreName*/, id /*: StoredRecordId*/) /*: Promise<StoredRecordId>*/{
    return this.initRequest({
      storeName,
      id
    }, (resolve, _, {
      items,
      index
    }) => {
      if (index !== -1) {
        items.splice(index, 1);
        quick_storage.stores[storeName] = items;
      }
      resolve(id);
    });
  }

  /**
   * Find index of the item with the closest value to the bound
   */
  findMax(array /*: Array<StoredRecord>*/, key /*: string*/, value /*: StoredValue*/) /*: number*/{
    if (!array.length) {
      return -1;
    }
    let max = {
      index: -1,
      value: typeof value === 'string' ? '' : 0
    };
    for (let i = 0; i < array.length; i += 1) {
      if (array[i][key] <= value) {
        if (array[i][key] >= max.value) {
          max = {
            value: array[i][key],
            index: i
          };
        }
      } else {
        return max.index;
      }
    }
    return max.index;
  }

  /**
   * Delete items until certain bound (primary key as a bound scope)
   * Returns array of deleted elements
   */
  deleteBulk(storeName /*: ShortStoreName*/, value /*: StoredValue*/, condition /*: KeyRangeCondition*/) /*: Promise<Array<StoredRecordId>>*/{
    return this.getAll(storeName).then((items /*: Array<StoredRecord>*/) => {
      const keys = this.getKeys(storeName);
      const key = scheme_map.right[convertStoreName(storeName, Direction.right)].index || keys[0];
      const exact = condition ? null : value;
      const sorted /*: Array<StoredRecord>*/ = this.sort(items, keys, exact);
      const index = this.findMax(sorted, key, value);
      if (index === -1) {
        return [];
      }
      const start = condition === KeyRangeCondition.LowerBound ? index : 0;
      const end = !condition || condition === KeyRangeCondition.UpperBound ? index + 1 : sorted.length;
      const deleted /*: Array<StoredRecordId>*/ = sorted.splice(start, end).map(item => keys.length === 1 ? item[key] : keys.map(k => item[k]));
      quick_storage.stores[storeName] = sorted;
      return deleted;
    });
  }

  /**
   * Trim the store from the left by specified length
   */
  trimItems(storeName /*: ShortStoreName*/, length /*: number*/) /*: Promise<Array<StoredRecordId>>*/{
    const convertedName = convertStoreName(storeName, Direction.right);
    const options /*: StoreOptions*/ = scheme_map.right[convertedName];
    return this.getAll(storeName).then((records /*: Array<Record<string, StoredValue>>*/) => records.length ? records[length - 1] : null).then(record => record ? this.deleteBulk(storeName, record[options.keyPath], KeyRangeCondition.UpperBound) : []);
  }

  /**
   * Count the number of records in the store
   */
  count(storeName /*: ShortStoreName*/) /*: Promise<number>*/{
    return this.open().then(open => {
      if (open.status === 'error') {
        return Promise.reject(open.error);
      }
      const records = quick_storage.stores[storeName];
      return Promise.resolve(records instanceof Array ? records.length : 1);
    });
  }

  /**
   * Clear all records from a particular store
   */
  clear(storeName /*: ShortStoreName*/) /*: Promise<void>*/{
    return this.open().then(open => {
      if (open.status === 'error') {
        return Promise.reject(open.error);
      }
      return new Promise(resolve => {
        quick_storage.stores[storeName] = [];
        resolve();
      });
    });
  }

  /**
   * Does nothing, it simply matches the common storage interface
   */
  destroy() {}

  /**
   * Does nothing, it simply matches the common storage interface
   */
  deleteDatabase() {}
}

;// ./src/sdk/storage/storage.ts








// eslint-disable-line @typescript-eslint/no-explicit-any
var StorageType = function (StorageType) {
  StorageType[StorageType["noStorage"] = STORAGE_TYPES.NO_STORAGE] = "noStorage";
  StorageType[StorageType["indexedDB"] = STORAGE_TYPES.INDEXED_DB] = "indexedDB";
  StorageType[StorageType["localStorage"] = STORAGE_TYPES.LOCAL_STORAGE] = "localStorage";
  return StorageType;
}(StorageType || {});
/**
 * Methods to extend
 */
const _methods /*: CommonStorageMethods*/ = {
  getAll: _getAll,
  getFirst: _getFirst,
  getItem: _getItem,
  filterBy: _filterBy,
  addItem: _addItem,
  addBulk: _addBulk,
  updateItem: _updateItem,
  deleteItem: _deleteItem,
  deleteBulk: _deleteBulk,
  trimItems: _trimItems,
  count: _count,
  clear: _clear,
  destroy: _destroy,
  deleteDatabase: _deleteDatabase
};

/**
 * Extends storage's getAll method by decoding returned records
 */
function _getAll(storage /*: IStorage*/, storeName /*: ShortStoreName*/, firstOnly /*: boolean*/) {
  return storage.getAll(storeName, firstOnly).then(records => convertRecords(storeName, Direction.right, records));
}

/**
 * Extends storage's getFirst method by decoding returned record
 */
function _getFirst(storage /*: IStorage*/, storeName /*: ShortStoreName*/) {
  return storage.getFirst(storeName).then(record => convertRecord(storeName, Direction.right, record));
}

/**
 * Extends storage's getItem method by encoding target value and then decoding returned record
 */
function _getItem(storage /*: IStorage*/, storeName /*: ShortStoreName*/, target /*: StoredRecordId*/) {
  return storage.getItem(storeName, convertValues(storeName, Direction.left, target)).then(record => convertRecord(storeName, Direction.right, record)).catch(error => Promise.reject(decodeErrorMessage(storeName, error)));
}

/**
 * Extends storage's filterBy method by encoding target value and then decoding returned records
 */
function _filterBy(storage /*: IStorage*/, storeName /*: ShortStoreName*/, target /*: string*/) {
  return storage.filterBy(storeName, encodeValue(target)).then(records => convertRecords(storeName, Direction.right, records));
}

/**
 * Extends storage's addItem method by encoding target record and then decoding returned keys
 */
function _addItem(storage /*: IStorage*/, storeName /*: ShortStoreName*/, record /*: StoredRecord*/) {
  const convertedRecord = convertRecord(storeName, Direction.left, record);
  return storage.addItem(storeName, convertedRecord).then(target => convertValues(storeName, Direction.right, target)).catch(error => Promise.reject(decodeErrorMessage(storeName, error)));
}

/**
 * Extends storage's addBulk method by encoding target records and then decoding returned keys
 */
function _addBulk(storage /*: IStorage*/, storeName /*: ShortStoreName*/, records /*: Array<StoredRecord>*/, overwrite /*: boolean*/) {
  const convertedRecords /*: Array<StoredRecord>*/ = convertRecords(storeName, Direction.left, records);
  return storage.addBulk(storeName, convertedRecords, overwrite).then(values => values.map(target => convertValues(storeName, Direction.right, target))).catch(error => Promise.reject(decodeErrorMessage(storeName, error)));
}

/**
 * Extends storage's updateItem method by encoding target record and then decoding returned keys
 */
function _updateItem(storage /*: IStorage*/, storeName /*: ShortStoreName*/, record /*: StoredRecord*/) {
  const convertedRecord = convertRecord(storeName, Direction.left, record);
  return storage.updateItem(storeName, convertedRecord).then(target => convertValues(storeName, Direction.right, target));
}

/**
 * Extends storage's deleteItem method by encoding target value and then decoding returned keys
 */
function _deleteItem(storage /*: IStorage*/, storeName /*: ShortStoreName*/, target /*: StoredRecordId*/) {
  return storage.deleteItem(storeName, convertValues(storeName, Direction.left, target)).then(target => convertValues(storeName, Direction.right, target));
}

/**
 * Extends storage's deleteBulk method by encoding target value and then decoding returned records that are deleted
 */
function _deleteBulk(storage /*: IStorage*/, storeName /*: ShortStoreName*/, value /*: StoredValue*/, condition /*: KeyRangeCondition*/) {
  return storage.deleteBulk(storeName, encodeValue(value), condition).then(records => records.map(record => convertValues(storeName, Direction.right, record)));
}

/**
 * Extends storage's trimItems method by passing encoded storage name
 */
function _trimItems(storage /*: IStorage*/, storeName /*: ShortStoreName*/, length /*: number*/) {
  return storage.trimItems(storeName, length);
}

/**
 * Extends storage's count method by passing encoded storage name
 */
function _count(storage /*: IStorage*/, storeName /*: ShortStoreName*/) {
  return storage.count(storeName);
}

/**
 * Extends storage's clear method by passing encoded storage name
 */
function _clear(storage /*: IStorage*/, storeName /*: ShortStoreName*/) {
  return storage.clear(storeName);
}

/**
 * Calls storage's destroy method
 */
function _destroy(storage /*: IStorage*/) {
  return storage.destroy();
}

/**
 * Calls storage's deleteDatabase method
 */
function _deleteDatabase(storage /*: IndexedDB | LocalStorage*/) {
  return storage.deleteDatabase();
}

/**
 * Augment whitelisted methods with encoding/decoding functionality
 */
function _augment() /*: StorageMethods*/{
  const methods /*: Array<[MethodName, StorageMethod]>*/ = entries(_methods).map(([methodName, method]) => {
    const augmentedMethod /*: StorageMethod*/ = (storeName /*: StoreName*/, ...args) => {
      return storage_init().then(({
        storage
      }) => {
        if (storage) {
          return method.call(null, storage, convertStoreName(storeName, Direction.left), ...args);
        }
      });
    };
    return [methodName, augmentedMethod];
  });
  return methods.reduce(reducer, {});
}

/**
 * Type of available storage
 */
let type /*: StorageType*/;

/**
 * Returns type of used storage which is one of possible values INDEXED_DB, LOCAL_STORAGE or NO_STORAGE if there is no
 * storage available
 */
function getType() /*: StorageType*/{
  return type;
}

/**
 * Cached promise of Storage initialization
 */
let _initializationPromise /*: Nullable<Promise<Storage>>*/ = null;

/**
 * Check which storage is available and pick it up
 * Prefer indexedDB over localStorage
 */
function storage_init(dbName /*: string*/) /*: Promise<Storage>*/{
  let storage /*: Nullable<IStorage>*/ = null;
  if (_initializationPromise !== null) {
    return _initializationPromise;
  } else {
    _initializationPromise = Promise.all([IndexedDBWrapper.isSupported(), LocalStorageWrapper.isSupported()]).then(([idbSupported, lsSupported]) => {
      quick_storage.setCustomName(dbName);
      if (idbSupported) {
        type = StorageType.indexedDB;
        const idb = new IndexedDBWrapper();
        return idb.setCustomName(dbName).then(() => storage = idb);
      } else if (lsSupported) {
        type = StorageType.localStorage;
        storage = new LocalStorageWrapper();
        return Promise.resolve(storage);
      } else {
        logger.error('There is no storage available, app will run with minimum set of features');
        type = StorageType.noStorage;
        storage = null;
        return Promise.resolve(storage);
      }
    }).then(() => {
      return {
        type,
        storage
      };
    });
  }
  return _initializationPromise;
}
/* harmony default export */ const storage = ({
  init: storage_init,
  getType,
  ..._augment()
});
;// ./src/sdk/default-params.js
/*:: // 
import { type NavigatorT, type CreatedAtT, type SentAtT, type WebUuidT, type TrackEnabledT, type PlatformT, type LanguageT, type MachineTypeT, type QueueSizeT, type DefaultParamsT } from './types';*/




/**
 * Get created at timestamp
 *
 * @returns {{createdAt: string}}
 * @private
 */
function _getCreatedAt() /*: CreatedAtT*/{
  return {
    createdAt: getTimestamp()
  };
}

/**
 * Get sent at timestamp
 *
 * @returns {{sentAt: string}}
 * @private
 */
function _getSentAt() /*: SentAtT*/{
  return {
    sentAt: getTimestamp()
  };
}

/**
 * Read uuid from the activity state
 *
 * @returns {{webUuid: string}}
 * @private
 */
function _getWebUuid() /*: WebUuidT*/{
  return {
    webUuid: activity_state.current.uuid
  };
}

/**
 * Get track enabled parameter by reading doNotTrack
 *
 * @returns {{trackingEnabled: boolean}|null}
 * @private
 */
function _getTrackEnabled() /*: ?TrackEnabledT*/{
  const navigatorExt = (navigator /*: NavigatorT*/);
  const isNavigatorDNT = typeof navigatorExt.doNotTrack !== 'undefined';
  const isWindowDNT = typeof window.doNotTrack !== 'undefined';
  const isMsDNT = typeof navigatorExt.msDoNotTrack !== 'undefined';
  const dnt = isNavigatorDNT ? navigatorExt.doNotTrack : isWindowDNT ? window.doNotTrack : isMsDNT ? navigatorExt.msDoNotTrack : null;
  if (parseInt(dnt, 10) === 0 || dnt === 'no') {
    return {
      trackingEnabled: true
    };
  }
  if (parseInt(dnt, 10) === 1 || dnt === 'yes') {
    return {
      trackingEnabled: false
    };
  }
  return null;
}

/**
 * Get platform parameter => hardcoded to `web`
 *
 * @returns {{platform: string}}
 * @private
 */
function _getPlatform() /*: PlatformT*/{
  return {
    platform: 'web'
  };
}

/**
 * Get language preferences
 *
 * @returns {{language: string, country: string|undefined}}
 * @private
 */
function _getLanguage() /*: LanguageT*/{
  const navigatorExt = (navigator /*: NavigatorT*/);
  const [language, country] = (navigatorExt.language || navigatorExt.userLanguage || 'en').split('-');
  return {
    language,
    country: country ? '' + country.toLowerCase() : undefined
  };
}

/**
 * Get machine type from navigator.platform property
 *
 * @returns {{machineType: (string|undefined)}}
 */
function _getMachineType() /*: MachineTypeT*/{
  const ua = navigator.userAgent || navigator.vendor;
  const overrideWin32 = navigator.platform === 'Win32' && (ua.indexOf('WOW64') !== -1 || ua.indexOf('Win64') !== -1);
  return {
    machineType: overrideWin32 ? 'Win64' : navigator.platform
  };
}

/**
 * Get the current queue size
 *
 * @returns {Promise}
 * @private
 */
function _getQueueSize() /*: Promise<QueueSizeT>*/{
  return storage.getAll('queue').then(records => ({
    queueSize: records.length
  }));
}
function defaultParams() /*: Promise<DefaultParamsT>*/{
  return _getQueueSize().then(queueSize => ({
    ..._getCreatedAt(),
    ..._getSentAt(),
    ..._getWebUuid(),
    ..._getTrackEnabled(),
    ..._getPlatform(),
    ..._getLanguage(),
    ..._getMachineType(),
    ...queueSize
  }));
}
;// ./src/sdk/http.js
/*:: // 
import { type UrlT, type DefaultParamsT, type HttpSuccessResponseT, type HttpErrorResponseT, type HttpRequestParamsT, type ErrorCodeT } from './types';*/







/*:: type ParamsWithAttemptsT = HttpRequestParamsT['params']*/
/**
 * Get filtered response from successful request
 *
 * @param {Object} xhr
 * @param {String} url
 * @returns {Object}
 * @private
 */
function _getSuccessResponse(xhr /*: XMLHttpRequest*/, url /*: UrlT*/) /*: HttpSuccessResponseT*/{
  const result = JSON.parse(xhr.responseText);
  let response = {
    status: 'success',
    adid: result.adid,
    timestamp: result.timestamp,
    ask_in: result.ask_in,
    retry_in: result.retry_in,
    continue_in: result.continue_in,
    tracking_state: result.tracking_state,
    attribution: undefined,
    message: undefined
  };
  if (isRequest(url, 'attribution')) {
    response.attribution = result.attribution;
    response.message = result.message;
  }
  return entries(response).filter(([, value]) => !!value).reduce(reducer, {});
}

/**
 * Get an error object which is about to be passed to resolve or reject method
 *
 * @param {Object} xhr
 * @param {string} code
 * @param {boolean=} proceed
 * @returns {Object}
 * @private
 */
function _getErrorResponse(xhr /*: XMLHttpRequest*/, code /*: ErrorCodeT*/, proceed /*: boolean*/ = false) /*: HttpErrorResponseT*/{
  const result = isValidJson(xhr.responseText) ? JSON.parse(xhr.responseText) : null;
  return {
    status: 'error',
    code,
    action: proceed ? 'CONTINUE' : 'RETRY',
    response: result || xhr.responseText,
    message: HTTP_ERRORS[code],
    adid: result?.adid,
    ask_in: result?.ask_in
  };
}

/**
 * Encode parameter depending on the type
 *
 * @param {string} key
 * @param {*} value
 * @returns {string}
 * @private
 */
function _encodeParam([key, value] /*: [string, any]*/) /*: string*/{
  const encodedKey = encodeURIComponent(key);
  let encodedValue = value;
  if (typeof value === 'string') {
    encodedValue = encodeURIComponent(value);
  }
  if (isObject(value)) {
    encodedValue = encodeURIComponent(JSON.stringify(value) || '');
  }
  if (key === 'granular_third_party_sharing_options' || key === 'partner_sharing_settings') {
    return [encodedKey, encodedValue].join(encodeURIComponent('='));
  }
  return [encodedKey, encodedValue].join('=');
}

/**
 * Creates the log key with some spaces appended to it
 *
 * @param {string} header
 * @param {string} str
 * @returns {string}
 * @private
 */
function _logKey(header /*: string*/, str /*: string*/) /*: string*/{
  const indent = header.length - str.length - 1;
  const spaces = header.slice(0, indent > 0 ? indent : 0).split('').reduce(acc => acc.concat(' '), '');
  return `${str}${spaces}:`;
}

/**
 * Encode key-value pairs to be used in url
 *
 * @param {Object} params
 * @param {Object} defaultParams
 * @returns {string}
 * @private
 */
function _encodeParams(params /*: ParamsWithAttemptsT*/, defaultParams /*: DefaultParamsT*/) /*: string*/{
  const logParamsHeader = 'REQUEST PARAMETERS:';
  const toSnakeCase = key => key.replace(/([A-Z])/g, $1 => `_${$1.toLowerCase()}`);
  const allParams = [];
  entries({
    ...config.getBaseParams(),
    ...defaultParams,
    ...params
  }).forEach(([key, value]) => {
    if (key === 'storeInfo') {
      if (isObject(value)) {
        allParams.push(['store_name_from_client', value.storeName]);
        allParams.push(['store_app_id_from_client', value.storeAppId]);
      }
    } else {
      allParams.push([toSnakeCase(key), value]);
    }
  });
  logger.log(logParamsHeader);
  return allParams.filter(([, value]) => isEmptyEntry(value)).map(([key, value]) => {
    logger.log(_logKey(logParamsHeader, key), value);
    return _encodeParam([key, value]);
  }).join('&');
}

/**
 * Handle xhr response from server
 *
 * @param {Function} reject
 * @param {Function} resolve
 * @param {Object} xhr
 * @param {string} url
 * @private
 */
function _handleReadyStateChange(reject, resolve, {
  xhr,
  url
} /*: {xhr: XMLHttpRequest, url: UrlT}*/) {
  if (xhr.readyState !== 4) {
    return;
  }
  const okStatus = xhr.status >= 200 && xhr.status < 300;
  const validJson = isValidJson(xhr.responseText);
  if (xhr.status === 0) {
    reject(_getErrorResponse(xhr, 'NO_CONNECTION'));
  } else {
    if (validJson) {
      return okStatus ? resolve(_getSuccessResponse(xhr, url)) : resolve(_getErrorResponse(xhr, 'SERVER_CANNOT_PROCESS', true));
    } else {
      return okStatus ? reject(_getErrorResponse(xhr, 'SERVER_MALFORMED_RESPONSE')) : reject(_getErrorResponse(xhr, 'SERVER_INTERNAL_ERROR'));
    }
  }
}

/**
 * Prepare url and params depending on the resource type
 *
 * @param {string} url
 * @param {string} method
 * @param {Object} params
 * @param {Object} defaultParams
 * @returns {{encodedParams: string, fullUrl: string}}
 * @private
 */
function _prepareUrlAndParams({
  endpoint,
  url,
  method,
  params
} /*: HttpRequestParamsT*/, defaultParams /*: DefaultParamsT*/) /*: {fullUrl: string, encodedParams: string}*/{
  const encodedParams = _encodeParams(params, defaultParams);
  return {
    fullUrl: endpoint + url + (method === 'GET' ? `?${encodedParams}` : ''),
    encodedParams
  };
}

/**
 * Set headers for the xhr object
 *
 * @param {XMLHttpRequest} xhr
 * @param {string} method
 * @private
 */
function _prepareHeaders(xhr /*: XMLHttpRequest*/, method /*: HttpRequestParamsT['method']*/) /*: void*/{
  const logHeader = 'REQUEST HEADERS:';
  const headers = [['Client-SDK', `js${globals.version}`], ['Content-Type', method === 'POST' ? 'application/x-www-form-urlencoded' : 'application/json']];
  logger.log(logHeader);
  headers.forEach(([key, value]) => {
    xhr.setRequestHeader(key, value);
    logger.log(_logKey(logHeader, key), value);
  });
}

/**
 * Build xhr to perform all kind of api requests
 *
 * @param {string} url
 * @param {string} [method='GET']
 * @param {Object} [params={}]
 * @param {Object} defaultParams
 * @returns {Promise}
 */
function _buildXhr({
  endpoint,
  url,
  method = 'GET',
  params = {}
} /*: HttpRequestParamsT*/, defaultParams /*: DefaultParamsT*/) /*: Promise<HttpSuccessResponseT | HttpErrorResponseT>*/{
  const {
    fullUrl,
    encodedParams
  } = _prepareUrlAndParams({
    endpoint,
    url,
    method,
    params
  }, defaultParams);
  return new Promise((resolve, reject) => {
    let xhr = new XMLHttpRequest();
    xhr.open(method, fullUrl, true);
    _prepareHeaders(xhr, method);
    xhr.onreadystatechange = () => _handleReadyStateChange(reject, resolve, {
      xhr,
      url
    });
    xhr.onerror = () => reject(_getErrorResponse(xhr, 'TRANSACTION_ERROR'));
    xhr.send(method === 'GET' ? undefined : encodedParams);
  });
}

/**
 * Intercept response from backend
 *
 * @param {Object} result
 * @param {string} result.status
 * @param {string} url
 * @returns {Object}
 * @private
 */
function _interceptResponse(result /*: HttpSuccessResponseT | HttpErrorResponseT*/, url /*: UrlT*/) /*: HttpSuccessResponseT | HttpErrorResponseT*/{
  const isGdprRequest = isRequest(url, 'gdpr_forget_device');
  const isAttributionRequest = isRequest(url, 'attribution');
  const isSessionRequest = isRequest(url, 'session');
  const optedOut = result.tracking_state === 'opted_out';
  if (result.status === 'success') {
    if (!isGdprRequest && optedOut) {
      publish('sdk:gdpr-forget-me');
      return result;
    }
  }
  if (!isAttributionRequest && !isGdprRequest && !optedOut && result.ask_in) {
    publish('attribution:check', result);
  }
  if (isSessionRequest) {
    publish('session:finished', result);
  }
  return result;
}

/**
 * Http request factory to perform all kind of api requests
 *
 * @param {Object} options
 * @returns {Promise}
 */
function http(options /*: HttpRequestParamsT*/) /*: Promise<HttpSuccessResponseT | HttpErrorResponseT>*/{
  return defaultParams().then(defaultParams => _buildXhr(options, defaultParams)).then(result => _interceptResponse(result, options.url));
}
;// ./src/sdk/backoff.js
/*:: // 
import { type BackOffStrategyT } from './types';*/


/**
 * Options for the back-off strategy for different environments
 *
 * @type {Object}
 */
const _options = {
  long: {
    delay: 2 * (/* inlined export .MINUTE */60000),
    maxDelay: DAY,
    minRange: 0.5,
    maxRange: 1.0
  },
  short: {
    delay: 200,
    maxDelay: HOUR,
    minRange: 0.5,
    maxRange: 1.0
  },
  test: {
    delay: 100,
    maxDelay: 300
  }
};

/**
 * Get random number in provided range
 *
 * @param {number} min
 * @param {number} max
 * @returns {number}
 * @private
 */
function _randomInRange(min, max) {
  return Math.random() * (max - min) + min;
}

/**
 * Calculate exponential back-off with optional jitter factor applied
 *
 * @param {number} attempts
 * @param {string} strategy
 * @returns {number}
 */
function backOff(attempts /*: number*/, strategy /*: ?BackOffStrategyT*/) /*: number*/{
  strategy = strategy || 'long';
  const options =  false ? 0 : _options[strategy];
  let delay = options.delay * Math.pow(2, attempts - 1);
  delay = Math.min(delay, options.maxDelay);
  if (options.minRange && options.maxRange) {
    delay = delay * _randomInRange(options.minRange, options.maxRange);
  }
  return Math.round(delay);
}
;// ./src/sdk/listeners.js
/*:: // 
import { type DocumentT } from './types';*/

/*:: type EventCbT = (e: Event) => void*/
/*:: type PageVisibilityHiddenAttr = 'hidden' | 'mozHidden' | 'msHidden' | 'oHidden' | 'webkitHidden'*/
/*:: type PageVisibilityEventName = 'visibilitychange' | 'mozvisibilitychange' | 'msvisibilitychange' | 'ovisibilitychange' | 'webkitvisibilitychange'*/
/*:: type PageVisibilityApiMap = {|
  hidden: PageVisibilityHiddenAttr,
  visibilityChange: PageVisibilityEventName
|}*/
let _connected /*: boolean*/ = navigator.onLine;

/**
 * Bind to online and offline events
 */
function register() /*: void*/{
  on(window, 'online', _handleOnline);
  on(window, 'offline', _handleOffline);
}

/**
 * Handle online event, set connected flag to true
 *
 * @private
 */
function _handleOnline() /*: void*/{
  _connected = true;
}

/**
 * Handle offline event, set connected flag to false
 * @private
 */
function _handleOffline() /*: void*/{
  _connected = false;
}

/**
 * Bind event to an element
 *
 * @param {Window|Document} element
 * @param {string} eventName
 * @param {Function} func
 */
function on(element /*: Document | any*/, eventName /*: string*/, func /*: EventCbT*/) /*: void*/{
  if (element.addEventListener) {
    element.addEventListener(eventName, func, false);
  }
}

/**
 * Unbind event off an element
 *
 * @param {Window|Document} element
 * @param {string} eventName
 * @param {Function} func
 */
function off(element /*: Document | any*/, eventName /*: string*/, func /*: EventCbT*/) /*: void*/{
  if (element.removeEventListener) {
    element.removeEventListener(eventName, func, false);
  }
}

/**
 * Get Page Visibility API attributes that can be accessed depending on the browser implementation
 *
 * @returns {{hidden: string, visibilityChange: string}|null}
 * @private
 */
function getVisibilityApiAccess() /*: ?PageVisibilityApiMap*/{
  const documentExt = (document /*: DocumentT*/);
  if (typeof documentExt.hidden !== 'undefined') {
    return {
      hidden: 'hidden',
      visibilityChange: 'visibilitychange'
    };
  }
  const accessMap /*: {[key: PageVisibilityHiddenAttr]: PageVisibilityEventName}*/ = {
    mozHidden: 'mozvisibilitychange',
    msHidden: 'msvisibilitychange',
    oHidden: 'ovisibilitychange',
    webkitHidden: 'webkitvisibilitychange'
  };
  const accessMapEntries = entries(accessMap);
  for (let i = 0; i < accessMapEntries.length; i += 1) {
    const [hidden, visibilityChange] = accessMapEntries[i];
    if (typeof documentExt[hidden] !== 'undefined') {
      return {
        hidden,
        visibilityChange
      };
    }
  }
  return null;
}

/**
 * Check if connected to internet
 *
 * @returns {boolean}
 */
function isConnected() /*: boolean*/{
  return _connected;
}

/**
 * Unbind from online and offline events
 */
function listeners_destroy() /*: void*/{
  off(window, 'online', _handleOnline);
  off(window, 'offline', _handleOffline);
}

;// ./src/sdk/url-strategy.ts



/*:: export interface UrlStrategyConfig {
  /** The country or countries of data residence, or the endpoints to which you want to send SDK traffic. *-/
  domains: Array<string>;

  /** Whether the source should prefix a subdomain. *-/
  useSubdomains: boolean;

  /** Whether the domain should be used for data residency. *-/
  isDataResidency?: boolean;
}*/
function getDefaultUrlStrategyConfig(endpoints /*: Record<Endpoints, string>*/) {
  return {
    domains: [endpoints.default, endpoints.world],
    useSubdomains: true,
    isDataResidency: false
  };
}
var UrlStrategy = /*#__PURE__*/function (UrlStrategy) {
  UrlStrategy["Default"] = "default";
  UrlStrategy["India"] = "india";
  UrlStrategy["China"] = "china";
  return UrlStrategy;
}(UrlStrategy || {});
var DataResidency = /*#__PURE__*/(/* unused pure expression or super */ null && (function (DataResidency) {
  DataResidency["EU"] = "EU";
  DataResidency["TR"] = "TR";
  DataResidency["US"] = "US";
  return DataResidency;
}(DataResidency || {})));
function incorrectOptionIgnoredMessage(higherPriority /*: string*/, lowerPriority /*: string*/) {
  logger.warn(`Both ${higherPriority} and ${lowerPriority} are set in config, ${lowerPriority} will be ignored`);
}

/**
 * In case if deprecated parameters or no urlStrategy provided returns the most appropriate UrlStrategyConfig,
 * and `null` otherwise
 */
function transfromDeprecatedParamsToUrlStrategyConfig(endpoints /*: Record<Endpoints, string>*/) /*: UrlStrategyConfig | null*/{
  const {
    customUrl,
    urlStrategy,
    dataResidency
  } = config.getCustomConfig();
  if (customUrl) {
    // If custom URL is set then send all requests there
    logger.warn('customUrl is deprecated, use urlStrategy instead');
    if (dataResidency || urlStrategy) {
      incorrectOptionIgnoredMessage('customUrl', dataResidency ? 'dataResidency' : 'urlStrategy');
    }
    return {
      domains: [customUrl],
      useSubdomains: false,
      isDataResidency: false
    };
  }
  if (dataResidency && urlStrategy) {
    incorrectOptionIgnoredMessage('dataResidency', 'urlStrategy');
  }
  if (dataResidency) {
    logger.warn('dataResidency is deprecated, use urlStrategy instead');
    return {
      domains: [endpoints[dataResidency]],
      useSubdomains: true,
      isDataResidency: true
    };
  }
  if (typeof urlStrategy === 'string') {
    logger.warn('urlStrategy string literals (\'china\' and \'india\') are deprected, use UrlStartegyConfig instead');
    if (urlStrategy === UrlStrategy.India) {
      return {
        domains: [endpoints.india, endpoints.default],
        useSubdomains: true,
        isDataResidency: false
      };
    }
    if (urlStrategy === UrlStrategy.China) {
      return {
        domains: [endpoints.china, endpoints.default],
        useSubdomains: true,
        isDataResidency: false
      };
    }
  }
  if (!urlStrategy) {
    return getDefaultUrlStrategyConfig(endpoints);
  }
  return null;
}

/**
 * Checks if passed UrlStrategyConfig is valid and returns it, returns `DEFAULT_URL_STRATEGY_CONFIG` otherwise
 */
function validateUrlStrategyConfig(endpoints /*: Record<Endpoints, string>*/) /*: UrlStrategyConfig*/{
  const {
    urlStrategy
  } = config.getCustomConfig();
  if (urlStrategy && typeof urlStrategy === 'object') {
    const config = urlStrategy;
    if (!config.domains || !Array.isArray(config.domains) || config.domains.length < 1) {
      logger.warn('Invalid urlStartegy: `domains` should be a non-empty array');
      return getDefaultUrlStrategyConfig(endpoints);
    }
    return {
      domains: config.domains,
      useSubdomains: !!config.useSubdomains,
      isDataResidency: !!config.isDataResidency
    };
  }
  return getDefaultUrlStrategyConfig(endpoints);
}
function getUrlStrategyConfig(endpoints /*: Record<Endpoints, string>*/) /*: UrlStrategyConfig*/{
  return transfromDeprecatedParamsToUrlStrategyConfig(endpoints) || validateUrlStrategyConfig(endpoints);
}
function getPreferredUrls(endpoints /*: Record<Endpoints, string>*/) /*: BaseUrlsMap[]*/{
  const urlStrategyConfig /*: UrlStrategyConfig*/ = getUrlStrategyConfig(endpoints);
  const urls = [];

  //if (urlStrategyConfig.isDataResidency) { }

  for (const domain of urlStrategyConfig.domains) {
    const map = urlStrategyConfig.useSubdomains ? {
      app: `${BASE_URL_PREFIX}${domain}`,
      gdpr: `${GDPR_URL_PREFIX}${domain}`
    } : {
      app: `${BASE_URL_NO_SUB_DOMAIN_PREFIX}${domain}`,
      gdpr: `${BASE_URL_NO_SUB_DOMAIN_PREFIX}${domain}`
    };
    urls.push(map);
  }
  return urls;
}
function getBaseUrlsIterator(endpoints /*: Record<Endpoints, string>*/ = ENDPOINTS) /*: BaseUrlsIterator*/{
  const _urls = getPreferredUrls(endpoints);
  let _counter = 0;
  return {
    next: () => {
      if (_counter < _urls.length) {
        return {
          value: _urls[_counter++],
          done: false
        };
      } else {
        return {
          value: undefined,
          done: true
        };
      }
    },
    reset: () => {
      _counter = 0;
    }
  };
}

;// ./src/sdk/request.js
/*:: // 
import { type HttpSuccessResponseT, type HttpErrorResponseT, type HttpContinueCbT, type BackOffStrategyT, type WaitT, type UrlT, type MethodT, type RequestParamsT, type HttpRequestParamsT } from './types';*/








/*:: import { type BaseUrlsIterator, type BaseUrlsMap } from './url-strategy';*/
/*:: type RequestConfigT = {|
  url?: UrlT,
  method?: MethodT,
  params?: RequestParamsT,
  continueCb?: HttpContinueCbT,
  strategy?: BackOffStrategyT,
  wait?: ?WaitT
|}*/
/*:: type DefaultConfigT = {|
  url?: UrlT,
  method: MethodT,
  params?: RequestParamsT,
  continueCb?: HttpContinueCbT
|}*/
/*:: type AttemptsT = number*/
/*:: type StartAtT = number*/
const DEFAULT_ATTEMPTS /*: AttemptsT*/ = 0;
const DEFAULT_WAIT /*: WaitT*/ = 150;
const MAX_WAIT /*: WaitT*/ = 0x7FFFFFFF; // 2^31 - 1
const NO_CONNECTION_WAIT = 60 * (/* inlined export .SECOND */1000);
const Request = ({
  url,
  method = 'GET',
  params = {},
  continueCb,
  strategy,
  wait
} /*: RequestConfigT*/ = {}) => {
  /**
   * Global param values set on request instantiation and later used for restore
   *
   * @type {{url: string, method: string, params: Object, continueCb: Function}}
   * @private
   */
  let _default /*: DefaultConfigT*/ = {
    url,
    method,
    params,
    continueCb
  };

  /**
   * Url param per instance or per request
   *
   * @type {string}
   * @private
   */
  let _url /*: ?UrlT*/ = url;

  /**
   * Method param per instance or per request, defaults to `GET`
   *
   * @type {string}
   * @private
   */
  let _method /*: MethodT*/ = method;

  /**
   * Request params per instance or per request
   *
   * @type {Object}
   * @private
   */
  let _params /*: RequestParamsT*/ = {
    ...params
  };

  /**
   * Optional continue callback per instance or per request
   *
   * @type {Function}
   * @private
   */
  let _continueCb /*: ?HttpContinueCbT*/ = continueCb;

  /**
   * Back-off strategy
   *
   * @type {string|null}
   * @private
   */
  const _strategy /*: ?BackOffStrategyT*/ = strategy;

  /**
   * Url Startegy iterator to go through endpoints to retry to send request
   */
  let _baseUrlsIterator /*: BaseUrlsIterator*/;

  /**
   * Current base urls map to send request
   */
  let _baseUrlsIteratorCurrent /*: { value: BaseUrlsMap, done: boolean }*/;

  /**
   * Reset iterator state and get the first endpoint to use it in the next try
   */
  const _resetBaseUrlsIterator = () => {
    _baseUrlsIterator.reset();
    _baseUrlsIteratorCurrent = _baseUrlsIterator.next();
  };

  /**
   * Returns base url depending on request path
   */
  const _getBaseUrl = (urlsMap /*: BaseUrlsMap*/, url /*: UrlT*/) => /*: string*/{
    const base = url === '/gdpr_forget_device' ? 'gdpr' : 'app';
    return urlsMap[base];
  };

  /**
   * Timeout id to be used for clearing
   *
   * @type {number|null}
   * @private
   */
  let _timeoutId /*: ?number*/ = null;

  /**
   * Number of request and connection attempts
   *
   * @type {{request: number, connection: number}}
   * @private
   */
  const _attempts
  /*: {
      request: AttemptsT,
      connection: AttemptsT
    }*/
  = {
    request: DEFAULT_ATTEMPTS,
    connection: DEFAULT_ATTEMPTS
  };

  /**
   * Waiting time for the request to be sent
   *
   * @type {number}
   * @private
   */
  let _wait /*: WaitT*/ = _prepareWait(wait);

  /**
   * Timestamp when the request has been scheduled
   *
   * @type {Date|null}
   * @private
   */
  let _startAt /*: ?StartAtT*/ = null;

  /**
   * Ensure that wait is not more than maximum 32int so it does not cause overflow in setTimeout
   *
   * @param {number} wait
   * @returns {number}
   * @private
   */
  function _prepareWait(wait /*: ?WaitT*/) /*: WaitT*/{
    wait = wait || DEFAULT_WAIT;
    return wait > MAX_WAIT ? MAX_WAIT : wait;
  }

  /**
   * Override current parameters if available
   *
   * @param {string=} url
   * @param {string=} method
   * @param {Object=} params
   * @param {Function=} continueCb
   * @private
   */
  function _prepareParams({
    url,
    method,
    params,
    continueCb
  } /*: RequestConfigT*/) /*: void*/{
    if (url) {
      _url = url;
    }
    if (method) {
      _method = method;
    }
    if (!isEmpty(params)) {
      _params = {
        ...params
      };
    }
    _params = {
      createdAt: getTimestamp(),
      ..._params
    };
    if (typeof continueCb === 'function') {
      _continueCb = continueCb;
    }
  }

  /**
   * Clear previous attempt if new one is about to happen faster
   *
   * @param {number} wait
   * @returns {boolean}
   * @private
   */
  function _skip(wait /*: ?WaitT*/) /*: boolean*/{
    if (!_startAt) {
      return false;
    }
    if (_timeoutId) {
      const remainingTime = _wait - (Date.now() - _startAt);
      if (wait && remainingTime < wait) {
        return true;
      }
      clear();
    }
    return false;
  }

  /**
   * Prepare request to be sent away
   *
   * @param {number=} wait
   * @param {boolean=false} retrying
   * @returns {Promise}
   * @private
   */
  function _prepareRequest({
    wait,
    retrying
  } /*: {wait?: ?WaitT, retrying?: boolean}*/) /*: Promise<HttpSuccessResponseT | HttpErrorResponseT>*/{
    if (!_baseUrlsIterator) {
      _baseUrlsIterator = getBaseUrlsIterator();
      _baseUrlsIteratorCurrent = _baseUrlsIterator.next();
    }
    _wait = wait ? _prepareWait(wait) : _wait;
    if (_skip(wait)) {
      return Promise.resolve({
        status: 'error',
        action: 'CONTINUE',
        response: '',
        message: HTTP_ERRORS['SKIP'],
        code: 'SKIP'
      });
    }
    if (!_url) {
      logger.error('You must define url for the request to be sent');
      return Promise.reject({
        status: 'error',
        action: 'CONTINUE',
        response: '',
        message: HTTP_ERRORS['MISSING_URL'],
        code: 'MISSING_URL'
      });
    }
    logger.log(`${retrying ? 'Re-trying' : 'Trying'} request ${_url} in ${_wait}ms`);
    _startAt = Date.now();
    return _preRequest({
      endpoint: _getBaseUrl(_baseUrlsIteratorCurrent.value, _url),
      url: _url,
      method: _method,
      params: {
        attempts: 1,
        ..._params
      }
    });
  }

  /**
   * Check if there is internet connect and if not then setup the timeout
   *
   * @param {Object} options
   * @returns {Promise}
   * @private
   */
  function _preRequest(options /*: HttpRequestParamsT*/) /*: Promise<HttpSuccessResponseT | HttpErrorResponseT>*/{
    _clearTimeout();
    if (isConnected()) {
      return _request(options);
    }
    _attempts.connection += 1;
    logger.log(`No internet connectivity, trying request ${options.url} in ${NO_CONNECTION_WAIT}ms`);
    return new Promise(resolve => {
      _timeoutId = setTimeout(() => {
        resolve(_preRequest(options));
      }, NO_CONNECTION_WAIT);
    });
  }

  /**
   * Do the timed-out request with retry mechanism
   *
   * @param {Object} options
   * @returns {Promise}
   * @private
   */
  function _request(options /*: HttpRequestParamsT*/) /*: Promise<HttpSuccessResponseT | HttpErrorResponseT>*/{
    return new Promise((resolve, reject) => {
      _timeoutId = setTimeout(() => {
        _startAt = null;
        const filteredParams = entries(options.params).filter(([, value]) => isEmptyEntry(value)).reduce(reducer, {});
        return http({
          endpoint: options.endpoint,
          url: options.url,
          method: options.method,
          params: {
            ...filteredParams,
            attempts: (_attempts.request ? _attempts.request + 1 : 1) + _attempts.connection
          }
        }).then(result => _continue(result, resolve)).catch(result => _error(result, resolve, reject));
      }, _wait);
    });
  }

  /**
   * Restore to global parameters
   *
   * @private
   */
  function _restore() /*: void*/{
    _url = _default.url;
    _method = _default.method;
    _params = {
      ..._default.params
    };
    _continueCb = _default.continueCb;
  }

  /**
   * Finish the request by restoring and clearing
   *
   * @param {boolean=false} failed
   * @private
   */
  function _finish(failed /*: boolean*/) /*: void*/{
    logger.log(`Request ${_url || 'unknown'} ${failed ? 'failed' : 'has been finished'}`);
    _attempts.request = DEFAULT_ATTEMPTS;
    _attempts.connection = DEFAULT_ATTEMPTS;
    _wait = DEFAULT_WAIT;
    _restore();
    clear();
  }

  /**
   * Retry request with optional new waiting period
   *
   * @param {number=} wait
   * @returns {Promise}
   * @private
   */
  function _retry(wait /*: WaitT*/) /*: Promise<HttpSuccessResponseT | HttpErrorResponseT>*/{
    _attempts.request += 1;
    clear();
    return _prepareRequest({
      wait: wait || backOff(_attempts.request, _strategy),
      retrying: true
    });
  }

  /**
   * Decide how to continue, either:
   * - retry if requested
   * - call custom success callback
   * - or finish the request by default
   *
   * @param {Object} result
   * @param {number} result.retry_in
   * @param {Function} resolve
   * @private
   */
  function _continue(result /*: HttpSuccessResponseT | HttpErrorResponseT*/, resolve) /*: void*/{
    if (result && result.retry_in) {
      resolve(_retry(result.retry_in));
      return;
    }
    _resetBaseUrlsIterator();
    if (typeof _continueCb === 'function') {
      _continueCb(result, _finish, _retry);
    } else {
      _finish();
    }
    resolve(result);
  }

  /**
   * Ensure to resolve on retry and finish request when unknown error
   *
   * @param {Object} result
   * @param {Function} resolve
   * @param {Function} reject
   * @private
   */
  function _error(result /*: HttpErrorResponseT*/, resolve, reject) /*: void*/{
    if (result && result.action === 'RETRY') {
      if (result.code === 'NO_CONNECTION') {
        const nextEndpoint = _baseUrlsIterator.next(); // get next endpoint

        if (!nextEndpoint.done) {
          // next endpoint exists
          _baseUrlsIteratorCurrent = nextEndpoint; // use the endpoint in the next try
          resolve(_retry(DEFAULT_WAIT));
        } else {
          // no more endpoints, seems there is no connection at all
          _resetBaseUrlsIterator();
          resolve(_retry(NO_CONNECTION_WAIT));
        }
      } else {
        resolve(_retry());
      }
      return;
    }
    _finish(true);
    reject(result || {});
  }

  /**
   * Send the request after specified or default waiting period
   *
   * @param {string=} url
   * @param {string=} method
   * @param {Object=} params
   * @param {Function=} continueCb
   * @param {number=} wait
   * @returns {Promise}
   */
  function send({
    url,
    method,
    params = {},
    continueCb,
    wait
  } /*: RequestConfigT*/ = {}) /*: Promise<HttpSuccessResponseT | HttpErrorResponseT>*/{
    _prepareParams({
      url,
      method,
      params,
      continueCb
    });
    return _prepareRequest({
      wait
    });
  }

  /**
   * Check if request is running
   *
   * @returns {boolean}
   */
  function isRunning() /*: boolean*/{
    return !!_timeoutId;
  }

  /**
   * Clear request/connection timeout
   *
   * @private
   */
  function _clearTimeout() /*: void*/{
    if (_timeoutId) {
      clearTimeout(_timeoutId);
    }
    _timeoutId = null;
  }

  /**
   * Clear the current request
   */
  function clear() /*: void*/{
    const stillRunning = !!_startAt;
    _clearTimeout();
    _startAt = null;
    if (stillRunning) {
      _wait = DEFAULT_WAIT;
      _attempts.request = DEFAULT_ATTEMPTS;
      _attempts.connection = DEFAULT_ATTEMPTS;
      logger.log(`Previous ${_url || 'unknown'} request attempt canceled`);
      _restore();
    }
  }
  return {
    send,
    isRunning,
    clear
  };
};
/* harmony default export */ const request = (Request);
;// ./src/sdk/disable.ts



/**
 * Get the disable action name depending on the reason
 *
 * @param {string} reason
 * @returns {string}
 * @private
 */
const _disableReason = (reason /*: ReasonT*/) => reason === DISABLE_REASONS.REASON_GDPR ? 'GDPR disable' : 'disable';

/**
 * Get log messages depending on the disable reason
 *
 * @param {string} reason
 * @returns {Object}
 * @private
 */
const _logMessages = (reason /*: ReasonT*/) => ({
  start: {
    inProgress: `Adjust SDK ${_disableReason(reason)} process has already started`,
    done: `Adjust SDK ${_disableReason(reason)} process is now started`
  },
  finish: {
    inProgress: `Adjust SDK ${_disableReason(reason)} process has already finished`,
    done: `Adjust SDK ${_disableReason(reason)} process is now finished`
  }
});

/**
 * Start or finish disable process
 *
 * @param {string} reason
 * @param {boolean} pending
 * @param {string} expectedAction
 * @returns {boolean}
 * @private
 */
function _disable({
  reason,
  pending
} /*: ReasonMapT*/, expectedAction /*: 'start' | 'finish'*/) /*: boolean*/{
  const {
    reason: savedReason,
    pending: savedPending
  } = getDisabled() || {};
  const action = expectedAction === 'start' && savedPending ? 'start' : 'finish';
  const shouldNotStart = expectedAction === 'start' && savedReason;
  const shouldNotFinish = expectedAction === 'finish' && savedReason && !savedPending;
  if (shouldNotStart || shouldNotFinish) {
    logger.log(_logMessages(savedReason)[action].inProgress);
    return false;
  }
  logger.log(_logMessages(reason)[action].done);
  setDisabled({
    reason: reason || DISABLE_REASONS.REASON_GENERAL,
    pending
  });
  return true;
}

/**
 * Disable sdk due to a particular reason
 *
 * @param {string} reason
 * @param {boolean} pending
 * @private
 */
function disable(reason /*: ReasonT*/, pending = false) /*: boolean*/{
  return _disable({
    reason,
    pending
  }, 'start');
}

/**
 * Finish disable process if previously set to pending state
 *
 * @param {string} reason
 * @returns {boolean}
 */
function finish(reason /*: ReasonT*/) /*: boolean*/{
  return _disable({
    reason,
    pending: false
  }, 'finish');
}

/**
 * Enable sdk if not GDPR forgotten
 */
function restore() /*: boolean*/{
  const {
    reason
  } = getDisabled() || {};
  if (reason === DISABLE_REASONS.REASON_GDPR) {
    logger.log('Adjust SDK is disabled due to GDPR-Forget-Me request and it can not be re-enabled');
    return false;
  }
  if (!reason) {
    logger.log('Adjust SDK is already enabled');
    return false;
  }
  logger.log('Adjust SDK has been enabled');
  setDisabled(null);
  return true;
}

/**
 * Get the current status of the sdk
 * - on: not disabled
 * - paused: partially disabled, waiting for the opt-out confirmation from the backend
 * - off: completely disabled
 *
 * @returns {string}
 */
function disable_status() /*: StatusT*/{
  const {
    reason,
    pending
  } = getDisabled() || {};
  if (reason === DISABLE_REASONS.REASON_GENERAL || reason === DISABLE_REASONS.REASON_GDPR && !pending) {
    return 'off';
  } else if (reason === DISABLE_REASONS.REASON_GDPR && pending) {
    return 'paused';
  }
  return 'on';
}

;// ./src/sdk/identity.ts








/** Name of the store used by activityState */
const identity_storeName = StoreName.ActivityState;

/** Boolean used in start in order to avoid duplicated activity state */
let _starting /*: boolean*/ = false;

/** Generate random  uuid v4 */
function _generateUuid() /*: string*/{
  let seed = Date.now();
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = (seed + Math.random() * 16) % 16 | 0;
    seed = Math.floor(seed / 16);
    return (c === 'x' ? r : r & (0x3 | 0x8)).toString(16);
  });
}

/** Inspect stored activity state and check if disable needs to be repeated */
function _intercept(stored /*: ActivityStateMapT*/) /*: InterceptT*/{
  if (!stored) {
    return {
      exists: false
    };
  }
  if (stored.uuid === 'unknown') {
    disable(DISABLE_REASONS.REASON_GDPR);
    activity_state.destroy();
    return {
      exists: true,
      stored: null
    };
  }
  activity_state.init(stored);
  return {
    exists: true,
    stored: stored
  };
}

/**
 * Cache stored activity state into running memory
 */
function start() /*: Promise<ActivityStateMapT>*/{
  if (_starting) {
    return Promise.reject({
      interrupted: true,
      message: 'Adjust SDK start already in progress'
    });
  }
  _starting = true;
  return storage.getFirst(identity_storeName).then(_intercept).then((result /*: InterceptT*/) => {
    if (result.exists) {
      _starting = false;
      return result.stored;
    }
    const activityState = isEmpty(activity_state.current) ? {
      uuid: _generateUuid()
    } : activity_state.current;
    return storage.addItem(identity_storeName, activityState).then(() => {
      activity_state.init(activityState);
      reload();
      _starting = false;
      return activityState;
    });
  }).then((activityState /*: ActivityStateMapT | null*/) => {
    if (activityState) {
      publish(PUB_SUB_EVENTS.WEB_UUID_CREATED, activityState.uuid);
    } else {
      publish(PUB_SUB_EVENTS.WEB_UUID_CREATED, 'gdpr_forgotten');
    }
    return activityState;
  });
}

/** Check if sdk is running at all (totally disabled or inactive activity state) */
function _isLive() {
  return disable_status() !== 'off' && activity_state.isStarted();
}

/**
 * Persist changes made directly in activity state and update lastActive flag
 */
function persist() /*: Promise<ActivityStateMapT>*/{
  if (!_isLive()) {
    return Promise.resolve(null);
  }
  const activityState = {
    ...activity_state.current,
    lastActive: Date.now()
  };
  return storage.updateItem(identity_storeName, activityState).then(() => activity_state.current = activityState);
}

/**
 * Sync in-memory activityState with the one from store
 * - should be used when change from another tab is possible and critical
 */
function sync() /*: Promise<ActivityStateMapT>*/{
  return storage.getFirst(identity_storeName).then((activityState /*: ActivityStateMapT*/) => {
    const current = activity_state.current;
    const lastActive = current.lastActive || 0;
    if (_isLive() && lastActive < activityState.lastActive) {
      // Checking if another SDK instance was installed while this one was in backgound
      const installedUpdated = !current.installed && activityState.installed;
      const sessionCountUpdated = (current.sessionCount || 0) < (activityState.sessionCount || 0);
      if (installedUpdated || sessionCountUpdated) {
        publish('sdk:installed');
      }
      activity_state.current = activityState;
      reload();
    }
    return activityState;
  });
}

/**
 * Clear activity state store - set uuid to be unknown
 */
function clear() /*: Promise<unknown>*/{
  const newActivityState = {
    uuid: 'unknown'
  };
  activity_state.current = newActivityState;
  return storage.clear(identity_storeName).then(() => storage.addItem(identity_storeName, newActivityState));
}

/**
 * Destroy current activity state
 */
function identity_destroy() /*: void*/{
  activity_state.destroy();
}

;// ./src/sdk/queue.js
/*:: // 
import { type HttpSuccessResponseT, type HttpErrorResponseT, type HttpFinishCbT, type WaitT, type UrlT, type MethodT, type RequestParamsT, type ActivityStateMapT } from './types';*/








/*:: type PendingT = {|
  timestamp: number,
  url: UrlT,
  method?: MethodT,
  createdAt?: number,
  params: RequestParamsT
|}*/
/**
 * Http request instance
 *
 * @type {Object}
 * @private
 */
const _request = request({
  strategy: 'long',
  continueCb: _continue
});

/**
 * Check if in offline mode
 *
 * @type {boolean}
 * @private
 */
let _isOffline = false;

/**
 * Name of the store used by queue
 *
 * @type {string}
 * @private
 */
const queue_storeName = 'queue';

/**
 * Current running state and task timestamp
 *
 * @type {{running: boolean, timestamp: void|number, pause: void|Object}}
 * @private
 */
const _current
/*: {|
  running: boolean,
  timestamp: ?number,
  pause: ?{|
    timestamp: number,
    wait: WaitT
  |}
|}*/
= {
  running: false,
  timestamp: null,
  pause: null
};

/**
 * Remove from the top and continue running pending requests
 *
 * @param {Object} result
 * @param {Function} finish
 * @returns {Promise}
 * @private
 */
function _continue(result /*: HttpSuccessResponseT | HttpErrorResponseT*/, finish /*: HttpFinishCbT*/) /*: Promise<HttpSuccessResponseT | HttpErrorResponseT>*/{
  const wait = result && result.continue_in || null;
  _current.pause = wait ? {
    timestamp: Date.now(),
    wait
  } : null;
  return storage.getFirst(queue_storeName).then(pending => pending ? storage.deleteItem(queue_storeName, pending.timestamp) : null).then(() => {
    const isError = result.status === 'error' || result.response?.error;
    finish(isError);
    _current.running = false;
    return run({
      wait
    });
  });
}

/**
 * Correct timestamp if equal or less then previous one to avoid constraint errors
 * Cases when needed:
 * - test environment
 * - when pushing to queue synchronously, one after an other
 *
 * @returns {number}
 * @private
 */
function _prepareTimestamp() /*: number*/{
  let timestamp = Date.now();
  if (_current.timestamp && timestamp <= _current.timestamp) {
    timestamp = _current.timestamp + 1;
  }
  _current.timestamp = timestamp;
  return timestamp;
}

/**
 * Persist activity state change with session offset reset after session request
 *
 * @param {string} url
 * @returns {Promise}
 * @private
 */
function _persist(url) /*: Promise<?ActivityStateMapT>*/{
  if (isRequest(url, 'session')) {
    activity_state.resetSessionOffset();
  }
  activity_state.updateLastActive();
  return persist();
}

/**
 * Push request to the queue
 *
 * @param {string} url
 * @param {string} method
 * @param {Object=} params
 * @param {boolean=} auto
 * @param {number=} timestamp
 * @returns {Promise}
 */
function push({
  url,
  method,
  params
} /*: {|url: UrlT, method: MethodT, params?: RequestParamsT|}*/, {
  auto,
  timestamp
} /*: {|auto?: boolean, timestamp?: number|}*/ = {}) {
  activity_state.updateParams(url, auto);
  const filteredParams = entries(params || {}).filter(([, value]) => isEmptyEntry(value)).reduce(reducer, {});
  const pending /*: PendingT*/ = {
    timestamp: _prepareTimestamp(),
    url,
    method,
    params: {
      ...activity_state.getParams(url),
      ...filteredParams
    }
  };
  if (timestamp) {
    pending.createdAt = timestamp;
  }
  return storage.addItem(queue_storeName, pending).then(() => _persist(url)).then(() => _current.running ? {} : run());
}

/**
 * Prepare to send pending request if available
 *
 * @param {number} timestamp
 * @param {number=} createdAt
 * @param {string=} url
 * @param {string=} method
 * @param {Object=} params
 * @param {number=} wait
 * @returns {Promise}
 * @private
 */
function _prepareToSend({
  timestamp,
  createdAt,
  url,
  method,
  params
} /*: PendingT*/ = {}, wait /*: ?WaitT*/) /*: Promise<mixed>*/{
  const activityState = activity_state.current || {};
  const firstSession = url === '/session' && !activityState.installed;
  const noPending = !url && !method && !params;
  if (_isOffline && !firstSession || noPending) {
    _current.running = false;
    return Promise.resolve({});
  }
  return _request.send({
    url,
    method,
    params: {
      ...params,
      createdAt: getTimestamp(createdAt || timestamp)
    },
    wait: wait || _checkWait()
  });
}

/**
 * Check if there is waiting period required
 *
 * @returns {void|number}
 * @private
 */
function _checkWait() /*: ?WaitT*/{
  const {
    timestamp,
    wait
  } = _current.pause || {};
  const rest = Date.now() - (timestamp || 0);
  return rest < wait ? wait - rest : null;
}

/**
 * Run all pending requests
 *
 * @param {boolean=false} cleanUp
 * @param {number=} wait
 * @returns {Promise}
 */
function run({
  cleanUp,
  wait
} /*: {cleanUp?: boolean, wait?: ?WaitT}*/ = {}) /*: Promise<mixed>*/{
  if (_current.running) {
    return Promise.resolve({});
  }
  _current.running = true;
  let chain = Promise.resolve({});
  if (cleanUp) {
    chain = chain.then(_cleanUp);
  }
  return chain.then(() => storage.getFirst(queue_storeName)).then(pending => _prepareToSend(pending, wait));
}

/**
 * Set offline mode to on or off
 * - if on then all requests are queued
 * - if off then run all pending requests
 *
 * @param {boolean} state
 */
function setOffline(state /*: boolean*/) /*: void*/{
  if (state === undefined) {
    logger.error('State not provided, true or false has to be defined');
    return;
  }
  if (state === _isOffline) {
    logger.error(`The app is already in ${state ? 'offline' : 'online'} mode`);
    return;
  }
  const wasOffline = _isOffline;
  _isOffline = state;
  if (!state && wasOffline) {
    run();
  }
  logger.info(`The app is now in ${state ? 'offline' : 'online'} mode`);
}

/**
 * Clean up stale pending requests
 *
 * @private
 * @returns {Promise}
 */
function _cleanUp() /*: Promise<mixed>*/{
  const upperBound = Date.now() - config.requestValidityWindow;
  return storage.deleteBulk(queue_storeName, upperBound, 'upperBound');
}

/**
 * Check if there is pending timeout to be flushed
 * i.e. if queue is running
 *
 * @returns {boolean}
 */
function isRunning() /*: boolean*/{
  return _current.running;
}

/**
 * Clear queue store
 */
function queue_clear() /*: void*/{
  return storage.clear(queue_storeName);
}

/**
 * Destroy queue by clearing current timeout
 */
function queue_destroy() /*: void*/{
  _request.clear();
  _current.running = false;
  _current.timestamp = null;
  _current.pause = null;
}

;// ./src/sdk/global-params.js
/*:: // 
import { type GlobalParamsT, type GlobalParamsMapT } from './types';*/



/*:: type TypeT = 'callback' | 'partner'*/
/*:: type KeysT = [string, TypeT]*/
/*:: type KeysArrayT = Array<KeysT>*/
/**
 * Name of the store used by global params
 *
 * @type {string}
 * @private
 */
const global_params_storeName = 'globalParams';

/**
 * Error message for type missing
 *
 * @type {Object}
 * @private
 */
const _error = {
  short: 'No type provided',
  long: 'Global parameter type not provided, `callback` or `partner` types are available'
};

/**
 * Omit type parameter from the collection
 *
 * @param {Array} params
 * @returns {Array}
 * @private
 */
function _omitType(params) /*: Array<GlobalParamsT>*/{
  return (params || []).map(({
    key,
    value
  }) => ({
    key,
    value
  }));
}

/**
 * Get callback and partner global parameters
 *
 * @returns {Promise}
 */
function get() /*: Promise<GlobalParamsMapT>*/{
  return Promise.all([storage.filterBy(global_params_storeName, 'callback'), storage.filterBy(global_params_storeName, 'partner')]).then(([callbackParams, partnerParams]) => {
    return {
      callbackParams: _omitType(callbackParams),
      partnerParams: _omitType(partnerParams)
    };
  });
}

/**
 * Add global parameters, either callback or partner params
 *
 * @param {Array} params
 * @param {string} type
 * @returns {Promise}
 */
function add(params /*: Array<GlobalParamsT>*/, type /*: TypeT*/) /*: void | Promise<KeysArrayT>*/{
  if (type === undefined) {
    logger.error(_error.long);
    return Promise.reject({
      message: _error.short
    });
  }
  /*:: type GlobalParamsWithTypeT = {|...GlobalParamsT, type: string|}*/
  const map /*: {[key: string]: string}*/ = convertToMap(params);
  const prepared /*: Array<GlobalParamsWithTypeT>*/ = Object.keys(map).map(key => ({
    key,
    value: map[key],
    type
  }));
  return Promise.all([storage.filterBy(global_params_storeName, type), storage.addBulk(global_params_storeName, prepared, true)]).then(([oldParams, newParams]) => {
    const intersecting = intersection(oldParams.map(param => param.key), newParams.map(param => param[0]));
    logger.log(`Following ${type} parameters have been saved: ${prepared.map(p => `${p.key}:${p.value}`).join(', ')}`);
    if (intersecting.length) {
      logger.log(`Keys: ${intersecting.join(', ')} already existed so their values have been updated`);
    }
    return newParams;
  });
}

/**
 * Remove global parameter by key and type
 *
 * @param {string} key
 * @param {string} type
 * @returns {Promise}
 */
function remove(key /*: string*/, type /*: TypeT*/) /*: void | Promise<KeysT>*/{
  if (type === undefined) {
    logger.error(_error.long);
    return Promise.reject({
      message: _error.short
    });
  }
  return storage.deleteItem(global_params_storeName, [key, type]).then(result => {
    logger.log(`${key} ${type} parameter has been deleted`);
    return result;
  });
}

/**
 * Remove all global parameters of certain type
 * @param {string} type
 * @returns {Promise}
 */
function removeAll(type /*: TypeT*/) /*: void | Promise<KeysArrayT>*/{
  if (type === undefined) {
    logger.error(_error.long);
    return Promise.reject({
      message: _error.short
    });
  }
  return storage.deleteBulk(global_params_storeName, type).then(result => {
    logger.log(`All ${type} parameters have been deleted`);
    return result;
  });
}

/**
 * Clear globalParams store
 */
function global_params_clear() /*: void*/{
  return storage.clear(global_params_storeName);
}

;// ./src/sdk/session.js
/*:: // 
import { type DocumentT, type HttpSuccessResponseT, type HttpErrorResponseT, type GlobalParamsMapT, type SessionRequestParamsT } from './types';*/














/**
 * Flag to mark if session watch is already on
 *
 * @type {boolean}
 * @private
 */
let _running = false;

/**
 * Reference to interval id to be used for clearing
 *
 * @type {number}
 * @private
 */
let _idInterval /*: ?number*/;

/**
 * Reference to timeout id to be used for clearing
 *
 * @type {number}
 * @private
 */
let _idTimeout /*: ?number*/;

/**
 * Browser-specific prefixes for accessing Page Visibility API
 *
 * @type {{hidden, visibilityChange}}
 * @private
 */
let _pva;

/**
 * Reference to the document casted to a plain object
 *
 * @type {Document}
 */
const documentExt = (document /*: DocumentT*/);

/**
 * Initiate session watch:
 * - bind to visibility change event to track window state (if out of focus or closed)
 * - initiate activity state params and visibility state
 * - check session initially
 * - set the timer to update last active timestamp
 *
 * @returns {Promise}
 */
function watch() /*: Promise<mixed>*/{
  _pva = getVisibilityApiAccess();
  if (_running) {
    return Promise.reject({
      interrupted: true,
      message: 'Session watch already initiated'
    });
  }
  _running = true;
  subscribe('session:finished', _handleSessionRequestFinish);
  if (_pva) {
    on(documentExt, _pva.visibilityChange, _handleVisibilityChange);
  }
  if (_pva && documentExt[_pva.hidden]) {
    logger.log('Session request attempt canceled because the tab is still hidden');
    return Promise.resolve({});
  }
  activity_state.initParams();
  return _checkSession();
}

/**
 * Check if session watch is running
 *
 * @returns {boolean}
 */
function session_isRunning() /*: boolean*/{
  return _running;
}

/**
 * Destroy session watch
 */
function session_destroy() /*: void*/{
  _running = false;
  activity_state.toBackground();
  _stopTimer();
  if (_pva) {
    clearTimeout(_idTimeout);
    off(documentExt, _pva.visibilityChange, _handleVisibilityChange);
    on(documentExt, _pva.visibilityChange, _restoreAfterAsyncEnable);
  }
}

/**
 * Handle transit to background:
 * - stop the timer
 * - update session params
 * - persist changes (store updated activity state)
 *
 * @returns {Promise}
 * @private
 */
function _handleBackground() /*: Promise<mixed>*/{
  _stopTimer();
  activity_state.updateSessionOffset();
  activity_state.toBackground();
  return persist();
}

/**
 * Handle transit to foreground:
 * - update session length
 * - check for the session and restart the timer
 *
 * @returns {Promise}
 * @private
 */
function _handleForeground() /*: Promise<mixed>*/{
  return sync().then(() => {
    activity_state.updateSessionLength();
    activity_state.toForeground();
  }).then(_checkSession);
}

/**
 * Handle visibility change and perform appropriate actions
 *
 * @private
 */
function _handleVisibilityChange() /*: void*/{
  clearTimeout(_idTimeout);
  const handler = _pva && documentExt[_pva.hidden] ? _handleBackground : _handleForeground;
  _idTimeout = setTimeout(handler, 0);
}
function _restoreAfterAsyncEnable() /*: void*/{
  if (!_pva || documentExt[_pva.hidden]) {
    return;
  }
  reload();
  if (!_running && disable_status() === 'on') {
    off(documentExt, _pva.visibilityChange, _restoreAfterAsyncEnable);
    main.__internal__.restartAfterAsyncEnable();
  }
}

/**
 * Handle session request finish; update installed state
 *
 * @param {string} e
 * @param {Object} result
 * @returns {Promise|void}
 * @private
 */
function _handleSessionRequestFinish(e /*: string*/, result /*: HttpSuccessResponseT | HttpErrorResponseT*/) /*: ?Promise<mixed>*/{
  const isTooFrequentSessionError = result?.response?.error?.includes('Ignoring too frequent session');
  if (result?.status === 'error') {
    logger.error('Session was not successful, error was returned from the server:', result?.response?.error || result?.response);
    if (!isTooFrequentSessionError) {
      // do not return in case of too frequent session error, because it means a fresh session for this device is tracked,
      // i.e. the device is known and we should update SDK installed status
      return;
    }
  }
  if (result?.adid) {
    activity_state.current = {
      ...activity_state.current,
      attribution: {
        ...activity_state.current.attribution,
        adid: result.adid
      }
    };
  }
  activity_state.updateInstalled();
  return persist().then(() => publish('sdk:installed'));
}

/**
 * Start the session timer, every N seconds:
 * - update session params
 * - persist changes (store updated activity state)
 *
 * @private
 */
function _startTimer() /*: void*/{
  _stopTimer();
  _idInterval = setInterval(() => {
    activity_state.updateSessionOffset();
    return persist();
  }, config.sessionTimerWindow);
}

/**
 * Stop the session timer
 *
 * @private
 */
function _stopTimer() /*: void*/{
  clearInterval(_idInterval);
}

/**
 * Prepare parameters for the session tracking
 *
 * @param {Array} callbackParams
 * @param {Array} partnerParams
 * @returns {Object}
 * @private
 */
function _prepareParams({
  callbackParams,
  partnerParams
} /*: GlobalParamsMapT*/) /*: SessionRequestParamsT*/{
  return {
    callbackParams: callbackParams.length ? convertToMap(callbackParams) : null,
    partnerParams: partnerParams.length ? convertToMap(partnerParams) : null
  };
}

/**
 * Track session by sending the request to the server
 *
 * @private
 */
function _trackSession() /*: Promise<mixed>*/{
  return get().then(globalParams => {
    push({
      url: '/session',
      method: 'POST',
      params: _prepareParams(globalParams)
    }, {
      auto: true
    });
  });
}

/**
 * Check if session needs to be tracked
 *
 * @private
 */
function _checkSession() /*: Promise<mixed>*/{
  _startTimer();
  const activityState = activity_state.current;
  const lastInterval = activityState.lastInterval;
  const isEnqueued = activityState.sessionCount > 0;
  const currentWindow = lastInterval * (/* inlined export .SECOND */1000);
  if (!isEnqueued || isEnqueued && currentWindow >= config.sessionWindow) {
    return _trackSession();
  }
  publish('attribution:check');
  return persist();
}

;// ./src/sdk/attribution.js
/*:: // 
import { type HttpSuccessResponseT, type HttpErrorResponseT, type HttpFinishCbT, type HttpRetryCbT, type AttributionStateT, type AttributionWhiteListT, type ActivityStateMapT, type AttributionMapT } from './types';*/








/**
 * Http request instance
 *
 * @type {Object}
 * @private
 */
const attribution_request = request({
  url: '/attribution',
  strategy: 'short',
  continueCb: attribution_continue
});

/**
 * List of valid attribution parameters
 *
 * @type {string[]}
 * @private
 */
const _whitelist /*: AttributionWhiteListT*/ = ['tracker_token', 'tracker_name', 'network', 'campaign', 'adgroup', 'creative', 'click_label', 'state'];

/**
 * Check if new attribution is the same as old one
 *
 * @param {string} adid
 * @param {Object=} attribution
 * @returns {boolean}
 * @private
 */
function _isSame({
  adid,
  attribution
} /*: HttpSuccessResponseT*/) /*: boolean*/{
  const oldAttribution = activity_state.current.attribution || {};
  const anyDifferent = attribution && _whitelist.some(k => oldAttribution[k] !== attribution[k]);
  return !anyDifferent && adid === oldAttribution.adid;
}

/**
 * Check if attribution result is valid
 *
 * @param {string} adid
 * @param {Object=} attribution
 * @returns {boolean}
 * @private
 */
function _isValid({
  adid = '',
  attribution = {}
} /*: HttpSuccessResponseT*/) /*: boolean*/{
  return !!adid && !!intersection(_whitelist, Object.keys(attribution)).length;
}

/**
 * Update attribution and initiate client's callback
 *
 * @param {Object} result
 * @private
 */
function _setAttribution(result /*: HttpSuccessResponseT*/) /*: Promise<AttributionStateT>*/{
  if (isEmpty(result) || !_isValid(result) || _isSame(result)) {
    return Promise.resolve({
      state: 'same'
    });
  }
  const attribution /*: AttributionMapT*/ = entries(result.attribution).filter(([key]) => _whitelist.indexOf(key) !== -1).reduce(reducer, {
    adid: result.adid
  });
  activity_state.current = {
    ...activity_state.current,
    attribution
  };
  return persist().then(() => {
    publish('attribution:change', attribution);
    publish(PUB_SUB_EVENTS.ATTRIBUTION_RECEIVED, attribution);
    logger.info('Attribution has been updated');
    return {
      state: 'changed'
    };
  });
}

/**
 * Store attribution or make another request if attribution not yet available
 *
 * @param {Object} result
 * @param {Function} finish
 * @param {Function} retry
 * @returns {Promise}
 * @private
 */
function attribution_continue(result /*: HttpSuccessResponseT | HttpErrorResponseT*/, finish /*: HttpFinishCbT*/, retry /*: HttpRetryCbT*/) /*: Promise<HttpSuccessResponseT | HttpErrorResponseT | AttributionStateT>*/{
  if (!result || result && result.status === 'error') {
    finish();
    return Promise.resolve({
      state: 'unknown'
    });
  }
  if (!result.ask_in) {
    finish();
    return _setAttribution(result);
  }
  return retry(result.ask_in);
}

/**
 * Request attribution if session asked for it
 *
 * @param {Object=} sessionResult
 * @param {number=} sessionResult.ask_in
 */
function check(sessionResult /*: HttpSuccessResponseT*/) /*: Promise<?ActivityStateMapT>*/{
  const activityState = activity_state.current;
  const askIn = (sessionResult || {}).ask_in;
  if (!askIn && (activityState.attribution || !activityState.installed)) {
    return Promise.resolve(activityState);
  }
  attribution_request.send({
    params: {
      initiatedBy: !sessionResult ? 'sdk' : 'backend',
      ...activity_state.getParams()
    },
    wait: askIn
  });
  activity_state.updateSessionOffset();
  return persist();
}

/**
 * Destroy attribution by clearing running request
 */
function attribution_destroy() /*: void*/{
  attribution_request.clear();
}

;// ./src/sdk/gdpr-forget-device.ts








/**
 * Http request instance
 *
 * @type {Object}
 * @private
 */
const gdpr_forget_device_request = request({
  url: '/gdpr_forget_device',
  method: 'POST',
  strategy: 'short'
});

/**
 * Log messages used in different scenarios
 *
 * @type {Object}
 * @private
 */
const gdpr_forget_device_logMessages = {
  running: 'Adjust SDK is running pending GDPR Forget Me request',
  pending: 'Adjust SDK will run GDPR Forget Me request after initialisation',
  paused: 'Adjust SDK is already prepared to send GDPR Forget Me request',
  off: 'Adjust SDK is already disabled'
};

/**
 * Request GDPR-Forget-Me in order to disable sdk
 *
 * @param {boolean} force
 * @returns {boolean}
 */
function forget(force /*: boolean*/) /*: boolean*/{
  const sdkStatus = disable_status();
  if (!force && sdkStatus !== 'on') {
    logger.log(gdpr_forget_device_logMessages[sdkStatus]);
    return false;
  }
  if (!config.isInitialised()) {
    logger.log(gdpr_forget_device_logMessages.pending);
    return true;
  }
  gdpr_forget_device_request.send({
    params: {
      ...activity_state.getParams()
    }
  }).then(() => {
    publish('sdk:gdpr-forget-me');
  });
  return true;
}

/**
 * Start disable of the sdk due to GDPR-Forget-me request
 *
 * @returns {boolean}
 */
function gdpr_forget_device_disable() {
  return disable(DISABLE_REASONS.REASON_GDPR, true);
}

/**
 * Finish disable of the sdk due to GDRP-Forget-me request
 *
 * @returns {boolean}
 */
function gdpr_forget_device_finish() {
  return finish(DISABLE_REASONS.REASON_GDPR);
}

/**
 * Check if there is pending GDPR-Forget-Me request
 */
function gdpr_forget_device_check() /*: void*/{
  if (disable_status() === 'paused') {
    logger.log(gdpr_forget_device_logMessages.running);
    forget(true);
  }
}

/**
 * Destroy by clearing running request
 */
function gdpr_forget_device_destroy() /*: void*/{
  gdpr_forget_device_request.clear();
}

;// ./src/sdk/track-third-party-sharing.ts


/*:: export interface ThirdPartySharingOptions {
  isEnabled: boolean;
  granularOptions: Record<string, Record<string, string>>;
  partnerSharingSettings: Record<string, Record<string, boolean>>;
}*/
class ThirdPartySharing /*:: implements ThirdPartySharingOptions*/{
  _granularOptions = {};
  _partnerSharingSettings = {};
  constructor(isEnabled /*: boolean*/) {
    if (typeof isEnabled !== 'boolean') {
      logger.warn(`isEnabled should be boolean, converting ${isEnabled} results ${!!isEnabled}`);
    }
    this._isEnabled = !!isEnabled;
  }
  get isEnabled() /*: boolean*/{
    return this._isEnabled;
  }
  get granularOptions() /*: Record<string, Record<string, string>>*/{
    return this._granularOptions;
  }
  get partnerSharingSettings() /*: Record<string, Record<string, boolean>>*/{
    return this._partnerSharingSettings;
  }
  addGranularOption(partnerName /*: string*/, key /*: string*/, value /*: string*/) {
    if (!partnerName || !key || value === undefined) {
      logger.error('Cannot add granular option, partnerName, key and value are mandatory');
      return;
    }
    const pair = {
      [key]: value
    };
    if (this.granularOptions[partnerName]) {
      this.granularOptions[partnerName] = {
        ...this.granularOptions[partnerName],
        ...pair
      };
    } else {
      this.granularOptions[partnerName] = pair;
    }
  }
  addPartnerSharingSetting(partnerName /*: string*/, key /*: string*/, value /*: boolean*/) {
    if (!partnerName || !key || value === undefined) {
      logger.error('Cannot add partner sharing setting, partnerName, key and value are mandatory');
      return;
    }
    const pair = {
      [key]: value
    };
    if (this.partnerSharingSettings[partnerName]) {
      this.partnerSharingSettings[partnerName] = {
        ...this.partnerSharingSettings[partnerName],
        ...pair
      };
    } else {
      this.partnerSharingSettings[partnerName] = pair;
    }
  }
}
function trackThirdPartySharing(adjustThirdPartySharing /*: ThirdPartySharingOptions*/) {
  if (!adjustThirdPartySharing || adjustThirdPartySharing.isEnabled === undefined) {
    logger.error('Can not track third-party sharing without parameters');
    return;
  }
  const params = {
    sharing: adjustThirdPartySharing.isEnabled ? 'enable' : 'disable',
    granularThirdPartySharingOptions: adjustThirdPartySharing.granularOptions,
    partnerSharingSettings: adjustThirdPartySharing.partnerSharingSettings
  };
  push({
    url: '/third_party_sharing',
    method: 'POST',
    params
  });
}
;// ./src/sdk/scheduler.js

/*:: type TaskT = {|
  method: (timestamp?: number) => mixed,
  description: string,
  timestamp: number
|}*/
/**
 * Delayed tasks list
 *
 * @type {Array}
 * @private
 */
let _tasks /*: Array<TaskT>*/ = [];

/**
 * Put the dask in the delayed list
 *
 * @param {Function} method
 * @param {string} description
 */
function delay(method /*: TaskT['method']*/, description /*: TaskT['description']*/) /*: void*/{
  _tasks.push({
    method,
    description,
    timestamp: Date.now()
  });
}

/**
 * Flush all delayed tasks
 */
function flush() /*: void*/{
  _tasks.forEach((task /*: TaskT*/) => {
    if (typeof task.method === 'function') {
      logger.log(`Delayed ${task.description} task is running now`);
      task.method(task.timestamp);
    }
  });
  _tasks = [];
}

/**
 * Destroy all pending tasks
 */
function scheduler_destroy() /*: void*/{
  _tasks = [];
}

;// ./src/sdk/event.js
/*:: // 
import { type EventParamsT, type EventRequestParamsT, type GlobalParamsMapT, type GlobalKeyValueParamsT } from './types';*/






/*:: type RevenueT = {
  revenue: string,
  currency: string
}*/
const DEFAULT_EVENT_DEDUPLICATION_LIST_LIMIT = 10;

/**
 * Name of the store used by event deduplication ids
 *
 * @type {string}
 * @private
 */
const event_storeName = 'eventDeduplication';

/**
 * Get revenue value if positive and limit to 5 decimal places
 *
 * @param {number=} revenue
 * @param {string=} currency
 * @returns {Object}
 * @private
 */
function _getRevenue(revenue /*: number | void*/, currency /*: string | void*/) /*: RevenueT*/{
  if (isNaN(revenue)) {
    return {};
  }
  revenue = parseFloat(revenue);
  if (revenue < 0 || !currency) {
    return {};
  }
  return {
    revenue: revenue.toFixed(5),
    currency
  };
}

/**
 * Prepare parameters for the event tracking
 *
 * @param {Object} params
 * @param {string} params.eventToken
 * @param {number=} params.revenue
 * @param {string=} params.currency
 * @param {Array=} params.callbackParams
 * @param {Array=} params.partnerParams
 * @param {Array} callbackParams
 * @param {Array} partnerParams
 * @returns {Object}
 * @private
 */
function event_prepareParams(params /*: EventParamsT*/, {
  callbackParams,
  partnerParams
} /*: GlobalParamsMapT*/) /*: EventRequestParamsT*/{
  const globalParams = {};
  const baseParams = {
    eventToken: params.eventToken,
    deduplicationId: params.deduplicationId,
    ..._getRevenue(params.revenue, params.currency)
  };
  const eventCallbackParams /*: GlobalKeyValueParamsT*/ = {
    ...convertToMap(callbackParams),
    ...convertToMap(params.callbackParams)
  };
  const eventPartnerParams /*: GlobalKeyValueParamsT*/ = {
    ...convertToMap(partnerParams),
    ...convertToMap(params.partnerParams)
  };
  if (!isEmpty(eventCallbackParams)) {
    globalParams.callbackParams = eventCallbackParams;
  }
  if (!isEmpty(eventPartnerParams)) {
    globalParams.partnerParams = eventPartnerParams;
  }
  return {
    ...baseParams,
    ...globalParams
  };
}

/**
 * Get event deduplication ids
 *
 * @returns {Promise}
 * @private
 */
function _getEventDeduplicationIds() /*: Promise<Array<string>>*/{
  return storage.getAll(event_storeName).then(records => records.map(record => record.id));
}

/**
 * Push event deduplication id and trim the store if out of the limit
 *
 * @param {string} id
 * @returns {Promise}
 * @private
 */
function _pushEventDeduplicationId(id /*: string*/) /*: Promise<number>*/{
  const customLimit = config.getCustomConfig().eventDeduplicationListLimit;
  const limit = customLimit > 0 ? customLimit : DEFAULT_EVENT_DEDUPLICATION_LIST_LIMIT;
  return storage.count(event_storeName).then(count => {
    let chain = Promise.resolve();
    if (count >= limit) {
      const removeLength = count - limit + 1;
      logger.log(`Event deduplication list limit has been reached. Oldest ids are about to be removed (${removeLength} of them)`);
      chain = storage.trimItems(event_storeName, removeLength);
    }
    return chain;
  }).then(() => {
    logger.info(`New event deduplication id is added to the list: ${id}`);
    return storage.addItem(event_storeName, {
      id
    });
  });
}

/**
 * Check if deduplication id is already stored
 * - if yes then reject
 * - if not then push the id into storage
 *
 * @param {string=} id
 * @returns {Promise}
 * @private
 */
function _checkEventDeduplicationId(id /*: string*/) /*: Promise<?number>*/{
  if (!id) {
    return Promise.resolve();
  }
  return _getEventDeduplicationIds().then(list => {
    return list.indexOf(id) === -1 ? _pushEventDeduplicationId(id) : Promise.reject({
      message: `Event won't be tracked, since it was previously tracked with the same deduplication id ${id}`
    });
  });
}

/**
 * Track event by sending the request to the server
 *
 * @param {Object} params
 * @param {number=} timestamp
 * @return Promise
 */
function event_event(params /*: EventParamsT*/, timestamp /*: number*/) /*: Promise<void>*/{
  if (!params || params && (isEmpty(params) || !params.eventToken)) {
    const reason = 'You must provide event token in order to track event';
    logger.error(reason);
    return Promise.reject(reason);
  }
  return _checkEventDeduplicationId(params.deduplicationId).then(get).then(globalParams => {
    return push({
      url: '/event',
      method: 'POST',
      params: event_prepareParams(params, globalParams)
    }, {
      timestamp
    });
  }).catch(error => {
    if (error && error.message) {
      logger.error(error.message);
    }
    return Promise.reject(error);
  });
}
;// ./src/sdk/sdk-click.js
/*:: // 
import { type SdkClickRequestParamsT } from './types';*/




/**
 * Check the following:
 * - redirected from somewhere other then client's website
 * - there is adjust_referrer query param
 *
 * @returns {boolean}
 * @private
 */
function _getReferrer() /*: ?string*/{
  return window.location.search.substring(1).split('&').map(pair => pair.split('=')).reduce(reducer, {})['adjust_referrer'];
}

/**
 * Prepare params for the sdk click request
 *
 * @param {string} referrer
 * @returns {Object}
 * @private
 */
function sdk_click_prepareParams(referrer) /*: SdkClickRequestParamsT*/{
  return {
    clickTime: getTimestamp(),
    source: 'web_referrer',
    referrer: decodeURIComponent(referrer)
  };
}

/**
 * Sends sdk_click request with manually settled referrer or with automatically grabbed one
 */
function sdkClick(manualReferrer /*: string*/, timestamp /*: number*/) /*: void*/{
  let referrer;
  if (manualReferrer) {
    referrer = manualReferrer;
  } else {
    referrer = _getReferrer();
  }
  if (referrer) {
    push({
      url: '/sdk_click',
      method: 'POST',
      params: sdk_click_prepareParams(referrer)
    }, {
      timestamp
    });
  }
}
;// ./src/sdk/main.js
/*:: // 
import { type InitOptionsT, type LogOptionsT, type EventParamsT, type GlobalParamsT, type CustomErrorT, type ActivityStateMapT, type AttributionMapT } from './types';*/


















/*:: type InitConfigT = {|...InitOptionsT, ...LogOptionsT |}*/
/**
 * In-memory parameters to be used if restarting
 *
 * @type {Object}
 * @private
 */
let main_options /*: ? InitOptionsT*/ = null;

/**
 * Flag to mark id sdk is in starting process
 *
 * @type {boolean}
 * @private
 */
let _isInitialising /*: boolean*/ = false;

/**
 * Flag to mark if sdk is started
 *
 * @type {boolean}
 * @private
 */
let _isStarted /*: boolean*/ = false;

/**
 * Flag to mark if sdk is installed to delay public methods until SDK is ready to perform them
 *
 * @type {boolean}
 * @private
 */
let _isInstalled /*: boolean*/ = false;
let _installationCallbackId /*: string*/ = null;

/**
 * Initiate the instance with parameters
 *
 * @param {Object} options
 * @param {string} logLevel
 * @param {string} logOutput
 */
function initSdk({
  logLevel,
  logOutput,
  ...options
} /*: InitConfigT*/ = {}) /*: void*/{
  logger.setLogLevel(logLevel, logOutput);
  if (_isInitialised()) {
    logger.error('You already initiated your instance');
    return;
  }
  if (config.hasMissing(options)) {
    return;
  }
  _isInitialising = true;
  storage.init(options.namespace).then(availableStorage => {
    if (availableStorage.type === STORAGE_TYPES.NO_STORAGE) {
      logger.error('Adjust SDK can not start, there is no storage available');
      return;
    }
    logger.info(`Available storage is ${availableStorage.type}`);
    main_options = {
      ...options
    };
    _start(options);
  });
}

/**
 * Get user's current attribution information
 *
 * @returns {AttributionMapT|undefined} current attribution information if available or `undefined` otherwise
 *
 * @deprecated Use {@link waitForAttribution} instead
 */
function main_getAttribution() /*: ?AttributionMapT*/{
  return _preCheck('get attribution', () => activity_state.getAttribution());
}

/**
 * Returns a promise which resolves when current attribution information becomes available
 */
function main_waitForAttribution() /*: Promise<AttributionMapT>*/{
  return _preCheck('get attribution', () => activity_state.waitForAttribution(), {
    schedule: false
  });
}

/**
 * Get `web_uuid` - a unique ID of user generated per subdomain and per browser
 *
 * @returns {string|undefined} `web_uuid` if available or `undefined` otherwise
 *
 * @deprecated Use {@link waitForWebUUID} instead
 */
function main_getWebUUID() /*: ?string*/{
  return _preCheck('get web_uuid', () => activity_state.getWebUUID());
}

/**
 * Returns a promise which resolves when `web_uuid` becomes available
 */
function main_waitForWebUUID() /*: Promise<string>*/{
  return _preCheck('get web_uuid', () => activity_state.waitForWebUUID(), {
    schedule: false
  });
}
function setReferrer(referrer /*: string*/) {
  if (!referrer || typeof referrer !== 'string') {
    logger.error('You must provide a string referrer');
    return;
  }
  _preCheck('setting reftag', timestamp => sdkClick(referrer, timestamp), {
    schedule: true,
    waitForInitFinished: true,
    optionalInit: true
  });
}

/**
 * Track event with already initiated instance
 *
 * @param {Object} params
 */
function trackEvent(params /*: EventParamsT*/) /*: Promise<void>*/{
  return _internalTrackEvent(params);
}

/**
 * Add global callback parameters
 *
 * @param {Array} params
 */
function addGlobalCallbackParameters(params /*: Array<GlobalParamsT>*/) /*: void*/{
  _preCheck('add global callback parameters', () => add(params, 'callback'));
}

/**
 * Add global partner parameters
 *
 * @param {Array} params
 */
function addGlobalPartnerParameters(params /*: Array<GlobalParamsT>*/) /*: void*/{
  _preCheck('add global partner parameters', () => add(params, 'partner'));
}

/**
 * Remove global callback parameter by key
 *
 * @param {string} key
 */
function removeGlobalCallbackParameter(key /*: string*/) /*: void*/{
  _preCheck('remove global callback parameter', () => remove(key, 'callback'));
}

/**
 * Remove global partner parameter by key
 *
 * @param {string} key
 */
function removeGlobalPartnerParameter(key /*: string*/) /*: void*/{
  _preCheck('remove global partner parameter', () => remove(key, 'partner'));
}

/**
 * Remove all global callback parameters
 */
function clearGlobalCallbackParameters() /*: void*/{
  _preCheck('remove all global callback parameters', () => removeAll('callback'));
}

/**
 * Remove all global partner parameters
 */
function clearGlobalPartnerParameters() /*: void*/{
  _preCheck('remove all global partner parameters', () => removeAll('partner'));
}

/**
 * Switch offline mode
 */
function switchToOfflineMode() /*: void*/{
  _preCheck('set offline mode', () => setOffline(true));
}

/**
 * Switch online mode
 */
function switchBackToOnlineMode() /*: void*/{
  _preCheck('set online mode', () => setOffline(false));
}

/**
 * Stop SDK
 */
function stop() /*: void*/{
  const done = disable();
  if (done && config.isInitialised()) {
    _shutdown();
  }
}

/**
 * Restart sdk if not GDPR forgotten
 */
function restart() /*: void*/{
  const done = restore();
  if (done && main_options) {
    _start(main_options);
  }
}

/**
 * Disable sdk and send GDPR-Forget-Me request
 */
function gdprForgetMe() /*: void*/{
  let done = forget();
  if (!done) {
    return;
  }
  done = gdpr_forget_device_disable();
  if (done && config.isInitialised()) {
    _pause();
  }
}

/**
 * Disable third party sharing
 *
 * @deprecated Use {@link trackThirdPartySharing} instead
 */
function disableThirdPartySharing() /*: void*/{
  main_trackThirdPartySharing({
    isEnabled: false
  });
}

/**
 * Track third party sharing
 */
function main_trackThirdPartySharing(adjustThirdPartySharing /*: ThirdPartySharing*/) /*: void*/{
  const callback = () => activity_state.waitForWebUUID() // ensure we have web_uuid to be sent with request
  .then(() => trackThirdPartySharing(adjustThirdPartySharing));
  _preCheck('third-party sharing', callback, {
    schedule: false,
    optionalInit: true
  });
}

/**  @deprecated */
function initSmartBanner() /*: void*/{
  logger.error('function `initSmartBanner` is deprecated');
}

/**  @deprecated */
function showSmartBanner() /*: void*/{
  logger.error('function `showSmartBanner` is deprecated');
}

/**  @deprecated */
function hideSmartBanner() /*: void*/{
  logger.error('function `hideSmartBanner` is deprecated');
}

/**
 * Handle GDPR-Forget-Me response
 *
 * @private
 */
function _handleGdprForgetMe() /*: void*/{
  if (disable_status() !== 'paused') {
    return;
  }
  gdpr_forget_device_finish();
  Promise.all([clear(), global_params_clear(), queue_clear()]).then(main_destroy);
}

/**
 * Check if sdk initialisation was started
 *
 * @private
 */
function _isInitialised() /*: boolean*/{
  return _isInitialising || config.isInitialised();
}

/**
 * Pause sdk by canceling:
 * - queue execution
 * - session watch
 * - attribution listener
 *
 * @private
 */
function _pause() /*: void*/{
  _isInitialising = false;
  _isStarted = false;
  scheduler_destroy();
  queue_destroy();
  session_destroy();
  attribution_destroy();
}

/**
 * Shutdown all dependencies
 * @private
 */
function _shutdown(async) /*: void*/{
  if (async) {
    logger.log('Adjust SDK has been shutdown due to asynchronous disable');
  }
  _pause();
  pub_sub_destroy();
  identity_destroy();
  listeners_destroy();
  storage.destroy();
  config.destroy();
}

/**
 * Destroy the instance
 *
 * @private
 */
function main_destroy() /*: void*/{
  _isInstalled = false;
  _shutdown();
  gdpr_forget_device_destroy();
  main_options = null;
  logger.log('Adjust SDK instance has been destroyed');
}

/**
 * Check the sdk status and proceed with certain actions
 *
 * @param {Object} activityState
 * @returns {Promise|boolean}
 * @private
 */
function main_continue(activityState /*: ActivityStateMapT*/) /*: Promise<void>*/{
  logger.log(`Adjust SDK is starting with web_uuid set to ${activityState.uuid}`);
  const isInstalled = activity_state.current.installed;
  gdpr_forget_device_check();
  const sdkStatus = disable_status();
  let message = rest => `Adjust SDK start has been interrupted ${rest}`;
  if (sdkStatus === 'off') {
    _shutdown();
    return Promise.reject({
      interrupted: true,
      message: message('due to complete async disable')
    });
  }
  if (sdkStatus === 'paused') {
    _pause();
    return Promise.reject({
      interrupted: true,
      message: message('due to partial async disable')
    });
  }
  if (_isStarted) {
    return Promise.reject({
      interrupted: true,
      message: message('due to multiple synchronous start attempt')
    });
  }
  run({
    cleanUp: true
  });
  return watch().then(() => {
    _isInitialising = false;
    _isStarted = true;
    if (isInstalled) {
      _handleSdkInstalled();
    }
  });
}

/**
 * Handles SDK installed and runs delayed tasks
 */
function _handleSdkInstalled() {
  _isInstalled = true;
  flush();
  unsubscribe(_installationCallbackId);
}

/**
 * Handle error coming from the chain of commands
 *
 * @param {Object|Error} error
 * @private
 */
function main_error(error /*: CustomErrorT | Error*/) {
  if (error.interrupted) {
    logger.log(error.message);
    return;
  }
  _shutdown();
  logger.error('Adjust SDK start has been canceled due to an error', error);
  if (error.stack) {
    throw error;
  }
}

/**
 * Start the execution by preparing the environment for the current usage
 * - prepares mandatory parameters
 * - register some global event listeners (online, offline events)
 * - subscribe to a GDPR-Forget-Me request event
 * - subscribe to the attribution change event
 * - register activity state if doesn't exist
 * - run pending GDPR-Forget-Me if pending
 * - run the package queue if not empty
 * - start watching the session
 *
 * @param {Object} options
 * @param {string} options.appToken
 * @param {string} options.environment
 * @param {string=} options.defaultTracker
 * @param {string=} options.externalDeviceId
 * @param {string=} options.customUrl
 * @param {number=} options.eventDeduplicationListLimit
 * @param {Function=} options.attributionCallback
 * @private
 */
function _start(options /*: InitOptionsT*/) /*: void*/{
  if (disable_status() === 'off') {
    logger.log('Adjust SDK is disabled, can not start the sdk');
    return;
  }
  config.set(options);
  register();
  _installationCallbackId = subscribe('sdk:installed', _handleSdkInstalled);
  subscribe('sdk:shutdown', () => _shutdown(true));
  subscribe('sdk:gdpr-forget-me', _handleGdprForgetMe);
  subscribe('attribution:check', (e, result) => check(result));
  if (typeof options.attributionCallback === 'function') {
    subscribe('attribution:change', options.attributionCallback);
  }
  start().then(main_continue).then(sdkClick).catch(main_error);
}
function _internalTrackEvent(params /*: EventParamsT*/) {
  if (storage.getType() === STORAGE_TYPES.NO_STORAGE) {
    const reason = 'Adjust SDK can not track event, no storage available';
    logger.log(reason);
    return Promise.reject(reason);
  }
  if (disable_status() !== 'on') {
    const reason = 'Adjust SDK is disabled, can not track event';
    logger.log(reason);
    return Promise.reject(reason);
  }
  if (!_isInitialised()) {
    const reason = 'Adjust SDK can not track event, sdk instance is not initialized';
    logger.error(reason);
    return Promise.reject(reason);
  }
  return new Promise(resolve => {
    const _callback = timestamp => resolve(event_event(params, timestamp));
    if (!_isInstalled || !_isStarted && _isInitialised()) {
      delay(_callback, 'track event');
      logger.log('Running track event is delayed until Adjust SDK is up');
    } else {
      _callback();
    }
  });
}

/**
 * Check if it's possible to run provided method
 *
 * @param {string} description
 * @param {Function} callback
 * @param {boolean=false} schedule
 * @private
 */
function _preCheck(description /*: string*/, callback /*: () => mixed*/, {
  schedule,
  waitForInitFinished,
  optionalInit
} /*: { schedule?: boolean, waitForInitFinished?: boolean, optionalInit?: boolean }*/ = {}) /*: mixed*/{
  if (storage.getType() === STORAGE_TYPES.NO_STORAGE) {
    logger.log(`Adjust SDK can not ${description}, no storage available`);
    return;
  }
  if (disable_status() !== 'on') {
    logger.log(`Adjust SDK is disabled, can not ${description}`);
    return;
  }
  if (!(optionalInit || _isInitialised()) && waitForInitFinished) {
    logger.error(`Adjust SDK can not ${description}, sdk instance is not initialized`);
    return;
  }
  if (typeof callback === 'function') {
    if (schedule && !(_isInstalled && _isStarted) && (optionalInit || _isInitialised())) {
      delay(callback, description);
      logger.log(`Running ${description} is delayed until Adjust SDK is up`);
    } else {
      return callback();
    }
  }
}
function _clearDatabase() {
  return storage.deleteDatabase();
}
function _restartAfterAsyncEnable() {
  logger.log('Adjust SDK has been restarted due to asynchronous enable');
  if (main_options) {
    _start(main_options);
  }
}
const Adjust = {
  initSdk,
  getAttribution: main_getAttribution,
  getWebUUID: main_getWebUUID,
  waitForAttribution: main_waitForAttribution,
  waitForWebUUID: main_waitForWebUUID,
  setReferrer,
  trackEvent,
  addGlobalCallbackParameters,
  addGlobalPartnerParameters,
  removeGlobalCallbackParameter,
  removeGlobalPartnerParameter,
  clearGlobalCallbackParameters,
  clearGlobalPartnerParameters,
  switchToOfflineMode,
  switchBackToOnlineMode,
  stop,
  restart,
  gdprForgetMe,
  disableThirdPartySharing,
  trackThirdPartySharing: main_trackThirdPartySharing,
  ThirdPartySharing: ThirdPartySharing,
  initSmartBanner,
  showSmartBanner,
  hideSmartBanner,
  __testonly__: {
    destroy: main_destroy,
    clearDatabase: _clearDatabase
  },
  __internal__: {
    restartAfterAsyncEnable: _restartAfterAsyncEnable
  }
};
/* harmony default export */ const main = (Adjust);
__webpack_exports__ = __webpack_exports__["default"];
/******/ 	return __webpack_exports__;
/******/ })()
;
});