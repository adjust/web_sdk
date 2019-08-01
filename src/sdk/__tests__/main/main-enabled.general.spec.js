import * as PubSub from '../../pub-sub'
import * as Queue from '../../queue'
import * as Session from '../../session'
import * as event from '../../event'
import * as sdkClick from '../../sdk-click'
import * as Identity from '../../identity'
import * as GlobalParams from '../../global-params'
import * as Logger from '../../logger'
import * as StorageManager from '../../storage/storage-manager'
import * as Attribution from '../../attribution'
import * as State from '../../state'
import * as GdprForgetDevice from '../../gdpr-forget-device'
import AdjustInstance from '../../main.js'
import {flushPromises, randomInRange} from './../_common'

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
} from './_main.common'

jest.mock('../../request')
jest.mock('../../logger')
jest.useFakeTimers()

describe('main entry point - test enable/disable when in initially enabled state', () => {

  beforeAll(() => {
    const now = Date.now()
    jest.spyOn(Date, 'now').mockImplementation(() => now + randomInRange(1000, 9999))
    jest.spyOn(event, 'default')
    jest.spyOn(sdkClick, 'default')
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
    jest.spyOn(StorageManager.default, 'destroy')
    jest.spyOn(GdprForgetDevice, 'check')
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
      teardown(AdjustInstance)
    })

    it('initiates and runs all static methods and track event', () => {

      AdjustInstance.init(config)

      const a1 = expectRunningStatic(AdjustInstance)
      const a2 = expectRunningTrackEvent(AdjustInstance)
      const a3 = expectStart()

      expect.assertions(a1.assertions + a2.assertions + a3.assertions)

      return a3.promise
    })

    it('disables sdk with shutdown', () => {

      AdjustInstance.disable()

      expect(Logger.default.log).toHaveBeenCalledTimes(1)
      expect(Logger.default.log).toHaveBeenCalledWith('Adjust SDK has been disabled')
      expect(Identity.disable).toHaveBeenCalledWith(undefined)

      expectShutDown()
    })

    it('prevents running all static methods and track event', () => {
      expectNotRunningStatic(AdjustInstance)
      expectNotRunningTrackEvent(AdjustInstance)
    })

    it('fails to disable already disabled sdk', () => {

      AdjustInstance.disable()

      expect(Logger.default.log).toHaveBeenLastCalledWith('Adjust SDK is already disabled')

      expectNotShutDown()
    })

    it('enables sdk with restart', () => {

      AdjustInstance.enable()

      const a = expectStart()

      expect.assertions(3 + a.assertions)

      expect(Logger.default.log).toHaveBeenCalledTimes(1)
      expect(Logger.default.log).toHaveBeenCalledWith('Adjust SDK has been enabled')
      expect(Identity.enable).toHaveBeenCalled()

      return a.promise
    })
  })

  describe('sdk: init and disable and enable', () => {
    afterAll(() => {
      teardown(AdjustInstance)
    })

    it('initiates, disables and enables one after another', () => {

      AdjustInstance.init(config)
      AdjustInstance.disable()
      AdjustInstance.enable()

      expect(Logger.default.log).toHaveBeenCalledWith('Adjust SDK has been disabled')
      expect(Logger.default.log).toHaveBeenCalledWith('Adjust SDK has been enabled')
      expect(Identity.disable).toHaveBeenCalledWith(undefined)
      expect(Identity.enable).toHaveBeenCalled()

      return flushPromises()
    })

    it('ensures that everything is up', () => {
      return expectAllUp(AdjustInstance)
    })
  })

  describe('sdk: init -> enable -> disable', () => {
    afterAll(() => {
      teardown(AdjustInstance)
    })

    it('initiates and runs all static methods and track event', () => {

      AdjustInstance.init(config)

      const a1 = expectRunningStatic(AdjustInstance)
      const a2 = expectRunningTrackEvent(AdjustInstance)
      const a3 = expectStart()

      expect.assertions(a1.assertions + a2.assertions + a3.assertions)

      return a3.promise
    })

    it('fails to enable already enabled sdk', () => {

      AdjustInstance.enable()

      expect(Logger.default.log).toHaveBeenLastCalledWith('Adjust SDK is already enabled')

      expectNotStart(true)
    })

    it('disables sdk with shutdown', () => {

      AdjustInstance.disable()

      expect(Logger.default.log).toHaveBeenCalledTimes(1)
      expect(Logger.default.log).toHaveBeenCalledWith('Adjust SDK has been disabled')
      expect(Identity.disable).toHaveBeenCalledWith(undefined)

      expectShutDown()
    })

    it('prevents running all static methods and track event', () => {
      expectNotRunningStatic(AdjustInstance)
      expectNotRunningTrackEvent(AdjustInstance)
    })
  })

  describe('sdk: disable -> init -> enable', () => {
    afterAll(() => {
      teardown(AdjustInstance)
    })

    it('disables sdk without shutdown', () => {

      AdjustInstance.disable()

      expect(Logger.default.log).toHaveBeenCalledTimes(1)
      expect(Logger.default.log).toHaveBeenCalledWith('Adjust SDK has been disabled')
      expect(Identity.disable).toHaveBeenCalledWith(undefined)

      expectNotShutDown()
    })

    it('prevents running all static methods and track event', () => {
      expectNotRunningStatic(AdjustInstance)
      expectNotRunningTrackEvent(AdjustInstance)
    })

    it('initiates and still prevents running all static methods and track event', () => {

      AdjustInstance.init(config)

      expect(Logger.default.log).toHaveBeenCalledWith('Adjust SDK is disabled, can not start the sdk')

      expectNotStart()
      expectNotRunningStatic(AdjustInstance)
      expectNotRunningTrackEvent(AdjustInstance)
    })

    it('fails to disable already disabled sdk', () => {

      AdjustInstance.disable()

      expect(Logger.default.log).toHaveBeenLastCalledWith('Adjust SDK is already disabled')

      expectNotShutDown()
    })

    it('enables sdk with restart', () => {

      AdjustInstance.enable()

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
      teardown(AdjustInstance)
    })

    it('runs all static methods', () => {
      expectRunningStatic(AdjustInstance)
    })

    it('prevents running track event', () => {
      expectNotRunningTrackEvent(AdjustInstance, true)
    })

    it('fails to enable already enabled sdk', () => {

      AdjustInstance.enable()

      expect(Logger.default.log).toHaveBeenLastCalledWith('Adjust SDK is already enabled')

      expectNotStart(true)
    })

    it('initiates and runs all static methods and track event', () => {

      AdjustInstance.init(config)

      expect.assertions(19)

      const a1 = expectRunningStatic(AdjustInstance)
      const a2 = expectRunningTrackEvent(AdjustInstance)
      const a3 = expectStart()

      expect.assertions(a1.assertions + a2.assertions + a3.assertions)

      return a3.promise
    })

    it('fails again to enable already enabled sdk', () => {

      AdjustInstance.enable()

      expect(Logger.default.log).toHaveBeenLastCalledWith('Adjust SDK is already enabled')

      expectNotStart(true)
    })

    it('disables sdk with shutdown', () => {

      AdjustInstance.disable()

      expect(Logger.default.log).toHaveBeenCalledTimes(1)
      expect(Logger.default.log).toHaveBeenCalledWith('Adjust SDK has been disabled')
      expect(Identity.disable).toHaveBeenCalledWith(undefined)

      expectShutDown()
    })
  })

  describe('sdk: enable and init and disable', () => {
    afterAll(() => {
      teardown(AdjustInstance)
    })

    it('enables, initiates and disable one after another', () => {

      AdjustInstance.enable()
      AdjustInstance.init(config)
      AdjustInstance.disable()

      expect(Logger.default.log).toHaveBeenCalledWith('Adjust SDK is already enabled')
      expect(Logger.default.log).toHaveBeenCalledWith('Adjust SDK has been disabled')
      expect(Identity.disable).toHaveBeenCalledWith(undefined)

      return flushPromises()
    })

    it('ensures that everything is shutdown', () => {
      expectAllDown()
    })
  })

  describe('sdk: disable -> enable -> init', () => {
    afterAll(() => {
      teardown(AdjustInstance)
    })

    it('disables sdk without shutdown', () => {

      AdjustInstance.disable()

      expect(Logger.default.log).toHaveBeenCalledTimes(1)
      expect(Logger.default.log).toHaveBeenCalledWith('Adjust SDK has been disabled')
      expect(Identity.disable).toHaveBeenCalledWith(undefined)

      expectNotShutDown()
    })

    it('enables sdk without restart', () => {

      AdjustInstance.enable()

      expect(Logger.default.log).toHaveBeenCalledTimes(1)
      expect(Logger.default.log).toHaveBeenCalledWith('Adjust SDK has been enabled')
      expect(Identity.enable).toHaveBeenCalled()

      expectNotStart()
    })

    it('initiates and runs all static methods and track event', () => {

      AdjustInstance.init(config)

      expect.assertions(19)

      const a1 = expectRunningStatic(AdjustInstance)
      const a2 = expectRunningTrackEvent(AdjustInstance)
      const a3 = expectStart()

      expect.assertions(a1.assertions + a2.assertions + a3.assertions)

      return a3.promise
    })
  })

  describe('sdk: enable -> disable -> init', () => {
    afterAll(() => {
      teardown(AdjustInstance)
    })

    it('fails to enable already enabled sdk', () => {

      AdjustInstance.enable()

      expect(Logger.default.log).toHaveBeenLastCalledWith('Adjust SDK is already enabled')

      expectNotStart(true)
    })

    it('disables sdk without shutdown', () => {

      AdjustInstance.disable()

      expect(Logger.default.log).toHaveBeenCalledTimes(1)
      expect(Logger.default.log).toHaveBeenCalledWith('Adjust SDK has been disabled')
      expect(Identity.disable).toHaveBeenCalledWith(undefined)

      expectNotShutDown()
    })

    it('initiates and prevents running all static methods and track event', () => {

      AdjustInstance.init(config)

      expect(Logger.default.log).toHaveBeenCalledWith('Adjust SDK is disabled, can not start the sdk')

      expectNotStart()
      expectNotRunningStatic(AdjustInstance)
      expectNotRunningTrackEvent(AdjustInstance)
    })
  })

})


