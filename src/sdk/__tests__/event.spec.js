/* eslint-disable */
import * as Config from '../config'
import * as event from '../event'
import * as Queue from '../queue'
import * as Time from '../time'
import * as Utilities from '../utilities'
import * as StorageManager from '../storage-manager'
import * as GlobalParams from '../global-params'
import * as Logger from '../logger'

const appConfig = {
  appToken: '123abc',
  environment: 'sandbox',
  osName: 'ios'
}

describe('event tracking functionality', () => {

  beforeAll(() => {
    jest.spyOn(Queue.default, 'push').mockImplementation(() => {})
    jest.spyOn(Time, 'getTimestamp').mockReturnValue('some-time')
    jest.spyOn(Logger.default, 'error').mockImplementation(() => {})

    Object.assign(Config.default.baseParams, appConfig)
  })

  afterEach(() => {
    StorageManager.default.clear('globalParams')
    jest.clearAllMocks()
  })

  afterAll(() => {
    Config.clear()

    jest.restoreAllMocks()
    localStorage.clear()
  })

  it('logs an error and return when event token is not provided', () => {
    event.default({})

    expect(Logger.default.error).toHaveBeenCalledWith('You must provide event token in order to track event')

  })

  it('resolves event request successfully without revenue and some map params', () => {

    const requestConfig = {
      url: '/event',
      method: 'POST',
      params: Utilities.extend({}, appConfig, {
        createdAt: 'some-time',
        eventToken: '123abc',
        callbackParams: {'some-key': 'some-value'},
        partnerParams: {}
      })
    }

    expect.assertions(1)

    return event.default({
      eventToken: '123abc',
      callbackParams: [{key: 'some-key', value: 'some-value'}],
      revenue: 0
    }).then(() => {
      expect(Queue.default.push).toHaveBeenCalledWith(requestConfig)
    })

  })

  it('resolves event request successfully with revenue but no currency', () => {

    const requestConfig = {
      url: '/event',
      method: 'POST',
      params: Utilities.extend({}, appConfig, {
        createdAt: 'some-time',
        eventToken: '123abc',
        callbackParams: {},
        partnerParams: {}
      })
    }

    expect.assertions(1)

    return event.default({
      eventToken: '123abc',
      revenue: 1000
    }).then(() => {
      expect(Queue.default.push).toHaveBeenCalledWith(requestConfig)
    })


  })

  it('resolves event request successfully with revenue and some map params', () => {

    const requestConfig = {
      url: '/event',
      method: 'POST',
      params: Utilities.extend({}, appConfig, {
        createdAt: 'some-time',
        eventToken: '123abc',
        callbackParams: {'some-key': 'some-value'},
        partnerParams: {key1: 'value1', key2: 'value2'},
        revenue: "100.00000",
        currency: 'EUR'
      })
    }

    expect.assertions(1)

    return event.default({
      eventToken: '123abc',
      callbackParams: [
        {key: 'some-key', value: 'some-value'}
      ],
      partnerParams: [
        {key: 'key1', value: 'value1'},
        {key: 'key2', value: 'value2'}
      ],
      revenue: 100,
      currency: 'EUR'
    }).then(() => {
      expect(Queue.default.push).toHaveBeenCalledWith(requestConfig)
    })


  })

  it('sets default callback parameters to be appended to each track event request', () => {

    const callbackParams = [
      {key: 'key1', value: 'value1'},
      {key: 'key2', value: 'value2'}
    ]

    expect.assertions(1)

    return GlobalParams.add(callbackParams, 'callback')
      .then(() => event.default({
        eventToken: 'bla',
        revenue: 34.67,
        currency: 'EUR'
      }))
      .then(() => {
        expect(Queue.default.push).toHaveBeenCalledWith({
          url: '/event',
          method: 'POST',
          params: Utilities.extend({}, appConfig, {
            createdAt: 'some-time',
            eventToken: 'bla',
            callbackParams: {key1: 'value1', key2: 'value2'},
            partnerParams: {},
            revenue: "34.67000",
            currency: 'EUR'
          })
        })
      })
  })

  it('overrides some default callback parameters with callback parameters passed directly', () => {

    const callbackParams = [
      {key: 'key1', value: 'value1'},
      {key: 'key2', value: 'value2'}
    ]

    expect.assertions(1)

    return GlobalParams.add(callbackParams, 'callback')
      .then(() => event.default({
        eventToken: 'bla',
        callbackParams: [
          {key: 'key1', value: 'new value1'},
          {key: 'key3', value: 'value3'}
        ]
      }))
      .then(() => {
        expect(Queue.default.push).toHaveBeenCalledWith({
          url: '/event',
          method: 'POST',
          params: Utilities.extend({}, appConfig, {
            createdAt: 'some-time',
            eventToken: 'bla',
            callbackParams: {key1: 'new value1', key2: 'value2', key3: 'value3'},
            partnerParams: {}
          })
        })
      })
  })

  it('sets default callback and partner parameters and override both with some parameters passed directly', () => {

    const callbackParams = [
      {key: 'key1', value: 'value1'},
      {key: 'key2', value: 'value2'},
      {key: 'key1', value: 'last value1'}
    ]
    const partnerParams = [
      {key: 'some', value: 'thing'},
      {key: 'very', value: 'nice'},
      {key: 'bla', value: 'truc'}
    ]

    expect.assertions(1)

    return Promise.all([
      GlobalParams.add(callbackParams, 'callback'),
      GlobalParams.add(partnerParams, 'partner')
    ])
      .then(() => event.default({
        eventToken: 'bla',
        callbackParams: [
          {key: 'key2', value: 'new value2'}
        ],
        partnerParams: [
          {key: 'very', value: 'bad'},
          {key: 'trt', value: 'prc'}
        ]
      }))
      .then(() => {
        expect(Queue.default.push).toHaveBeenCalledWith({
          url: '/event',
          method: 'POST',
          params: Utilities.extend({}, appConfig, {
            createdAt: 'some-time',
            eventToken: 'bla',
            callbackParams: {key1: 'last value1', key2: 'new value2'},
            partnerParams: {some: 'thing', very: 'bad', bla: 'truc', trt: 'prc'}
          })
        })
      })
  })

})
