const _storageName = 'adjust-smart-banner'

function getItem(key: string) {
  const value = localStorage.getItem(`${_storageName}.${key}`)
  return value ? JSON.parse(value) : null
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
