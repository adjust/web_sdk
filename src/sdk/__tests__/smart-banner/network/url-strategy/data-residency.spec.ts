import { DataResidency } from '../../../../smart-banner/network/url-strategy/data-residency'
import { BaseUrlsMap } from '../../../../smart-banner/network/url-strategy/url-strategy'

describe('DataResidency', () => {

  const testEndpoints: Record<DataResidency.Region, BaseUrlsMap> = {
    [DataResidency.EU]: {
      endpointName: 'EU',
      app: 'app.eu',
      gdpr: 'gdpr.eu'
    },
    [DataResidency.TR]: {
      endpointName: 'TR',
      app: 'app.tr',
      gdpr: 'gdpr.tr'
    },
    [DataResidency.US]: {
      endpointName: 'US',
      app: 'app.us',
      gdpr: 'gdpr.us'
    }
  }

  it.each([
    DataResidency.EU,
    DataResidency.TR,
    DataResidency.US
  ])('returns urls map depending on region', (dataResidency: DataResidency.Region) => {
    const resultingFn = DataResidency.preferredUrlsGetter(dataResidency, testEndpoints)

    expect(resultingFn).toEqual(expect.any(Function))

    const baseUrlsMap = resultingFn()

    expect(baseUrlsMap.length).toBe(1)
    expect(baseUrlsMap[0]).toEqual(testEndpoints[dataResidency])
  })
})
