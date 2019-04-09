export default {
  queue: {
    options: {
      keyPath: 'timestamp',
      autoIncrement: false
    }
  },
  activityState: {
    options: {
      keyPath: 'uuid',
      autoIncrement: false
    }
  },
  eventParams: {
    index: 'type',
    options: {
      keyPath: ['key', 'type'],
      autoIncrement: false
    }
  }
}
