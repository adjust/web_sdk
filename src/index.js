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
  app.log('Attribution was changed:')
  app.log(attribution)
  app.logAttribution(attribution)
}

// INIT: Initiate adjust sdk with specified configuration
adjustSDK.init(appConfig, attributionCallback)

app.start(trackSession, trackEvent)

function trackSession () {
  return new Promise((resolve, reject) => {
    // SESSION TRACKING: initiate session tracking and debug the result
    return adjustSDK.trackSession()
      .then(result => {
        app.log(result) // logs to console
        app.wait(result)
        resolve(result)
      })
      .catch(error => {
        app.log(error) // logs to console
        reject(error.response)
      })
  })
}

function trackEvent () {
  return new Promise((resolve, reject) => {
    // EVENT TRACKING: initiate event tracking with specified configuration and debug the result
    return adjustSDK.trackEvent(eventConfig)
      .then(result => {
        app.log(result) // logs to console
        app.wait(result)
        resolve(result)
      })
      .catch(error => {
        app.log(error) // logs to console
        reject(error.response)
      })
  })
}
