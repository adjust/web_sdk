import {REASON_GDPR, REASON_GENERAL} from '../constants'

const _queueScheme = {
  keyPath: 'timestamp',
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
  keyPath: 'uuid',
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
  keyPath: 'keyType',
  index: 'type',
  fields: {
    keyType: {
      key: 'kt',
      primary: true,
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

const _disabledScheme = {
  keyPath: 'reason',
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

export default {
  queue: _queueScheme,
  activityState: _activityStateScheme,
  globalParams: _globalParamsScheme,
  disabled: _disabledScheme
}
