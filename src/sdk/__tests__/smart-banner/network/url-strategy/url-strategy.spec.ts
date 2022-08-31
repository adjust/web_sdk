import Logger from '../../../../logger'
import { BaseUrlsMap, UrlStrategy } from '../../../../smart-banner/network/url-strategy/url-strategy'
import { NoConnectionError } from '../../../../smart-banner/network/errors'

jest.mock('../../../../logger')

describe('UrlStrategy', () => {
  const urls: BaseUrlsMap[] = [{
    endpointName: 'foo',
    app: 'foo',
    gdpr: 'foo'
  }, {
    endpointName: 'bar',
    app: 'bar',
    gdpr: 'bar'
  }]

  const preferredUrlsMock = jest.fn()
  const testedUrlStrategy = new UrlStrategy(preferredUrlsMock)
  const sendRequestMock = jest.fn()

  beforeAll(() => {
    jest.spyOn(Logger, 'error')
    jest.spyOn(Logger, 'log')
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('preferredUrls sanity check', () => {
    it('throws error if there is no enpoint defined', async () => {
      preferredUrlsMock.mockImplementation(() => undefined)

      expect.assertions(2)

      try {
        await testedUrlStrategy.retries(sendRequestMock)
      } catch (err) {
        expect(err).toBe(UrlStrategy.NoPreferredUrlsDefinedError)
        expect(Logger.error).toHaveBeenCalledWith(UrlStrategy.NoPreferredUrlsDefinedError.message)
      }
    })

    it('throws error if array of endpoints is empty', async () => {
      preferredUrlsMock.mockImplementation(() => [])

      expect.assertions(2)

      try {
        await testedUrlStrategy.retries(sendRequestMock)
      } catch (err) {
        expect(err).toBe(UrlStrategy.NoPreferredUrlsDefinedError)
        expect(Logger.error).toHaveBeenCalledWith(UrlStrategy.NoPreferredUrlsDefinedError.message)
      }
    })
  })

  describe('retries functionality', () => {
    beforeAll(() => {
      preferredUrlsMock.mockImplementation(() => urls)
    })

    it('tries to reach next endpoint if could not connect', async () => {
      sendRequestMock
        .mockRejectedValueOnce(NoConnectionError)
        .mockResolvedValueOnce('all good')

      expect.assertions(4)

      const result = await testedUrlStrategy.retries(sendRequestMock)

      expect(sendRequestMock).toHaveBeenCalledTimes(urls.length)
      expect(Logger.log).toHaveBeenCalledWith(`Failed to connect ${urls[0].endpointName} endpoint`)
      expect(Logger.log).toHaveBeenCalledWith(`Trying ${urls[1].endpointName} one`)
      expect(result).toEqual('all good')
    })

    it('re-throws if there is no available endpoint', async () => {
      sendRequestMock.mockRejectedValue(NoConnectionError)

      expect.assertions(6)

      try {
        await testedUrlStrategy.retries(sendRequestMock)
      }
      catch (err) {
        expect(err).toEqual(NoConnectionError)
      }

      expect(sendRequestMock).toHaveBeenCalledTimes(urls.length)
      expect(Logger.log).toHaveBeenCalledWith(`Failed to connect ${urls[0].endpointName} endpoint`)
      expect(Logger.log).toHaveBeenCalledWith(`Trying ${urls[1].endpointName} one`)
      expect(Logger.log).toHaveBeenCalledWith(`Failed to connect ${urls[1].endpointName} endpoint`)
      expect(testedUrlStrategy.retries).toThrow()
    })

    it('re-throws if other error occured', async () => {
      sendRequestMock.mockRejectedValue({ status: 404, message: 'not found' })

      expect.assertions(3)

      try {
        await testedUrlStrategy.retries(sendRequestMock)
      }
      catch (err) {
        expect(err).toEqual({ status: 404, message: 'not found' })
      }

      expect(sendRequestMock).toHaveBeenCalledTimes(1)
      expect(testedUrlStrategy.retries).toThrow()
    })
  })
})
