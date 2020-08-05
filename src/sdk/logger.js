// @flow
import Globals from './globals'
import {isObject} from './utilities'
import {type LogOptionsT} from './types'

type LogLevelT = $PropertyType<LogOptionsT, 'logLevel'>
type MethodNameT = 'log' | 'info' | 'error' | 'warn'

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
function _getDefaultLogLevel (): LogLevelT {
  return _envLogLevels[Globals.env] || LEVEL_ERROR
}

/**
 * Set logger level, fallback to default log level
 *
 * @param {string=} logLevel
 * @param {string=} logOutput
 */
function setLogLevel (logLevel: LogLevelT, logOutput: string): void {
  const exists = !logLevel || Object.keys(_levels).indexOf(logLevel) !== -1

  if (!exists) {
    _log('error', 'error', 'You must set one of the available log levels: verbose, info, error or none')
    return
  }

  _level = logLevel || _getDefaultLogLevel()
  _output = logOutput

  _log('info', logLevel, `Log level set to ${_level}`)
}

/**
 * Output the message to the console
 *
 * @param {string} methodName
 * @param {string} logLevel
 * @param {Array} args
 * @private
 */
function _log<T> (methodName: MethodNameT, logLevel: LogLevelT, ...args: Array<T>): void {
  if (_levels[_level] < _levels[logLevel]) {
    return
  }

  const time = (new Date()).toISOString()
  const spaces = methodName === 'log' ? '  ' : (methodName === 'info' ? ' ' : '')
  const messagePrefix = [`[${Globals.namespace}]`, time, `${methodName.toUpperCase()}:${spaces}`]
  const outputContainer = _output ? document.querySelector(_output) : null

  console[methodName](...messagePrefix, ...args) // eslint-disable-line

  if (outputContainer) {
    outputContainer.textContent += `${messagePrefix.join(' ')} ${args.map(m => isObject(m) ? JSON.stringify(m) : m).join(' ')}\n`
    outputContainer.scrollTop = outputContainer.scrollHeight
  }
}

/**
 * Apply predefined log level and return log method
 *
 * @param {string} name
 * @param {string} logLevel
 * @returns {Array} args
 * @private
 */
function _applyLevel (name: MethodNameT, logLevel: LogLevelT) {
  return <T>(...args: Array<T>) => {
    _log(name, logLevel, ...args)
  }
}

const Logger = {
  setLogLevel,
  log: _applyLevel('log', LEVEL_VERBOSE),
  info: _applyLevel('info', LEVEL_INFO),
  error: _applyLevel('error', LEVEL_ERROR)
}

export default Logger
