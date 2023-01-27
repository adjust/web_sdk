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

    Preferences.setDisabled({ reason: 'general' })
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

    it('prevents running all static methods and track event', async () => {
      expect.assertions(22)

      suite.expectNotRunningStatic()
      await suite.expectNotRunningTrackEvent()
    })

    it('initiates and still prevents running all static methods and track event', () => {

      AdjustInstance.initSdk(suite.config)

      return Utils.flushPromises()
        .then(() => {
          jest.runOnlyPendingTimers()

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

  describe('sdk: init -> enable -> disable', () => {
    afterAll(() => {
      suite.teardownAndDisable()
    })

    it('initiates and prevents running all static methods and track event', () => {

      AdjustInstance.initSdk(suite.config)

      return Utils.flushPromises()
        .then(() => {
          jest.runOnlyPendingTimers()

          expect(Logger.default.log).toHaveBeenCalledWith('Adjust SDK is disabled, can not start the sdk')

          suite.expectNotStart()
          suite.expectNotRunningStatic()
          return suite.expectNotRunningTrackEvent()
        })
    })

    it('enables sdk with restart', () => {

      AdjustInstance.restart()

      expect(Logger.default.log).toHaveBeenCalledTimes(1)
      expect(Logger.default.log).toHaveBeenCalledWith('Adjust SDK has been enabled')
      expect(Disable.restore).toHaveBeenCalled()

      const a1 = suite.expectRunningStatic()
      const a2 = suite.expectDelayedTrackEvent_Async()
      const a3 = suite.expectStart_Async()

      return Promise.all([a2.promise, a3.promise])
        .then(() => {
          expect.assertions(3 + a1.assertions + a2.assertions + a3.assertions)
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

      return Utils.flushPromises()
        .then(() => {
          jest.runOnlyPendingTimers()

          AdjustInstance.restart()
          AdjustInstance.stop()

          expect(Logger.default.log).toHaveBeenCalledWith('Adjust SDK has been enabled')
          expect(Logger.default.log).toHaveBeenCalledWith('Adjust SDK disable process is now finished')
          expect(Disable.restore).toHaveBeenCalled()
          expect(Disable.disable).toHaveBeenCalled()

          suite.expectShutDown()

          return Utils.flushPromises()
        })
    })

    it('ensures that everything is shutdown', () => {
      suite.expectAllDown()
    })
  })

  describe('sdk: disable -> init -> enable', () => {
    afterAll(() => {
      suite.teardownAndDisable()
    })

    it('prevents running all static methods amd track event', async () => {
      expect.assertions(22)

      suite.expectNotRunningStatic()
      await suite.expectNotRunningTrackEvent()
    })

    it('fails to disable already disabled sdk', () => {

      AdjustInstance.stop()

      expect(Logger.default.log).toHaveBeenLastCalledWith('Adjust SDK disable process has already finished')

      suite.expectNotShutDown()
    })

    it('initiates and still prevents running all static methods and track event', () => {

      AdjustInstance.initSdk(suite.config)

      return Utils.flushPromises()
        .then(() => {
          jest.runOnlyPendingTimers()

          expect(Logger.default.log).toHaveBeenCalledWith('Adjust SDK is disabled, can not start the sdk')

          suite.expectNotStart()
          suite.expectNotRunningStatic()
          return suite.expectNotRunningTrackEvent()
        })
    })

    it('fails again to disable already disabled sdk', () => {

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
      suite.teardownAndDisable()
    })

    it('enables sdk without restart', () => {

      AdjustInstance.restart()

      expect(Logger.default.log).toHaveBeenCalledTimes(1)
      expect(Logger.default.log).toHaveBeenCalledWith('Adjust SDK has been enabled')
      expect(Disable.restore).toHaveBeenCalled()

      suite.expectNotStart()
    })

    it('runs all static methods', () => {
      suite.expectRunningStatic()
    })

    it('prevents running track event', async () => {
      expect.assertions(3)
      await suite.expectNotRunningTrackEventWhenNoInstance()
    })

    it('initiates and runs all static methods and track event', () => {

      AdjustInstance.initSdk(suite.config)

      return Utils.flushPromises()
        .then(() => {
          jest.runOnlyPendingTimers()

          const a1 = suite.expectRunningStatic()
          const a2 = suite.expectDelayedTrackEvent_Async()
          const a3 = suite.expectStart_Async()

          return Promise.all([a2.promise, a3.promise]).then(() => {
            expect.assertions(a1.assertions + a2.assertions + a3.assertions)
          })
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
  })

  describe('sdk: enable and init and disable', () => {
    afterAll(() => {
      suite.teardownAndDisable()
    })

    it('enables, initiates and disables one after another', () => {

      AdjustInstance.restart()
      AdjustInstance.initSdk(suite.config)

      return Utils.flushPromises()
        .then(() => {
          jest.runOnlyPendingTimers()

          AdjustInstance.stop()

          expect(Logger.default.log).toHaveBeenCalledWith('Adjust SDK has been enabled')
          expect(Logger.default.log).toHaveBeenCalledWith('Adjust SDK disable process is now finished')
          expect(Disable.restore).toHaveBeenCalled()
          expect(Disable.disable).toHaveBeenCalled()

          suite.expectShutDown()

          return Utils.flushPromises()
        })
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

      expect(Logger.default.log).toHaveBeenLastCalledWith('Adjust SDK disable process has already finished')

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

          return Promise.all([a2.promise, a3.promise])
            .then(() => {
              expect.assertions(a1.assertions + a2.assertions + a3.assertions)

              return Utils.flushPromises()
            })
        })
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
      expect(Disable.restore).toHaveBeenCalled()

      suite.expectNotStart()
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

      return Utils.flushPromises()
        .then(() => {
          jest.runOnlyPendingTimers()

          expect(Logger.default.log).toHaveBeenCalledWith('Adjust SDK is disabled, can not start the sdk')

          suite.expectNotStart()
          suite.expectNotRunningStatic()
          return suite.expectNotRunningTrackEvent()
        })
    })
  })
})
