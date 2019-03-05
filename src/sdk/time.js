import Constants from './constants'

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
 * @param {Date=} d
 * @returns {string}
 */
function getTimestamp (d) {
  d = d || new Date()

  const date = _getDate(d)
  const time = _getTime(d)
  const timezone = _getTimezone(d)

  return `${date}T${time}Z${timezone}`
}

/**
 * Extract timestamp from the date
 *
 * @param {string|number} d
 * @returns {number}
 * @private
 */
function _extractTimestamp (d) {

  const date = /Z/.test(d) ? d.replace('Z', '') : d

  return new Date(date).getTime()
}

/**
 * Calculate time passed between two days (in provided unit, default in days)
 *
 * @param {string|number} d1
 * @param {string|number} d2
 * @param {string} [unit='day']
 * @returns {number}
 */
function timePassed (d1, d2, unit = 'day') {

  if (!d1 || !d2) {
    return 0
  }

  const date1 = _extractTimestamp(d1)
  const date2 = _extractTimestamp(d2)
  const divider = Constants[unit] || Constants.day
  const diff = Math.abs(date2 - date1)

  return diff / divider
}

export {
  getTimestamp,
  timePassed
}
