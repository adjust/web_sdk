/* eslint-disable */
import * as Queue from '../queue'
import * as request from '../request'
import * as Storage from '../storage'

jest.mock('../request')
jest.useFakeTimers()

function flushPromises() {
  return new Promise(resolve => setImmediate(resolve))
}

describe('test request queuing functionality', () => {

  beforeAll(() => {
    jest.spyOn(Queue.default, 'push')
    jest.spyOn(Queue.default, 'run')
    jest.spyOn(request, 'default')
    jest.spyOn(Storage, 'setItem')
    jest.spyOn(Storage, 'getItem')
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  afterAll(() => {
    jest.clearAllTimers()
    jest.restoreAllMocks()
    localStorage.clear()
  })

  it('pushes request to the queue and executes it when connected', () => {

    const config = {url: '/some-url'}

    Queue.default.push(config)

    expect.assertions(4)
    expect(Storage.setItem).toHaveBeenCalledWith('queue', [config])

    jest.runAllTimers()

    expect(setTimeout.mock.calls[0][1]).toBe(150)
    expect(request.default).toHaveBeenCalledWith(config)

    return flushPromises()
      .then(() => {
        expect(Storage.getItem('queue').length).toBe(0)
      })

  })

  it('pushes multiple requests to the queue and executes them when connected', () => {

    const config1 = {url: '/some-url-1'}
    const config2 = {url: '/some-url-2'}
    const config3 = {url: '/some-url-3'}

    Queue.default.push(config1)
    Queue.default.push(config2)
    Queue.default.push(config3)

    expect.assertions(11)

    expect(Storage.setItem).toHaveBeenLastCalledWith('queue', [config1, config2, config3])

    jest.advanceTimersByTime(150)

    expect(setTimeout).toHaveBeenCalledTimes(1)
    expect(setTimeout.mock.calls[0][1]).toBe(150)
    expect(request.default).toHaveBeenLastCalledWith(config1)

    return flushPromises()
      .then(() => {

        expect(setTimeout).toHaveBeenCalledTimes(2)
        expect(setTimeout.mock.calls[1][1]).toBe(150)

        jest.runOnlyPendingTimers()

        expect(request.default).toHaveBeenLastCalledWith(config2)

        return flushPromises()
      })
      .then(() => {

        expect(setTimeout).toHaveBeenCalledTimes(3)
        expect(setTimeout.mock.calls[2][1]).toBe(150)

        jest.runOnlyPendingTimers()

        expect(request.default).toHaveBeenLastCalledWith(config3)

        return flushPromises()
      })
      .then(() => {
        expect(Storage.getItem('queue').length).toBe(0)
      })
  })

  it('pushes requests to the queue and retries in fifo order when not connected', () => {

    request.default.mockRejectedValue({error: 'An error'})

    const config1 = {url: '/some-url-1'}
    const config2 = {url: '/some-url-2'}

    Queue.default.push(config1)
    Queue.default.push(config2)

    expect.assertions(30)

    expect(Storage.setItem).toHaveBeenCalledWith('queue', [config1, config2])

    jest.advanceTimersByTime(150)

    expect(setTimeout.mock.calls[0][1]).toBe(150)
    expect(request.default).toHaveBeenCalledWith(config1)
    expect(request.default.mock.results[0].value).rejects.toEqual({error: 'An error'})

    return flushPromises()
      .then(() => {

        expect(setTimeout).toHaveBeenCalledTimes(2)
        expect(setTimeout.mock.calls[1][1]).toBe(100)

        jest.runOnlyPendingTimers()

        expect(request.default).toHaveBeenLastCalledWith(config1)
        expect(request.default.mock.results[0].value).rejects.toEqual({error: 'An error'})

        return flushPromises()
      })
      .then(() => {

        expect(setTimeout).toHaveBeenCalledTimes(3)
        expect(setTimeout.mock.calls[2][1]).toBe(200)

        jest.runOnlyPendingTimers()

        expect(request.default).toHaveBeenLastCalledWith(config1)
        expect(request.default.mock.results[0].value).rejects.toEqual({error: 'An error'})

        request.default.mockClear()
        request.default.mockResolvedValue({status: 'success'})

        return flushPromises()
      })
      .then(() => {

        expect(setTimeout).toHaveBeenCalledTimes(4)
        expect(setTimeout.mock.calls[3][1]).toBe(300)

        jest.runOnlyPendingTimers()

        expect(request.default).toHaveBeenLastCalledWith(config1)
        expect(request.default.mock.results[0].value).resolves.toEqual({status: 'success'})

        setTimeout.mockClear()
        request.default.mockClear()
        request.default.mockRejectedValue({error: 'Another error'})

        return flushPromises()
      })
      .then(() => {

        expect(setTimeout).toHaveBeenCalledTimes(1)
        expect(setTimeout.mock.calls[0][1]).toBe(150)

        jest.runOnlyPendingTimers()

        expect(request.default).toHaveBeenCalledWith(config2)
        expect(request.default.mock.results[0].value).rejects.toEqual({error: 'Another error'})

        return flushPromises()
      })
      .then(() => {

        expect(setTimeout).toHaveBeenCalledTimes(2)
        expect(setTimeout.mock.calls[1][1]).toBe(100)

        jest.runOnlyPendingTimers()

        expect(request.default).toHaveBeenLastCalledWith(config2)
        expect(request.default.mock.results[0].value).rejects.toEqual({error: 'Another error'})

        request.default.mockClear()
        request.default.mockResolvedValue({status: 'success'})

        return flushPromises()
      })
      .then(() => {

        expect(setTimeout).toHaveBeenCalledTimes(3)
        expect(setTimeout.mock.calls[2][1]).toBe(200)

        jest.runOnlyPendingTimers()

        setTimeout.mockClear()
        expect(request.default).toHaveBeenLastCalledWith(config2)
        expect(request.default.mock.results[0].value).resolves.toEqual({status: 'success'})

        return flushPromises()
      })
      .then(() => {
        expect(setTimeout).not.toHaveBeenCalled()
        expect(Storage.getItem('queue').length).toBe(0)
      })

  })

  it('pushes requests to the queue and retries in fifo order when not connected and executes the rest when connected', () => {

    request.default.mockRejectedValue({error: 'An error'})

    const config1 = {url: '/some-url-1'}
    const config2 = {url: '/some-url-2'}
    const config3 = {url: '/some-url-3'}

    Queue.default.push(config1)
    Queue.default.push(config2)
    Queue.default.push(config3)

    expect.assertions(20)

    expect(Storage.setItem).toHaveBeenCalledWith('queue', [config1, config2, config3])

    jest.advanceTimersByTime(150)

    expect(setTimeout.mock.calls[0][1]).toBe(150)
    expect(request.default).toHaveBeenCalledWith(config1)
    expect(request.default.mock.results[0].value).rejects.toEqual({error: 'An error'})

    return flushPromises()
      .then(() => {

        expect(setTimeout).toHaveBeenCalledTimes(2)
        expect(setTimeout.mock.calls[1][1]).toBe(100)

        jest.runOnlyPendingTimers()

        expect(request.default).toHaveBeenLastCalledWith(config1)
        expect(request.default.mock.results[0].value).rejects.toEqual({error: 'An error'})

        request.default.mockClear()
        request.default.mockResolvedValue({status: 'success'})

        return flushPromises()
      })
      .then(() => {

        expect(setTimeout).toHaveBeenCalledTimes(3)
        expect(setTimeout.mock.calls[2][1]).toBe(200)

        jest.runOnlyPendingTimers()

        setTimeout.mockClear()
        expect(request.default).toHaveBeenLastCalledWith(config1)
        expect(request.default.mock.results[0].value).resolves.toEqual({status: 'success'})

        return flushPromises()
      })
      .then(() => {

        expect(setTimeout).toHaveBeenCalledTimes(1)
        expect(setTimeout.mock.calls[0][1]).toBe(150)

        jest.runOnlyPendingTimers()

        expect(request.default).toHaveBeenLastCalledWith(config2)

        return flushPromises()
      })
      .then(() => {

        expect(setTimeout).toHaveBeenCalledTimes(2)
        expect(setTimeout.mock.calls[1][1]).toBe(150)

        jest.runOnlyPendingTimers()

        setTimeout.mockClear()
        expect(request.default).toHaveBeenLastCalledWith(config3)

        return flushPromises()
      })
      .then(() => {
        expect(setTimeout).not.toHaveBeenCalled()
        expect(Storage.getItem('queue').length).toBe(0)
      })

  })

})
