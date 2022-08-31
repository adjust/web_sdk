import { BaseUrlsMap } from './url-strategy'

export namespace DataResidency {
  export const EU = 'EU'
  export const TR = 'TR'
  export const US = 'US'

  export type Region = typeof EU | typeof TR | typeof US

  const endpoints: Record<DataResidency.Region, BaseUrlsMap> = {
    [DataResidency.EU]: {
      endpointName: 'EU',
      app: 'https://app.eu.adjust.com',
      gdpr: 'https://gdpr.eu.adjust.com'
    },
    [DataResidency.TR]: {
      endpointName: 'TR',
      app: 'https://app.tr.adjust.com',
      gdpr: 'https://gdpr.tr.adjust.com'
    },
    [DataResidency.US]: {
      endpointName: 'US',
      app: 'https://app.us.adjust.com',
      gdpr: 'https://gdpr.us.adjust.com'
    }
  }

  const getPreferredUrlsWithOption = (endpoints: Record<DataResidency.Region, BaseUrlsMap>, option: DataResidency.Region) => {
    return [endpoints[option]]
  }

  export function preferredUrlsGetter(option: DataResidency.Region, endpointsMap: Record<DataResidency.Region, BaseUrlsMap> = endpoints) {
    return () => getPreferredUrlsWithOption(endpointsMap, option)
  }
}
