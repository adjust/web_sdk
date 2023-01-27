import * as PubSub from '../../pub-sub'
import * as Queue from '../../queue'
import * as Session from '../../session'
import * as event from '../../event'
import * as sdkClick from '../../sdk-click'
import * as Identity from '../../identity'
import * as GlobalParams from '../../global-params'
import * as Logger from '../../logger'
import * as Storage from '../../storage/storage'
import * as Attribution from '../../attribution'
import * as Preferences from '../../preferences'
import * as GdprForgetDevice from '../../gdpr-forget-device'
import * as Listeners from '../../listeners'
import * as http from '../../http'
import * as Scheduler from '../../scheduler'
import * as ActivityState from '../../activity-state'
import AdjustInstance from '../../main.js'
import Suite from './main.suite'

jest.mock('../../http')
jest.mock('../../logger')
jest.useFakeTimers()

describe('main entry point - test GDPR-Forget-Me when in initially enabled state', () => {

  const suite = Suite(AdjustInstance)

  beforeAll(() => {
    const now = Date.now()
    jest.spyOn(Date, 'now').mockImplementation(() => now + Utils.randomInRange(1000, 9999))
    jest.spyOn(event, 'default')
    jest.spyOn(sdkClick, 'default')
    jest.spyOn(http, 'default')
    jest.spyOn(Queue, 'run')
    jest.spyOn(Queue, 'push')
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
    jest.spyOn(Identity, 'start')
    jest.spyOn(Identity, 'destroy')
    jest.spyOn(Identity, 'clear')
    jest.spyOn(PubSub, 'publish')
    jest.spyOn(PubSub, 'subscribe')
    jest.spyOn(PubSub, 'destroy')
    jest.spyOn(Attribution, 'check')
    jest.spyOn(Attribution, 'destroy')
    jest.spyOn(Storage.default, 'destroy')
    jest.spyOn(GdprForgetDevice, 'check')
    jest.spyOn(GdprForgetDevice, 'destroy')
    jest.spyOn(Listeners, 'register')
    jest.spyOn(Listeners, 'destroy')
    jest.spyOn(Scheduler, 'delay')
    jest.spyOn(Scheduler, 'flush')
    jest.spyOn(ActivityState.default, 'getWebUUID')
    jest.spyOn(ActivityState.default, 'getAttribution')

    Preferences.setDisabled(null)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  afterAll(() => {
    jest.clearAllTimers()
    jest.restoreAllMocks()
    Preferences.setDisabled(null)
  })

  describe('sdk: init -> forget -> flush', () => {
    afterAll(() => {
      suite.teardown()
    })

    it('initiates and runs all static methods and track event', () => {

      AdjustInstance.initSdk(suite.config)

      return Utils.flushPromises()
        .then(() => {

          const a1 = suite.expectRunningStatic()
          const a2 = suite.expectDelayedTrackEvent_Async()
          const a3 = suite.expectStart_Async()

          expect.assertions(a1.assertions + a2.assertions + a3.assertions)

          return Promise.all([a2.promise, a3.promise])
        })
    })

    it('runs forget-me request and flush', () => {

      AdjustInstance.gdprForgetMe()

      const a1 = suite.expectPartialShutDown()
      const a2 = suite.expectGdprRequest()
      const a3 = suite.expectGdprForgetMeCallback(true)
      const a4 = suite.expectClearAndDestroy_Async(true)

      expect.assertions(a1.assertions + a2.assertions + a3.assertions + a4.assertions)

      return Utils.flushPromises()
        .then(() => {
          suite.expectGdprForgetMeCallback()
          return suite.expectClearAndDestroy_Async().promise
        })
    })

    it('fails to run forget-me request again', () => {
      AdjustInstance.gdprForgetMe()

      suite.expectNotGdprRequest('Adjust SDK is already disabled')
    })

    it('prevents running all static methods and track event', async () => {
      expect.assertions(22)

      suite.expectNotRunningStatic()
      await suite.expectNotRunningTrackEvent()
    })

    it('fails to enable sdk after GDPR-Forget-Me has taken effect', () => {

      AdjustInstance.restart()

      expect(Logger.default.log).toHaveBeenLastCalledWith('Adjust SDK is disabled due to GDPR-Forget-Me request and it can not be re-enabled')

    })
  })

  describe('sdk: init -> flush -> forget', () => {
    afterAll(() => {
      suite.teardown()
    })

    beforeAll(() => {
      AdjustInstance.initSdk(suite.config)
      return Utils.flushPromises()
    })

    it('flush forget-me event but ignores it', () => {
      const a1 = suite.expectNotGdprForgetMeCallback()
      const a2 = suite.expectNotClearAndDestroy_Async()

      return a2.promise.then(() => {
        expect.assertions(a1.assertions + a2.assertions)
      })
    })

    it('runs forget-me request and flush', () => {
      AdjustInstance.gdprForgetMe()

      const a1 = suite.expectPartialShutDown()
      const a2 = suite.expectGdprRequest()
      const a3 = suite.expectGdprForgetMeCallback(true)
      const a4 = suite.expectClearAndDestroy_Async(true)

      expect.assertions(a1.assertions + a2.assertions + a3.assertions + a4.assertions)

      return Utils.flushPromises()
        .then(() => {
          suite.expectGdprForgetMeCallback()
          return suite.expectClearAndDestroy_Async().promise
        })
    })
  })

  describe('sdk: forget -> init -> flush', () => {
    afterAll(() => {
      suite.teardown()
    })

    it('does not run forget-me request yet', () => {
      AdjustInstance.gdprForgetMe()

      suite.expectNotGdprRequest('Adjust SDK will run GDPR Forget Me request after initialisation')
    })

    it('fails again to run forget-me request', () => {
      AdjustInstance.gdprForgetMe()

      suite.expectNotGdprRequest('Adjust SDK is already prepared to send GDPR Forget Me request')
    })

    it('initiates and prevents running all static methods and track event and runs forget-me request', () => {
      expect.assertions(40)

      AdjustInstance.initSdk(suite.config)

      return Utils.flushPromises()
        .then(() => {

          const a1 = suite.expectPartialStartWithGdprRequest_Async()
          suite.expectNotRunningStatic()
          const a3 = suite.expectNotRunningTrackEvent()

          return Promise.all([a1.promise, a3])
        })
    })

    it('flush forget-me event does clear and instance destroy', () => {
      const a1 = suite.expectGdprForgetMeCallback(false, true)
      const a2 = suite.expectClearAndDestroy_Async()

      return a2.promise.then(() => {
        expect.assertions(a1.assertions + a2.assertions)
      })
    })
  })

  describe('sdk: forget -> flush -> init', () => {
    afterAll(() => {
      suite.teardown()
    })

    it('does not run forget-me request yet', () => {
      AdjustInstance.gdprForgetMe()

      suite.expectNotGdprRequest('Adjust SDK will run GDPR Forget Me request after initialisation')
    })

    it('flush forget-me event but ignores it', () => {
      const a1 = suite.expectNotGdprForgetMeCallback()
      const a2 = suite.expectNotClearAndDestroy_Async()

      expect.assertions(a1.assertions + a2.assertions)

      return a2.promise
    })

    it('initiates and prevents running all static methods and track event and runs forget-me request', () => {
      expect.assertions(40)

      AdjustInstance.initSdk(suite.config)

      return Utils.flushPromises()
        .then(() => {

          const a1 = suite.expectPartialStartWithGdprRequest_Async()
          suite.expectNotRunningStatic()
          const a3 = suite.expectNotRunningTrackEvent()

          return Promise.all([a1.promise, a3])
        })
    })
  })

})
