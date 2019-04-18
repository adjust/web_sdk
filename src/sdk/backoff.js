import Constants from './constants'

/**
 * Options for the back-off strategy for different environments
 *
 * @type {Object}
 */
const _options = {
  long: {
    delay: 2 * Constants.minute,
    maxDelay: Constants.day,
    minRange: 0.5,
    maxRange: 1.0,
  },
  short: {
    delay: 200,
    maxDelay: Constants.hour,
    minRange: 0.5,
    maxRange: 1.0,
  },
  test: {
    delay: 100,
    maxDelay: 300
  }
}

/**
 * Get random number in provided range
 *
 * @param {number} min
 * @param {number} max
 * @returns {number}
 * @private
 */
function _randomInRange (min, max) {
  return Math.random() * (max - min) + min
}

/**
 * Calculate exponential back-off with optional jitter factor applied
 *
 * @param {number} attempts
 * @param {string} [strategy='long']
 * @returns {number}
 */
export default function backOff (attempts, strategy = 'long') {

  let options = __ADJUST__ENV === 'test' ? _options.test : _options[strategy]
  let delay = options.delay * Math.pow(2, attempts - 1)

  delay = Math.min(delay, options.maxDelay)

  if (options.minRange && options.maxRange) {
    delay = delay * _randomInRange(options.minRange, options.maxRange)
  }

  return Math.round(delay)
}
