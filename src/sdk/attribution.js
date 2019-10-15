import {publish} from './pub-sub'
import {intersection, isEmpty} from './utilities'
import {persist} from './identity'
import ActivityState from './activity-state'
import Logger from './logger'
import Package from './package'

/**
 * Package request instance
 *
 * @type {Object}
 * @private
 */
const _request = Package({
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
const _whitelist = [
  'tracker_token',
  'tracker_name',
  'network',
  'campaign',
  'adgroup',
  'creative',
  'click_label'
]

/**
 * Check if new attribution is the same as old one
 *
 * @param {string} adid
 * @param {Object} attribution
 * @returns {boolean}
 * @private
 */
function _isSame ({adid, attribution}) {
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
function _isValid ({adid = '', attribution = {}}) {
  return adid && !!intersection(_whitelist, Object.keys(attribution)).length
}

/**
 * Update attribution and initiate client's callback
 *
 * @param {Object} result
 * @private
 */
function _setAttribution (result) {

  if (isEmpty(result) || !_isValid(result) || _isSame(result)) {
    return Promise.resolve(result)
  }

  const attribution = {adid: result.adid, ...result.attribution}

  ActivityState.current = {...ActivityState.current, attribution}

  return persist()
    .then(() => {
      publish('attribution:change', attribution)
      Logger.info('Attribution has been updated')
      return attribution
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
function _continue (result, finish, retry) {
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
 * @param {Object} sessionResult
 * @param {number=} sessionResult.ask_in
 */
function check (sessionResult = {}) {
  const activityState = ActivityState.current

  if (!sessionResult.ask_in && activityState.attribution || !activityState.sessionCount) {
    return Promise.resolve(sessionResult)
  }

  _request.send({
    params: {
      initiatedBy: !sessionResult.ask_in ? 'sdk' : 'backend',
      ...ActivityState.getParams()
    },
    wait: sessionResult.ask_in
  })

  ActivityState.updateSessionOffset()

  return persist()
}

/**
 * Destroy attribution by clearing running request
 */
function destroy () {
  _request.clear()
}

export {
  check,
  destroy
}


