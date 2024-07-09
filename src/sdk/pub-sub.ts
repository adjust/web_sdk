import { entries } from './utilities'

type CallbackWithId<T = unknown> = {
  id: string,
  cb: (name: string, arg?: T) => unknown
}

/**
 * List of events with subscribed callbacks
 */
let _list: Record<string, Array<CallbackWithId>> = {}

/**
 * Reference to timeout ids so they can be cleared on destroy
 */
let _timeoutIds: Array<ReturnType<typeof setTimeout>> = []

/**
 * Get unique id for the callback to use for unsubscribe
 */
function _getId(): string {
  return 'id' + Math.random().toString(36).substring(2, 16)
}

/**
 * Subscribe to a certain event
 */
function subscribe<T>(name: string, cb: (name: string, arg: T) => unknown): string {
  const id = _getId()
  const callback: CallbackWithId<T> = { id, cb }

  if (!_list[name]) {
    _list[name] = []
  }

  _list[name].push(callback)

  return id
}

/**
 * Unsubscribe particular callback from an event
 */
function unsubscribe(id: string) {
  if (!id) {
    return
  }

  entries(_list)
    .some(([, callbacks]) => callbacks
      .some(<T>(callback: CallbackWithId<T>, i: number) => {
        if (callback.id === id) {
          callbacks.splice(i, 1)
        }
      }))
}

/**
 * Publish certain event with optional arguments
 */
function publish<T>(name: string, args?: T): void {
  if (!_list[name]) {
    return
  }

  _list[name]
    .forEach((item: CallbackWithId<T>) => {
      if (typeof item.cb === 'function') {
        _timeoutIds.push(setTimeout(() => item.cb(name, args)))
      }
    })
}

/**
 * Destroy all registered events with their callbacks
 */
function destroy(): void {
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

