import SchemeMap from './scheme-map'

const _storeNames = SchemeMap.storeNames.left
const _scheme = SchemeMap.right

export default {
  [_storeNames.queue]: {
    options: {
      keyPath: _scheme.queue.keyPath,
      autoIncrement: false
    }
  },
  [_storeNames.activityState]: {
    options: {
      keyPath: _scheme.activityState.keyPath,
      autoIncrement: false
    }
  },
  [_storeNames.globalParams]: {
    index: _scheme.globalParams.index,
    options: {
      keyPath: _scheme.globalParams.keyPath,
      autoIncrement: false,
      composite: _scheme.globalParams.fields[_scheme.globalParams.keyPath].composite
    }
  }
}
