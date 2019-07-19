const _namespace = 'my-app'
const _logContainer = document.querySelector('#log')
const _logDivider = '\n------------------ fresh log ------------------' + '\n\n'
const _actions = document.querySelectorAll('.action')
const _loading = {}
const _timeout = {}
let _intervalId

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

function _prepareLog () {

  clearInterval(_intervalId)
  _intervalId = setInterval(() => {
    _updateStorage()
  }, 1000)

  const content = localStorage.getItem(`${_namespace}.log`)

  if (!content) {
    return
  }
  _logContainer.textContent = [
    localStorage.getItem(`${_namespace}.log`),
    _logDivider,
    _logContainer.textContent
  ].join('')
  _logContainer.scrollTop = _logContainer.scrollHeight

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

function _updateStorage () {
  const divider = '[adjust-sdk] '
  const rows = _logContainer.innerText.split(divider)
  const final = divider + rows.slice(Math.max(rows.length - 3000, 1)).join(divider)

  localStorage.setItem(`${_namespace}.log`, final.replace(new RegExp(_logDivider, 'g'), ''))
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

  _prepareLog()

  _actions.forEach(btn => {
    btn.addEventListener('click', () => _handleClick(btn.id, callbacks[btn.id]))
  })
}

function logAttribution (result) {
  _logContainer.textContent += [`[${_namespace}]`, 'ATTRIBUTION', JSON.stringify(result, undefined, 2)].join(' ') + '\n'
  _logContainer.scrollTop = _logContainer.scrollHeight
  _logContainer.classList.remove('loading')

}

const App = {
  start,
  logAttribution
}

export default App
