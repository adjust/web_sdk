import { Network } from '../../../smart-banner/network'
import { NetworkWithUrlStrategy } from '../../../smart-banner/network/url-startegy-network'
import { UrlStrategy } from '../../../smart-banner/network/url-strategy/url-strategy'
import { UrlStrategyFactory } from '../../../smart-banner/network/url-strategy/url-strategy-factory'

jest.mock('../../../logger')

describe('NetworkWithUrlStrategy', () => {

  const baseUrls = {
    endpointName: 'test',
    app: 'app.test',
    gdpr: 'gdpr.test'
  }

  const urlStrategyMock = new UrlStrategy(() => [baseUrls])

  const networkMock: Network = {
    endpoint: '',
    request: (path: string, params?: Record<string, string | number | boolean>) => Promise.resolve('all good') as any
  }

  describe('instantiation', () => {

    beforeAll(() => {
      jest.resetAllMocks()
      jest.spyOn(UrlStrategyFactory, 'create').mockImplementation(() => urlStrategyMock)
    })

    afterEach(() => {
      jest.clearAllMocks()
    })

    it('could be instantiated with provided UrlStrategy', () => {
      const network = new NetworkWithUrlStrategy(networkMock, { urlStrategy: urlStrategyMock })

      expect(UrlStrategyFactory.create).not.toHaveBeenCalled()
      expect(network).toBeInstanceOf(NetworkWithUrlStrategy)
    })

    it('could be instantiated with UrlStrategyConfig', () => {
      const urlStrategyConfig = {}
      const network = new NetworkWithUrlStrategy(networkMock, { urlStrategyConfig })

      expect(UrlStrategyFactory.create).toHaveBeenCalledWith(urlStrategyConfig)
      expect(network).toBeInstanceOf(NetworkWithUrlStrategy)
    })
  })

  describe('request', () => {
    beforeAll(() => {
      jest.spyOn(networkMock, 'request')
      jest.spyOn(urlStrategyMock, 'retries')
    })

    afterEach(() => {
      jest.clearAllMocks()
    })

    it('sends request with inner Network instance and uses UrlStrategy retries', async () => {
      expect.assertions(3)

      const network = new NetworkWithUrlStrategy(networkMock, { urlStrategy: urlStrategyMock })
      const result = await network.request('/whatever', { foo: 'bar', n: 42 })

      expect(result).toEqual('all good')
      expect(urlStrategyMock.retries).toHaveBeenCalled()
      expect(networkMock.request).toHaveBeenCalledWith('/whatever', { foo: 'bar', n: 42 })
    })
  })

  describe('endpoint property', () => {
    beforeAll(() => {
      jest.spyOn(networkMock, 'request')
      jest.spyOn(urlStrategyMock, 'retries')
    })

    afterEach(() => {
      jest.clearAllMocks()
    })

    const defaultEndpoint = 'https://app.adjust.com'

    it('returns default endpoint before the first request', () => {
      const network = new NetworkWithUrlStrategy(networkMock, { urlStrategy: urlStrategyMock })

      expect(network.endpoint).toEqual(defaultEndpoint)
    })

    it('returns last endpoint after successful request', async () => {
      const network = new NetworkWithUrlStrategy(networkMock, { urlStrategy: urlStrategyMock })

      await network.request('/whatever')

      expect(network.endpoint).toEqual(baseUrls.app)
    })

    it('returns default endpoint after failed request', async () => {
      const network = new NetworkWithUrlStrategy(networkMock, { urlStrategy: urlStrategyMock })
      jest.spyOn(networkMock, 'request').mockRejectedValueOnce('Error!')

      try {
        await network.request('/whatever')
      } catch (err) {

      }

      expect(network.endpoint).toEqual(defaultEndpoint)
    })
  })
})
