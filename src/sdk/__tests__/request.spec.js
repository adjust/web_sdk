import * as Request from '../request'
import * as http from '../http'
import * as Time from '../time'
import * as Logger from '../logger'
import * as Listeners from '../listeners'
import * as UrlStartegy from '../url-strategy'

jest.mock('../http')
jest.mock('../logger')
jest.mock('../url-strategy')
jest.useFakeTimers()

describe('test request functionality', () => {

  let dateNowSpy
  let createdAtSpy
  let isConnectedSpy
  const now = Date.now()
  const matchCreatedAt = (attempts) => ({
    params: {
      attempts,
      createdAt: now
    }
  })
  const someRequest = Request.default({
    url: '/global-request',
    params: {
      some: 'param'
    }
  })

  beforeAll(() => {
    jest.spyOn(http, 'default')
    jest.spyOn(Logger.default, 'log')
    jest.spyOn(Logger.default, 'error')
    jest.spyOn(global, 'setTimeout')
    jest.spyOn(global, 'clearTimeout')

    dateNowSpy = jest.spyOn(Date, 'now')
    createdAtSpy = jest.spyOn(Time, 'getTimestamp')
    isConnectedSpy = jest.spyOn(Listeners, 'isConnected')
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  afterAll(() => {
    jest.clearAllTimers()
    jest.restoreAllMocks()
  })

  it('does a successful request with default waiting and params set per instance', () => {

    createdAtSpy.mockReturnValueOnce(now)

    someRequest.send()

    expect.assertions(6)

    expect(Logger.default.log).toHaveBeenLastCalledWith('Trying request /global-request in 150ms')
    expect(setTimeout).toHaveBeenLastCalledWith(expect.any(Function), 150)
    expect(someRequest.isRunning()).toBeTruthy()

    jest.runOnlyPendingTimers()

    expect(http.default).toHaveBeenCalledWith({
      endpoint: 'app',
      url: '/global-request',
      method: 'GET',
      params: {
        attempts: 1,
        createdAt: now,
        some: 'param'
      }
    })

    return Utils.flushPromises()
      .then(() => {
        expect(Logger.default.log).toHaveBeenCalledWith('Request /global-request has been finished')
        expect(someRequest.isRunning()).toBeFalsy()
      })

  })

  it('does a successful request with custom waiting and params set per request', () => {

    createdAtSpy.mockReturnValueOnce(now)

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

    expect(http.default).toHaveBeenCalledWith({
      endpoint: 'app',
      url: '/global-request',
      method: 'GET',
      params: {
        attempts: 1,
        createdAt: now,
        more: 'params',
        and: 'more-fun'
      }
    })

    return Utils.flushPromises()
      .then(() => {
        expect(Logger.default.log).toHaveBeenCalledWith('Request /global-request has been finished')
      })

  })

  it('does a successful request with manual retry in success callback', () => {

    createdAtSpy.mockReturnValueOnce(now)

    http.default.mockResolvedValue({wait: 3000})

    someRequest.send({
      continueCb (result, finish, retry) {
        if (result.wait) {
          return retry(result.wait)
        }
        finish()
      }
    })

    expect.assertions(21)

    expect(Logger.default.log).toHaveBeenLastCalledWith('Trying request /global-request in 150ms')
    expect(setTimeout).toHaveBeenCalledTimes(1)
    expect(setTimeout).toHaveBeenLastCalledWith(expect.any(Function), 150)
    expect(someRequest.isRunning()).toBeTruthy()

    jest.runOnlyPendingTimers()

    expect(http.default).toHaveBeenCalledTimes(1)
    expect(http.default.mock.calls[0][0]).toMatchObject(matchCreatedAt(1))

    return Utils.flushPromises()
      .then(() => {
        expect(Logger.default.log).toHaveBeenLastCalledWith('Re-trying request /global-request in 3000ms')

        jest.runOnlyPendingTimers()

        expect(setTimeout).toHaveBeenCalledTimes(2)
        expect(setTimeout).toHaveBeenLastCalledWith(expect.any(Function), 3000)
        expect(http.default).toHaveBeenCalledTimes(2)
        expect(http.default.mock.calls[1][0]).toMatchObject(matchCreatedAt(2))
        expect(someRequest.isRunning()).toBeTruthy()

        return Utils.flushPromises()
      }).then(() => {
        http.default.mockClear()
        http.default.mockResolvedValue({})

        expect(Logger.default.log).toHaveBeenLastCalledWith('Re-trying request /global-request in 3000ms')

        jest.runOnlyPendingTimers()

        expect(setTimeout).toHaveBeenCalledTimes(3)
        expect(setTimeout).toHaveBeenLastCalledWith(expect.any(Function), 3000)
        expect(http.default).toHaveBeenCalledTimes(1)
        expect(http.default.mock.calls[0][0]).toMatchObject(matchCreatedAt(3))
        expect(someRequest.isRunning()).toBeTruthy()

        setTimeout.mockClear()

        return Utils.flushPromises()
      }).then(() => {
        jest.runOnlyPendingTimers()

        expect(Logger.default.log).toHaveBeenCalledWith('Request /global-request has been finished')
        expect(setTimeout).not.toHaveBeenCalled()
        expect(someRequest.isRunning()).toBeFalsy()
      })

  })

  it('does a successful request with manual retry in success callback with custom url and params and restores', () => {

    const newNow = Date.now()

    createdAtSpy.mockClear()

    createdAtSpy
      .mockReturnValueOnce(now)
      .mockReturnValueOnce(newNow)

    const continueCb = jest.fn((result, finish, retry) => {
      if (result.wait) {
        return retry(result.wait)
      }
      finish()
    })

    http.default.mockResolvedValue({wait: 1300})

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

    expect(http.default).toHaveBeenCalledTimes(1)
    expect(http.default).toHaveBeenLastCalledWith({
      endpoint: 'app',
      url: '/other-request',
      method: 'POST',
      params: {
        attempts: 1,
        createdAt: now,
        something: 'else'
      }
    })

    return Utils.flushPromises()
      .then(() => {
        expect(Logger.default.log).toHaveBeenLastCalledWith('Re-trying request /other-request in 1300ms')

        jest.runOnlyPendingTimers()

        expect(continueCb).toHaveBeenCalled()
        expect(setTimeout).toHaveBeenCalledTimes(2)
        expect(setTimeout).toHaveBeenLastCalledWith(expect.any(Function), 1300)
        expect(http.default).toHaveBeenCalledTimes(2)
        expect(http.default).toHaveBeenLastCalledWith({
          endpoint: 'app',
          url: '/other-request',
          method: 'POST',
          params: {
            attempts: 2,
            createdAt: now,
            something: 'else'
          }
        })

        return Utils.flushPromises()
      }).then(() => {
        http.default.mockClear()
        http.default.mockResolvedValue({})

        expect(Logger.default.log).toHaveBeenLastCalledWith('Re-trying request /other-request in 1300ms')

        jest.runOnlyPendingTimers()

        expect(continueCb).toHaveBeenCalled()
        expect(setTimeout).toHaveBeenCalledTimes(3)
        expect(setTimeout).toHaveBeenLastCalledWith(expect.any(Function), 1300)
        expect(http.default).toHaveBeenCalledTimes(1)
        expect(http.default).toHaveBeenLastCalledWith({
          endpoint: 'app',
          url: '/other-request',
          method: 'POST',
          params: {
            attempts: 3,
            createdAt: now,
            something: 'else'
          }
        })

        setTimeout.mockClear()
        http.default.mockClear()

        return Utils.flushPromises()
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

        expect(http.default).toHaveBeenCalledWith({
          endpoint: 'app',
          url: '/global-request',
          method: 'GET',
          params: {
            attempts: 1,
            createdAt: newNow,
            some: 'param'
          }
        })

        return Utils.flushPromises()
      }).then(() => {
        expect(continueCb).not.toHaveBeenCalled()
        expect(Logger.default.log).toHaveBeenCalledWith('Request /global-request has been finished')
      })

  })

  it('retries successful request on backend demand', () => {

    const newNow = Date.now()

    createdAtSpy.mockClear()

    createdAtSpy
      .mockReturnValueOnce(now)
      .mockReturnValueOnce(newNow)

    http.default.mockResolvedValue({retry_in: 666})

    someRequest.send({
      url: '/some-request',
      method: 'POST'
    })

    expect.assertions(22)

    expect(Logger.default.log).toHaveBeenLastCalledWith('Trying request /some-request in 150ms')
    expect(setTimeout).toHaveBeenCalledTimes(1)
    expect(setTimeout).toHaveBeenLastCalledWith(expect.any(Function), 150)

    jest.runOnlyPendingTimers()

    expect(http.default).toHaveBeenCalledTimes(1)
    expect(http.default).toHaveBeenLastCalledWith({
      endpoint: 'app',
      url: '/some-request',
      method: 'POST',
      params: {
        attempts: 1,
        createdAt: now,
        some: 'param'
      }
    })

    return Utils.flushPromises()
      .then(() => {
        expect(Logger.default.log).toHaveBeenLastCalledWith('Re-trying request /some-request in 666ms')

        http.default.mockResolvedValue({retry_in: 777})

        jest.runOnlyPendingTimers()

        expect(setTimeout).toHaveBeenCalledTimes(2)
        expect(setTimeout).toHaveBeenLastCalledWith(expect.any(Function), 666)
        expect(http.default).toHaveBeenCalledTimes(2)
        expect(http.default).toHaveBeenLastCalledWith({
          endpoint: 'app',
          url: '/some-request',
          method: 'POST',
          params: {
            attempts: 2,
            createdAt: now,
            some: 'param'
          }
        })

        return Utils.flushPromises()
      }).then(() => {
        http.default.mockClear()
        http.default.mockResolvedValue({})

        expect(Logger.default.log).toHaveBeenLastCalledWith('Re-trying request /some-request in 777ms')

        jest.runOnlyPendingTimers()

        expect(setTimeout).toHaveBeenCalledTimes(3)
        expect(setTimeout).toHaveBeenLastCalledWith(expect.any(Function), 777)
        expect(http.default).toHaveBeenCalledTimes(1)
        expect(http.default).toHaveBeenLastCalledWith({
          endpoint: 'app',
          url: '/some-request',
          method: 'POST',
          params: {
            attempts: 3,
            createdAt: now,
            some: 'param'
          }
        })

        setTimeout.mockClear()
        http.default.mockClear()

        return Utils.flushPromises()
      }).then(() => {
        jest.runOnlyPendingTimers()

        expect(Logger.default.log).toHaveBeenCalledWith('Request /some-request has been finished')
        expect(setTimeout).not.toHaveBeenCalled()

        someRequest.send()

        expect(Logger.default.log).toHaveBeenLastCalledWith('Trying request /global-request in 150ms')
        expect(setTimeout).toHaveBeenCalledTimes(1)
        expect(setTimeout).toHaveBeenLastCalledWith(expect.any(Function), 150)

        jest.runOnlyPendingTimers()

        expect(http.default).toHaveBeenCalledWith({
          endpoint: 'app',
          url: '/global-request',
          method: 'GET',
          params: {
            attempts: 1,
            createdAt: newNow,
            some: 'param'
          }
        })

        return Utils.flushPromises()
      }).then(() => {
        expect(Logger.default.log).toHaveBeenCalledWith('Request /global-request has been finished')
      })

  })

  it('limit wait to maximum 32 bit integer', () => {

    const newNow = Date.now()
    const max32Int = 2147483647

    createdAtSpy.mockClear()

    createdAtSpy
      .mockReturnValueOnce(now)
      .mockReturnValueOnce(newNow)

    http.default.mockResolvedValue({retry_in: 2592000000})

    someRequest.send({
      url: '/some-request'
    })

    expect.assertions(6)

    expect(Logger.default.log).toHaveBeenLastCalledWith('Trying request /some-request in 150ms')
    expect(setTimeout).toHaveBeenLastCalledWith(expect.any(Function), 150)

    jest.runOnlyPendingTimers()

    return Utils.flushPromises()
      .then(() => {
        expect(Logger.default.log).toHaveBeenLastCalledWith(`Re-trying request /some-request in ${max32Int}ms`)

        http.default.mockResolvedValue({})

        jest.runOnlyPendingTimers()

        expect(setTimeout).toHaveBeenLastCalledWith(expect.any(Function), max32Int)

        setTimeout.mockClear()

        return Utils.flushPromises()
      })
      .then(() => {
        expect(Logger.default.log).toHaveBeenCalledWith('Request /some-request has been finished')
        expect(setTimeout).not.toHaveBeenCalled()
      })

  })

  it('retires unsuccessful request with back-off', () => {

    const newNow = Date.now()
    const matchLocalCreatedAt = (attempts) => ({
      params: {
        attempts,
        createdAt: newNow
      }
    })

    http.default.mockRejectedValue(Utils.errorResponse())

    expect.assertions(39)

    someRequest.send({
      params: {
        createdAt: newNow
      }
    })

    expect(Logger.default.log).toHaveBeenLastCalledWith('Trying request /global-request in 150ms')
    expect(setTimeout).toHaveBeenCalledTimes(1)
    expect(setTimeout).toHaveBeenLastCalledWith(expect.any(Function), 150)
    expect(someRequest.isRunning()).toBeTruthy()

    jest.runOnlyPendingTimers()

    expect(http.default).toHaveBeenCalledTimes(1)
    expect(http.default.mock.calls[0][0]).toMatchObject(matchLocalCreatedAt(1))

    return Utils.flushPromises()
      .then(() => {
        expect(Logger.default.log).toHaveBeenLastCalledWith('Re-trying request /global-request in 100ms')

        jest.runOnlyPendingTimers()

        expect(http.default).toHaveBeenCalledTimes(2)
        expect(http.default.mock.calls[1][0]).toMatchObject(matchLocalCreatedAt(2))
        expect(setTimeout).toHaveBeenCalledTimes(2)
        expect(setTimeout).toHaveBeenLastCalledWith(expect.any(Function), 100)
        expect(someRequest.isRunning()).toBeTruthy()

        return Utils.flushPromises()
      })
      .then(() => {
        expect(Logger.default.log).toHaveBeenLastCalledWith('Re-trying request /global-request in 200ms')

        jest.runOnlyPendingTimers()

        expect(http.default).toHaveBeenCalledTimes(3)
        expect(http.default.mock.calls[2][0]).toMatchObject(matchLocalCreatedAt(3))
        expect(setTimeout).toHaveBeenCalledTimes(3)
        expect(setTimeout).toHaveBeenLastCalledWith(expect.any(Function), 200)
        expect(someRequest.isRunning()).toBeTruthy()

        return Utils.flushPromises()
      })
      .then(() => {
        expect(Logger.default.log).toHaveBeenLastCalledWith('Re-trying request /global-request in 300ms')

        jest.runOnlyPendingTimers()

        expect(http.default).toHaveBeenCalledTimes(4)
        expect(http.default.mock.calls[3][0]).toMatchObject(matchLocalCreatedAt(4))
        expect(setTimeout).toHaveBeenCalledTimes(4)
        expect(setTimeout).toHaveBeenLastCalledWith(expect.any(Function), 300)
        expect(someRequest.isRunning()).toBeTruthy()

        return Utils.flushPromises()
      })
      .then(() => {
        expect(Logger.default.log).toHaveBeenLastCalledWith('Re-trying request /global-request in 300ms')

        jest.runOnlyPendingTimers()

        expect(http.default).toHaveBeenCalledTimes(5)
        expect(http.default.mock.calls[4][0]).toMatchObject(matchLocalCreatedAt(5))
        expect(setTimeout).toHaveBeenCalledTimes(5)
        expect(setTimeout).toHaveBeenLastCalledWith(expect.any(Function), 300)
        expect(someRequest.isRunning()).toBeTruthy()

        return Utils.flushPromises()
      })
      .then(() => {

        http.default.mockClear()
        http.default.mockResolvedValue({})
        expect(Logger.default.log).toHaveBeenLastCalledWith('Re-trying request /global-request in 300ms')

        jest.runOnlyPendingTimers()

        expect(http.default).toHaveBeenCalledTimes(1)
        expect(http.default.mock.calls[0][0]).toMatchObject(matchLocalCreatedAt(6))
        expect(setTimeout).toHaveBeenCalledTimes(6)
        expect(setTimeout).toHaveBeenLastCalledWith(expect.any(Function), 300)
        expect(someRequest.isRunning()).toBeTruthy()

        setTimeout.mockClear()

        return Utils.flushPromises()
      })
      .then(() => {

        jest.runOnlyPendingTimers()

        expect(Logger.default.log).toHaveBeenCalledWith('Request /global-request has been finished')
        expect(setTimeout).not.toHaveBeenCalled()
        expect(someRequest.isRunning()).toBeFalsy()
      })
  })

  it('retires unsuccessful request because of no connection without back-off', () => {
    const newNow = Date.now()
    const matchLocalCreatedAt = (attempts) => ({
      params: {
        attempts,
        createdAt: newNow
      }
    })

    http.default.mockRejectedValue(Utils.errorResponse('NO_CONNECTION'))

    expect.assertions(22)

    someRequest.send({
      params: {
        createdAt: newNow
      }
    })

    expect(Logger.default.log).toHaveBeenLastCalledWith('Trying request /global-request in 150ms')
    expect(setTimeout).toHaveBeenCalledTimes(1)
    expect(setTimeout).toHaveBeenLastCalledWith(expect.any(Function), 150)

    jest.runOnlyPendingTimers()

    expect(http.default).toHaveBeenCalledTimes(1)
    expect(http.default.mock.calls[0][0]).toMatchObject(matchLocalCreatedAt(1))

    return Utils.flushPromises()
      .then(() => {
        expect(Logger.default.log).toHaveBeenLastCalledWith('Re-trying request /global-request in 60000ms')

        jest.runOnlyPendingTimers()

        expect(http.default).toHaveBeenCalledTimes(2)
        expect(http.default.mock.calls[1][0]).toMatchObject(matchLocalCreatedAt(2))
        expect(setTimeout).toHaveBeenCalledTimes(2)
        expect(setTimeout).toHaveBeenLastCalledWith(expect.any(Function), 60000)

        return Utils.flushPromises()
      })
      .then(() => {
        expect(Logger.default.log).toHaveBeenLastCalledWith('Re-trying request /global-request in 60000ms')

        jest.runOnlyPendingTimers()

        expect(http.default).toHaveBeenCalledTimes(3)
        expect(http.default.mock.calls[2][0]).toMatchObject(matchLocalCreatedAt(3))
        expect(setTimeout).toHaveBeenCalledTimes(3)
        expect(setTimeout).toHaveBeenLastCalledWith(expect.any(Function), 60000)

        return Utils.flushPromises()
      })
      .then(() => {

        http.default.mockClear()
        http.default.mockResolvedValue({})
        expect(Logger.default.log).toHaveBeenLastCalledWith('Re-trying request /global-request in 60000ms')

        jest.runOnlyPendingTimers()

        expect(http.default).toHaveBeenCalledTimes(1)
        expect(http.default.mock.calls[0][0]).toMatchObject(matchLocalCreatedAt(4))
        expect(setTimeout).toHaveBeenCalledTimes(4)
        expect(setTimeout).toHaveBeenLastCalledWith(expect.any(Function), 60000)

        setTimeout.mockClear()

        return Utils.flushPromises()
      })
      .then(() => {

        jest.runOnlyPendingTimers()

        expect(Logger.default.log).toHaveBeenCalledWith('Request /global-request has been finished')
        expect(setTimeout).not.toHaveBeenCalled()
      })
  })

  it('retires request when no connection recognized from offline event without back-off', () => {

    const newNow = Date.now()
    const matchLocalCreatedAt = (attempts) => ({
      params: {
        attempts,
        createdAt: newNow
      }
    })

    isConnectedSpy.mockReturnValue(false)

    expect.assertions(38)

    someRequest.send({
      params: {
        createdAt: newNow
      }
    })

    expect(Logger.default.log).toHaveBeenCalledTimes(2)
    expect(Logger.default.log).toHaveBeenCalledWith('Trying request /global-request in 150ms')
    expect(Logger.default.log).toHaveBeenCalledWith('No internet connectivity, trying request /global-request in 60000ms')
    expect(setTimeout).toHaveBeenCalledTimes(1)
    expect(setTimeout).toHaveBeenLastCalledWith(expect.any(Function), 60000)
    expect(someRequest.isRunning()).toBeTruthy()

    jest.runOnlyPendingTimers()

    expect(http.default).not.toHaveBeenCalled()

    return Utils.flushPromises()
      .then(() => {
        expect(Logger.default.log).toHaveBeenCalledTimes(3)
        expect(Logger.default.log).toHaveBeenLastCalledWith('No internet connectivity, trying request /global-request in 60000ms')
        expect(setTimeout).toHaveBeenCalledTimes(2)
        expect(setTimeout).toHaveBeenLastCalledWith(expect.any(Function), 60000)
        expect(someRequest.isRunning()).toBeTruthy()

        jest.runOnlyPendingTimers()

        expect(http.default).not.toHaveBeenCalled()

        return Utils.flushPromises()
      })
      .then(() => {
        expect(Logger.default.log).toHaveBeenCalledTimes(4)
        expect(Logger.default.log).toHaveBeenLastCalledWith('No internet connectivity, trying request /global-request in 60000ms')
        expect(setTimeout).toHaveBeenCalledTimes(3)
        expect(setTimeout).toHaveBeenLastCalledWith(expect.any(Function), 60000)
        expect(someRequest.isRunning()).toBeTruthy()

        jest.runOnlyPendingTimers()

        expect(http.default).not.toHaveBeenCalled()

        return Utils.flushPromises()
      })
      .then(() => {

        isConnectedSpy.mockReturnValue(true)
        http.default.mockRejectedValue(Utils.errorResponse())

        expect(Logger.default.log).toHaveBeenCalledTimes(5)
        expect(Logger.default.log).toHaveBeenLastCalledWith('No internet connectivity, trying request /global-request in 60000ms')
        expect(setTimeout).toHaveBeenCalledTimes(4)
        expect(setTimeout).toHaveBeenLastCalledWith(expect.any(Function), 60000)
        expect(someRequest.isRunning()).toBeTruthy()

        jest.runAllTimers()

        expect(http.default).toHaveBeenCalledTimes(1)
        expect(http.default.mock.calls[0][0]).toMatchObject(matchLocalCreatedAt(5))
        expect(Logger.default.log).toHaveBeenCalledWith('Trying request /global-request in 150ms')
        expect(setTimeout).toHaveBeenCalledTimes(5)
        expect(setTimeout).toHaveBeenLastCalledWith(expect.any(Function), 150)

        return Utils.flushPromises()
      })
      .then(() => {

        http.default.mockClear()
        http.default.mockResolvedValue({})
        expect(Logger.default.log).toHaveBeenLastCalledWith('Re-trying request /global-request in 100ms')

        jest.runOnlyPendingTimers()

        expect(http.default).toHaveBeenCalledTimes(1)
        expect(http.default.mock.calls[0][0]).toMatchObject(matchLocalCreatedAt(6))
        expect(setTimeout).toHaveBeenCalledTimes(6)
        expect(setTimeout).toHaveBeenLastCalledWith(expect.any(Function), 100)
        expect(someRequest.isRunning()).toBeTruthy()

        setTimeout.mockClear()

        return Utils.flushPromises()
      })
      .then(() => {
        jest.runOnlyPendingTimers()

        expect(Logger.default.log).toHaveBeenCalledWith('Request /global-request has been finished')
        expect(setTimeout).not.toHaveBeenCalled()
        expect(someRequest.isRunning()).toBeFalsy()
      })
  })

  it('retires unsuccessful request with custom url and restores', () => {

    const newNow = Date.now()

    createdAtSpy
      .mockReturnValueOnce(now)
      .mockReturnValueOnce(newNow)

    http.default.mockRejectedValue(Utils.errorResponse())

    expect.assertions(27)

    someRequest.send({url: '/new-request'})

    expect(Logger.default.log).toHaveBeenLastCalledWith('Trying request /new-request in 150ms')
    expect(setTimeout).toHaveBeenCalledTimes(1)
    expect(setTimeout).toHaveBeenLastCalledWith(expect.any(Function), 150)

    jest.runOnlyPendingTimers()

    expect(http.default).toHaveBeenCalledTimes(1)
    expect(http.default.mock.calls[0][0]).toMatchObject({
      url: '/new-request',
      ...matchCreatedAt(1)
    })

    return Utils.flushPromises()
      .then(() => {
        expect(Logger.default.log).toHaveBeenLastCalledWith('Re-trying request /new-request in 100ms')

        jest.runOnlyPendingTimers()

        expect(setTimeout).toHaveBeenCalledTimes(2)
        expect(setTimeout).toHaveBeenLastCalledWith(expect.any(Function), 100)
        expect(http.default).toHaveBeenCalledTimes(2)
        expect(http.default.mock.calls[1][0]).toMatchObject({
          url: '/new-request',
          ...matchCreatedAt(2)
        })

        return Utils.flushPromises()
      }).then(() => {
        expect(Logger.default.log).toHaveBeenLastCalledWith('Re-trying request /new-request in 200ms')

        jest.runOnlyPendingTimers()

        expect(setTimeout).toHaveBeenCalledTimes(3)
        expect(setTimeout).toHaveBeenLastCalledWith(expect.any(Function), 200)
        expect(http.default).toHaveBeenCalledTimes(3)
        expect(http.default.mock.calls[2][0]).toMatchObject({
          url: '/new-request',
          ...matchCreatedAt(3)
        })

        return Utils.flushPromises()
      }).then(() => {

        http.default.mockClear()
        http.default.mockResolvedValue({})
        expect(Logger.default.log).toHaveBeenLastCalledWith('Re-trying request /new-request in 300ms')

        jest.runOnlyPendingTimers()

        expect(setTimeout).toHaveBeenCalledTimes(4)
        expect(setTimeout).toHaveBeenLastCalledWith(expect.any(Function), 300)
        expect(http.default).toHaveBeenCalledTimes(1)
        expect(http.default.mock.calls[0][0]).toMatchObject({
          url: '/new-request',
          ...matchCreatedAt(4)
        })

        setTimeout.mockClear()

        return Utils.flushPromises()
      }).then(() => {

        jest.runOnlyPendingTimers()

        expect(Logger.default.log).toHaveBeenCalledWith('Request /new-request has been finished')
        expect(setTimeout).not.toHaveBeenCalled()

        someRequest.send()

        expect(Logger.default.log).toHaveBeenLastCalledWith('Trying request /global-request in 150ms')
        expect(setTimeout).toHaveBeenCalledTimes(1)
        expect(setTimeout).toHaveBeenLastCalledWith(expect.any(Function), 150)

        jest.runOnlyPendingTimers()

        expect(http.default).toHaveBeenCalledWith({
          endpoint: 'app',
          url: '/global-request',
          method: 'GET',
          params: {
            attempts: 1,
            createdAt: newNow,
            some: 'param'
          }
        })

        return Utils.flushPromises()
      }).then(() => {
        expect(Logger.default.log).toHaveBeenCalledWith('Request /global-request has been finished')
      })
  })

  it('cancels initiated request', () => {

    expect.assertions(6)

    someRequest.send({wait: 2000})

    expect(Logger.default.log).toHaveBeenLastCalledWith('Trying request /global-request in 2000ms')
    expect(setTimeout).toHaveBeenLastCalledWith(expect.any(Function), 2000)
    expect(someRequest.isRunning()).toBeTruthy()

    someRequest.clear()

    jest.runOnlyPendingTimers()

    expect(http.default).not.toHaveBeenCalled()
    expect(someRequest.isRunning()).toBeFalsy()

    return Utils.flushPromises()
      .then(() => {
        expect(Logger.default.log).toHaveBeenLastCalledWith('Previous /global-request request attempt canceled')
      })

  })

  it('cancels initiated request with connection attempt running', () => {

    expect.assertions(8)

    isConnectedSpy.mockReturnValueOnce(false)

    someRequest.send()

    expect(Logger.default.log).toHaveBeenCalledTimes(2)
    expect(Logger.default.log).toHaveBeenCalledWith('Trying request /global-request in 150ms')
    expect(Logger.default.log).toHaveBeenCalledWith('No internet connectivity, trying request /global-request in 60000ms')
    expect(setTimeout).toHaveBeenLastCalledWith(expect.any(Function), 60000)
    expect(someRequest.isRunning()).toBeTruthy()

    someRequest.clear()

    jest.runOnlyPendingTimers()

    expect(http.default).not.toHaveBeenCalled()
    expect(someRequest.isRunning()).toBeFalsy()

    return Utils.flushPromises()
      .then(() => {
        expect(Logger.default.log).toHaveBeenLastCalledWith('Previous /global-request request attempt canceled')
      })

  })

  it('cancels initiated request with custom url and restores', () => {

    expect.assertions(12)

    someRequest.send({
      wait: 2000,
      url: '/other'
    })

    expect(Logger.default.log).toHaveBeenLastCalledWith('Trying request /other in 2000ms')
    expect(setTimeout).toHaveBeenLastCalledWith(expect.any(Function), 2000)
    expect(someRequest.isRunning()).toBeTruthy()

    someRequest.clear()

    jest.runOnlyPendingTimers()

    expect(http.default).not.toHaveBeenCalled()
    expect(someRequest.isRunning()).toBeFalsy()

    return Utils.flushPromises()
      .then(() => {
        expect(Logger.default.log).toHaveBeenLastCalledWith('Previous /other request attempt canceled')

        someRequest.send({wait: 500})

        expect(Logger.default.log).toHaveBeenLastCalledWith('Trying request /global-request in 500ms')
        expect(setTimeout).toHaveBeenLastCalledWith(expect.any(Function), 500)
        expect(someRequest.isRunning()).toBeTruthy()

        jest.runOnlyPendingTimers()

        expect(http.default).toHaveBeenCalled()

        return Utils.flushPromises()
      })
      .then(() => {
        expect(Logger.default.log).toHaveBeenCalledWith('Request /global-request has been finished')
        expect(someRequest.isRunning()).toBeFalsy()
      })

  })

  it('retires unsuccessful request and then cancels', () => {

    const newNow = Date.now()

    createdAtSpy
      .mockReturnValueOnce(now)
      .mockReturnValueOnce(newNow)

    http.default.mockRejectedValue(Utils.errorResponse())

    expect.assertions(18)

    someRequest.send({url: '/some-new-request'})

    expect(Logger.default.log).toHaveBeenLastCalledWith('Trying request /some-new-request in 150ms')
    expect(setTimeout).toHaveBeenCalledTimes(1)
    expect(setTimeout).toHaveBeenLastCalledWith(expect.any(Function), 150)

    jest.runOnlyPendingTimers()

    expect(http.default).toHaveBeenCalledTimes(1)
    expect(http.default.mock.calls[0][0]).toMatchObject({
      url: '/some-new-request',
      ...matchCreatedAt(1)
    })

    return Utils.flushPromises()
      .then(() => {
        expect(Logger.default.log).toHaveBeenLastCalledWith('Re-trying request /some-new-request in 100ms')

        jest.runOnlyPendingTimers()

        expect(http.default).toHaveBeenCalledTimes(2)
        expect(http.default.mock.calls[1][0]).toMatchObject({
          url: '/some-new-request',
          ...matchCreatedAt(2)
        })
        expect(setTimeout).toHaveBeenCalledTimes(2)
        expect(setTimeout).toHaveBeenLastCalledWith(expect.any(Function), 100)

        return Utils.flushPromises()
      }).then(() => {

        http.default.mockClear()
        setTimeout.mockClear()

        expect(Logger.default.log).toHaveBeenLastCalledWith('Re-trying request /some-new-request in 200ms')

        someRequest.clear()

        jest.runOnlyPendingTimers()

        expect(http.default).not.toHaveBeenCalled()
        expect(setTimeout).not.toHaveBeenCalled()
        expect(Logger.default.log).toHaveBeenLastCalledWith('Previous /some-new-request request attempt canceled')

        http.default.mockResolvedValue({})

        someRequest.send()

        expect(Logger.default.log).toHaveBeenLastCalledWith('Trying request /global-request in 150ms')
        expect(setTimeout).toHaveBeenLastCalledWith(expect.any(Function), 150)

        jest.runOnlyPendingTimers()

        expect(http.default).toHaveBeenCalledWith({
          endpoint: 'app',
          url: '/global-request',
          method: 'GET',
          params: {
            attempts: 1,
            createdAt: newNow,
            some: 'param'
          }
        })

        return Utils.flushPromises()
      }).then(() => {
        expect(Logger.default.log).toHaveBeenCalledWith('Request /global-request has been finished')
      })
  })

  it('clears unsuccessful request when no retry flag recognized', () => {

    const newNow = Date.now()

    createdAtSpy
      .mockReturnValueOnce(now)
      .mockReturnValueOnce(newNow)

    http.default.mockRejectedValue({message: 'Unknown error'})

    expect.assertions(17)

    let promise = someRequest.send({url: '/failed-request'})

    expect(Logger.default.log).toHaveBeenLastCalledWith('Trying request /failed-request in 150ms')
    expect(setTimeout).toHaveBeenCalledTimes(1)
    expect(setTimeout).toHaveBeenLastCalledWith(expect.any(Function), 150)
    expect(someRequest.isRunning()).toBeTruthy()

    jest.runOnlyPendingTimers()

    expect(http.default).toHaveBeenCalledTimes(1)
    expect(http.default.mock.calls[0][0]).toMatchObject({
      url: '/failed-request',
      ...matchCreatedAt(1)
    })

    return promise
      .catch(error => {
        expect(error).toEqual({message: 'Unknown error'})
        expect(someRequest.isRunning()).toBeFalsy()
        expect(clearTimeout).toHaveBeenCalledTimes(1)
        expect(Logger.default.log).toHaveBeenLastCalledWith('Request /failed-request failed')

        http.default.mockRejectedValue(undefined)
        http.default.mockClear()
        clearTimeout.mockClear()

        promise = someRequest.send({url: '/another-failed-request'})

        expect(Logger.default.log).toHaveBeenLastCalledWith('Trying request /another-failed-request in 150ms')
        expect(someRequest.isRunning()).toBeTruthy()

        jest.runOnlyPendingTimers()

        expect(http.default).toHaveBeenCalledWith({
          endpoint: 'app',
          url: '/another-failed-request',
          method: 'GET',
          params: {
            attempts: 1,
            createdAt: newNow,
            some: 'param'
          }
        })

        return promise
      })
      .catch(error => {
        expect(error).toEqual({})
        expect(someRequest.isRunning()).toBeFalsy()
        expect(clearTimeout).toHaveBeenCalledTimes(1)
        expect(Logger.default.log).toHaveBeenLastCalledWith('Request /another-failed-request failed')

        http.default.mockResolvedValue({})
      })
  })

  it('cancels previously initiated request with another one', () => {

    expect.assertions(9)

    someRequest.send({wait: 1000})

    expect(Logger.default.log).toHaveBeenLastCalledWith('Trying request /global-request in 1000ms')
    expect(setTimeout).toHaveBeenLastCalledWith(expect.any(Function), 1000)

    Logger.default.log.mockClear()

    // initiate immediately another request
    someRequest.send()

    expect(Logger.default.log.mock.calls[0][0]).toBe('Previous /global-request request attempt canceled')
    expect(Logger.default.log.mock.calls[1][0]).toBe('Trying request /global-request in 150ms')
    expect(someRequest.isRunning()).toBeTruthy()

    jest.runOnlyPendingTimers()

    expect(http.default).toHaveBeenCalledTimes(1)

    return Utils.flushPromises()
      .then(() => {
        expect(http.default).toHaveBeenCalledTimes(1)
        expect(Logger.default.log).toHaveBeenCalledWith('Request /global-request has been finished')
        expect(someRequest.isRunning()).toBeFalsy()
      })

  })

  it('skips canceling previously initiated request if less time left', () => {

    dateNowSpy.mockReturnValue(now)

    expect.assertions(9)

    someRequest.send({wait: 1000})

    expect(Logger.default.log).toHaveBeenLastCalledWith('Trying request /global-request in 1000ms')
    expect(setTimeout).toHaveBeenLastCalledWith(expect.any(Function), 1000)

    Logger.default.log.mockClear()

    dateNowSpy.mockReturnValue(now + 500)
    jest.advanceTimersByTime(500)

    // initiate another request after 500ms
    someRequest.send({wait: 2000})

    expect(Logger.default.log).not.toHaveBeenCalledWith('Previous /global-request request attempt canceled')
    expect(Logger.default.log).not.toHaveBeenCalledWith('Trying request /global-request in 150ms')
    expect(someRequest.isRunning()).toBeTruthy()

    jest.runOnlyPendingTimers()

    expect(http.default).toHaveBeenCalledTimes(1)

    return Utils.flushPromises()
      .then(() => {
        expect(http.default).toHaveBeenCalledTimes(1)
        expect(Logger.default.log).toHaveBeenCalledWith('Request /global-request has been finished')
        expect(someRequest.isRunning()).toBeFalsy()
      })

  })

  describe('test overriding on request level', () => {

    beforeAll(() => {
      createdAtSpy.mockReturnValue(now)
    })

    describe('uses default parameters', () => {

      const req = Request.default({
        url: '/another-global-request',
      })

      it('does a successful request with default params', () => {

        req.send()

        expect(Logger.default.log).toHaveBeenLastCalledWith('Trying request /another-global-request in 150ms')
        expect(setTimeout).toHaveBeenLastCalledWith(expect.any(Function), 150)

        jest.runOnlyPendingTimers()

        expect(http.default).toHaveBeenCalledWith({
          endpoint: 'app',
          url: '/another-global-request',
          method: 'GET',
          params: {
            attempts: 1,
            createdAt: now,
          }
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

        expect(http.default).toHaveBeenCalledWith({
          endpoint: 'app',
          url: '/new-url',
          method: 'POST',
          params: {
            attempts: 1,
            createdAt: now,
            trc: 'prc',
            bla: 'truc'
          }
        })

        return Utils.flushPromises()
          .then(() => {
            expect(Logger.default.log).toHaveBeenCalledWith('Request /new-url has been finished')

            req.send({wait: 1000})

            expect(Logger.default.log).toHaveBeenLastCalledWith('Trying request /another-global-request in 1000ms')
            expect(setTimeout).toHaveBeenLastCalledWith(expect.any(Function), 1000)

            jest.runOnlyPendingTimers()

            return Utils.flushPromises()
          }).then(() => {
            expect(Logger.default.log).toHaveBeenCalledWith('Request /another-global-request has been finished')
          })

      })

    })

    describe('passes custom parameters', () => {

      const continueCb = jest.fn((_, finish) => finish())
      const req = Request.default({
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

        expect(http.default).toHaveBeenCalledWith({
          endpoint: 'app',
          url: '/another-global-request',
          method: 'GET',
          params: {
            attempts: 1,
            createdAt: now,
            some: 'param'
          }
        })

        return Utils.flushPromises()
          .then(() => {
            expect(continueCb).toHaveBeenCalled()
          })
      })

      it('does a successful request with overriding params and continue callback per request and restores', () => {

        const newContinueCb = jest.fn((_, finish) => finish())

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

        expect(http.default).toHaveBeenCalledWith({
          endpoint: 'app',
          url: '/another-global-request',
          method: 'GET',
          params: {
            attempts: 1,
            createdAt: now,
            bla: 'ble',
            blu: 'bli'
          }
        })

        return Utils.flushPromises()
          .then(() => {
            expect(newContinueCb).toHaveBeenCalled()

            newContinueCb.mockClear()

            req.send({wait: 400})

            expect(Logger.default.log).toHaveBeenLastCalledWith('Trying request /another-global-request in 400ms')
            expect(setTimeout).toHaveBeenLastCalledWith(expect.any(Function), 400)

            jest.runOnlyPendingTimers()

            expect(http.default).toHaveBeenCalledWith({
              endpoint: 'app',
              url: '/another-global-request',
              method: 'GET',
              params: {
                attempts: 1,
                createdAt: now,
                some: 'param'
              }
            })

            return Utils.flushPromises()
          }).then(() => {
            expect(newContinueCb).not.toHaveBeenCalled()
          })
      })
    })
  })

  it('does not send the request when url not defined', () => {

    const errorRequest = Request.default({
      params: {some: 'param'}
    })

    expect.assertions(4)

    return errorRequest.send()
      .catch(error => {
        expect(http.default).not.toHaveBeenCalled()
        expect(Logger.default.error).toHaveBeenCalledWith('You must define url for the request to be sent')
        expect(setTimeout).not.toHaveBeenCalled()
        expect(error).toEqual({
          status: 'error',
          action: 'CONTINUE',
          response: '',
          message: 'Url is not provided',
          code: 'MISSING_URL'
        })
      })

  })

  describe('url startegy retries functionality', () => {
    const testEndpoints = jest.requireMock('../url-strategy').mockEndpoints.endpoints

    // let getBaseUrlsIterator to return pre-created iterator so it's possible to spy iterator methods
    const iterator = jest.requireActual(('../url-strategy')).getBaseUrlsIterator(testEndpoints)

    const expectHttpCall = (times, endpoint, url) => {
      expect(http.default).toHaveBeenCalledTimes(times)
      expect(http.default).toHaveBeenCalledWith({
        endpoint: endpoint,
        url: url,
        method: 'GET',
        params: {
          attempts: times,
          createdAt: now
        }
      })
    }

    const clearIteratorMock = (iterator) => {
      jest.spyOn(iterator, 'next').mockClear()
      jest.spyOn(iterator, 'reset').mockClear()
    }

    beforeAll(() => {
      jest.spyOn(UrlStartegy, 'getBaseUrlsIterator').mockImplementation(() => iterator)
      jest.spyOn(iterator, 'next')
      jest.spyOn(iterator, 'reset')

      createdAtSpy.mockReturnValue(now)
    })

    afterEach(() => {
      jest.clearAllMocks()
      iterator.reset()
    })

    afterAll(() => {
      jest.clearAllTimers()
      jest.restoreAllMocks()
    })

    it('does not retries if request succesfully sent', () => {
      Request
        .default({
          url: '/global-request',
          params: {
            some: 'param'
          }
        })
        .send()

      expect.assertions(9)

      expect(UrlStartegy.getBaseUrlsIterator).toHaveBeenCalled()
      expect(iterator.next).toHaveBeenCalledTimes(1)
      expect(iterator.next).toHaveReturnedWith({ value: testEndpoints.default, done: false })

      expect(Logger.default.log).toHaveBeenLastCalledWith('Trying request /global-request in 150ms')

      jest.runOnlyPendingTimers()

      expect(http.default).toHaveBeenCalledWith({
        endpoint: 'app.default',
        url: '/global-request',
        method: 'GET',
        params: {
          attempts: 1,
          createdAt: now,
          some: 'param'
        }
      })

      return Utils.flushPromises()
        .then(() => {
          expect(Logger.default.log).toHaveBeenCalledWith('Request /global-request has been finished')

          // iterator was reset and next called in request successful callback
          expect(iterator.next).toHaveBeenCalledTimes(2)
          expect(iterator.next).toHaveReturnedTimes(2)
          expect(iterator.next).toHaveReturnedWith({ value: testEndpoints.default, done: false })
        })
    })

    it('retries to send request to endpoints iteratively and stops to iterate when connected succesfully', () => {
      http.default.mockRejectedValue(Utils.errorResponse('NO_CONNECTION'))

      Request
        .default({ url: '/global-request' })
        .send()

      expect.assertions(38)

      expect(UrlStartegy.getBaseUrlsIterator).toHaveBeenCalled()
      expect(iterator.next).toHaveReturnedWith({ value: testEndpoints.default, done: false })
      clearIteratorMock(iterator)

      expect(Logger.default.log).toHaveBeenLastCalledWith('Trying request /global-request in 150ms')

      jest.runOnlyPendingTimers()

      expectHttpCall(1, 'app.default', '/global-request')

      return Utils.flushPromises()
        .then(() => {
          expect(iterator.next).toHaveReturnedWith({ value: testEndpoints.india, done: false })
          clearIteratorMock(iterator)

          expect(Logger.default.log).toHaveBeenLastCalledWith('Re-trying request /global-request in 150ms')

          jest.runOnlyPendingTimers()

          expectHttpCall(2, 'app.india', '/global-request')

          return Utils.flushPromises()
        })
        .then(() => {
          expect(iterator.next).toHaveReturnedWith({ value: testEndpoints.china, done: false })
          clearIteratorMock(iterator)

          expect(Logger.default.log).toHaveBeenLastCalledWith('Re-trying request /global-request in 150ms')

          jest.runOnlyPendingTimers()

          expectHttpCall(3, 'app.china', '/global-request')

          return Utils.flushPromises()
        }).then(() => {
          expect(iterator.next).toHaveReturnedWith({ value: undefined, done: true })
          expect(iterator.reset).toHaveBeenCalled()
          expect(iterator.next).toHaveReturnedWith({ value: testEndpoints.default, done: false })
          clearIteratorMock(iterator)

          expect(Logger.default.log).toHaveBeenLastCalledWith('Re-trying request /global-request in 60000ms')

          jest.runOnlyPendingTimers()

          expectHttpCall(4, 'app.default', '/global-request')

          return Utils.flushPromises()
        }).then(() => {
          expect(iterator.next).toHaveReturnedWith({ value: testEndpoints.india, done: false })
          clearIteratorMock(iterator)

          expect(Logger.default.log).toHaveBeenLastCalledWith('Re-trying request /global-request in 150ms')

          jest.runOnlyPendingTimers()

          expectHttpCall(5, 'app.india', '/global-request')

          return Utils.flushPromises()
        })
        .then(() => {
          expect(iterator.next).toHaveReturnedWith({ value: testEndpoints.china, done: false })
          clearIteratorMock(iterator)

          expect(Logger.default.log).toHaveBeenLastCalledWith('Re-trying request /global-request in 150ms')

          jest.runOnlyPendingTimers()

          expectHttpCall(6, 'app.china', '/global-request')

          return Utils.flushPromises()
        }).then(() => {
          expect(iterator.next).toHaveReturnedWith({ value: undefined, done: true })
          expect(iterator.reset).toHaveBeenCalled()
          expect(iterator.next).toHaveReturnedWith({ value: testEndpoints.default, done: false })
          clearIteratorMock(iterator)

          expect(Logger.default.log).toHaveBeenLastCalledWith('Re-trying request /global-request in 60000ms')

          jest.runOnlyPendingTimers()

          expectHttpCall(7, 'app.default', '/global-request')

          http.default.mockResolvedValue({}) // let http successfully resolve next time

          return Utils.flushPromises()
        })
        .then(() => {
          expect(iterator.next).toHaveReturnedWith({ value: testEndpoints.india, done: false })
          clearIteratorMock(iterator)

          expect(Logger.default.log).toHaveBeenLastCalledWith('Re-trying request /global-request in 150ms')

          jest.runOnlyPendingTimers()

          expectHttpCall(8, 'app.india', '/global-request')

          return Utils.flushPromises()
        })
        .then(() => {

          jest.runOnlyPendingTimers()

          expect(Logger.default.log).toHaveBeenCalledWith('Request /global-request has been finished')
        })
    })

    it('does not iterate endpoints if another error happened', () => {
      http.default.mockRejectedValue(Utils.errorResponse('UNKNOWN'))

      Request
        .default({ url: '/global-request' })
        .send()

      expect.assertions(14)

      expect(UrlStartegy.getBaseUrlsIterator).toHaveBeenCalled()
      expect(iterator.next).toHaveReturnedWith({ value: testEndpoints.default, done: false })
      clearIteratorMock(iterator)

      expect(Logger.default.log).toHaveBeenLastCalledWith('Trying request /global-request in 150ms')

      jest.runOnlyPendingTimers()

      expectHttpCall(1, 'app.default', '/global-request')

      return Utils.flushPromises()
        .then(() => {
          expect(iterator.next).not.toHaveBeenCalled()
          clearIteratorMock(iterator)

          expect(Logger.default.log).toHaveBeenLastCalledWith('Re-trying request /global-request in 100ms') // 100ms is because of back-off

          jest.runOnlyPendingTimers()

          expectHttpCall(2, 'app.default', '/global-request')

          http.default.mockResolvedValue({}) // let http successfully resolve next time

          return Utils.flushPromises()
        })
        .then(() => {
          expect(iterator.next).not.toHaveBeenCalled()
          clearIteratorMock(iterator)

          expect(Logger.default.log).toHaveBeenLastCalledWith('Re-trying request /global-request in 200ms')

          jest.runOnlyPendingTimers()

          expectHttpCall(3, 'app.default', '/global-request')

          return Utils.flushPromises()
        })
        .then(() => {
          jest.runOnlyPendingTimers()

          expect(Logger.default.log).toHaveBeenCalledWith('Request /global-request has been finished')
        })
    })

  })

})
