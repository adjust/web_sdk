import {publish} from './pub-sub'
import {extend} from './utilities'
import {updateAttribution} from './identity'
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
 * Check if new attribution is the same as old one
 *
 * @param {string} adid
 * @param {Object} attribution
 * @returns {boolean}
 * @private
 */
function _isSame ({adid = '', attribution = {}}) {

  const check = [
    'tracker_token',
    'tracker_name',
    'network',
    'campaign',
    'adgroup',
    'creative',
    'click_label'
  ]

  const oldAttribution = ActivityState.current.attribution || {}
  const anyDifferent = check.some(key => {
    return oldAttribution[key] !== attribution[key]
  })

  return !anyDifferent && adid === oldAttribution.adid
}

/**
 * Update attribution and initiate client's callback
 *
 * @param {Object} result
 * @private
 */
function _setAttribution (result = {}) {

  if (_isSame(result)) {
    return Promise.resolve(result)
  }

  const attribution = extend({adid: result.adid}, result.attribution)

  return updateAttribution(attribution)
    .then(() => {
      publish('attribution:change', attribution)
      Logger.info('Attribution has been updated')
      Logger.log('Updated attribution:', attribution)
      return attribution
    })
}

/**
 * Store attribution or make another request if attribution not yet available
 *
 * @param {Object} result
 * @returns {Promise}
 * @private
 */
function _continue (result = {}) {

  if (!result.ask_in) {
    _request.finish()

    return _setAttribution(result)
  }

  return _request.retry({wait: result.ask_in})
}

/**
 * Request attribution if session asked for it
 *
 * @param {Object} sessionResult
 * @param {number=} sessionResult.ask_in
 */
function check (sessionResult = {}) {

  if (!sessionResult.ask_in && ActivityState.current.attribution) {
    return Promise.resolve(sessionResult)
  }

  _request.send({
    params: {
      initiatedBy: !sessionResult.ask_in ? 'sdk' : 'backend'
    },
    wait: sessionResult.ask_in
  })
}

/**
 * Destroy attribution by clearing current timeout
 */
function destroy () {
  _request.clear()
}

export {
  check,
  destroy
}


