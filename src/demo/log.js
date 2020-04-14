import Config from './config'
import {setItem, getItem} from './storage'

const _logDivider = '\n---------------------- new ----------------------' + '\n\n'
let _logContainer = null
let _intervalId

function init () {
  _logContainer = document.getElementById('log')

  _prepare()
}

function _prepare () {
  clearInterval(_intervalId)
  _intervalId = setInterval(() => _persist(), 2000)

  const content = getItem('log', true)

  if (!content) {
    return
  }

  _logContainer.textContent = [
    getItem('log', true),
    _logDivider,
    _logContainer.textContent
  ].join('')
  _logContainer.scrollTop = _logContainer.scrollHeight

}

function _persist () {
  const divider = '\n'
  const rows = _logContainer.innerText.split(divider)
  const final = divider + rows.slice(Math.max(rows.length - 3000, 1)).join(divider)

  setItem('log', final.replace(new RegExp(_logDivider, 'g'), ''), true)
}

function write (entry) {
  const now = (new Date()).toISOString()

  _logContainer.textContent += [`[${Config.namespace}]`, now, entry].join(' ') + '\n'
  _logContainer.scrollTop = _logContainer.scrollHeight

  _persist()
}

export {
  init,
  write
}
