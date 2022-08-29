import { UrlStrategy, BaseUrlsMap } from "./url-strategy"

export class BlockedUrlBypass extends UrlStrategy {
  constructor(private option?: BlockedUrlBypass.Strategy) {
    super()
  }

  private endpoints: Record<BlockedUrlBypass.Strategy, BaseUrlsMap> = {
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

  public getPreferredUrls = () => {

    if (this.option === BlockedUrlBypass.India) {
      return [
        this.endpoints[BlockedUrlBypass.India],
        this.endpoints[BlockedUrlBypass.Default]
      ]
    }

    if (this.option === BlockedUrlBypass.China) {
      return [
        this.endpoints[BlockedUrlBypass.China],
        this.endpoints[BlockedUrlBypass.Default]
      ]
    }

    return [
      this.endpoints[BlockedUrlBypass.Default],
      this.endpoints[BlockedUrlBypass.India],
      this.endpoints[BlockedUrlBypass.China]
    ]
  }
}

export namespace BlockedUrlBypass {
  export const Default = 'default'
  export const India = 'india'
  export const China = 'china'

  export type Strategy = typeof Default | typeof India | typeof China
}
