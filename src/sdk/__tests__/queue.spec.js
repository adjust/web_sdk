/* eslint-disable */
import * as Queue from '../queue'
import * as request from '../request'
import * as StorageManager from '../storage-manager'
import * as ActivityState from '../activity-state'
import * as Logger from '../logger'
import * as Time from '../time'
import * as Scheme from '../scheme'
import {errorResponse, flushPromises} from './_helper'

jest.mock('../request')
jest.mock('../logger')
jest.useFakeTimers()

const now = 1552914489217
let dateNowSpy

function checkExecution ({config, times, success = true, wait = 150, flush = true, reset = false}) {

  const logMessage = (times === 1 ? 'Trying' : 'Re-trying') + ` request ${config.url} in ${wait}ms`
  const requestAction = success ? 'resolves' : 'rejects'
  const requestActionResult = success ? {status: 'success'} : errorResponse()

  jest.runOnlyPendingTimers()

  const lastRequest = request.default.mock.calls.length - 1

  expect(setTimeout).toHaveBeenCalledTimes(times)
  expect(setTimeout.mock.calls[times - 1][1]).toBe(wait)
  expect(request.default.mock.calls[lastRequest][0]).toMatchObject({
    url: config.url,
    method: 'GET',
    params: {createdAt: 'some-time'}
  })
  expect(request.default.mock.results[0].value)[requestAction].toEqual(requestActionResult)
  expect(Logger.default.log).toHaveBeenLastCalledWith(logMessage)

  if (reset) {
    setTimeout.mockClear()
  }

  if (flush) {
    return flushPromises()
  }
}

function push (configs) {

  let start = 1552914489217
  let promise = flushPromises()

  dateNowSpy.mockReturnValue(configs[0].timestamp || start++)
  Queue.push(configs[0])

  configs.shift()

  configs.forEach(config => {

    promise = promise.then(() => {
      dateNowSpy.mockReturnValue(config.timestamp || start++)
      return Queue.push(config)
    })

  })
  return promise
}

describe('test request queuing functionality', () => {

  const storeNames = Scheme.default.names
  const defaultParams = {
    createdAt: 'some-time',
    timeSpent: 0,
    sessionLength: 0,
    sessionCount: 1
  }

  beforeAll(() => {
    dateNowSpy = jest.spyOn(Date, 'now')

    jest.spyOn(Queue, 'push')
    jest.spyOn(Queue, 'run')
    jest.spyOn(request, 'default')
    jest.spyOn(StorageManager.default, 'addItem')
    jest.spyOn(Logger.default, 'info')
    jest.spyOn(Logger.default, 'log')
    jest.spyOn(Time, 'getTimestamp').mockReturnValue('some-time')

    ActivityState.default.current = {uuid: 'some-uuid'}
  })

  afterEach(() => {
    jest.clearAllMocks()

    StorageManager.default.clear(storeNames.queue)
    StorageManager.default.clear(storeNames.activityState)
  })

  afterAll(() => {
    jest.clearAllTimers()
    jest.restoreAllMocks()
    ActivityState.default.destroy()
  })

  it('pushes request to the queue and executes it if connected', () => {

    dateNowSpy.mockReturnValue(now)

    const config = {url: '/some-url'}

    expect.assertions(6)

    Queue.push(config)

    return flushPromises()
      .then(() => {

        expect(StorageManager.default.addItem).toHaveBeenCalledWith(storeNames.queue, Object.assign({timestamp: now}, Object.assign(config, {params: defaultParams})))

        jest.runOnlyPendingTimers()

        expect(setTimeout).toHaveBeenLastCalledWith(expect.any(Function), 150)
        expect(request.default.mock.calls[0][0]).toMatchObject({
          url: config.url,
          method: 'GET',
          params: {createdAt: 'some-time'}
        })
        expect(Logger.default.log).toHaveBeenLastCalledWith('Trying request /some-url in 150ms')

        return flushPromises()
      })
      .then(() => StorageManager.default.getFirst(storeNames.queue))
      .then(pending => {
        expect(Logger.default.log).toHaveBeenLastCalledWith('Request /some-url has been finished')
        expect(pending).toBeUndefined()
      })

  })

  it('pushes multiple requests to the queue and executes them if connected', () => {

    const config1 = {url: '/some-url-1'}
    const config2 = {url: '/some-url-2'}
    const config3 = {url: '/some-url-3'}

    expect.assertions(21)

    return push([config1, config2, config3])
      .then(() => {

        expect(StorageManager.default.addItem).toHaveBeenCalledTimes(3)

        return StorageManager.default.getAll(storeNames.queue)
      })
      .then(result => {

        expect(result).toEqual([
          {timestamp: 1552914489217, url: '/some-url-1', params: defaultParams},
          {timestamp: 1552914489218, url: '/some-url-2', params: defaultParams},
          {timestamp: 1552914489219, url: '/some-url-3', params: defaultParams}
        ])

        return checkExecution({config: config1, times: 1, reset: true}) // + 5 assertions
      })
      .then(() => {
        expect(Logger.default.log).toHaveBeenCalledWith('Request /some-url-1 has been finished')

        return checkExecution({config: config2, times: 1, reset: true}) // + 5 assertions
      })
      .then(() => {
        expect(Logger.default.log).toHaveBeenCalledWith('Request /some-url-2 has been finished')

        return checkExecution({config: config3, times: 1, reset: true}) // + 5 assertions
      })
      .then(() => {
        expect(Logger.default.log).toHaveBeenCalledWith('Request /some-url-3 has been finished')

        return StorageManager.default.getFirst(storeNames.queue)
      })
      .then(pending => {
        expect(pending).toBeUndefined()
      })
  })

  it('pushes requests to the queue and retries in fifo order if not connected', () => {

    request.default.mockRejectedValue(errorResponse())

    const config1 = {url: '/some-url-1'}
    const config2 = {url: '/some-url-2'}

    expect.assertions(41)

    return push([config1, config2])
      .then(() => {

        expect(StorageManager.default.addItem).toHaveBeenCalledTimes(2)

        return StorageManager.default.getAll(storeNames.queue)
      })
      .then(result => {

        expect(result).toEqual([
          {timestamp: 1552914489217, url: '/some-url-1', params: defaultParams},
          {timestamp: 1552914489218, url: '/some-url-2', params: defaultParams}
        ])

        return checkExecution({config: config1, times: 1, success: false}) // + 5 assertions
      })
      .then(() => checkExecution({config: config1, times: 2, success: false, wait: 100})) // + 5 assertions
      .then(() => {
        checkExecution({config: config1, times: 3, success: false, wait: 200, flush: false}) // + 5 assertions

        request.default.mockClear()
        request.default.mockResolvedValue({status: 'success'})

        return flushPromises()
      })
      .then(() => {
        checkExecution({config: config1, times: 4, wait: 300, flush: false, reset: true}) // + 5 assertions

        request.default.mockClear()
        request.default.mockRejectedValue(errorResponse())

        return flushPromises()
      })
      .then(() => {
        expect(Logger.default.log).toHaveBeenCalledWith('Request /some-url-1 has been finished')

        return checkExecution({config: config2, times: 1, success: false}) // + 5 assertions
      })
      .then(() => {
        checkExecution({config: config2, times: 2, success: false, wait: 100, flush: false}) // + 5 assertions

        request.default.mockClear()
        request.default.mockResolvedValue({status: 'success'})

        return flushPromises()
      })
      .then(() => checkExecution({config: config2, times: 3, wait: 200, reset: true})) // + 5 assertions
      .then(() => {
        expect(Logger.default.log).toHaveBeenCalledWith('Request /some-url-2 has been finished')
        expect(setTimeout).not.toHaveBeenCalled()
      })
      .then(() => StorageManager.default.getFirst(storeNames.queue))
      .then(pending => {
        expect(pending).toBeUndefined()
      })

  })


  it('pushes requests to the queue and retries in fifo order if not connected and executes the rest when connected', () => {

    request.default.mockRejectedValue(errorResponse())

    const config1 = {url: '/some-url-1'}
    const config2 = {url: '/some-url-2'}
    const config3 = {url: '/some-url-3'}

    expect.assertions(29)

    return push([config1, config2, config3])
      .then(() => {

        expect(StorageManager.default.addItem).toHaveBeenCalledTimes(3)

        return StorageManager.default.getAll(storeNames.queue)
      })
      .then(result => {

        expect(result).toEqual([
          {timestamp: 1552914489217, url: '/some-url-1', params: defaultParams},
          {timestamp: 1552914489218, url: '/some-url-2', params: defaultParams},
          {timestamp: 1552914489219, url: '/some-url-3', params: defaultParams}
        ])

        return checkExecution({config: config1, times: 1, success: false}) // + 5 assertions
      })
      .then(() => {
        checkExecution({config: config1, times: 2, success: false, wait: 100, flush: false}) // + 5 assertions

        request.default.mockClear()
        request.default.mockResolvedValue({status: 'success'})

        return flushPromises()
      })
      .then(() => checkExecution({config: config1, times: 3, wait: 200, reset: true})) // + 5 assertions
      .then(() => checkExecution({config: config2, times: 1, reset: true})) // + 5 assertions
      .then(() => checkExecution({config: config3, times: 1, wait: 150, reset: true})) // + 5 assertions
      .then(() => {
        expect(setTimeout).not.toHaveBeenCalled()
      })
      .then(() => StorageManager.default.getFirst(storeNames.queue))
      .then(pending => {
        expect(pending).toBeUndefined()
      })

  })


  it('does not execute the queue in offline mode and then run the queue when set back to online mode', () => {

    Queue.setOffline(true)

    const config1 = {url: '/some-url-1'}
    const config2 = {url: '/some-url-2'}

    expect.assertions(17)

    expect(Logger.default.info).toHaveBeenLastCalledWith('The app is now in offline mode')

    return push([config1, config2])
      .then(() => {

        jest.runOnlyPendingTimers()

        expect(StorageManager.default.addItem).toHaveBeenCalledTimes(2)
        expect(setTimeout).not.toHaveBeenCalled()
        expect(request.default).not.toHaveBeenCalled()

        return StorageManager.default.getAll(storeNames.queue)
      })
      .then(result => {
        expect(result).toEqual([
          {timestamp: 1552914489217, url: '/some-url-1', params: defaultParams},
          {timestamp: 1552914489218, url: '/some-url-2', params: defaultParams}
        ])

        Queue.setOffline(false)

        expect(Logger.default.info).toHaveBeenLastCalledWith('The app is now in online mode')

        return flushPromises()
      })
      .then(() => checkExecution({config: config1, times: 1, reset: true})) // + 5 assertions
      .then(() => checkExecution({config: config2, times: 1, reset: true})) // + 5 assertions
      .then(() => StorageManager.default.getFirst(storeNames.queue))
      .then(pending => {
        expect(pending).toBeUndefined()
      })

  })

  it('does execute first session in offline mode and ignores everything else', () => {

    Queue.setOffline(true)

    ActivityState.default.current = null

    const config1 = {url: '/session'}
    const config2 = {url: '/event'}

    expect.assertions(17)

    expect(Logger.default.info).toHaveBeenLastCalledWith('The app is now in offline mode')

    return push([config1, config2])
      .then(() => {

        expect(StorageManager.default.addItem).toHaveBeenCalledTimes(2)

        checkExecution({config: config1, times: 1, reset: true, flush: false}) // + 5 assertions

        request.default.mockClear()

        return flushPromises()
      })
      .then(() => {

        jest.runOnlyPendingTimers()

        expect(setTimeout).not.toHaveBeenCalled()
        expect(request.default).not.toHaveBeenCalled()

        return StorageManager.default.getAll(storeNames.queue)
      })
      .then(result => {
        expect(result).toEqual([
          {timestamp: 1552914489218, url: '/event', params: Object.assign({}, defaultParams, {sessionCount: 2, eventCount: 1})}
        ])

        Queue.setOffline(false)

        expect(Logger.default.info).toHaveBeenLastCalledWith('The app is now in online mode')

        return flushPromises()
      })
      .then(() => checkExecution({config: config2, times: 1, reset: true})) // + 5 assertions
      .then(() => StorageManager.default.getFirst(storeNames.queue))
      .then(pending => {
        expect(pending).toBeUndefined()
      })

  })


  it('does not execute session when not first one in offline mode and ignores everything else as well', () => {

    Queue.setOffline(true)

    ActivityState.default.current = {attribution: {adid: '123', tracker_token: '123abc', tracker_name: 'tracker', network: 'bla'}}

    const config1 = {url: '/session'}
    const config2 = {url: '/event'}

    expect.assertions(17)

    expect(Logger.default.info).toHaveBeenLastCalledWith('The app is now in offline mode')

    return push([config1, config2])
      .then(() => {

        jest.runOnlyPendingTimers()

        expect(StorageManager.default.addItem).toHaveBeenCalledTimes(2)
        expect(setTimeout).not.toHaveBeenCalled()
        expect(request.default).not.toHaveBeenCalled()

        return StorageManager.default.getAll(storeNames.queue)
      })
      .then(result => {
        expect(result).toEqual([
          {timestamp: 1552914489217, url: '/session', params: defaultParams},
          {timestamp: 1552914489218, url: '/event', params: Object.assign({}, defaultParams, {sessionCount: 2, eventCount: 1})}
        ])

        Queue.setOffline(false)

        expect(Logger.default.info).toHaveBeenLastCalledWith('The app is now in online mode')

        return flushPromises()
      })
      .then(() => checkExecution({config: config1, times: 1, reset: true})) // + 5 assertions
      .then(() => checkExecution({config: config2, times: 1, reset: true})) // + 5 assertions
      .then(() => StorageManager.default.getFirst(storeNames.queue))
      .then(pending => {
        expect(pending).toBeUndefined()
      })

  })


  it('cleans up pending requests that are older than 28 days', () => {

    const config1 = {timestamp: 1549181400100, url: '/url-1', params: {createdAt: '2019-02-03T09:10:00.100Z+0100'}}
    const config2 = {timestamp: 1544548200020, url: '/url-2', params: {createdAt: '2018-12-11T18:10:00.020Z+0100'}}
    const config3 = {timestamp: 1546351540330, url: '/url-3', params: {createdAt: '2019-01-01T15:05:40.330Z+0100'}}
    const config4 = {timestamp: 1549768530000, url: '/url-4', params: {createdAt: '2019-02-10T04:15:30.000Z+0100'}}
    const config5 = {timestamp: 1549016404100, url: '/url-5', params: {createdAt: '2019-02-01T11:20:04.100Z+0100'}}
    const config6 = {timestamp: 1551438000440, url: '/url-6', params: {createdAt: '2019-03-01T12:00:00.440Z+0100'}}

    return push([config1, config2, config3, config4, config5, config6])
      .then(() => {
        dateNowSpy.mockReturnValue(new Date('2019-03-03').getTime())

        Queue.run(true)

        return flushPromises()
      })
      .then(() => StorageManager.default.getAll(storeNames.queue))
      .then(remained => {
        expect(remained.map(params => params.url)).toEqual(['/url-1', '/url-4', '/url-6'])

        Queue.clear()
        Queue.destroy()
      })

  })

  it('clears entire queue store', () => {

    const config1 = {url: '/url-1'}
    const config2 = {url: '/url-2'}
    const config3 = {url: '/url-3'}

    expect.assertions(6)

    return push([config1, config2, config3])
      .then(() => StorageManager.default.getAll(storeNames.queue))
      .then(pending => {
        expect(pending.map(params => params.url)).toEqual(['/url-1', '/url-2', '/url-3'])

        expect(Logger.default.log).toHaveBeenLastCalledWith('Trying request /url-1 in 150ms')
        expect(setTimeout).toHaveBeenLastCalledWith(expect.any(Function), 150)

        Queue.destroy(true)

        jest.runOnlyPendingTimers()

        expect(Logger.default.log).toHaveBeenLastCalledWith('Previous /url-1 request attempt canceled')

        return Queue.clear()
      })
      .then(() => StorageManager.default.getAll(storeNames.queue))
      .then(pending => {
        expect(pending.length).toEqual(0)
        expect(setTimeout).toHaveBeenCalledTimes(1)
      })

  })

})
