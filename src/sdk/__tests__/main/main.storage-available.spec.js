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
import Suite from './main.suite'

jest.mock('../../request')
jest.mock('../../logger')
jest.useFakeTimers()

describe('main entry point - test instance initiation when storage is available', () => {

  const suite = Suite(AdjustInstance)

  beforeAll(() => {
    jest.spyOn(event, 'default')
    jest.spyOn(sdkClick, 'default')
    jest.spyOn(Queue, 'run')
    jest.spyOn(Queue, 'setOffline')
    jest.spyOn(Queue, 'push')
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
    suite.teardown()
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

  it('runs session first and then sdk-click request', () => {
    jest.clearAllMocks()
    suite.teardown()
    Utils.setDocumentProp('referrer', 'http://some-site.com')
    window.history.pushState({}, '', '?adjust_param=value&something=else')

    AdjustInstance.init(suite.config)

    expect.assertions(2)

    return Utils.flushPromises()
      .then(() => {
        const requests = Queue.push.mock.calls.map(call => call[0].url)

        expect(requests[0]).toEqual('/session')
        expect(requests[1]).toEqual('/sdk_click')
      })
  })

})


