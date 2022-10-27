/**
 * Build human readable list
 */
function buildList(array: Array<unknown>): string {
  if (!array.length) {
    return ''
  }

  if (array.length === 1) {
    return `${array[0]}`
  }

  const lastIndex = array.length - 1
  const firstPart = array.slice(0, lastIndex).join(', ')

  return `${firstPart} and ${array[lastIndex]}`
}

/**
 * Check if object is empty
 */
function isEmpty(obj: Record<string, unknown>): boolean {
  return !Object.keys(obj).length && obj.constructor === Object
}

/**
 * Check if value is object
 */
function isObject(obj: any): boolean { // eslint-disable-line @typescript-eslint/no-explicit-any
  return typeof obj === 'object' && obj !== null && !(obj instanceof Array)
}

/**
 * Check if string is valid json
 */
function isValidJson(string: string): boolean {
  try {
    const json = JSON.parse(string)
    return isObject(json)
  } catch (e) {
    return false
  }
}

/**
 * Find index of an element in the list and return it
 */
function findIndex<K extends string, T extends Record<K, unknown>>(array: Array<T>, key: K | Array<K>, target: T): number {

  function isEqual(item: T) {
    return (Array.isArray(key))
      ? key.every(k => item[k] === target[k])
      : (item[key] === target)
  }

  for (let i = 0; i < array.length; i += 1) {
    if (isEqual(array[i])) {
      return i
    }
  }

  return -1
}

/**
 * Convert array with key/value item structure into key/value pairs object
 */
function convertToMap<T>(array: Array<{ key: string, value: T }> = []): Record<string, T> {
  return array.reduce((acc, o) => ({ ...acc, [o.key]: o.value }), {})
}

/**
 * Find intersecting values of provided array against given values
 */
function intersection<T>(array: Array<T> = [], values: Array<T> = []): Array<T> {
  return array.filter(item => values.indexOf(item) !== -1)
}

/**
 * Check if particular url is a certain request
 */
function isRequest(url: string, requestName: string): boolean {
  const regex = new RegExp(`\\/${requestName}(\\/.*|\\?.*){0,1}$`)
  return regex.test(url)
}

/**
 * Extract the host name for the url
 */
function getHostName(url = ''): string {
  return url.replace(/^(http(s)*:\/\/)*(www\.)*/, '').split('/')[0].split('?')[0]
}

/**
 * Transform array entry into object key:value pair entry
 */
function reducer<K extends string, T>(acc: Record<K, T>, [key, value]: [K, T]): Record<K, T> {
  return { ...acc, [key]: value }
}

/**
 * Extracts object entries in the [key, value] format
 */
function entries<K extends string, T>(object: Record<K, T>): Array<[K, T]> {
  return Object.keys(object).map((key: K) => [key, object[key]])
}

/**
 * Extracts object values
 */
function values<T>(object: Record<string, T>): Array<T> {
  return Object.keys(object).map((key: string) => object[key])
}

/**
 * Check if value is empty in any way (empty object, false value, zero) and use it as predicate method
 */
function isEmptyEntry(value: any): boolean { // eslint-disable-line @typescript-eslint/no-explicit-any
  if (isObject(value)) {
    return !isEmpty(value)
  }

  return !!value || (value === 0)
}

function isLocalStorageSupported(): boolean {
  try {
    const uid = (new Date).toString()
    const storage = window.localStorage
    storage.setItem(uid, uid)
    const result = storage.getItem(uid) === uid
    storage.removeItem(uid)
    const support = !!(result && storage)

    return support

  } catch (e) {
    return false
  }
}

export {
  buildList,
  isEmpty,
  isObject,
  isValidJson,
  findIndex,
  convertToMap,
  intersection,
  isRequest,
  getHostName,
  reducer,
  entries,
  values,
  isEmptyEntry,
  isLocalStorageSupported
}
