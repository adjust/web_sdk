const _storageName = 'adjust-smart-banner'

function getItem(key: string): any | null {
  let value = localStorage.getItem(`${_storageName}.${key}`)

  if (!value) {
    return null
  }

  try {
    value = JSON.parse(value)
  } catch (error) {
    value = null
  }

  return value
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
