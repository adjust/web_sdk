import * as Package from '../package'
import * as request from '../request'
import * as Time from '../time'
import * as Logger from '../logger'

jest.mock('../request')
jest.mock('../logger')
jest.useFakeTimers()

describe('test package functionality', () => {

  let dateNowSpy
  let createdAtSpy
  const now = Date.now()
  const matchCreatedAt = {
    params: {
      createdAt: now
    }
  }
  const someRequest = Package.default({
    url: '/global-request',
    params: {
      some: 'param'
    }
  })

  beforeAll(() => {
    jest.spyOn(request, 'default')
    jest.spyOn(Logger.default, 'log')
    jest.spyOn(Logger.default, 'error')

    dateNowSpy = jest.spyOn(Date, 'now')
    createdAtSpy = jest.spyOn(Time, 'getTimestamp')
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

    expect.assertions(4)

    expect(Logger.default.log).toHaveBeenLastCalledWith('Trying request /global-request in 150ms')
    expect(setTimeout).toHaveBeenLastCalledWith(expect.any(Function), 150)

    jest.runOnlyPendingTimers()

    expect(request.default).toHaveBeenCalledWith({
      url: '/global-request',
      method: 'GET',
      params: {
        createdAt: now,
        some: 'param'
      }
    })

    return Utils.flushPromises()
      .then(() => {
        expect(Logger.default.log).toHaveBeenCalledWith('Request /global-request has been finished')
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

    expect(request.default).toHaveBeenCalledWith({
      url: '/global-request',
      method: 'GET',
      params: {
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

    request.default.mockResolvedValue({wait: 3000})

    someRequest.send({
      continueCb (result) {
        if (result.wait) {
          return someRequest.retry(result.wait)
        }

        someRequest.finish()
      }
    })

    expect.assertions(17)

    expect(Logger.default.log).toHaveBeenLastCalledWith('Trying request /global-request in 150ms')
    expect(setTimeout).toHaveBeenCalledTimes(1)
    expect(setTimeout).toHaveBeenLastCalledWith(expect.any(Function), 150)

    jest.runOnlyPendingTimers()

    expect(request.default).toHaveBeenCalledTimes(1)
    expect(request.default.mock.calls[0][0]).toMatchObject(matchCreatedAt)

    return Utils.flushPromises()
      .then(() => {
        expect(Logger.default.log).toHaveBeenLastCalledWith('Re-trying request /global-request in 3000ms')

        jest.runOnlyPendingTimers()

        expect(setTimeout).toHaveBeenCalledTimes(2)
        expect(setTimeout).toHaveBeenLastCalledWith(expect.any(Function), 3000)
        expect(request.default).toHaveBeenCalledTimes(2)
        expect(request.default.mock.calls[1][0]).toMatchObject(matchCreatedAt)

        return Utils.flushPromises()
      }).then(() => {
        request.default.mockClear()
        request.default.mockResolvedValue({})

        expect(Logger.default.log).toHaveBeenLastCalledWith('Re-trying request /global-request in 3000ms')

        jest.runOnlyPendingTimers()

        expect(setTimeout).toHaveBeenCalledTimes(3)
        expect(setTimeout).toHaveBeenLastCalledWith(expect.any(Function), 3000)
        expect(request.default).toHaveBeenCalledTimes(1)
        expect(request.default.mock.calls[0][0]).toMatchObject(matchCreatedAt)

        setTimeout.mockClear()

        return Utils.flushPromises()
      }).then(() => {
        jest.runOnlyPendingTimers()

        expect(Logger.default.log).toHaveBeenCalledWith('Request /global-request has been finished')
        expect(setTimeout).not.toHaveBeenCalled()
      })

  })

  it('does a successful request with manual retry in success callback with custom url and params and restores', () => {

    const newNow = Date.now()

    createdAtSpy.mockClear()

    createdAtSpy
      .mockReturnValueOnce(now)
      .mockReturnValueOnce(newNow)

    const continueCb = jest.fn((result) => {
      if (result.wait) {
        return someRequest.retry(result.wait)
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
    expect(request.default).toHaveBeenLastCalledWith({
      url: '/other-request',
      method: 'POST',
      params: {
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
        expect(request.default).toHaveBeenCalledTimes(2)
        expect(request.default).toHaveBeenLastCalledWith({
          url: '/other-request',
          method: 'POST',
          params: {
            createdAt: now,
            something: 'else'
          }
        })

        return Utils.flushPromises()
      }).then(() => {
        request.default.mockClear()
        request.default.mockResolvedValue({})

        expect(Logger.default.log).toHaveBeenLastCalledWith('Re-trying request /other-request in 1300ms')

        jest.runOnlyPendingTimers()

        expect(continueCb).toHaveBeenCalled()
        expect(setTimeout).toHaveBeenCalledTimes(3)
        expect(setTimeout).toHaveBeenLastCalledWith(expect.any(Function), 1300)
        expect(request.default).toHaveBeenCalledTimes(1)
        expect(request.default).toHaveBeenLastCalledWith({
          url: '/other-request',
          method: 'POST',
          params: {
            createdAt: now,
            something: 'else'
          }
        })

        setTimeout.mockClear()
        request.default.mockClear()

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

        expect(request.default).toHaveBeenCalledWith({
          url: '/global-request',
          method: 'GET',
          params: {
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

  it('retires unsuccessful request', () => {

    const newNow = Date.now()
    const matchOuterCreatedAt = {
      params: {
        createdAt: newNow
      }
    }

    request.default.mockRejectedValue(Utils.errorResponse())

    expect.assertions(32)

    someRequest.send({
      params: {
        createdAt: newNow
      }
    })

    expect(Logger.default.log).toHaveBeenLastCalledWith('Trying request /global-request in 150ms')
    expect(setTimeout).toHaveBeenCalledTimes(1)
    expect(setTimeout).toHaveBeenLastCalledWith(expect.any(Function), 150)

    jest.runOnlyPendingTimers()

    expect(request.default).toHaveBeenCalledTimes(1)
    expect(request.default.mock.calls[0][0]).toMatchObject(matchOuterCreatedAt)

    return Utils.flushPromises()
      .then(() => {
        expect(Logger.default.log).toHaveBeenLastCalledWith('Re-trying request /global-request in 100ms')

        jest.runOnlyPendingTimers()

        expect(request.default).toHaveBeenCalledTimes(2)
        expect(request.default.mock.calls[1][0]).toMatchObject(matchOuterCreatedAt)
        expect(setTimeout).toHaveBeenCalledTimes(2)
        expect(setTimeout).toHaveBeenLastCalledWith(expect.any(Function), 100)

        return Utils.flushPromises()
      }).then(() => {
        expect(Logger.default.log).toHaveBeenLastCalledWith('Re-trying request /global-request in 200ms')

        jest.runOnlyPendingTimers()

        expect(request.default).toHaveBeenCalledTimes(3)
        expect(request.default.mock.calls[2][0]).toMatchObject(matchOuterCreatedAt)
        expect(setTimeout).toHaveBeenCalledTimes(3)
        expect(setTimeout).toHaveBeenLastCalledWith(expect.any(Function), 200)

        return Utils.flushPromises()
      }).then(() => {
        expect(Logger.default.log).toHaveBeenLastCalledWith('Re-trying request /global-request in 300ms')

        jest.runOnlyPendingTimers()

        expect(request.default).toHaveBeenCalledTimes(4)
        expect(request.default.mock.calls[3][0]).toMatchObject(matchOuterCreatedAt)
        expect(setTimeout).toHaveBeenCalledTimes(4)
        expect(setTimeout).toHaveBeenLastCalledWith(expect.any(Function), 300)

        return Utils.flushPromises()
      }).then(() => {
        expect(Logger.default.log).toHaveBeenLastCalledWith('Re-trying request /global-request in 300ms')

        jest.runOnlyPendingTimers()

        expect(request.default).toHaveBeenCalledTimes(5)
        expect(request.default.mock.calls[4][0]).toMatchObject(matchOuterCreatedAt)
        expect(setTimeout).toHaveBeenCalledTimes(5)
        expect(setTimeout).toHaveBeenLastCalledWith(expect.any(Function), 300)

        return Utils.flushPromises()
      }).then(() => {

        request.default.mockClear()
        request.default.mockResolvedValue({})
        expect(Logger.default.log).toHaveBeenLastCalledWith('Re-trying request /global-request in 300ms')

        jest.runOnlyPendingTimers()

        expect(request.default).toHaveBeenCalledTimes(1)
        expect(request.default.mock.calls[0][0]).toMatchObject(matchOuterCreatedAt)
        expect(setTimeout).toHaveBeenCalledTimes(6)
        expect(setTimeout).toHaveBeenLastCalledWith(expect.any(Function), 300)

        setTimeout.mockClear()

        return Utils.flushPromises()
      }).then(() => {

        jest.runOnlyPendingTimers()

        expect(Logger.default.log).toHaveBeenCalledWith('Request /global-request has been finished')
        expect(setTimeout).not.toHaveBeenCalled()
      })
  })

  it('retires unsuccessful request with custom url and restores', () => {

    const newNow = Date.now()

    createdAtSpy
      .mockReturnValueOnce(now)
      .mockReturnValueOnce(newNow)

    request.default.mockRejectedValue(Utils.errorResponse())

    expect.assertions(27)

    someRequest.send({url: '/new-request'})

    expect(Logger.default.log).toHaveBeenLastCalledWith('Trying request /new-request in 150ms')
    expect(setTimeout).toHaveBeenCalledTimes(1)
    expect(setTimeout).toHaveBeenLastCalledWith(expect.any(Function), 150)

    jest.runOnlyPendingTimers()

    expect(request.default).toHaveBeenCalledTimes(1)
    expect(request.default.mock.calls[0][0]).toMatchObject(Object.assign({
      url: '/new-request'
    }, matchCreatedAt))

    return Utils.flushPromises()
      .then(() => {
        expect(Logger.default.log).toHaveBeenLastCalledWith('Re-trying request /new-request in 100ms')

        jest.runOnlyPendingTimers()

        expect(setTimeout).toHaveBeenCalledTimes(2)
        expect(setTimeout).toHaveBeenLastCalledWith(expect.any(Function), 100)
        expect(request.default).toHaveBeenCalledTimes(2)
        expect(request.default.mock.calls[1][0]).toMatchObject(Object.assign({
          url: '/new-request'
        }, matchCreatedAt))

        return Utils.flushPromises()
      }).then(() => {
        expect(Logger.default.log).toHaveBeenLastCalledWith('Re-trying request /new-request in 200ms')

        jest.runOnlyPendingTimers()

        expect(setTimeout).toHaveBeenCalledTimes(3)
        expect(setTimeout).toHaveBeenLastCalledWith(expect.any(Function), 200)
        expect(request.default).toHaveBeenCalledTimes(3)
        expect(request.default.mock.calls[2][0]).toMatchObject(Object.assign({
          url: '/new-request'
        }, matchCreatedAt))

        return Utils.flushPromises()
      }).then(() => {

        request.default.mockClear()
        request.default.mockResolvedValue({})
        expect(Logger.default.log).toHaveBeenLastCalledWith('Re-trying request /new-request in 300ms')

        jest.runOnlyPendingTimers()

        expect(setTimeout).toHaveBeenCalledTimes(4)
        expect(setTimeout).toHaveBeenLastCalledWith(expect.any(Function), 300)
        expect(request.default).toHaveBeenCalledTimes(1)
        expect(request.default.mock.calls[0][0]).toMatchObject(Object.assign({
          url: '/new-request'
        }, matchCreatedAt))

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

        expect(request.default).toHaveBeenCalledWith({
          url: '/global-request',
          method: 'GET',
          params: {
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

    expect.assertions(4)

    someRequest.send({wait: 2000})

    expect(Logger.default.log).toHaveBeenLastCalledWith('Trying request /global-request in 2000ms')
    expect(setTimeout).toHaveBeenLastCalledWith(expect.any(Function), 2000)

    someRequest.clear()

    jest.runOnlyPendingTimers()

    expect(request.default).not.toHaveBeenCalled()

    return Utils.flushPromises()
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

    return Utils.flushPromises()
      .then(() => {
        expect(Logger.default.log).toHaveBeenLastCalledWith('Previous /other request attempt canceled')

        someRequest.send({wait: 500})

        expect(Logger.default.log).toHaveBeenLastCalledWith('Trying request /global-request in 500ms')
        expect(setTimeout).toHaveBeenLastCalledWith(expect.any(Function), 500)

        jest.runOnlyPendingTimers()

        expect(request.default).toHaveBeenCalled()

        return Utils.flushPromises()
      })
      .then(() => {
        expect(Logger.default.log).toHaveBeenCalledWith('Request /global-request has been finished')
      })

  })

  it('retires unsuccessful request and then cancels', () => {

    const newNow = Date.now()

    createdAtSpy
      .mockReturnValueOnce(now)
      .mockReturnValueOnce(newNow)

    request.default.mockRejectedValue(Utils.errorResponse())

    expect.assertions(18)

    someRequest.send({url: '/some-new-request'})

    expect(Logger.default.log).toHaveBeenLastCalledWith('Trying request /some-new-request in 150ms')
    expect(setTimeout).toHaveBeenCalledTimes(1)
    expect(setTimeout).toHaveBeenLastCalledWith(expect.any(Function), 150)

    jest.runOnlyPendingTimers()

    expect(request.default).toHaveBeenCalledTimes(1)
    expect(request.default.mock.calls[0][0]).toMatchObject(Object.assign({
      url: '/some-new-request'
    }, matchCreatedAt))

    return Utils.flushPromises()
      .then(() => {
        expect(Logger.default.log).toHaveBeenLastCalledWith('Re-trying request /some-new-request in 100ms')

        jest.runOnlyPendingTimers()

        expect(request.default).toHaveBeenCalledTimes(2)
        expect(request.default.mock.calls[1][0]).toMatchObject(Object.assign({
          url: '/some-new-request'
        }, matchCreatedAt))
        expect(setTimeout).toHaveBeenCalledTimes(2)
        expect(setTimeout).toHaveBeenLastCalledWith(expect.any(Function), 100)

        return Utils.flushPromises()
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
          params: {
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

    request.default.mockRejectedValue({error: 'Unknown error'})

    expect.assertions(13)

    someRequest.send({url: '/failed-request'})

    expect(Logger.default.log).toHaveBeenLastCalledWith('Trying request /failed-request in 150ms')
    expect(setTimeout).toHaveBeenCalledTimes(1)
    expect(setTimeout).toHaveBeenLastCalledWith(expect.any(Function), 150)

    jest.runOnlyPendingTimers()

    expect(request.default).toHaveBeenCalledTimes(1)
    expect(request.default.mock.calls[0][0]).toMatchObject(Object.assign({
      url: '/failed-request'
    }, matchCreatedAt))

    return Utils.flushPromises()
      .then(() => {
        expect(someRequest.isRunning()).toBeFalsy()
        expect(clearTimeout).toHaveBeenCalledTimes(1)
        expect(Logger.default.log).toHaveBeenLastCalledWith('Request /failed-request failed')

        request.default.mockRejectedValue(undefined)
        request.default.mockClear()
        clearTimeout.mockClear()

        someRequest.send({url: '/another-failed-request'})

        expect(Logger.default.log).toHaveBeenLastCalledWith('Trying request /another-failed-request in 150ms')

        jest.runOnlyPendingTimers()

        expect(request.default).toHaveBeenCalledWith({
          url: '/another-failed-request',
          method: 'GET',
          params: {
            createdAt: newNow,
            some: 'param'
          }
        })

        return Utils.flushPromises()
      })
      .then(() => {
        expect(someRequest.isRunning()).toBeFalsy()
        expect(clearTimeout).toHaveBeenCalledTimes(1)
        expect(Logger.default.log).toHaveBeenLastCalledWith('Request /another-failed-request failed')

        request.default.mockResolvedValue({})
      })
  })

  it('cancels previously initiated request with another one', () => {

    expect.assertions(7)

    someRequest.send({wait: 1000})

    expect(Logger.default.log).toHaveBeenLastCalledWith('Trying request /global-request in 1000ms')
    expect(setTimeout).toHaveBeenLastCalledWith(expect.any(Function), 1000)

    Logger.default.log.mockClear()

    // initiate immediately another request
    someRequest.send()

    expect(Logger.default.log.mock.calls[0][0]).toBe('Previous /global-request request attempt canceled')
    expect(Logger.default.log.mock.calls[1][0]).toBe('Trying request /global-request in 150ms')

    jest.runOnlyPendingTimers()

    expect(request.default).toHaveBeenCalledTimes(1)

    return Utils.flushPromises()
      .then(() => {
        expect(request.default).toHaveBeenCalledTimes(1)
        expect(Logger.default.log).toHaveBeenCalledWith('Request /global-request has been finished')
      })

  })

  it('skips canceling previously initiated request if less time left', () => {

    dateNowSpy.mockReturnValue(now)

    expect.assertions(7)

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

    jest.runOnlyPendingTimers()

    expect(request.default).toHaveBeenCalledTimes(1)

    return Utils.flushPromises()
      .then(() => {
        expect(request.default).toHaveBeenCalledTimes(1)
        expect(Logger.default.log).toHaveBeenCalledWith('Request /global-request has been finished')
      })

  })

  describe('test overriding on request level', () => {

    beforeAll(() => {
      createdAtSpy.mockReturnValue(now)
    })

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
          params: {
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

        expect(request.default).toHaveBeenCalledWith({
          url: '/new-url',
          method: 'POST',
          params: {
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
          params: {
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
          params: {
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

            expect(request.default).toHaveBeenCalledWith({
              url: '/another-global-request',
              method: 'GET',
              params: {
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
