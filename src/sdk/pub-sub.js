/**
 * List of events with subscribed callbacks
 *
 * @type {Object}
 * @private
 */
const _list = {}

/**
 * Reference to timeout ids so they can be cleared on destroy
 *
 * @type {Array}
 * @private
 */
let _timeoutIds = []

/**
 * Get unique id for the callback to use for unsubscribe
 *
 * @returns {string}
 * @private
 */
function _getId () {
  return 'id' + Math.random().toString(36).substr(2, 16)
}

/**
 * Subscribe to a certain event
 *
 * @param {string} name
 * @param {Function} cb
 * @returns {string}
 */
function subscribe (name, cb) {

  const id = _getId()

  if (!_list[name]) {
    _list[name] = []
  }

  _list[name].push({
    id: id,
    cb: cb
  })

  return id
}

/**
 * Unsubscribe particular callback from an event
 *
 * @param {string} id
 */
function unsubscribe (id) {

  if (!id) { return }

  for (const name in _list) {
    if (_list.hasOwnProperty(name) && _list[name]) {
      _list[name].forEach((item, j) => {
        if (item.id === id) {
          _list[name].splice(j, 1)
        }
      })
    }
  }

}

/**
 * Publish certain event with optional arguments
 *
 * @param {string} name
 * @param {*} args
 * @returns {Array}
 */
function publish (name, args) {

  if (!_list[name]) {
    return []
  }

  _list[name].forEach(item => {
    if (typeof item.cb === 'function') {
      _timeoutIds.push(setTimeout(() => item.cb(name, args)))
    }
  })
}

/**
 * Destroy all registered events with their callbacks
 */
function destroy () {
  _timeoutIds.forEach(clearTimeout)
  _timeoutIds = []

  for (const name in _list) {
    if (_list.hasOwnProperty(name)) {
      delete _list[name]
    }
  }
}

export {
  subscribe,
  unsubscribe,
  publish,
  destroy
}

