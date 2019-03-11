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
  return typeof obj === 'object' && obj !== null
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
    return (typeof json === 'object')
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
      hidden: __ADJUST__IS_TEST ? 'testHidden' : 'hidden',
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

export {
  buildList,
  isEmpty,
  isObject,
  isValidJson,
  getVisibilityApiAccess,
  on,
  off
}
