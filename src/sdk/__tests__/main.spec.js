/* eslint-disable */
import * as PubSub from '../pub-sub'
import * as Queue from '../queue'
import * as Time from '../time'
import * as Session from '../session'
import * as event from '../event'
import * as Config from '../config'
import * as Identity from '../identity'
import * as GlobalParams from '../global-params'
import * as Logger from '../logger'
import * as StorageManager from '../storage-manager'
import * as Attribution from '../attribution'
import * as ActivityState from '../activity-state'
import mainInstance from '../main.js'
import sameInstance from '../main.js'
import {flushPromises, randomInRange} from './_helper'

jest.mock('../request')
jest.mock('../logger')
jest.useFakeTimers()

const mainParams = {
  appToken: 'some-app-token',
  environment: 'production',
  attributionCallback: jest.fn()
}

function init () {
  mainInstance.init(mainParams)
}

function expectShutDown () {
  expect(Queue.destroy).toHaveBeenCalled()
  expect(PubSub.destroy).toHaveBeenCalled()
  expect(Session.destroy).toHaveBeenCalled()
  expect(Attribution.destroy).toHaveBeenCalled()
  expect(StorageManager.default.destroy).toHaveBeenCalled()

  expect(Config.default.baseParams.appToken).toEqual('')
  expect(Config.default.baseParams.environment).toEqual('')
}

function expectNotShutDown () {
  expect(Queue.destroy).not.toHaveBeenCalled()
  expect(PubSub.destroy).not.toHaveBeenCalled()
  expect(Session.destroy).not.toHaveBeenCalled()
  expect(Attribution.destroy).not.toHaveBeenCalled()
  expect(StorageManager.default.destroy).not.toHaveBeenCalled()
}

function expectShutDownAndClear () {
  expectShutDown()

  expect(Identity.clear).toHaveBeenCalled()
  expect(GlobalParams.clear).toHaveBeenCalled()
  expect(Queue.clear).toHaveBeenCalled()
}

function expectNotShutDownAndClear () {
  expectNotShutDown()

  expect(Identity.clear).not.toHaveBeenCalled()
  expect(GlobalParams.clear).not.toHaveBeenCalled()
  expect(Queue.clear).not.toHaveBeenCalled()
}

function expectGdprForgetMeCallback () {
  PubSub.publish('sdk:gdpr-forget-me', true)

  jest.runOnlyPendingTimers()

  expect(Logger.default.log).toHaveBeenCalledWith('adjustSDK has been disabled due to GDPR-Forget-Me request')
  expect(Identity.disable).toHaveBeenCalledWith('gdpr')
}

function expectNotGdprForgetMeCallback () {
  PubSub.publish('sdk:gdpr-forget-me', true)

  jest.runOnlyPendingTimers()

  expect(Logger.default.log).not.toHaveBeenCalled()
  expect(Identity.disable).not.toHaveBeenCalled()
}

function expectStart () {
  expect(Config.default.baseParams.appToken).toEqual('some-app-token')
  expect(Config.default.baseParams.environment).toEqual('production')

  expect(PubSub.subscribe.mock.calls[0][0]).toEqual('sdk:shutdown')
  expect(PubSub.subscribe.mock.calls[1][0]).toEqual('sdk:gdpr-forget-me')
  expect(PubSub.subscribe.mock.calls[2][0]).toEqual('attribution:check')
  expect(PubSub.subscribe.mock.calls[3][0]).toEqual('attribution:change')
  expect(PubSub.subscribe.mock.calls[3][1]).toEqual(mainParams.attributionCallback)

  expect(Identity.start).toHaveBeenCalledTimes(1)

  return flushPromises()
    .then(() => {
      expect(Queue.run).toHaveBeenCalledTimes(1)
      expect(Session.watch).toHaveBeenCalledTimes(1)
    })
}

function expectNotStart (restart) {

  if (!restart) {
    expect(Config.default.baseParams.appToken).toEqual('')
    expect(Config.default.baseParams.environment).toEqual('')
  }

  expect(PubSub.subscribe).not.toHaveBeenCalled()
  expect(Identity.start).not.toHaveBeenCalled()
  expect(Queue.run).not.toHaveBeenCalled()
  expect(Session.watch).not.toHaveBeenCalled()

}

function expectAllUp () {
  expect(Config.default.baseParams.appToken).toEqual('some-app-token')
  expect(Config.default.baseParams.environment).toEqual('production')

  expect(ActivityState.default.current).not.toBeNull()
  expect(Queue.isRunning()).toBeTruthy()
  expect(Session.isRunning()).toBeTruthy()

  expectAttributionCallback()
  expectAttributionCheck()

  mainInstance.gdprForgetMe()
  expectGdprForgetMeCallback()

  return flushPromises()
}

function expectAllDown () {
  expect(Config.default.baseParams.appToken).toEqual('')
  expect(Config.default.baseParams.environment).toEqual('')

  expectNotGdprForgetMeCallback()
  expectNotAttributionCallback()

  expect(ActivityState.default.current).toBeNull()
  expect(Queue.isRunning()).toBeFalsy()
  expect(Session.isRunning()).toBeFalsy()
}

function expectRunningTrackEvent () {

  mainInstance.trackEvent({eventToken: 'blabla'})

  expect(event.default).toHaveBeenCalledWith({eventToken: 'blabla'})
  expect(GlobalParams.get).toHaveBeenCalled()

}

function expectNotRunningTrackEvent (noInstance) {

  mainInstance.trackEvent({eventToken: 'blabla'})

  if (noInstance) {
    expect(Logger.default.error).toHaveBeenLastCalledWith('adjustSDK is not initiated, can not track event')
  } else {
    expect(Logger.default.log).toHaveBeenLastCalledWith('adjustSDK is disabled, can not track event')
  }

  expect(GlobalParams.get).not.toHaveBeenCalled()

}

function expectRunningStatic () {

  const params = [
    {key: 'key1', value: 'value1'},
    {key: 'key2', value: 'value2'}
  ]

  mainInstance.addGlobalCallbackParameters(params)
  expect(GlobalParams.add).toHaveBeenCalledWith(params, 'callback')

  mainInstance.addGlobalPartnerParameters(params)
  expect(GlobalParams.add).toHaveBeenCalledWith(params, 'partner')

  mainInstance.removeGlobalCallbackParameter('some-key')
  expect(GlobalParams.remove).toHaveBeenCalledWith('some-key', 'callback')

  mainInstance.removePartnerCallbackParameter('some-key')
  expect(GlobalParams.remove).toHaveBeenCalledWith('some-key', 'partner')

  mainInstance.removeAllGlobalCallbackParameters('callback')
  expect(GlobalParams.removeAll).toHaveBeenCalledWith('callback')

  mainInstance.removeAllGlobalPartnerParameters('partner')
  expect(GlobalParams.removeAll).toHaveBeenCalledWith('partner')

  mainInstance.setOfflineMode(true)
  expect(Queue.setOffline).toHaveBeenCalledWith(true)
}

function expectNotRunningStatic () {

  mainInstance.addGlobalCallbackParameters([{key: 'key', value: 'value'}])

  expect(Logger.default.log).toHaveBeenLastCalledWith('adjustSDK is disabled, can not add global callback parameters')
  expect(GlobalParams.add).not.toHaveBeenCalled()

  mainInstance.addGlobalPartnerParameters([{key: 'key', value: 'value'}])

  expect(Logger.default.log).toHaveBeenLastCalledWith('adjustSDK is disabled, can not add global partner parameters')
  expect(GlobalParams.add).not.toHaveBeenCalled()

  mainInstance.removeGlobalCallbackParameter('key')

  expect(Logger.default.log).toHaveBeenLastCalledWith('adjustSDK is disabled, can not remove global callback parameter')
  expect(GlobalParams.remove).not.toHaveBeenCalled()

  mainInstance.removePartnerCallbackParameter('key')

  expect(Logger.default.log).toHaveBeenLastCalledWith('adjustSDK is disabled, can not remove global partner parameter')
  expect(GlobalParams.remove).not.toHaveBeenCalled()

  mainInstance.removeAllGlobalCallbackParameters()

  expect(Logger.default.log).toHaveBeenLastCalledWith('adjustSDK is disabled, can not remove all global callback parameters')
  expect(GlobalParams.removeAll).not.toHaveBeenCalled()

  mainInstance.removeAllGlobalPartnerParameters()

  expect(Logger.default.log).toHaveBeenLastCalledWith('adjustSDK is disabled, can not remove all global partner parameters')
  expect(GlobalParams.removeAll).not.toHaveBeenCalled()

  mainInstance.setOfflineMode(true)

  expect(Logger.default.log).toHaveBeenLastCalledWith('adjustSDK is disabled, can not set offline mode')
  expect(Queue.setOffline).not.toHaveBeenCalled()
}

function expectAttributionCallback () {

  PubSub.publish('attribution:change', {tracker_token: 'some-token'})

  jest.runOnlyPendingTimers()

  expect(mainParams.attributionCallback).toHaveBeenCalledWith('attribution:change', {tracker_token: 'some-token'})

  return flushPromises()
}

function expectAttributionCheck () {

  PubSub.publish('attribution:check', {some: 'result'})

  jest.runOnlyPendingTimers()

  expect(Attribution.check).toHaveBeenCalledWith({some: 'result'})

  return flushPromises()
}

function expectNotAttributionCallback () {

  PubSub.publish('attribution:change', {tracker_token: 'some-token'})

  jest.runOnlyPendingTimers()

  expect(mainParams.attributionCallback).not.toHaveBeenCalled()
}

function teardown () {
  mainInstance.destroy()
  localStorage.clear()
  jest.clearAllMocks()
  ActivityState.default.state = {disabled: false}
}

function teardownAndDisable (reason = 'general') {
  teardown()
  ActivityState.default.state = {disabled: true, reason}
}

describe('main entry point functionality', () => {

  beforeAll(() => {
    jest.spyOn(Date, 'now').mockImplementation(() => 155912080000 + randomInRange(1000, 9999))
    jest.spyOn(event, 'default')
    jest.spyOn(Time, 'getTimestamp').mockReturnValue('some-time')
    jest.spyOn(Queue, 'push')
    jest.spyOn(Queue, 'run')
    jest.spyOn(Queue, 'setOffline')
    jest.spyOn(Queue, 'destroy')
    jest.spyOn(Queue, 'clear')
    jest.spyOn(Session, 'watch')
    jest.spyOn(Session, 'destroy')
    jest.spyOn(GlobalParams, 'get')
    jest.spyOn(GlobalParams, 'add')
    jest.spyOn(GlobalParams, 'remove')
    jest.spyOn(GlobalParams, 'removeAll')
    jest.spyOn(GlobalParams, 'clear')
    jest.spyOn(Logger.default, 'error')
    jest.spyOn(Logger.default, 'log')
    jest.spyOn(Logger.default, 'info')
    jest.spyOn(Identity, 'start')
    jest.spyOn(Identity, 'disable')
    jest.spyOn(Identity, 'enable')
    jest.spyOn(Identity, 'clear')
    jest.spyOn(Identity, 'destroy')
    jest.spyOn(PubSub, 'subscribe')
    jest.spyOn(PubSub, 'destroy')
    jest.spyOn(Attribution, 'check')
    jest.spyOn(Attribution, 'destroy')
    jest.spyOn(StorageManager.default, 'destroy')
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  afterAll(() => {
    jest.clearAllTimers()
    jest.restoreAllMocks()
  })

  describe('test uninitiated instance', () => {

    it('logs an error and return when not all parameters provided', () => {

      mainInstance.init()

      expect(Logger.default.error).toHaveBeenLastCalledWith('You must define appToken and environment')

      mainInstance.init({appToken: 'a-token'})

      expect(Logger.default.error).toHaveBeenLastCalledWith('You must define environment')
    })

    it('logs an error and return when trying to track event before init', () => {

      mainInstance.trackEvent()

      expect(Logger.default.error).toHaveBeenLastCalledWith('adjustSDK is not initiated, can not track event')
    })
  })

  describe('test initiated instance', () => {
    beforeAll(() => {
      init()
    })

    afterAll(teardown)

    it('sets basic configuration', () => {

      expect.assertions(10)

      return expectStart() // +10 assertions
    })

    it('calls client-defined attribution callback when attribution is changed', () => {
      return expectAttributionCallback()
    })

    it('tests if single instance is returned', () => {

      sameInstance.init({
        appToken: 'some-other-app-token',
        environment: 'production'
      })

      expect(Logger.default.error).toHaveBeenCalledWith('You already initiated your instance')
      expect(mainInstance).toBe(sameInstance)
      expect(Config.default.baseParams.appToken).toEqual('some-app-token')
      expect(Config.default.baseParams.environment).toEqual('production')

    })

    it('runs all static methods', () => {
      expectRunningStatic()
    })

    it('runs track event', () => {
      expectRunningTrackEvent()
    })
  })

  describe('initially enabled', () => {

    describe('sdk: init -> disable -> enable', () => {
      afterAll(teardown)

      it('initiates and runs all static methods and track event', () => {

        init()

        expect.assertions(19)

        expectRunningStatic() // +7 assertions
        expectRunningTrackEvent() // +2 assertions
        return expectStart() // +10 assertions
      })

      it('disables sdk with shutdown', () => {

        mainInstance.disable()

        expect(Logger.default.log).toHaveBeenCalledTimes(1)
        expect(Logger.default.log).toHaveBeenCalledWith('adjustSDK has been disabled')
        expect(Identity.disable).toHaveBeenCalledWith(undefined)

        expectShutDown()
      })

      it('prevents running all static methods and track event', () => {
        expectNotRunningStatic()
        expectNotRunningTrackEvent()
      })

      it('fails to disable already disabled sdk', () => {

        mainInstance.disable()

        expect(Logger.default.log).toHaveBeenLastCalledWith('adjustSDK is already disabled')

        expectNotShutDown()
      })

      it('enables sdk with restart', () => {

        mainInstance.enable()

        expect.assertions(13)

        expect(Logger.default.log).toHaveBeenCalledTimes(1)
        expect(Logger.default.log).toHaveBeenCalledWith('adjustSDK has been enabled')
        expect(Identity.enable).toHaveBeenCalled()

        return expectStart() // +10 assertions
      })
    })

    describe('sdk: init and disable and enable', () => {
      afterAll(teardown)

      it('initiates, disables and enables one after another', () => {

        init()
        mainInstance.disable()
        mainInstance.enable()

        expect(Logger.default.log).toHaveBeenCalledWith('adjustSDK has been disabled')
        expect(Logger.default.log).toHaveBeenCalledWith('adjustSDK has been enabled')
        expect(Identity.disable).toHaveBeenCalledWith(undefined)
        expect(Identity.enable).toHaveBeenCalled()

        return flushPromises()
      })

      it('ensures that everything is up', () => {
        return expectAllUp()
      })
    })

    describe('sdk: init -> enable -> disable', () => {
      afterAll(teardown)

      it('initiates and runs all static methods and track event', () => {

        init()

        expect.assertions(19)

        expectRunningStatic() // +7 assertions
        expectRunningTrackEvent() // +2 assertions
        return expectStart() // +10 assertions
      })

      it('fails to enable already enabled sdk', () => {

        mainInstance.enable()

        expect(Logger.default.log).toHaveBeenLastCalledWith('adjustSDK is already enabled')

        expectNotStart(true)
      })

      it('disables sdk with shutdown', () => {

        mainInstance.disable()

        expect(Logger.default.log).toHaveBeenCalledTimes(1)
        expect(Logger.default.log).toHaveBeenCalledWith('adjustSDK has been disabled')
        expect(Identity.disable).toHaveBeenCalledWith(undefined)

        expectShutDown()
      })

      it('prevents running all static methods and track event', () => {
        expectNotRunningStatic()
        expectNotRunningTrackEvent()
      })
    })

    describe('sdk: disable -> init -> enable', () => {
      afterAll(teardown)

      it('disables sdk without shutdown', () => {

        mainInstance.disable()

        expect(Logger.default.log).toHaveBeenCalledTimes(1)
        expect(Logger.default.log).toHaveBeenCalledWith('adjustSDK has been disabled')
        expect(Identity.disable).toHaveBeenCalledWith(undefined)

        expectNotShutDown()
      })

      it('prevents running all static methods and track event', () => {
        expectNotRunningStatic()
        expectNotRunningTrackEvent()
      })

      it('initiates and still prevents running all static methods and track event', () => {

        init()

        expect(Logger.default.log).toHaveBeenCalledWith('adjustSDK is disabled, can not start the sdk')

        expectNotStart()
        expectNotRunningStatic()
        expectNotRunningTrackEvent()
      })

      it('fails to disable already disabled sdk', () => {

        mainInstance.disable()

        expect(Logger.default.log).toHaveBeenLastCalledWith('adjustSDK is already disabled')

        expectNotShutDown()
      })

      it('enables sdk with restart', () => {

        mainInstance.enable()

        expect.assertions(13)

        expect(Logger.default.log).toHaveBeenCalledTimes(1)
        expect(Logger.default.log).toHaveBeenCalledWith('adjustSDK has been enabled')
        expect(Identity.enable).toHaveBeenCalled()

        return expectStart() // +10 assertions
      })
    })

    describe('sdk: enable -> init -> disable', () => {

      afterAll(teardown)

      it('runs all static methods', () => {
        expectRunningStatic()
      })

      it('prevents running track event', () => {
        expectNotRunningTrackEvent(true)
      })

      it('fails to enable already enabled sdk', () => {

        mainInstance.enable()

        expect(Logger.default.log).toHaveBeenLastCalledWith('adjustSDK is already enabled')

        expectNotStart(true)
      })

      it('initiates and runs all static methods and track event', () => {

        init()

        expect.assertions(19)

        expectRunningStatic() // +7 assertions
        expectRunningTrackEvent() // +2 assertion
        return expectStart() // +10 assertions
      })

      it('fails again to enable already enabled sdk', () => {

        mainInstance.enable()

        expect(Logger.default.log).toHaveBeenLastCalledWith('adjustSDK is already enabled')

        expectNotStart(true)
      })

      it('disables sdk with shutdown', () => {

        mainInstance.disable()

        expect(Logger.default.log).toHaveBeenCalledTimes(1)
        expect(Logger.default.log).toHaveBeenCalledWith('adjustSDK has been disabled')
        expect(Identity.disable).toHaveBeenCalledWith(undefined)

        expectShutDown()
      })
    })

    describe('sdk: enable and init and disable', () => {
      afterAll(teardown)

      it('enables, initiates and disable one after another', () => {

        mainInstance.enable()
        init()
        mainInstance.disable()

        expect(Logger.default.log).toHaveBeenCalledWith('adjustSDK is already enabled')
        expect(Logger.default.log).toHaveBeenCalledWith('adjustSDK has been disabled')
        expect(Identity.disable).toHaveBeenCalledWith(undefined)

        return flushPromises()
      })

      it('ensures that everything is shutdown', () => {
        expectAllDown()
      })
    })

    describe('sdk: disable -> enable -> init', () => {
      afterAll(teardown)

      it('disables sdk without shutdown', () => {

        mainInstance.disable()

        expect(Logger.default.log).toHaveBeenCalledTimes(1)
        expect(Logger.default.log).toHaveBeenCalledWith('adjustSDK has been disabled')
        expect(Identity.disable).toHaveBeenCalledWith(undefined)

        expectNotShutDown()
      })

      it('enables sdk without restart', () => {

        mainInstance.enable()

        expect(Logger.default.log).toHaveBeenCalledTimes(1)
        expect(Logger.default.log).toHaveBeenCalledWith('adjustSDK has been enabled')
        expect(Identity.enable).toHaveBeenCalled()

        expectNotStart()
      })

      it('initiates and runs all static methods and track event', () => {

        init()

        expect.assertions(19)

        expectRunningStatic() // +7 assertions
        expectRunningTrackEvent() // +2 assertions
        return expectStart() // +10 assertions
      })
    })

    describe('sdk: enable -> disable -> init', () => {
      afterAll(teardown)

      it('fails to enable already enabled sdk', () => {

        mainInstance.enable()

        expect(Logger.default.log).toHaveBeenLastCalledWith('adjustSDK is already enabled')

        expectNotStart(true)
      })

      it('disables sdk without shutdown', () => {

        mainInstance.disable()

        expect(Logger.default.log).toHaveBeenCalledTimes(1)
        expect(Logger.default.log).toHaveBeenCalledWith('adjustSDK has been disabled')
        expect(Identity.disable).toHaveBeenCalledWith(undefined)

        expectNotShutDown()
      })

      it('initiates and prevents running all static methods and track event', () => {

        init()

        expect(Logger.default.log).toHaveBeenCalledWith('adjustSDK is disabled, can not start the sdk')

        expectNotStart()
        expectNotRunningStatic()
        expectNotRunningTrackEvent()
      })
    })
  })

  describe('initially disabled', () => {

    beforeAll(() => {
      ActivityState.default.state = {disabled: true}
    })

    describe('sdk: init -> disable -> enable', () => {
      afterAll(teardownAndDisable)


      it('prevents running all static methods and track event', () => {
        expectNotRunningStatic()
        expectNotRunningTrackEvent()
      })

      it('initiates and still prevents running all static methods and track event', () => {

        init()

        expectNotStart()
        expectNotRunningStatic()
        expectNotRunningTrackEvent()
      })

      it('fails to disable already disabled sdk', () => {

        mainInstance.disable()

        expect(Logger.default.log).toHaveBeenLastCalledWith('adjustSDK is already disabled')

        expectNotShutDown()
      })

      it('enables sdk with restart', () => {

        mainInstance.enable()

        expect.assertions(13)

        expect(Logger.default.log).toHaveBeenCalledTimes(1)
        expect(Logger.default.log).toHaveBeenCalledWith('adjustSDK has been enabled')
        expect(Identity.enable).toHaveBeenCalled()

        return expectStart() // +10 assertions
      })
    })

    describe('sdk: init -> enable -> disable', () => {
      afterAll(teardownAndDisable)

      it('initiates and prevents running all static methods and track event', () => {

        init()

        expect(Logger.default.log).toHaveBeenCalledWith('adjustSDK is disabled, can not start the sdk')

        expectNotStart()
        expectNotRunningStatic()
        expectNotRunningTrackEvent()
      })

      it('enables sdk with restart', () => {

        mainInstance.enable()

        expect.assertions(22)

        expect(Logger.default.log).toHaveBeenCalledTimes(1)
        expect(Logger.default.log).toHaveBeenCalledWith('adjustSDK has been enabled')
        expect(Identity.enable).toHaveBeenCalled()

        expectRunningStatic() // +7 asserts
        expectRunningTrackEvent() // +2 asserts
        return expectStart() // +10 assertions

      })

      it('fails to enable already enabled sdk', () => {

        mainInstance.enable()

        expect(Logger.default.log).toHaveBeenLastCalledWith('adjustSDK is already enabled')

        expectNotStart(true)
      })

      it('disables sdk with shutdown', () => {

        mainInstance.disable()

        expect(Logger.default.log).toHaveBeenCalledTimes(1)
        expect(Logger.default.log).toHaveBeenCalledWith('adjustSDK has been disabled')
        expect(Identity.disable).toHaveBeenCalledWith(undefined)

        expectShutDown()
      })

      it('prevents running all static methods and track event', () => {
        expectNotRunningStatic()
        expectNotRunningTrackEvent()
      })

      it('ensures that everything is shutdown', () => {
        expectAllDown()
      })
    })

    describe('sdk: init and enable and disable', () => {
      afterAll(teardownAndDisable)

      it('initiates, enables and disables one after another', () => {

        init()
        mainInstance.enable()
        mainInstance.disable()

        expect(Logger.default.log).toHaveBeenCalledWith('adjustSDK has been enabled')
        expect(Logger.default.log).toHaveBeenCalledWith('adjustSDK has been disabled')
        expect(Identity.enable).toHaveBeenCalled()
        expect(Identity.disable).toHaveBeenCalledWith(undefined)

        expectShutDown()

        return flushPromises()
      })

      it('ensures that everything is shutdown', () => {
        expectAllDown()
      })
    })

    describe('sdk: disable -> init -> enable', () => {
      afterAll(teardownAndDisable)

      it('prevents running all static methods amd track event', () => {
        expectNotRunningStatic()
        expectNotRunningTrackEvent()
      })

      it('fails to disable already disabled sdk', () => {

        mainInstance.disable()

        expect(Logger.default.log).toHaveBeenLastCalledWith('adjustSDK is already disabled')

        expectNotShutDown()
      })

      it('initiates and still prevents running all static methods and track event', () => {

        init()

        expect(Logger.default.log).toHaveBeenCalledWith('adjustSDK is disabled, can not start the sdk')

        expectNotStart()
        expectNotRunningStatic()
        expectNotRunningTrackEvent()
      })

      it('fails again to disable already disabled sdk', () => {

        mainInstance.disable()

        expect(Logger.default.log).toHaveBeenLastCalledWith('adjustSDK is already disabled')

        expectNotShutDown()
      })

      it('enables sdk with restart', () => {

        mainInstance.enable()

        expect.assertions(13)

        expect(Logger.default.log).toHaveBeenCalledTimes(1)
        expect(Logger.default.log).toHaveBeenCalledWith('adjustSDK has been enabled')
        expect(Identity.enable).toHaveBeenCalled()

        return expectStart() // +10 assertions
      })
    })

    describe('sdk: enable -> init -> disable', () => {
      afterAll(teardownAndDisable)

      it('enables sdk without restart', () => {

        mainInstance.enable(true)

        expect(Logger.default.log).toHaveBeenCalledTimes(1)
        expect(Logger.default.log).toHaveBeenCalledWith('adjustSDK has been enabled')
        expect(Identity.enable).toHaveBeenCalled()

        expectNotStart()
      })

      it('runs all static methods', () => {
        expectRunningStatic()
      })

      it('prevents running track event', () => {
        expectNotRunningTrackEvent(true)
      })

      it('initiates and runs all static methods and track event', () => {

        init()

        expect.assertions(19)

        expectRunningStatic()  // +7 assertions
        expectRunningTrackEvent() // +2 assertion
        return expectStart() // +10 assertions
      })

      it('fails to enable already enabled sdk', () => {

        mainInstance.enable()

        expect(Logger.default.log).toHaveBeenLastCalledWith('adjustSDK is already enabled')

        expectNotStart(true)
      })

      it('disables sdk with shutdown', () => {

        mainInstance.disable()

        expect(Logger.default.log).toHaveBeenCalledTimes(1)
        expect(Logger.default.log).toHaveBeenCalledWith('adjustSDK has been disabled')
        expect(Identity.disable).toHaveBeenCalledWith(undefined)

        expectShutDown()
      })
    })

    describe('sdk: enable and init and disable', () => {
      afterAll(teardownAndDisable)

      it('enables, initiates and disables one after another', () => {

        mainInstance.enable()
        init()
        mainInstance.disable()

        expect(Logger.default.log).toHaveBeenCalledWith('adjustSDK has been enabled')
        expect(Logger.default.log).toHaveBeenCalledWith('adjustSDK has been disabled')
        expect(Identity.enable).toHaveBeenCalled()
        expect(Identity.disable).toHaveBeenCalledWith(undefined)

        expectShutDown()

        return flushPromises()
      })

      it('ensures that everything is shutdown', () => {
        expectAllDown()
      })
    })

    describe('sdk: disable -> enable -> init', () => {
      afterAll(teardownAndDisable)

      it('fails to disable already disabled sdk', () => {

        mainInstance.disable()

        expect(Logger.default.log).toHaveBeenLastCalledWith('adjustSDK is already disabled')

        expectNotShutDown()
      })

      it('enables sdk without restart', () => {

        mainInstance.enable()

        expect(Logger.default.log).toHaveBeenCalledTimes(1)
        expect(Logger.default.log).toHaveBeenCalledWith('adjustSDK has been enabled')
        expect(Identity.enable).toHaveBeenCalled()

        expectNotStart()
      })

      it('initiates and runs all static methods and track event', () => {

        init()

        expect.assertions(19)

        expectRunningStatic() // +7 assertions
        expectRunningTrackEvent() // +2 assertions
        return expectStart() // +10 assertions
      })
    })

    describe('sdk: enable -> disable -> init', () => {
      afterAll(teardownAndDisable)

      it('enables sdk without restart', () => {

        mainInstance.enable(true)

        expect(Logger.default.log).toHaveBeenCalledTimes(1)
        expect(Logger.default.log).toHaveBeenCalledWith('adjustSDK has been enabled')
        expect(Identity.enable).toHaveBeenCalled()

        expectNotStart()
      })

      it('disables sdk without shutdown', () => {

        mainInstance.disable()

        expect(Logger.default.log).toHaveBeenCalledTimes(1)
        expect(Logger.default.log).toHaveBeenCalledWith('adjustSDK has been disabled')
        expect(Identity.disable).toHaveBeenCalledWith(undefined)

        expectNotShutDown()
      })

      it('initiates and prevents running all static methods and track event', () => {

        init()

        expect(Logger.default.log).toHaveBeenCalledWith('adjustSDK is disabled, can not start the sdk')

        expectNotStart()
        expectNotRunningStatic()
        expectNotRunningTrackEvent()
      })
    })

  })

  describe('test GDPR-Forget-Me request', () => {

    const gdprRequst = {
      url: '/gdpr_forget_device',
      method: 'POST'
    }

    describe('initially enabled', () => {

      beforeAll(() => {
        ActivityState.default.state = {disabled: false}
      })

      describe('sdk: init -> forget -> flush', () => {
        afterAll(teardown)

        it('initiates and runs all static methods and track event', () => {

          init()

          expect.assertions(19)

          expectRunningStatic() // +7 assertions
          expectRunningTrackEvent() // +2 assertions
          return expectStart() // +10 assertions
        })

        it('pushes forget-me request to queue', () => {

          mainInstance.gdprForgetMe()

          expect(Queue.push).toHaveBeenCalledWith(gdprRequst)
        })

        it('fails to push forget-me request to queue again', () => {
          mainInstance.gdprForgetMe()

          expect(Queue.push).not.toHaveBeenCalled()
          expect(Logger.default.log).toHaveBeenLastCalledWith('adjustSDK already sent GDPR Forget Me request')
        })

        it('keeps running all static methods and track event', () => {
          expectRunningStatic()
          expectRunningTrackEvent()
        })

        it('flush forget-me event and disables with shutdown', () => {
          expectGdprForgetMeCallback()
          expectShutDownAndClear()
        })

        it('fails to enable sdk after GDPR-Forget-Me has taken effect', () => {

          mainInstance.enable()

          expect(Logger.default.log).toHaveBeenLastCalledWith('adjustSDK is disabled due to GDPR-Forget-me request and it can not be re-enabled')

        })

        it('prevents running all static methods and track event', () => {
          expectNotRunningStatic()
          expectNotRunningTrackEvent()
        })
      })

      describe('sdk: init -> flush -> forget', () => {
        afterAll(teardown)

        beforeAll(() => {
          init()
        })

        it('flush forget-me event and disables with shutdown', () => {
          expectGdprForgetMeCallback()
          expectShutDownAndClear()
        })

        it('prevents running all static methods and track event', () => {
          expectNotRunningStatic()
          expectNotRunningTrackEvent()
        })

        it('fails to push forget-me request to queue because already forgotten', () => {
          mainInstance.gdprForgetMe()

          expect(Queue.push).not.toHaveBeenCalled()
          expect(Logger.default.log).toHaveBeenLastCalledWith('adjustSDK is already GDPR forgotten')
        })
      })

      describe('sdk: forget -> init -> flush', () => {
        afterAll(teardown)

        it('does not push forget-me request to queue yet', () => {
          mainInstance.gdprForgetMe()

          expect(Queue.push).not.toHaveBeenCalled()
          expect(Logger.default.log).toHaveBeenCalledWith('adjustSDK will run GDPR Forget Me request after initialisation')
        })

        it('fails again to push forget-me request to queue', () => {
          mainInstance.gdprForgetMe()

          expect(Queue.push).not.toHaveBeenCalled()
          expect(Logger.default.log).toHaveBeenLastCalledWith('adjustSDK already sent GDPR Forget Me request')
        })

        it('initiates and runs all static methods and track event and pushes forget-me to queue', () => {

          init()

          expect.assertions(20)

          expectRunningStatic() // +7 assertions
          expectRunningTrackEvent() // +2 assertions
          return expectStart() // +10 assertions
            .then(() => {
              expect(Queue.push).toHaveBeenCalledWith(gdprRequst)
            })
        })

        it('flush forget-me event and disables with shutdown', () => {
          expectGdprForgetMeCallback()
          expectShutDownAndClear()
        })
      })

      describe('sdk: forget -> flush -> init', () => {
        afterAll(teardown)

        it('does not push forget-me request to queue yet', () => {
          mainInstance.gdprForgetMe()

          expect(Queue.push).not.toHaveBeenCalled()
        })

        it('flush forget-me event but ignores it', () => {
          expectNotGdprForgetMeCallback()
          expectNotShutDownAndClear()
        })

        it('initiates and runs all static methods and track event and pushes forget-me to queue', () => {

          init()

          expect.assertions(20)

          expectRunningStatic() // +7 assertions
          expectRunningTrackEvent() // +2 assertions
          return expectStart() // +10 assertions
            .then(() => {
              expect(Queue.push).toHaveBeenCalledWith(gdprRequst)
            })
        })
      })
    })

    describe('initially GDPR disabled', () => {

      beforeAll(() => {
        ActivityState.default.state = {disabled: true, reason: 'gdpr'}
      })

      describe('sdk: init -> forget -> flush', () => {
        afterAll(() => teardownAndDisable('gdpr'))

        it('initiates and prevents running all static methods and track event', () => {

          init()

          expect(Logger.default.log).toHaveBeenLastCalledWith('adjustSDK is disabled, can not start the sdk')

          expectNotStart()
          expectNotRunningStatic()
          expectNotRunningTrackEvent()
        })

        it('fails to push forget-me request to queue', () => {

          mainInstance.gdprForgetMe()

          expect(Queue.push).not.toHaveBeenCalled()
          expect(Logger.default.log).toHaveBeenLastCalledWith('adjustSDK is already GDPR forgotten')
        })

        it('prevents running all static methods and track event', () => {
          expectNotRunningStatic()
          expectNotRunningTrackEvent()
        })

        it('flush forget-me event but ignores it', () => {
          expectNotGdprForgetMeCallback()
          expectNotShutDownAndClear()
        })

        it('fails to enable sdk', () => {

          mainInstance.enable()

          expect(Logger.default.log).toHaveBeenLastCalledWith('adjustSDK is disabled due to GDPR-Forget-me request and it can not be re-enabled')

        })
      })

      describe('sdk: init -> flush -> forget', () => {
        afterAll(() => teardownAndDisable('gdpr'))

        it('initiates and flush forget-me event but ignores it', () => {

          init()

          expect(Logger.default.log).toHaveBeenLastCalledWith('adjustSDK is disabled, can not start the sdk')

          Logger.default.log.mockClear()

          expectNotGdprForgetMeCallback()
          expectNotShutDownAndClear()
        })

        it('prevents running all static methods and track event', () => {
          expectNotRunningStatic()
          expectNotRunningTrackEvent()
        })

        it('fails to push forget-me request to queue', () => {

          mainInstance.gdprForgetMe()

          expect(Queue.push).not.toHaveBeenCalled()
          expect(Logger.default.log).toHaveBeenLastCalledWith('adjustSDK is already GDPR forgotten')
        })
      })

      describe('sdk: forget -> init -> flush', () => {
        afterAll(() => teardownAndDisable('gdpr'))

        it('does not push forget-me request to queue yet', () => {
          mainInstance.gdprForgetMe()

          expect(Queue.push).not.toHaveBeenCalled()
          expect(Logger.default.log).toHaveBeenLastCalledWith('adjustSDK is already GDPR forgotten')
        })

        it('initiates but prevents all static methods and track event and fails to push forget-me request to queue', () => {

          init()

          expect(Logger.default.log).toHaveBeenCalledTimes(1)
          expect(Logger.default.log).toHaveBeenCalledWith('adjustSDK is disabled, can not start the sdk')

          expectNotStart()
          expectNotRunningStatic()
          expectNotRunningTrackEvent()
          expect(Queue.push).not.toHaveBeenCalled()
        })

        it('flush forget-me event but ignores it', () => {
          expectNotGdprForgetMeCallback()
          expectNotShutDownAndClear()
        })

      })

      describe('sdk: forget -> flush -> init', () => {
        afterAll(() => teardownAndDisable('gdpr'))

        it('does not push forget-me request to queue yet', () => {
          mainInstance.gdprForgetMe()

          expect(Queue.push).not.toHaveBeenCalled()
          expect(Logger.default.log).toHaveBeenLastCalledWith('adjustSDK is already GDPR forgotten')
        })

        it('flush forget-me event but ignores it', () => {
          expectNotGdprForgetMeCallback()
          expectNotShutDownAndClear()
        })

        it('initiates but prevents all static methods and track event and fails to push forget-me request to queue', () => {

          init()

          expect(Logger.default.log).toHaveBeenCalledTimes(1)
          expect(Logger.default.log).toHaveBeenCalledWith('adjustSDK is disabled, can not start the sdk')

          expectNotStart()
          expectNotRunningStatic()
          expectNotRunningTrackEvent()
          expect(Queue.push).not.toHaveBeenCalled()
        })
      })

    })

    describe('initially disabled in general', () => {

      beforeAll(() => {
        ActivityState.default.state = {disabled: true}
      })

      describe('sdk: init -> forget -> flush', () => {
        afterAll(() => teardownAndDisable())

        it('initiates and prevents running all static methods and track event', () => {

          init()

          expect(Logger.default.log).toHaveBeenLastCalledWith('adjustSDK is disabled, can not start the sdk')

          expectNotStart()
          expectNotRunningStatic()
          expectNotRunningTrackEvent()
        })

        it('fails to push forget-me request to queue', () => {

          mainInstance.gdprForgetMe()

          expect(Queue.push).not.toHaveBeenCalled()
          expect(Logger.default.log).toHaveBeenLastCalledWith('adjustSDK is already disabled')
        })

        it('prevents running all static methods and track event', () => {
          expectNotRunningStatic()
          expectNotRunningTrackEvent()
        })

        it('flush forget-me event but ignores it', () => {
          expectNotGdprForgetMeCallback()
          expectNotShutDownAndClear()
        })

        it('enables sdk with restart', () => {

          mainInstance.enable()

          expect.assertions(13)

          expect(Logger.default.log).toHaveBeenCalledTimes(1)
          expect(Logger.default.log).toHaveBeenCalledWith('adjustSDK has been enabled')
          expect(Identity.enable).toHaveBeenCalled()

          return expectStart() // +10 assertions

        })
      })

      describe('sdk: init -> flush -> forget', () => {
        afterAll(() => teardownAndDisable())

        it('initiates and flush forget-me event but ignores it', () => {

          init()

          expect(Logger.default.log).toHaveBeenLastCalledWith('adjustSDK is disabled, can not start the sdk')

          Logger.default.log.mockClear()

          expectNotGdprForgetMeCallback()
          expectNotShutDownAndClear()
        })

        it('prevents running all static methods and track event', () => {
          expectNotRunningStatic()
          expectNotRunningTrackEvent()
        })

        it('fails to push forget-me request to queue', () => {

          mainInstance.gdprForgetMe()

          expect(Queue.push).not.toHaveBeenCalled()
          expect(Logger.default.log).toHaveBeenLastCalledWith('adjustSDK is already disabled')
        })
      })

      describe('sdk: forget -> init -> flush', () => {
        afterAll(() => teardownAndDisable())

        it('does not push forget-me request to queue yet', () => {
          mainInstance.gdprForgetMe()

          expect(Queue.push).not.toHaveBeenCalled()
          expect(Logger.default.log).toHaveBeenLastCalledWith('adjustSDK is already disabled')
        })

        it('initiates but prevents all static methods and track event and fails to push forget-me request to queue', () => {

          init()

          expect(Logger.default.log).toHaveBeenCalledTimes(1)
          expect(Logger.default.log).toHaveBeenCalledWith('adjustSDK is disabled, can not start the sdk')

          expectNotStart()
          expectNotRunningStatic()
          expectNotRunningTrackEvent()
          expect(Queue.push).not.toHaveBeenCalled()
        })

        it('flush forget-me event but ignores it', () => {
          expectNotGdprForgetMeCallback()
          expectNotShutDownAndClear()
        })

      })

      describe('sdk: forget -> flush -> init', () => {
        afterAll(() => teardownAndDisable())

        it('does not push forget-me request to queue yet', () => {
          mainInstance.gdprForgetMe()

          expect(Queue.push).not.toHaveBeenCalled()
          expect(Logger.default.log).toHaveBeenLastCalledWith('adjustSDK is already disabled')
        })

        it('flush forget-me event but ignores it', () => {
          expectNotGdprForgetMeCallback()
          expectNotShutDownAndClear()
        })

        it('initiates but prevents all static methods and track event and fails to push forget-me request to queue', () => {

          init()

          expect(Logger.default.log).toHaveBeenCalledTimes(1)
          expect(Logger.default.log).toHaveBeenCalledWith('adjustSDK is disabled, can not start the sdk')

          expectNotStart()
          expectNotRunningStatic()
          expectNotRunningTrackEvent()
          expect(Queue.push).not.toHaveBeenCalled()
        })
      })

    })
  })
})


