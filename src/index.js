import './assets/scss/index.scss'
import adjustSDK from './sdk/main'
import app from './app'

const appConfig = {
  app_token: 'src556ylophc',
  environment: 'production',
  os_name: 'android'
}

const someEventConfig = {
  eventToken: 'yywcyo'
}

const revenueEventConfig = {
  eventToken: 'wmxoqe',
  revenue: 10,
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
app.start(trackEvent, trackRevenueEvent)

function trackEvent () {
  adjustSDK.trackEvent(someEventConfig)
}

function trackRevenueEvent (revenue) {
  revenueEventConfig.revenue = revenue || revenueEventConfig.revenue
  adjustSDK.trackEvent(revenueEventConfig)
}
