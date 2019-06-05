/* eslint-disable */
import * as request from '../request'
import * as Time from '../time'
import * as ActivityState from '../activity-state'
import * as PubSub from '../pub-sub'
import {flushPromises, createMockXHR} from './_helper'

jest.mock('../logger')

describe('perform api requests', () => {

  const gpsAdid = '&gps_adid=some-uuid'
  const oldXMLHttpRequest = window.XMLHttpRequest
  let mockXHR = null

  beforeAll(() => {
    jest.spyOn(Time, 'getTimestamp').mockReturnValue('some-time')
    ActivityState.default.current = {uuid: 'some-uuid'}
  })
  afterEach(() => {
    window.XMLHttpRequest = oldXMLHttpRequest
  })
  afterAll(() => {
    jest.restoreAllMocks()
  })

  it('rejects when network issue', () => {

    mockXHR = createMockXHR({error: 'connection failed'}, 500, 'Connection failed')
    window.XMLHttpRequest = jest.fn(() => mockXHR)

    expect.assertions(1)

    expect(request.default({
      url: '/some-url',
      params: {}
    })).rejects.toEqual({
      status: 500,
      statusText: 'Connection failed',
      response: {error: 'Unknown error, retry will follow'},
      responseText: JSON.stringify({error: 'Unknown error, retry will follow'})
    })

    return flushPromises()
      .then(() => {
        mockXHR.onerror()
      })
  })

  it('rejects when status 0', () => {

    mockXHR = createMockXHR('', 0, 'Network issue')
    window.XMLHttpRequest = jest.fn(() => mockXHR)

    expect.assertions(1)

    expect(request.default({
      url: '/some-url',
      params: {}
    })).rejects.toEqual({
      status: 0,
      statusText: 'Network issue',
      response: {error: 'Unknown error, retry will follow'},
      responseText: JSON.stringify({error: 'Unknown error, retry will follow'})
    })

    return flushPromises()
      .then(() => {
        mockXHR.onreadystatechange()
      })
  })

  it('resolves error returned from server (because of retry mechanism)', () => {

    mockXHR = createMockXHR({error: 'some error'}, 400, 'Some error')
    window.XMLHttpRequest = jest.fn(() => mockXHR)

    expect.assertions(1)

    expect(request.default({
      url: '/some-url',
      params: {}
    })).resolves.toEqual({error: 'some error'})

    return flushPromises()
      .then(() => {
        mockXHR.onreadystatechange()
      })
  })

  it('reject badly formed json from server', () => {

    mockXHR = createMockXHR('bla bla not json', 200, 'OK')
    window.XMLHttpRequest = jest.fn(() => mockXHR)

    expect.assertions(1)

    expect(request.default({
      url: '/some-url',
      params: {}
    })).rejects.toEqual({
      status: 200,
      statusText: 'OK',
      response: {error: 'Unknown error, retry will follow'},
      responseText: JSON.stringify({error: 'Unknown error, retry will follow'})
    })

    return flushPromises()
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
      mockXHR = createMockXHR(response)
      window.XMLHttpRequest = jest.fn(() => mockXHR)

      jest.spyOn(mockXHR, 'open')
      jest.spyOn(mockXHR, 'setRequestHeader')
      jest.spyOn(mockXHR, 'send')
    })

    it('performs GET request', () => {

      expect.assertions(4)

      expect(request.default({
        url: '/some-url',
        params: {
          appToken: 'cdf123',
          osName: 'macos',
          eventToken: '567abc',
          some: 'thing',
          very: 'nice',
          and: {test: 'object'}
        }
      })).resolves.toEqual(response)

      return flushPromises()
        .then(() => {

          expect(mockXHR.open).toHaveBeenCalledWith('GET', '/some-url?created_at=some-time&sent_at=some-time&app_token=cdf123&os_name=macos&event_token=567abc&some=thing&very=nice&and=%7B%22test%22%3A%22object%22%7D&web_uuid=some-uuid' + gpsAdid, true)
          expect(mockXHR.setRequestHeader).toHaveBeenCalledWith('Client-SDK', 'jsTEST')
          expect(mockXHR.send).toHaveBeenCalledWith(undefined)

          mockXHR.onreadystatechange()
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

      return flushPromises()
        .then(() => {

          expect(mockXHR.open).toHaveBeenCalledWith('GET', '/some-url?created_at=some-time&sent_at=some-time&some=thing&very=nice&zero=0&bla=ble&web_uuid=some-uuid' + gpsAdid, true)
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

      return flushPromises()
        .then(() => {

          expect(mockXHR.open).toHaveBeenCalledWith('POST', '/some-url', true)
          expect(mockXHR.setRequestHeader).toHaveBeenCalledWith('Client-SDK', 'jsTEST')
          expect(mockXHR.setRequestHeader).toHaveBeenCalledWith('Content-type', 'application/x-www-form-urlencoded')
          expect(mockXHR.send).toHaveBeenCalledWith('created_at=some-time&sent_at=some-time&some=thing&very=nice&web_uuid=some-uuid' + gpsAdid)

          mockXHR.onreadystatechange()
        })
    })
  })

  describe('filter response returned to client', () => {

    const prepare = (response) => {
      mockXHR = createMockXHR(response)
      window.XMLHttpRequest = jest.fn(() => mockXHR)
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

      return flushPromises()
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

      return flushPromises()
        .then(() => {
          mockXHR.onreadystatechange()
        })
    })
  })

  describe('response interception', () => {

    const prepare = (response) => {
      mockXHR = createMockXHR(response)
      window.XMLHttpRequest = jest.fn(() => mockXHR)
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
        url: '/session',
        params: {
          appToken: '123abc',
          environment: 'sandbox',
          osName: 'ios'
        }
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

      return flushPromises()
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
        url: '/session',
        params: {
          appToken: '123abc',
          environment: 'sandbox',
          osName: 'ios'
        }
      }).then(result => {
        expect(result).toEqual({
          adid: '123123',
          timestamp: '2019-02-02',
          ask_in: 2500
        })
        expect(PubSub.publish).toHaveBeenCalledWith('attribution:check', result)
      })

      return flushPromises()
        .then(() => {
          mockXHR.onreadystatechange()
        })
    })

    it('checks attribution info on session request without ask_in and no stored attribution', () => {

      prepare({
        adid: '123123',
        message: 'bla',
        timestamp: '2019-02-02',
      })

      expect.assertions(2)

      request.default({
        url: '/session',
        params: {
          appToken: '123abc',
          environment: 'sandbox',
          osName: 'ios'
        }
      }).then(result => {
        expect(result).toEqual({
          adid: '123123',
          timestamp: '2019-02-02'
        })
        expect(PubSub.publish).toHaveBeenCalledWith('attribution:check', result)
      })

      return flushPromises()
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
          appToken: '123abc',
          environment: 'sandbox',
          osName: 'ios'
        }
      }).then(result => {
        expect(result).toEqual({
          adid: '123123',
          timestamp: '2019-02-02'
        })
        expect(PubSub.publish).not.toHaveBeenCalledWith('attribution:check', result)
      })

      return flushPromises()
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
          appToken: '123abc'
        }
      }).then(result => {
        expect(result).toEqual({
          ask_in: 2500
        })
        expect(PubSub.publish).toHaveBeenCalledWith('attribution:check', result)
      })

      return flushPromises()
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
          appToken: '123abc'
        }
      }).then(result => {
        expect(result).toEqual({
          ask_in: 2500,
          tracking_state: 'opted_out'
        })
        expect(PubSub.publish).not.toHaveBeenCalledWith('attribution:check', result)
        expect(PubSub.publish).toHaveBeenCalledWith('sdk:gdpr-forget-me', true)
      })

      return flushPromises()
        .then(() => {
          mockXHR.onreadystatechange()
        })
    })
  })
})
