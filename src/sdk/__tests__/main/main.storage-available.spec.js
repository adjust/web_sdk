import * as PubSub from '../../pub-sub'
import * as Queue from '../../queue'
import * as Session from '../../session'
import * as event from '../../event'
import * as sdkClick from '../../sdk-click'
import * as Config from '../../config'
import * as Identity from '../../identity'
import * as GlobalParams from '../../global-params'
import * as Logger from '../../logger'
import * as GdprForgetDevice from '../../gdpr-forget-device'
import AdjustInstance from '../../main'
import OtherInstance from '../../main'
import {
  config,
  expectStart,
  expectRunningTrackEvent,
  expectRunningStatic,
  expectAttributionCallback,
  teardown
} from './_main.common'

jest.mock('../../request')
jest.mock('../../logger')
jest.useFakeTimers()

describe('main entry point - test instance initiation when storage is available', () => {

  beforeAll(() => {
    jest.spyOn(event, 'default')
    jest.spyOn(sdkClick, 'default')
    jest.spyOn(Queue, 'run')
    jest.spyOn(Queue, 'setOffline')
    jest.spyOn(Session, 'watch')
    jest.spyOn(GlobalParams, 'get')
    jest.spyOn(GlobalParams, 'add')
    jest.spyOn(GlobalParams, 'remove')
    jest.spyOn(GlobalParams, 'removeAll')
    jest.spyOn(Logger.default, 'error')
    jest.spyOn(Identity, 'start')
    jest.spyOn(PubSub, 'subscribe')
    jest.spyOn(GdprForgetDevice, 'check')
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  afterAll(() => {
    jest.clearAllTimers()
    jest.restoreAllMocks()
    teardown(AdjustInstance)
  })

  describe('uninitiated instance', () => {

    it('logs an error and return when not all parameters provided', () => {

      AdjustInstance.init()

      expect(Logger.default.error).toHaveBeenLastCalledWith('You must define appToken and environment')

      AdjustInstance.init({appToken: 'a-token'})

      expect(Logger.default.error).toHaveBeenLastCalledWith('You must define environment')
    })

    it('logs an error and return when trying to track event before init', () => {

      AdjustInstance.trackEvent()

      expect(Logger.default.error).toHaveBeenLastCalledWith('Adjust SDK is not initiated, can not track event')
    })
  })

  describe('initiated instance', () => {
    beforeAll(() => {
      AdjustInstance.init(config)
    })

    it('sets basic configuration', () => {

      const a = expectStart()

      expect.assertions(a.assertions)

      return a.promise
    })

    it('calls client-defined attribution callback when attribution is changed', () => {
      return expectAttributionCallback()
    })

    it('tests if single instance is returned', () => {

      OtherInstance.init({
        appToken: 'some-other-app-token',
        environment: 'sandbox'
      })

      expect(Logger.default.error).toHaveBeenCalledWith('You already initiated your instance')
      expect(AdjustInstance).toBe(OtherInstance)
      expect(Config.default.baseParams.appToken).toEqual('some-app-token')
      expect(Config.default.baseParams.environment).toEqual('production')

    })

    it('runs all static methods', () => {
      expectRunningStatic(AdjustInstance)
    })

    it('runs track event', () => {
      expectRunningTrackEvent(AdjustInstance)
    })
  })

})


