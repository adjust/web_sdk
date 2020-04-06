import Adjust from '../sdk/main'
import KeyValueParams from './key-value-params/key-value-params'

const AddGlobalParams = (id, handleName) => {
  const _id = id
  const _handleName = handleName
  let _parent = null
  const _ui = {}
  let _disabled = false
  let _timeoutId = null
  let _params = null

  function init () {
    _parent = document.getElementById(_id)
    _ui.actionButton = _parent.querySelector('button[type="button"]')
    _ui.submitButton = _parent.querySelector('button[type="submit"]')
    _ui.form = _parent.querySelector('form')
    _ui.json = _parent.querySelector('pre.config')

    _ui.actionButton.addEventListener('click', _handleToggle, false)
    _ui.form.addEventListener('submit', _handleRun, false)

    _params = KeyValueParams(`${_id}-params`, [], _handleChange)
    _params.init()
  }

  function _handleRun (e) {
    e.preventDefault()

    const params = _params.query()

    if (_disabled || !params.length) {
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
      Adjust[_handleName](params)

      _handleToggle()
      _params.reset()
      _handleChange()
    }, 1000)
  }

  function _handleToggle () {
    _ui.actionButton.nextElementSibling.classList.toggle('show')
    _ui.actionButton.classList.toggle('active')
  }

  function _handleChange () {
    _ui.json.textContent = `Adjust.${_handleName}(${JSON.stringify(_params.query(), undefined, 2)})`
  }

  return init
}

export default AddGlobalParams
