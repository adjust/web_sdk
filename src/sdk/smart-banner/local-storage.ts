import { parseJson } from './utilities'
const _storageName = 'adjust-smart-banner'

function getItem(key: string): any | null {
  const value = localStorage.getItem(`${_storageName}.${key}`)
  return parseJson(value)
}

function setItem(key: string, value: any) {
  if (!value) {
    localStorage.removeItem(`${_storageName}.${key}`)
  } else {
    localStorage.setItem(`${_storageName}.${key}`, JSON.stringify(value))
  }
}

export const storage = {
  getItem,
  setItem
}
