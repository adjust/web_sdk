import {__delete} from '../sdk/storage/indexeddb'
import Config from './config'
import {write} from './log'

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
  return __delete()
    .catch(error => {
      write('There was an error while attempting to delete the storage, please refresh')
      throw error
    })
}

export {
  getItem,
  setItem,
  clear
}
