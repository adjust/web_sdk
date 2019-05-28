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
import * as QuickStorage from '../quick-storage'
import * as Attribution from '../attribution'
import mainInstance from '../main.js'
import sameInstance from '../main.js'
import {flushPromises} from './_helper'
import {setDisabled} from '../identity'

jest.mock('../request')
jest.mock('../logger')
jest.useFakeTimers()

const external = {
  attributionCb () {}
}

function expectShutDown () {
  expect(Queue.destroy).toHaveBeenCalled()
  expect(PubSub.destroy).toHaveBeenCalled()
  expect(Session.destroy).toHaveBeenCalled()
  expect(Attribution.destroy).toHaveBeenCalled()
  expect(StorageManager.default.destroy).toHaveBeenCalled()

  expect(Config.default.baseParams.appToken).toEqual('')
  expect(Config.default.baseParams.environment).toEqual('')
  expect(Config.default.baseParams.osName).toEqual('unknown')
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

function expectStart (withAttributionCb) {

  expect(Config.default.baseParams.appToken).toEqual('some-app-token')
  expect(Config.default.baseParams.environment).toEqual('production')
  expect(Config.default.baseParams.osName).toEqual('unknown')

  expect(PubSub.subscribe.mock.calls[0][0]).toEqual('sdk:gdpr-forget-me')

  if (withAttributionCb) {
    expect(PubSub.subscribe.mock.calls[1][0]).toEqual('attribution:change')
    expect(PubSub.subscribe.mock.calls[1][1]).toEqual(external.attributionCb)
  }

  expect(Identity.startActivityState).toHaveBeenCalledTimes(1)

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
    expect(Config.default.baseParams.osName).toEqual('unknown')
  }

  expect(PubSub.subscribe).not.toHaveBeenCalled()
  expect(Identity.startActivityState).not.toHaveBeenCalled()
  expect(Queue.run).not.toHaveBeenCalled()
  expect(Session.watch).not.toHaveBeenCalled()

}

function expectRunningTrackEvent () {

  mainInstance.trackEvent({eventToken: 'blabla'})

  expect(event.default).toHaveBeenCalledWith({eventToken: 'blabla'})

}

function expectNotRunningTrackEvent (noInstance) {

  mainInstance.trackEvent({eventToken: 'blabla'})

  if (noInstance) {
    expect(Logger.default.error).toHaveBeenLastCalledWith('adjustSDK is not initiated, can not track event')
  } else {
    expect(Logger.default.log).toHaveBeenLastCalledWith('adjustSDK is disabled, can not track event')
  }

  expect(event.default).not.toHaveBeenCalled()

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

function teardown () {
  mainInstance.destroy()
  localStorage.clear()
  jest.clearAllMocks()
}

function teardownAndDisable (reason = 'general') {
  teardown()
  QuickStorage.default.state = {disabled: true, reason}
}

describe('main entry point functionality', () => {

  beforeAll(() => {
    jest.spyOn(external, 'attributionCb')
    jest.spyOn(event, 'default').mockImplementation(() => {})
    jest.spyOn(Time, 'getTimestamp').mockReturnValue('some-time')
    jest.spyOn(Logger.default, 'error')
    jest.spyOn(Logger.default, 'log')
    jest.spyOn(Logger.default, 'info')
    jest.spyOn(Queue, 'push').mockImplementation(() => {})
    jest.spyOn(Queue, 'run').mockImplementation(() => {})
    jest.spyOn(Queue, 'setOffline').mockImplementation(() => {})
    jest.spyOn(Queue, 'destroy').mockImplementation(() => {})
    jest.spyOn(Queue, 'clear').mockImplementation(() => {})
    jest.spyOn(Session, 'watch').mockImplementation(() => {})
    jest.spyOn(Identity, 'startActivityState')
    jest.spyOn(Identity, 'setDisabled')
    jest.spyOn(Identity, 'clear').mockImplementation(() => {})
    jest.spyOn(Identity, 'destroy')
    jest.spyOn(Session, 'watch').mockImplementation(() => {})
    jest.spyOn(Session, 'destroy').mockImplementation(() => {})
    jest.spyOn(GlobalParams, 'add').mockImplementation(() => {})
    jest.spyOn(GlobalParams, 'remove').mockImplementation(() => {})
    jest.spyOn(GlobalParams, 'removeAll').mockImplementation(() => {})
    jest.spyOn(GlobalParams, 'clear').mockImplementation(() => {})
    jest.spyOn(PubSub, 'subscribe')
    jest.spyOn(PubSub, 'destroy')
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
      mainInstance.init({
        appToken: 'some-app-token',
        environment: 'production',
        attributionCallback: external.attributionCb
      })
    })

    afterAll(teardown)

    it('sets basic configuration', () => {

      expect.assertions(9)

      return expectStart(true) // +9 assertions
    })

    it('calls client-defined attribution callback when attribution is changed', () => {

      PubSub.publish('attribution:change', {tracker_token: 'some-token'})

      jest.runAllTimers()

      expect(external.attributionCb).toHaveBeenCalledWith('attribution:change', {tracker_token: 'some-token'})

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
      expect(Config.default.baseParams.osName).toEqual('unknown')

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

        mainInstance.init({
          appToken: 'some-app-token',
          environment: 'production'
        })

        expect.assertions(15)

        expectRunningStatic() // +7 assertions
        expectRunningTrackEvent() // +1 assertions
        return expectStart() // +7 assertions
      })

      it('disables sdk with shutdown', () => {

        mainInstance.disable()

        expect(Logger.default.log).toHaveBeenCalledTimes(1)
        expect(Logger.default.log).toHaveBeenCalledWith('adjustSDK has been disabled')

        expect(Identity.setDisabled).toHaveBeenCalledWith(true, undefined)

        expectShutDown()
      })

      it('prevents running all static methods and track event', () => {
        expectNotRunningStatic()
        expectNotRunningTrackEvent()
      })

      it('fails to disable already disabled sdk', () => {

        mainInstance.disable()

        expect(Logger.default.log).toHaveBeenLastCalledWith('adjustSDK is already disabled')
        expect(Identity.setDisabled).not.toHaveBeenCalled()

        expectNotShutDown()
      })

      it('enables sdk with restart', () => {

        mainInstance.enable()

        expect.assertions(10)

        expect(Logger.default.log).toHaveBeenCalledTimes(1)
        expect(Logger.default.log).toHaveBeenCalledWith('adjustSDK has been enabled')

        expect(Identity.setDisabled).toHaveBeenCalledWith(false)

        return expectStart() // +7 assertions
      })
    })

    describe('sdk: init -> enable -> disable', () => {
      afterAll(teardown)

      it('initiates and runs all static methods and track event', () => {

        mainInstance.init({
          appToken: 'some-app-token',
          environment: 'production'
        })

        expect.assertions(15)

        expectRunningStatic() // +7 assertions
        expectRunningTrackEvent() // +1 assertions
        return expectStart() // +7 assertions
      })

      it('fails to enable already enabled sdk', () => {

        mainInstance.enable()

        expect(Logger.default.log).toHaveBeenLastCalledWith('adjustSDK is already enabled')
        expect(Identity.setDisabled).not.toHaveBeenCalled()

        expectNotStart(true)
      })

      it('disables sdk with shutdown', () => {

        mainInstance.disable()

        expect(Logger.default.log).toHaveBeenCalledTimes(1)
        expect(Logger.default.log).toHaveBeenCalledWith('adjustSDK has been disabled')

        expect(Identity.setDisabled).toHaveBeenCalledWith(true, undefined)

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

        expect(Identity.setDisabled).toHaveBeenCalledWith(true, undefined)

        expectNotShutDown()
      })

      it('prevents running all static methods and track event', () => {
        expectNotRunningStatic()
        expectNotRunningTrackEvent()
      })

      it('initiates and still prevents running all static methods and track event', () => {

        mainInstance.init({
          appToken: 'some-app-token',
          environment: 'production'
        }, true)

        expect(Logger.default.log).toHaveBeenCalledWith('adjustSDK is disabled, can not start the sdk')

        expectNotStart()
        expectNotRunningStatic()
        expectNotRunningTrackEvent()
      })

      it('fails to disable already disabled sdk', () => {

        mainInstance.disable()

        expect(Logger.default.log).toHaveBeenLastCalledWith('adjustSDK is already disabled')
        expect(Identity.setDisabled).not.toHaveBeenCalled()

        expectNotShutDown()
      })

      it('enables sdk with restart', () => {

        mainInstance.enable()

        expect.assertions(10)

        expect(Logger.default.log).toHaveBeenCalledTimes(1)
        expect(Logger.default.log).toHaveBeenCalledWith('adjustSDK has been enabled')

        expect(Identity.setDisabled).toHaveBeenCalledWith(false)

        return expectStart() // +7 assertions
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
        expect(Identity.setDisabled).not.toHaveBeenCalled()

        expectNotStart(true)
      })

      it('initiates and runs all static methods and track event', () => {

        mainInstance.init({
          appToken: 'some-app-token',
          environment: 'production'
        })

        expect.assertions(15)

        expectRunningStatic() // +7 assertions
        expectRunningTrackEvent() // +1 assertion
        return expectStart() // +7 assertions
      })

      it('fails again to enable already enabled sdk', () => {

        mainInstance.enable()

        expect(Logger.default.log).toHaveBeenLastCalledWith('adjustSDK is already enabled')
        expect(Identity.setDisabled).not.toHaveBeenCalled()

        expectNotStart(true)
      })

      it('disables sdk with shutdown', () => {

        mainInstance.disable()

        expect(Logger.default.log).toHaveBeenCalledTimes(1)
        expect(Logger.default.log).toHaveBeenCalledWith('adjustSDK has been disabled')

        expect(Identity.setDisabled).toHaveBeenCalledWith(true, undefined)

        expectShutDown()
      })
    })

    describe('sdk: disable -> enable -> init', () => {
      afterAll(teardown)

      it('disables sdk without shutdown', () => {

        mainInstance.disable()

        expect(Logger.default.log).toHaveBeenCalledTimes(1)
        expect(Logger.default.log).toHaveBeenCalledWith('adjustSDK has been disabled')

        expect(Identity.setDisabled).toHaveBeenCalledWith(true, undefined)

        expectNotShutDown()
      })

      it('enables sdk without restart', () => {

        mainInstance.enable()

        expect(Logger.default.log).toHaveBeenCalledTimes(1)
        expect(Logger.default.log).toHaveBeenCalledWith('adjustSDK has been enabled')

        expect(Identity.setDisabled).toHaveBeenCalledWith(false)

        expectNotStart()
      })

      it('initiates and runs all static methods and track event', () => {

        mainInstance.init({
          appToken: 'some-app-token',
          environment: 'production'
        })

        expect.assertions(15)

        expectRunningStatic() // +7 assertions
        expectRunningTrackEvent() // +1 assertions
        return expectStart() // +7 assertions
      })
    })

    describe('sdk: enable -> disable -> init', () => {
      afterAll(teardown)

      it('fails to enable already enabled sdk', () => {

        mainInstance.enable()

        expect(Logger.default.log).toHaveBeenLastCalledWith('adjustSDK is already enabled')
        expect(Identity.setDisabled).not.toHaveBeenCalled()

        expectNotStart(true)
      })

      it('disables sdk without shutdown', () => {

        mainInstance.disable()

        expect(Logger.default.log).toHaveBeenCalledTimes(1)
        expect(Logger.default.log).toHaveBeenCalledWith('adjustSDK has been disabled')

        expect(Identity.setDisabled).toHaveBeenCalledWith(true, undefined)

        expectNotShutDown()
      })

      it('initiates and prevents running all static methods and track event', () => {

        mainInstance.init({
          appToken: 'some-app-token',
          environment: 'production'
        })

        expect(Logger.default.log).toHaveBeenCalledWith('adjustSDK is disabled, can not start the sdk')

        expectNotStart()
        expectNotRunningStatic()
        expectNotRunningTrackEvent()
      })
    })
  })

  describe('initially disabled', () => {

    beforeAll(() => {
      QuickStorage.default.state = {disabled: true}
    })

    describe('sdk: init -> disable -> enable', () => {
      afterAll(teardownAndDisable)


      it('prevents running all static methods and track event', () => {
        expectNotRunningStatic()
        expectNotRunningTrackEvent()
      })

      it('initiates and still prevents running all static methods and track event', () => {

        mainInstance.init({
          appToken: 'some-app-token',
          environment: 'production'
        })

        expectNotStart()
        expectNotRunningStatic()
        expectNotRunningTrackEvent()
      })

      it('fails to disable already disabled sdk', () => {

        mainInstance.disable()

        expect(Logger.default.log).toHaveBeenLastCalledWith('adjustSDK is already disabled')
        expect(Identity.setDisabled).not.toHaveBeenCalled()

        expectNotShutDown()
      })

      it('enables sdk with restart', () => {

        mainInstance.enable()

        expect.assertions(10)

        expect(Logger.default.log).toHaveBeenCalledTimes(1)
        expect(Logger.default.log).toHaveBeenCalledWith('adjustSDK has been enabled')

        expect(Identity.setDisabled).toHaveBeenCalledWith(false)

        return expectStart() // +7 assertions
      })
    })

    describe('sdk: init -> enable -> disable', () => {
      afterAll(teardownAndDisable)

      it('initiates and prevents running all static methods and track event', () => {

        mainInstance.init({
          appToken: 'some-app-token',
          environment: 'production'
        })

        expect(Logger.default.log).toHaveBeenCalledWith('adjustSDK is disabled, can not start the sdk')

        expectNotStart()
        expectNotRunningStatic()
        expectNotRunningTrackEvent()
      })

      it('enables sdk with restart', () => {

        mainInstance.enable()

        expect.assertions(10)

        expect(Logger.default.log).toHaveBeenCalledTimes(1)
        expect(Logger.default.log).toHaveBeenCalledWith('adjustSDK has been enabled')

        expect(Identity.setDisabled).toHaveBeenCalledWith(false)

        return expectStart() // +7 assertions

      })

      it('runs all static methods and track event', () => {
        expectRunningStatic()
        expectRunningTrackEvent()
      })

      it('fails to enable already enabled sdk', () => {

        mainInstance.enable()

        expect(Logger.default.log).toHaveBeenLastCalledWith('adjustSDK is already enabled')
        expect(Identity.setDisabled).not.toHaveBeenCalled()

        expectNotStart(true)
      })

      it('disables sdk with shutdown', () => {

        mainInstance.disable()

        expect(Logger.default.log).toHaveBeenCalledTimes(1)
        expect(Logger.default.log).toHaveBeenCalledWith('adjustSDK has been disabled')

        expect(Identity.setDisabled).toHaveBeenCalledWith(true, undefined)

        expectShutDown()
      })

      it('prevents running all static methods and track event', () => {
        expectNotRunningStatic()
        expectNotRunningTrackEvent()
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
        expect(Identity.setDisabled).not.toHaveBeenCalled()

        expectNotShutDown()
      })

      it('initiates and still prevents running all static methods and track event', () => {

        mainInstance.init({
          appToken: 'some-app-token',
          environment: 'production'
        })

        expect(Logger.default.log).toHaveBeenCalledWith('adjustSDK is disabled, can not start the sdk')

        expectNotStart()
        expectNotRunningStatic()
        expectNotRunningTrackEvent()
      })

      it('fails again to disable already disabled sdk', () => {

        mainInstance.disable()

        expect(Logger.default.log).toHaveBeenLastCalledWith('adjustSDK is already disabled')
        expect(Identity.setDisabled).not.toHaveBeenCalled()

        expectNotShutDown()
      })

      it('enables sdk with restart', () => {

        mainInstance.enable()

        expect.assertions(10)

        expect(Logger.default.log).toHaveBeenCalledTimes(1)
        expect(Logger.default.log).toHaveBeenCalledWith('adjustSDK has been enabled')

        expect(Identity.setDisabled).toHaveBeenCalledWith(false)

        return expectStart() // +7 assertions
      })
    })

    describe('sdk: enable -> init -> disable', () => {
      afterAll(teardownAndDisable)

      it('enables sdk without restart', () => {

        mainInstance.enable(true)

        expect(Logger.default.log).toHaveBeenCalledTimes(1)
        expect(Logger.default.log).toHaveBeenCalledWith('adjustSDK has been enabled')

        expect(Identity.setDisabled).toHaveBeenCalledWith(false)

        expectNotStart()
      })

      it('runs all static methods', () => {
        expectRunningStatic()
      })

      it('prevents running track event', () => {
        expectNotRunningTrackEvent(true)
      })

      it('initiates and runs all static methods and track event', () => {

        mainInstance.init({
          appToken: 'some-app-token',
          environment: 'production'
        })

        expect.assertions(15)

        expectRunningStatic()  // +7 assertions
        expectRunningTrackEvent() // +1 assertion
        return expectStart() // +7 assertions
      })

      it('fails to enable already enabled sdk', () => {

        mainInstance.enable()

        expect(Logger.default.log).toHaveBeenLastCalledWith('adjustSDK is already enabled')
        expect(Identity.setDisabled).not.toHaveBeenCalled()

        expectNotStart(true)
      })

      it('disables sdk with shutdown', () => {

        mainInstance.disable()

        expect(Logger.default.log).toHaveBeenCalledTimes(1)
        expect(Logger.default.log).toHaveBeenCalledWith('adjustSDK has been disabled')

        expect(Identity.setDisabled).toHaveBeenCalledWith(true, undefined)

        expectShutDown()
      })
    })

    describe('sdk: disable -> enable -> init', () => {
      afterAll(teardownAndDisable)

      it('fails to disable already disabled sdk', () => {

        mainInstance.disable()

        expect(Logger.default.log).toHaveBeenLastCalledWith('adjustSDK is already disabled')
        expect(Identity.setDisabled).not.toHaveBeenCalled()

        expectNotShutDown()
      })

      it('enables sdk without restart', () => {

        mainInstance.enable()

        expect(Logger.default.log).toHaveBeenCalledTimes(1)
        expect(Logger.default.log).toHaveBeenCalledWith('adjustSDK has been enabled')

        expect(Identity.setDisabled).toHaveBeenCalledWith(false)

        expectNotStart()
      })

      it('initiates and runs all static methods and track event', () => {

        mainInstance.init({
          appToken: 'some-app-token',
          environment: 'production'
        })

        expect.assertions(15)

        expectRunningStatic() // +7 assertions
        expectRunningTrackEvent() // +1 assertions
        return expectStart() // +7 assertions
      })
    })

    describe('sdk: enable -> disable -> init', () => {
      afterAll(teardownAndDisable)

      it('enables sdk without restart', () => {

        mainInstance.enable(true)

        expect(Logger.default.log).toHaveBeenCalledTimes(1)
        expect(Logger.default.log).toHaveBeenCalledWith('adjustSDK has been enabled')

        expect(Identity.setDisabled).toHaveBeenCalledWith(false)

        expectNotStart()
      })

      it('disables sdk without shutdown', () => {

        mainInstance.disable()

        expect(Logger.default.log).toHaveBeenCalledTimes(1)
        expect(Logger.default.log).toHaveBeenCalledWith('adjustSDK has been disabled')

        expect(Identity.setDisabled).toHaveBeenCalledWith(true, undefined)

        expectNotShutDown()
      })

      it('initiates and prevents running all static methods and track event', () => {

        mainInstance.init({
          appToken: 'some-app-token',
          environment: 'production'
        })

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
      method: 'POST',
      params: {
        createdAt: 'some-time',
        appToken: 'some-app-token',
        environment: 'production',
        osName: 'unknown'
      }
    }

    describe('initially enabled', () => {

      beforeAll(() => {
        QuickStorage.default.state = {disabled: false}
      })

      describe('sdk: init -> forget -> flush', () => {
        afterAll(teardown)

        it('initiates and runs all static methods and track event', () => {

          mainInstance.init({
            appToken: 'some-app-token',
            environment: 'production'
          })

          expect.assertions(15)

          expectRunningStatic() // +7 assertions
          expectRunningTrackEvent() // +1 assertions
          return expectStart() // +7 assertions
        })

        it('pushes forget-me request to queue', () => {

          mainInstance.gdprForgetMe()

          expect(Queue.push).toHaveBeenCalledWith(gdprRequst)
        })

        it('keeps running all static methods and track event', () => {
          expectRunningStatic()
          expectRunningTrackEvent()
        })

        it('flush forget-me event and disables with shutdown', () => {

          PubSub.publish('sdk:gdpr-forget-me', true)

          jest.runOnlyPendingTimers()

          expect(Logger.default.log).toHaveBeenCalledTimes(1)
          expect(Logger.default.log).toHaveBeenCalledWith('adjustSDK has been disabled due to GDPR-Forget-Me request')
          expect(Identity.setDisabled).toHaveBeenCalledWith(true, 'gdpr')

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

        it('initiates and fails to flush forget-me event', () => {

          mainInstance.init({
            appToken: 'some-app-token',
            environment: 'production'
          })

          PubSub.publish('sdk:gdpr-forget-me', true)

          jest.runOnlyPendingTimers()

          expect(Logger.default.log).not.toHaveBeenCalled()
          expect(Identity.setDisabled).not.toHaveBeenCalledWith()

          expectNotShutDownAndClear()
        })

        it('keeps running all static methods and track event', () => {
          expectRunningStatic()
          expectRunningTrackEvent()
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

      })

      describe('sdk: forget -> init -> flush', () => {
        afterAll(teardown)

        it('does not push forget-me request to queue yet', () => {
          mainInstance.gdprForgetMe()

          expect(Queue.push).not.toHaveBeenCalled()
          expect(Logger.default.log).not.toHaveBeenCalled()
        })

        it('fails again to push forget-me request to queue', () => {
          mainInstance.gdprForgetMe()

          expect(Queue.push).not.toHaveBeenCalled()
          expect(Logger.default.log).toHaveBeenLastCalledWith('adjustSDK already sent GDPR Forget Me request')
        })

        it('initiates and runs all static methods and track event and pushes forget-me to queue', () => {

          mainInstance.init({
            appToken: 'some-app-token',
            environment: 'production'
          })

          expect.assertions(16)

          expectRunningStatic() // +7 assertions
          expectRunningTrackEvent() // +1 assertions
          return expectStart() // +7 assertions
            .then(() => {
              expect(Queue.push).toHaveBeenCalledWith(gdprRequst)
            })
        })

        it('flush forget-me event and disables with shutdown', () => {

          PubSub.publish('sdk:gdpr-forget-me', true)

          jest.runOnlyPendingTimers()

          expect(Logger.default.log).toHaveBeenCalledTimes(1)
          expect(Logger.default.log).toHaveBeenCalledWith('adjustSDK has been disabled due to GDPR-Forget-Me request')
          expect(Identity.setDisabled).toHaveBeenCalledWith(true, 'gdpr')

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

          PubSub.publish('sdk:gdpr-forget-me', true)

          jest.runOnlyPendingTimers()

          expect(Logger.default.log).not.toHaveBeenCalled()
          expect(Identity.setDisabled).not.toHaveBeenCalled()

          expectNotShutDownAndClear()
        })

        it('initiates and runs all static methods and track event and pushes forget-me to queue', () => {

          mainInstance.init({
            appToken: 'some-app-token',
            environment: 'production'
          })

          expect.assertions(16)

          expectRunningStatic() // +7 assertions
          expectRunningTrackEvent() // +1 assertions
          return expectStart() // +7 assertions
            .then(() => {
              expect(Queue.push).toHaveBeenCalledWith(gdprRequst)
            })
        })
      })
    })

    describe('initially GDPR disabled', () => {

      beforeAll(() => {
        QuickStorage.default.state = {disabled: true, reason: 'gdpr'}
      })

      describe('sdk: init -> forget -> flush', () => {
        afterAll(() => teardownAndDisable('gdpr'))

        it('initiates and prevents running all static methods and track event', () => {

          mainInstance.init({
            appToken: 'some-app-token',
            environment: 'production'
          })

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

          PubSub.publish('sdk:gdpr-forget-me', true)

          jest.runOnlyPendingTimers()

          expect(Logger.default.log).not.toHaveBeenCalled()
          expect(Identity.setDisabled).not.toHaveBeenCalled()

          expectNotShutDownAndClear()
        })

        it('fails to enable sdk', () => {

          mainInstance.enable()

          expect(Logger.default.log).toHaveBeenLastCalledWith('adjustSDK is disabled due to GDPR-Forget-me request and it can not be re-enabled')

        })
      })

      describe('sdk: init -> flush -> forget', () => {
        afterAll(() => teardownAndDisable('gdpr'))

        it('initiates and fails to flush forget-me event', () => {

          mainInstance.init({
            appToken: 'some-app-token',
            environment: 'production'
          })

          PubSub.publish('sdk:gdpr-forget-me', true)

          jest.runOnlyPendingTimers()

          expect(Logger.default.log).toHaveBeenLastCalledWith('adjustSDK is disabled, can not start the sdk')
          expect(Identity.setDisabled).not.toHaveBeenCalledWith()

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

          mainInstance.init({
            appToken: 'some-app-token',
            environment: 'production'
          })

          expect(Logger.default.log).toHaveBeenCalledTimes(1)
          expect(Logger.default.log).toHaveBeenCalledWith('adjustSDK is disabled, can not start the sdk')

          expectNotStart()
          expectNotRunningStatic()
          expectNotRunningTrackEvent()
          expect(Queue.push).not.toHaveBeenCalled()
        })

        it('flush forget-me event but ignores it', () => {

          PubSub.publish('sdk:gdpr-forget-me', true)

          jest.runOnlyPendingTimers()

          expect(Logger.default.log).not.toHaveBeenCalled()
          expect(Identity.setDisabled).not.toHaveBeenCalled()

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

          PubSub.publish('sdk:gdpr-forget-me', true)

          jest.runOnlyPendingTimers()

          expect(Logger.default.log).not.toHaveBeenCalled()
          expect(Identity.setDisabled).not.toHaveBeenCalled()

          expectNotShutDownAndClear()
        })

        it('initiates but prevents all static methods and track event and fails to push forget-me request to queue', () => {

          mainInstance.init({
            appToken: 'some-app-token',
            environment: 'production'
          })

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
        QuickStorage.default.state = {disabled: true}
      })

      describe('sdk: init -> forget -> flush', () => {
        afterAll(() => teardownAndDisable())

        it('initiates and prevents running all static methods and track event', () => {

          mainInstance.init({
            appToken: 'some-app-token',
            environment: 'production'
          })

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

          PubSub.publish('sdk:gdpr-forget-me', true)

          jest.runOnlyPendingTimers()

          expect(Logger.default.log).not.toHaveBeenCalled()
          expect(Identity.setDisabled).not.toHaveBeenCalled()

          expectNotShutDownAndClear()
        })

        it('enables sdk with restart', () => {

          mainInstance.enable()

          expect.assertions(10)

          expect(Logger.default.log).toHaveBeenCalledTimes(1)
          expect(Logger.default.log).toHaveBeenCalledWith('adjustSDK has been enabled')

          expect(Identity.setDisabled).toHaveBeenCalledWith(false)

          return expectStart() // +7 assertions

        })
      })

      describe('sdk: init -> flush -> forget', () => {
        afterAll(() => teardownAndDisable())

        it('initiates and fails to flush forget-me event', () => {

          mainInstance.init({
            appToken: 'some-app-token',
            environment: 'production'
          })

          PubSub.publish('sdk:gdpr-forget-me', true)

          jest.runOnlyPendingTimers()

          expect(Logger.default.log).toHaveBeenLastCalledWith('adjustSDK is disabled, can not start the sdk')
          expect(Identity.setDisabled).not.toHaveBeenCalledWith()

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

          mainInstance.init({
            appToken: 'some-app-token',
            environment: 'production'
          })

          expect(Logger.default.log).toHaveBeenCalledTimes(1)
          expect(Logger.default.log).toHaveBeenCalledWith('adjustSDK is disabled, can not start the sdk')

          expectNotStart()
          expectNotRunningStatic()
          expectNotRunningTrackEvent()
          expect(Queue.push).not.toHaveBeenCalled()
        })

        it('flush forget-me event but ignores it', () => {

          PubSub.publish('sdk:gdpr-forget-me', true)

          jest.runOnlyPendingTimers()

          expect(Logger.default.log).not.toHaveBeenCalled()
          expect(Identity.setDisabled).not.toHaveBeenCalled()

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

          PubSub.publish('sdk:gdpr-forget-me', true)

          jest.runOnlyPendingTimers()

          expect(Logger.default.log).not.toHaveBeenCalled()
          expect(Identity.setDisabled).not.toHaveBeenCalled()

          expectNotShutDownAndClear()
        })

        it('initiates but prevents all static methods and track event and fails to push forget-me request to queue', () => {

          mainInstance.init({
            appToken: 'some-app-token',
            environment: 'production'
          })

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


