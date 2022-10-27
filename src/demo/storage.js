import Config from './config'

const _storageName = Config.namespace

let _localStorageSupported = true

function isSupported () {
  if (!_localStorageSupported) {
    return _localStorageSupported
  }

  try {
    _localStorageSupported = window.localStorage && true
  } catch (e) {
    console.log('LocalStorage is not supported')
    _localStorageSupported = false
  }

  return _localStorageSupported
}

function getItem (key, plainText) {
  if (isSupported()) {
    const value = localStorage.getItem(`${_storageName}.${key}`)
    return plainText ? value : JSON.parse(value)
  }

  return null
}

function setItem (key, value, plainText) {
  if (isSupported()) {
    if (!value) {
      localStorage.removeItem(`${_storageName}.${key}`)
    } else {
      localStorage.setItem(`${_storageName}.${key}`, plainText ? value : JSON.stringify(value))
    }
  }
}

function clear () {
  if (isSupported()) {
    localStorage.clear()
  }
}

export {
  getItem,
  setItem,
  clear
}
