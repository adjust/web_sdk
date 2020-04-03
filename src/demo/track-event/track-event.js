import Adjust from '../../sdk/main'
import {getItem, setItem} from '../storage'
import KeyValueParams from '../key-value-params/key-value-params'

const _ui = {}
const _form = {}
let _defaultEventConfig = {}
let _disabled = false
let _timeoutId = null

let _eventCallbackParams = null
let _eventPartnerParams = null

function init (defaultEventConfig = {}) {
  _defaultEventConfig = {...defaultEventConfig}

  _ui.eventConfigForm = document.getElementById('event-config-form')
  _ui.eventConfigJson = document.getElementById('event-config-json')
  _ui.trackEventButton = document.getElementById('track-event-button')
  _ui.toggleButton = document.getElementById('event-side-form-toggle')
  _ui.submitButton = _ui.eventConfigForm.querySelector('button[type="submit"]')

  _prepareForm()

  _ui.eventConfigForm.addEventListener('submit', _handleSave, false)
  _ui.toggleButton.addEventListener('click', _handleToggle, false)
  _ui.trackEventButton.addEventListener('click', _handleTrackEvent, false)
}

function _handleSave (e) {
  e.preventDefault()

  if (_disabled) {
    return
  }

  _disabled = true
  _ui.submitButton.classList.add('loading')
  _ui.submitButton.disabled = true

  const callbackParams = _eventCallbackParams.query()
  const partnerParams = _eventPartnerParams.query()
  const initial = {}
  if (callbackParams.length) {
    initial.callbackParams = callbackParams
  }
  if (partnerParams.length) {
    initial.partnerParams = partnerParams
  }

  const eventConfig = Object.keys(_form)
    .map(key => [key, _form[key].value])
    .filter(([, value]) => value)
    .reduce((acc, [key, value]) => ({...acc, [key]: value}), initial)

  _setJson(eventConfig)
  setItem('eventConfig', eventConfig)

  clearTimeout(_timeoutId)
  _timeoutId = setTimeout(() => {
    _disabled = false
    _ui.submitButton.classList.remove('loading')
    _ui.submitButton.disabled = false
    Adjust.trackEvent(eventConfig)
  }, 1000)
}

function _handleTrackEvent () {
  const eventConfig = getItem('eventConfig') || _defaultEventConfig

  if (_disabled) {
    return
  }

  _disabled = true
  _ui.trackEventButton.classList.add('loading')
  _ui.trackEventButton.disabled = true

  clearTimeout(_timeoutId)
  _timeoutId = setTimeout(() => {
    _disabled = false
    _ui.trackEventButton.classList.remove('loading')
    _ui.trackEventButton.disabled = false
    Adjust.trackEvent(eventConfig)
  }, 1000)
}

function _handleToggle (e) {
  const target = e.target
  const sideForm = target.parentNode.nextElementSibling

  sideForm.classList.toggle('show')
  target.classList.toggle('active')
}

function _prepareForm () {
  const eventConfig = getItem('eventConfig') || _defaultEventConfig

  _form.eventToken = _ui.eventConfigForm.querySelector('#event-token')
  _form.revenue = _ui.eventConfigForm.querySelector('#revenue')
  _form.currency = _ui.eventConfigForm.querySelector('#currency')
  _form.deduplicationId = _ui.eventConfigForm.querySelector('#deduplication-id')

  _eventCallbackParams = KeyValueParams('event-callback-params', eventConfig.callbackParams)
  _eventPartnerParams = KeyValueParams('event-partner-params', eventConfig.partnerParams)

  _eventCallbackParams.init()
  _eventPartnerParams.init()

  Object.keys(_form).map(key => _form[key].value = eventConfig[key] || '')

  _setJson(eventConfig)
}

function _setJson (eventConfig) {
  _ui.eventConfigJson.textContent = JSON.stringify(eventConfig, undefined, 2)
}

export default init
