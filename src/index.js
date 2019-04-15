import './assets/scss/index.scss'
import adjustSDK from './sdk/main'
import app from './app'

const appConfig = {
  app_token: 'src556ylophc',
  environment: 'production',
  os_name: 'macos'
}

const someEventConfig = {
  event_token: 'yywcyo'
}

const revenueEventConfig = {
  event_token: 'wmxoqe',
  revenue: 10,
  currency: 'EUR',
  callback_params: [
    {key: 'some-key-1', value: 'some-value-1'},
    {key: 'some-key-2', value: 'some-value-2'},
    {key: 'key1', value: 'new-value1'}
  ],
  partner_params: [
    {key: 'key-1', value: 'new-value-1'},
    {key: 'some-partner-key-1', value: 'some-partner-value-1'},
    {key: 'key-2', value: 'new-value-2'},
    {key: 'some-partner-key-2', value: 'some-partner-value-2'},
    {key: 'some-partner-key-1', value: 'some-partner-value-3'}
  ]
}

const attributionCallback = (e, attribution) => {
  app.logAttribution(attribution)
}

// INIT: Initiate adjust sdk with specified configuration
adjustSDK.init(appConfig, attributionCallback)

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
