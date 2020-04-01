import tabsInit from './tabs/tabs'
import {init as logInit} from './log'

function init (defaultAppConfig) {
  tabsInit(defaultAppConfig)
  logInit()
}

export default init
