import Logger from '../../../../logger'
import { BaseUrlsMap, UrlStrategy } from '../../../../smart-banner/network/url-strategy/url-strategy'
import { NoConnectionError } from '../../../../smart-banner/network/errors'

jest.mock('../../../../logger')

describe('Abstract UrlStrategy', () => {
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
  let testedUrlStrategy = new UrlStrategy(preferredUrlsMock)
  const sendRequestMock = jest.fn()

  beforeAll(() => {
    jest.spyOn(Logger, 'error')
  })

  afterAll(() => {
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

  describe('', () => {
    beforeAll(() => {
      preferredUrlsMock.mockImplementationOnce(() => urls)
    })

    it('tries to reach next endpoint if could not connect', async () => {
      sendRequestMock
        .mockRejectedValueOnce(NoConnectionError)
        .mockResolvedValueOnce('all good')

      const result = await testedUrlStrategy.retries(sendRequestMock)

      expect(sendRequestMock).toHaveBeenCalledTimes(urls.length)
      expect(Logger.error).toHaveBeenCalledWith(`Failed to connect ${urls[0].endpointName} endpoint`)
      expect(Logger.error).toHaveBeenCalledWith(`Trying ${urls[1].endpointName} one`)
      expect(result).toEqual('all good')
    })

    it('re-throws if there is no available endpoint', async () => {
      sendRequestMock.mockRejectedValue(NoConnectionError)

      await testedUrlStrategy.retries(sendRequestMock)

      expect(sendRequestMock).toHaveBeenCalledTimes(urls.length)
    })

    it('re-throws if other error occured', async () => {

    })
  })
})
