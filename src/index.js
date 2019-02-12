import './assets/scss/index.scss'
import adjust from './sdk/main.js'

const _trackSessionBtn = document.querySelector('#track-session')
const _trackEventBtn = document.querySelector('#track-event')
const _logContainer = document.querySelector('#log')
const _loading = {}
let _waitingForResponseMsg = 'waiting for response, please wait...'

const _appConfig = {
  app_token: '2fm9gkqubvpc',
  environment: 'sandbox',
  os_name: 'android',
  device_ids: {
    gps_adid: '5056e23a-dc1d-418f-b5a2-4ab3e75daab2'
  }
}

const _eventConfig = {
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

adjust.init(_appConfig)

_trackSessionBtn.addEventListener('click', handleTrackSession)
_trackEventBtn.addEventListener('click', handleTrackEvent)


function handleTrackSession () {

  if (_loading.session) {
    return
  }

  _loading.session = true

  prepareLog()

  adjust.trackSession()
    .then(result => successCb(result, 'session'))
    .catch(error => errorCb(error, 'session'))

}

function handleTrackEvent () {

  if (_loading.event) {
    return
  }

  _loading.event = true

  prepareLog()

  adjust.trackEvent(_eventConfig)
    .then(result => successCb(result, 'event'))
    .catch(error => errorCb(error, 'event'))

}

function prepareLog () {

  _logContainer.textContent = _waitingForResponseMsg
  _logContainer.classList.remove('success')
  _logContainer.classList.remove('error')

}

function successCb (result, what) {

  _loading[what] = false

  _logContainer.textContent = 'SUCCESS :)\n\n'
  _logContainer.textContent += result
  _logContainer.classList.add('success')

}

function errorCb (error, what) {

  _loading[what] = false

  _logContainer.textContent = 'ERROR :(\n\n'
  _logContainer.textContent += error.response
  _logContainer.classList.add('error')

}
