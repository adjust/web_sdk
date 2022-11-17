import * as sdkClick from '../sdk-click'
import * as http from '../http'
import * as Time from '../time'
import * as Queue from '../queue'
import * as ActivityState from '../activity-state'

jest.mock('../http')
jest.mock('../logger')
jest.mock('../url-strategy')
jest.useFakeTimers()

describe('test sdk-click functionality', () => {

  beforeAll(() => {
    jest.spyOn(http, 'default')
    jest.spyOn(Queue, 'push')
    jest.spyOn(Time, 'getTimestamp').mockReturnValue('some-time')

    ActivityState.default.init({uuid: 'some-uuid'})
  })

  afterEach(() => {
    localStorage.clear()
    jest.clearAllMocks()
  })

  afterAll(() => {
    ActivityState.default.destroy()

    jest.clearAllTimers()
    jest.restoreAllMocks()
  })

  it('does nothing if there is no adjust referrer param in the url', () => {

    global.history.pushState({}, '', '?param1=value1&param2=value2')

    sdkClick.default()

    expect(Queue.push).not.toHaveBeenCalled()

    jest.runOnlyPendingTimers()

    expect(http.default).not.toHaveBeenCalled()

  })

  it('requests sdk_click if there is adjust referrer param in the url', () => {

    expect.assertions(2)

    global.history.pushState({}, '', '?adjust_referrer=param1%3Dbla%26param2%3Dtruc&param=value')

    sdkClick.default()

    const requestConfig = {
      url: '/sdk_click',
      method: 'POST',
      params: {
        clickTime: 'some-time',
        source: 'web_referrer',
        referrer: 'param1=bla&param2=truc'
      }
    }

    const fullConfig = {
      endpoint: 'app',
      ...requestConfig,
      params: {
        attempts: 1,
        createdAt: 'some-time',
        timeSpent: 0,
        sessionLength: 0,
        sessionCount: 1,
        lastInterval: 0,
        ...requestConfig.params
      }
    }

    expect(Queue.push).toHaveBeenCalledWith(requestConfig, {timestamp: undefined})

    return Utils.flushPromises()
      .then(() => {

        jest.runOnlyPendingTimers()

        expect(http.default).toHaveBeenCalledWith(fullConfig)

        return Utils.flushPromises()
      })
  })

  describe('set referrer manually', () => {

    beforeAll(() => {
      global.history.pushState({}, '', '/')
    })

    it('requests sdk_click if called with non-empty referrer', () => {

      expect.assertions(2)

      sdkClick.default('ref%3Dmeow')

      const requestConfig = {
        url: '/sdk_click',
        method: 'POST',
        params: {
          clickTime: 'some-time',
          source: 'web_referrer',
          referrer: 'ref=meow'
        }
      }

      const fullConfig = {
        endpoint: 'app',
        ...requestConfig,
        params: {
          attempts: 1,
          createdAt: 'some-time',
          timeSpent: 0,
          sessionLength: 0,
          sessionCount: 1,
          lastInterval: 0,
          ...requestConfig.params
        }
      }

      expect(Queue.push).toHaveBeenCalledWith(requestConfig, {timestamp: undefined})

      return Utils.flushPromises()
        .then(() => {

          jest.runOnlyPendingTimers()

          expect(http.default).toHaveBeenCalledWith(fullConfig)

          return Utils.flushPromises()
        })

    })

    it('does nothing when called without parameters', () => {

      sdkClick.default()

      expect(Queue.push).not.toHaveBeenCalled()

      jest.runOnlyPendingTimers()

      expect(http.default).not.toHaveBeenCalled()

    })

    it('does nothing when called with empty parameters', () => {

      sdkClick.default('')

      expect(Queue.push).not.toHaveBeenCalled()

      jest.runOnlyPendingTimers()

      expect(http.default).not.toHaveBeenCalled()

    })

  })

})
