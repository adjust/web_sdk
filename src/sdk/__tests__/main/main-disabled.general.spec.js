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
import Suite from './main.suite'

jest.mock('../../request')
jest.mock('../../logger')
jest.useFakeTimers()

describe('main entry point - test disable/enable when in initially disabled state', () => {

  const suite = Suite(AdjustInstance)

  beforeAll(() => {
    const now = Date.now()
    jest.spyOn(Date, 'now').mockImplementation(() => now + Utils.randomInRange(1000, 9999))
    jest.spyOn(event, 'default')
    jest.spyOn(sdkClick, 'default')
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
    jest.spyOn(StorageManager.default, 'destroy')
    jest.spyOn(GdprForgetDevice, 'check')

    State.default.disabled = {reason: 'general'}
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
      suite.teardownAndDisable()
    })

    it('prevents running all static methods and track event', () => {
      suite.expectNotRunningStatic()
      suite.expectNotRunningTrackEvent()
    })

    it('initiates and still prevents running all static methods and track event', () => {

      AdjustInstance.initSdk(suite.config)

      suite.expectNotStart()
      suite.expectNotRunningStatic()
      suite.expectNotRunningTrackEvent()
    })

    it('fails to disable already disabled sdk', () => {

      AdjustInstance.stop()

      expect(Logger.default.log).toHaveBeenLastCalledWith('Adjust SDK is already disabled')

      suite.expectNotShutDown()
    })

    it('enables sdk with restart', () => {

      AdjustInstance.restart()

      const a = suite.expectStart()

      expect.assertions(3 + a.assertions)

      expect(Logger.default.log).toHaveBeenCalledTimes(1)
      expect(Logger.default.log).toHaveBeenCalledWith('Adjust SDK has been enabled')
      expect(Identity.enable).toHaveBeenCalled()

      return a.promise
    })
  })

  describe('sdk: init -> enable -> disable', () => {
    afterAll(() => {
      suite.teardownAndDisable()
    })

    it('initiates and prevents running all static methods and track event', () => {

      AdjustInstance.initSdk(suite.config)

      expect(Logger.default.log).toHaveBeenCalledWith('Adjust SDK is disabled, can not start the sdk')

      suite.expectNotStart()
      suite.expectNotRunningStatic()
      suite.expectNotRunningTrackEvent()
    })

    it('enables sdk with restart', () => {

      AdjustInstance.restart()

      expect.assertions(22)

      expect(Logger.default.log).toHaveBeenCalledTimes(1)
      expect(Logger.default.log).toHaveBeenCalledWith('Adjust SDK has been enabled')
      expect(Identity.enable).toHaveBeenCalled()

      const a1 = suite.expectRunningStatic()
      const a2 = suite.expectRunningTrackEvent()
      const a3 = suite.expectStart()

      expect.assertions(3 + a1.assertions + a2.assertions + a3.assertions)

      return a3.promise

    })

    it('fails to enable already enabled sdk', () => {

      AdjustInstance.restart()

      expect(Logger.default.log).toHaveBeenLastCalledWith('Adjust SDK is already enabled')

      suite.expectNotStart(true)
    })

    it('disables sdk with shutdown', () => {

      AdjustInstance.stop()

      expect(Logger.default.log).toHaveBeenCalledTimes(1)
      expect(Logger.default.log).toHaveBeenCalledWith('Adjust SDK has been disabled')
      expect(Identity.disable).toHaveBeenCalled()

      suite.expectShutDown()
    })

    it('prevents running all static methods and track event', () => {
      suite.expectNotRunningStatic()
      suite.expectNotRunningTrackEvent()
    })

    it('ensures that everything is shutdown', () => {
      suite.expectAllDown()
    })
  })

  describe('sdk: init and enable and disable', () => {
    afterAll(() => {
      suite.teardownAndDisable()
    })

    it('initiates, enables and disables one after another', () => {

      AdjustInstance.initSdk(suite.config)
      AdjustInstance.restart()
      AdjustInstance.stop()

      expect(Logger.default.log).toHaveBeenCalledWith('Adjust SDK has been enabled')
      expect(Logger.default.log).toHaveBeenCalledWith('Adjust SDK has been disabled')
      expect(Identity.enable).toHaveBeenCalled()
      expect(Identity.disable).toHaveBeenCalled()

      suite.expectShutDown()

      return Utils.flushPromises()
    })

    it('ensures that everything is shutdown', () => {
      suite.expectAllDown()
    })
  })

  describe('sdk: disable -> init -> enable', () => {
    afterAll(() => {
      suite.teardownAndDisable()
    })

    it('prevents running all static methods amd track event', () => {
      suite.expectNotRunningStatic()
      suite.expectNotRunningTrackEvent()
    })

    it('fails to disable already disabled sdk', () => {

      AdjustInstance.stop()

      expect(Logger.default.log).toHaveBeenLastCalledWith('Adjust SDK is already disabled')

      suite.expectNotShutDown()
    })

    it('initiates and still prevents running all static methods and track event', () => {

      AdjustInstance.initSdk(suite.config)

      expect(Logger.default.log).toHaveBeenCalledWith('Adjust SDK is disabled, can not start the sdk')

      suite.expectNotStart()
      suite.expectNotRunningStatic()
      suite.expectNotRunningTrackEvent()
    })

    it('fails again to disable already disabled sdk', () => {

      AdjustInstance.stop()

      expect(Logger.default.log).toHaveBeenLastCalledWith('Adjust SDK is already disabled')

      suite.expectNotShutDown()
    })

    it('enables sdk with restart', () => {

      AdjustInstance.restart()

      const a = suite.expectStart()

      expect.assertions(3 + a.assertions)

      expect(Logger.default.log).toHaveBeenCalledTimes(1)
      expect(Logger.default.log).toHaveBeenCalledWith('Adjust SDK has been enabled')
      expect(Identity.enable).toHaveBeenCalled()

      return a.promise
    })
  })

  describe('sdk: enable -> init -> disable', () => {
    afterAll(() => {
      suite.teardownAndDisable()
    })

    it('enables sdk without restart', () => {

      AdjustInstance.restart()

      expect(Logger.default.log).toHaveBeenCalledTimes(1)
      expect(Logger.default.log).toHaveBeenCalledWith('Adjust SDK has been enabled')
      expect(Identity.enable).toHaveBeenCalled()

      suite.expectNotStart()
    })

    it('runs all static methods', () => {
      suite.expectRunningStatic()
    })

    it('prevents running track event', () => {
      suite.expectNotRunningTrackEvent(true)
    })

    it('initiates and runs all static methods and track event', () => {

      AdjustInstance.initSdk(suite.config)

      const a1 = suite.expectRunningStatic()
      const a2 = suite.expectRunningTrackEvent()
      const a3 = suite.expectStart()

      expect.assertions(a1.assertions + a2.assertions + a3.assertions)

      return a3.promise
    })

    it('fails to enable already enabled sdk', () => {

      AdjustInstance.restart()

      expect(Logger.default.log).toHaveBeenLastCalledWith('Adjust SDK is already enabled')

      suite.expectNotStart(true)
    })

    it('disables sdk with shutdown', () => {

      AdjustInstance.stop()

      expect(Logger.default.log).toHaveBeenCalledTimes(1)
      expect(Logger.default.log).toHaveBeenCalledWith('Adjust SDK has been disabled')
      expect(Identity.disable).toHaveBeenCalled()

      suite.expectShutDown()
    })
  })

  describe('sdk: enable and init and disable', () => {
    afterAll(() => {
      suite.teardownAndDisable()
    })

    it('enables, initiates and disables one after another', () => {

      AdjustInstance.restart()
      AdjustInstance.initSdk(suite.config)
      AdjustInstance.stop()

      expect(Logger.default.log).toHaveBeenCalledWith('Adjust SDK has been enabled')
      expect(Logger.default.log).toHaveBeenCalledWith('Adjust SDK has been disabled')
      expect(Identity.enable).toHaveBeenCalled()
      expect(Identity.disable).toHaveBeenCalled()

      suite.expectShutDown()

      return Utils.flushPromises()
    })

    it('ensures that everything is shutdown', () => {
      suite.expectAllDown()
    })
  })

  describe('sdk: disable -> enable -> init', () => {
    afterAll(() => {
      suite.teardownAndDisable()
    })

    it('fails to disable already disabled sdk', () => {

      AdjustInstance.stop()

      expect(Logger.default.log).toHaveBeenLastCalledWith('Adjust SDK is already disabled')

      suite.expectNotShutDown()
    })

    it('enables sdk without restart', () => {

      AdjustInstance.restart()

      expect(Logger.default.log).toHaveBeenCalledTimes(1)
      expect(Logger.default.log).toHaveBeenCalledWith('Adjust SDK has been enabled')
      expect(Identity.enable).toHaveBeenCalled()

      suite.expectNotStart()
    })

    it('initiates and runs all static methods and track event', () => {

      AdjustInstance.initSdk(suite.config)

      const a1 = suite.expectRunningStatic()
      const a2 = suite.expectRunningTrackEvent()
      const a3 = suite.expectStart()

      expect.assertions(a1.assertions + a2.assertions + a3.assertions)

      return a3.promise
    })
  })

  describe('sdk: enable -> disable -> init', () => {
    afterAll(() => {
      suite.teardownAndDisable()
    })

    it('enables sdk without restart', () => {

      AdjustInstance.restart()

      expect(Logger.default.log).toHaveBeenCalledTimes(1)
      expect(Logger.default.log).toHaveBeenCalledWith('Adjust SDK has been enabled')
      expect(Identity.enable).toHaveBeenCalled()

      suite.expectNotStart()
    })

    it('disables sdk without shutdown', () => {

      AdjustInstance.stop()

      expect(Logger.default.log).toHaveBeenCalledTimes(1)
      expect(Logger.default.log).toHaveBeenCalledWith('Adjust SDK has been disabled')
      expect(Identity.disable).toHaveBeenCalled()

      suite.expectNotShutDown()
    })

    it('initiates and prevents running all static methods and track event', () => {

      AdjustInstance.initSdk(suite.config)

      expect(Logger.default.log).toHaveBeenCalledWith('Adjust SDK is disabled, can not start the sdk')

      suite.expectNotStart()
      suite.expectNotRunningStatic()
      suite.expectNotRunningTrackEvent()
    })
  })
})


