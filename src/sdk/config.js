import {MINUTE, SECOND, DAY} from './constants'
import {extend, detectPlatform, buildList} from './utilities'
import Logger from './logger'

const _initial = {
  appToken: '',
  environment: '',
  osName: detectPlatform()
}

const _mandatory = [
  'appToken',
  'environment'
]

const baseConfig = {
  namespace: __ADJUST__NAMESPACE,
  version: `js${__ADJUST__SDK_VERSION}`,
  baseUrl: {
    app: 'https://app.adjust.com',
    gdpr: 'https://gdpr.adjust.com'
  },
  sessionWindow: 30 * MINUTE,
  sessionTimerWindow: 60 * SECOND,
  requestValidityWindow: 28 * DAY,
  ignoreSwitchToBackground: __ADJUST__ENV === 'development',
  baseParams: extend({}, _initial),
}

const Config = extend(baseConfig, {
  isInitialised,
  setParams,
  hasMissing,
  destroy
})

/**
 * Check of configuration has neen initialized
 *
 * @returns {boolean}
 */
function isInitialised () {
  return _mandatory.reduce((acc, key) => acc && !!Config.baseParams[key], true)
}

/**
 * Set mandatory params for the sdk to run
 *
 * @param {Object} params
 */
function setParams (params) {
  _mandatory.forEach(key => {
    extend(Config.baseParams, {[key]: params[key]})
  })
}

/**
 * Check if there are  missing mandatory parameters
 *
 * @param {Object} params
 * @returns {boolean}
 * @private
 */
function hasMissing (params) {

  const missing = _mandatory.filter(value => !params[value])

  if (missing.length) {
    Logger.error(`You must define ${buildList(missing)}`)
    return true
  }

  return false
}

/**
 * Restore config to its default state before init
 */
function destroy () {
  extend(Config.baseParams, _initial)
}

export default Config
