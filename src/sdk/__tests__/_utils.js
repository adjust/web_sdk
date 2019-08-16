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
    set (v) { return v }
  })
}

function errorResponse () {
  return {response: {message: 'An error', code: 'RETRY'}}
}

global.Utils = {
  flushPromises,
  createMockXHR,
  randomInRange,
  setDocumentProp,
  setGlobalProp,
  errorResponse
}
