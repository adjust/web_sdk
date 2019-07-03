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
  expectStart,
  expectNotRunningTrackEvent,
  expectNotRunningStatic,
  expectNotGdprForgetMeCallback,
  expectNotShutDownAndClear,
  expectNotStart,
  teardown,
  teardownAndDisable
} from './_main-helper'
import * as State from '../../state'

jest.mock('../../request')
jest.mock('../../logger')
jest.useFakeTimers()

describe('main entry point - test GDPR-Forget-Me when in initially disabled state', () => {

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

    State.default.disabled = 'general'
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
      teardownAndDisable(mainInstance)
    })

    it('initiates and prevents running all static methods and track event', () => {

      mainInstance.init(config)

      expect(Logger.default.log).toHaveBeenLastCalledWith('adjustSDK is disabled, can not start the sdk')

      expectNotStart()
      expectNotRunningStatic(mainInstance)
      expectNotRunningTrackEvent(mainInstance)
    })

    it('fails to push forget-me request to queue', () => {

      mainInstance.gdprForgetMe()

      expect(Queue.push).not.toHaveBeenCalled()
      expect(Logger.default.log).toHaveBeenLastCalledWith('adjustSDK is already disabled')
    })

    it('prevents running all static methods and track event', () => {
      expectNotRunningStatic(mainInstance)
      expectNotRunningTrackEvent(mainInstance)
    })

    it('flush forget-me event but ignores it', () => {
      expectNotGdprForgetMeCallback()
      expectNotShutDownAndClear()
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

  describe('sdk: init -> flush -> forget', () => {
    afterAll(() => {
      teardownAndDisable(mainInstance)
    })

    it('initiates and flush forget-me event but ignores it', () => {

      mainInstance.init(config)

      expect(Logger.default.log).toHaveBeenLastCalledWith('adjustSDK is disabled, can not start the sdk')

      Logger.default.log.mockClear()

      expectNotGdprForgetMeCallback()
      expectNotShutDownAndClear()
    })

    it('prevents running all static methods and track event', () => {
      expectNotRunningStatic(mainInstance)
      expectNotRunningTrackEvent(mainInstance)
    })

    it('fails to push forget-me request to queue', () => {

      mainInstance.gdprForgetMe()

      expect(Queue.push).not.toHaveBeenCalled()
      expect(Logger.default.log).toHaveBeenLastCalledWith('adjustSDK is already disabled')
    })
  })

  describe('sdk: forget -> init -> flush', () => {
    afterAll(() => {
      teardownAndDisable(mainInstance)
    })

    it('does not push forget-me request to queue yet', () => {
      mainInstance.gdprForgetMe()

      expect(Queue.push).not.toHaveBeenCalled()
      expect(Logger.default.log).toHaveBeenLastCalledWith('adjustSDK is already disabled')
    })

    it('initiates but prevents all static methods and track event and fails to push forget-me request to queue', () => {

      mainInstance.init(config)

      expect(Logger.default.log).toHaveBeenCalledTimes(1)
      expect(Logger.default.log).toHaveBeenCalledWith('adjustSDK is disabled, can not start the sdk')

      expectNotStart()
      expectNotRunningStatic(mainInstance)
      expectNotRunningTrackEvent(mainInstance)
      expect(Queue.push).not.toHaveBeenCalled()
    })

    it('flush forget-me event but ignores it', () => {
      expectNotGdprForgetMeCallback()
      expectNotShutDownAndClear()
    })

  })

  describe('sdk: forget -> flush -> init', () => {
    afterAll(() => () => {
      teardown(mainInstance)
    })

    it('does not push forget-me request to queue yet', () => {
      mainInstance.gdprForgetMe()

      expect(Queue.push).not.toHaveBeenCalled()
      expect(Logger.default.log).toHaveBeenLastCalledWith('adjustSDK is already disabled')
    })

    it('flush forget-me event but ignores it', () => {
      expectNotGdprForgetMeCallback()
      expectNotShutDownAndClear()
    })

    it('initiates but prevents all static methods and track event and fails to push forget-me request to queue', () => {

      mainInstance.init(config)

      expect(Logger.default.log).toHaveBeenCalledTimes(1)
      expect(Logger.default.log).toHaveBeenCalledWith('adjustSDK is disabled, can not start the sdk')

      expectNotStart()
      expectNotRunningStatic(mainInstance)
      expectNotRunningTrackEvent(mainInstance)
      expect(Queue.push).not.toHaveBeenCalled()
    })
  })

})
