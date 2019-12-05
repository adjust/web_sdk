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
import * as State from '../../state'
import * as GdprForgetDevice from '../../gdpr-forget-device'
import * as Listeners from '../../listeners'
import * as http from '../../http'
import * as Scheduler from '../../scheduler'
import AdjustInstance from '../../main.js'
import Suite from './main.suite'

jest.mock('../../http')
jest.mock('../../logger')
jest.useFakeTimers()

describe('main entry point - test GDPR-Forget-Me when in initially disabled state', () => {

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
    jest.spyOn(Logger.default, 'log')
    jest.spyOn(Identity, 'start')
    jest.spyOn(Identity, 'disable')
    jest.spyOn(Identity, 'enable')
    jest.spyOn(Identity, 'destroy')
    jest.spyOn(Identity, 'clear')
    jest.spyOn(PubSub, 'subscribe')
    jest.spyOn(PubSub, 'destroy')
    jest.spyOn(Attribution, 'check')
    jest.spyOn(Attribution, 'destroy')
    jest.spyOn(Storage.default, 'destroy')
    jest.spyOn(GdprForgetDevice, 'check')
    jest.spyOn(GdprForgetDevice, 'destroy')
    jest.spyOn(Listeners, 'register')
    jest.spyOn(Scheduler, 'delay')
    jest.spyOn(Scheduler, 'flush')

    State.default.disabled = {reason: 'general'}
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  afterAll(() => {
    jest.clearAllTimers()
    jest.restoreAllMocks()
    State.default.disabled = null
  })

  describe('sdk: init -> forget -> flush', () => {
    afterAll(() => {
      suite.teardownAndDisable()
    })

    it('initiates and prevents running all static methods and track event', () => {
      AdjustInstance.initSdk(suite.config)

      expect(Logger.default.log).toHaveBeenLastCalledWith('Adjust SDK is disabled, can not start the sdk')

      suite.expectNotStart()
      suite.expectNotRunningStatic()
      suite.expectNotRunningTrackEvent()
    })

    it('fails to run forget-me request', () => {
      AdjustInstance.gdprForgetMe()

      suite.expectNotGdprRequest('Adjust SDK is already disabled')
    })

    it('prevents running all static methods and track event', () => {
      suite.expectNotRunningStatic()
      suite.expectNotRunningTrackEvent()
    })

    it('flush forget-me event but ignores it', () => {
      const a1 = suite.expectNotGdprForgetMeCallback()
      const a2 = suite.expectNotClearAndDestroy()

      expect.assertions(a1.assertions + a2.assertions)

      return a2.promise
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

  describe('sdk: init -> flush -> forget', () => {
    afterAll(() => {
      suite.teardownAndDisable()
    })

    it('initiates and flush forget-me event but ignores it', () => {

      AdjustInstance.initSdk(suite.config)

      expect(Logger.default.log).toHaveBeenLastCalledWith('Adjust SDK is disabled, can not start the sdk')

      Logger.default.log.mockClear()

      const a1 = suite.expectNotGdprForgetMeCallback()
      const a2 = suite.expectNotClearAndDestroy()

      expect.assertions(1 + a1.assertions + a2.assertions)

      return a2.promise
    })

    it('prevents running all static methods and track event', () => {
      suite.expectNotRunningStatic()
      suite.expectNotRunningTrackEvent()
    })

    it('fails to run forget-me request', () => {
      AdjustInstance.gdprForgetMe()

      suite.expectNotGdprRequest('Adjust SDK is already disabled')
    })
  })

  describe('sdk: forget -> init -> flush', () => {
    afterAll(() => {
      suite.teardownAndDisable()
    })

    it('does not run forget-me request', () => {
      AdjustInstance.gdprForgetMe()

      suite.expectNotGdprRequest('Adjust SDK is already disabled')
    })

    it('initiates but prevents all static methods and track event and fails to run forget-me request', () => {

      AdjustInstance.initSdk(suite.config)

      expect(Logger.default.log).toHaveBeenCalledTimes(1)
      expect(Logger.default.log).toHaveBeenCalledWith('Adjust SDK is disabled, can not start the sdk')

      suite.expectNotStart()
      suite.expectNotRunningStatic()
      suite.expectNotRunningTrackEvent()

      jest.runOnlyPendingTimers()

      expect(http.default).not.toHaveBeenCalled()
    })

    it('flush forget-me event but ignores it', () => {
      const a1 = suite.expectNotGdprForgetMeCallback()
      const a2 = suite.expectNotClearAndDestroy()

      expect.assertions(a1.assertions + a2.assertions)

      return a2.promise
    })

  })

  describe('sdk: forget -> flush -> init', () => {
    it('does not run forget-me request yet', () => {
      AdjustInstance.gdprForgetMe()

      suite.expectNotGdprRequest('Adjust SDK is already disabled')
    })

    it('flush forget-me event but ignores it', () => {
      const a1 = suite.expectNotGdprForgetMeCallback()
      const a2 = suite.expectNotClearAndDestroy()

      expect.assertions(a1.assertions + a2.assertions)

      return a2.promise
    })

    it('initiates but prevents all static methods and track event and fails to run forget-me request', () => {

      AdjustInstance.initSdk(suite.config)

      expect(Logger.default.log).toHaveBeenCalledTimes(1)
      expect(Logger.default.log).toHaveBeenCalledWith('Adjust SDK is disabled, can not start the sdk')

      suite.expectNotStart()
      suite.expectNotRunningStatic()
      suite.expectNotRunningTrackEvent()

      jest.runOnlyPendingTimers()

      expect(http.default).not.toHaveBeenCalled()
    })
  })

})
