import * as Config from '../config'
import * as event from '../event'
import * as Queue from '../queue'
import * as Time from '../time'
import * as GlobalParams from '../global-params'
import * as Logger from '../logger'
import * as http from '../http'
import * as ActivityState from '../activity-state'

jest.mock('../http')
jest.mock('../logger')
jest.useFakeTimers()

const appOptions = {
  appToken: '123abc',
  environment: 'sandbox'
}

function expectRequest (requestConfig) {

  const fullConfig = {
    ...requestConfig,
    params: {
      attempts: 1,
      createdAt: 'some-time',
      timeSpent: 0,
      sessionLength: 0,
      sessionCount: 1,
      eventCount: 1,
      lastInterval: 0,
      ...requestConfig.params
    }
  }

  return Utils.flushPromises()
    .then(() => {
      expect(Queue.push).toHaveBeenCalledWith(requestConfig)

      jest.runOnlyPendingTimers()

      expect(http.default).toHaveBeenCalledWith(fullConfig)

      return Utils.flushPromises()
    })
}

describe('event tracking functionality', () => {

  beforeAll(() => {
    jest.spyOn(http, 'default')
    jest.spyOn(Queue, 'push')
    jest.spyOn(Time, 'getTimestamp').mockReturnValue('some-time')
    jest.spyOn(Logger.default, 'error')

    ActivityState.default.current = {uuid: 'some-uuid'}
  })

  afterEach(() => {
    ActivityState.default.current = {...ActivityState.default.current, eventCount: 0}
    localStorage.clear()
    jest.clearAllMocks()
  })

  afterAll(() => {
    Config.default.destroy()
    ActivityState.default.destroy()

    jest.clearAllTimers()
    jest.restoreAllMocks()
  })

  it('prevents running event request before initialisation', () => {

    event.default({})

    expect(Logger.default.error).toHaveBeenLastCalledWith('Adjust SDK is not initiated, can not track event')
    expect(Logger.default.error).toHaveBeenCalledTimes(1)

    return Utils.flushPromises()
      .then(() => {
        expect(Queue.push).not.toHaveBeenCalled()

        jest.runOnlyPendingTimers()

        expect(http.default).not.toHaveBeenCalled()

        event.default()
        expect(Logger.default.error).toHaveBeenLastCalledWith('Adjust SDK is not initiated, can not track event')
        expect(Logger.default.error).toHaveBeenCalledTimes(2)
      })
  })

  describe('after initialisation', () => {

    beforeAll(() => {
      Config.default.set(appOptions)
    })

    it('logs an error and return when event token is not provided', () => {
      event.default({})

      expect(Logger.default.error).toHaveBeenCalledWith('You must provide event token in order to track event')

    })

    it('resolves event request successfully without revenue and some map params', () => {

      expect.assertions(2)

      event.default({
        eventToken: '123abc',
        callbackParams: [{key: 'some-key', value: 'some-value'}],
        revenue: 0
      })

      return expectRequest({
        url: '/event',
        method: 'POST',
        params: {
          eventToken: '123abc',
          callbackParams: {'some-key': 'some-value'}
        }
      })
    })

    it('resolves event request successfully with revenue but no currency', () => {

      expect.assertions(2)

      event.default({
        eventToken: '123abc',
        revenue: 1000
      })

      return expectRequest({
        url: '/event',
        method: 'POST',
        params: {
          eventToken: '123abc'
        }
      })
    })

    it('resolves event request successfully but ignores malformed revenue', () => {

      expect.assertions(2)

      event.default({
        eventToken: '123abc',
        currency: 'EUR'
      })

      return expectRequest({
        url: '/event',
        method: 'POST',
        params: {
          eventToken: '123abc'
        }
      })
    })

    it('resolves event request successfully with revenue and some map params', () => {

      expect.assertions(2)

      event.default({
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
      })

      return expectRequest({
        url: '/event',
        method: 'POST',
        params: {
          eventToken: '123abc',
          callbackParams: {'some-key': 'some-value'},
          partnerParams: {key1: 'value1', key2: 'value2'},
          revenue: '100.00000',
          currency: 'EUR'
        }
      })
    })

    it('sets default callback parameters to be appended to each track event request', () => {

      const callbackParams = [
        {key: 'key1', value: 'value1'},
        {key: 'key2', value: 'value2'}
      ]

      expect.assertions(2)

      return GlobalParams.add(callbackParams, 'callback')
        .then(() => {
          event.default({
            eventToken: 'bla',
            revenue: 34.67,
            currency: 'EUR'
          })

          return expectRequest({
            url: '/event',
            method: 'POST',
            params: {
              eventToken: 'bla',
              callbackParams: {key1: 'value1', key2: 'value2'},
              revenue: '34.67000',
              currency: 'EUR'
            }
          })
        })
    })

    it('sets default partner parameters to be appended to each track event request', () => {

      const partnerParams = [
        {key: 'key1', value: 'value1'},
        {key: 'key2', value: 'value2'}
      ]

      expect.assertions(2)

      return GlobalParams.add(partnerParams, 'partner')
        .then(() => {
          event.default({
            eventToken: 'bla'
          })

          return expectRequest({
            url: '/event',
            method: 'POST',
            params: {
              eventToken: 'bla',
              partnerParams: {key1: 'value1', key2: 'value2'}
            }
          })
        })
    })

    it('overrides some default callback parameters with callback parameters passed directly', () => {

      const callbackParams = [
        {key: 'key1', value: 'value1'},
        {key: 'key2', value: 'value2'}
      ]

      expect.assertions(2)

      return GlobalParams.add(callbackParams, 'callback')
        .then(() => {
          event.default({
            eventToken: 'bla',
            callbackParams: [
              {key: 'key1', value: 'new value1'},
              {key: 'key3', value: 'value3'}
            ]
          })

          return expectRequest({
            url: '/event',
            method: 'POST',
            params: {
              eventToken: 'bla',
              callbackParams: {key1: 'new value1', key2: 'value2', key3: 'value3'}
            }
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
      expect.assertions(2)

      return Promise.all([
        GlobalParams.add(callbackParams, 'callback'),
        GlobalParams.add(partnerParams, 'partner')
      ])
        .then(() => {
          event.default({
            eventToken: 'bla',
            callbackParams: [
              {key: 'key2', value: 'new value2'}
            ],
            partnerParams: [
              {key: 'very', value: 'bad'},
              {key: 'trt', value: 'prc'}
            ]
          })

          return expectRequest({
            url: '/event',
            method: 'POST',
            params: {
              eventToken: 'bla',
              callbackParams: {key1: 'last value1', key2: 'new value2'},
              partnerParams: {some: 'thing', very: 'bad', bla: 'truc', trt: 'prc'}
            }
          })
        })
    })

  })
})
