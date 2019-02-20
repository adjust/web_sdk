const _elements = {
  sessionBtn: document.querySelector('#track-session'),
  eventBtn: document.querySelector('#track-event'),
  sessionLog: document.querySelector('#log-session'),
  eventLog: document.querySelector('#log-event')
}

const _loading = {
  session: false,
  event: false
}

const _timeout = {
  session: null,
  event: null
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
  logContainer.classList.remove('success')
  logContainer.classList.remove('error')

}

function _cb (result, type, what) {

  const logContainer = _getLogContainer(what)

  _loading[what] = false

  logContainer.textContent = JSON.stringify(result, undefined, 2)
  logContainer.classList.add(type)

}

function start (sessionCb, eventCb) {

  _elements.sessionBtn.addEventListener('click', () => _handleClick('session', sessionCb))
  _elements.eventBtn.addEventListener('click', () => _handleClick('event', eventCb))

}

function log (message) {
  console.log(message) // eslint-disable-line
}

const App = {
  start,
  log
}

Object.freeze(App)

export default App
