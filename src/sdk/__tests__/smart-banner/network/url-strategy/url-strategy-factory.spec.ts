import Logger from '../../../../logger'
import * as UrlStrategyModule from '../../../../smart-banner/network/url-strategy/url-strategy'
import { UrlStrategyFactory } from '../../../../smart-banner/network/url-strategy/url-strategy-factory'
import { BlockedUrlBypass } from '../../../../smart-banner/network/url-strategy//blocked-url-bypass'
import { CustomUrl } from '../../../../smart-banner/network/url-strategy//custom-url'
import { DataResidency } from '../../../../smart-banner/network/url-strategy//data-residency'

jest.mock('../../../../logger')

describe('UrlStrategyFactory', () => {
  const urlStrategyConstructorMock = jest.fn()

  const urlsMap = { endpointName: 'foo.bar', app: 'app', gdpr: 'gdpr' }

  const customUrlMock = () => [urlsMap]
  const dataResidencyMock = () => [urlsMap]
  const blockedUrlBypassMock = () => [urlsMap]

  beforeAll(() => {
    jest.spyOn(UrlStrategyModule, 'UrlStrategy').mockImplementation(urlStrategyConstructorMock)
    jest.spyOn(CustomUrl, 'preferredUrlsGetter').mockImplementation(() => customUrlMock)
    jest.spyOn(DataResidency, 'preferredUrlsGetter').mockImplementation(() => dataResidencyMock)
    jest.spyOn(BlockedUrlBypass, 'preferredUrlsGetter').mockImplementation(() => blockedUrlBypassMock)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('creates CustomStrategy if customUrl is set in config', () => {
    UrlStrategyFactory.create({ customUrl: 'custom.url' })

    expect(CustomUrl.preferredUrlsGetter).toHaveBeenCalledWith('custom.url')
    expect(urlStrategyConstructorMock).toHaveBeenCalledWith(customUrlMock)
  })

  it.each([
    DataResidency.EU,
    DataResidency.TR,
    DataResidency.US
  ])('creates DataResidency if dataResidency is set in config', (region: DataResidency.Region) => {
    UrlStrategyFactory.create({ dataResidency: region })

    expect(DataResidency.preferredUrlsGetter).toHaveBeenCalledWith(region)
    expect(urlStrategyConstructorMock).toHaveBeenCalledWith(dataResidencyMock)
  })

  it.each([
    BlockedUrlBypass.China,
    BlockedUrlBypass.India
  ])('creates BlockedUrlBypass if urlStrategy is set in config', (strategy: BlockedUrlBypass.Strategy) => {
    UrlStrategyFactory.create({ urlStrategy: strategy })

    expect(BlockedUrlBypass.preferredUrlsGetter).toHaveBeenCalledWith(strategy)
    expect(urlStrategyConstructorMock).toHaveBeenCalledWith(blockedUrlBypassMock)
  })

  it('creates BlockedUrlBypass if config is empty', () => {
    UrlStrategyFactory.create({})

    expect(BlockedUrlBypass.preferredUrlsGetter).toHaveBeenCalled()
    expect(urlStrategyConstructorMock).toHaveBeenCalledWith(blockedUrlBypassMock)
  })

  it.each([
    [BlockedUrlBypass.China, DataResidency.EU],
    [BlockedUrlBypass.China, DataResidency.US],
    [BlockedUrlBypass.China, DataResidency.TR],
    [BlockedUrlBypass.India, DataResidency.EU],
    [BlockedUrlBypass.India, DataResidency.US],
    [BlockedUrlBypass.India, DataResidency.TR]
  ])('prefers DataResidency and prints warning if both dataResidency and urlStartegy are set in config', (strategy, region) => {
    jest.spyOn(Logger, 'warn')

    UrlStrategyFactory.create({ urlStrategy: strategy, dataResidency: region } as any)

    expect(DataResidency.preferredUrlsGetter).toHaveBeenCalledWith(region)
    expect(urlStrategyConstructorMock).toHaveBeenCalledWith(dataResidencyMock)
    expect(Logger.warn).toHaveBeenCalledWith('Both dataResidency and urlStrategy are set in config, urlStrategy will be ignored')
  })
})
