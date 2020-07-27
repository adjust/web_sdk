// @flow
import {entries} from './utilities'

type CallbackT<T> = {|
  id: string,
  cb: (string, T) => mixed
|}

/**
 * List of events with subscribed callbacks
 *
 * @type {Object}
 * @private
 */
let _list = {}

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
function _getId (): string {
  return 'id' + Math.random().toString(36).substr(2, 16)
}

/**
 * Subscribe to a certain event
 *
 * @param {string} name
 * @param {Function} cb
 * @returns {string}
 */
function subscribe<T> (name: string, cb: $PropertyType<CallbackT<T>, 'cb'>): string {
  const id = _getId()
  const callback: CallbackT<T> = {id, cb}

  if (!_list[name]) {
    _list[name] = []
  }

  _list[name].push(callback)

  return id
}

/**
 * Unsubscribe particular callback from an event
 *
 * @param {string} id
 */
function unsubscribe (id: string): void {
  if (!id) {
    return
  }

  entries(_list)
    .some(([, callbacks]) => callbacks
      .some(<T>(callback: CallbackT<T>, i: number) => {
        if (callback.id === id) {
          callbacks.splice(i, 1)
          return true
        }
      }))
}

/**
 * Publish certain event with optional arguments
 *
 * @param {string} name
 * @param {*} args
 * @returns {Array}
 */
function publish<T> (name: string, args: T): void {
  if (!_list[name]) {
    return
  }

  _list[name]
    .forEach((item: CallbackT<T>) => {
      if (typeof item.cb === 'function') {
        _timeoutIds.push(setTimeout(() => item.cb(name, args)))
      }
    })
}

/**
 * Destroy all registered events with their callbacks
 */
function destroy (): void {
  _timeoutIds.forEach(clearTimeout)
  _timeoutIds = []
  _list = {}
}

export {
  subscribe,
  unsubscribe,
  publish,
  destroy
}

