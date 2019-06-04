/* eslint-disable */
import * as SdkClick from '../sdk-click'
import * as request from '../request'
import * as Time from '../time'
import {flushPromises} from './_helper'

jest.mock('../request')
jest.mock('../logger')
jest.useFakeTimers()

describe('test sdk-click functionality', () => {

  beforeAll(() => {
    jest.spyOn(request, 'default')
    jest.spyOn(Time, 'getTimestamp').mockReturnValue('some-time')
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  afterAll(() => {
    jest.clearAllTimers()
    jest.restoreAllMocks()
  })

  it('does nothing if there are no adjust params in the url', () => {

    window.history.pushState({}, '', '?param1=value1&param2=value2')

    SdkClick.check()

    jest.runOnlyPendingTimers()

    expect(request.default).not.toHaveBeenCalled()

  })

  it('requests sdk_click if there are params prefixed with "adjust_" in the url', () => {

    window.history.pushState({}, '', '?adjust_param=value&something=else')

    SdkClick.check()

    jest.runOnlyPendingTimers()

    expect(request.default).toHaveBeenCalledTimes(1)
    expect(request.default.mock.calls[0][0]).toMatchObject({
      url: '/sdk_click',
      method: 'POST',
      params: {
        createdAt: 'some-time',
        source: 'referrer',
        referrer: '%7B%22adjust_param%22%3A%22value%22%2C%22something%22%3A%22else%22%7D'
      }
    })

    return flushPromises()
  })

  it('requests sdk_click if there are params prefixed with "adj_" in the url', () => {

    window.history.pushState({}, '', '?adj_param1=value&bla=truc&adj_param2=bla')

    SdkClick.check()

    jest.runOnlyPendingTimers()

    expect(request.default).toHaveBeenCalledTimes(1)
    expect(request.default.mock.calls[0][0]).toMatchObject({
      url: '/sdk_click',
      method: 'POST',
      params: {
        createdAt: 'some-time',
        source: 'referrer',
        referrer: '%7B%22adj_param1%22%3A%22value%22%2C%22bla%22%3A%22truc%22%2C%22adj_param2%22%3A%22bla%22%7D'
      }
    })

    return flushPromises()
  })

  it('requests sdk_click if there are params prefixed with "adj_" or "adjust_" in the url', () => {

    window.history.pushState({}, '', '?adj_param1=value&bla=truc&adj_param2=bla&adjust_param=tada')

    SdkClick.check()

    jest.runOnlyPendingTimers()

    expect(request.default).toHaveBeenCalledTimes(1)
    expect(request.default.mock.calls[0][0]).toMatchObject({
      url: '/sdk_click',
      method: 'POST',
      params: {
        createdAt: 'some-time',
        source: 'referrer',
        referrer: '%7B%22adj_param1%22%3A%22value%22%2C%22bla%22%3A%22truc%22%2C%22adj_param2%22%3A%22bla%22%2C%22adjust_param%22%3A%22tada%22%7D'
      }
    })

    return flushPromises()
  })

  it('retires sdk_click request when failed request', () => {

    window.history.pushState({}, '', '?adjust_param=value&something=else')

    request.default.mockRejectedValue({error: 'An error'})

    SdkClick.check()

    jest.runOnlyPendingTimers()

    expect.assertions(5)

    expect(request.default).toHaveBeenCalledTimes(1)

    return flushPromises()
      .then(() => {

        jest.runOnlyPendingTimers()

        expect(request.default).toHaveBeenCalledTimes(2)

        return flushPromises()
      }).then(() => {

        jest.runOnlyPendingTimers()

        expect(request.default).toHaveBeenCalledTimes(3)

        return flushPromises()
      }).then(() => {

        request.default.mockClear()
        request.default.mockResolvedValue({})

        jest.runOnlyPendingTimers()

        expect(request.default).toHaveBeenCalledTimes(1)

        request.default.mockClear()

        return flushPromises()
      }).then(() => {

        jest.runOnlyPendingTimers()

        expect(request.default).not.toHaveBeenCalled()
      })
  })

  it('cancels initiated sdk_click call', () => {

    window.history.pushState({}, '', '?adjust_param=value&something=else')

    SdkClick.check()
    SdkClick.destroy()

    jest.runOnlyPendingTimers()

    expect(request.default).not.toHaveBeenCalled()

  })

  it('cancels previously initiated sdk_click call with another one', () => {

    window.history.pushState({}, '', '?adjust_param=value&something=else')

    expect.assertions(2)

    SdkClick.check()
    // initiate another sdk_click call
    SdkClick.check(SdkClick)

    jest.runOnlyPendingTimers()

    expect(request.default).toHaveBeenCalledTimes(1)

    return flushPromises()
      .then(() => {
        expect(request.default).toHaveBeenCalledTimes(1)
      })

  })

})
