import { hyphenToCamelCase } from '../utils'
import { getItem, setItem, clear } from '../storage'
import { write, clear as clearLog } from '../log'
import Adjust from '../../sdk/main'

const _ui = {}
const _form = {}
const _active = {}
let _disabled = false
let _defaultAppConfig = {}
let _timeoutId = null

function init(defaultAppConfig) {
  _defaultAppConfig = { ...defaultAppConfig }

  _ui.logTab = document.getElementById('log-tab')
  _ui.logTabContainer = document.getElementById('log-tab-container')
  _ui.logClearButton = document.getElementById('log-tab-clear-button')
  _ui.appConfigTab = document.getElementById('app-config-tab')
  _ui.appConfigTabContainer = document.getElementById('app-config-tab-container')
  _ui.appConfigForm = document.getElementById('app-config-form')
  _ui.appConfigJson = document.getElementById('app-config-json')
  _ui.submitButton = _ui.appConfigForm.querySelector('button[type="submit"]')
  _ui.restoreDefaultConfig = _ui.appConfigForm.querySelector('#restore-default-config')
  _ui.resetButton = _ui.appConfigForm.querySelector('#reset')

  _prepareForm()

  _active.tab = _ui.logTab
  _active.container = _ui.logTabContainer

  _ui.logTab.addEventListener('click', _handleTab, false)
  _ui.logClearButton.addEventListener('click', _handleClearLog, false)
  _ui.appConfigTab.addEventListener('click', _handleTab, false)
  _ui.appConfigForm.addEventListener('submit', _handleSave, false)
  _ui.restoreDefaultConfig.addEventListener('click', _handleRestoreDefaultConfig, false)
  _ui.resetButton.addEventListener('click', _handleReset, false)
}

function _handleTab(e) {
  const key = hyphenToCamelCase(e.target.id)
  const tab = _ui[key]
  const container = _ui[key + 'Container']

  if (tab.id === _active.tab.id) {
    return
  }

  tab.classList.add('active')
  container.classList.add('active')
  _active.tab.classList.remove('active')
  _active.container.classList.remove('active')

  _active.tab = tab
  _active.container = container
}

function _getAppConfig(form) {
  return Object.keys(form)
    .map(key => [key, form[key].value])
    .filter(([, value]) => value)
    .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {})
}

function _reflectConfigInForm(appConfig, form) {
  Object.keys(form).map(key => form[key].value = appConfig[key] || '')
}

function _handleClearLog() {
  clearLog()
}

function _handleSave(e) {
  e.preventDefault()

  if (_disabled) {
    return
  }

  _disabled = true
  _ui.submitButton.classList.add('loading')
  _ui.submitButton.disabled = true

  const appConfig = _getAppConfig(_form)
  _setJson(appConfig)

  setItem('appConfig', appConfig)
  clearTimeout(_timeoutId)
  _timeoutId = setTimeout(() => {
    _disabled = false
    _ui.submitButton.classList.remove('loading')
    _ui.submitButton.disabled = false

    _handleTab({ target: { id: 'log-tab' } })
    Adjust.__testonly__.destroy()
    Adjust.initSdk({
      ...appConfig,
      attributionCallback: _handleAttributionChange
    })
  })
}

function _handleRestoreDefaultConfig() {
  if (_disabled) {
    return
  }

  _disabled = true
  _ui.submitButton.classList.add('loading')
  _ui.submitButton.disabled = true

  setItem('appConfig', null)

  const appConfig = { ..._defaultAppConfig }

  _reflectConfigInForm(appConfig, _form)
  _setJson(appConfig)

  clearTimeout(_timeoutId)
  _timeoutId = setTimeout(() => {
    _disabled = false
    _ui.submitButton.classList.remove('loading')
    _ui.submitButton.disabled = false
  })
}

function _handleReset() {
  if (_disabled) {
    return
  }

  _disabled = true
  _ui.resetButton.classList.add('loading')
  _ui.resetButton.disabled = true

  const appConfig = _getAppConfig(_form)
  _setJson(appConfig)

  clear()
  Adjust.__testonly__.clearDatabase()
    .catch(error => {
      write('There was an error while attempting to delete the storage, please refresh')
      throw error
    })
    .then(() => {
      setItem('appConfig', appConfig)
      write('The storage is deleted and the sdk is re-initiated')
      setTimeout(() => {
        window.location.reload()
      })
    })
}

function _handleAttributionChange(e, result) {
  write('NEW ATTRIBUTION')
  write(JSON.stringify(result, undefined, 2))
}

function _prepareForm() {
  const appConfig = getItem('appConfig') || { ..._defaultAppConfig }

  Adjust.initSdk({
    ...appConfig,
    attributionCallback: _handleAttributionChange
  })

  _form.appToken = _ui.appConfigForm.querySelector('#app-token')
  _form.environment = _ui.appConfigForm.querySelector('#environment')
  _form.defaultTracker = _ui.appConfigForm.querySelector('#default-tracker')
  _form.customUrl = _ui.appConfigForm.querySelector('#custom-url')
  _form.logLevel = _ui.appConfigForm.querySelector('#log-level')
  _form.dataResidency = _ui.appConfigForm.querySelector('#data-residency')
  _form.urlStrategy = _ui.appConfigForm.querySelector('#url-strategy')
  _form.logOutput = _ui.appConfigForm.querySelector('#log-output')
  _form.eventDeduplicationListLimit = _ui.appConfigForm.querySelector('#event-deduplication-list-limit')
  _form.externalDeviceId = _ui.appConfigForm.querySelector('#external-device-id')

  _reflectConfigInForm(appConfig, _form)
  _setJson(appConfig)
}

function _setJson(appConfig) {
  _ui.appConfigJson.textContent = `Adjust.initSdk(${JSON.stringify(appConfig, undefined, 2)})`
}

export default init
