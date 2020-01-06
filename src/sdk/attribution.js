// @flow
import {
  type HttpSuccessResponseT,
  type HttpErrorResponseT,
  type HttpFinishCbT,
  type HttpRetryCbT,
  type AttributionStateT,
  type AttributionWhiteListT,
  type ActivityStateMapT,
  type AttributionMapT
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
 * @param {Object=} attribution
 * @returns {boolean}
 * @private
 */
function _isSame ({adid, attribution}: HttpSuccessResponseT): boolean {
  const oldAttribution = ActivityState.current.attribution || {}
  const anyDifferent = attribution && _whitelist.some(k => oldAttribution[k] !== attribution[k])

  return !anyDifferent && adid === oldAttribution.adid
}

/**
 * Check if attribution result is valid
 *
 * @param {string} adid
 * @param {Object=} attribution
 * @returns {boolean}
 * @private
 */
function _isValid ({adid = '', attribution = {}}: HttpSuccessResponseT): boolean {
  return !!adid && !!intersection(_whitelist, Object.keys(attribution)).length
}

/**
 * Update attribution and initiate client's callback
 *
 * @param {Object} result
 * @private
 */
function _setAttribution (result: HttpSuccessResponseT): Promise<AttributionStateT> {
  if (isEmpty(result) || !_isValid(result) || _isSame(result)) {
    return Promise.resolve({state: 'same'})
  }

  const attribution: AttributionMapT = entries(result.attribution)
    .filter(([key]) => _whitelist.indexOf(key) !== -1)
    .reduce(reducer, {adid: result.adid})

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
function _continue (result: HttpSuccessResponseT | HttpErrorResponseT, finish: HttpFinishCbT, retry: HttpRetryCbT): Promise<HttpSuccessResponseT | HttpErrorResponseT | AttributionStateT> {
  if (!result || result && result.status === 'error') {
    finish()
    return Promise.resolve({state: 'unknown'})
  }

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
function check (sessionResult: HttpSuccessResponseT): Promise<?ActivityStateMapT> {
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


