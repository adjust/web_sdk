import Config from './config'
import {isObject} from './utilities'

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
let _level = _getDefaultLogLevel()

/**
 * Optional output container to display logs for easier debugging
 *
 * @type {string}
 * @private
 */
let _output = ''

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
 * @param {string=} logOutput
 */
function setLogLevel (logLevel, logOutput) {

  const exists = !logLevel || Object.keys(_levels).indexOf(logLevel) !== -1

  if (!exists) {
    _log('error', 'You must set one of the available log levels: verbose, info, error or none')
    return
  }

  _level = logLevel || _getDefaultLogLevel()
  _output = logOutput

  _log('info', `Log level set to ${_level}`)
}

/**
 * Output the message to the console
 *
 * @param {string} methodName
 * @param {string} args
 * @private
 */
function _log (methodName, ...args) {
  const message = [`[${Config.namespace}]`, `${methodName.toUpperCase()}:`, ...args]
  const outputContainer = _output ? document.querySelector(_output) : null

  console[methodName].apply(null, message) // eslint-disable-line

  if (outputContainer) {
    const [namespace, prefix, ...rest] = message
    const spaces = methodName === 'log' ? '  ' : (methodName === 'info' ? ' ' : '')
    outputContainer.textContent += `${namespace} ${prefix}${spaces} ${rest.map(m => isObject(m) ? JSON.stringify(m) : m).join(' ')}\n`
    outputContainer.scrollTop = outputContainer.scrollHeight
  }

}

const Logger = {
  setLogLevel
}

_methods.forEach(method => {
  Object.defineProperty(Logger, method.name, {
    writable: false,
    value: (...message) => {
      if (_levels[_level] >= _levels[method.level]) {
        _log(method.name, ...message)
      }
    }
  })
})

export default Logger
