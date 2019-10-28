// @flow
import {entries} from './utilities'

type EventCbT = (e: Event) => void
type PageVisibilityHiddenAttr = 'hidden' | 'mozHidden' | 'msHidden' | 'oHidden' | 'webkitHidden'
type PageVisibilityEventName = 'visibilitychange' | 'mozvisibilitychange' | 'msvisibilitychange' | 'ovisibilitychange' | 'webkitvisibilitychange'
type PageVisibilityApiMap = {|
  hidden: PageVisibilityHiddenAttr,
  visibilityChange: PageVisibilityEventName
|}

let _connected: boolean = navigator.onLine

/**
 * Bind to online and offline events
 */
function register (): void {
  on(window, 'online', _handleOnline)
  on(window, 'offline', _handleOffline)
}

/**
 * Handle online event, set connected flag to true
 *
 * @private
 */
function _handleOnline (): void {
  _connected = true
}

/**
 * Handle offline event, set connected flag to false
 * @private
 */
function _handleOffline (): void {
  _connected = false
}

/**
 * Bind event to an element
 *
 * @param {Window|Document} element
 * @param {string} eventName
 * @param {Function} func
 */
function on (element: Document | any, eventName: string, func: EventCbT): void {
  if (element.addEventListener) {
    element.addEventListener(eventName, func, false)
  }
}

/**
 * Unbind event off an element
 *
 * @param {Window|Document} element
 * @param {string} eventName
 * @param {Function} func
 */
function off (element: Document | any, eventName: string, func: EventCbT): void {
  if (element.removeEventListener) {
    element.removeEventListener(eventName, func, false)
  }
}

/**
 * Get Page Visibility API attributes that can be accessed depending on the browser implementation
 *
 * @returns {{hidden: string, visibilityChange: string}|null}
 * @private
 */
function getVisibilityApiAccess (): ?PageVisibilityApiMap {
  if (typeof document.hidden !== 'undefined') {
    return {
      hidden: 'hidden',
      visibilityChange: 'visibilitychange'
    }
  }

  const accessMap: {[key: PageVisibilityHiddenAttr]: PageVisibilityEventName} = {
    mozHidden: 'mozvisibilitychange',
    msHidden: 'msvisibilitychange',
    oHidden: 'ovisibilitychange',
    webkitHidden: 'webkitvisibilitychange'
  }
  const accessMapEntries = entries(accessMap)

  for (let i = 0; i < accessMapEntries.length; i += 1) {
    const [hidden, visibilityChange] = accessMapEntries[i]
    // $FlowFixMe vendor prefixed props are not part of global Document type
    if (typeof document[hidden] !== 'undefined') {
      return {hidden, visibilityChange}
    }
  }

  return null
}

/**
 * Check if connected to internet
 *
 * @returns {boolean}
 */
function isConnected (): boolean {
  return _connected
}

/**
 * Unbind from online and offline events
 */
function destroy (): void {
  off(window, 'online', _handleOnline)
  off(window, 'offline', _handleOffline)
}


export {
  register,
  on,
  off,
  getVisibilityApiAccess,
  isConnected,
  destroy
}
