import {extend, reducer} from '../utilities'
import {REASON_GDPR, REASON_GENERAL} from '../constants'

const QUEUE_STORE = 'q'
const ACTIVITY_STATE_STORE = 'as'
const GLOBAL_PARAMS_STORE = 'gp'

const StoreNames = {
  queue: QUEUE_STORE,
  activityState: ACTIVITY_STATE_STORE,
  globalParams: GLOBAL_PARAMS_STORE
}

const _queueScheme = {
  keyPath: ['timestamp'],
  fields: {
    url: {
      key: 'u',
      values: {
        '/session': 1,
        '/event': 2,
        '/gdpr_forget_device': 3
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
    timestamp: {
      key: 't',
      primary: true
    },
    params: {
      key: 'p',
      keys: {
        createdAt: 'ca',
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
}

const _activityStateScheme = {
  keyPath: ['uuid'],
  fields: {
    uuid: {
      key: 'u',
      primary: true,
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
        click_label: 'cl'
      }
    }
  }
}

const _globalParamsScheme = {
  keyPath: ['key', 'type'],
  fields: {
    key: {
      key: 'k',
      primary: true
    },
    value: 'v',
    type: {
      key: 't',
      primary: true,
      values: {
        callback: 1,
        partner: 2
      }
    }
  }
}

const _disabledScheme = {
  keyPath: ['reason'],
  fields: {
    reason: {
      key: 'r',
      values: {
        [REASON_GENERAL]: 1,
        [REASON_GDPR]: 2
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

const Base = {
  queue: _queueScheme,
  activityState: _activityStateScheme,
  globalParams: _globalParamsScheme,
  disabled: _disabledScheme
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
    .map(key => keyPath.map[key] || key)
}

/**
 * Flip key/value pairs
 *
 * @param {Object} obj
 * @returns {Object}
 * @private
 */
function _flipObject (obj) {
  return Object
    .entries(obj)
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

  return extend({key}, values, keys)
}

/**
 * Flip general scheme recursivelly
 *
 * @param {Object} scheme
 * @returns {Object}
 * @private
 */
function _flipScheme (scheme) {
  return Object
    .entries(scheme)
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
  return Object
    .entries(Base)
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
  return Object
    .entries(Left)
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
  return Object
    .entries(Base)
    .reduce((acc, [, scheme]) => acc.concat(scheme.fields), [])
    .map(scheme => Object
      .entries(scheme)
      .filter(([, map]) => map.values)
      .map(([, map]) => Object.entries(map.values))
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
  const map = Base[storeName].fields[key]
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
