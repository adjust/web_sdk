import { BaseUrlsMap } from './url-strategy'
import { ENDPOINTS } from '../../../constants'

export namespace BlockedUrlBypass {
  export const Default = 'default'
  export const India = 'india'
  export const China = 'china'

  export type Strategy = typeof Default | typeof India | typeof China

  const endpoints: Record<BlockedUrlBypass.Strategy, BaseUrlsMap> = {
    [BlockedUrlBypass.Default]: ENDPOINTS.default,
    [BlockedUrlBypass.India]: ENDPOINTS.india,
    [BlockedUrlBypass.China]: ENDPOINTS.china,
  }

  const getPreferredUrlsWithOption = (endpoints: Record<BlockedUrlBypass.Strategy, BaseUrlsMap>, option?: BlockedUrlBypass.Strategy) => {

    if (option === BlockedUrlBypass.India) {
      return [
        endpoints[BlockedUrlBypass.India],
        endpoints[BlockedUrlBypass.Default]
      ]
    }

    if (option === BlockedUrlBypass.China) {
      return [
        endpoints[BlockedUrlBypass.China],
        endpoints[BlockedUrlBypass.Default]
      ]
    }

    return [
      endpoints[BlockedUrlBypass.Default],
      endpoints[BlockedUrlBypass.India],
      endpoints[BlockedUrlBypass.China]
    ]
  }

  export function preferredUrlsGetter(option?: BlockedUrlBypass.Strategy, endpointsMap: Record<BlockedUrlBypass.Strategy, BaseUrlsMap> = endpoints) {
    return () => getPreferredUrlsWithOption(endpointsMap, option)
  }
}
