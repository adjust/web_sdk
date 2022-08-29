import { UrlStrategy, BaseUrlsMap } from "./url-strategy"

export class CustomUrl extends UrlStrategy {
  constructor(private customUrl: string) { super() }

  public getPreferredUrls = () => {
    return [{
      endpointName: `Custom (${this.customUrl})`,
      app: this.customUrl,
      gdpr: this.customUrl
    }]
  }
}
