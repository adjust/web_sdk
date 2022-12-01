import * as Queue from '../queue'
import * as http from '../http'
import * as Storage from '../storage/storage'
import * as ActivityState from '../activity-state'
import * as Logger from '../logger'
import * as Time from '../time'
import {MINUTE, SECOND} from '../constants'

jest.mock('../http')
jest.mock('../logger')
jest.useFakeTimers()

let currentTime = Date.now()
let dateNowSpy

function checkExecution ({config, times, success = true, successResult, wait = 150, flush = true, reset = false, timestamp}) {

  const logMessage = (times === 1 ? 'Trying' : 'Re-trying') + ` request ${config.url} in ${wait}ms`
  const requestAction = success ? 'resolves' : 'rejects'
  const requestActionResult = success ? (successResult || {status: 'success'}) : Utils.errorResponse()

  jest.runOnlyPendingTimers()

  const lastRequest = http.default.mock.calls.length - 1

  expect(setTimeout).toHaveBeenCalledTimes(times)
  expect(setTimeout.mock.calls[times - 1][1]).toBe(wait)
  expect(http.default.mock.calls[lastRequest][0]).toMatchObject({
    url: config.url,
    method: 'GET',
    params: {createdAt: Time.getTimestamp(timestamp)}
  })
  expect(http.default.mock.results[lastRequest].value)[requestAction].toEqual(requestActionResult)
  expect(Logger.default.log).toHaveBeenLastCalledWith(logMessage)

  if (reset) {
    setTimeout.mockClear()
  }

  if (flush) {
    return Utils.flushPromises()
  }
}

describe('test request queuing functionality', () => {

  const defaultParams = {
    timeSpent: 0,
    sessionLength: 0,
    sessionCount: 1,
    lastInterval: 0
  }

  beforeAll(() => {
    dateNowSpy = jest.spyOn(Date, 'now')

    jest.spyOn(Queue, 'push')
    jest.spyOn(http, 'default')
    jest.spyOn(Storage.default, 'addItem')
    jest.spyOn(Storage.default, 'getFirst')
    jest.spyOn(Logger.default, 'info')
    jest.spyOn(Logger.default, 'log')
    jest.spyOn(Logger.default, 'error')
    jest.spyOn(global, 'setTimeout')
  })

  beforeEach(() => {
    dateNowSpy.mockReturnValue(currentTime)

    ActivityState.default.init({uuid: 'some-uuid'})
    ActivityState.default.initParams()
  })

  afterEach(() => {
    jest.clearAllMocks()
    ActivityState.default.destroy()
    localStorage.clear()
    Queue.destroy()
  })

  afterAll(() => {
    jest.clearAllTimers()
    jest.restoreAllMocks()
  })

  it('pushes request to the queue and executes it if connected', () => {

    const config = {url: '/some-url'}

    expect.assertions(6)

    Queue.push(config)

    return Utils.flushPromises()
      .then(() => {

        expect(Storage.default.addItem).toHaveBeenCalledWith('queue', {...config, timestamp: currentTime, params: defaultParams})

        jest.runOnlyPendingTimers()

        expect(setTimeout).toHaveBeenLastCalledWith(expect.any(Function), 150)
        expect(http.default.mock.calls[0][0]).toMatchObject({
          url: config.url,
          method: 'GET',
          params: {createdAt: Time.getTimestamp(currentTime)}
        })
        expect(Logger.default.log).toHaveBeenLastCalledWith('Trying request /some-url in 150ms')

        return Utils.flushPromises()
      })
      .then(() => Storage.default.getFirst('queue'))
      .then(pending => {
        expect(Logger.default.log).toHaveBeenLastCalledWith('Request /some-url has been finished')
        expect(pending).toBeUndefined()
      })

  })

  it('pushes multiple requests to the queue and executes them if connected', () => {

    let queue
    const config1 = {url: '/some-url-1'}
    const config2 = {url: '/some-url-2'}
    const config3 = {url: '/some-url-3'}

    expect.assertions(21)

    Queue.push(config1)
    Queue.push(config2)
    Queue.push(config3)

    return Utils.flushPromises()
      .then(() => {

        expect(Storage.default.addItem).toHaveBeenCalledTimes(3)

        return Storage.default.getAll('queue')
      })
      .then(result => {

        expect(result).toEqual([
          {timestamp: currentTime, url: '/some-url-1', params: defaultParams},
          {timestamp: currentTime+1, url: '/some-url-2', params: defaultParams},
          {timestamp: currentTime+2, url: '/some-url-3', params: defaultParams}
        ])

        queue = result.slice()

        return checkExecution({config: config1, times: 1, reset: true, timestamp: queue[0].timestamp}) // + 5 assertions
      })
      .then(() => {
        expect(Logger.default.log).toHaveBeenCalledWith('Request /some-url-1 has been finished')

        return checkExecution({config: config2, times: 1, reset: true, timestamp: queue[1].timestamp}) // + 5 assertions
      })
      .then(() => {
        expect(Logger.default.log).toHaveBeenCalledWith('Request /some-url-2 has been finished')

        return checkExecution({config: config3, times: 1, reset: true, timestamp: queue[2].timestamp}) // + 5 assertions
      })
      .then(() => {
        expect(Logger.default.log).toHaveBeenCalledWith('Request /some-url-3 has been finished')

        return Storage.default.getFirst('queue')
      })
      .then(pending => {
        expect(pending).toBeUndefined()
      })
  })

  it('pushes multiple requests to the queue and provide original timestamp to one of them', () => {

    const createdAt = currentTime - 5
    const config1 = {url: '/some-url-1'}
    const config2 = {url: '/some-url-2'}
    const timestamp1 = currentTime
    const timestamp2 = currentTime + 1

    expect.assertions(15)

    Queue.push(config1)
    Queue.push(config2, {timestamp: createdAt})

    return Utils.flushPromises()
      .then(() => {

        expect(Storage.default.addItem).toHaveBeenCalledTimes(2)

        return Storage.default.getAll('queue')
      })
      .then(result => {

        expect(result).toEqual([
          {timestamp: timestamp1, url: '/some-url-1', params: defaultParams},
          {timestamp: timestamp2, createdAt, url: '/some-url-2', params: defaultParams}
        ])

        return checkExecution({config: config1, times: 1, reset: true, timestamp: timestamp1}) // + 5 assertions
      })
      .then(() => {
        expect(Logger.default.log).toHaveBeenCalledWith('Request /some-url-1 has been finished')

        return checkExecution({config: config2, times: 1, reset: true, timestamp: createdAt}) // + 5 assertions
      })
      .then(() => {
        expect(Logger.default.log).toHaveBeenCalledWith('Request /some-url-2 has been finished')

        return Storage.default.getFirst('queue')
      })
      .then(pending => {
        expect(pending).toBeUndefined()
      })
  })

  it('pushes multiple requests to the queue and executes them with some delay requested from backend', () => {

    let queue
    const config1 = {url: '/some-url-1'}
    const config2 = {url: '/some-url-2'}
    const config3 = {url: '/some-url-3'}
    const config4 = {url: '/some-url-4'}

    expect.assertions(27)

    Queue.push(config1)
    Queue.push(config2)
    Queue.push(config3)
    Queue.push(config4)

    return Utils.flushPromises()
      .then(() => {

        expect(Storage.default.addItem).toHaveBeenCalledTimes(4)

        return Storage.default.getAll('queue')
      })
      .then(result => {
        expect(result).toEqual([
          {timestamp: currentTime, url: '/some-url-1', params: defaultParams},
          {timestamp: currentTime+1, url: '/some-url-2', params: defaultParams},
          {timestamp: currentTime+2, url: '/some-url-3', params: defaultParams},
          {timestamp: currentTime+3, url: '/some-url-4', params: defaultParams}
        ])

        queue = result.slice()

        http.default.mockResolvedValue({continue_in: 2000})

        return checkExecution({config: config1, times: 1, reset: true, successResult: {continue_in: 2000}, timestamp: queue[0].timestamp}) // + 5 assertions
      })
      .then(() => {
        expect(Logger.default.log).toHaveBeenCalledWith('Request /some-url-1 has been finished')

        http.default.mockResolvedValue({continue_in: 3000})

        return checkExecution({config: config2, times: 1, reset: true, wait: 2000, successResult: {continue_in: 3000}, timestamp: queue[1].timestamp}) // + 5 assertions
      })
      .then(() => {
        expect(Logger.default.log).toHaveBeenCalledWith('Request /some-url-2 has been finished')

        http.default.mockResolvedValue({status: 'success'})

        return checkExecution({config: config3, times: 1, reset: true, wait: 3000, timestamp: queue[2].timestamp}) // + 5 assertions
      })
      .then(() => {
        expect(Logger.default.log).toHaveBeenCalledWith('Request /some-url-3 has been finished')

        return checkExecution({config: config4, times: 1, reset: true, timestamp: queue[3].timestamp}) // + 5 assertions
      })
      .then(() => {
        expect(Logger.default.log).toHaveBeenCalledWith('Request /some-url-4 has been finished')

        return Storage.default.getFirst('queue')
      })
      .then(pending => {
        expect(pending).toBeUndefined()
      })
  })

  it('pushes one request and then several subsequent ones and still obeys continue_in from first response of the first request', () => {

    let queue
    const config1 = {url: '/some-url-1'}
    const config2 = {url: '/some-url-2'}
    const config3 = {url: '/some-url-3'}

    expect.assertions(22)

    http.default.mockResolvedValue({continue_in: 3000})

    Queue.push(config1)

    return Utils.flushPromises()
      .then(() => {

        expect(Storage.default.addItem).toHaveBeenCalledTimes(1)

        return Storage.default.getAll('queue')
      })
      .then(result => {
        expect(result).toEqual([
          {timestamp: currentTime, url: '/some-url-1', params: defaultParams}
        ])

        return checkExecution({config: config1, times: 1, reset: true, successResult: {continue_in: 3000}, flush: true, timestamp: currentTime}) // + 5 assertions
      })
      .then(() => {
        dateNowSpy.mockReturnValue(currentTime += 400)
        jest.advanceTimersByTime(400)

        Queue.push(config2)
        Queue.push(config3)

        return Utils.flushPromises()
      })
      .then(() => Storage.default.getAll('queue'))
      .then(result => {
        expect(result).toEqual([
          {timestamp: currentTime, url: '/some-url-2', params: defaultParams},
          {timestamp: currentTime+1, url: '/some-url-3', params: defaultParams}
        ])
        expect(Logger.default.log).toHaveBeenCalledWith('Request /some-url-1 has been finished')

        queue = result.slice()

        http.default.mockResolvedValue({status: 'success'})

        return checkExecution({config: config2, times: 1, reset: true, wait: 2600, timestamp: queue[0].timestamp}) // + 5 assertions
      })
      .then(() => {
        expect(Logger.default.log).toHaveBeenCalledWith('Request /some-url-2 has been finished')

        return checkExecution({config: config3, times: 1, reset: true, timestamp: queue[1].timestamp}) // + 5 assertions
      })
      .then(() => {
        expect(Logger.default.log).toHaveBeenCalledWith('Request /some-url-3 has been finished')

        return Storage.default.getFirst('queue')
      })
      .then(pending => {
        expect(pending).toBeUndefined()
      })
  })

  it('pushes one request which returns continue_in and then several subsequent ones which will continue executing normally when time passed is bigger then previously returned continue_in', () => {

    let queue
    const config1 = {url: '/some-url-1'}
    const config2 = {url: '/some-url-2'}
    const config3 = {url: '/some-url-3'}

    expect.assertions(22)

    http.default.mockResolvedValue({continue_in: 500})

    Queue.push(config1)

    return Utils.flushPromises()
      .then(() => {

        expect(Storage.default.addItem).toHaveBeenCalledTimes(1)

        return Storage.default.getAll('queue')
      })
      .then(result => {
        expect(result).toEqual([
          {timestamp: currentTime, url: '/some-url-1', params: defaultParams}
        ])

        return checkExecution({config: config1, times: 1, reset: true, successResult: {continue_in: 500}, flush: true, timestamp: currentTime}) // + 5 assertions
      })
      .then(() => {
        dateNowSpy.mockReturnValue(currentTime += 600)
        jest.advanceTimersByTime(600)

        Queue.push(config2)
        Queue.push(config3)

        return Utils.flushPromises()
      })
      .then(() => Storage.default.getAll('queue'))
      .then(result => {
        const defaultParamsUpdated = {
          ...defaultParams,
          timeSpent: 1,
          sessionLength: 1
        }

        expect(result).toEqual([
          {timestamp: currentTime, url: '/some-url-2', params: {...defaultParamsUpdated, lastInterval: 1}},
          {timestamp: currentTime+1, url: '/some-url-3', params: defaultParamsUpdated}
        ])
        expect(Logger.default.log).toHaveBeenCalledWith('Request /some-url-1 has been finished')

        queue = result.slice()

        http.default.mockResolvedValue({status: 'success'})

        return checkExecution({config: config2, times: 1, reset: true, timestamp: queue[0].timestamp}) // + 5 assertions
      })
      .then(() => {
        expect(Logger.default.log).toHaveBeenCalledWith('Request /some-url-2 has been finished')

        return checkExecution({config: config3, times: 1, reset: true, timestamp: queue[1].timestamp}) // + 5 assertions
      })
      .then(() => {
        expect(Logger.default.log).toHaveBeenCalledWith('Request /some-url-3 has been finished')

        return Storage.default.getFirst('queue')
      })
      .then(pending => {
        expect(pending).toBeUndefined()
      })
  })

  it('pushes requests to the queue and retries in fifo order if not connected', () => {

    http.default.mockRejectedValue(Utils.errorResponse())

    let queue
    const config1 = {url: '/some-url-1'}
    const config2 = {url: '/some-url-2'}

    expect.assertions(41)

    Queue.push(config1)
    Queue.push(config2)

    return Utils.flushPromises()
      .then(() => {
        expect(Storage.default.addItem).toHaveBeenCalledTimes(2)

        return Storage.default.getAll('queue')
      })
      .then(result => {

        expect(result).toEqual([
          {timestamp: currentTime, url: '/some-url-1', params: defaultParams},
          {timestamp: currentTime+1, url: '/some-url-2', params: defaultParams}
        ])

        queue = result.slice()

        return checkExecution({config: config1, times: 1, success: false, timestamp: queue[0].timestamp}) // + 5 assertions
      })
      .then(() => checkExecution({config: config1, times: 2, success: false, wait: 100, timestamp: queue[0].timestamp})) // + 5 assertions
      .then(() => {
        checkExecution({config: config1, times: 3, success: false, wait: 200, flush: false, timestamp: queue[0].timestamp}) // + 5 assertions

        http.default.mockClear()
        http.default.mockResolvedValue({status: 'success'})

        return Utils.flushPromises()
      })
      .then(() => {
        checkExecution({config: config1, times: 4, wait: 300, flush: false, reset: true, timestamp: queue[0].timestamp}) // + 5 assertions

        http.default.mockClear()
        http.default.mockRejectedValue(Utils.errorResponse())

        return Utils.flushPromises()
      })
      .then(() => {
        expect(Logger.default.log).toHaveBeenCalledWith('Request /some-url-1 has been finished')

        return checkExecution({config: config2, times: 1, success: false, timestamp: queue[1].timestamp}) // + 5 assertions
      })
      .then(() => {
        checkExecution({config: config2, times: 2, success: false, wait: 100, flush: false, timestamp: queue[1].timestamp}) // + 5 assertions

        http.default.mockClear()
        http.default.mockResolvedValue({status: 'success'})

        return Utils.flushPromises()
      })
      .then(() => checkExecution({config: config2, times: 3, wait: 200, reset: true, timestamp: queue[1].timestamp})) // + 5 assertions
      .then(() => {
        expect(Logger.default.log).toHaveBeenCalledWith('Request /some-url-2 has been finished')
        expect(setTimeout).not.toHaveBeenCalled()
      })
      .then(() => Storage.default.getFirst('queue'))
      .then(pending => {
        expect(pending).toBeUndefined()
      })

  })


  it('pushes requests to the queue and retries in fifo order if not connected and executes the rest when connected', () => {

    http.default.mockRejectedValue(Utils.errorResponse())

    let queue
    const config1 = {url: '/some-url-1'}
    const config2 = {url: '/some-url-2'}
    const config3 = {url: '/some-url-3'}

    expect.assertions(29)

    Queue.push(config1)
    Queue.push(config2)
    Queue.push(config3)

    return Utils.flushPromises()
      .then(() => {

        expect(Storage.default.addItem).toHaveBeenCalledTimes(3)

        return Storage.default.getAll('queue')
      })
      .then(result => {

        expect(result).toEqual([
          {timestamp: currentTime, url: '/some-url-1', params: defaultParams},
          {timestamp: currentTime+1, url: '/some-url-2', params: defaultParams},
          {timestamp: currentTime+2, url: '/some-url-3', params: defaultParams}
        ])

        queue = result.slice()

        return checkExecution({config: config1, times: 1, success: false, timestamp: queue[0].timestamp}) // + 5 assertions
      })
      .then(() => {
        checkExecution({config: config1, times: 2, success: false, wait: 100, flush: false, timestamp: queue[0].timestamp}) // + 5 assertions

        http.default.mockClear()
        http.default.mockResolvedValue({status: 'success'})

        return Utils.flushPromises()
      })
      .then(() => checkExecution({config: config1, times: 3, wait: 200, reset: true, timestamp: queue[0].timestamp})) // + 5 assertions
      .then(() => checkExecution({config: config2, times: 1, reset: true, timestamp: queue[1].timestamp})) // + 5 assertions
      .then(() => checkExecution({config: config3, times: 1, wait: 150, reset: true, timestamp: queue[2].timestamp})) // + 5 assertions
      .then(() => {
        expect(setTimeout).not.toHaveBeenCalled()
      })
      .then(() => Storage.default.getFirst('queue'))
      .then(pending => {
        expect(pending).toBeUndefined()
      })

  })

  it('ignores set offline when explicit state not provided', () => {
    expect.assertions(2)

    Queue.setOffline()

    return Utils.flushPromises()
      .then(() => {
        expect(Logger.default.error).toHaveBeenLastCalledWith('State not provided, true or false has to be defined')
        expect(Storage.default.getFirst).not.toHaveBeenCalled()
      })
  })

  it('does not execute the queue in offline mode and then run the queue when set back to online mode', () => {

    Queue.setOffline(true)

    let queue
    const config1 = {url: '/some-url-1'}
    const config2 = {url: '/some-url-2'}

    expect.assertions(17)

    expect(Logger.default.info).toHaveBeenLastCalledWith('The app is now in offline mode')

    Queue.push(config1)
    Queue.push(config2)

    return Utils.flushPromises()
      .then(() => {

        jest.runOnlyPendingTimers()

        expect(Storage.default.addItem).toHaveBeenCalledTimes(2)
        expect(setTimeout).not.toHaveBeenCalled()
        expect(http.default).not.toHaveBeenCalled()

        return Storage.default.getAll('queue')
      })
      .then(result => {
        expect(result).toEqual([
          {timestamp: currentTime, url: '/some-url-1', params: defaultParams},
          {timestamp: currentTime+1, url: '/some-url-2', params: defaultParams}
        ])

        queue = result.slice()

        Queue.setOffline(false)

        expect(Logger.default.info).toHaveBeenLastCalledWith('The app is now in online mode')

        return Utils.flushPromises()
      })
      .then(() => checkExecution({config: config1, times: 1, reset: true, timestamp: queue[0].timestamp})) // + 5 assertions
      .then(() => checkExecution({config: config2, times: 1, reset: true, timestamp: queue[1].timestamp})) // + 5 assertions
      .then(() => Storage.default.getFirst('queue'))
      .then(pending => {
        expect(pending).toBeUndefined()
      })

  })

  it('does execute first session in offline mode and ignores everything else', () => {

    Queue.setOffline(true)

    const config1 = {url: '/session'}
    const config2 = {url: '/event'}

    expect.assertions(17)

    expect(Logger.default.info).toHaveBeenLastCalledWith('The app is now in offline mode')

    Queue.push(config1)
    Queue.push(config2)

    return Utils.flushPromises()
      .then(() => {

        expect(Storage.default.addItem).toHaveBeenCalledTimes(2)

        checkExecution({config: config1, times: 1, reset: true, flush: false, timestamp: currentTime}) // + 5 assertions

        http.default.mockClear()

        return Utils.flushPromises()
      })
      .then(() => {

        jest.runOnlyPendingTimers()

        expect(setTimeout).not.toHaveBeenCalled()
        expect(http.default).not.toHaveBeenCalled()

        return Storage.default.getAll('queue')
      })
      .then(result => {
        expect(result).toEqual([
          {timestamp: currentTime+1, url: '/event', params: {...defaultParams, eventCount: 1}}
        ])

        Queue.setOffline(false)

        expect(Logger.default.info).toHaveBeenLastCalledWith('The app is now in online mode')

        return Utils.flushPromises()
      })
      .then(() => checkExecution({config: config2, times: 1, reset: true, timestamp: currentTime+1})) // + 5 assertions
      .then(() => Storage.default.getFirst('queue'))
      .then(pending => {
        expect(pending).toBeUndefined()
      })

  })


  it('does not execute session when not first one in offline mode and ignores everything else as well', () => {

    Queue.setOffline(true)

    ActivityState.default.current = {...ActivityState.default.current, installed: true}

    let queue
    const config1 = {url: '/session'}
    const config2 = {url: '/event'}

    expect.assertions(17)

    expect(Logger.default.info).toHaveBeenLastCalledWith('The app is now in offline mode')

    Queue.push(config1)
    Queue.push(config2)

    return Utils.flushPromises()
      .then(() => {

        jest.runOnlyPendingTimers()

        expect(Storage.default.addItem).toHaveBeenCalledTimes(2)
        expect(setTimeout).not.toHaveBeenCalled()
        expect(http.default).not.toHaveBeenCalled()

        return Storage.default.getAll('queue')
      })
      .then(result => {
        expect(result).toEqual([
          {timestamp: currentTime, url: '/session', params: defaultParams},
          {timestamp: currentTime+1, url: '/event', params: {...defaultParams, eventCount: 1}}
        ])

        queue = result.slice()

        Queue.setOffline(false)

        expect(Logger.default.info).toHaveBeenLastCalledWith('The app is now in online mode')

        return Utils.flushPromises()
      })
      .then(() => checkExecution({config: config1, times: 1, reset: true, timestamp: queue[0].timestamp})) // + 5 assertions
      .then(() => checkExecution({config: config2, times: 1, reset: true, timestamp: queue[1].timestamp})) // + 5 assertions
      .then(() => Storage.default.getFirst('queue'))
      .then(pending => {
        expect(pending).toBeUndefined()
      })

  })

  it('prevents re-setting offline/online mode if already online/offline', () => {

    expect.assertions(10)

    Queue.setOffline(false)

    return Utils.flushPromises()
      .then(() => {
        expect(Logger.default.error).toHaveBeenCalledWith('The app is already in online mode')
        expect(Storage.default.getFirst).not.toHaveBeenCalled()
        Logger.default.error.mockClear()

        Queue.setOffline(true)

        return Utils.flushPromises()
      })
      .then(() => {
        expect(Logger.default.error).not.toHaveBeenCalled()
        expect(Storage.default.getFirst).not.toHaveBeenCalled()

        Queue.setOffline(true)

        return Utils.flushPromises()
      })
      .then(() => {
        expect(Logger.default.error).toHaveBeenCalledWith('The app is already in offline mode')
        expect(Storage.default.getFirst).not.toHaveBeenCalled()
        Logger.default.error.mockClear()

        Queue.setOffline(false)

        return Utils.flushPromises()
      })
      .then(() => {
        expect(Logger.default.error).not.toHaveBeenCalled()
        expect(Storage.default.getFirst).toHaveBeenCalledWith('queue')
        Storage.default.getFirst.mockClear()

        Queue.setOffline(false)

        return Utils.flushPromises()
      })
      .then(() => {
        expect(Logger.default.error).toHaveBeenCalledWith('The app is already in online mode')
        expect(Storage.default.getFirst).not.toHaveBeenCalled()
        Logger.default.error.mockClear()
      })

  })

  it('runs session and event requests with some delay in between', () => {

    let queue = []
    const timestamp1 = Date.now()
    const config1 = {url: '/session'}
    const timestamp2 = timestamp1 + 3 * MINUTE
    const config2 = {url: '/event', params: {eventToken: 'token1'}}
    const timestamp3 = timestamp2 + MINUTE
    const config3 = {url: '/event', params: {eventToken: 'token2'}}
    const timestamp4 = timestamp3 + 5 * MINUTE
    const config4 = {url: '/session'}
    const timestamp5 = timestamp4 + 23 * SECOND
    const config5 = {url: '/event', params: {eventToken: 'token3'}}

    expect.assertions(36)

    dateNowSpy.mockReturnValue(timestamp1)

    Queue.push(config1)

    return Utils.flushPromises()
      .then(() => Storage.default.getAll('queue'))
      .then(result => {
        expect(result).toEqual(queue = [
          {timestamp: timestamp1, url: '/session', params: defaultParams}
        ])

        dateNowSpy.mockReturnValue(timestamp2)

        Queue.push(config2)

        return Utils.flushPromises()
      })
      .then(() => Storage.default.getAll('queue'))
      .then(result => {
        expect(result).toEqual(queue = [
          ...queue,
          {
            timestamp: timestamp2,
            url: '/event',
            params: {
              ...defaultParams,
              eventToken: 'token1',
              timeSpent: 180,
              sessionLength: 180,
              eventCount: 1,
              lastInterval: 180
            }
          }
        ])

        dateNowSpy.mockReturnValue(timestamp3)

        Queue.push(config3)

        return Utils.flushPromises()
      })
      .then(() => Storage.default.getAll('queue'))
      .then(result => {
        expect(result).toEqual(queue = [
          ...queue,
          {
            timestamp: timestamp3,
            url: '/event',
            params: {
              ...defaultParams,
              eventToken: 'token2',
              timeSpent: 240,
              sessionLength: 240,
              eventCount: 2,
              lastInterval: 60
            }
          }
        ])

        dateNowSpy.mockReturnValue(timestamp4)

        Queue.push(config4)

        return Utils.flushPromises()
      })
      .then(() => Storage.default.getAll('queue'))
      .then(result => {
        expect(result).toEqual(queue = [
          ...queue,
          {
            timestamp: timestamp4,
            url: '/session',
            params: {
              ...defaultParams,
              timeSpent: 540,
              sessionLength: 540,
              sessionCount: 2,
              lastInterval: 300
            }
          }
        ])

        dateNowSpy.mockReturnValue(timestamp5)

        Queue.push(config5)

        return Utils.flushPromises()
      })
      .then(() => Storage.default.getAll('queue'))
      .then(result => {
        expect(result).toEqual(queue = [
          ...queue,
          {
            timestamp: timestamp5,
            url: '/event',
            params: {
              ...defaultParams,
              eventToken: 'token3',
              timeSpent: 23,
              sessionLength: 23,
              eventCount: 3,
              sessionCount: 2,
              lastInterval: 23
            }
          }
        ])

        return checkExecution({config: config1, times: 1, reset: true, timestamp: timestamp1}) // + 5 assertions
      })
      .then(() => {
        expect(Logger.default.log).toHaveBeenCalledWith('Request /session has been finished')

        return checkExecution({config: config2, times: 1, reset: true, timestamp: timestamp2}) // + 5 assertions
      })
      .then(() => {
        expect(Logger.default.log).toHaveBeenCalledWith('Request /event has been finished')

        return checkExecution({config: config3, times: 1, reset: true, timestamp: timestamp3}) // + 5 assertions
      })
      .then(() => {
        expect(Logger.default.log).toHaveBeenCalledWith('Request /event has been finished')

        return checkExecution({config: config4, times: 1, reset: true, timestamp: timestamp4}) // + 5 assertions
      })
      .then(() => {
        expect(Logger.default.log).toHaveBeenCalledWith('Request /session has been finished')

        return checkExecution({config: config5, times: 1, reset: true, timestamp: timestamp5}) // + 5 assertions
      })
      .then(() => {
        expect(Logger.default.log).toHaveBeenCalledWith('Request /event has been finished')

        return Storage.default.getFirst('queue')
      })
      .then(pending => {
        expect(pending).toBeUndefined()
      })

  })


  it('cleans up pending requests that are older than 28 days', () => {

    const queueSet = [
      {timestamp: 1549181400100, url: '/url-1', params: {createdAt: '2019-02-03T09:10:00.100Z+0100'}},
      {timestamp: 1544548200020, url: '/url-2', params: {createdAt: '2018-12-11T18:10:00.020Z+0100'}},
      {timestamp: 1546351540330, url: '/url-3', params: {createdAt: '2019-01-01T15:05:40.330Z+0100'}},
      {timestamp: 1549768530000, url: '/url-4', params: {createdAt: '2019-02-10T04:15:30.000Z+0100'}},
      {timestamp: 1549016404100, url: '/url-5', params: {createdAt: '2019-02-01T11:20:04.100Z+0100'}},
      {timestamp: 1551438000440, url: '/url-6', params: {createdAt: '2019-03-01T12:00:00.440Z+0100'}}
    ]

    return Storage.default.addBulk('queue', queueSet)
      .then(() => {
        dateNowSpy.mockReturnValue(new Date('2019-03-03').getTime())

        Queue.run({cleanUp: true})

        return Utils.flushPromises()
      })
      .then(() => Storage.default.getAll('queue'))
      .then(remained => {
        expect(remained.map(params => params.url)).toEqual(['/url-1', '/url-4', '/url-6'])

        Queue.clear()
      })

  })

  it('clears entire queue store', () => {

    const config1 = {url: '/url-1'}
    const config2 = {url: '/url-2'}
    const config3 = {url: '/url-3'}

    expect.assertions(6)

    Queue.push(config1)
    Queue.push(config2)
    Queue.push(config3)

    return Utils.flushPromises()
      .then(() => Storage.default.getAll('queue'))
      .then(pending => {
        expect(pending.map(params => params.url)).toEqual(['/url-1', '/url-2', '/url-3'])

        expect(Logger.default.log).toHaveBeenLastCalledWith('Trying request /url-1 in 150ms')
        expect(setTimeout).toHaveBeenLastCalledWith(expect.any(Function), 150)

        Queue.destroy(true)

        jest.runOnlyPendingTimers()

        expect(Logger.default.log).toHaveBeenLastCalledWith('Previous /url-1 request attempt canceled')

        return Queue.clear()
      })
      .then(() => Storage.default.getAll('queue'))
      .then(pending => {
        expect(pending.length).toBe(0)
        expect(setTimeout).toHaveBeenCalledTimes(1)
      })

  })

})
