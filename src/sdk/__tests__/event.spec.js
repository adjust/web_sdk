/* eslint-disable */
import * as Config from '../config'
import * as event from '../event'
import * as Queue from '../queue'
import * as Time from '../time'
import * as StorageManager from '../storage-manager'
import * as GlobalParams from '../global-params'
import * as Logger from '../logger'
import * as request from '../request'
import {flushPromises} from './_helper'

jest.mock('../request')
jest.mock('../logger')
jest.useFakeTimers()

const appConfig = {
  appToken: '123abc',
  environment: 'sandbox',
  osName: 'ios'
}

function expectRequest (requestConfig) {

  const fullConfig = Object.assign({}, requestConfig, {
    params: Object.assign({
      createdAt: 'some-time'
    }, requestConfig.params, appConfig)
  })

  return flushPromises()
    .then(() => {
      expect(Queue.push).toHaveBeenCalledWith(requestConfig)

      jest.runOnlyPendingTimers()

      expect(request.default).toHaveBeenCalledWith(fullConfig)

      return flushPromises()
    })
}

describe('event tracking functionality', () => {

  beforeAll(() => {
    jest.spyOn(request, 'default')
    jest.spyOn(Queue, 'push')
    jest.spyOn(Time, 'getTimestamp').mockReturnValue('some-time')
    jest.spyOn(Logger.default, 'error')
  })

  afterEach(() => {
    StorageManager.default.clear('globalParams')
    jest.clearAllMocks()
  })

  afterAll(() => {
    Config.default.destroy()

    jest.clearAllTimers()
    jest.restoreAllMocks()
    localStorage.clear()
  })

  it('prevents running event request before initialisation', () => {

    event.default({})

    expect(Logger.default.error).toHaveBeenLastCalledWith('adjustSDK is not initiated, can not track event')

    return flushPromises()
      .then(() => {
        expect(Queue.push).not.toHaveBeenCalled()

        jest.runOnlyPendingTimers()

        expect(request.default).not.toHaveBeenCalled()
      })
  })

  describe('after initialisation', () => {

    beforeAll(() => {
      Object.assign(Config.default.baseParams, appConfig)
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
          callbackParams: {'some-key': 'some-value'},
          partnerParams: {}
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
          eventToken: '123abc',
          callbackParams: {},
          partnerParams: {}
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
          revenue: "100.00000",
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
              partnerParams: {},
              revenue: "34.67000",
              currency: 'EUR'
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
              callbackParams: {key1: 'new value1', key2: 'value2', key3: 'value3'},
              partnerParams: {}
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
