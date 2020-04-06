const SimpleAction = (id, handle) => {
  const _id = id
  const _handle = handle
  let _parent = null
  let _button = null
  let _disabled = false
  let _timeoutId = null

  function init () {
    _parent = document.getElementById(_id)
    _button = _parent.querySelector('button[type="button"]')

    _button.addEventListener('click', _handleRun, false)
  }

  function _handleRun () {
    if (_disabled) {
      return
    }

    _disabled = true
    _button.classList.add('loading')
    _button.disabled = true

    clearTimeout(_timeoutId)
    _timeoutId = setTimeout(() => {
      _disabled = false
      _button.classList.remove('loading')
      _button.disabled = false
      _handle()
    }, 1000)
  }

  return init
}

export default SimpleAction
