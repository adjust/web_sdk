import { DISABLE_REASONS } from '../constants'
import { StoredValue } from './types'

/**
 * Field with predefined values
 */
type StoreFieldPredefinedValues = {
  key: string; // Short name of the field
  values: Record<string, StoredValue>; // Map of possible values
}

/**
 * Field containing a nested one
 */
type StoreFieldNestingFields = {
  key: string; // Short name of the field
  keys: Record<string, StoreFieldScheme>; // Field scheme
}

/**
 * Composite key, stored as a field because of IE doesn't support composite keys feature
 */
type StoreFieldCompositeKey = {
  key: string; // Short name of the composite key
  composite: Array<string>; // Names (not short) of fields used to generate a key
}

type StoreFieldComplex = StoreFieldPredefinedValues | StoreFieldCompositeKey | StoreFieldNestingFields

type StoreFieldScheme = string | StoreFieldComplex

interface StoreKeyOptions {
  keyPath?: string;
  autoIncrement?: boolean;
}

type StoreFields = Record<string, StoreFieldScheme>

interface StoreOptionsOptionalKey extends StoreKeyOptions {
  index?: string;
  fields: StoreFields;
}

interface StoreOptions extends StoreKeyOptions {
  keyPath: string; // override keyPath to be required
  index?: string;
  fields: StoreFields;
}

enum StoreName {
  Queue = 'queue',
  ActivityState = 'activityState',
  GlobalParams = 'globalParams',
  EventDeduplication = 'eventDeduplication'
}

enum PreferencesStoreName {
  Preferences = 'preferences'
}

type StoreNames = StoreName | PreferencesStoreName

enum ShortStoreName {
  Queue = 'q',
  ActivityState = 'as',
  GlobalParams = 'gp',
  EventDeduplication = 'ed'
}

enum ShortPreferencesStoreName {
  Preferences = 'p'
}

type ShortStoreNames = ShortStoreName | ShortPreferencesStoreName

interface Store {
  name: ShortStoreName | ShortPreferencesStoreName;
  scheme: StoreOptions | StoreOptionsOptionalKey;
  permanent?: boolean;
}

type Scheme = Record<StoreNames, Store>

const _queueScheme: StoreOptions = {
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
}

const _activityStateScheme: StoreOptions = {
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
}

const _globalParamsScheme: StoreOptions = {
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
}

const _eventDeduplicationScheme: StoreOptions = {
  keyPath: 'internalId',
  autoIncrement: true,
  fields: {
    internalId: 'ii',
    id: 'i'
  }
}

const _preferencesScheme: StoreOptionsOptionalKey = {
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
}

const scheme: Scheme = {
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
}

function isPredefinedValuesField(field: Maybe<StoreFieldScheme>): field is StoreFieldPredefinedValues {
  return !!field && Object.prototype.hasOwnProperty.call(field, 'values')
}

function isNestingStoreField(field: Maybe<StoreFieldScheme>): field is StoreFieldNestingFields {
  return !!field && Object.prototype.hasOwnProperty.call(field, 'keys')
}

function isCompositeKeyStoreField(field: Maybe<StoreFieldScheme>): field is StoreFieldCompositeKey {
  return !!field && Object.prototype.hasOwnProperty.call(field, 'composite')
}

function isComplexStoreField(field: Maybe<StoreFieldScheme>): field is StoreFieldComplex {
  return !!field && typeof(field) !== 'string'
}

export {
  StoreName,
  ShortStoreName,
  StoreNames,
  ShortStoreNames,
  PreferencesStoreName,
  ShortPreferencesStoreName,
  Store,
  StoreOptions,
  StoreOptionsOptionalKey,
  StoreFieldScheme,
  StoreFields,
  StoreFieldPredefinedValues,
  isPredefinedValuesField,
  isNestingStoreField,
  isCompositeKeyStoreField,
  isComplexStoreField
}

export default scheme
