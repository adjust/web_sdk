import {MINUTE, SECOND, DAY} from './constants'
import {extend, detectPlatform} from './utilities'

const _initial = {
  appToken: '',
  environment: '',
  osName: detectPlatform()
}

const ClientConfig = extend({}, _initial)

const Config = {
  namespace: __ADJUST__NAMESPACE,
  version: `js${__ADJUST__SDK_VERSION}`,
  baseUrl: __ADJUST__ENV === 'test' ? '' : 'https://app.adjust.com',
  sessionWindow: 30 * MINUTE,
  sessionTimerWindow: 60 * SECOND,
  requestValidityWindow: 28 * DAY,
  ignoreSwitchToBackground: __ADJUST__ENV === 'development',
  baseParams: ClientConfig,
  destroy
}

function destroy () {
  extend(Config.baseParams, _initial)
}

Object.freeze(Config)

export default Config
