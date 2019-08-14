import * as request from '../request'
import * as Time from '../time'
import * as ActivityState from '../activity-state'
import * as PubSub from '../pub-sub'
import * as Config from '../config'

jest.mock('../logger')
jest.useFakeTimers()

describe('perform api requests', () => {

  const appParams = {
    appToken: '123abc',
    environment: 'sandbox'
  }

  const defaultParams = [
    'app_token=123abc',
    'environment=sandbox',
    'created_at=some-time',
    'sent_at=some-time',
    'web_uuid=some-uuid',
    'gps_adid=some-uuid',
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

  beforeAll(() => {
    Config.default.baseParams = appParams

    Utils.setGlobalProp(global.navigator, 'language')
    Utils.setGlobalProp(global.navigator, 'platform')
    Utils.setGlobalProp(global.navigator, 'doNotTrack')

    jest.spyOn(Time, 'getTimestamp').mockReturnValue('some-time')
    ActivityState.default.current = {uuid: 'some-uuid'}

    jest.spyOn(global.navigator, 'language', 'get').mockReturnValue('en-GB')
    jest.spyOn(global.navigator, 'platform', 'get').mockReturnValue('macos')
    jest.spyOn(global.navigator, 'doNotTrack', 'get').mockReturnValue(0)
  })
  afterEach(() => {
    global.XMLHttpRequest = oldXMLHttpRequest
    jest.clearAllMocks()
  })
  afterAll(() => {
    jest.restoreAllMocks()
    global.navigator.language = oldLocale
    global.navigator.language = oldPlatform
    global.navigator.doNotTrack = oldDNT
    Config.default.destroy()
  })

  it('rejects when network issue', () => {

    mockXHR = Utils.createMockXHR({error: 'connection failed'}, 500, 'Connection failed')
    global.XMLHttpRequest = jest.fn(() => mockXHR)

    expect.assertions(1)

    expect(request.default({
      url: '/some-url',
      params: {}
    })).rejects.toEqual({
      status: 500,
      statusText: 'Connection failed',
      response: {message: 'Unknown error, retry will follow', code: 'RETRY'},
      responseText: JSON.stringify({message: 'Unknown error, retry will follow', code: 'RETRY'})
    })

    return Utils.flushPromises()
      .then(() => {
        mockXHR.onerror()
      })
  })

  it('rejects when status 0', () => {

    mockXHR = Utils.createMockXHR('', 0, 'Network issue')
    global.XMLHttpRequest = jest.fn(() => mockXHR)

    expect.assertions(1)

    expect(request.default({
      url: '/some-url',
      params: {}
    })).rejects.toEqual({
      status: 0,
      statusText: 'Network issue',
      response: {message: 'Unknown error, retry will follow', code: 'RETRY'},
      responseText: JSON.stringify({message: 'Unknown error, retry will follow', code: 'RETRY'})
    })

    return Utils.flushPromises()
      .then(() => {
        mockXHR.onreadystatechange()
      })
  })

  it('resolves error returned from server (because of retry mechanism)', () => {

    mockXHR = Utils.createMockXHR({error: 'some error'}, 400, 'Some error')
    global.XMLHttpRequest = jest.fn(() => mockXHR)

    expect.assertions(1)

    expect(request.default({
      url: '/some-url',
      params: {}
    })).resolves.toEqual({error: 'some error'})

    return Utils.flushPromises()
      .then(() => {
        mockXHR.onreadystatechange()
      })
  })

  it('reject badly formed json from server', () => {

    mockXHR = Utils.createMockXHR('bla bla not json', 200, 'OK')
    global.XMLHttpRequest = jest.fn(() => mockXHR)

    expect.assertions(1)

    expect(request.default({
      url: '/some-url',
      params: {}
    })).rejects.toEqual({
      status: 200,
      statusText: 'OK',
      response: {message: 'Unknown error, retry will follow', code: 'RETRY'},
      responseText: JSON.stringify({message: 'Unknown error, retry will follow', code: 'RETRY'})
    })

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

      expect(request.default({
        url: '/some-url',
        params: {
          eventToken: '567abc',
          some: 'thing',
          very: 'nice',
          and: {test: 'object'}
        }
      })).resolves.toEqual(response)

      return Utils.flushPromises()
        .then(() => {

          expect(mockXHR.open).toHaveBeenCalledWith('GET', `/some-url?${defaultParams}&event_token=567abc&some=thing&very=nice&and=%7B%22test%22%3A%22object%22%7D`, true)
          expect(mockXHR.setRequestHeader).toHaveBeenCalledWith('Client-SDK', 'jsTEST')
          expect(mockXHR.send).toHaveBeenCalledWith(undefined)

          mockXHR.onreadystatechange()
        })
    })

    it('performs GET request with defaultTracker parameter', () => {

      Config.default.baseParams = Object.assign({defaultTracker: 'blatruc'}, appParams)

      const defaultParamsWithDefaultTracker = [
        'app_token=123abc',
        'environment=sandbox',
        'default_tracker=blatruc',
        'created_at=some-time',
        'sent_at=some-time',
        'web_uuid=some-uuid',
        'gps_adid=some-uuid',
        'tracking_enabled=true',
        'platform=web',
        'language=en',
        'country=gb',
        'machine_type=macos',
        'queue_size=0'
      ].join('&')

      expect.assertions(4)

      expect(request.default({
        url: '/some-other-url',
        params: {
          bla: 'truc'
        }
      })).resolves.toEqual(response)

      return Utils.flushPromises()
        .then(() => {

          expect(mockXHR.open).toHaveBeenCalledWith('GET', `/some-other-url?${defaultParamsWithDefaultTracker}&bla=truc`, true)
          expect(mockXHR.setRequestHeader).toHaveBeenCalledWith('Client-SDK', 'jsTEST')
          expect(mockXHR.send).toHaveBeenCalledWith(undefined)

          mockXHR.onreadystatechange()

          Config.default.baseParams = appParams
        })
    })

    it('tries to inject unknown parameter through configuration', () => {

      Config.default.baseParams = Object.assign({something: 'strange'}, appParams)

      expect.assertions(4)

      expect(request.default({
        url: '/sweet-url',
        params: {
          some: 'thing'
        }
      })).resolves.toEqual(response)

      return Utils.flushPromises()
        .then(() => {

          expect(mockXHR.open).toHaveBeenCalledWith('GET', `/sweet-url?${defaultParams}&some=thing`, true)
          expect(mockXHR.setRequestHeader).toHaveBeenCalledWith('Client-SDK', 'jsTEST')
          expect(mockXHR.send).toHaveBeenCalledWith(undefined)

          mockXHR.onreadystatechange()

          Config.default.baseParams = appParams
        })
    })

    it('excludes empty values from the request params', () => {

      expect.assertions(4)

      expect(request.default({
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
      })).resolves.toEqual(response)

      return Utils.flushPromises()
        .then(() => {

          expect(mockXHR.open).toHaveBeenCalledWith('GET', `/some-url?${defaultParams}&some=thing&very=nice&zero=0&bla=ble`, true)
          expect(mockXHR.setRequestHeader).toHaveBeenCalledWith('Client-SDK', 'jsTEST')
          expect(mockXHR.send).toHaveBeenCalledWith(undefined)

          mockXHR.onreadystatechange()
        })
    })

    it('performs POST request', () => {

      expect.assertions(5)

      expect(request.default({
        url: '/some-url',
        method: 'POST',
        params: {
          some: 'thing',
          very: 'nice'
        }
      })).resolves.toEqual(response)

      return Utils.flushPromises()
        .then(() => {

          expect(mockXHR.open).toHaveBeenCalledWith('POST', '/some-url', true)
          expect(mockXHR.setRequestHeader).toHaveBeenCalledWith('Client-SDK', 'jsTEST')
          expect(mockXHR.setRequestHeader).toHaveBeenCalledWith('Content-type', 'application/x-www-form-urlencoded')
          expect(mockXHR.send).toHaveBeenCalledWith(`${defaultParams}&some=thing&very=nice`)

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

      expect(request.default({
        url: '/session',
        params: {
          some: 'thing',
          very: 'nice',
          and: {test: 'object'}
        }
      })).resolves.toEqual({
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

      expect(request.default({
        url: '/attribution',
        params: {
          some: 'thing',
          very: 'nice',
          and: {test: 'object'}
        }
      })).resolves.toEqual({
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

    it('broadcasts sdk:gdpr-forget-me when opted_out and ignores ask_in', () => {

      prepare({
        adid: '123123',
        message: 'bla',
        timestamp: '2019-02-02',
        ask_in: 2500,
        tracking_state: 'opted_out'
      })

      expect.assertions(3)

      request.default({
        url: '/session'
      }).then(result => {
        expect(result).toEqual({
          adid: '123123',
          timestamp: '2019-02-02',
          ask_in: 2500,
          tracking_state: 'opted_out'
        })
        expect(PubSub.publish).not.toHaveBeenCalledWith('attribution:check', result)
        expect(PubSub.publish).toHaveBeenCalledWith('sdk:gdpr-forget-me', true)
      })

      return Utils.flushPromises()
        .then(() => {
          mockXHR.onreadystatechange()
        })
    })

    it('checks attribution info on session request with ask_in', () => {

      prepare({
        adid: '123123',
        message: 'bla',
        timestamp: '2019-02-02',
        ask_in: 2500
      })

      expect.assertions(2)

      request.default({
        url: '/session'
      }).then(result => {
        expect(result).toEqual({
          adid: '123123',
          timestamp: '2019-02-02',
          ask_in: 2500
        })
        expect(PubSub.publish).toHaveBeenCalledWith('attribution:check', result)
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

      expect.assertions(2)

      request.default({
        url: '/event',
        params: {
          eventToken: 'token1'
        }
      }).then(result => {
        expect(result).toEqual({
          adid: '123123',
          timestamp: '2019-02-02'
        })
        expect(PubSub.publish).not.toHaveBeenCalledWith('attribution:check', result)
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

      expect.assertions(2)

      request.default({
        url: '/anything',
        params: {
          bla: 'truc'
        }
      }).then(result => {
        expect(result).toEqual({
          ask_in: 2500
        })
        expect(PubSub.publish).toHaveBeenCalledWith('attribution:check', result)
      })

      return Utils.flushPromises()
        .then(() => {
          mockXHR.onreadystatechange()
        })
    })

    it('checks GDPR-Forget-Me state on any request', () => {

      prepare({
        message: 'bla',
        ask_in: 2500,
        tracking_state: 'opted_out'
      })

      expect.assertions(3)

      request.default({
        url: '/anything',
        params: {
          bla: 'truc'
        }
      }).then(result => {
        expect(result).toEqual({
          ask_in: 2500,
          tracking_state: 'opted_out'
        })
        expect(PubSub.publish).not.toHaveBeenCalledWith('attribution:check', result)
        expect(PubSub.publish).toHaveBeenCalledWith('sdk:gdpr-forget-me', true)
      })

      return Utils.flushPromises()
        .then(() => {
          mockXHR.onreadystatechange()
        })
    })
  })
})
