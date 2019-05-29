/* eslint-disable */

function flushPromises () {
  return new Promise(resolve => setImmediate(resolve))
}

function createMockXHR (response, status = 200, statusText = 'OK') {
  return {
    open: jest.fn(),
    send: jest.fn(),
    setRequestHeader: jest.fn(),
    readyState: 4,
    status: status,
    statusText: statusText,
    response: JSON.stringify(response),
    responseText: JSON.stringify(response)
  }
}

function randomInRange (min, max) {
  return Math.random() * (max - min) + min
}

export {
  flushPromises,
  createMockXHR,
  randomInRange
}
