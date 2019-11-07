// @flow
import {
  type HttpResultT,
  type AttributionStateT,
  type AttributionWhiteListT,
  type ActivityStateMapT
} from './types'
import {publish} from './pub-sub'
import {entries, intersection, isEmpty, reducer} from './utilities'
import {persist} from './identity'
import ActivityState from './activity-state'
import Logger from './logger'
import Request from './request'

/**
 * Http request instance
 *
 * @type {Object}
 * @private
 */
const _request = Request({
  url: '/attribution',
  strategy: 'short',
  continueCb: _continue
})

/**
 * List of valid attribution parameters
 *
 * @type {string[]}
 * @private
 */
const _whitelist: AttributionWhiteListT = [
  'tracker_token',
  'tracker_name',
  'network',
  'campaign',
  'adgroup',
  'creative',
  'click_label',
  'state'
]

/**
 * Check if new attribution is the same as old one
 *
 * @param {string} adid
 * @param {Object} attribution
 * @returns {boolean}
 * @private
 */
function _isSame ({adid, attribution}: HttpResultT): boolean {
  const oldAttribution = ActivityState.current.attribution || {}
  const anyDifferent = _whitelist.some(k => oldAttribution[k] !== attribution[k])

  return !anyDifferent && adid === oldAttribution.adid
}

/**
 * Check if attribution result is valid
 *
 * @param {string} adid
 * @param {Object} attribution
 * @returns {boolean}
 * @private
 */
function _isValid ({adid = '', attribution = {}}: HttpResultT): boolean {
  return !!adid && !!intersection(_whitelist, Object.keys(attribution)).length
}

/**
 * Update attribution and initiate client's callback
 *
 * @param {Object} result
 * @private
 */
function _setAttribution (result: HttpResultT): Promise<AttributionStateT> {

  if (isEmpty(result) || !_isValid(result) || _isSame(result)) {
    return Promise.resolve({state: 'same'})
  }

  const filtered = entries(result.attribution)
    .filter(([key]) => _whitelist.indexOf(key) !== -1)
    .reduce(reducer, {})

  const attribution = {adid: result.adid, ...filtered}

  ActivityState.current = {...ActivityState.current, attribution}

  return persist()
    .then(() => {
      publish('attribution:change', attribution)
      Logger.info('Attribution has been updated')
      return {state: 'changed'}
    })
}

/**
 * Store attribution or make another request if attribution not yet available
 *
 * @param {Object} result
 * @param {Function} finish
 * @param {Function} retry
 * @returns {Promise}
 * @private
 */
function _continue (result: HttpResultT, finish, retry): Promise<HttpResultT | AttributionStateT> {
  result = result || {}

  if (!result.ask_in) {
    finish()
    return _setAttribution(result)
  }

  return retry(result.ask_in)
}

/**
 * Request attribution if session asked for it
 *
 * @param {Object=} sessionResult
 * @param {number=} sessionResult.ask_in
 */
function check (sessionResult: HttpResultT): Promise<?ActivityStateMapT> {
  const activityState = ActivityState.current
  const askIn = (sessionResult || {}).ask_in

  if (!askIn && (activityState.attribution || !activityState.installed)) {
    return Promise.resolve(activityState)
  }

  _request.send({
    params: {
      initiatedBy: !sessionResult ? 'sdk' : 'backend',
      ...ActivityState.getParams()
    },
    wait: askIn
  })

  ActivityState.updateSessionOffset()

  return persist()
}

/**
 * Destroy attribution by clearing running request
 */
function destroy (): void {
  _request.clear()
}

export {
  check,
  destroy
}


