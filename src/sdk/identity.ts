import { type ActivityStateMapT } from './types'
import Storage from './storage/storage'
import ActivityState from './activity-state'
import { reload as reloadPreferences } from './preferences'
import { PUB_SUB_EVENTS, DISABLE_REASONS } from './constants'
import { isEmpty } from './utilities'
import { disable, status } from './disable'
import { publish } from './pub-sub'
import { StoreName } from './storage/scheme'

type InterceptT = {
  exists: boolean,
  stored?: ActivityStateMapT
}

/** Name of the store used by activityState */
const _storeName = StoreName.ActivityState

/** Boolean used in start in order to avoid duplicated activity state */
let _starting: boolean = false

/** Generate random  uuid v4 */
function _generateUuid(): string {
  let seed = Date.now()
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (seed + Math.random() * 16) % 16 | 0
    seed = Math.floor(seed / 16)
    return (c === 'x' ? r : r & (0x3 | 0x8)).toString(16)
  })
}

/** Inspect stored activity state and check if disable needs to be repeated */
function _intercept(stored: ActivityStateMapT): InterceptT {
  if (!stored) {
    return { exists: false }
  }

  if (stored.uuid === 'unknown') {
    disable(DISABLE_REASONS.REASON_GDPR)
    ActivityState.destroy()
    return { exists: true, stored: null }
  }

  ActivityState.init(stored)

  return { exists: true, stored: stored }
}

/**
 * Cache stored activity state into running memory
 */
function start(): Promise<ActivityStateMapT> {
  if (_starting) {
    return Promise.reject({ interrupted: true, message: 'Adjust SDK start already in progress' })
  }
  _starting = true

  return Storage.getFirst(_storeName)
    .then(_intercept)
    .then((result: InterceptT) => {
      if (result.exists) {
        _starting = false
        return result.stored
      }

      const activityState = isEmpty(ActivityState.current)
        ? { uuid: _generateUuid() }
        : ActivityState.current

      return Storage.addItem(_storeName, activityState)
        .then(() => {
          ActivityState.init(activityState)
          reloadPreferences()
          _starting = false
          return activityState
        })
    })
    .then((activityState: ActivityStateMapT | null) => {
      if (activityState) {
        publish(PUB_SUB_EVENTS.WEB_UUID_CREATED, activityState.uuid)
      } else {
        publish(PUB_SUB_EVENTS.WEB_UUID_CREATED, 'gdpr_forgotten')
      }
      return activityState
    })
}

/** Check if sdk is running at all (totally disabled or inactive activity state) */
function _isLive() {
  return status() !== 'off' && ActivityState.isStarted()
}

/**
 * Persist changes made directly in activity state and update lastActive flag
 */
function persist(): Promise<ActivityStateMapT> {
  if (!_isLive()) {
    return Promise.resolve(null)
  }

  const activityState = { ...ActivityState.current, lastActive: Date.now() }
  return Storage.updateItem(_storeName, activityState)
    .then(() => ActivityState.current = activityState)
}

/**
 * Sync in-memory activityState with the one from store
 * - should be used when change from another tab is possible and critical
 */
function sync(): Promise<ActivityStateMapT> {
  return Storage.getFirst(_storeName)
    .then((activityState: ActivityStateMapT) => {
      const current = ActivityState.current
      const lastActive = current.lastActive || 0

      if (_isLive() && lastActive < activityState.lastActive) {

        // Checking if another SDK instance was installed while this one was in backgound
        const installedUpdated = !current.installed && activityState.installed
        const sessionCountUpdated = (current.sessionCount || 0) < (activityState.sessionCount || 0)
        if (installedUpdated || sessionCountUpdated) {
          publish('sdk:installed')
        }

        ActivityState.current = activityState
        reloadPreferences()
      }

      return activityState
    })
}

/**
 * Clear activity state store - set uuid to be unknown
 */
function clear(): Promise<unknown> {
  const newActivityState = { uuid: 'unknown' }

  ActivityState.current = newActivityState

  return Storage.clear(_storeName)
    .then(() => Storage.addItem(_storeName, newActivityState))
}

/**
 * Destroy current activity state
 */
function destroy(): void {
  ActivityState.destroy()
}

export {
  start,
  persist,
  sync,
  clear,
  destroy
}
