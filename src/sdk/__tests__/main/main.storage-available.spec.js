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
import * as Attribution from '../../attribution'
import * as StorageManager from '../../storage/storage-manager'
import AdjustInstance from '../../main'
import OtherInstance from '../../main'
import Suite from './main.suite'

jest.mock('../../request')
jest.mock('../../logger')
jest.useFakeTimers()

describe('main entry point - test instance initiation when storage is available', () => {

  const suite = Suite(AdjustInstance)
  let sessionWatchSpy

  beforeAll(() => {
    jest.spyOn(event, 'default')
    jest.spyOn(sdkClick, 'default')
    jest.spyOn(Queue, 'run')
    jest.spyOn(Queue, 'setOffline')
    jest.spyOn(Queue, 'push')
    jest.spyOn(Queue, 'destroy')
    jest.spyOn(Session, 'destroy')
    jest.spyOn(GlobalParams, 'get')
    jest.spyOn(GlobalParams, 'add')
    jest.spyOn(GlobalParams, 'remove')
    jest.spyOn(GlobalParams, 'removeAll')
    jest.spyOn(Logger.default, 'error')
    jest.spyOn(Logger.default, 'log')
    jest.spyOn(Identity, 'start')
    jest.spyOn(Identity, 'destroy')
    jest.spyOn(PubSub, 'subscribe')
    jest.spyOn(PubSub, 'destroy')
    jest.spyOn(GdprForgetDevice, 'check')
    jest.spyOn(Attribution, 'destroy')
    jest.spyOn(StorageManager.default, 'destroy')

    sessionWatchSpy = jest.spyOn(Session, 'watch')
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  afterAll(() => {
    jest.clearAllTimers()
    jest.restoreAllMocks()
    suite.teardown()
  })

  describe('uninitiated instance', () => {

    afterEach(() => {
      jest.clearAllMocks()
      suite.teardown()
    })

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

    it('runs session first and then sdk-click request', () => {
      Utils.setDocumentProp('referrer', 'http://some-site.com')
      global.history.pushState({}, '', '?adjust_param=value&something=else')

      AdjustInstance.init(suite.config)

      expect.assertions(2)

      return Utils.flushPromises()
        .then(() => {
          const requests = Queue.push.mock.calls.map(call => call[0].url)

          expect(requests[0]).toEqual('/session')
          expect(requests[1]).toEqual('/sdk_click')
        })
    })

    it('ignores attribution change event when no attribution callback provided', () => {

      const newConfig = Object.assign({}, suite.config, {attributionCallback: null})

      AdjustInstance.init(newConfig)

      suite.expectNotAttributionCallback()
    })

    it('shuts down asynchronously', () => {

      const shutDownNumOfAssertions = suite.expectShutDown(true).assertions
      const allDownNumOfAssertions = suite.expectAllDown(true).assertions

      expect.assertions(2 + shutDownNumOfAssertions + allDownNumOfAssertions)

      AdjustInstance.init(suite.config)

      return Utils.flushPromises()
        .then(() => {
          // for example disable has been done in another tab
          PubSub.publish('sdk:shutdown')

          jest.runOnlyPendingTimers()

          expect(Logger.default.log).toHaveBeenCalledWith('Adjust SDK start has been interrupted due to multiple synchronous start attempt')
          expect(Logger.default.log).toHaveBeenCalledWith('Adjust SDK has been shutdown due to asynchronous disable')

          suite.expectShutDown()
          suite.expectAllDown()
        })
    })

    it('cancels sdk start due to some error happened in the chain', () => {

      const shutDownNumOfAssertions = suite.expectShutDown(true).assertions
      const allDownNumOfAssertions = suite.expectAllDown(true).assertions

      expect.assertions(1 + shutDownNumOfAssertions + allDownNumOfAssertions)

      sessionWatchSpy.mockRejectedValueOnce({error: 'An error!'})

      AdjustInstance.init(suite.config)

      return Utils.flushPromises()
        .then(() => {
          expect(Logger.default.error).toHaveBeenCalledWith('Adjust SDK start has been canceled due to an error', {error: 'An error!'})
          suite.expectShutDown()
          suite.expectAllDown()
        })
    })
  })

  describe('initiated instance', () => {
    beforeAll(() => {
      suite.teardown()
      AdjustInstance.init(suite.config)
    })

    it('sets basic configuration', () => {

      const a = suite.expectStart()

      expect.assertions(a.assertions)

      return a.promise
    })

    it('calls client-defined attribution callback when attribution is changed', () => {
      return suite.expectAttributionCallback()
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
      suite.expectRunningStatic()
    })

    it('runs track event', () => {
      suite.expectRunningTrackEvent()
    })

  })
})


