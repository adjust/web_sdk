import KeyValueParams from '../key-value-params/key-value-params'

const AddGlobalParams = (id, addHandle) => {
  const _id = id
  let _parent = null
  const _ui = {}
  let _disabled = false
  let _timeoutId = null
  let _params = null

  function init () {
    _parent = document.getElementById(_id)
    _ui.configForm = _parent.querySelector('form')
    _ui.actionButton = _parent.querySelector('button[type="button"]')
    _ui.submitButton = _ui.configForm.querySelector('button[type="submit"]')

    _ui.configForm.addEventListener('submit', _handleRun, false)
    _ui.actionButton.addEventListener('click', _handleToggle, false)

    _params = KeyValueParams(`${_id}-params`)
    _params.init()
  }

  function _handleRun (e) {
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
      addHandle(_params.query())

      _handleToggle()
      _params.reset()
    }, 1000)
  }

  function _handleToggle () {
    _ui.configForm.classList.toggle('show')
    _ui.actionButton.classList.toggle('active')
  }

  return init
}

export default AddGlobalParams
