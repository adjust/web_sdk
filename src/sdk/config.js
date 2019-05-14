import Constants from './constants'
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
  sessionWindow: 30 * Constants.minute,
  sessionTimerWindow: 60 * Constants.second,
  requestValidityWindow: 28 * Constants.day,
  ignoreSwitchToBackground: __ADJUST__ENV === 'development',
  baseParams: ClientConfig,
  destroy
}

function destroy () {
  extend(Config.baseParams, _initial)
}

Object.freeze(Config)

export default Config
