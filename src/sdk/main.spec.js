/* eslint-disable */
import * as request from './request'
import mainInstance from './main.js'
import sameInstance from './main.js'

jest.mock('./request')

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

    expect.assertions(2)

    expect(() => {
      mainInstance.trackSession()
    }).toThrow(new Error('You must init your instance'))

    expect(() => {
      mainInstance.trackEvent()
    }).toThrow(new Error('You must init your instance'))

  })
})

describe('test initiated instance', () => {
  beforeAll(() => {
    mainInstance.init({
      app_token: 'some-app-token',
      environment: 'production',
      os_name: 'android',
      device_ids: {
        gps_adid: 'really-sweet-value'
      }
    })
  })

  afterAll(() => {
    mainInstance.destroy()
  })

  beforeEach(() => {
    jest.spyOn(request, 'default')
  })

  afterEach(() => {
    request.default.mockClear()
  })

  it('sets basic configuration', () => {

    expect(mainInstance.getAppToken()).toEqual('some-app-token')
    expect(mainInstance.getEnvironment()).toEqual('production')
    expect(mainInstance.getOsName()).toEqual('android')

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
    expect(mainInstance.getAppToken()).toEqual('some-app-token')
    expect(mainInstance.getEnvironment()).toEqual('production')
    expect(mainInstance.getOsName()).toEqual('android')

  })

  it('resolves trackSession request successfully', () => {

    expect(mainInstance.trackSession()).resolves.toEqual({status: 'success'})

    expect(request.default).toHaveBeenCalledWith({
      url: '/session',
      params: {
        app_token: 'some-app-token',
        environment: 'production',
        os_name: 'android',
        gps_adid: 'really-sweet-value'
      }
    })

  })

  it('resolves trackEvent request successfully without revenue and some map params', () => {

    expect(mainInstance.trackEvent({
      eventToken: 'some-event-token1',
      callbackParams: [{key: 'some-key', value: 'some-value'}],
      revenue: 0
    })).resolves.toEqual({status: 'success'})

    expect(request.default).toHaveBeenCalledWith({
      url: '/event',
      params: {
        event_token: 'some-event-token1',
        callback_params: {'some-key': 'some-value'},
        partner_params: {},
        app_token: 'some-app-token',
        environment: 'production',
        os_name: 'android',
        gps_adid: 'really-sweet-value'
      }
    })

  })

  it('resolves trackEvent request successfully with revenue but no currency', () => {

    expect(mainInstance.trackEvent({
      eventToken: 'some-event-token2',
      revenue: 1000
    })).resolves.toEqual({status: 'success'})

    expect(request.default).toHaveBeenCalledWith({
      url: '/event',
      params: {
        event_token: 'some-event-token2',
        callback_params: {},
        partner_params: {},
        app_token: 'some-app-token',
        environment: 'production',
        os_name: 'android',
        gps_adid: 'really-sweet-value'
      }
    })

  })

  it('resolves trackEvent request successfully with revenue and some map params', () => {

    expect(mainInstance.trackEvent({
      eventToken: 'some-event-token3',
      callbackParams: [{key: 'some-key', value: 'some-value'}],
      partnerParams: [{key: 'key1', value: 'value1'}, {key: 'key2', value: 'value2'}],
      revenue: 100,
      currency: 'EUR'
    })).resolves.toEqual({status: 'success'})

    expect(request.default).toHaveBeenCalledWith({
      url: '/event',
      params: {
        event_token: 'some-event-token3',
        callback_params: {'some-key': 'some-value'},
        partner_params: {key1: 'value1', key2: 'value2'},
        app_token: 'some-app-token',
        environment: 'production',
        os_name: 'android',
        gps_adid: 'really-sweet-value',
        revenue: "100.00000",
        currency: 'EUR'
      }
    })
  })
})





