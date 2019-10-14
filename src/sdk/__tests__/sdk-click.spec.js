import * as sdkClick from '../sdk-click'
import * as request from '../request'
import * as Time from '../time'
import * as Queue from '../queue'
import * as ActivityState from '../activity-state'

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

  return Utils.flushPromises()
    .then(() => {

      jest.runOnlyPendingTimers()

      expect(request.default).toHaveBeenCalledWith(fullConfig)

      return Utils.flushPromises()
    })
}

describe('test sdk-click functionality', () => {

  Utils.setDocumentProp('referrer', 'http://some-site.com')

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

  it('does nothing if there is no adjust referrer param in the url', () => {

    global.history.pushState({}, '', '?param1=value1&param2=value2')

    sdkClick.default()

    expect(Queue.push).not.toHaveBeenCalled()

    jest.runOnlyPendingTimers()

    expect(request.default).not.toHaveBeenCalled()

  })

  it('does nothing if there is adjust referrer param in the url but no document referrer', () => {

    Utils.setDocumentProp('referrer', '')

    global.history.pushState({}, '', '?adjust_referrer=param1%3Dbla%26param2%3Dtruc&param=value')

    sdkClick.default()

    expect(Queue.push).not.toHaveBeenCalled()

    jest.runOnlyPendingTimers()

    expect(request.default).not.toHaveBeenCalled()

    Utils.setDocumentProp('referrer', 'http://some-site.com')

  })

  it('does nothing if there is adjust referrer param in the url but document referrer is same as current url', () => {

    Utils.setDocumentProp('referrer', 'http://localhost/test')

    global.history.pushState({}, '', '?adjust_referrer=param1%3Dbla%26param2%3Dtruc&param=value')

    sdkClick.default()

    expect(Queue.push).not.toHaveBeenCalled()

    jest.runOnlyPendingTimers()

    expect(request.default).not.toHaveBeenCalled()

    Utils.setDocumentProp('referrer', 'http://some-site.com')

  })

  it('requests sdk_click if there is adjust referrer param in the url', () => {

    expect.assertions(2)

    global.history.pushState({}, '', '?adjust_referrer=param1%3Dbla%26param2%3Dtruc&param=value')

    sdkClick.default()

    return expectRequest({
      url: '/sdk_click',
      method: 'POST',
      params: {
        clickTime: 'some-time',
        source: 'web_referrer',
        referrer: 'param1=bla&param2=truc'
      }
    })
  })

})
