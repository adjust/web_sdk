/**
 * Build human readable list
 *
 * @param {Array} array
 * @returns {String}
 */
function buildList (array) {
  if (!array.length) {
    return ''
  }

  if (array.length === 1) {
    return array[0]
  }

  const lastIndex = array.length - 1
  const firstPart = array.slice(0, lastIndex).join(', ')

  return `${firstPart} and ${array[lastIndex]}`
}

/**
 * Check if object is empty
 *
 * @param {Object} obj
 * @returns {boolean}
 */
function isEmpty (obj) {
  return !Object.keys(obj).length && obj.constructor === Object
}

/**
 * Check if value is object
 *
 * @param {Object} obj
 * @returns {boolean}
 */
function isObject (obj) {
  return typeof obj === 'object' && obj !== null && !(obj instanceof Array)
}

/**
 * Check if string is valid json
 *
 * @param {string} string
 * @returns {boolean}
 * @private
 */
function isValidJson (string) {
  try {
    const json = JSON.parse(string)
    return isObject(json)
  } catch (e) {
    return false
  }
}

/**
 * Bind event to an element
 *
 * @param {Window|Document} element
 * @param {string} eventName
 * @param {Function} func
 */
function on (element, eventName, func) {
  if (element.addEventListener) {
    element.addEventListener(eventName, func, false)
  } else if (element.attachEvent)  {
    element.attachEvent(`on${eventName}`, func)
  }
}

/**
 * Unbind event off an element
 *
 * @param {Window|Document} element
 * @param {string} eventName
 * @param {Function} func
 */
function off (element, eventName, func) {
  if (element.removeEventListener) {
    element.removeEventListener(eventName, func, false)
  } else if (element.detachEvent)  {
    element.detachEvent(`on${eventName}`, func)
  }
}

/**
 * Get Page Visibility API attributes that can be accessed depending on the browser implementation
 *
 * @returns {{hidden: string, visibilityChange: string}|null}
 * @private
 */
function getVisibilityApiAccess () {

  if (typeof document.hidden !== 'undefined') {
    return {
      hidden: 'hidden',
      visibilityChange: 'visibilitychange'
    }
  }

  const prefixes = ['moz', 'ms', 'o', 'webkit']

  for (let i = 0; i <= prefixes.length; i += 1) {
    if (typeof document[`${prefixes[i]}Hidden`] !== 'undefined') {
      return {
        hidden: `${prefixes[i]}Hidden`,
        visibilityChange: `${prefixes[i]}visibilitychange`
      }
    }
  }

  return null
}

/**
 * Find index of an element in the list and return it
 *
 * @param {Array} array
 * @param {string|Array} key
 * @param {*} value
 * @returns {Number}
 */
function findIndex (array, key, value) {

  function isEqual (item) {
    return (key instanceof Array)
      ? key.every(k => item[k] === value[k])
      : (item[key] === value)
  }

  for (let i = 0; i < array.length; i += 1) {
    if (isEqual(array[i])) {
      return i
    }
  }

  return -1
}

/**
 * Wraps the Object.assign method which is later replaced with polyfill for IE
 *
 * @param {Object} args
 * @returns {Object}
 */
function extend (...args) {
  return Object.assign(...args)
}

/**
 * Convert array with key/value item structure into key/value pairs object
 *
 * @param {Array} array
 * @return {Array} array
 */
function convertToMap (array = []) {
  return array.reduce((acc, o) => extend(acc, {[o.key]: o.value}), {})
}

/**
 * Find intersecting values of provided array against given values
 *
 * @param {Array} array
 * @param {Array} values
 * @returns {Array}
 */
function intersection (array = [], values = []) {
  return array.filter(item => values.indexOf(item) !== -1)
}

/**
 * Check if particular url is a certain request
 *
 * @param {string} url
 * @param {string} requestName
 * @returns {boolean}
 */
function isRequest (url, requestName) {
  const regex = new RegExp(`\\/${requestName}(\\/.*|\\?.*){0,1}$`)
  return regex.test(url)
}

/**
 * Extract the host name for the url
 *
 * @param url
 * @returns {string}
 */
function getHostName (url = '') {
  return url.replace(/^(http(s)*:\/\/)*(www\.)*/, '').split('/')[0].split('?')[0]
}

/**
 * Transform array entry into object key:value pair entry
 *
 * @param {Object} acc
 * @param {string} key
 * @param {string} value
 * @returns {Object}
 */
function reducer (acc, [key, value]) {
  return extend(acc, {[key]: value})
}

export {
  buildList,
  isEmpty,
  isObject,
  isValidJson,
  getVisibilityApiAccess,
  on,
  off,
  findIndex,
  extend,
  convertToMap,
  intersection,
  isRequest,
  getHostName,
  reducer
}
