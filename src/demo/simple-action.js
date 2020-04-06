const SimpleAction = (id, handle) => {
  const _id = id
  const _handle = handle
  let _parent = null
  const _ui = {}
  let _disabled = false
  let _timeoutId = null

  function init () {
    _parent = document.getElementById(_id)
    _ui.actionButton = _parent.querySelector('button[type="button"].action')
    _ui.toggleButton = _parent.querySelector('button[type="button"].toggle')

    _ui.actionButton.addEventListener('click', _handleRun, false)
    _ui.toggleButton.addEventListener('click', _handleToggle, false)
  }

  function _handleRun () {
    if (_disabled) {
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
      _handle()
    }, 1000)
  }

  function _handleToggle () {
    _ui.toggleButton.parentNode.nextElementSibling.classList.toggle('show')
    _ui.toggleButton.classList.toggle('active')
  }

  return init
}

export default SimpleAction
