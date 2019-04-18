/* eslint-disable */
import * as Queue from '../queue'
import * as request from '../request'
import * as StorageManager from '../storage-manager'
import {flushPromises} from './_helper'
import * as ActivityState from '../activity-state'

jest.mock('../request')
jest.useFakeTimers()

const now = 1552914489217
let dateNowSpy

function checkExecution ({config, times, success = true, wait = 150, flush = true}) {

  const requestAction = success ? 'resolves' : 'rejects'
  const requestActionResult = success ? {status: 'success'} : {error: 'An error'}

  jest.runOnlyPendingTimers()

  expect(setTimeout).toHaveBeenCalledTimes(times)
  expect(setTimeout.mock.calls[times - 1][1]).toBe(wait)
  expect(request.default).toHaveBeenLastCalledWith(config)
  expect(request.default.mock.results[0].value)[requestAction].toEqual(requestActionResult)

  if (flush) {
    return flushPromises()
  }
}

function push (configs) {

  let start = 1552914489217
  let promise = flushPromises()

  dateNowSpy.mockReturnValue(configs[0].timestamp || start++)
  Queue.default.push(configs[0])

  configs.shift()

  configs.forEach(config => {

    promise = promise.then(() => {
      dateNowSpy.mockReturnValue(config.timestamp || start++)
      return Queue.default.push(config)
    })

  })
  return promise
}

describe('test request queuing functionality', () => {

  beforeAll(() => {
    dateNowSpy = jest.spyOn(Date, 'now')

    jest.spyOn(Queue.default, 'push')
    jest.spyOn(Queue.default, 'run')
    jest.spyOn(request, 'default')
    jest.spyOn(StorageManager.default, 'addItem')
  })

  afterEach(() => {
    jest.clearAllMocks()

    StorageManager.default.clear('queue')
    StorageManager.default.clear('activityState')
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

        expect(StorageManager.default.addItem).toHaveBeenCalledWith('queue', Object.assign({timestamp: now}, config))

        jest.runOnlyPendingTimers()

        expect(setTimeout.mock.calls[0][1]).toBe(150)
        expect(request.default).toHaveBeenCalledWith(config)

        return flushPromises()
      })
      .then(() => StorageManager.default.getFirst('queue'))
      .then(pending => {
        expect(pending).toBeUndefined()
      })

  })

  it('pushes multiple requests to the queue and executes them if connected', () => {

    const config1 = {url: '/some-url-1'}
    const config2 = {url: '/some-url-2'}
    const config3 = {url: '/some-url-3'}

    expect.assertions(15)

    return push([config1, config2, config3])
      .then(() => {

        expect(StorageManager.default.addItem).toHaveBeenCalledTimes(3)

        return StorageManager.default.getAll('queue')
      })
      .then(result => {

        expect(result).toEqual([
          {timestamp: 1552914489217, url: '/some-url-1'},
          {timestamp: 1552914489218, url: '/some-url-2'},
          {timestamp: 1552914489219, url: '/some-url-3'}
        ])

        return checkExecution({config: config1, times: 1}) // + 4 assertions
      })
      .then(() => checkExecution({config: config2, times: 2})) // + 4 assertions
      .then(() => checkExecution({config: config3, times: 3})) // + 4 assertions
      .then(() => StorageManager.default.getFirst('queue'))
      .then(pending => {
        expect(pending).toBeUndefined()
      })
  })

  it('pushes requests to the queue and retries in fifo order if not connected', () => {

    request.default.mockRejectedValue({error: 'An error'})

    const config1 = {url: '/some-url-1'}
    const config2 = {url: '/some-url-2'}

    expect.assertions(32)

    return push([config1, config2])
      .then(() => {

        expect(StorageManager.default.addItem).toHaveBeenCalledTimes(2)

        return StorageManager.default.getAll('queue')
      })
      .then(result => {

        expect(result).toEqual([
          {timestamp: 1552914489217, url: '/some-url-1'},
          {timestamp: 1552914489218, url: '/some-url-2'}
        ])

        return checkExecution({config: config1, times: 1, success: false}) // + 4 assertions
      })
      .then(() => checkExecution({config: config1, times: 2, success: false, wait: 100})) // + 4 assertions
      .then(() => {

        checkExecution({config: config1, times: 3, success: false, wait: 200, flush: false}) // + 4 assertions

        request.default.mockClear()
        request.default.mockResolvedValue({status: 'success'})

        return flushPromises()
      })
      .then(() => {

        checkExecution({config: config1, times: 4, wait: 300, flush: false}) // + 4 assertions

        setTimeout.mockClear()
        request.default.mockClear()
        request.default.mockRejectedValue({error: 'An error'})

        return flushPromises()
      })
      .then(() => checkExecution({config: config2, times: 1, success: false})) // + 4 assertions
      .then(() => {

        checkExecution({config: config2, times: 2, success: false, wait: 100, flush: false}) // + 4 assertions

        request.default.mockClear()
        request.default.mockResolvedValue({status: 'success'})

        return flushPromises()
      })
      .then(() => {

        checkExecution({config: config2, times: 3, wait: 200, flush: false}) // + 4 assertions

        setTimeout.mockClear()

        return flushPromises()
      })
      .then(() => {
        expect(setTimeout).not.toHaveBeenCalled()
      })
      .then(() => StorageManager.default.getFirst('queue'))
      .then(pending => {
        expect(pending).toBeUndefined()
      })

  })

  it('pushes requests to the queue and retries in fifo order if not connected and executes the rest when connected', () => {

    request.default.mockRejectedValue({error: 'An error'})

    const config1 = {url: '/some-url-1'}
    const config2 = {url: '/some-url-2'}
    const config3 = {url: '/some-url-3'}

    expect.assertions(24)

    return push([config1, config2, config3])
      .then(() => {

        expect(StorageManager.default.addItem).toHaveBeenCalledTimes(3)

        return StorageManager.default.getAll('queue')
      })
      .then(result => {

        expect(result).toEqual([
          {timestamp: 1552914489217, url: '/some-url-1'},
          {timestamp: 1552914489218, url: '/some-url-2'},
          {timestamp: 1552914489219, url: '/some-url-3'}
        ])

        return checkExecution({config: config1, times: 1, success: false}) // + 4 assertions
      })
      .then(() => {

        checkExecution({config: config1, times: 2, success: false, wait: 100, flush: false}) // + 4 assertions

        request.default.mockClear()
        request.default.mockResolvedValue({status: 'success'})

        return flushPromises()
      })
      .then(() => {

        checkExecution({config: config1, times: 3, wait: 200, flush: false}) // + 4 assertions

        setTimeout.mockClear()

        return flushPromises()
      })
      .then(() => checkExecution({config: config2, times: 1})) // + 4 assertions
      .then(() => {

        checkExecution({config: config3, times: 2, wait: 150, flush: false}) // + 4 assertions

        setTimeout.mockClear()

        return flushPromises()
      })
      .then(() => {
        expect(setTimeout).not.toHaveBeenCalled()
      })
      .then(() => StorageManager.default.getFirst('queue'))
      .then(pending => {
        expect(pending).toBeUndefined()
      })

  })

  it('does not execute the queue in offline mode and then run the queue when set back to online mode', () => {

    Queue.default.setOfflineMode(true)

    const config1 = {url: '/some-url-1'}
    const config2 = {url: '/some-url-2'}

    expect.assertions(13)

    return push([config1, config2])
      .then(() => {

        jest.runOnlyPendingTimers()

        expect(StorageManager.default.addItem).toHaveBeenCalledTimes(2)
        expect(setTimeout).not.toHaveBeenCalled()
        expect(request.default).not.toHaveBeenCalled()

        return StorageManager.default.getAll('queue')
      })
      .then(result => {
        expect(result).toEqual([
          {timestamp: 1552914489217, url: '/some-url-1'},
          {timestamp: 1552914489218, url: '/some-url-2'}
        ])

        Queue.default.setOfflineMode(false)

        return flushPromises()
      })
      .then(() => checkExecution({config: config1, times: 1})) // + 4 assertions
      .then(() => checkExecution({config: config2, times: 2})) // + 4 assertions
      .then(() => StorageManager.default.getFirst('queue'))
      .then(pending => {
        expect(pending).toBeUndefined()
      })

  })

  it('does execute first session in offline mode and ignores everything else', () => {

    Queue.default.setOfflineMode(true)

    ActivityState.default.current = null

    const config1 = {url: '/session'}
    const config2 = {url: '/event'}

    expect.assertions(13)

    return push([config1, config2])
      .then(() => {

        expect(StorageManager.default.addItem).toHaveBeenCalledTimes(2)

        checkExecution({config: config1, times: 1, flush: false}) // + 4 assertions

        setTimeout.mockClear()
        request.default.mockClear()

        return flushPromises()
      })
      .then(() => {

        jest.runOnlyPendingTimers()

        expect(setTimeout).not.toHaveBeenCalled()
        expect(request.default).not.toHaveBeenCalled()

        return StorageManager.default.getAll('queue')
      })
      .then(result => {
        expect(result).toEqual([
          {timestamp: 1552914489218, url: '/event'}
        ])

        Queue.default.setOfflineMode(false)

        return flushPromises()
      })
      .then(() => checkExecution({config: config2, times: 1})) // + 4 assertions
      .then(() => StorageManager.default.getFirst('queue'))
      .then(pending => {
        expect(pending).toBeUndefined()
      })

  })

  it('does not execute session when not first one in offline mode and ignores everything else as well', () => {

    Queue.default.setOfflineMode(true)

    ActivityState.default.current = {attribution: {adid: '123', tracker_token: '123abc', tracker_name: 'tracker', network: 'bla'}}

    const config1 = {url: '/session'}
    const config2 = {url: '/event'}

    expect.assertions(13)

    return push([config1, config2])
      .then(() => {

        jest.runOnlyPendingTimers()

        expect(StorageManager.default.addItem).toHaveBeenCalledTimes(2)
        expect(setTimeout).not.toHaveBeenCalled()
        expect(request.default).not.toHaveBeenCalled()

        return StorageManager.default.getAll('queue')
      })
      .then(result => {
        expect(result).toEqual([
          {timestamp: 1552914489217, url: '/session'},
          {timestamp: 1552914489218, url: '/event'}
        ])

        Queue.default.setOfflineMode(false)

        return flushPromises()
      })
      .then(() => checkExecution({config: config1, times: 1})) // + 4 assertions
      .then(() => checkExecution({config: config2, times: 2})) // + 4 assertions
      .then(() => StorageManager.default.getFirst('queue'))
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

        Queue.default.run(true)

        return flushPromises()
      })
      .then(() => StorageManager.default.getAll('queue'))
      .then(remained => {
        expect(remained.map(params => params.url)).toEqual(['/url-1', '/url-4', '/url-6'])
      })

  })

})
