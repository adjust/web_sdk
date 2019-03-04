import './assets/scss/index.scss'
import adjustSDK from './sdk/main'
import app from './app'

const appConfig = {
  app_token: '2fm9gkqubvpc',
  environment: 'sandbox',
  os_name: 'android',
  device_ids: {
    gps_adid: '5056e23a-dc1d-418f-b5a2-4ab3e75daab2'
  }
}

const eventConfig = {
  eventToken: 'g3mfiw',
  revenue: 1000,
  currency: 'EUR',
  callbackParams: [{
    key: 'some-key-1',
    value: 'some-value-1'
  }, {
    key: 'some-key-2',
    value: 'some-value-2'
  }],
  partnerParams: [{
    key: 'some-partner-key-1',
    value: 'some-partner-value-1'
  }, {
    key: 'some-partner-key-2',
    value: 'some-partner-value-2'
  }, {
    key: 'some-partner-key-1',
    value: 'some-partner-value-3'
  }]
}

const attributionCallback = (e, attribution) => {
  app.logAttribution(attribution)
}

// INIT: Initiate adjust sdk with specified configuration
adjustSDK.init(appConfig, attributionCallback)


// NOTE: this is custom demo app implementation
app.start(trackSession, trackEvent)

function trackSession () {
  adjustSDK.trackSession()
}

function trackEvent () {
  adjustSDK.trackEvent(eventConfig)
}
