import * as PubSub from '../../pub-sub'
import * as Queue from '../../queue'
import * as Session from '../../session'
import * as event from '../../event'
import * as sdkClick from '../../sdk-click'
import * as Identity from '../../identity'
import * as Disable from '../../disable'
import * as GlobalParams from '../../global-params'
import * as Logger from '../../logger'
import * as Storage from '../../storage/storage'
import * as Attribution from '../../attribution'
import * as Preferences from '../../preferences'
import * as GdprForgetDevice from '../../gdpr-forget-device'
import * as Listeners from '../../listeners'
import * as Scheduler from '../../scheduler'
import * as ActivityState from '../../activity-state'
import AdjustInstance from '../../main.js'
import Suite from './main.suite'

jest.mock('../../http')
jest.mock('../../logger')
jest.useFakeTimers()

describe('main entry point - test enable/disable when in initially enabled state', () => {

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
    jest.spyOn(Identity, 'destroy')
    jest.spyOn(Disable, 'disable')
    jest.spyOn(Disable, 'restore')
    jest.spyOn(PubSub, 'subscribe')
    jest.spyOn(PubSub, 'destroy')
    jest.spyOn(Attribution, 'check')
    jest.spyOn(Attribution, 'destroy')
    jest.spyOn(Storage.default, 'destroy')
    jest.spyOn(GdprForgetDevice, 'check')
    jest.spyOn(Listeners, 'register')
    jest.spyOn(Listeners, 'destroy')
    jest.spyOn(Scheduler, 'delay')
    jest.spyOn(Scheduler, 'flush')
    jest.spyOn(ActivityState.default, 'getWebUUID')
    jest.spyOn(ActivityState.default, 'getAttribution')
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  afterAll(() => {
    jest.clearAllTimers()
    jest.restoreAllMocks()
    Preferences.setDisabled(null)
  })


  describe('sdk: init -> disable -> enable', () => {
    afterAll(() => {
      suite.teardown()
    })

    it('initiates and runs all static methods and track event', () => {

      AdjustInstance.initSdk(suite.config)

      return Utils.flushPromises()
        .then(() => {
          jest.runOnlyPendingTimers()

          const a1 = suite.expectRunningStatic()
          const a2 = suite.expectDelayedTrackEvent_Async()
          const a3 = suite.expectStart_Async()

          expect.assertions(a1.assertions + a2.assertions + a3.assertions)

          return Promise.all([a2.promise, a3.promise])
        })
    })

    it('disables sdk with shutdown', () => {

      AdjustInstance.stop()

      expect(Logger.default.log).toHaveBeenCalledWith('Adjust SDK disable process is now finished')
      expect(Disable.disable).toHaveBeenCalled()

      suite.expectShutDown()
    })

    it('prevents running all static methods and track event', async () => {
      expect.assertions(22)

      suite.expectNotRunningStatic()
      await suite.expectNotRunningTrackEvent()
    })

    it('fails to disable already disabled sdk', () => {

      AdjustInstance.stop()

      expect(Logger.default.log).toHaveBeenLastCalledWith('Adjust SDK disable process has already finished')

      suite.expectNotShutDown()
    })

    it('enables sdk with restart', () => {

      AdjustInstance.restart()

      expect(Logger.default.log).toHaveBeenCalledTimes(1)
      expect(Logger.default.log).toHaveBeenCalledWith('Adjust SDK has been enabled')
      expect(Disable.restore).toHaveBeenCalled()

      const a = suite.expectStart_Async()

      return a.promise.then(() => {
        expect.assertions(3 + a.assertions)
      })
    })
  })

  describe('sdk: init and disable and enable', () => {
    afterAll(() => {
      suite.teardown()
    })

    it('initiates, disables and enables one after another', () => {
      expect.assertions(4)

      AdjustInstance.initSdk(suite.config)

      return Utils.flushPromises()
        .then(() => {
          AdjustInstance.stop()
          AdjustInstance.restart()

          expect(Logger.default.log).toHaveBeenCalledWith('Adjust SDK disable process is now finished')
          expect(Logger.default.log).toHaveBeenCalledWith('Adjust SDK has been enabled')
          expect(Disable.disable).toHaveBeenCalled()
          expect(Disable.restore).toHaveBeenCalled()
        })
    })

    it('ensures that everything is up', () => {
      const a = suite.expectAllUp_Async()

      return a.promise.then(() => {
        expect.assertions(a.assertions)
      })
    })
  })

  describe('sdk: init -> enable -> disable', () => {
    afterAll(() => {
      suite.teardown()
    })

    it('initiates and runs all static methods and track event', () => {

      AdjustInstance.initSdk(suite.config)

      return Utils.flushPromises()
        .then(() => {
          jest.runOnlyPendingTimers()

          const a1 = suite.expectRunningStatic()
          const a2 = suite.expectDelayedTrackEvent_Async()
          const a3 = suite.expectStart_Async()

          expect.assertions(a1.assertions + a2.assertions + a3.assertions)

          return Promise.all([a2.promise, a3.promise])
        })
    })

    it('fails to enable already enabled sdk', () => {

      AdjustInstance.restart()

      expect(Logger.default.log).toHaveBeenLastCalledWith('Adjust SDK is already enabled')

      suite.expectNotStart(true)
    })

    it('disables sdk with shutdown', () => {

      AdjustInstance.stop()

      expect(Logger.default.log).toHaveBeenCalledWith('Adjust SDK disable process is now finished')
      expect(Disable.disable).toHaveBeenCalled()

      suite.expectShutDown()
    })

    it('prevents running all static methods and track event', async () => {
      expect.assertions(22)

      suite.expectNotRunningStatic()
      await suite.expectNotRunningTrackEvent()
    })
  })

  describe('sdk: disable -> init -> enable', () => {
    afterAll(() => {
      suite.teardown()
    })

    it('disables sdk without shutdown', () => {

      AdjustInstance.stop()

      expect(Logger.default.log).toHaveBeenCalledTimes(1)
      expect(Logger.default.log).toHaveBeenCalledWith('Adjust SDK disable process is now finished')
      expect(Disable.disable).toHaveBeenCalled()

      suite.expectNotShutDown()
    })

    it('prevents running all static methods and track event', async () => {
      expect.assertions(22)

      suite.expectNotRunningStatic()
      await suite.expectNotRunningTrackEvent()
    })

    it('initiates and still prevents running all static methods and track event', () => {

      AdjustInstance.initSdk(suite.config)

      expect.assertions(33)

      return Utils.flushPromises()
        .then(() => {

          expect(Logger.default.log).toHaveBeenCalledWith('Adjust SDK is disabled, can not start the sdk')

          suite.expectNotStart()
          suite.expectNotRunningStatic()
          return suite.expectNotRunningTrackEvent()
        })
    })

    it('fails to disable already disabled sdk', () => {

      AdjustInstance.stop()

      expect(Logger.default.log).toHaveBeenLastCalledWith('Adjust SDK disable process has already finished')

      suite.expectNotShutDown()
    })

    it('enables sdk with restart', () => {

      AdjustInstance.restart()

      expect(Logger.default.log).toHaveBeenCalledTimes(1)
      expect(Logger.default.log).toHaveBeenCalledWith('Adjust SDK has been enabled')
      expect(Disable.restore).toHaveBeenCalled()

      const a = suite.expectStart_Async()

      return a.promise.then(() => {
        expect.assertions(3 + a.assertions)
      })
    })
  })

  describe('sdk: enable -> init -> disable', () => {

    afterAll(() => {
      suite.teardown()
    })

    it('runs all static methods', () => {
      suite.expectRunningStatic()
    })

    it('prevents running track event', async () => {
      expect.assertions(3)
      await suite.expectNotRunningTrackEventWhenNoInstance()
    })

    it('fails to enable already enabled sdk', () => {

      AdjustInstance.restart()

      expect(Logger.default.log).toHaveBeenLastCalledWith('Adjust SDK is already enabled')

      suite.expectNotStart(true)
    })

    it('initiates and runs all static methods and track event', () => {

      AdjustInstance.initSdk(suite.config)

      return Utils.flushPromises()
        .then(() => {
          jest.runOnlyPendingTimers()

          const a1 = suite.expectRunningStatic()
          const a2 = suite.expectDelayedTrackEvent_Async()
          const a3 = suite.expectStart_Async()

          expect.assertions(a1.assertions + a2.assertions + a3.assertions)

          return Promise.all([a2.promise, a3.promise])
        })
    })

    it('fails again to enable already enabled sdk', () => {

      AdjustInstance.restart()

      expect(Logger.default.log).toHaveBeenLastCalledWith('Adjust SDK is already enabled')

      suite.expectNotStart(true)
    })

    it('disables sdk with shutdown', () => {

      AdjustInstance.stop()

      expect(Logger.default.log).toHaveBeenCalledWith('Adjust SDK disable process is now finished')
      expect(Disable.disable).toHaveBeenCalled()

      suite.expectShutDown()
    })
  })

  describe('sdk: enable and init and disable', () => {
    afterAll(() => {
      suite.teardown()
    })

    it('enables, initiates and disable one after another', () => {

      AdjustInstance.restart()
      AdjustInstance.initSdk(suite.config)

      return Utils.flushPromises()
        .then(() => {
          AdjustInstance.stop()

          expect(Logger.default.log).toHaveBeenCalledWith('Adjust SDK is already enabled')
          expect(Logger.default.log).toHaveBeenCalledWith('Adjust SDK disable process is now finished')
          expect(Disable.disable).toHaveBeenCalled()

          return Utils.flushPromises()
        })
    })

    it('ensures that everything is shutdown', () => {
      suite.expectAllDown()
    })
  })

  describe('sdk: disable -> enable -> init', () => {
    afterAll(() => {
      suite.teardown()
    })

    it('disables sdk without shutdown', () => {

      AdjustInstance.stop()

      expect(Logger.default.log).toHaveBeenCalledTimes(1)
      expect(Logger.default.log).toHaveBeenCalledWith('Adjust SDK disable process is now finished')
      expect(Disable.disable).toHaveBeenCalled()

      suite.expectNotShutDown()
    })

    it('enables sdk without restart', () => {

      AdjustInstance.restart()

      expect(Logger.default.log).toHaveBeenCalledTimes(1)
      expect(Logger.default.log).toHaveBeenCalledWith('Adjust SDK has been enabled')
      expect(Disable.restore).toHaveBeenCalled()

      suite.expectNotStart()
    })

    it('initiates and runs all static methods and track event', () => {

      AdjustInstance.initSdk(suite.config)

      return Utils.flushPromises()
        .then(() => {
          jest.runOnlyPendingTimers()

          const a1 = suite.expectRunningStatic()
          const a2 = suite.expectDelayedTrackEvent_Async()
          const a3 = suite.expectStart_Async()

          expect.assertions(a1.assertions + a2.assertions + a3.assertions)

          return Promise.all([a2.promise, a3.promise])
        })
    })
  })

  describe('sdk: enable -> disable -> init', () => {
    afterAll(() => {
      suite.teardown()
    })

    it('fails to enable already enabled sdk', () => {

      AdjustInstance.restart()

      expect(Logger.default.log).toHaveBeenLastCalledWith('Adjust SDK is already enabled')

      suite.expectNotStart(true)
    })

    it('disables sdk without shutdown', () => {

      AdjustInstance.stop()

      expect(Logger.default.log).toHaveBeenCalledTimes(1)
      expect(Logger.default.log).toHaveBeenCalledWith('Adjust SDK disable process is now finished')
      expect(Disable.disable).toHaveBeenCalled()

      suite.expectNotShutDown()
    })

    it('initiates and prevents running all static methods and track event', () => {

      AdjustInstance.initSdk(suite.config)

      expect.assertions(33)

      return Utils.flushPromises()
        .then(() => {

          expect(Logger.default.log).toHaveBeenCalledWith('Adjust SDK is disabled, can not start the sdk')

          suite.expectNotStart()
          suite.expectNotRunningStatic()
          return suite.expectNotRunningTrackEvent()
        })
    })
  })

})


