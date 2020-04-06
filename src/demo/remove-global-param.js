const RemoveGlobalParam = (id, handle) => {
  const _id = id
  const _handle = handle
  let _parent = null
  const _ui = {}
  let _disabled = false
  let _timeoutId = null

  function init () {
    _parent = document.getElementById(_id)
    _ui.actionButton = _parent.querySelector('button[type="button"]')
    _ui.input = _parent.querySelector('input[type="text"]')

    _ui.actionButton.addEventListener('click', _handleRun, false)
  }

  function _handleRun () {
    const value = _ui.input.value

    if (_disabled || !value) {
      return
    }

    _disabled = true
    _ui.actionButton.classList.add('loading')
    _ui.actionButton.disabled = true

    clearTimeout(_timeoutId)
    _timeoutId = setTimeout(() => {
      _disabled = false
      _ui.actionButton.classList.remove('loading')
      _ui.actionButton.disabled = false
      _handle(value)
      _ui.input.value = ''
    }, 1000)
  }

  return init
}

export default RemoveGlobalParam
