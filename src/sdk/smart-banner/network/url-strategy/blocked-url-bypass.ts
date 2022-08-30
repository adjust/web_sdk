import { BaseUrlsMap } from "./url-strategy"

export namespace BlockedUrlBypass {
  export const Default = 'default'
  export const India = 'india'
  export const China = 'china'

  export type Strategy = typeof Default | typeof India | typeof China

  let endpoints: Record<BlockedUrlBypass.Strategy, BaseUrlsMap> = {
    [BlockedUrlBypass.Default]: {
      endpointName: 'Default',
      app: 'https://app.adjust.com',
      gdpr: 'https://gdpr.adjust.com'
    },
    [BlockedUrlBypass.India]: {
      endpointName: 'Indian',
      app: 'https://app.adjust.net.in',
      gdpr: 'https://gdpr.adjust.net.in'
    },
    [BlockedUrlBypass.China]: {
      endpointName: 'Chinese',
      app: 'https://app.adjust.world',
      gdpr: 'https://gdpr.adjust.world'
    }
  }

  let getPreferredUrlsWithOption = (option?: BlockedUrlBypass.Strategy) => {

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

  export function preferredUrlsGetter(option?: BlockedUrlBypass.Strategy) {
    return () => getPreferredUrlsWithOption(option)
  }
}
