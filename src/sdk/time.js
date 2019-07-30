/**
 * Prepend zero to be used in certain format
 *
 * @param {number} value
 * @param {number} power
 * @returns {string}
 * @private
 */
function _prependZero (value, power = 1) {

  let formatted = value + ''

  for (let i = 1; i <= power; i += 1) {
    if (value < Math.pow(10, i)) {
      formatted = `0${formatted}`
    }
  }

  return formatted
}

/**
 * Get formatted date (YYYY-MM-DD)
 * @param date
 * @returns {string}
 * @private
 */
function _getDate (date) {

  const day = _prependZero(date.getDate())
  const month = _prependZero(date.getMonth() + 1)
  const year = date.getFullYear()

  return [year, month, day].join('-')
}

/**
 * Get formatted hours, minutes, seconds and milliseconds (HH:mm:ss.SSS)
 *
 * @param {Date} date
 * @returns {string}
 * @private
 */
function _getTime (date) {

  const hours = _prependZero(date.getHours(), 1)
  const minutes = _prependZero(date.getMinutes())
  const seconds = _prependZero(date.getSeconds())
  const milliseconds = _prependZero(date.getMilliseconds(), 2)

  return [hours, minutes, seconds].join(':') + '.' + milliseconds
}

/**
 * Get formatted timezone (ZZ)
 *
 * @param {Date} date
 * @returns {string}
 * @private
 */
function _getTimezone (date) {

  const offsetInMinutes = date.getTimezoneOffset()
  const hoursOffset = _prependZero(Math.floor(Math.abs(offsetInMinutes) / 60))
  const minutesOffset = _prependZero(Math.abs(offsetInMinutes) % 60)
  const sign = offsetInMinutes > 0 ? '-' : '+'

  return sign + hoursOffset + minutesOffset
}

/**
 * Get the timestamp in the backend format
 *
 * @param {number=} timestamp
 * @returns {string}
 */
function getTimestamp (timestamp) {

  const d = timestamp ? new Date(timestamp) : new Date()
  const date = _getDate(d)
  const time = _getTime(d)
  const timezone = _getTimezone(d)

  return `${date}T${time}Z${timezone}`
}

/**
 * Calculate time passed between two dates in milliseconds
 *
 * @param {number} d1
 * @param {number} d2
 * @returns {number}
 */
function timePassed (d1, d2) {

  if (isNaN(d1) || isNaN(d2)) {
    return 0
  }

  return Math.abs(d2 - d1)
}

export {
  getTimestamp,
  timePassed
}
