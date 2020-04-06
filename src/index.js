/* eslint-disable */
import './assets/scss/index.scss'
import main from './demo/main'

const appConfig = {
  appToken: 'l8czd4os6ww0',
  environment: 'production', // production or sandbox
  logLevel: 'verbose', // none, error, info, verbose
  logOutput: '#log',
  // defaultTracker: 'YOUR_DEFAULT_TRACKER',
  // customUrl: 'YOUR_CUSTOM_URL'
  // eventDeduplicationListLimit: 'YOUR_EVENT_DEDUPLICATION_LIST_LIMIT'
}

const basicEventConfig = {
  eventToken: 'c8qws5',
  // deduplicationId: 'YOUR_EVENT_DEDUPLICATION_ID'
  // revenue: YOUR_REVENUE_VALUE,
  // currency: 'YOUR_CURRENCY',
  // callbackParams: [
  //   {key: 'YOUR_KEY_1', value: 'YOUR_VALUE_1'},
  //   {key: 'YOUR_KEY_2', value: 'YOUR_VALUE_2'}
  // ],
  // partnerParams: [
  //   {key: 'YOUR_KEY_1', value: 'YOUR_VALUE_1'},
  //   {key: 'YOUR_KEY_2', value: 'YOUR_VALUE_2'}
  // ]
}

window.addEventListener('DOMContentLoaded', () => {
  main(appConfig, basicEventConfig)
})
