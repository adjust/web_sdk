import {init as logInit} from './log'
import tabsInit from './tabs/tabs'
import trackEventInit from './track-event/track-event'
import addGlobalCallbackParamsInit from './add-global-callback-params/add-global-callback-params'
import addGlobalPartnerParamsInit from './add-global-partner-params/add-global-partner-params'
import removeGlobalCallbackParamInit from './remove-global-callback-param/remove-global-callback-param'
import removeGlobalPartnerParamInit from './remove-global-partner-param/remove-global-partner-param'
import clearGlobalCallbackParamsInit from './clear-global-callback-params/clear-global-callback-params'
import clearGlobalPartnerParamsInit from './clear-global-partner-params/clear-global-partner-params'
import switchToOffineModeInit from './switch-to-offline-mode/switch-to-offline-mode'
import switchBackToOnlineModeInit from './switch-back-to-online-mode/switch-back-to-online-mode'
import stopInit from './stop/stop'
import restartInit from './restart/restart'
import gdprForgetMeInit from './gdpr-forget-me/gdpr-forget-me'
import disableThirdPartySharingInit from './disable-third-party-sharing/disable-third-party-sharing'
import getWebUUID from './get-web-uuid/get-web-uuid'
import getAttribution from './get-attribution/get-attribution'

function init (defaultAppConfig, defaultEventConfig) {
  logInit()
  tabsInit(defaultAppConfig)
  trackEventInit(defaultEventConfig)
  addGlobalCallbackParamsInit()
  addGlobalPartnerParamsInit()
  removeGlobalCallbackParamInit()
  removeGlobalPartnerParamInit()
  clearGlobalCallbackParamsInit()
  clearGlobalPartnerParamsInit()
  switchToOffineModeInit()
  switchBackToOnlineModeInit()
  stopInit()
  restartInit()
  gdprForgetMeInit()
  disableThirdPartySharingInit()
  getWebUUID()
  getAttribution()
}

export default init
