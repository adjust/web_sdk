import Adjust from '../../sdk/main'
import {getItem, setItem} from '../storage'

const _ui = {}
const _form = {}
let _defaultReferrerConfig = {'adjust_click_id': 'dummy_id'}
let _disabled = false
let _timeoutId = null

function init () {
  _ui.referrerConfigForm = document.getElementById('referrer-config-form')
  _ui.referrerConfigJson = document.getElementById('referrer-config-json')
  _ui.setReferrerButton = document.getElementById('set-referrer')
  _ui.toggleButton = document.getElementById('referrer-side-form-toggle')
  _ui.submitButton = _ui.referrerConfigForm.querySelector('button[type="submit"]')

  _prepareForm()

  _ui.referrerConfigForm.addEventListener('submit', _handleSave, false)
  _ui.toggleButton.addEventListener('click', _handleToggle, false)
  _ui.setReferrerButton.addEventListener('click', _handleSetReferrer, false)
}

function _handleSave (e) {
  e.preventDefault()

  if (_disabled) {
    return
  }

  _disabled = true
  _ui.submitButton.classList.add('loading')
  _ui.submitButton.disabled = true

  const referrerConfig = {
    [_form.reffererKey.value]: _form.reffererValue.value
  }

  _setJson(referrerConfig)
  setItem('referrerConfig', referrerConfig)

  const referrer = _referrerConfigToString(referrerConfig)

  clearTimeout(_timeoutId)
  _timeoutId = setTimeout(() => {
    _disabled = false
    _ui.submitButton.classList.remove('loading')
    _ui.submitButton.disabled = false
    Adjust.setReferrer(referrer)
  }, 1000)
}

function _handleSetReferrer () {
  const referrerConfig = getItem('referrerConfig') || {..._defaultReferrerConfig}

  if (_disabled) {
    return
  }

  _disabled = true
  _ui.setReferrerButton.classList.add('loading')
  _ui.setReferrerButton.disabled = true

  clearTimeout(_timeoutId)
  _timeoutId = setTimeout(() => {
    _disabled = false
    _ui.setReferrerButton.classList.remove('loading')
    _ui.setReferrerButton.disabled = false
    Adjust.setReferrer(_referrerConfigToString(referrerConfig))
  }, 1000)
}

function _handleToggle (e) {
  const target = e.target
  const sideForm = target.parentNode.nextElementSibling

  sideForm.classList.toggle('show')
  target.classList.toggle('active')
}

function _prepareForm () {
  const referrerConfig = getItem('referrerConfig') || {..._defaultReferrerConfig}

  _form.reffererKey = _ui.referrerConfigForm.querySelector('#refferer-key')
  _form.reffererValue = _ui.referrerConfigForm.querySelector('#refferer-value')

  Object.keys(referrerConfig).map(key => {
    _form.reffererKey.value = key
    _form.reffererValue.value = referrerConfig[key]
  })

  _setJson(referrerConfig)
}

function _setJson (referrerConfig) {
  Object.keys(referrerConfig).map(key => {
    _form.reffererKey.value = key
    _form.reffererValue.value = referrerConfig[key]
  })

  _ui.referrerConfigJson.textContent = `Adjust.setReferrer("${_referrerConfigToString(referrerConfig)}")`
}

function _referrerConfigToString (referrerConfig) {
  let referrer = ''

  Object.keys(referrerConfig).map(key => {
    referrer = `${key}=${referrerConfig[key]}`
  })

  return encodeURIComponent(referrer)
}

export default init
