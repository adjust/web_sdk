import Constants from './constants'
import {extend} from './utilities'

const _initial = {
  app_token: '',
  environment: '',
  os_name: ''
}

const ClientConfig = extend({}, _initial)

const Config = {
  namespace: __ADJUST__NAMESPACE,
  version: `js${__ADJUST__SDK_VERSION}`,
  baseUrl: __ADJUST__IS_TEST ? '' : 'https://app.adjust.com',
  sessionWindow: 30 * Constants.minute,
  sessionTimerWindow: 60 * Constants.second,
  requestValidityWindow: 28 * Constants.day,
  ignoreSwitchToBackground: true,
  baseParams: ClientConfig,
  clear
}

function clear () {
  extend(Config.baseParams, _initial)
}

Object.freeze(Config)

export default Config
