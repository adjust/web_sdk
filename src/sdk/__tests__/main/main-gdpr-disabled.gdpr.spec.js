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
import {randomInRange} from './../_common'

import {
  config,
  expectNotRunningTrackEvent,
  expectNotRunningStatic,
  expectNotGdprForgetMeCallback,
  expectNotShutDownAndClear,
  expectNotStart,
  teardownAndDisable
} from './_main.common'

jest.mock('../../request')
jest.mock('../../logger')
jest.useFakeTimers()

describe('main entry point - test GDPR-Forget-Me when in initially GDPR disabled state', () => {

  beforeAll(() => {
    const now = Date.now()
    jest.spyOn(Date, 'now').mockImplementation(() => now + randomInRange(1000, 9999))
    jest.spyOn(event, 'default')
    jest.spyOn(sdkClick, 'default')
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
    jest.spyOn(Identity, 'destroy')
    jest.spyOn(Identity, 'clear')
    jest.spyOn(PubSub, 'subscribe')
    jest.spyOn(PubSub, 'destroy')
    jest.spyOn(Attribution, 'check')
    jest.spyOn(Attribution, 'destroy')
    jest.spyOn(StorageManager.default, 'destroy')
    jest.spyOn(GdprForgetDevice, 'check')

    State.default.disabled = 'gdpr'
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
      teardownAndDisable(AdjustInstance, 'gdpr')
    })

    it('initiates and prevents running all static methods and track event', () => {

      AdjustInstance.init(config)

      expect(Logger.default.log).toHaveBeenLastCalledWith('Adjust SDK is disabled, can not start the sdk')

      expectNotStart()
      expectNotRunningStatic(AdjustInstance)
      expectNotRunningTrackEvent(AdjustInstance)
    })

    it('fails to push forget-me request to queue', () => {

      AdjustInstance.gdprForgetMe()

      expect(Queue.push).not.toHaveBeenCalled()
      expect(Logger.default.log).toHaveBeenLastCalledWith('Adjust SDK is already GDPR forgotten')
    })

    it('prevents running all static methods and track event', () => {
      expectNotRunningStatic(AdjustInstance)
      expectNotRunningTrackEvent(AdjustInstance)
    })

    it('flush forget-me event but ignores it', () => {
      expectNotGdprForgetMeCallback()
      expectNotShutDownAndClear()
    })

    it('fails to enable sdk', () => {

      AdjustInstance.enable()

      expect(Logger.default.log).toHaveBeenLastCalledWith('Adjust SDK is disabled due to GDPR-Forget-me request and it can not be re-enabled')

    })
  })

  describe('sdk: init -> flush -> forget', () => {
    afterAll(() => {
      teardownAndDisable(AdjustInstance, 'gdpr')
    })

    it('initiates and flush forget-me event but ignores it', () => {

      AdjustInstance.init(config)

      expect(Logger.default.log).toHaveBeenLastCalledWith('Adjust SDK is disabled, can not start the sdk')

      Logger.default.log.mockClear()

      expectNotGdprForgetMeCallback()
      expectNotShutDownAndClear()
    })

    it('prevents running all static methods and track event', () => {
      expectNotRunningStatic(AdjustInstance)
      expectNotRunningTrackEvent(AdjustInstance)
    })

    it('fails to push forget-me request to queue', () => {

      AdjustInstance.gdprForgetMe()

      expect(Queue.push).not.toHaveBeenCalled()
      expect(Logger.default.log).toHaveBeenLastCalledWith('Adjust SDK is already GDPR forgotten')
    })
  })

  describe('sdk: forget -> init -> flush', () => {
    afterAll(() => {
      teardownAndDisable(AdjustInstance, 'gdpr')
    })

    it('does not push forget-me request to queue yet', () => {
      AdjustInstance.gdprForgetMe()

      expect(Queue.push).not.toHaveBeenCalled()
      expect(Logger.default.log).toHaveBeenLastCalledWith('Adjust SDK is already GDPR forgotten')
    })

    it('initiates but prevents all static methods and track event and fails to push forget-me request to queue', () => {

      AdjustInstance.init(config)

      expect(Logger.default.log).toHaveBeenCalledTimes(1)
      expect(Logger.default.log).toHaveBeenCalledWith('Adjust SDK is disabled, can not start the sdk')

      expectNotStart()
      expectNotRunningStatic(AdjustInstance)
      expectNotRunningTrackEvent(AdjustInstance)
      expect(Queue.push).not.toHaveBeenCalled()
    })

    it('flush forget-me event but ignores it', () => {
      expectNotGdprForgetMeCallback()
      expectNotShutDownAndClear()
    })

  })

  describe('sdk: forget -> flush -> init', () => {
    afterAll(() => {
      teardownAndDisable(AdjustInstance, 'gdpr')
    })

    it('does not push forget-me request to queue yet', () => {
      AdjustInstance.gdprForgetMe()

      expect(Queue.push).not.toHaveBeenCalled()
      expect(Logger.default.log).toHaveBeenLastCalledWith('Adjust SDK is already GDPR forgotten')
    })

    it('flush forget-me event but ignores it', () => {
      expectNotGdprForgetMeCallback()
      expectNotShutDownAndClear()
    })

    it('initiates but prevents all static methods and track event and fails to push forget-me request to queue', () => {

      AdjustInstance.init(config)

      expect(Logger.default.log).toHaveBeenCalledTimes(1)
      expect(Logger.default.log).toHaveBeenCalledWith('Adjust SDK is disabled, can not start the sdk')

      expectNotStart()
      expectNotRunningStatic(AdjustInstance)
      expectNotRunningTrackEvent(AdjustInstance)
      expect(Queue.push).not.toHaveBeenCalled()
    })
  })


})
