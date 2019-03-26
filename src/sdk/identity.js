import Storage from './storage'
import Config from './config'

/**
 * TODO fallback to cookies if localStorage not supported
 * Set current user
 *
 * @param {string} value
 * @returns {string}
 * @private
 */
function _setUuid (value) {
  window.localStorage.setItem(`${Config.namespace}.current`, value)
  return value
}

/**
 * TODO fallback to cookies if localStorage not supported
 * Get current user
 *
 * @returns {string|null}
 * @private
 */
function _getUuid () {
  return window.localStorage.getItem(`${Config.namespace}.current`) || null
}

/**
 * Generate random  uuid v4
 *
 * @returns {string}
 * @private
 */
function _generateUuid () {
  let seed = Date.now()
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (seed + Math.random() * 16) % 16 | 0
    seed = Math.floor(seed / 16)
    return (c === 'x' ? r : r & (0x3|0x8)).toString(16)
  })
}

/**
 * Sync newly created id with the user record
 *
 * @param {Object} current
 * @returns {Promise}
 * @private
 */
function _sync (current) {

  if (current.new) {
    return Storage.addItem('user', {uuid: current.uuid})
  }

  return Storage.getItem('user', current.uuid)
}

/**
 * Get current user's record
 *
 * @returns {Promise}
 */
function getCurrent () {
  return _sync(getUuid())
}

/**
 * Get stored uuid if exists, if not generate new one and return it
 *
 * @param {boolean=} sync
 * @returns {Object}
 */
function getUuid (sync) {

  let current = {uuid: _getUuid()}

  if (!current.uuid) {
    current.uuid = _setUuid(_generateUuid())
    current.new = true
  }

  if (sync) {
    _sync(current)
  }

  return current
}

export {
  getCurrent,
  getUuid
}
