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

function _handleClick (what, cb) {

  if (_loading[what]) {
    return
  }

  _loading[what] = true

  _prepareLog(what)
  clearTimeout(_timeout[what])

  return _timeout[what] = setTimeout(() => {
    return cb()
      .then(result => _cb(result, 'success', what))
      .catch(error => _cb(error, 'error', what))
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

function _cb (result, type, what) {

  const logContainer = _getLogContainer(what)

  _loading[what] = false

  logContainer.textContent = JSON.stringify(result, undefined, 2)
  logContainer.classList.add(type)
  logContainer.classList.remove('loading')

}

function start (sessionCb, eventCb) {

  _elements.sessionBtn.addEventListener('click', () => _handleClick('session', sessionCb))
  _elements.eventBtn.addEventListener('click', () => _handleClick('event', eventCb))

}

function log (message) {
  console.log(message) // eslint-disable-line
}

function wait (result) {

  if (!result.ask_in) { return }

  const logContainer = _getLogContainer('attribution')

  logContainer.textContent = 'waiting...'
  logContainer.classList.remove('success')
  logContainer.classList.add('loading')

  clearTimeout(_timeout.attribution)

  _timeout.attribution = setTimeout(() => {
    try {
      JSON.parse(logContainer.textContent)
    } catch (error) {
      _elements.attributionStatus.textContent = `no change at ${_format(result.timestamp)}`
      logContainer.textContent = ''
      logContainer.classList.remove('success')
      logContainer.classList.remove('loading')
    }
  }, result.ask_in + 300)

}

function _format (date) {
  const d = new Date(date.replace(/\+0000$/, ''))
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
  log,
  wait,
  logAttribution
}

Object.freeze(App)

export default App
