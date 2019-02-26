/* eslint-disable */
import * as Api from '../api'
import * as Attribution from '../attribution'

function createMockXHR (response, status = 200, statusText = 'OK') {
  return {
    open: jest.fn(),
    send: jest.fn(),
    setRequestHeader: jest.fn(),
    readyState: 4,
    status: status,
    statusText: statusText,
    response: JSON.stringify(response),
    responseText: JSON.stringify(response)
  }
}

describe('perform api requests', () => {

  const oldXMLHttpRequest = window.XMLHttpRequest
  let mockXHR = null

  afterEach(() => {
    window.XMLHttpRequest = oldXMLHttpRequest
  })

  it('rejects when network issue', () => {

    mockXHR = createMockXHR({error: 'connection failed'}, 500, 'Connection failed')
    window.XMLHttpRequest = jest.fn(() => mockXHR)

    expect.assertions(1)

    expect(Api.request({
      url: '/some-url',
      params: {}
    })).rejects.toEqual({
      status: 500,
      statusText: 'Connection failed',
      response: {error: 'Unknown error, retry will follow'},
      responseText: JSON.stringify({error: 'Unknown error, retry will follow'})
    })

    mockXHR.onerror()

  })

  it('rejects when status 0', () => {

    mockXHR = createMockXHR('', 0, 'Network issue')
    window.XMLHttpRequest = jest.fn(() => mockXHR)

    expect.assertions(1)

    expect(Api.request({
      url: '/some-url',
      params: {}
    })).rejects.toEqual({
      status: 0,
      statusText: 'Network issue',
      response: {error: 'Unknown error, retry will follow'},
      responseText: JSON.stringify({error: 'Unknown error, retry will follow'})
    })

    mockXHR.onreadystatechange()

  })

  it('resolves error returned from server (because of retry mechanism)', () => {

    mockXHR = createMockXHR({error: 'some error'}, 400, 'Some error')
    window.XMLHttpRequest = jest.fn(() => mockXHR)

    expect.assertions(1)

    expect(Api.request({
      url: '/some-url',
      params: {}
    })).resolves.toEqual({error: 'some error'})

    mockXHR.onreadystatechange()

  })

  it('reject badly formed json from server', () => {

    mockXHR = createMockXHR('bla bla not json', 200, 'OK')
    window.XMLHttpRequest = jest.fn(() => mockXHR)

    expect.assertions(1)

    expect(Api.request({
      url: '/some-url',
      params: {}
    })).rejects.toEqual({
      status: 200,
      statusText: 'OK',
      response: {error: 'Unknown error, retry will follow'},
      responseText: JSON.stringify({error: 'Unknown error, retry will follow'})
    })

    mockXHR.onreadystatechange()

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

      expect(Api.request({
        url: '/some-url',
        params: {
          some: 'thing',
          very: 'nice',
          and: {test: 'object'}
        }
      })).resolves.toEqual(response)
      expect(mockXHR.open).toHaveBeenCalledWith('GET', '/some-url?some=thing&very=nice&and=%7B%22test%22%3A%22object%22%7D', true)
      expect(mockXHR.setRequestHeader).toHaveBeenCalledWith('Client-SDK', 'jsTEST')
      expect(mockXHR.send).toHaveBeenCalledWith(undefined)

      mockXHR.onreadystatechange()

    })

    it('excludes empty values from the request params', () => {

      expect.assertions(4)

      expect(Api.request({
        url: '/some-url',
        params: {
          base: {
            some: 'thing',
            very: 'nice',
            empty: '',
            empty2: null,
          },
          other: {
            zero: 0,
            empty3: undefined,
            bla: 'ble',
            obj: {}
          }
        }
      })).resolves.toEqual(response)
      expect(mockXHR.open).toHaveBeenCalledWith('GET', '/some-url?some=thing&very=nice&zero=0&bla=ble', true)
      expect(mockXHR.setRequestHeader).toHaveBeenCalledWith('Client-SDK', 'jsTEST')
      expect(mockXHR.send).toHaveBeenCalledWith(undefined)

      mockXHR.onreadystatechange()

    })

    it('performs POST request', () => {

      expect.assertions(5)

      expect(Api.request({
        url: '/some-url',
        method: 'POST',
        params: {
          some: 'thing',
          very: 'nice'
        }
      })).resolves.toEqual(response)
      expect(mockXHR.open).toHaveBeenCalledWith('POST', '/some-url', true)
      expect(mockXHR.setRequestHeader).toHaveBeenCalledWith('Client-SDK', 'jsTEST')
      expect(mockXHR.setRequestHeader).toHaveBeenCalledWith('Content-type', 'application/x-www-form-urlencoded')
      expect(mockXHR.send).toHaveBeenCalledWith('some=thing&very=nice')

      mockXHR.onreadystatechange()

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

      expect(Api.request({
        url: '/session',
        params: {
          base: {
            some: 'thing',
            very: 'nice'
          },
          other: {
            and: {test: 'object'}
          }
        }
      })).resolves.toEqual({
        adid: '123123',
        timestamp: '2019-02-02'
      })

      mockXHR.onreadystatechange()
    })

    it('returns response with whitelisted attributes for attribution endpoint', () => {

      prepare({
        adid: '123123',
        some: 'thing',
        attribution: 'thing',
        message: 'bla',
        timestamp: '2019-02-02'
      })

      expect(Api.request({
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

      mockXHR.onreadystatechange()
    })

  })

  describe('check attribution response', () => {

    const prepare = (response) => {
      mockXHR = createMockXHR(response)
      window.XMLHttpRequest = jest.fn(() => mockXHR)
    }

    beforeAll(() => {
      jest.spyOn(Attribution, 'checkAttribution')
    })

    afterEach(() => {
      jest.clearAllMocks()
    })

    afterAll(() => {
      jest.restoreAllMocks()
    })

    it('checks attribution info on session request with ask_in', () => {

      prepare({
        adid: '123123',
        message: 'bla',
        timestamp: '2019-02-02',
        ask_in: 2500
      })

      expect.assertions(2)

      Api.request({
        url: '/session',
        params: {
          app_token: '123abc',
          environment: 'sandbox',
          os_name: 'ios'
        }
      }).then(result => {
        expect(result).toEqual({
          adid: '123123',
          timestamp: '2019-02-02',
          ask_in: 2500
        })
        expect(Attribution.checkAttribution).toHaveBeenCalledWith(
          result, {
          app_token: '123abc',
          environment: 'sandbox',
          os_name: 'ios'
        })
      })

      mockXHR.onreadystatechange()

    })

    it('does not check attribution info on session request without ask_in', () => {

      prepare({
        adid: '123123',
        message: 'bla',
        timestamp: '2019-02-02'
      })

      expect.assertions(2)

      Api.request({
        url: '/session',
        params: {
          app_token: '123abc',
          environment: 'sandbox',
          os_name: 'ios'
        }
      }).then(result => {
        expect(result).toEqual({
          adid: '123123',
          timestamp: '2019-02-02'
        })
        expect(Attribution.checkAttribution).not.toHaveBeenCalled()
      })

      mockXHR.onreadystatechange()

    })

    it('checks attribution info on any request with ask_in', () => {

      prepare({
        message: 'bla',
        ask_in: 2500
      })

      expect.assertions(2)

      Api.request({
        url: '/anything',
        params: {
          app_token: '123abc'
        }
      }).then(result => {
        expect(result).toEqual({
          ask_in: 2500
        })
        expect(Attribution.checkAttribution).toHaveBeenCalledWith(
          result, {
            app_token: '123abc'
          })
      })

      mockXHR.onreadystatechange()

    })
  })
})
