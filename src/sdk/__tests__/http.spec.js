import * as http from '../http'
import * as defaultParams from '../default-params'
import * as Time from '../time'
import * as ActivityState from '../activity-state'
import * as PubSub from '../pub-sub'
import * as Config from '../config'

jest.mock('../logger')
jest.mock('../url-strategy')
jest.useFakeTimers()

describe('perform api requests', () => {

  const appParams = {
    appToken: '123abc',
    environment: 'sandbox'
  }

  const defaultParamsString = [
    'app_token=123abc',
    'environment=sandbox',
    'created_at=some-time',
    'sent_at=some-time',
    'web_uuid=some-uuid',
    'tracking_enabled=true',
    'platform=web',
    'language=en',
    'country=gb',
    'machine_type=macos',
    'queue_size=0'
  ].join('&')

  const oldXMLHttpRequest = global.XMLHttpRequest
  const oldLocale = global.navigator.language
  const oldPlatform = global.navigator.platform
  const oldDNT = global.navigator.doNotTrack
  let mockXHR = null
  let defaultParamsSpy

  beforeAll(() => {
    Config.default.set(appParams)

    Utils.setGlobalProp(global.navigator, 'language')
    Utils.setGlobalProp(global.navigator, 'platform')
    Utils.setGlobalProp(global.navigator, 'doNotTrack')

    jest.spyOn(Time, 'getTimestamp').mockReturnValue('some-time')
    ActivityState.default.init({uuid: 'some-uuid'})

    jest.spyOn(global.navigator, 'language', 'get').mockReturnValue('en-GB')
    jest.spyOn(global.navigator, 'platform', 'get').mockReturnValue('macos')
    jest.spyOn(global.navigator, 'doNotTrack', 'get').mockReturnValue(0)
    defaultParamsSpy = jest.spyOn(defaultParams, 'default')
  })
  afterEach(() => {
    global.XMLHttpRequest = oldXMLHttpRequest
    jest.clearAllMocks()
  })
  afterAll(() => {
    jest.restoreAllMocks()
    global.navigator.language = oldLocale
    global.navigator.platform = oldPlatform
    global.navigator.doNotTrack = oldDNT
    Config.default.destroy()
  })

  it('rejects when xhr transaction error', () => {

    mockXHR = Utils.createMockXHR({error: 'connection failed'}, 4, 500, 'Connection failed')
    global.XMLHttpRequest = jest.fn(() => mockXHR)

    expect.assertions(1)

    expect(http.default({
      endpoint: 'app',
      url: '/some-url',
      params: {}
    })).rejects.toEqual({
      status: 'error',
      response: {error: 'connection failed'},
      action: 'RETRY',
      message: 'XHR transaction failed due to an error',
      code: 'TRANSACTION_ERROR'
    })

    return Utils.flushPromises()
      .then(() => {
        mockXHR.onerror()
      })
  })

  it('rejects when network connection error', () => {

    mockXHR = Utils.createMockXHR('', 4, 0, 'Network issue')
    global.XMLHttpRequest = jest.fn(() => mockXHR)

    expect.assertions(1)

    expect(http.default({
      endpoint: 'app',
      url: '/some-url',
      params: {}
    })).rejects.toEqual({
      status: 'error',
      action: 'RETRY',
      response: JSON.stringify(''),
      message: 'No internet connectivity',
      code: 'NO_CONNECTION'
    })

    return Utils.flushPromises()
      .then(() => {
        mockXHR.onreadystatechange()
      })
  })

  it('resolves error returned from server (because of retry mechanism)', () => {

    mockXHR = Utils.createMockXHR({error: 'Session failed (failed to get app token)'}, 4, 400, 'Some server')
    global.XMLHttpRequest = jest.fn(() => mockXHR)

    expect.assertions(1)

    expect(http.default({
      endpoint: 'app',
      url: '/some-url',
      params: {}
    })).resolves.toEqual({
      status: 'error',
      action: 'CONTINUE',
      response: {error: 'Session failed (failed to get app token)'},
      message: 'Server was not able to process the request, probably due to error coming from the client',
      code: 'SERVER_CANNOT_PROCESS'
    })

    return Utils.flushPromises()
      .then(() => {
        mockXHR.onreadystatechange()
      })
  })

  it('reject badly formed json from server when ok status', () => {

    mockXHR = Utils.createMockXHR('bla bla not json', 4, 200, 'OK')
    global.XMLHttpRequest = jest.fn(() => mockXHR)

    expect.assertions(1)

    expect(http.default({
      endpoint: 'app',
      url: '/some-url',
      params: {}
    })).rejects.toEqual({
      status: 'error',
      action: 'RETRY',
      response: JSON.stringify('bla bla not json'),
      message: 'Response from server is malformed',
      code: 'SERVER_MALFORMED_RESPONSE'
    })

    return Utils.flushPromises()
      .then(() => {
        mockXHR.onreadystatechange()
      })
  })

  it('reject badly formed json from server when internal server error', () => {

    mockXHR = Utils.createMockXHR('Internal Server Error', 4, 500, 'Internal Error')
    global.XMLHttpRequest = jest.fn(() => mockXHR)

    expect.assertions(1)

    expect(http.default({
      endpoint: 'app',
      url: '/some-url',
      params: {}
    })).rejects.toEqual({
      status: 'error',
      action: 'RETRY',
      response: JSON.stringify('Internal Server Error'),
      message: 'Internal error occurred on the server',
      code: 'SERVER_INTERNAL_ERROR'
    })

    return Utils.flushPromises()
      .then(() => {
        mockXHR.onreadystatechange()
      })
  })

  it('ignores readyState other then 4', () => {

    mockXHR = Utils.createMockXHR({}, 2)
    global.XMLHttpRequest = jest.fn(() => mockXHR)

    expect.assertions(0)

    expect(http.default({
      endpoint: 'app',
      url: '/not-resolved-request'
    })).resolves.toEqual({})

    return Utils.flushPromises()
      .then(() => {
        mockXHR.onreadystatechange()
      })
  })

  describe('resolved requests', () => {

    const response = {
      adid: '123123',
      timestamp: '2019-01-01'
    }

    beforeEach(() => {
      mockXHR = Utils.createMockXHR(response)
      global.XMLHttpRequest = jest.fn(() => mockXHR)

      jest.spyOn(mockXHR, 'open')
      jest.spyOn(mockXHR, 'setRequestHeader')
      jest.spyOn(mockXHR, 'send')
    })

    it('performs GET request', () => {

      expect.assertions(4)

      expect(http.default({
        endpoint: 'app',
        url: '/some-url',
        params: {
          eventToken: '567abc',
          some: 'thing',
          very: 'nice',
          and: {test: 'object'}
        }
      })).resolves.toEqual({
        status: 'success',
        ...response
      })

      return Utils.flushPromises()
        .then(() => {

          expect(mockXHR.open).toHaveBeenCalledWith('GET', `app/some-url?${defaultParamsString}&event_token=567abc&some=thing&very=nice&and=%7B%22test%22%3A%22object%22%7D`, true)
          expect(mockXHR.setRequestHeader).toHaveBeenCalledWith('Client-SDK', 'jsTEST')
          expect(mockXHR.send).toHaveBeenCalledWith(undefined)

          mockXHR.onreadystatechange()
        })
    })

    it('performs GET request without any default params besides base params', () => {

      const baseParamsString = [
        'app_token=123abc',
        'environment=sandbox'
      ].join('&')

      defaultParamsSpy.mockResolvedValueOnce(undefined)

      expect.assertions(4)

      expect(http.default({
        endpoint: 'app',
        url: '/some-url',
        params: {
          eventToken: '567abc'
        }
      })).resolves.toEqual({
        status: 'success',
        ...response
      })

      return Utils.flushPromises()
        .then(() => {

          expect(mockXHR.open).toHaveBeenCalledWith('GET', `app/some-url?${baseParamsString}&event_token=567abc`, true)
          expect(mockXHR.setRequestHeader).toHaveBeenCalledWith('Client-SDK', 'jsTEST')
          expect(mockXHR.send).toHaveBeenCalledWith(undefined)

          mockXHR.onreadystatechange()
        })
    })

    it('performs GET request with defaultTracker parameter', () => {

      Config.default.set({defaultTracker: 'blatruc', ...appParams})

      const defaultParamsStringWithDefaultTracker = [
        'app_token=123abc',
        'environment=sandbox',
        'default_tracker=blatruc',
        'created_at=some-time',
        'sent_at=some-time',
        'web_uuid=some-uuid',
        'tracking_enabled=true',
        'platform=web',
        'language=en',
        'country=gb',
        'machine_type=macos',
        'queue_size=0'
      ].join('&')

      expect.assertions(4)

      expect(http.default({
        endpoint: 'app',
        url: '/some-other-url',
        params: {
          bla: 'truc'
        }
      })).resolves.toEqual({
        status: 'success',
        ...response
      })

      return Utils.flushPromises()
        .then(() => {

          expect(mockXHR.open).toHaveBeenCalledWith('GET', `app/some-other-url?${defaultParamsStringWithDefaultTracker}&bla=truc`, true)
          expect(mockXHR.setRequestHeader).toHaveBeenCalledWith('Client-SDK', 'jsTEST')
          expect(mockXHR.send).toHaveBeenCalledWith(undefined)

          mockXHR.onreadystatechange()

          Config.default.set(appParams)
        })
    })

    it('performs GET request with externalDeviceId parameter', () => {

      Config.default.set({externalDeviceId: 'my-id', ...appParams})

      const defaultParamsStringWithExternalDeviceId = [
        'app_token=123abc',
        'environment=sandbox',
        'external_device_id=my-id',
        'created_at=some-time',
        'sent_at=some-time',
        'web_uuid=some-uuid',
        'tracking_enabled=true',
        'platform=web',
        'language=en',
        'country=gb',
        'machine_type=macos',
        'queue_size=0'
      ].join('&')

      expect.assertions(4)

      expect(http.default({
        endpoint: 'app',
        url: '/some-other-url',
        params: {
          bla: 'truc'
        }
      })).resolves.toEqual({
        status: 'success',
        ...response
      })

      return Utils.flushPromises()
        .then(() => {

          expect(mockXHR.open).toHaveBeenCalledWith('GET', `app/some-other-url?${defaultParamsStringWithExternalDeviceId}&bla=truc`, true)
          expect(mockXHR.setRequestHeader).toHaveBeenCalledWith('Client-SDK', 'jsTEST')
          expect(mockXHR.send).toHaveBeenCalledWith(undefined)

          mockXHR.onreadystatechange()

          Config.default.set(appParams)
        })
    })

    it('performs gdpr_forget_device request', () => {
      expect.assertions(4)

      expect(http.default({
        endpoint: 'gdpr',
        url: '/gdpr_forget_device',
        method: 'POST'
      })).resolves.toEqual({
        status: 'success',
        ...response
      })

      return Utils.flushPromises()
        .then(() => {
          expect(mockXHR.open).toHaveBeenCalledWith('POST', 'gdpr/gdpr_forget_device', true)
          expect(mockXHR.setRequestHeader).toHaveBeenCalledWith('Client-SDK', 'jsTEST')
          expect(mockXHR.send).toHaveBeenCalledWith(`${defaultParamsString}`)

          mockXHR.onreadystatechange()
        })
    })

    it('tries to inject unknown parameter through configuration', () => {

      Config.default.set({something: 'strange', ...appParams})

      expect.assertions(4)

      expect(http.default({
        endpoint: 'app',
        url: '/sweet-url',
        params: {
          some: 'thing'
        }
      })).resolves.toEqual({
        status: 'success',
        ...response
      })

      return Utils.flushPromises()
        .then(() => {

          expect(mockXHR.open).toHaveBeenCalledWith('GET', `app/sweet-url?${defaultParamsString}&some=thing`, true)
          expect(mockXHR.setRequestHeader).toHaveBeenCalledWith('Client-SDK', 'jsTEST')
          expect(mockXHR.send).toHaveBeenCalledWith(undefined)

          mockXHR.onreadystatechange()

          Config.default.set(appParams)
        })
    })

    it('excludes empty values from the request params', () => {

      expect.assertions(4)

      expect(http.default({
        endpoint: 'app',
        url: '/some-url',
        params: {
          some: 'thing',
          very: 'nice',
          empty: '',
          empty2: null,
          zero: 0,
          empty3: undefined,
          bla: 'ble',
          obj: {}
        }
      })).resolves.toEqual({
        status: 'success',
        ...response
      })

      return Utils.flushPromises()
        .then(() => {

          expect(mockXHR.open).toHaveBeenCalledWith('GET', `app/some-url?${defaultParamsString}&some=thing&very=nice&zero=0&bla=ble`, true)
          expect(mockXHR.setRequestHeader).toHaveBeenCalledWith('Client-SDK', 'jsTEST')
          expect(mockXHR.send).toHaveBeenCalledWith(undefined)

          mockXHR.onreadystatechange()
        })
    })

    it('performs POST request', () => {

      expect.assertions(5)

      expect(http.default({
        endpoint: 'app',
        url: '/some-url',
        method: 'POST',
        params: {
          some: 'thing',
          very: 'nice'
        }
      })).resolves.toEqual({
        status: 'success',
        ...response
      })

      return Utils.flushPromises()
        .then(() => {

          expect(mockXHR.open).toHaveBeenCalledWith('POST', 'app/some-url', true)
          expect(mockXHR.setRequestHeader).toHaveBeenCalledWith('Client-SDK', 'jsTEST')
          expect(mockXHR.setRequestHeader).toHaveBeenCalledWith('Content-Type', 'application/x-www-form-urlencoded')
          expect(mockXHR.send).toHaveBeenCalledWith(`${defaultParamsString}&some=thing&very=nice`)

          mockXHR.onreadystatechange()
        })
    })
  })

  describe('filter response returned to client', () => {

    const prepare = (response) => {
      mockXHR = Utils.createMockXHR(response)
      global.XMLHttpRequest = jest.fn(() => mockXHR)
    }

    it('returns response with whitelisted attributes when not attribution endpoint', () => {

      prepare({
        adid: '123123',
        some: 'thing',
        attribution: 'thing',
        message: 'bla',
        timestamp: '2019-02-02'
      })

      expect(http.default({
        endpoint: 'app',
        url: '/session',
        params: {
          some: 'thing',
          very: 'nice',
          and: {test: 'object'}
        }
      })).resolves.toEqual({
        status: 'success',
        adid: '123123',
        timestamp: '2019-02-02'
      })

      return Utils.flushPromises()
        .then(() => {
          mockXHR.onreadystatechange()
        })
    })

    it('returns response with whitelisted attributes for attribution endpoint', () => {

      prepare({
        adid: '123123',
        some: 'thing',
        attribution: 'thing',
        message: 'bla',
        timestamp: '2019-02-02'
      })

      expect(http.default({
        endpoint: 'app',
        url: '/attribution',
        params: {
          some: 'thing',
          very: 'nice',
          and: {test: 'object'}
        }
      })).resolves.toEqual({
        status: 'success',
        adid: '123123',
        attribution: 'thing',
        message: 'bla',
        timestamp: '2019-02-02'
      })

      return Utils.flushPromises()
        .then(() => {
          mockXHR.onreadystatechange()
        })
    })
  })

  describe('response interception', () => {

    const prepare = (response) => {
      mockXHR = Utils.createMockXHR(response)
      global.XMLHttpRequest = jest.fn(() => mockXHR)
    }

    beforeAll(() => {
      jest.spyOn(PubSub, 'publish')
    })

    afterEach(() => {
      jest.clearAllMocks()
    })

    afterAll(() => {
      jest.restoreAllMocks()
    })

    it('broadcasts sdk:gdpr-forget-me when opted_out and ignores attribution check and session finished events', () => {

      prepare({
        adid: '123123',
        message: 'bla',
        timestamp: '2019-02-02',
        ask_in: 2500,
        tracking_state: 'opted_out'
      })

      expect.assertions(4)

      http.default({
        endpoint: 'app',
        url: '/session'
      }).then(result => {
        expect(result).toEqual({
          status: 'success',
          adid: '123123',
          timestamp: '2019-02-02',
          ask_in: 2500,
          tracking_state: 'opted_out'
        })
        expect(PubSub.publish).not.toHaveBeenCalledWith('attribution:check', result)
        expect(PubSub.publish).not.toHaveBeenCalledWith('session:finished', result)
        expect(PubSub.publish).toHaveBeenCalledWith('sdk:gdpr-forget-me')
      })

      return Utils.flushPromises()
        .then(() => {
          mockXHR.onreadystatechange()
        })
    })

    it('checks attribution info on session request with ask_in and broadcast session finished event', () => {

      prepare({
        adid: '123123',
        message: 'bla',
        timestamp: '2019-02-02',
        ask_in: 2500
      })

      expect.assertions(3)

      http.default({
        url: '/session'
      }).then(result => {
        expect(result).toEqual({
          status: 'success',
          adid: '123123',
          timestamp: '2019-02-02',
          ask_in: 2500
        })
        expect(PubSub.publish).toHaveBeenCalledWith('attribution:check', result)
        expect(PubSub.publish).toHaveBeenCalledWith('session:finished', result)
      })

      return Utils.flushPromises()
        .then(() => {
          mockXHR.onreadystatechange()
        })
    })

    it('does not check attribution info on request other than session without ask_in', () => {

      prepare({
        adid: '123123',
        message: 'bla',
        timestamp: '2019-02-02'
      })

      expect.assertions(3)

      http.default({
        endpoint: 'app',
        url: '/event',
        params: {
          eventToken: 'token1'
        }
      }).then(result => {
        expect(result).toEqual({
          status: 'success',
          adid: '123123',
          timestamp: '2019-02-02'
        })
        expect(PubSub.publish).not.toHaveBeenCalledWith('attribution:check', result)
        expect(PubSub.publish).not.toHaveBeenCalledWith('session:finished', result)
      })

      return Utils.flushPromises()
        .then(() => {
          mockXHR.onreadystatechange()
        })
    })

    it('checks attribution info on any request with ask_in', () => {

      prepare({
        message: 'bla',
        ask_in: 2500
      })

      expect.assertions(3)

      http.default({
        endpoint: 'app',
        url: '/anything',
        params: {
          bla: 'truc'
        }
      }).then(result => {
        expect(result).toEqual({
          status: 'success',
          ask_in: 2500
        })
        expect(PubSub.publish).toHaveBeenCalledWith('attribution:check', result)
        expect(PubSub.publish).not.toHaveBeenCalledWith('session:finished', result)
      })

      return Utils.flushPromises()
        .then(() => {
          mockXHR.onreadystatechange()
        })
    })

    it('broadcasts session finish event only on session request', () => {

      prepare({message: 'bla'})

      expect.assertions(2)

      http.default({
        endpoint: 'app',
        url: '/session'
      }).then(result => {
        expect(result).toEqual({status: 'success'})
        expect(PubSub.publish).toHaveBeenCalledWith('session:finished', result)
      })

      return Utils.flushPromises()
        .then(() => {
          mockXHR.onreadystatechange()
        })
    })

    it('handles GDPR-Forget-Me finish state on random request', () => {

      prepare({
        message: 'bla',
        ask_in: 2500,
        tracking_state: 'opted_out'
      })

      expect.assertions(4)

      http.default({
        endpoint: 'app',
        url: '/anything',
        params: {
          bla: 'truc'
        }
      }).then(result => {
        expect(result).toEqual({
          status: 'success',
          ask_in: 2500,
          tracking_state: 'opted_out'
        })
        expect(PubSub.publish).not.toHaveBeenCalledWith('attribution:check', result)
        expect(PubSub.publish).not.toHaveBeenCalledWith('session:finished', result)
        expect(PubSub.publish).toHaveBeenCalledWith('sdk:gdpr-forget-me')
      })

      return Utils.flushPromises()
        .then(() => {
          mockXHR.onreadystatechange()
        })
    })

    it('does not handle GDPR-Forget-Me finish state on gdpr_forget_device request', () => {

      prepare({
        ask_in: 2500,
        tracking_state: 'opted_out'
      })

      expect.assertions(2)

      http.default({
        endpoint: 'gdpr',
        url: '/gdpr_forget_device'
      }).then(result => {
        expect(result).toEqual({
          status: 'success',
          ask_in: 2500,
          tracking_state: 'opted_out'
        })
        expect(PubSub.publish.mock.calls.length).toBe(0)
      })

      return Utils.flushPromises()
        .then(() => {
          mockXHR.onreadystatechange()
        })
    })

    it('broadcasts third-party-sharing-opt-out event when this request is finished', () => {

      prepare({message: 'bla'})

      expect.assertions(2)

      http.default({
        endpoint: 'app',
        url: '/disable_third_party_sharing'
      }).then(result => {
        expect(result).toEqual({
          status: 'success'
        })
        expect(PubSub.publish).toHaveBeenCalledWith('sdk:third-party-sharing-opt-out')
      })

      return Utils.flushPromises()
        .then(() => {
          mockXHR.onreadystatechange()
        })
    })
  })
})
