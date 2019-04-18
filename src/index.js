import './assets/scss/index.scss'
import adjustSDK from './sdk/main'
import app from './app'

const appConfig = {
  appToken: 'src556ylophc',
  environment: 'production',
  osName: 'macos',
  attributionCallback: attributionCallback
}

const someEventConfig = {
  eventToken: 'yywcyo'
}

const revenueEventConfig = {
  eventToken: 'wmxoqe',
  revenue: 10,
  currency: 'EUR',
  callbackParams: [
    {key: 'some-key-1', value: 'some-value-1'},
    {key: 'some-key-2', value: 'some-value-2'},
    {key: 'key1', value: 'new-value1'}
  ],
  partnerParams: [
    {key: 'key-1', value: 'new-value-1'},
    {key: 'some-partner-key-1', value: 'some-partner-value-1'},
    {key: 'key-2', value: 'new-value-2'},
    {key: 'some-partner-key-2', value: 'some-partner-value-2'},
    {key: 'some-partner-key-1', value: 'some-partner-value-3'}
  ]
}

function attributionCallback (e, attribution) {
  app.logAttribution(attribution)

  adjustSDK.removeGlobalCallbackParameter('key1')
  adjustSDK.removePartnerCallbackParameter('key-1')
}

// INIT: Initiate adjust sdk with specified configuration
adjustSDK.init(appConfig)

adjustSDK.addGlobalCallbackParameters([
  {key: 'key1', value: 'last-value1'},
  {key: 'key2', value: 'value2'}
])

adjustSDK.addGlobalPartnerParameters([
  {key: 'key-1', value: 'value-1'},
  {key: 'key-2', value: 'value-2'},
  {key: 'key-3', value: 'value-3'}
])

// NOTE: this is custom demo app implementation
app.start(trackEvent, trackRevenueEvent)

function trackEvent () {
  adjustSDK.trackEvent(someEventConfig)
}

function trackRevenueEvent (revenue) {
  revenueEventConfig.revenue = revenue || revenueEventConfig.revenue
  adjustSDK.trackEvent(revenueEventConfig)
}
