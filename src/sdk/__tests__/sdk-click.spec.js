/* eslint-disable */
import * as SdkClick from '../sdk-click'
import * as request from '../request'
import * as Time from '../time'
import {errorResponse, flushPromises, setDocumentProp} from './_helper'

jest.mock('../request')
jest.mock('../logger')
jest.useFakeTimers()

describe('test sdk-click functionality', () => {

  setDocumentProp('referrer', 'http://some-site.com')

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

  it('does nothing if there are adjust params in the url but no referrer', () => {

    setDocumentProp('referrer', '')

    window.history.pushState({}, '', '?adjust_param=value1&param2=value2')

    SdkClick.check()

    jest.runOnlyPendingTimers()

    expect(request.default).not.toHaveBeenCalled()

    setDocumentProp('referrer', 'http://some-site.com')

  })

  it('does nothing if there are adjust params in the url but same referrer as current url', () => {

    setDocumentProp('referrer', 'http://localhost/test')

    window.history.pushState({}, '', '?adjust_param=value1&param2=value2')

    SdkClick.check()

    jest.runOnlyPendingTimers()

    expect(request.default).not.toHaveBeenCalled()

    setDocumentProp('referrer', 'http://some-site.com')

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
        clickTime: 'some-time',
        createdAt: 'some-time',
        source: 'referrer',
        referrer: 'adjust_param=value&something=else'
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
        clickTime: 'some-time',
        createdAt: 'some-time',
        source: 'referrer',
        referrer: 'adj_param1=value&bla=truc&adj_param2=bla'
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
        clickTime: 'some-time',
        createdAt: 'some-time',
        source: 'referrer',
        referrer: 'adj_param1=value&bla=truc&adj_param2=bla&adjust_param=tada'
      }
    })

    return flushPromises()
  })

  it('retires sdk_click request when failed request', () => {

    window.history.pushState({}, '', '?adjust_param=value&something=else')

    request.default.mockRejectedValue(errorResponse())

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
    SdkClick.check()

    jest.runOnlyPendingTimers()

    expect(request.default).toHaveBeenCalledTimes(1)

    return flushPromises()
      .then(() => {
        expect(request.default).toHaveBeenCalledTimes(1)
      })

  })

})
