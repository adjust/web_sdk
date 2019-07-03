/* eslint-disable */
import * as PubSub from '../../pub-sub'
import * as Queue from '../../queue'
import * as Session from '../../session'
import * as event from '../../event'
import * as Identity from '../../identity'
import * as GlobalParams from '../../global-params'
import * as Logger from '../../logger'
import * as StorageManager from '../../storage-manager'
import * as Attribution from '../../attribution'
import * as SdkClick from '../../sdk-click'
import mainInstance from '../../main.js'
import {flushPromises, randomInRange} from './../_helper'

import {
  config,
  expectStart,
  expectNotStart,
  expectRunningTrackEvent,
  expectNotRunningTrackEvent,
  expectRunningStatic,
  expectNotRunningStatic,
  expectShutDown,
  expectNotShutDown,
  expectAllUp,
  expectAllDown,
  teardown
} from './_main-helper'
import * as State from '../../state'

jest.mock('../../request')
jest.mock('../../logger')
jest.useFakeTimers()

describe('main entry point - test enable/disable when in initially enabled state', () => {

  beforeAll(() => {
    const now = Date.now()
    jest.spyOn(Date, 'now').mockImplementation(() => now + randomInRange(1000, 9999))
    jest.spyOn(event, 'default')
    jest.spyOn(Queue, 'run')
    jest.spyOn(Queue, 'setOffline')
    jest.spyOn(Queue, 'destroy')
    jest.spyOn(Session, 'watch')
    jest.spyOn(Session, 'destroy')
    jest.spyOn(GlobalParams, 'get')
    jest.spyOn(GlobalParams, 'add')
    jest.spyOn(GlobalParams, 'remove')
    jest.spyOn(GlobalParams, 'removeAll')
    jest.spyOn(Logger.default, 'error')
    jest.spyOn(Logger.default, 'log')
    jest.spyOn(Identity, 'start')
    jest.spyOn(Identity, 'disable')
    jest.spyOn(Identity, 'enable')
    jest.spyOn(Identity, 'destroy')
    jest.spyOn(PubSub, 'subscribe')
    jest.spyOn(PubSub, 'destroy')
    jest.spyOn(Attribution, 'check')
    jest.spyOn(Attribution, 'destroy')
    jest.spyOn(SdkClick, 'destroy')
    jest.spyOn(StorageManager.default, 'destroy')
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  afterAll(() => {
    jest.clearAllTimers()
    jest.restoreAllMocks()
    State.default.disabled = null
  })


  describe('sdk: init -> disable -> enable', () => {
    afterAll(() => {
      teardown(mainInstance)
    })

    it('initiates and runs all static methods and track event', () => {

      mainInstance.init(config)

      const a1 = expectRunningStatic(mainInstance)
      const a2 = expectRunningTrackEvent(mainInstance)
      const a3 = expectStart()

      expect.assertions(a1.assertions + a2.assertions + a3.assertions)

      return a3.promise
    })

    it('disables sdk with shutdown', () => {

      mainInstance.disable()

      expect(Logger.default.log).toHaveBeenCalledTimes(1)
      expect(Logger.default.log).toHaveBeenCalledWith('adjustSDK has been disabled')
      expect(Identity.disable).toHaveBeenCalledWith(undefined)

      expectShutDown()
    })

    it('prevents running all static methods and track event', () => {
      expectNotRunningStatic(mainInstance)
      expectNotRunningTrackEvent(mainInstance)
    })

    it('fails to disable already disabled sdk', () => {

      mainInstance.disable()

      expect(Logger.default.log).toHaveBeenLastCalledWith('adjustSDK is already disabled')

      expectNotShutDown()
    })

    it('enables sdk with restart', () => {

      mainInstance.enable()

      const a = expectStart()

      expect.assertions(3 + a.assertions)

      expect(Logger.default.log).toHaveBeenCalledTimes(1)
      expect(Logger.default.log).toHaveBeenCalledWith('adjustSDK has been enabled')
      expect(Identity.enable).toHaveBeenCalled()

      return a.promise
    })
  })

  describe('sdk: init and disable and enable', () => {
    afterAll(() => {
      teardown(mainInstance)
    })

    it('initiates, disables and enables one after another', () => {

      mainInstance.init(config)
      mainInstance.disable()
      mainInstance.enable()

      expect(Logger.default.log).toHaveBeenCalledWith('adjustSDK has been disabled')
      expect(Logger.default.log).toHaveBeenCalledWith('adjustSDK has been enabled')
      expect(Identity.disable).toHaveBeenCalledWith(undefined)
      expect(Identity.enable).toHaveBeenCalled()

      return flushPromises()
    })

    it('ensures that everything is up', () => {
      return expectAllUp(mainInstance)
    })
  })

  describe('sdk: init -> enable -> disable', () => {
    afterAll(() => {
      teardown(mainInstance)
    })

    it('initiates and runs all static methods and track event', () => {

      mainInstance.init(config)

      const a1 = expectRunningStatic(mainInstance)
      const a2 = expectRunningTrackEvent(mainInstance)
      const a3 = expectStart()

      expect.assertions(a1.assertions + a2.assertions + a3.assertions)

      return a3.promise
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
      expectNotRunningStatic(mainInstance)
      expectNotRunningTrackEvent(mainInstance)
    })
  })

  describe('sdk: disable -> init -> enable', () => {
    afterAll(() => {
      teardown(mainInstance)
    })

    it('disables sdk without shutdown', () => {

      mainInstance.disable()

      expect(Logger.default.log).toHaveBeenCalledTimes(1)
      expect(Logger.default.log).toHaveBeenCalledWith('adjustSDK has been disabled')
      expect(Identity.disable).toHaveBeenCalledWith(undefined)

      expectNotShutDown()
    })

    it('prevents running all static methods and track event', () => {
      expectNotRunningStatic(mainInstance)
      expectNotRunningTrackEvent(mainInstance)
    })

    it('initiates and still prevents running all static methods and track event', () => {

      mainInstance.init(config)

      expect(Logger.default.log).toHaveBeenCalledWith('adjustSDK is disabled, can not start the sdk')

      expectNotStart()
      expectNotRunningStatic(mainInstance)
      expectNotRunningTrackEvent(mainInstance)
    })

    it('fails to disable already disabled sdk', () => {

      mainInstance.disable()

      expect(Logger.default.log).toHaveBeenLastCalledWith('adjustSDK is already disabled')

      expectNotShutDown()
    })

    it('enables sdk with restart', () => {

      mainInstance.enable()

      const a = expectStart()

      expect.assertions(3 + a.assertions)

      expect(Logger.default.log).toHaveBeenCalledTimes(1)
      expect(Logger.default.log).toHaveBeenCalledWith('adjustSDK has been enabled')
      expect(Identity.enable).toHaveBeenCalled()

      return a.promise
    })
  })

  describe('sdk: enable -> init -> disable', () => {

    afterAll(() => {
      teardown(mainInstance)
    })

    it('runs all static methods', () => {
      expectRunningStatic(mainInstance)
    })

    it('prevents running track event', () => {
      expectNotRunningTrackEvent(mainInstance, true)
    })

    it('fails to enable already enabled sdk', () => {

      mainInstance.enable()

      expect(Logger.default.log).toHaveBeenLastCalledWith('adjustSDK is already enabled')

      expectNotStart(true)
    })

    it('initiates and runs all static methods and track event', () => {

      mainInstance.init(config)

      expect.assertions(19)

      const a1 = expectRunningStatic(mainInstance)
      const a2 = expectRunningTrackEvent(mainInstance)
      const a3 = expectStart()

      expect.assertions(a1.assertions + a2.assertions + a3.assertions)

      return a3.promise
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
    afterAll(() => {
      teardown(mainInstance)
    })

    it('enables, initiates and disable one after another', () => {

      mainInstance.enable()
      mainInstance.init(config)
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
    afterAll(() => {
      teardown(mainInstance)
    })

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

      mainInstance.init(config)

      expect.assertions(19)

      const a1 = expectRunningStatic(mainInstance)
      const a2 = expectRunningTrackEvent(mainInstance)
      const a3 = expectStart()

      expect.assertions(a1.assertions + a2.assertions + a3.assertions)

      return a3.promise
    })
  })

  describe('sdk: enable -> disable -> init', () => {
    afterAll(() => {
      teardown(mainInstance)
    })

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

      mainInstance.init(config)

      expect(Logger.default.log).toHaveBeenCalledWith('adjustSDK is disabled, can not start the sdk')

      expectNotStart()
      expectNotRunningStatic(mainInstance)
      expectNotRunningTrackEvent(mainInstance)
    })
  })

})


