const _elements = {
  sessionBtn: document.querySelector('#track-session'),
  eventBtn: document.querySelector('#track-event'),
  sessionLog: document.querySelector('#log-session'),
  eventLog: document.querySelector('#log-event'),
  attributionLog: document.querySelector('#log-attribution'),
  attributionStatus: document.querySelector('#attribution-status')
}

const _loading = {
  session: false,
  event: false
}

const _timeout = {
  session: null,
  event: null,
  attribution: null
}

function _handleClick (what, action) {

  if (_loading[what]) {
    return
  }

  _loading[what] = true

  _prepareLog(what)
  clearTimeout(_timeout[what])

  _timeout[what] = setTimeout(() => {
    action()
    _log(what)
  }, 500)

}

function _getLogContainer (what) {
  return _elements[`${what}Log`]
}

function _prepareLog (what) {

  const logContainer = _getLogContainer(what)

  logContainer.textContent = 'waiting for response, please wait...'
  logContainer.classList.add('loading')
  logContainer.classList.remove('success')
  logContainer.classList.remove('error')

}

function _log (what) {

  const logContainer = _getLogContainer(what)

  _loading[what] = false

  logContainer.textContent = `${what} has been triggered, check network console`
  logContainer.classList.add('success')
  logContainer.classList.remove('loading')

}

function start (sessionCb, eventCb) {

  _elements.sessionBtn.addEventListener('click', () => _handleClick('session', sessionCb))
  _elements.eventBtn.addEventListener('click', () => _handleClick('event', eventCb))

}

function _format (date) {
  const d = new Date(date.replace('Z', ''))
  return `${d.toLocaleDateString()} ${d.toLocaleTimeString()}`
}

function logAttribution (result) {

  const logContainer = _getLogContainer('attribution')

  logContainer.textContent = JSON.stringify(result, undefined, 2)
  logContainer.classList.add('success')
  logContainer.classList.remove('loading')

  _elements.attributionStatus.textContent = `updated at ${_format(result.timestamp)}`

}

const App = {
  start,
  logAttribution
}

Object.freeze(App)

export default App
