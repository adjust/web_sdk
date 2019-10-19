// @flow
import {MINUTE, HOUR, DAY} from './constants'

export type StrategyT = 'long' | 'short' | 'test'

/**
 * Options for the back-off strategy for different environments
 *
 * @type {Object}
 */
const _options = {
  long: {
    delay: 2 * MINUTE,
    maxDelay: DAY,
    minRange: 0.5,
    maxRange: 1.0,
  },
  short: {
    delay: 200,
    maxDelay: HOUR,
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
 * @param {string} strategy
 * @returns {number}
 */
export default function backOff (attempts: number, strategy: ?StrategyT): number {
  strategy = strategy || 'long'

  const options = process.env.NODE_ENV === 'test' ? _options.test : _options[strategy]
  let delay = options.delay * Math.pow(2, attempts - 1)

  delay = Math.min(delay, options.maxDelay)

  if (options.minRange && options.maxRange) {
    delay = delay * _randomInRange(options.minRange, options.maxRange)
  }

  return Math.round(delay)
}
