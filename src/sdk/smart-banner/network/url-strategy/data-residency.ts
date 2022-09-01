import { BaseUrlsMap } from './url-strategy'
import { ENDPOINTS } from '../../../constants'

export namespace DataResidency {
  export const EU = 'EU'
  export const TR = 'TR'
  export const US = 'US'

  export type Region = typeof EU | typeof TR | typeof US

  const endpoints: Record<DataResidency.Region, BaseUrlsMap> = {
    [DataResidency.EU]: ENDPOINTS.EU,
    [DataResidency.TR]: ENDPOINTS.TR,
    [DataResidency.US]: ENDPOINTS.US,
  }

  const getPreferredUrlsWithOption = (endpoints: Record<DataResidency.Region, BaseUrlsMap>, option: DataResidency.Region) => {
    return [endpoints[option]]
  }

  export function preferredUrlsGetter(option: DataResidency.Region, endpointsMap: Record<DataResidency.Region, BaseUrlsMap> = endpoints) {
    return () => getPreferredUrlsWithOption(endpointsMap, option)
  }
}
