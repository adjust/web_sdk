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
import {randomInRange} from './../_helper'

import {
  config,
  gdprConfig,
  expectStart,
  expectRunningTrackEvent,
  expectNotRunningTrackEvent,
  expectRunningStatic,
  expectNotRunningStatic,
  expectGdprForgetMeCallback,
  expectShutDownAndClear,
  expectNotGdprForgetMeCallback,
  expectNotShutDownAndClear,
  teardown
} from './_main-helper'
import * as State from '../../state'

jest.mock('../../request')
jest.mock('../../logger')
jest.useFakeTimers()

describe('main entry point - test GDPR-Forget-Me when in initially enabled state', () => {

  beforeAll(() => {
    const now = Date.now()
    jest.spyOn(Date, 'now').mockImplementation(() => now + randomInRange(1000, 9999))
    jest.spyOn(event, 'default')
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
    jest.spyOn(Identity, 'start')
    jest.spyOn(Identity, 'disable')
    jest.spyOn(Identity, 'enable')
    jest.spyOn(Identity, 'destroy')
    jest.spyOn(Identity, 'clear')
    jest.spyOn(PubSub, 'subscribe')
    jest.spyOn(PubSub, 'destroy')
    jest.spyOn(Attribution, 'check')
    jest.spyOn(Attribution, 'destroy')
    jest.spyOn(SdkClick, 'destroy')
    jest.spyOn(StorageManager.default, 'destroy')

    State.default.disabled = null
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
      teardown(mainInstance)
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

    it('pushes forget-me request to queue', () => {

      mainInstance.gdprForgetMe()

      expect(Queue.push).toHaveBeenCalledWith(gdprConfig)
    })

    it('fails to push forget-me request to queue again', () => {
      mainInstance.gdprForgetMe()

      expect(Queue.push).not.toHaveBeenCalled()
      expect(Logger.default.log).toHaveBeenLastCalledWith('Adjust SDK already sent GDPR Forget Me request')
    })

    it('keeps running all static methods and track event', () => {
      expectRunningStatic(mainInstance)
      expectRunningTrackEvent(mainInstance)
    })

    it('flush forget-me event and disables with shutdown', () => {
      expectGdprForgetMeCallback()
      expectShutDownAndClear()
    })

    it('fails to enable sdk after GDPR-Forget-Me has taken effect', () => {

      mainInstance.enable()

      expect(Logger.default.log).toHaveBeenLastCalledWith('Adjust SDK is disabled due to GDPR-Forget-me request and it can not be re-enabled')

    })

    it('prevents running all static methods and track event', () => {
      expectNotRunningStatic(mainInstance)
      expectNotRunningTrackEvent(mainInstance)
    })
  })

  describe('sdk: init -> flush -> forget', () => {
    afterAll(() => {
      teardown(mainInstance)
    })

    beforeAll(() => {
      mainInstance.init(config)
    })

    it('flush forget-me event and disables with shutdown', () => {
      expectGdprForgetMeCallback()
      expectShutDownAndClear()
    })

    it('prevents running all static methods and track event', () => {
      expectNotRunningStatic(mainInstance)
      expectNotRunningTrackEvent(mainInstance)
    })

    it('fails to push forget-me request to queue because already forgotten', () => {
      mainInstance.gdprForgetMe()

      expect(Queue.push).not.toHaveBeenCalled()
      expect(Logger.default.log).toHaveBeenLastCalledWith('Adjust SDK is already GDPR forgotten')
    })
  })

  describe('sdk: forget -> init -> flush', () => {
    afterAll(() => {
      teardown(mainInstance)
    })

    it('does not push forget-me request to queue yet', () => {
      mainInstance.gdprForgetMe()

      expect(Queue.push).not.toHaveBeenCalled()
      expect(Logger.default.log).toHaveBeenCalledWith('Adjust SDK will run GDPR Forget Me request after initialisation')
    })

    it('fails again to push forget-me request to queue', () => {
      mainInstance.gdprForgetMe()

      expect(Queue.push).not.toHaveBeenCalled()
      expect(Logger.default.log).toHaveBeenLastCalledWith('Adjust SDK already sent GDPR Forget Me request')

    })

    it('initiates and runs all static methods and track event and pushes forget-me to queue', () => {

      mainInstance.init(config)

      const a1 = expectRunningStatic(mainInstance)
      const a2 = expectRunningTrackEvent(mainInstance)
      const a3 = expectStart()
      const promise = a3.promise
        .then(() => {
          expect(Queue.push).toHaveBeenCalledWith(gdprConfig)
        })

      expect.assertions(1 + a1.assertions + a2.assertions + a3.assertions)

      return promise
    })

    it('flush forget-me event and disables with shutdown', () => {
      expectGdprForgetMeCallback()
      expectShutDownAndClear()
    })
  })

  describe('sdk: forget -> flush -> init', () => {
    afterAll(() => {
      teardown(mainInstance)
    })

    it('does not push forget-me request to queue yet', () => {
      mainInstance.gdprForgetMe()

      expect(Queue.push).not.toHaveBeenCalled()
    })

    it('flush forget-me event but ignores it', () => {
      expectNotGdprForgetMeCallback()
      expectNotShutDownAndClear()
    })

    it('initiates and runs all static methods and track event and pushes forget-me to queue', () => {

      mainInstance.init(config)

      expect.assertions(20)

      const a1 = expectRunningStatic(mainInstance)
      const a2 = expectRunningTrackEvent(mainInstance)
      const a3 = expectStart()
      const promise = a3.promise
        .then(() => {
          expect(Queue.push).toHaveBeenCalledWith(gdprConfig)
        })

      expect.assertions(1 + a1.assertions + a2.assertions + a3.assertions)

      return promise
    })
  })

})
