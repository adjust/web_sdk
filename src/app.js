const _elements = {
  eventBtn: document.querySelector('#event-btn'),
  eventLog: document.querySelector('#log-event'),
  revenueEventBtn: document.querySelector('#revenue-event-btn'),
  revenueEventInput: document.querySelector('#revenue-event-input'),
  revenueEventLog: document.querySelector('#log-revenue-event'),
  attributionLog: document.querySelector('#log-attribution'),
  attributionStatus: document.querySelector('#attribution-status'),
  disableBtn: document.querySelector('#disable-btn'),
  enableBtn: document.querySelector('#enable-btn'),
  gdprBtn: document.querySelector('#gdpr-btn'),
}

const _loading = {
  session: false,
  event: false,
  revenueEvent: false
}

const _timeout = {
  session: null,
  event: null,
  revenueEvent: null,
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

  logContainer.textContent = 'triggered! check network console'
  logContainer.classList.add('success')
  logContainer.classList.remove('loading')

}

function start ({eventCb, revenueEventCb, disableCb, enableCb, gdprForgetMeCb}) {

  _elements.eventBtn.addEventListener('click', () => _handleClick('event', eventCb))
  _elements.revenueEventBtn.addEventListener('click', () => _handleClick('revenueEvent', () => revenueEventCb(_elements.revenueEventInput.value)))

  _elements.disableBtn.addEventListener('click', disableCb)
  _elements.enableBtn.addEventListener('click', enableCb)
  _elements.gdprBtn.addEventListener('click', gdprForgetMeCb)

}

function _formatDate () {
  const d = new Date()
  return `${d.toLocaleDateString()} ${d.toLocaleTimeString()}`
}

function logAttribution (result) {

  const logContainer = _getLogContainer('attribution')

  logContainer.textContent = JSON.stringify(result, undefined, 2)
  logContainer.classList.add('success')
  logContainer.classList.remove('loading')

  _elements.attributionStatus.textContent = `updated at ${_formatDate()}`

}

const App = {
  start,
  logAttribution
}

export default App
