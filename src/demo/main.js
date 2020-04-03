import tabsInit from './tabs/tabs'
import {init as logInit} from './log'
import trackEventFormInit from './track-event/track-event'
import addGlobalCallbackParams from './add-global-callback-params/add-global-callback-params'
import addGlobalPartnerParams from './add-global-partner-params/add-global-partner-params'

function init (defaultAppConfig, defaultEventConfig) {
  tabsInit(defaultAppConfig)
  logInit()
  trackEventFormInit(defaultEventConfig)
  addGlobalCallbackParams()
  addGlobalPartnerParams()
}

export default init
