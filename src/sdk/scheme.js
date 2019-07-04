const QUEUE_STORE = 'queue'
const ACTIVITY_STATE_STORE = 'activityState'
const GLOBAL_PARAMS = 'globalParams'

export default {
  names: {
    queue: QUEUE_STORE,
    activityState: ACTIVITY_STATE_STORE,
    globalParams: GLOBAL_PARAMS
  },
  stores: {
    [QUEUE_STORE]: {
      options: {
        keyPath: 'timestamp',
        autoIncrement: false
      }
    },
    [ACTIVITY_STATE_STORE]: {
      options: {
        keyPath: 'uuid',
        autoIncrement: false
      }
    },
    [GLOBAL_PARAMS]: {
      index: 'type',
      options: {
        keyPath: ['key', 'type'],
        autoIncrement: false
      }
    }
  }
}
