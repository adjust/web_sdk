/* eslint-disable */
import * as Config from '../config'
import * as Event from '../event'
import * as Queue from '../queue'
import * as Time from '../time'
import * as Utilities from '../utilities'
import * as StorageManager from '../storage-manager'

const appConfig = {
  app_token: '123abc',
  environment: 'sandbox',
  os_name: 'ios'
}

describe('event tracking functionality', () => {

  beforeAll(() => {
    jest.spyOn(Queue.default, 'push').mockImplementation(() => {})
    jest.spyOn(Time, 'getTimestamp').mockReturnValue('some-time')

    Object.assign(Config.default.baseParams, appConfig)
  })

  afterEach(() => {
    StorageManager.default.clear('globalParams')
    jest.clearAllMocks()
  })

  afterAll(() => {
    Object.assign(Config.default.baseParams, {
      app_token: '',
      environment: '',
      os_name: ''
    })

    jest.restoreAllMocks()
    localStorage.clear()
  })

  it('throws an error event token is not provided', () => {

    expect(() => {
      Event.track({})
    }).toThrow(new Error('You must provide event token in order to track event'))

  })

  it('resolves trackEvent request successfully without revenue and some map params', () => {

    const requestConfig = {
      url: '/event',
      method: 'POST',
      params: Utilities.extend({}, appConfig, {
        created_at: 'some-time',
        event_token: '123abc',
        callback_params: {'some-key': 'some-value'},
        partner_params: {}
      })
    }

    expect.assertions(1)

    return Event.track({
      event_token: '123abc',
      callback_params: [{key: 'some-key', value: 'some-value'}],
      revenue: 0
    }).then(() => {
      expect(Queue.default.push).toHaveBeenCalledWith(requestConfig)
    })

  })

  it('resolves trackEvent request successfully with revenue but no currency', () => {

    const requestConfig = {
      url: '/event',
      method: 'POST',
      params: Utilities.extend({}, appConfig, {
        created_at: 'some-time',
        event_token: '123abc',
        callback_params: {},
        partner_params: {}
      })
    }

    expect.assertions(1)

    return Event.track({
      event_token: '123abc',
      revenue: 1000
    }).then(() => {
      expect(Queue.default.push).toHaveBeenCalledWith(requestConfig)
    })


  })

  it('resolves trackEvent request successfully with revenue and some map params', () => {

    const requestConfig = {
      url: '/event',
      method: 'POST',
      params: Utilities.extend({}, appConfig, {
        created_at: 'some-time',
        event_token: '123abc',
        callback_params: {'some-key': 'some-value'},
        partner_params: {key1: 'value1', key2: 'value2'},
        revenue: "100.00000",
        currency: 'EUR'
      })
    }

    expect.assertions(1)

    return Event.track({
      event_token: '123abc',
      callback_params: [
        {key: 'some-key', value: 'some-value'}
      ],
      partner_params: [
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

    return Event.addParams(callbackParams, 'callback')
      .then(() => Event.track({
        event_token: 'bla',
        revenue: 34.67,
        currency: 'EUR'
      }))
      .then(() => {
        expect(Queue.default.push).toHaveBeenCalledWith({
          url: '/event',
          method: 'POST',
          params: Utilities.extend({}, appConfig, {
            created_at: 'some-time',
            event_token: 'bla',
            callback_params: {key1: 'value1', key2: 'value2'},
            partner_params: {},
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

    return Event.addParams(callbackParams, 'callback')
      .then(() => Event.track({
        event_token: 'bla',
        callback_params: [
          {key: 'key1', value: 'new value1'},
          {key: 'key3', value: 'value3'}
        ]
      }))
      .then(() => {
        expect(Queue.default.push).toHaveBeenCalledWith({
          url: '/event',
          method: 'POST',
          params: Utilities.extend({}, appConfig, {
            created_at: 'some-time',
            event_token: 'bla',
            callback_params: {key1: 'new value1', key2: 'value2', key3: 'value3'},
            partner_params: {}
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

    return Promise.all([
      Event.addParams(callbackParams, 'callback'),
      Event.addParams(partnerParams, 'partner')
    ])
      .then(() => Event.track({
        event_token: 'bla',
        callback_params: [
          {key: 'key2', value: 'new value2'}
        ],
        partner_params: [
          {key: 'very', value: 'bad'},
          {key: 'trt', value: 'prc'}
        ]
      }))
      .then(() => {
        expect(Queue.default.push).toHaveBeenCalledWith({
          url: '/event',
          method: 'POST',
          params: Utilities.extend({}, appConfig, {
            created_at: 'some-time',
            event_token: 'bla',
            callback_params: {key1: 'last value1', key2: 'new value2'},
            partner_params: {some: 'thing', very: 'bad', bla: 'truc', trt: 'prc'}
          })
        })
      })
  })

  it('stores callback event params and clean duplicates', () => {

    return Event.addParams([
      {key: 'key1', value: 'value1'},
      {key: 'key2', value: 'value2'},
      {key: 'key1', value: 'last value1'}
    ]).then(() => StorageManager.default.getAll('globalParams'))
      .then((result) => {

        expect(result).toEqual([
          {key: 'key1', value: 'last value1', type: 'callback'},
          {key: 'key2', value: 'value2', type: 'callback'}
        ])

      })
  })

  it('stores partner event params and override repeating keys if adding them at later point', () => {

    return Event.addParams([
      {key: 'key1', value: 'value1'},
      {key: 'key2', value: 'value2'},
      {key: 'key3', value: 'value3'}
    ], 'partner')
      .then(() => Event.addParams([
      {key: 'key1', value: 'new value1'},
      {key: 'key3', value: 'new value3'}
    ], 'partner'))
      .then(() => StorageManager.default.getAll('globalParams'))
      .then((result) => {
        expect(result).toEqual([
          {key: 'key1', value: 'new value1', type: 'partner'},
          {key: 'key2', value: 'value2', type: 'partner'},
          {key: 'key3', value: 'new value3', type: 'partner'}
        ])
      })
  })

  it('stores both callback and partner event params and override repeating keys if adding them at later point', () => {

    return Event.addParams([
      {key: 'key1', value: 'value1'},
      {key: 'key2', value: 'value2'},
      {key: 'key3', value: 'value3'},
      {key: 'key1', value: 'last value1'}
    ], 'callback')
      .then(() => Event.addParams([
      {key: 'key1', value: 'value1'},
      {key: 'key3', value: 'value3'},
    ], 'partner'))
      .then(() => Event.addParams([
        {key: 'key2', value: 'new value2'},
        {key: 'key4', value: 'value4'},
      ], 'callback'))
      .then(() => Event.addParams([
        {key: 'key2', value: 'value2'},
        {key: 'key3', value: 'new value3'},
      ], 'partner'))
      .then(() => StorageManager.default.getAll('globalParams'))
      .then((result) => {
        expect(result).toEqual([
          {key: 'key1', value: 'last value1', type: 'callback'},
          {key: 'key2', value: 'new value2', type: 'callback'},
          {key: 'key3', value: 'value3', type: 'callback'},
          {key: 'key4', value: 'value4', type: 'callback'},
          {key: 'key1', value: 'value1', type: 'partner'},
          {key: 'key2', value: 'value2', type: 'partner'},
          {key: 'key3', value: 'new value3', type: 'partner'}
        ])
      })
  })

})
