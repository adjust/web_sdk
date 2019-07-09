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
  expectAllDown,
  teardownAndDisable
} from './_main-helper'
import * as State from '../../state'

jest.mock('../../request')
jest.mock('../../logger')
jest.useFakeTimers()

describe('main entry point - test disable/enable when in initially disabled state', () => {

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

    State.default.disabled = 'general'
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  afterAll(() => {
    jest.clearAllTimers()
    jest.restoreAllMocks()
  })


  describe('sdk: init -> disable -> enable', () => {
    afterAll(() => {
      teardownAndDisable(mainInstance)
    })

    it('prevents running all static methods and track event', () => {
      expectNotRunningStatic(mainInstance)
      expectNotRunningTrackEvent(mainInstance)
    })

    it('initiates and still prevents running all static methods and track event', () => {

      mainInstance.init(config)

      expectNotStart()
      expectNotRunningStatic(mainInstance)
      expectNotRunningTrackEvent(mainInstance)
    })

    it('fails to disable already disabled sdk', () => {

      mainInstance.disable()

      expect(Logger.default.log).toHaveBeenLastCalledWith('Adjust SDK is already disabled')

      expectNotShutDown()
    })

    it('enables sdk with restart', () => {

      mainInstance.enable()

      const a = expectStart()

      expect.assertions(3 + a.assertions)

      expect(Logger.default.log).toHaveBeenCalledTimes(1)
      expect(Logger.default.log).toHaveBeenCalledWith('Adjust SDK has been enabled')
      expect(Identity.enable).toHaveBeenCalled()

      return a.promise
    })
  })

  describe('sdk: init -> enable -> disable', () => {
    afterAll(() => {
      teardownAndDisable(mainInstance)
    })

    it('initiates and prevents running all static methods and track event', () => {

      mainInstance.init(config)

      expect(Logger.default.log).toHaveBeenCalledWith('Adjust SDK is disabled, can not start the sdk')

      expectNotStart()
      expectNotRunningStatic(mainInstance)
      expectNotRunningTrackEvent(mainInstance)
    })

    it('enables sdk with restart', () => {

      mainInstance.enable()

      expect.assertions(22)

      expect(Logger.default.log).toHaveBeenCalledTimes(1)
      expect(Logger.default.log).toHaveBeenCalledWith('Adjust SDK has been enabled')
      expect(Identity.enable).toHaveBeenCalled()

      const a1 = expectRunningStatic(mainInstance)
      const a2 = expectRunningTrackEvent(mainInstance)
      const a3 = expectStart()

      expect.assertions(3 + a1.assertions + a2.assertions + a3.assertions)

      return a3.promise

    })

    it('fails to enable already enabled sdk', () => {

      mainInstance.enable()

      expect(Logger.default.log).toHaveBeenLastCalledWith('Adjust SDK is already enabled')

      expectNotStart(true)
    })

    it('disables sdk with shutdown', () => {

      mainInstance.disable()

      expect(Logger.default.log).toHaveBeenCalledTimes(1)
      expect(Logger.default.log).toHaveBeenCalledWith('Adjust SDK has been disabled')
      expect(Identity.disable).toHaveBeenCalledWith(undefined)

      expectShutDown()
    })

    it('prevents running all static methods and track event', () => {
      expectNotRunningStatic(mainInstance)
      expectNotRunningTrackEvent(mainInstance)
    })

    it('ensures that everything is shutdown', () => {
      expectAllDown()
    })
  })

  describe('sdk: init and enable and disable', () => {
    afterAll(() => {
      teardownAndDisable(mainInstance)
    })

    it('initiates, enables and disables one after another', () => {

      mainInstance.init(config)
      mainInstance.enable()
      mainInstance.disable()

      expect(Logger.default.log).toHaveBeenCalledWith('Adjust SDK has been enabled')
      expect(Logger.default.log).toHaveBeenCalledWith('Adjust SDK has been disabled')
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
    afterAll(() => {
      teardownAndDisable(mainInstance)
    })

    it('prevents running all static methods amd track event', () => {
      expectNotRunningStatic(mainInstance)
      expectNotRunningTrackEvent(mainInstance)
    })

    it('fails to disable already disabled sdk', () => {

      mainInstance.disable()

      expect(Logger.default.log).toHaveBeenLastCalledWith('Adjust SDK is already disabled')

      expectNotShutDown()
    })

    it('initiates and still prevents running all static methods and track event', () => {

      mainInstance.init(config)

      expect(Logger.default.log).toHaveBeenCalledWith('Adjust SDK is disabled, can not start the sdk')

      expectNotStart()
      expectNotRunningStatic(mainInstance)
      expectNotRunningTrackEvent(mainInstance)
    })

    it('fails again to disable already disabled sdk', () => {

      mainInstance.disable()

      expect(Logger.default.log).toHaveBeenLastCalledWith('Adjust SDK is already disabled')

      expectNotShutDown()
    })

    it('enables sdk with restart', () => {

      mainInstance.enable()

      const a = expectStart()

      expect.assertions(3 + a.assertions)

      expect(Logger.default.log).toHaveBeenCalledTimes(1)
      expect(Logger.default.log).toHaveBeenCalledWith('Adjust SDK has been enabled')
      expect(Identity.enable).toHaveBeenCalled()

      return a.promise
    })
  })

  describe('sdk: enable -> init -> disable', () => {
    afterAll(() => {
      teardownAndDisable(mainInstance)
    })

    it('enables sdk without restart', () => {

      mainInstance.enable(true)

      expect(Logger.default.log).toHaveBeenCalledTimes(1)
      expect(Logger.default.log).toHaveBeenCalledWith('Adjust SDK has been enabled')
      expect(Identity.enable).toHaveBeenCalled()

      expectNotStart()
    })

    it('runs all static methods', () => {
      expectRunningStatic(mainInstance)
    })

    it('prevents running track event', () => {
      expectNotRunningTrackEvent(mainInstance, true)
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

      expect(Logger.default.log).toHaveBeenLastCalledWith('Adjust SDK is already enabled')

      expectNotStart(true)
    })

    it('disables sdk with shutdown', () => {

      mainInstance.disable()

      expect(Logger.default.log).toHaveBeenCalledTimes(1)
      expect(Logger.default.log).toHaveBeenCalledWith('Adjust SDK has been disabled')
      expect(Identity.disable).toHaveBeenCalledWith(undefined)

      expectShutDown()
    })
  })

  describe('sdk: enable and init and disable', () => {
    afterAll(() => {
      teardownAndDisable(mainInstance)
    })

    it('enables, initiates and disables one after another', () => {

      mainInstance.enable()
      mainInstance.init(config)
      mainInstance.disable()

      expect(Logger.default.log).toHaveBeenCalledWith('Adjust SDK has been enabled')
      expect(Logger.default.log).toHaveBeenCalledWith('Adjust SDK has been disabled')
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
    afterAll(() => {
      teardownAndDisable(mainInstance)
    })

    it('fails to disable already disabled sdk', () => {

      mainInstance.disable()

      expect(Logger.default.log).toHaveBeenLastCalledWith('Adjust SDK is already disabled')

      expectNotShutDown()
    })

    it('enables sdk without restart', () => {

      mainInstance.enable()

      expect(Logger.default.log).toHaveBeenCalledTimes(1)
      expect(Logger.default.log).toHaveBeenCalledWith('Adjust SDK has been enabled')
      expect(Identity.enable).toHaveBeenCalled()

      expectNotStart()
    })

    it('initiates and runs all static methods and track event', () => {

      mainInstance.init(config)

      const a1 = expectRunningStatic(mainInstance)
      const a2 = expectRunningTrackEvent(mainInstance)
      const a3 = expectStart()

      expect.assertions(a1.assertions + a2.assertions + a3.assertions)

      return a3.promise
    })
  })

  describe('sdk: enable -> disable -> init', () => {
    afterAll(() => {
      teardownAndDisable(mainInstance)
    })

    it('enables sdk without restart', () => {

      mainInstance.enable(true)

      expect(Logger.default.log).toHaveBeenCalledTimes(1)
      expect(Logger.default.log).toHaveBeenCalledWith('Adjust SDK has been enabled')
      expect(Identity.enable).toHaveBeenCalled()

      expectNotStart()
    })

    it('disables sdk without shutdown', () => {

      mainInstance.disable()

      expect(Logger.default.log).toHaveBeenCalledTimes(1)
      expect(Logger.default.log).toHaveBeenCalledWith('Adjust SDK has been disabled')
      expect(Identity.disable).toHaveBeenCalledWith(undefined)

      expectNotShutDown()
    })

    it('initiates and prevents running all static methods and track event', () => {

      mainInstance.init(config)

      expect(Logger.default.log).toHaveBeenCalledWith('Adjust SDK is disabled, can not start the sdk')

      expectNotStart()
      expectNotRunningStatic(mainInstance)
      expectNotRunningTrackEvent(mainInstance)
    })
  })
})


