import './assets/scss/index.scss'
import Adjust from './sdk/main'
import app from './app'

const appConfig = {
  appToken: 'src556ylophc',
  environment: 'production',
  attributionCallback,
  logLevel: 'verbose', // 'none', 'error', 'info', 'verbose'
  logOutput: '#log',
  // defaultTracker: 'YOUR_DEFAULT_TRACKER',
  // customUrl: 'YOUR_CUSTOM_URL'
}

const basicEventConfig = {
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

const globalCallpackParams = [
  {key: 'key1', value: 'value1'},
  {key: 'key2', value: 'value2'}
]

const globalPartnerParams = [
  {key: 'key-1', value: 'value-1'},
  {key: 'key-2', value: 'value-2'},
  {key: 'key-3', value: 'value-3'}
]

function attributionCallback (e, attribution) {
  app.logAttribution(attribution)
}

// INIT: Initiate adjust sdk with specified configuration
Adjust.initSdk(appConfig)

// NOTE: this is custom demo app implementation
app.start({
  event: () => Adjust.trackEvent(basicEventConfig),
  revent: () => Adjust.trackEvent(revenueEventConfig),
  addgcp: () => Adjust.addGlobalCallbackParameters(globalCallpackParams),
  addgpp: () => Adjust.addGlobalPartnerParameters(globalPartnerParams),
  removegcp: () => Adjust.removeGlobalCallbackParameter('key1'),
  removegpp: () => Adjust.removePartnerCallbackParameter('key-1'),
  cleargcp: Adjust.clearGlobalCallbackParameters,
  cleargpp: Adjust.clearGlobalPartnerParameters,
  gooffline: () => Adjust.switchToOfflineMode(),
  goonline: () => Adjust.switchBackToOnlineMode(),
  stop: Adjust.stop,
  restart: Adjust.restart,
  gdpr: Adjust.gdprForgetMe
})
