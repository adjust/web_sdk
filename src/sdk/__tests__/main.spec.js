/* eslint-disable */
import * as PubSub from '../pub-sub'
import * as Queue from '../queue'
import * as Time from '../time'
import * as Session from '../session'
import * as Config from '../config'
import mainInstance from '../main.js'
import sameInstance from '../main.js'

jest.useFakeTimers()

const external = {
  attributionCb () {}
}

describe('test uninitiated instance', () => {
  it('throws an error when not all parameters provided', () => {

    expect.assertions(3)

    expect(() => {
      mainInstance.init()
    }).toThrowError(new Error('You must define app_token, environment and os_name'))

    expect(() => {
      mainInstance.init({
        app_token: 'a-token'
      })
    }).toThrow(new Error('You must define environment and os_name'))

    expect(() => {
      mainInstance.init({
        app_token: 'a-token',
        environment: 'production'
      })
    }).toThrow(new Error('You must define os_name'))

  })

  it('throws an error when trying to skip init', () => {

    expect.assertions(1)

    expect(() => {
      mainInstance.trackEvent()
    }).toThrow(new Error('You must init your instance'))

  })
})

describe('test initiated instance', () => {
  beforeAll(() => {
    jest.spyOn(external, 'attributionCb')
    jest.spyOn(PubSub, 'subscribe')
    jest.spyOn(Queue.default, 'push').mockImplementation(() => {})
    jest.spyOn(Time, 'getTimestamp').mockReturnValue('some-time')
    jest.spyOn(Session, 'watchSession').mockImplementation(() => {})

    mainInstance.init({
      app_token: 'some-app-token',
      environment: 'production',
      os_name: 'android'
    }, external.attributionCb)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  afterAll(() => {
    jest.clearAllTimers()
    jest.restoreAllMocks()
    localStorage.clear()
    mainInstance.destroy()
  })

  it('sets basic configuration', () => {

    expect(Config.default.baseParams.app_token).toEqual('some-app-token')
    expect(Config.default.baseParams.environment).toEqual('production')
    expect(Config.default.baseParams.os_name).toEqual('android')
    expect(PubSub.subscribe).toHaveBeenCalledWith('attribution:change', external.attributionCb)
    expect(Session.watchSession).toHaveBeenCalledTimes(1)

  })

  it('calls client-defined attribution callback when attribution is changed', () => {

    PubSub.publish('attribution:change', {tracker_token: 'some-token'})

    jest.runAllTimers()

    expect(external.attributionCb).toHaveBeenCalledWith('attribution:change', {tracker_token: 'some-token'})

  })

  it('tests if single instance is returned', () => {

    expect(() => {
      sameInstance.init({
        app_token: 'some-other-app-token',
        environment: 'production',
        os_name: 'ios'
      })
    }).toThrow(new Error('You already initiated your instance'))

    expect(mainInstance).toBe(sameInstance)
    expect(Config.default.baseParams.app_token).toEqual('some-app-token')
    expect(Config.default.baseParams.environment).toEqual('production')
    expect(Config.default.baseParams.os_name).toEqual('android')

  })

  it('resolves trackEvent request successfully without revenue and some map params', () => {

    const requestConfig = {
      url: '/event',
      method: 'POST',
      params: {
        created_at: 'some-time',
        app_token: 'some-app-token',
        environment: 'production',
        os_name: 'android',
        event_token: 'some-event-token1',
        callback_params: {'some-key': 'some-value'},
        partner_params: {}
      }
    };

    mainInstance.trackEvent({
      eventToken: 'some-event-token1',
      callbackParams: [{key: 'some-key', value: 'some-value'}],
      revenue: 0
    })

    expect(Queue.default.push).toHaveBeenCalledWith(requestConfig)

  })

  it('resolves trackEvent request successfully with revenue but no currency', () => {

    const requestConfig = {
      url: '/event',
      method: 'POST',
      params: {
        created_at: 'some-time',
        app_token: 'some-app-token',
        environment: 'production',
        os_name: 'android',
        event_token: 'some-event-token2',
        callback_params: {},
        partner_params: {}
      }
    }

    mainInstance.trackEvent({
      eventToken: 'some-event-token2',
      revenue: 1000
    })

    expect(Queue.default.push).toHaveBeenCalledWith(requestConfig)

  })

  it('resolves trackEvent request successfully with revenue and some map params', () => {

    const requestConfig = {
      url: '/event',
      method: 'POST',
      params: {
        created_at: 'some-time',
        app_token: 'some-app-token',
        environment: 'production',
        os_name: 'android',
        event_token: 'some-event-token3',
        callback_params: {'some-key': 'some-value'},
        partner_params: {key1: 'value1', key2: 'value2'},
        revenue: "100.00000",
        currency: 'EUR'
      }
    }

    mainInstance.trackEvent({
      eventToken: 'some-event-token3',
      callbackParams: [{key: 'some-key', value: 'some-value'}],
      partnerParams: [{key: 'key1', value: 'value1'}, {key: 'key2', value: 'value2'}],
      revenue: 100,
      currency: 'EUR'
    })

    expect(Queue.default.push).toHaveBeenCalledWith(requestConfig)


  })
})





