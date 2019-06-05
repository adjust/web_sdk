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
    url: '/global-request',
    params: {
      some: 'param'
    }
  })

  beforeAll(() => {
    Object.assign(Config.default.baseParams, appParams)

    jest.spyOn(request, 'default')
    jest.spyOn(Time, 'getTimestamp').mockReturnValue('some-time')
    jest.spyOn(Logger.default, 'log')
    jest.spyOn(Logger.default, 'error')
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  afterAll(() => {
    Config.default.destroy()

    jest.clearAllTimers()
    jest.restoreAllMocks()
  })

  it('does a successful request with default waiting and params set per instance', () => {

    someRequest.send()

    expect.assertions(4)

    expect(Logger.default.log).toHaveBeenLastCalledWith('Trying request /global-request in 150ms')
    expect(setTimeout).toHaveBeenLastCalledWith(expect.any(Function), 150)

    jest.runOnlyPendingTimers()

    expect(request.default).toHaveBeenCalledWith({
      url: '/global-request',
      method: 'GET',
      params: Object.assign({
        createdAt: 'some-time',
        some: 'param'
      }, appParams)
    })

    return flushPromises()
      .then(() => {
        expect(Logger.default.log).toHaveBeenCalledWith('Request /global-request has been finished')
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

    expect(Logger.default.log).toHaveBeenLastCalledWith('Trying request /global-request in 2500ms')
    expect(setTimeout).toHaveBeenLastCalledWith(expect.any(Function), 2500)

    jest.runOnlyPendingTimers()

    expect(request.default).toHaveBeenCalledWith({
      url: '/global-request',
      method: 'GET',
      params: Object.assign({
        createdAt: 'some-time',
        more: 'params',
        and: 'more-fun'
      }, appParams)
    })

    return flushPromises()
      .then(() => {
        expect(Logger.default.log).toHaveBeenCalledWith('Request /global-request has been finished')
      })

  })

  it('does a successful request with manual retry in success callback', () => {

    request.default.mockResolvedValue({wait: 3000})

    someRequest.send({
      continueCb (result) {
        if (result.wait) {
          return someRequest.retry({wait: result.wait})
        }

        someRequest.finish()
      }
    })

    expect.assertions(14)

    expect(Logger.default.log).toHaveBeenLastCalledWith('Trying request /global-request in 150ms')
    expect(setTimeout).toHaveBeenCalledTimes(1)
    expect(setTimeout).toHaveBeenLastCalledWith(expect.any(Function), 150)

    jest.runOnlyPendingTimers()

    expect(request.default).toHaveBeenCalledTimes(1)

    return flushPromises()
      .then(() => {
        expect(Logger.default.log).toHaveBeenLastCalledWith('Re-trying request /global-request in 3000ms')

        jest.runOnlyPendingTimers()

        expect(setTimeout).toHaveBeenCalledTimes(2)
        expect(setTimeout).toHaveBeenLastCalledWith(expect.any(Function), 3000)
        expect(request.default).toHaveBeenCalledTimes(2)

        return flushPromises()
      }).then(() => {
        request.default.mockClear()
        request.default.mockResolvedValue({})

        expect(Logger.default.log).toHaveBeenLastCalledWith('Re-trying request /global-request in 3000ms')

        jest.runOnlyPendingTimers()

        expect(setTimeout).toHaveBeenCalledTimes(3)
        expect(setTimeout).toHaveBeenLastCalledWith(expect.any(Function), 3000)
        expect(request.default).toHaveBeenCalledTimes(1)

        setTimeout.mockClear()

        return flushPromises()
      }).then(() => {
        jest.runOnlyPendingTimers()

        expect(Logger.default.log).toHaveBeenCalledWith('Request /global-request has been finished')
        expect(setTimeout).not.toHaveBeenCalled()
      })

  })

  it('does a successful request with manual retry in success callback with custom url and params and restores', () => {

    const continueCb = jest.fn((result) => {
      if (result.wait) {
        return someRequest.retry({wait: result.wait})
      }

      someRequest.finish()
    })

    request.default.mockResolvedValue({wait: 1300})

    someRequest.send({
      url: '/other-request',
      method: 'POST',
      params: {something: 'else'},
      continueCb
    })

    expect.assertions(26)

    expect(Logger.default.log).toHaveBeenLastCalledWith('Trying request /other-request in 150ms')
    expect(setTimeout).toHaveBeenCalledTimes(1)
    expect(setTimeout).toHaveBeenLastCalledWith(expect.any(Function), 150)

    jest.runOnlyPendingTimers()

    expect(request.default).toHaveBeenCalledTimes(1)
    expect(request.default.mock.calls[0][0]).toMatchObject({
      url: '/other-request',
      method: 'POST',
      params: {something: 'else'}
    })

    return flushPromises()
      .then(() => {
        expect(Logger.default.log).toHaveBeenLastCalledWith('Re-trying request /other-request in 1300ms')

        jest.runOnlyPendingTimers()

        expect(continueCb).toHaveBeenCalled()
        expect(setTimeout).toHaveBeenCalledTimes(2)
        expect(setTimeout).toHaveBeenLastCalledWith(expect.any(Function), 1300)
        expect(request.default).toHaveBeenCalledTimes(2)
        expect(request.default.mock.calls[1][0]).toMatchObject({
          url: '/other-request',
          method: 'POST',
          params: {something: 'else'}
        })

        return flushPromises()
      }).then(() => {
        request.default.mockClear()
        request.default.mockResolvedValue({})

        expect(Logger.default.log).toHaveBeenLastCalledWith('Re-trying request /other-request in 1300ms')

        jest.runOnlyPendingTimers()

        expect(continueCb).toHaveBeenCalled()
        expect(setTimeout).toHaveBeenCalledTimes(3)
        expect(setTimeout).toHaveBeenLastCalledWith(expect.any(Function), 1300)
        expect(request.default).toHaveBeenCalledTimes(1)
        expect(request.default.mock.calls[0][0]).toMatchObject({
          url: '/other-request',
          method: 'POST',
          params: {something: 'else'}
        })

        setTimeout.mockClear()
        request.default.mockClear()

        return flushPromises()
      }).then(() => {
        jest.runOnlyPendingTimers()

        expect(continueCb).toHaveBeenCalled()
        expect(Logger.default.log).toHaveBeenCalledWith('Request /other-request has been finished')
        expect(setTimeout).not.toHaveBeenCalled()

        continueCb.mockClear()

        someRequest.send()

        expect(Logger.default.log).toHaveBeenLastCalledWith('Trying request /global-request in 150ms')
        expect(setTimeout).toHaveBeenCalledTimes(1)
        expect(setTimeout).toHaveBeenLastCalledWith(expect.any(Function), 150)

        jest.runOnlyPendingTimers()

        expect(request.default).toHaveBeenCalledWith({
          url: '/global-request',
          method: 'GET',
          params: Object.assign({
            createdAt: 'some-time',
            some: 'param'
          }, appParams)
        })

        return flushPromises()
      }).then(() => {
        expect(continueCb).not.toHaveBeenCalled()
        expect(Logger.default.log).toHaveBeenCalledWith('Request /global-request has been finished')
      })

  })

  it('retires unsuccessful request', () => {

    request.default.mockRejectedValue({error: 'An error'})

    expect.assertions(26)

    someRequest.send()

    expect(Logger.default.log).toHaveBeenLastCalledWith('Trying request /global-request in 150ms')
    expect(setTimeout).toHaveBeenCalledTimes(1)
    expect(setTimeout).toHaveBeenLastCalledWith(expect.any(Function), 150)

    jest.runOnlyPendingTimers()

    expect(request.default).toHaveBeenCalledTimes(1)

    return flushPromises()
      .then(() => {
        expect(Logger.default.log).toHaveBeenLastCalledWith('Re-trying request /global-request in 100ms')

        jest.runOnlyPendingTimers()

        expect(request.default).toHaveBeenCalledTimes(2)
        expect(setTimeout).toHaveBeenCalledTimes(2)
        expect(setTimeout).toHaveBeenLastCalledWith(expect.any(Function), 100)

        return flushPromises()
      }).then(() => {
        expect(Logger.default.log).toHaveBeenLastCalledWith('Re-trying request /global-request in 200ms')

        jest.runOnlyPendingTimers()

        expect(request.default).toHaveBeenCalledTimes(3)
        expect(setTimeout).toHaveBeenCalledTimes(3)
        expect(setTimeout).toHaveBeenLastCalledWith(expect.any(Function), 200)

        return flushPromises()
      }).then(() => {
        expect(Logger.default.log).toHaveBeenLastCalledWith('Re-trying request /global-request in 300ms')

        jest.runOnlyPendingTimers()

        expect(request.default).toHaveBeenCalledTimes(4)
        expect(setTimeout).toHaveBeenCalledTimes(4)
        expect(setTimeout).toHaveBeenLastCalledWith(expect.any(Function), 300)

        return flushPromises()
      }).then(() => {
        expect(Logger.default.log).toHaveBeenLastCalledWith('Re-trying request /global-request in 300ms')

        jest.runOnlyPendingTimers()

        expect(request.default).toHaveBeenCalledTimes(5)
        expect(setTimeout).toHaveBeenCalledTimes(5)
        expect(setTimeout).toHaveBeenLastCalledWith(expect.any(Function), 300)

        return flushPromises()
      }).then(() => {

        request.default.mockClear()
        request.default.mockResolvedValue({})
        expect(Logger.default.log).toHaveBeenLastCalledWith('Re-trying request /global-request in 300ms')

        jest.runOnlyPendingTimers()

        expect(request.default).toHaveBeenCalledTimes(1)
        expect(setTimeout).toHaveBeenCalledTimes(6)
        expect(setTimeout).toHaveBeenLastCalledWith(expect.any(Function), 300)

        setTimeout.mockClear()

        return flushPromises()
      }).then(() => {

        jest.runOnlyPendingTimers()

        expect(Logger.default.log).toHaveBeenCalledWith('Request /global-request has been finished')
        expect(setTimeout).not.toHaveBeenCalled()
      })
  })

  it('retires unsuccessful request with custom url and restores', () => {

    request.default.mockRejectedValue({error: 'An error'})

    expect.assertions(27)

    someRequest.send({url: '/new-request'})

    expect(Logger.default.log).toHaveBeenLastCalledWith('Trying request /new-request in 150ms')
    expect(setTimeout).toHaveBeenCalledTimes(1)
    expect(setTimeout).toHaveBeenLastCalledWith(expect.any(Function), 150)

    jest.runOnlyPendingTimers()

    expect(request.default).toHaveBeenCalledTimes(1)
    expect(request.default.mock.calls[0][0]).toMatchObject({
      url: '/new-request'
    })

    return flushPromises()
      .then(() => {
        expect(Logger.default.log).toHaveBeenLastCalledWith('Re-trying request /new-request in 100ms')

        jest.runOnlyPendingTimers()

        expect(setTimeout).toHaveBeenCalledTimes(2)
        expect(setTimeout).toHaveBeenLastCalledWith(expect.any(Function), 100)
        expect(request.default).toHaveBeenCalledTimes(2)
        expect(request.default.mock.calls[1][0]).toMatchObject({
          url: '/new-request'
        })

        return flushPromises()
      }).then(() => {
        expect(Logger.default.log).toHaveBeenLastCalledWith('Re-trying request /new-request in 200ms')

        jest.runOnlyPendingTimers()

        expect(setTimeout).toHaveBeenCalledTimes(3)
        expect(setTimeout).toHaveBeenLastCalledWith(expect.any(Function), 200)
        expect(request.default).toHaveBeenCalledTimes(3)
        expect(request.default.mock.calls[2][0]).toMatchObject({
          url: '/new-request'
        })

        return flushPromises()
      }).then(() => {

        request.default.mockClear()
        request.default.mockResolvedValue({})
        expect(Logger.default.log).toHaveBeenLastCalledWith('Re-trying request /new-request in 300ms')

        jest.runOnlyPendingTimers()

        expect(setTimeout).toHaveBeenCalledTimes(4)
        expect(setTimeout).toHaveBeenLastCalledWith(expect.any(Function), 300)
        expect(request.default).toHaveBeenCalledTimes(1)
        expect(request.default.mock.calls[0][0]).toMatchObject({
          url: '/new-request'
        })

        setTimeout.mockClear()

        return flushPromises()
      }).then(() => {

        jest.runOnlyPendingTimers()

        expect(Logger.default.log).toHaveBeenCalledWith('Request /new-request has been finished')
        expect(setTimeout).not.toHaveBeenCalled()

        someRequest.send()

        expect(Logger.default.log).toHaveBeenLastCalledWith('Trying request /global-request in 150ms')
        expect(setTimeout).toHaveBeenCalledTimes(1)
        expect(setTimeout).toHaveBeenLastCalledWith(expect.any(Function), 150)

        jest.runOnlyPendingTimers()

        expect(request.default).toHaveBeenCalledWith({
          url: '/global-request',
          method: 'GET',
          params: Object.assign({
            createdAt: 'some-time',
            some: 'param'
          }, appParams)
        })

        return flushPromises()
      }).then(() => {
        expect(Logger.default.log).toHaveBeenCalledWith('Request /global-request has been finished')
      })
  })

  it('cancels initiated request', () => {

    expect.assertions(4)

    someRequest.send({wait: 2000})

    expect(Logger.default.log).toHaveBeenLastCalledWith('Trying request /global-request in 2000ms')
    expect(setTimeout).toHaveBeenLastCalledWith(expect.any(Function), 2000)

    someRequest.clear()

    jest.runOnlyPendingTimers()

    expect(request.default).not.toHaveBeenCalled()

    return flushPromises()
      .then(() => {
        expect(Logger.default.log).toHaveBeenLastCalledWith('Previous /global-request request attempt canceled')
      })

  })

  it('cancels initiated request with custom url and restores', () => {

    expect.assertions(8)

    someRequest.send({
      wait: 2000,
      url: '/other'
    })

    expect(Logger.default.log).toHaveBeenLastCalledWith('Trying request /other in 2000ms')
    expect(setTimeout).toHaveBeenLastCalledWith(expect.any(Function), 2000)

    someRequest.clear()

    jest.runOnlyPendingTimers()

    expect(request.default).not.toHaveBeenCalled()

    return flushPromises()
      .then(() => {
        expect(Logger.default.log).toHaveBeenLastCalledWith('Previous /other request attempt canceled')

        someRequest.send({wait: 500})

        expect(Logger.default.log).toHaveBeenLastCalledWith('Trying request /global-request in 500ms')
        expect(setTimeout).toHaveBeenLastCalledWith(expect.any(Function), 500)

        jest.runOnlyPendingTimers()

        expect(request.default).toHaveBeenCalled()

        return flushPromises()
      })
      .then(() => {
        expect(Logger.default.log).toHaveBeenCalledWith('Request /global-request has been finished')
      })

  })

  it('retires unsuccessful request and then cancels', () => {

    request.default.mockRejectedValue({error: 'An error'})

    expect.assertions(16)

    someRequest.send({url: '/some-new-request'})

    expect(Logger.default.log).toHaveBeenLastCalledWith('Trying request /some-new-request in 150ms')
    expect(setTimeout).toHaveBeenCalledTimes(1)
    expect(setTimeout).toHaveBeenLastCalledWith(expect.any(Function), 150)

    jest.runOnlyPendingTimers()

    expect(request.default).toHaveBeenCalledTimes(1)

    return flushPromises()
      .then(() => {
        expect(Logger.default.log).toHaveBeenLastCalledWith('Re-trying request /some-new-request in 100ms')

        jest.runOnlyPendingTimers()

        expect(request.default).toHaveBeenCalledTimes(2)
        expect(setTimeout).toHaveBeenCalledTimes(2)
        expect(setTimeout).toHaveBeenLastCalledWith(expect.any(Function), 100)

        return flushPromises()
      }).then(() => {

        request.default.mockClear()
        setTimeout.mockClear()

        expect(Logger.default.log).toHaveBeenLastCalledWith('Re-trying request /some-new-request in 200ms')

        someRequest.clear()

        jest.runOnlyPendingTimers()

        expect(request.default).not.toHaveBeenCalled()
        expect(setTimeout).not.toHaveBeenCalled()
        expect(Logger.default.log).toHaveBeenLastCalledWith('Previous /some-new-request request attempt canceled')

        request.default.mockResolvedValue({})

        someRequest.send()

        expect(Logger.default.log).toHaveBeenLastCalledWith('Trying request /global-request in 150ms')
        expect(setTimeout).toHaveBeenLastCalledWith(expect.any(Function), 150)

        jest.runOnlyPendingTimers()

        expect(request.default).toHaveBeenCalledWith({
          url: '/global-request',
          method: 'GET',
          params: Object.assign({
            createdAt: 'some-time',
            some: 'param'
          }, appParams)
        })

        return flushPromises()
      }).then(() => {
        expect(Logger.default.log).toHaveBeenCalledWith('Request /global-request has been finished')
      })
  })

  it('cancels previously initiated request with another one', () => {

    expect.assertions(7)

    someRequest.send({wait: 1000})

    expect(Logger.default.log).toHaveBeenLastCalledWith('Trying request /global-request in 1000ms')
    expect(setTimeout).toHaveBeenLastCalledWith(expect.any(Function), 1000)

    Logger.default.log.mockClear()

    // initiate another request
    someRequest.send()

    expect(Logger.default.log.mock.calls[0][0]).toBe('Previous /global-request request attempt canceled')
    expect(Logger.default.log.mock.calls[1][0]).toBe('Trying request /global-request in 150ms')

    jest.runOnlyPendingTimers()

    expect(request.default).toHaveBeenCalledTimes(1)

    return flushPromises()
      .then(() => {
        expect(request.default).toHaveBeenCalledTimes(1)
        expect(Logger.default.log).toHaveBeenCalledWith('Request /global-request has been finished')
      })

  })

  describe('test overriding on request level', () => {

    describe('uses default parameters', () => {

      const req = Package.default({
        url: '/another-global-request',
      })

      it('does a successful request with default params', () => {

        req.send()

        expect(Logger.default.log).toHaveBeenLastCalledWith('Trying request /another-global-request in 150ms')
        expect(setTimeout).toHaveBeenLastCalledWith(expect.any(Function), 150)

        jest.runOnlyPendingTimers()

        expect(request.default).toHaveBeenCalledWith({
          url: '/another-global-request',
          method: 'GET',
          params: Object.assign({
            createdAt: 'some-time',
          }, appParams)
        })
      })

      it('does a successful request with overriding url, method and params per request and restores', () => {

        req.send({
          wait: 2000,
          url: '/new-url',
          method: 'POST',
          params: {
            trc: 'prc',
            bla: 'truc'
          }
        })

        expect.assertions(7)
        expect(Logger.default.log).toHaveBeenLastCalledWith('Trying request /new-url in 2000ms')
        expect(setTimeout).toHaveBeenLastCalledWith(expect.any(Function), 2000)

        jest.runOnlyPendingTimers()

        expect(request.default).toHaveBeenCalledWith({
          url: '/new-url',
          method: 'POST',
          params: Object.assign({
            createdAt: 'some-time',
            trc: 'prc',
            bla: 'truc'
          }, appParams)
        })

        return flushPromises()
          .then(() => {
            expect(Logger.default.log).toHaveBeenCalledWith('Request /new-url has been finished')

            req.send({wait: 1000})

            expect(Logger.default.log).toHaveBeenLastCalledWith('Trying request /another-global-request in 1000ms')
            expect(setTimeout).toHaveBeenLastCalledWith(expect.any(Function), 1000)

            jest.runOnlyPendingTimers()

            return flushPromises()
          }).then(() => {
            expect(Logger.default.log).toHaveBeenCalledWith('Request /another-global-request has been finished')
          })

      })

    })

    describe('passes custom parameters', () => {

      const continueCb = jest.fn(() => req.finish())
      const req = Package.default({
        url: '/another-global-request',
        params: {
          some: 'param'
        },
        continueCb
      })

      it('does a successful request with params per instance', () => {

        req.send()

        expect.assertions(4)

        expect(Logger.default.log).toHaveBeenLastCalledWith('Trying request /another-global-request in 150ms')
        expect(setTimeout).toHaveBeenLastCalledWith(expect.any(Function), 150)

        jest.runOnlyPendingTimers()

        expect(request.default).toHaveBeenCalledWith({
          url: '/another-global-request',
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

      it('does a successful request with overriding params and continue callback per request and restores', () => {

        const newContinueCb = jest.fn(() => req.finish())

        req.send({
          wait: 300,
          params: {
            bla: 'ble',
            blu: 'bli'
          },
          continueCb: newContinueCb
        })

        expect.assertions(8)
        expect(Logger.default.log).toHaveBeenLastCalledWith('Trying request /another-global-request in 300ms')
        expect(setTimeout).toHaveBeenLastCalledWith(expect.any(Function), 300)

        jest.runOnlyPendingTimers()

        expect(request.default).toHaveBeenCalledWith({
          url: '/another-global-request',
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

            newContinueCb.mockClear()

            req.send({wait: 400})

            expect(Logger.default.log).toHaveBeenLastCalledWith('Trying request /another-global-request in 400ms')
            expect(setTimeout).toHaveBeenLastCalledWith(expect.any(Function), 400)

            jest.runOnlyPendingTimers()

            expect(request.default).toHaveBeenCalledWith({
              url: '/another-global-request',
              method: 'GET',
              params: Object.assign({
                createdAt: 'some-time',
                some: 'param'
              }, appParams)
            })

            return flushPromises()
          }).then(() => {
            expect(newContinueCb).not.toHaveBeenCalled()
          })
      })
    })
  })

  it('does not send the request when url not defined', () => {

    const errorRequest = Package.default({
      params: {some: 'param'}
    })

    expect.assertions(3)

    return errorRequest.send()
      .catch(() => {
        expect(request.default).not.toHaveBeenCalled()
        expect(Logger.default.error).toHaveBeenCalledWith('You must define url for the request to be sent')
        expect(setTimeout).not.toHaveBeenCalled()
      })

  })

})
