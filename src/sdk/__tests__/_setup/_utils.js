import { setImmediate } from 'timers'

function flushPromises () {
  return new Promise(resolve => setImmediate(resolve))
}

function createMockXHR (response, readyState = 4, status = 200, statusText = 'OK') {
  return {
    open: jest.fn(),
    send: jest.fn(),
    setRequestHeader: jest.fn(),
    readyState: readyState,
    status: status,
    statusText: statusText,
    response: JSON.stringify(response),
    responseText: JSON.stringify(response)
  }
}

function randomInRange (min, max) {
  return Math.random() * (max - min) + min
}

function setDocumentProp (prop, value) {
  Object.defineProperty(global.document, prop, {
    writable: true,
    value
  })
}

function setGlobalProp (o, prop) {
  Object.defineProperty(o, prop, {
    configurable: true,
    get () { return undefined },
    set (v) { v }
  })
}

function errorResponse (code) {
  return {
    status: 'error',
    message: 'An error',
    response: 'An error',
    action: 'RETRY',
    code: code || 'ERROR'
  }
}

function mockDate (date) {
  global.Date = class extends global.Date {
    constructor () {
      super()
      return date
    }
  }
}

global.Utils = {
  flushPromises,
  createMockXHR,
  randomInRange,
  setDocumentProp,
  setGlobalProp,
  errorResponse,
  mockDate
}
