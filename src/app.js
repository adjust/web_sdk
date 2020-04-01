const _actions = document.querySelectorAll('.action')
const _loading = {}
const _timeout = {}

function _handleClick (what, action) {
  if (_loading[what]) {
    return
  }

  _loading[what] = true

  _wait(what, action)
}

function _getLogContainer (what) {
  return document.querySelector(`#${what}-log`)
}

function _wait (what, action) {

  const logContainer = _getLogContainer(what)

  logContainer.textContent = 'please wait...'
  logContainer.classList.add('loading')

  clearTimeout(_timeout[what])

  _timeout[what] = setTimeout(() => {
    action()
    _log(what)
  }, 500)

}

function _log (what) {

  const logContainer = _getLogContainer(what)

  _loading[what] = false

  logContainer.textContent = 'done'
  logContainer.classList.remove('loading')

  clearTimeout(_timeout[what])
  _timeout[what] = setTimeout(() => {
    logContainer.textContent = ''
  }, 2000)

}

function start (callbacks) {
  _actions.forEach(btn => {
    btn.addEventListener('click', () => _handleClick(btn.id, callbacks[btn.id]))
  })
}

const App = {
  start
}

export default App
