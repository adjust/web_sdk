/* eslint-disable */
import * as Queue from '../queue'
import * as request from '../request'
import * as Storage from '../storage'
import {flushPromises} from './_helper'

jest.mock('../request')
jest.useFakeTimers()

const now = 1552914489217
let dateNowSpy

describe('test request queuing functionality', () => {

  beforeAll(() => {
    dateNowSpy = jest.spyOn(Date, 'now')

    jest.spyOn(Queue.default, 'push')
    jest.spyOn(Queue.default, 'run')
    jest.spyOn(request, 'default')
    jest.spyOn(Storage.default, 'addItem')
  })

  afterEach(() => {
    jest.clearAllMocks()

    Storage.default.clear('queue')
    Storage.default.clear('activityState')
  })

  afterAll(() => {
    jest.clearAllTimers()
    jest.restoreAllMocks()
  })

  it('pushes request to the queue and executes it if connected', () => {

    dateNowSpy.mockReturnValue(now)

    const config = {url: '/some-url'}

    expect.assertions(4)

    Queue.default.push(config)

    return flushPromises()
      .then(() => {

        expect(Storage.default.addItem).toHaveBeenCalledWith('queue', Object.assign({timestamp: now}, config))

        jest.runAllTimers()

        expect(setTimeout.mock.calls[0][1]).toBe(150)
        expect(request.default).toHaveBeenCalledWith(config)

        return flushPromises()
      })
      .then(() => Storage.default.getFirst('queue'))
      .then(pending => {
        expect(pending).toBeUndefined()
      })

  })

  it('pushes multiple requests to the queue and executes them if connected', () => {

    const config1 = {url: '/some-url-1'}
    const config2 = {url: '/some-url-2'}
    const config3 = {url: '/some-url-3'}

    expect.assertions(12)

    dateNowSpy.mockReturnValue(1552914489217)

    Queue.default.push(config1, true)

    return flushPromises()
      .then(() => {
        dateNowSpy.mockReturnValue(1552914489218)
        return Queue.default.push(config2)
      })
      .then(() => {
        dateNowSpy.mockReturnValue(1552914489219)
        return Queue.default.push(config3)
      })
      .then(() => {

        expect(Storage.default.addItem).toHaveBeenCalledTimes(3)

        return Storage.default.getAll('queue')
      })
      .then(result => {

        expect(result).toEqual([
          Object.assign({timestamp: 1552914489217}, config1),
          Object.assign({timestamp: 1552914489218}, config2),
          Object.assign({timestamp: 1552914489219}, config3)
        ])

        jest.advanceTimersByTime(150)

        expect(setTimeout).toHaveBeenCalledTimes(1)
        expect(setTimeout.mock.calls[0][1]).toBe(150)
        expect(request.default).toHaveBeenLastCalledWith(config1)

        return flushPromises()
      })
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
      .then(() => Storage.default.getFirst('queue'))
      .then(pending => {
        expect(pending).toBeUndefined()
      })
  })

  it('pushes requests to the queue and retries in fifo order if not connected', () => {

    request.default.mockRejectedValue({error: 'An error'})

    const config1 = {url: '/some-url-1'}
    const config2 = {url: '/some-url-2'}

    expect.assertions(31)

    dateNowSpy.mockReturnValue(1552914489217)

    Queue.default.push(config1)

    return flushPromises()
      .then(() => {
        dateNowSpy.mockReturnValue(1552914489218)
        return Queue.default.push(config2)
      })
      .then(() => {

        expect(Storage.default.addItem).toHaveBeenCalledTimes(2)

        return Storage.default.getAll('queue')
      })
      .then(result => {

        expect(result).toEqual([
          Object.assign({timestamp: 1552914489217}, config1),
          Object.assign({timestamp: 1552914489218}, config2),
        ])

        jest.advanceTimersByTime(150)

        expect(setTimeout.mock.calls[0][1]).toBe(150)
        expect(request.default).toHaveBeenCalledWith(config1)
        expect(request.default.mock.results[0].value).rejects.toEqual({error: 'An error'})

        return flushPromises()
      })
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
      })
      .then(() => Storage.default.getFirst('queue'))
      .then(pending => {
        expect(pending).toBeUndefined()
      })

  })

  it('pushes requests to the queue and retries in fifo order if not connected and executes the rest when connected', () => {

    request.default.mockRejectedValue({error: 'An error'})

    const config1 = {url: '/some-url-1'}
    const config2 = {url: '/some-url-2'}
    const config3 = {url: '/some-url-3'}

    dateNowSpy.mockReturnValue(1552914489217)

    Queue.default.push(config1)

    return flushPromises()
      .then(() => {
        dateNowSpy.mockReturnValue(1552914489218)
        return Queue.default.push(config2)
      })
      .then(() => {
        dateNowSpy.mockReturnValue(1552914489219)
        return Queue.default.push(config3)
      })
      .then(() => {

        expect(Storage.default.addItem).toHaveBeenCalledTimes(3)

        return Storage.default.getAll('queue')
      })
      .then(result => {

        expect(result).toEqual([
          Object.assign({timestamp: 1552914489217}, config1),
          Object.assign({timestamp: 1552914489218}, config2),
          Object.assign({timestamp: 1552914489219}, config3)
        ])

        jest.advanceTimersByTime(150)

        expect(setTimeout.mock.calls[0][1]).toBe(150)
        expect(request.default).toHaveBeenCalledWith(config1)
        expect(request.default.mock.results[0].value).rejects.toEqual({error: 'An error'})

        return flushPromises()
      })
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
      })
      .then(() => Storage.default.getFirst('queue'))
      .then(pending => {
        expect(pending).toBeUndefined()
      })

  })

  it('cleans up pending requests that are older than 28 days', () => {

    const config1 = {timestamp: 1549181400100, url: '/url-1', params: {created_at: '2019-02-03T09:10:00.100Z+0100'}}
    const config2 = {timestamp: 1544548200020, url: '/url-2', params: {created_at: '2018-12-11T18:10:00.020Z+0100'}}
    const config3 = {timestamp: 1546351540330, url: '/url-3', params: {created_at: '2019-01-01T15:05:40.330Z+0100'}}
    const config4 = {timestamp: 1549768530000, url: '/url-4', params: {created_at: '2019-02-10T04:15:30.000Z+0100'}}
    const config5 = {timestamp: 1549016404100, url: '/url-5', params: {created_at: '2019-02-01T11:20:04.100Z+0100'}}
    const config6 = {timestamp: 1551438000440, url: '/url-6', params: {created_at: '2019-03-01T12:00:00.440Z+0100'}}

    dateNowSpy.mockReturnValue(config1.timestamp)

    Queue.default.push(config1)

    return flushPromises()
      .then(() => {
        dateNowSpy.mockReturnValue(config2.timestamp)
        return Queue.default.push(config2)
      })
      .then(() => {
        dateNowSpy.mockReturnValue(config3.timestamp)
        return Queue.default.push(config3)
      })
      .then(() => {
        dateNowSpy.mockReturnValue(config4.timestamp)
        return Queue.default.push(config4)
      })
      .then(() => {
        dateNowSpy.mockReturnValue(config5.timestamp)
        return Queue.default.push(config5)
      })
      .then(() => {
        dateNowSpy.mockReturnValue(config6.timestamp)
        return Queue.default.push(config6)
      })
      .then(() => {
        dateNowSpy.mockReturnValue(new Date('2019-03-03').getTime())

        Queue.default.run(true)

        return flushPromises()
      })
      .then(() => Storage.default.getAll('queue'))
      .then(cleaned => {
        expect(cleaned.map(params => params.url)).toEqual(['/url-1', '/url-4', '/url-6'])
      })

  })

})
