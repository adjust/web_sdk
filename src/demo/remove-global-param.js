import Adjust from '../sdk/main'
import {debounce} from './utils'

const RemoveGlobalParam = (id, handleName) => {
  const _id = id
  const _handleName = handleName
  let _parent = null
  const _ui = {}
  let _disabled = false
  let _timeoutId = null

  function init () {
    _parent = document.getElementById(_id)
    _ui.actionButton = _parent.querySelector('button[type="button"]')
    _ui.submitButton = _parent.querySelector('button[type="submit"]')
    _ui.input = _parent.querySelector(`input#${_id}-input`)
    _ui.form = _parent.querySelector('form')
    _ui.json = _parent.querySelector('pre.config')

    _ui.actionButton.addEventListener('click', _handleToggle, false)
    _ui.input.addEventListener('keydown', debounce(_handleChange, 200),false)
    _ui.form.addEventListener('submit', _handleRun, false)
  }

  function _handleRun (e) {
    e.preventDefault()

    const value = _ui.input.value

    if (_disabled || !value) {
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
      Adjust[_handleName](value)

      _handleToggle()
      _ui.input.value = ''
      _handleChange()
    }, 1000)
  }

  function _handleToggle () {
    _ui.actionButton.nextElementSibling.classList.toggle('show')
    _ui.actionButton.classList.toggle('active')
  }

  function _handleChange (e = {target: {value: ''}}) {
    _ui.json.textContent = `Adjust.${_handleName}(${e.target.value})`
  }

  return init
}

export default RemoveGlobalParam
