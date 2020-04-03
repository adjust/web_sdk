import tabsInit from './tabs/tabs'
import {init as logInit} from './log'
import trackEventFormInit from './track-event/track-event'

function init (defaultAppConfig, defaultEventConfig) {
  tabsInit(defaultAppConfig)
  logInit()
  trackEventFormInit(defaultEventConfig)
}

export default init
