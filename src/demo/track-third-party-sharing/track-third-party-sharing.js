import Adjust from '../../sdk/main'
import { getItem, setItem } from '../storage'

const _ui = {}
let _tpsOptions = {}
let _disabled = false
let _timeoutId = null

function init() {
  _tpsOptions = getItem('tpsOptions') || { isEnabled: true, granularOptions: [], partnerSharingSettings: [] }

  _ui.tpsOptionsForm = document.getElementById('tps-config-form')
  _ui.tpsOptionsJson = document.getElementById('tps-config-json')
  _ui.trackTPSButton = document.getElementById('track-tps-button')
  _ui.toggleButton = document.getElementById('tps-side-form-toggle')
  _ui.enableTPS = document.getElementById('enable-tps')
  _ui.submitButton = _ui.tpsOptionsForm.querySelector('button[type="submit"]')

  _ui.tpsOptionsForm.addEventListener('submit', _handleSave, false)
  _ui.toggleButton.addEventListener('click', _handleToggle, false)
  _ui.trackTPSButton.addEventListener('click', _handleTrackTPS, false)

  _ui.enableTPS.addEventListener('change', () => {
    _tpsOptions.isEnabled = _ui.enableTPS.checked
    setItem('tpsOptions', _tpsOptions)
    _setJson(_tpsOptions)
  })

  _initGranularOptions()
  _initpartnerSharingSettings()

  _setJson(_tpsOptions)
}

function _createOptionsMarkup(idPrefix, option, onRemoveClick, onValueChange, ) {
  const wrapper = document.createElement('div')
  wrapper.id = idPrefix
  wrapper.className = 'flex-box-row'
  wrapper.style.justifyContent = 'space-between'
  wrapper.style.alignItems = 'center'
  wrapper.style.gap = '3px'

  const partner = document.createElement('div')
  partner.className = 'form-row'
  const partnerLabel = document.createElement('label')
  partnerLabel.for = `${idPrefix}-partner`
  partnerLabel.innerText = 'Partner'
  const partnerInput = document.createElement('input')
  partnerInput.id = `${idPrefix}-partner`
  partnerInput.value = option ? option.partnerName : ''
  partner.append(partnerLabel, partnerInput)
  wrapper.append(partner)

  const key = document.createElement('div')
  key.className = 'form-row'
  const keyLabel = document.createElement('label')
  keyLabel.for = `${idPrefix}-key`
  keyLabel.innerText = 'Key'
  const keyInput = document.createElement('input')
  keyInput.id = `${idPrefix}-key`
  keyInput.value = option ? option.key : ''
  key.append(keyLabel, keyInput)
  wrapper.append(key)

  const value = document.createElement('div')
  value.className = 'form-row'
  const valueLabel = document.createElement('label')
  valueLabel.for = `${idPrefix}-value`
  valueLabel.innerText = 'Value'
  const valueInput = document.createElement('input')
  valueInput.id = `${idPrefix}-value`
  valueInput.value = option ? option.value : ''
  valueInput.addEventListener('change', onValueChange)
  value.append(valueLabel, valueInput)
  wrapper.append(value)

  const removeButton = document.createElement('button')
  removeButton.id = `${idPrefix}-remove`
  removeButton.innerText = '-'
  removeButton.addEventListener('click', (e) => { onRemoveClick(e); wrapper.remove(); })
  wrapper.append(removeButton)

  return wrapper
}

function _createOption(type, index, option) {
  const idPrefix = `tps-${type}-${index}`

  const onValueChange = (e) => {
    if (type === 'granular') {
      return
    }

    if (e.target.value !== 'false') {
      e.target.value = + e.target.value ? 'true' : 'false'
    }
  }

  const onRemove = (e) => {
    e.preventDefault()

    if (!option) {
      return
    }

    const predicate = i => !(i.partnerName === option.partnerName && i.key === option.key)
    if (type === 'granular') {
      _tpsOptions.granularOptions = _tpsOptions.granularOptions.filter(predicate)
    } else {
      _tpsOptions.partnerSharingSettings = _tpsOptions.partnerSharingSettings.filter(predicate)
    }
    _setJson(_tpsOptions)
    setItem('tpsOptions', _tpsOptions)
  }

  return _createOptionsMarkup(idPrefix, option, onRemove, onValueChange)
}

function _initGranularOptions() {
  const root = _ui.tpsOptionsForm.querySelector('#tps-granular')
  const addButton = _ui.tpsOptionsForm.querySelector('#tps-granular-add')

  const lastIndex = _tpsOptions.granularOptions.length
  if (_tpsOptions.granularOptions.length > 0) {
    for (let i = 0; i < _tpsOptions.granularOptions.length; i++) {
      root.insertBefore(_createOption('granular', i, _tpsOptions.granularOptions[i]), addButton)
    }
  }
  root.insertBefore(_createOption('granular', lastIndex), addButton)

  addButton.addEventListener('click', (e) => {
    e.preventDefault()

    const childrenDivs = Array.from(root.children).filter(i => i.nodeName === 'DIV');
    const lastOption = childrenDivs[childrenDivs.length - 1]
    const fields = lastOption.getElementsByTagName('input')

    // do nothing if any of properties has no value
    if (fields[0].value === '' || fields[1].value === '' || fields[2].value === '') {
      return;
    }

    _tpsOptions.granularOptions.push({partnerName: fields[0].value, key: fields[1].value, value: fields[2].value })

    _setJson(_tpsOptions)
    setItem('tpsOptions', _tpsOptions)

    const lastIndex = +lastOption.id.substring('tps-granular-'.length)
    root.insertBefore(_createOption('granular', lastIndex + 1), addButton)
  })
}

function _initpartnerSharingSettings() {
  const root = _ui.tpsOptionsForm.querySelector('#tps-partner-sharing')
  const addButton = _ui.tpsOptionsForm.querySelector('#tps-partner-sharing-add')

  const lastIndex = _tpsOptions.partnerSharingSettings.length
  if (_tpsOptions.partnerSharingSettings.length > 0) {
    for (let i = 0; i < _tpsOptions.partnerSharingSettings.length; i++) {
      root.insertBefore(_createOption('partner-sharing', i, _tpsOptions.partnerSharingSettings[i]), addButton)
    }
  }
  root.insertBefore(_createOption('partner-sharing', lastIndex), addButton)

  addButton.addEventListener('click', (e) => {
    e.preventDefault()

    const childrenDivs = Array.from(root.children).filter(i => i.nodeName === 'DIV');
    const lastOption = childrenDivs[childrenDivs.length - 1]
    const fields = lastOption.getElementsByTagName('input')

    // do nothing if any of properties has no value
    if (fields[0].value === '' || fields[1].value === '' || fields[2].value === '') {
      return;
    }

    _tpsOptions.partnerSharingSettings.push({partnerName: fields[0].value, key: fields[1].value, value: fields[2].value })

    _setJson(_tpsOptions)
    setItem('tpsOptions', _tpsOptions)

    const lastIndex = +lastOption.id.substring('tps-partner-sharing-'.length)
    root.insertBefore(_createOption('partner-sharing', lastIndex + 1), addButton)
  })
}

function trackThirdPartySharing(tpsOptions) {
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

    trackThirdPartySharing(_tpsOptions)
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

    trackThirdPartySharing(_tpsOptions)
  }, 1000)
}

function _handleToggle(e) {
  const target = e.target
  const sideForm = target.parentNode.nextElementSibling

  sideForm.classList.toggle('show')
  target.classList.toggle('active')
}

function _setJson(tpsOptions) {
  let text = `const options = new ThirdPartySharingOptions(${tpsOptions.isEnabled});\n`

  for (const option of tpsOptions.granularOptions) {
    text += `option.addGranularOption('${option.partnerName}', '${option.key}', '${option.value}')\n`
  }

  for (const option of tpsOptions.partnerSharingSettings) {
    text += `option.addPartnerSharingSetting('${option.partnerName}', '${option.key}', '${option.value}')\n`
  }

  text += 'Adjust.trackThirdPartySharing(options);'

  console.log(text)

  _ui.tpsOptionsJson.textContent = text
}

export default init
