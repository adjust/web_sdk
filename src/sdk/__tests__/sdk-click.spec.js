import * as sdkClick from '../sdk-click'
import * as request from '../request'
import * as Time from '../time'
import * as Queue from '../queue'
import * as ActivityState from '../activity-state'
import {flushPromises, setDocumentProp} from './_common'

jest.mock('../request')
jest.mock('../logger')
jest.useFakeTimers()

function expectRequest (requestConfig) {

  const fullConfig = Object.assign({}, requestConfig, {
    params: Object.assign({
      createdAt: 'some-time',
      timeSpent: 0,
      sessionLength: 0,
      sessionCount: 1,
      lastInterval: 0
    }, requestConfig.params)
  })

  expect(Queue.push).toHaveBeenCalledWith(requestConfig)

  return flushPromises()
    .then(() => {

      jest.runOnlyPendingTimers()

      expect(request.default).toHaveBeenCalledWith(fullConfig)

      return flushPromises()
    })
}

describe('test sdk-click functionality', () => {

  setDocumentProp('referrer', 'http://some-site.com')

  beforeAll(() => {
    jest.spyOn(request, 'default')
    jest.spyOn(Queue, 'push')
    jest.spyOn(Time, 'getTimestamp').mockReturnValue('some-time')

    ActivityState.default.current = {uuid: 'some-uuid'}
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

  it('does nothing if there are no adjust params in the url', () => {

    window.history.pushState({}, '', '?param1=value1&param2=value2')

    sdkClick.default()

    expect(Queue.push).not.toHaveBeenCalled()

    jest.runOnlyPendingTimers()

    expect(request.default).not.toHaveBeenCalled()

  })

  it('does nothing if there are adjust params in the url but no referrer', () => {

    setDocumentProp('referrer', '')

    window.history.pushState({}, '', '?adjust_param=value1&param2=value2')

    sdkClick.default()

    expect(Queue.push).not.toHaveBeenCalled()

    jest.runOnlyPendingTimers()

    expect(request.default).not.toHaveBeenCalled()

    setDocumentProp('referrer', 'http://some-site.com')

  })

  it('does nothing if there are adjust params in the url but same referrer as current url', () => {

    setDocumentProp('referrer', 'http://localhost/test')

    window.history.pushState({}, '', '?adjust_param=value1&param2=value2')

    sdkClick.default()

    expect(Queue.push).not.toHaveBeenCalled()

    jest.runOnlyPendingTimers()

    expect(request.default).not.toHaveBeenCalled()

    setDocumentProp('referrer', 'http://some-site.com')

  })

  it('requests sdk_click if there are params prefixed with "adjust_" in the url', () => {

    expect.assertions(2)

    window.history.pushState({}, '', '?adjust_param=value&something=else')

    sdkClick.default()

    return expectRequest({
      url: '/sdk_click',
      method: 'POST',
      params: {
        clickTime: 'some-time',
        source: 'web_referrer',
        referrer: 'adjust_param=value&something=else'
      }
    })
  })

  it('requests sdk_click if there are params prefixed with "adj_" in the url', () => {

    expect.assertions(2)

    window.history.pushState({}, '', '?adj_param1=value&bla=truc&adj_param2=bla')

    sdkClick.default()

    return expectRequest({
      url: '/sdk_click',
      method: 'POST',
      params: {
        clickTime: 'some-time',
        source: 'web_referrer',
        referrer: 'adj_param1=value&bla=truc&adj_param2=bla'
      }
    })
  })

  it('requests sdk_click if there are params prefixed with "adj_" or "adjust_" in the url', () => {

    expect.assertions(2)

    window.history.pushState({}, '', '?adj_param1=value&bla=truc&adj_param2=bla&adjust_param=tada')

    sdkClick.default()

    return expectRequest({
      url: '/sdk_click',
      method: 'POST',
      params: {
        clickTime: 'some-time',
        source: 'web_referrer',
        referrer: 'adj_param1=value&bla=truc&adj_param2=bla&adjust_param=tada',
      }
    })
  })

})
