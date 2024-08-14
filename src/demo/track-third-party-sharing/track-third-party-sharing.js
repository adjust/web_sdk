import Adjust from '../../sdk/main'
import { getItem, setItem } from '../storage'
import DynamicParams from '../dynamic-params/dynamic-params'

const _ui = {}
let _tpsOptions = {}
let _disabled = false
let _timeoutId = null
let _granularOptions = null
let _partnerSharingSettings = null

function init() {
  _tpsOptions = getItem('tpsOptions') || { isEnabled: true, granularOptions: [], partnerSharingSettings: [] }

  _ui.tpsOptionsForm = document.getElementById('tps-config-form')
  _ui.tpsOptionsJson = document.getElementById('tps-config-json')
  _ui.trackTPSButton = document.getElementById('track-tps-button')
  _ui.toggleButton = document.getElementById('tps-side-form-toggle')
  _ui.enableTPS = document.getElementById('enable-tps')
  _ui.submitButton = _ui.tpsOptionsForm.querySelector('button[type="submit"]')

  _ui.tpsOptionsForm.addEventListener('submit', _handleSave)
  _ui.toggleButton.addEventListener('click', _handleToggle)
  _ui.trackTPSButton.addEventListener('click', _handleTrackTPS)

  _ui.enableTPS.addEventListener('change', () => {
    _tpsOptions.isEnabled = _ui.enableTPS.checked
    setItem('tpsOptions', _tpsOptions)
    _setJson(_tpsOptions)
  })

  _granularOptions = DynamicParams('tps-granular', ['partnerName', 'key', 'value'], _tpsOptions.granularOptions,
    () => {
      _tpsOptions.granularOptions = _granularOptions.query()
      _setJson(_tpsOptions)
      setItem('tpsOptions', _tpsOptions)
    })
  _granularOptions.init()

  _partnerSharingSettings = DynamicParams('tps-partner-sharing', ['partnerName', 'key', 'value'], _tpsOptions.partnerSharingSettings,
    () => {
      _tpsOptions.partnerSharingSettings = _partnerSharingSettings.query()
      _setJson(_tpsOptions)
      setItem('tpsOptions', _tpsOptions)
    })
  _partnerSharingSettings.init()

  _setJson(_tpsOptions)
}

function _trackThirdPartySharing(tpsOptions) {
  const options = new Adjust.ThirdPartySharing(tpsOptions.isEnabled)

  for (const option of tpsOptions.granularOptions) {
    options.addGranularOption(option.partnerName, option.key, option.value)
  }

  for (const option of tpsOptions.partnerSharingSettings) {
    const value = option.value === 'false' ? false : !!option.value
    options.addPartnerSharingSetting(option.partnerName, option.key,  value)
  }

  Adjust.trackThirdPartySharing(options)
}

function _handleSave(e) {
  e.preventDefault()

  if (_disabled) {
    return
  }

  _disabled = true
  _ui.submitButton.classList.add('loading')
  _ui.submitButton.disabled = true

  clearTimeout(_timeoutId)
  _timeoutId = setTimeout(() => {
    _disabled = false
    _ui.submitButton.classList.remove('loading')
    _ui.submitButton.disabled = false

    _trackThirdPartySharing(_tpsOptions)
  }, 1000)
}

function _handleTrackTPS() {
  if (_disabled) {
    return
  }

  _disabled = true
  _ui.trackTPSButton.classList.add('loading')
  _ui.trackTPSButton.disabled = true

  clearTimeout(_timeoutId)
  _timeoutId = setTimeout(() => {
    _disabled = false
    _ui.trackTPSButton.classList.remove('loading')
    _ui.trackTPSButton.disabled = false

    _trackThirdPartySharing(_tpsOptions)
  }, 1000)
}

function _handleToggle(e) {
  const target = e.target
  const sideForm = target.parentNode.nextElementSibling

  sideForm.classList.toggle('show')
  target.classList.toggle('active')
}

function _setJson(tpsOptions) {
  let text = `const options = new Adjust.ThirdPartySharingOptions(${tpsOptions.isEnabled});\n`

  for (const option of tpsOptions.granularOptions) {
    text += `option.addGranularOption('${option.partnerName}', '${option.key}', '${option.value}')\n`
  }

  for (const option of tpsOptions.partnerSharingSettings) {
    text += `option.addPartnerSharingSetting('${option.partnerName}', '${option.key}', '${option.value}')\n`
  }

  text += 'Adjust.trackThirdPartySharing(options);'

  _ui.tpsOptionsJson.textContent = text
}

export default init
