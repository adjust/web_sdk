import { REASON_GDPR, REASON_GENERAL } from '../constants'

type StoreFieldScheme = string // Just a short name for the field
  | { // Field with predefined values
    key: string; // Short name of the field
    values: { [key: string]: number | string }; // Map of possible values
  }
  | { // Field containing a nested one
    key: string; // Short name of the field
    keys: { [key: string]: StoreFieldScheme } // Field scheme
  }
  | { // Composite key, stored as a field because of IE doesn't support composite keys feature
    key: string; // Short name of the composite key
    composite: Array<string> // Names (not short) of fields used to generate a key
  }

interface StoreKeyOptions {
  keyPath?: string;
  autoIncrement?: boolean;
}

interface StoreScheme extends StoreKeyOptions {
  index?: string | Array<string>;
  fields: { [key: string]: StoreFieldScheme };
}

interface Store {
  name: string;
  scheme: StoreScheme;
  permanent?: boolean;
}

interface Scheme {
  queue: Store;
  activityState: Store;
  globalParams: Store;
  eventDeduplication: Store;
  preferences: Store;
}

type ShortStoreName = 'q' | 'as' | 'gp' | 'ed' | 'p'

const _queueName = 'q'
const _queueScheme: StoreScheme = {
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

const _activityStateName = 'as'
const _activityStateScheme: StoreScheme = {
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

const _globalParamsName = 'gp'
const _globalParamsScheme: StoreScheme = {
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

const _eventDeduplicationName = 'ed'
const _eventDeduplicationScheme: StoreScheme = {
  keyPath: 'internalId',
  autoIncrement: true,
  fields: {
    internalId: 'ii',
    id: 'i'
  }
}

const _preferencesName = 'p'
const _preferencesScheme: StoreScheme = {
  fields: {
    thirdPartySharingDisabled: {
      key: 'td',
      keys: {
        reason: {
          key: 'r',
          values: {
            [REASON_GENERAL]: 1
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
  }
}

const scheme: Scheme = {
  queue: {
    name: _queueName,
    scheme: _queueScheme
  },
  activityState: {
    name: _activityStateName,
    scheme: _activityStateScheme
  },
  globalParams: {
    name: _globalParamsName,
    scheme: _globalParamsScheme
  },
  eventDeduplication: {
    name: _eventDeduplicationName,
    scheme: _eventDeduplicationScheme
  },
  preferences: {
    name: _preferencesName,
    scheme: _preferencesScheme,
    permanent: true
  }
}

export { ShortStoreName }

export default scheme
