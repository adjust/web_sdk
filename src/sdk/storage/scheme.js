import SchemeMap from './scheme-map'

const _storeNames = SchemeMap.storeNames.left
const _scheme = SchemeMap.right

export default {
  [_storeNames.queue]: {
    options: {
      keyPath: _scheme.queue.keyPath.list[0],
      autoIncrement: false
    }
  },
  [_storeNames.activityState]: {
    options: {
      keyPath: _scheme.activityState.keyPath.list[0],
      autoIncrement: false
    }
  },
  [_storeNames.globalParams]: {
    index: SchemeMap.getShortKey('globalParams', 'type'),
    options: {
      keyPath: _scheme.globalParams.keyPath.list,
      autoIncrement: false
    }
  }
}
