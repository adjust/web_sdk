import Config from './config'

const LEVEL_NONE = 'none'
const LEVEL_ERROR = 'error'
const LEVEL_INFO = 'info'
const LEVEL_VERBOSE = 'verbose'

/**
 * Logger levels
 * - none -> nothing is printed to the console
 * - error -> prints only error
 * - info -> prints info and error
 * - verbose -> prints log, info and error
 *
 * @type {Object}
 * @private
 */
const _levels = {
  [LEVEL_NONE]: -1,
  [LEVEL_ERROR]: 0,
  [LEVEL_INFO]: 1,
  [LEVEL_VERBOSE]: 2
}

/**
 * Default logger level per environment
 *
 * @type {Object}
 * @private
 */
const _envLogLevels = {
  development: LEVEL_VERBOSE,
  production: LEVEL_ERROR,
  test: LEVEL_VERBOSE
}

/**
 * Available logger methods
 *
 * @type {Array}
 * @private
 */
const _methods = [
  {name: 'log', level: LEVEL_VERBOSE},
  {name: 'info', level: LEVEL_INFO},
  {name: 'error', level: LEVEL_ERROR}
]

/**
 * Current logger level
 */
let _current = _getDefaultLogLevel()

/**
 * Get default logger error per environment and fallback to error level when unknown env
 *
 * @returns {string}
 * @private
 */
function _getDefaultLogLevel () {
  return _envLogLevels[__ADJUST__ENV] || LEVEL_ERROR
}

/**
 * Set logger level, fallback to default log level
 *
 * @param {string=} logLevel
 */
function setLogLevel (logLevel) {

  const exists = !logLevel || Object.keys(_levels).indexOf(logLevel) !== -1

  if (!exists) {
    _log('error', 'You must set one of the available log levels: verbose, info, error or none')
    return
  }

  _current = logLevel || _getDefaultLogLevel()

  _log('info', `Log level set to ${_current}`)
}

/**
 * Output the message to the console
 *
 * @param {string} methodName
 * @param {string} message
 * @private
 */
function _log (methodName, ...message) {
  console[methodName](`[${Config.namespace}]`, `${methodName.toUpperCase()}:`, ...message) // eslint-disable-line
}

const Logger = {
  setLogLevel
}

_methods.forEach(method => {
  Object.defineProperty(Logger, method.name, {
    writable: false,
    value: (...message) => {
      if (_levels[_current] >= _levels[method.level]) {
        _log(method.name, ...message)
      }
    }
  })
})

export default Logger
