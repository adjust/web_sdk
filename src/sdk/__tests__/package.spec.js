/* eslint-disable */
import * as Package from '../package'
import * as Config from '../config'
import * as request from '../request'
import * as Time from '../time'
import * as Logger from '../logger'
import {flushPromises} from './_helper'

jest.mock('../request')
jest.mock('../logger')
jest.useFakeTimers()

const appParams = {
  appToken: '123abc',
  environment: 'sandbox',
  osName: 'ios'
}

describe('test package functionality', () => {

  const someRequest = Package.default({
    url: '/some-request',
    params: {
      some: 'param'
    }
  })

  beforeAll(() => {
    Object.assign(Config.default.baseParams, appParams)

    jest.spyOn(request, 'default')
    jest.spyOn(Time, 'getTimestamp').mockReturnValue('some-time')
    jest.spyOn(Logger.default, 'log')
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  afterAll(() => {
    Config.clear()

    jest.clearAllTimers()
    jest.restoreAllMocks()
  })

  it('does a successful request with default waiting and params set per instance', () => {

    someRequest.send()

    expect.assertions(4)

    expect(Logger.default.log).toHaveBeenLastCalledWith('Trying request /some-request in 150ms')
    expect(setTimeout).toHaveBeenLastCalledWith(expect.any(Function), 150)

    jest.runOnlyPendingTimers()

    expect(request.default).toHaveBeenCalledWith({
      url: '/some-request',
      method: 'GET',
      params: Object.assign({
        createdAt: 'some-time',
        some: 'param'
      }, appParams)
    })

    return flushPromises()
      .then(() => {
        expect(Logger.default.log).toHaveBeenCalledWith('Request /some-request has been finished')
      })

  })

  it('does a successful request with custom waiting and params set per request', () => {

    someRequest.send({
      wait: 2500,
      params: {
        more: 'params',
        and: 'more-fun'
      }
    })

    expect.assertions(4)

    expect(Logger.default.log).toHaveBeenLastCalledWith('Trying request /some-request in 2500ms')
    expect(setTimeout).toHaveBeenLastCalledWith(expect.any(Function), 2500)

    jest.runOnlyPendingTimers()

    expect(request.default).toHaveBeenCalledWith({
      url: '/some-request',
      method: 'GET',
      params: Object.assign({
        createdAt: 'some-time',
        more: 'params',
        and: 'more-fun'
      }, appParams)
    })

    return flushPromises()
      .then(() => {
        expect(Logger.default.log).toHaveBeenCalledWith('Request /some-request has been finished')
      })

  })

  it('does a successful request with manual retry in success callback', () => {

    request.default.mockResolvedValue({wait: 3000})

    someRequest.send({
      continueCb: function (result) {
        if (result.wait) {
          return someRequest.retry({wait: result.wait})
        }

        someRequest.finish()
      }
    })

    expect.assertions(14)

    expect(Logger.default.log).toHaveBeenLastCalledWith('Trying request /some-request in 150ms')
    expect(setTimeout).toHaveBeenCalledTimes(1)
    expect(setTimeout).toHaveBeenLastCalledWith(expect.any(Function), 150)

    jest.runOnlyPendingTimers()

    expect(request.default).toHaveBeenCalledTimes(1)

    return flushPromises()
      .then(() => {
        jest.runOnlyPendingTimers()

        expect(Logger.default.log).toHaveBeenLastCalledWith('Re-trying request /some-request in 3000ms')
        expect(setTimeout).toHaveBeenCalledTimes(2)
        expect(setTimeout).toHaveBeenLastCalledWith(expect.any(Function), 3000)
        expect(request.default).toHaveBeenCalledTimes(2)

        return flushPromises()
      })
      .then(() => {
        request.default.mockClear()
        request.default.mockResolvedValue({})

        jest.runOnlyPendingTimers()

        expect(Logger.default.log).toHaveBeenLastCalledWith('Re-trying request /some-request in 3000ms')
        expect(setTimeout).toHaveBeenCalledTimes(3)
        expect(setTimeout).toHaveBeenLastCalledWith(expect.any(Function), 3000)
        expect(request.default).toHaveBeenCalledTimes(1)

        setTimeout.mockClear()

        return flushPromises()
      }).then(() => {
        jest.runOnlyPendingTimers()

        expect(Logger.default.log).toHaveBeenCalledWith('Request /some-request has been finished')
        expect(setTimeout).not.toHaveBeenCalled()
      })

  })

  it('retires unsuccessful request', () => {

    request.default.mockRejectedValue({error: 'An error'})

    expect.assertions(26)

    someRequest.send()

    expect(Logger.default.log).toHaveBeenLastCalledWith('Trying request /some-request in 150ms')
    expect(setTimeout).toHaveBeenCalledTimes(1)
    expect(setTimeout).toHaveBeenLastCalledWith(expect.any(Function), 150)

    jest.runOnlyPendingTimers()

    expect(request.default).toHaveBeenCalledTimes(1)

    return flushPromises()
      .then(() => {
        jest.runOnlyPendingTimers()

        expect(Logger.default.log).toHaveBeenLastCalledWith('Re-trying request /some-request in 100ms')
        expect(request.default).toHaveBeenCalledTimes(2)
        expect(setTimeout).toHaveBeenCalledTimes(2)
        expect(setTimeout).toHaveBeenLastCalledWith(expect.any(Function), 100)

        return flushPromises()
      }).then(() => {
        jest.runOnlyPendingTimers()

        expect(Logger.default.log).toHaveBeenLastCalledWith('Re-trying request /some-request in 200ms')
        expect(request.default).toHaveBeenCalledTimes(3)
        expect(setTimeout).toHaveBeenCalledTimes(3)
        expect(setTimeout).toHaveBeenLastCalledWith(expect.any(Function), 200)

        return flushPromises()
      }).then(() => {

        jest.runOnlyPendingTimers()

        expect(Logger.default.log).toHaveBeenLastCalledWith('Re-trying request /some-request in 300ms')
        expect(request.default).toHaveBeenCalledTimes(4)
        expect(setTimeout).toHaveBeenCalledTimes(4)
        expect(setTimeout).toHaveBeenLastCalledWith(expect.any(Function), 300)

        return flushPromises()
      }).then(() => {

        jest.runOnlyPendingTimers()

        expect(Logger.default.log).toHaveBeenLastCalledWith('Re-trying request /some-request in 300ms')
        expect(request.default).toHaveBeenCalledTimes(5)
        expect(setTimeout).toHaveBeenCalledTimes(5)
        expect(setTimeout).toHaveBeenLastCalledWith(expect.any(Function), 300)

        return flushPromises()
      }).then(() => {

        request.default.mockClear()
        request.default.mockResolvedValue({})

        jest.runOnlyPendingTimers()

        expect(Logger.default.log).toHaveBeenLastCalledWith('Re-trying request /some-request in 300ms')
        expect(request.default).toHaveBeenCalledTimes(1)
        expect(setTimeout).toHaveBeenCalledTimes(6)
        expect(setTimeout).toHaveBeenLastCalledWith(expect.any(Function), 300)

        setTimeout.mockClear()

        return flushPromises()
      }).then(() => {

        jest.runOnlyPendingTimers()

        expect(Logger.default.log).toHaveBeenCalledWith('Request /some-request has been finished')
        expect(setTimeout).not.toHaveBeenCalled()
      })
  })

  it('cancels initiated request', () => {

    expect.assertions(4)

    someRequest.send({wait: 2000})

    expect(Logger.default.log).toHaveBeenLastCalledWith('Trying request /some-request in 2000ms')
    expect(setTimeout).toHaveBeenLastCalledWith(expect.any(Function), 2000)

    someRequest.clear()

    jest.runOnlyPendingTimers()

    expect(request.default).not.toHaveBeenCalled()

    return flushPromises()
      .then(() => {
        expect(Logger.default.log).toHaveBeenLastCalledWith('Previous /some-request request attempt canceled')
      })

  })

  it('cancels previously initiated request with another one', () => {

    expect.assertions(7)

    someRequest.send({wait: 1000})

    expect(Logger.default.log).toHaveBeenLastCalledWith('Trying request /some-request in 1000ms')
    expect(setTimeout).toHaveBeenLastCalledWith(expect.any(Function), 1000)

    Logger.default.log.mockClear()

    // initiate another request
    someRequest.send()

    expect(Logger.default.log.mock.calls[0][0]).toBe('Previous /some-request request attempt canceled')
    expect(Logger.default.log.mock.calls[1][0]).toBe('Trying request /some-request in 150ms')

    jest.runOnlyPendingTimers()

    expect(request.default).toHaveBeenCalledTimes(1)

    return flushPromises()
      .then(() => {
        expect(request.default).toHaveBeenCalledTimes(1)
        expect(Logger.default.log).toHaveBeenCalledWith('Request /some-request has been finished')
      })

  })

  describe('test overriding on request level', () => {

    describe('uses default parameters', () => {

      const req = Package.default({
        url: '/another-request',
      })

      it('does a successful request with default params', () => {

        req.send()

        expect(Logger.default.log).toHaveBeenLastCalledWith('Trying request /another-request in 150ms')
        expect(setTimeout).toHaveBeenLastCalledWith(expect.any(Function), 150)

        jest.runOnlyPendingTimers()

        expect(request.default).toHaveBeenCalledWith({
          url: '/another-request',
          method: 'GET',
          params: Object.assign({
            createdAt: 'some-time',
          }, appParams)
        })

      })

      it('does a successful request with overriding params per request', () => {

        req.send({
          wait: 2000,
          params: {
            trc: 'prc',
            bla: 'truc'
          }
        })

        expect(Logger.default.log).toHaveBeenLastCalledWith('Trying request /another-request in 2000ms')
        expect(setTimeout).toHaveBeenLastCalledWith(expect.any(Function), 2000)

        jest.runOnlyPendingTimers()

        expect(request.default).toHaveBeenCalledWith({
          url: '/another-request',
          method: 'GET',
          params: Object.assign({
            createdAt: 'some-time',
            trc: 'prc',
            bla: 'truc'
          }, appParams)
        })

      })

    })

    describe('passes custom parameters', () => {

      const continueCb = jest.fn(() => req.finish())
      const req = Package.default({
        url: '/another-request',
        params: {
          some: 'param'
        },
        continueCb
      })

      it('does a successful request with params per instance', () => {

        req.send()

        expect.assertions(4)

        expect(Logger.default.log).toHaveBeenLastCalledWith('Trying request /another-request in 150ms')
        expect(setTimeout).toHaveBeenLastCalledWith(expect.any(Function), 150)

        jest.runOnlyPendingTimers()

        expect(request.default).toHaveBeenCalledWith({
          url: '/another-request',
          method: 'GET',
          params: Object.assign({
            createdAt: 'some-time',
            some: 'param'
          }, appParams)
        })

        return flushPromises()
          .then(() => {
            expect(continueCb).toHaveBeenCalled()
          })
      })

      it('does a successful request with overriding params per request', () => {

        const newContinueCb = jest.fn(() => req.finish())

        req.send({
          wait: 300,
          params: {
            bla: 'ble',
            blu: 'bli'
          },
          continueCb: newContinueCb
        })

        expect(Logger.default.log).toHaveBeenLastCalledWith('Trying request /another-request in 300ms')
        expect(setTimeout).toHaveBeenLastCalledWith(expect.any(Function), 300)

        jest.runOnlyPendingTimers()

        expect(request.default).toHaveBeenCalledWith({
          url: '/another-request',
          method: 'GET',
          params: Object.assign({
            createdAt: 'some-time',
            bla: 'ble',
            blu: 'bli'
          }, appParams)
        })

        return flushPromises()
          .then(() => {
            expect(newContinueCb).toHaveBeenCalled()
          })
      })
    })
  })

})
