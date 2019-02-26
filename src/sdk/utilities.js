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

export {
  buildList,
  isEmpty,
  isObject,
  isValidJson
}
