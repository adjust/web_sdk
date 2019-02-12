/* eslint-disable */
import request from './request'

function createMockXHR (response, status = 200, statusText = 'OK') {
  return {
    open: jest.fn(),
    send: jest.fn(),
    setRequestHeader: jest.fn(),
    readyState: 4,
    status: status,
    statusText: statusText,
    response: response,
    responseText: JSON.stringify(response)
  }
}

describe('perform api requests', () => {

  const oldXMLHttpRequest = window.XMLHttpRequest
  let mockXHR = null

  afterEach(() => {
    window.XMLHttpRequest = oldXMLHttpRequest
  })

  it('throws failed request', () => {

    mockXHR = createMockXHR({error: 'internal error'}, 500, 'Internal Server error')
    window.XMLHttpRequest = jest.fn(() => mockXHR)

    expect.assertions(1)

    expect(request({
      url: '/some-url',
      params: {}
    })).rejects.toEqual({
      status: 500,
      statusText: 'Internal Server error',
      response: {error: 'internal error'},
      responseText: JSON.stringify({error: 'internal error'})
    })

    mockXHR.onerror()

  })

  it('throws bad request', () => {

    mockXHR = createMockXHR({error: 'bad request'}, 400, 'Bad Request')
    window.XMLHttpRequest = jest.fn(() => mockXHR)

    expect.assertions(1)

    expect(request({
      url: '/some-url',
      params: {}
    })).rejects.toEqual({
      status: 400,
      statusText: 'Bad Request',
      response: {error: 'bad request'},
      responseText: JSON.stringify({error: 'bad request'})
    })

    mockXHR.onreadystatechange()

  })

  describe('resolved requests', () => {

    beforeEach(() => {
      mockXHR = createMockXHR({status: 'success'})
      window.XMLHttpRequest = jest.fn(() => mockXHR)

      jest.spyOn(mockXHR, 'open')
      jest.spyOn(mockXHR, 'setRequestHeader')
      jest.spyOn(mockXHR, 'send')
    })

    it('performs GET request', () => {

      expect.assertions(4)

      expect(request({
        url: '/some-url',
        params: {
          some: 'thing',
          very: 'nice',
          and: {test: 'object'}
        }
      })).resolves.toEqual({
        status: 'success'
      })
      expect(mockXHR.open).toHaveBeenCalledWith('GET', '/some-url?some=thing&very=nice&and=%7B%22test%22%3A%22object%22%7D', true)
      expect(mockXHR.setRequestHeader).toHaveBeenCalledWith('Client-SDK', 'jsTEST')
      expect(mockXHR.send).toHaveBeenCalledWith(undefined)

      mockXHR.onreadystatechange()

    })

    it('excludes empty values from the request params', () => {

      expect.assertions(4)

      expect(request({
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
        status: 'success'
      })
      expect(mockXHR.open).toHaveBeenCalledWith('GET', '/some-url?some=thing&very=nice&zero=0&bla=ble', true)
      expect(mockXHR.setRequestHeader).toHaveBeenCalledWith('Client-SDK', 'jsTEST')
      expect(mockXHR.send).toHaveBeenCalledWith(undefined)

      mockXHR.onreadystatechange()

    })

    it('performs POST request', () => {

      expect.assertions(5)

      expect(request({
        url: '/some-url',
        method: 'POST',
        params: {
          some: 'thing',
          very: 'nice'
        }
      })).resolves.toEqual({
        status: 'success'
      })
      expect(mockXHR.open).toHaveBeenCalledWith('POST', '/some-url', true)
      expect(mockXHR.setRequestHeader).toHaveBeenCalledWith('Client-SDK', 'jsTEST')
      expect(mockXHR.setRequestHeader).toHaveBeenCalledWith('Content-type', 'application/x-www-form-urlencoded')
      expect(mockXHR.send).toHaveBeenCalledWith('some=thing&very=nice')

      mockXHR.onreadystatechange()

    })
  })
})
