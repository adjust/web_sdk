import Config from './config'

const _storageName = Config.namespace

function getItem (key, plainText) {
  const value = localStorage.getItem(`${_storageName}.${key}`)
  return plainText ? value : JSON.parse(value)
}

function setItem (key, value, plainText) {
  if (!value) {
    localStorage.removeItem(`${_storageName}.${key}`)
  } else {
    localStorage.setItem(`${_storageName}.${key}`, plainText ? value : JSON.stringify(value))
  }
}

function clear () {
  localStorage.clear()
}

export {
  getItem,
  setItem,
  clear
}
