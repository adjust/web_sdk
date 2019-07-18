import SchemeMap from './scheme-map'

const _storeNames = SchemeMap.storeNames
const _scheme = SchemeMap.right

export default {
  [_storeNames.queue]: {
    options: {
      keyPath: _scheme[_storeNames.queue].keyPath.list[0],
      autoIncrement: false
    }
  },
  [_storeNames.activityState]: {
    options: {
      keyPath: _scheme[_storeNames.activityState].keyPath.list[0],
      autoIncrement: false
    }
  },
  [_storeNames.globalParams]: {
    index: SchemeMap.getShortKey(_storeNames.globalParams, 'type'),
    options: {
      keyPath: _scheme[_storeNames.globalParams].keyPath.list,
      autoIncrement: false
    }
  }
}
