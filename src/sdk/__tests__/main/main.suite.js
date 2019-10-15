import * as Config from '../../config'
import * as PubSub from '../../pub-sub'
import * as Identity from '../../identity'
import * as Queue from '../../queue'
import * as Session from '../../session'
import * as event from '../../event'
import * as sdkClick from '../../sdk-click'
import * as GlobalParams from '../../global-params'
import * as State from '../../state'
import * as Attribution from '../../attribution'
import * as StorageManager from '../../storage/storage-manager'
import * as Logger from '../../logger'
import * as ActivityState from '../../activity-state'
import * as GdprForgetDevice from '../../gdpr-forget-device'
import * as request from '../../request'

const config = {
  appToken: 'some-app-token',
  environment: 'production',
  attributionCallback: jest.fn()
}

const _gdprConfig = {
  url: '/gdpr_forget_device',
  method: 'POST'
}

let _instance

function _startFirstPart () {
  expect(Config.default.baseParams.appToken).toEqual('some-app-token')
  expect(Config.default.baseParams.environment).toEqual('production')

  expect(PubSub.subscribe.mock.calls[0][0]).toEqual('sdk:shutdown')
  expect(PubSub.subscribe.mock.calls[1][0]).toEqual('sdk:gdpr-forget-me')
  expect(PubSub.subscribe.mock.calls[2][0]).toEqual('attribution:check')
  expect(PubSub.subscribe.mock.calls[3][0]).toEqual('attribution:change')
  expect(PubSub.subscribe.mock.calls[3][1]).toEqual(config.attributionCallback)

  expect(Identity.start).toHaveBeenCalledTimes(1)

  return Utils.flushPromises()
}

function expectStart () {
  const promise = _startFirstPart()
    .then(() => {
      expect(GdprForgetDevice.check).toHaveBeenCalledTimes(1)
      expect(Queue.run).toHaveBeenCalledTimes(1)
      expect(Queue.run).toHaveBeenCalledWith({cleanUp: true})
      expect(Session.watch).toHaveBeenCalledTimes(1)
      expect(sdkClick.default).toHaveBeenCalledTimes(1)
    })

  return {assertions: 13, promise}
}

function expectPartialStartWithGdprRequest () {
  const promise = _startFirstPart()
    .then(() => {
      expect(GdprForgetDevice.check).toHaveBeenCalledTimes(1)
      expect(Queue.run).not.toHaveBeenCalled()
      expect(Session.watch).not.toHaveBeenCalled()
      expect(sdkClick.default).not.toHaveBeenCalled()
      expectGdprRequest()
    })

  return {assertions: 14, promise}
}

function expectNotStart (restart) {

  if (!restart) {
    expect(Config.default.baseParams).toEqual({})
  }

  expect(PubSub.subscribe).not.toHaveBeenCalled()
  expect(Identity.start).not.toHaveBeenCalled()
  expect(GdprForgetDevice.check).not.toHaveBeenCalled()
  expect(Queue.run).not.toHaveBeenCalled()
  expect(Session.watch).not.toHaveBeenCalled()
  expect(sdkClick.default).not.toHaveBeenCalled()

}

function expectRunningTrackEvent () {

  _instance.trackEvent({eventToken: 'blabla'})

  expect(event.default).toHaveBeenCalledWith({eventToken: 'blabla'})
  expect(GlobalParams.get).toHaveBeenCalled()

  return {assertions: 2}

}

function expectNotRunningTrackEvent (noInstance, noStorage) {

  _instance.trackEvent({eventToken: 'blabla'})

  if (noInstance) {
    if (noStorage) {
      expect(Logger.default.log).toHaveBeenLastCalledWith('Adjust SDK can not track event, no storage available')
    } else {
      expect(Logger.default.error).toHaveBeenLastCalledWith('Adjust SDK is not initiated, can not track event')
    }
  } else {
    expect(Logger.default.log).toHaveBeenLastCalledWith('Adjust SDK is disabled, can not track event')
    expect(event.default).not.toHaveBeenCalled()
  }

  expect(GlobalParams.get).not.toHaveBeenCalled()

  return {assertions: noInstance ? 2 : 3}
}

function expectRunningStatic () {

  const params = [
    {key: 'key1', value: 'value1'},
    {key: 'key2', value: 'value2'}
  ]

  _instance.addGlobalCallbackParameters(params)
  expect(GlobalParams.add).toHaveBeenCalledWith(params, 'callback')

  _instance.addGlobalPartnerParameters(params)
  expect(GlobalParams.add).toHaveBeenCalledWith(params, 'partner')

  _instance.removeGlobalCallbackParameter('some-key')
  expect(GlobalParams.remove).toHaveBeenCalledWith('some-key', 'callback')

  _instance.removePartnerCallbackParameter('some-key')
  expect(GlobalParams.remove).toHaveBeenCalledWith('some-key', 'partner')

  _instance.clearGlobalCallbackParameters('callback')
  expect(GlobalParams.removeAll).toHaveBeenCalledWith('callback')

  _instance.clearGlobalPartnerParameters('partner')
  expect(GlobalParams.removeAll).toHaveBeenCalledWith('partner')

  _instance.switchBackToOnlineMode()
  expect(Queue.setOffline).toHaveBeenCalledWith(false)

  _instance.switchToOfflineMode()
  expect(Queue.setOffline).toHaveBeenCalledWith(true)

  return {assertions: 8}
}

function expectNotRunningStatic (noStorage) {

  _instance.addGlobalCallbackParameters([{key: 'key', value: 'value'}])

  expect(Logger.default.log).toHaveBeenLastCalledWith(noStorage
    ? 'Adjust SDK can not add global callback parameters, no storage available'
    : 'Adjust SDK is disabled, can not add global callback parameters')
  expect(GlobalParams.add).not.toHaveBeenCalled()

  _instance.addGlobalPartnerParameters([{key: 'key', value: 'value'}])

  expect(Logger.default.log).toHaveBeenLastCalledWith(noStorage
    ? 'Adjust SDK can not add global partner parameters, no storage available'
    : 'Adjust SDK is disabled, can not add global partner parameters')
  expect(GlobalParams.add).not.toHaveBeenCalled()

  _instance.removeGlobalCallbackParameter('key')

  expect(Logger.default.log).toHaveBeenLastCalledWith(noStorage
    ? 'Adjust SDK can not remove global callback parameter, no storage available'
    : 'Adjust SDK is disabled, can not remove global callback parameter')
  expect(GlobalParams.remove).not.toHaveBeenCalled()

  _instance.removePartnerCallbackParameter('key')

  expect(Logger.default.log).toHaveBeenLastCalledWith(noStorage
    ? 'Adjust SDK can not remove global partner parameter, no storage available'
    : 'Adjust SDK is disabled, can not remove global partner parameter')
  expect(GlobalParams.remove).not.toHaveBeenCalled()

  _instance.clearGlobalCallbackParameters()

  expect(Logger.default.log).toHaveBeenLastCalledWith(noStorage
    ? 'Adjust SDK can not remove all global callback parameters, no storage available'
    : 'Adjust SDK is disabled, can not remove all global callback parameters')
  expect(GlobalParams.removeAll).not.toHaveBeenCalled()

  _instance.clearGlobalPartnerParameters()

  expect(Logger.default.log).toHaveBeenLastCalledWith(noStorage
    ? 'Adjust SDK can not remove all global partner parameters, no storage available'
    : 'Adjust SDK is disabled, can not remove all global partner parameters')
  expect(GlobalParams.removeAll).not.toHaveBeenCalled()

  _instance.switchToOfflineMode()

  expect(Logger.default.log).toHaveBeenLastCalledWith(noStorage
    ? 'Adjust SDK can not set offline mode, no storage available'
    : 'Adjust SDK is disabled, can not set offline mode')
  expect(Queue.setOffline).not.toHaveBeenCalled()

  return {assertions: 14}
}

function expectAttributionCallback () {

  PubSub.publish('attribution:change', {tracker_token: 'some-token'})

  jest.runOnlyPendingTimers()

  expect(config.attributionCallback).toHaveBeenCalledWith('attribution:change', {tracker_token: 'some-token'})

  return Utils.flushPromises()
}

function expectNotAttributionCallback () {

  PubSub.publish('attribution:change', {tracker_token: 'some-token'})

  jest.runOnlyPendingTimers()

  expect(config.attributionCallback).not.toHaveBeenCalled()
}

function _expectPause () {
  expect(Queue.destroy).toHaveBeenCalled()
  expect(Session.destroy).toHaveBeenCalled()
  expect(Attribution.destroy).toHaveBeenCalled()

  return {assertions: 3}
}

function expectShutDown (onlyNumOfAssertions) {
  if (onlyNumOfAssertions) {
    return {assertions: 7}
  }

  _expectPause()
  expect(PubSub.destroy).toHaveBeenCalled()
  expect(Identity.destroy).toHaveBeenCalled()
  expect(StorageManager.default.destroy).toHaveBeenCalled()
  expect(Config.default.baseParams).toEqual({})
}

function expectPartialShutDown () {
  const a = _expectPause()

  expect(PubSub.destroy).not.toHaveBeenCalled()
  expect(Identity.destroy).not.toHaveBeenCalled()
  expect(StorageManager.default.destroy).not.toHaveBeenCalled()

  return {assertions: a.assertions + 3}
}

function _expectNotPause () {
  expect(Queue.destroy).not.toHaveBeenCalled()
  expect(Session.destroy).not.toHaveBeenCalled()
  expect(Attribution.destroy).not.toHaveBeenCalled()
}

function expectNotShutDown () {
  _expectNotPause()
  expect(PubSub.destroy).not.toHaveBeenCalled()
  expect(Identity.destroy).not.toHaveBeenCalled()
  expect(StorageManager.default.destroy).not.toHaveBeenCalled()
}

function _expectDestroy () {
  expectShutDown()
  expect(GdprForgetDevice.destroy).toHaveBeenCalled()
  expect(Logger.default.log).toHaveBeenCalledWith('Adjust SDK instance has been destroyed')
}

function _expectNotDestroy () {
  expectNotShutDown()
  expect(GdprForgetDevice.destroy).not.toHaveBeenCalled()
  expect(Logger.default.log).not.toHaveBeenCalledWith('Adjust SDK instance has been destroyed')
}

function expectClearAndDestroy (onlyNumOfAssertions) {
  const assertions = 12

  if (onlyNumOfAssertions) {
    return {assertions}
  }

  expect(Identity.clear).toHaveBeenCalled()
  expect(GlobalParams.clear).toHaveBeenCalled()
  expect(Queue.clear).toHaveBeenCalled()

  const promise = Utils.flushPromises().then(_expectDestroy)

  return {assertions, promise}
}

function expectNotClearAndDestroy () {
  expect(Identity.clear).not.toHaveBeenCalled()
  expect(GlobalParams.clear).not.toHaveBeenCalled()
  expect(Queue.clear).not.toHaveBeenCalled()

  const promise = Utils.flushPromises().then(_expectNotDestroy)

  return {assertions: 11, promise}
}

function expectGdprForgetMeCallback (onlyNumOfAssertions, asyncPublish) {
  const assertions = 2

  if (onlyNumOfAssertions) {
    return {assertions}
  }

  const oldState = State.default.disabled

  if (asyncPublish) {
    PubSub.publish('sdk:gdpr-forget-me', true)
  }

  jest.runOnlyPendingTimers()

  expect(State.default.disabled).not.toEqual(oldState)
  expect(State.default.disabled).toEqual({reason: 'gdpr', pending: false})

  return {assertions}
}

function expectNotGdprForgetMeCallback () {
  const oldState = State.default.disabled

  PubSub.publish('sdk:gdpr-forget-me', true)

  jest.runOnlyPendingTimers()

  expect(State.default.disabled).toEqual(oldState)

  return {assertions: 1}
}

function expectAllUp () {
  expect(Config.default.baseParams.appToken).toEqual('some-app-token')
  expect(Config.default.baseParams.environment).toEqual('production')

  expect(ActivityState.default.current).not.toBeNull()
  expect(Queue.isRunning()).toBeTruthy()
  expect(Session.isRunning()).toBeTruthy()

  const a = expectGdprForgetMeCallback(true)
  const promise = expectAttributionCallback()
    .then(_expectAttributionCheck)
    .then(() => {
      _instance.gdprForgetMe()

      jest.runOnlyPendingTimers()

      return Utils.flushPromises()
    })
    .then(expectGdprForgetMeCallback)

  return {assertions: a.assertions + 7, promise}
}

function expectAllDown (onlyNumOfAssertions) {
  if (onlyNumOfAssertions) {
    return {assertions: 6}
  }

  expect(Config.default.baseParams).toEqual({})

  expectNotGdprForgetMeCallback()
  expectNotAttributionCallback()

  expect(ActivityState.default.current).toBeNull()
  expect(Queue.isRunning()).toBeFalsy()
  expect(Session.isRunning()).toBeFalsy()
}

function _expectAttributionCheck () {

  PubSub.publish('attribution:check', {some: 'result'})

  jest.runOnlyPendingTimers()

  expect(Attribution.check).toHaveBeenCalledWith({some: 'result'})

  return Utils.flushPromises()
}

function expectGdprRequest () {
  const lastCall = request.default.mock.calls.length

  jest.runOnlyPendingTimers()

  expect(request.default).toHaveBeenCalled()
  expect(request.default.mock.calls[lastCall][0]).toMatchObject(_gdprConfig)

  return {assertions: 2}
}

function expectNotGdprRequest (logMessage) {
  const requestCall = ((request.default.mock.calls || [])[0] || [])[0] || {}

  jest.runOnlyPendingTimers()

  expect(requestCall).not.toMatchObject(_gdprConfig)
  expect(Logger.default.log).toHaveBeenCalledWith(logMessage)
}

function teardown () {
  _instance.destroy()
  localStorage.clear()
  jest.clearAllMocks()
  State.default.disabled = null
}

function teardownAndDisable (reason = 'general') {
  teardown()
  State.default.disabled = {reason}
}

export default function Suite (instance) {
  _instance = instance

  return {
    config,
    expectStart,
    expectPartialStartWithGdprRequest,
    expectNotStart,
    expectRunningTrackEvent,
    expectNotRunningTrackEvent,
    expectRunningStatic,
    expectNotRunningStatic,
    expectAttributionCallback,
    expectNotAttributionCallback,
    expectShutDown,
    expectPartialShutDown,
    expectNotShutDown,
    expectClearAndDestroy,
    expectNotClearAndDestroy,
    expectGdprForgetMeCallback,
    expectNotGdprForgetMeCallback,
    expectAllUp,
    expectAllDown,
    expectGdprRequest,
    expectNotGdprRequest,
    teardown,
    teardownAndDisable
  }
}
