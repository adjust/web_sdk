import { XhrNetwork } from './xhr-network'
import { UrlStrategy } from './url-strategy/url-strategy'
import { DataResidency } from './url-strategy/data-residency'
import { BlockedUrlBypass } from './url-strategy/blocked-url-bypass'
import { NetworkError } from './errors'

type UrlStrategyConfig = {
  dataResidency?: DataResidency.Region;
  urlStrategy?: never;
} | {
  dataResidency?: never;
  urlStrategy: BlockedUrlBypass.Strategy;
}

export class UrlStrategyNetwork extends XhrNetwork {
  private static readonly defaultEndpoint = 'https://app.adjust.com'
  private lastSuccessfulEndpoint: string | undefined
  private urlStrategy: UrlStrategy

  constructor({ urlStrategy, urlStrategyConfig }: UrlStrategyNetwork.ConstructorParameters) {
    super(UrlStrategyNetwork.defaultEndpoint)

    this.urlStrategy = urlStrategy || this.createUrlStrategy(urlStrategyConfig)
  }

  private createUrlStrategy(config: UrlStrategyConfig): UrlStrategy {
    if (config.dataResidency) {
      return new DataResidency(config.dataResidency)
    } else {
      return new BlockedUrlBypass(config.urlStrategy)
    }
  }

  /**
   * Returns last succesfull endpoint or default (`https://app.adjust.com`) one
   */
  public get endpoint(): string {
    return this.lastSuccessfulEndpoint || UrlStrategyNetwork.defaultEndpoint
  }

  /**
   * Sends a request to provided path choosing origin with UrlStrategy and caches used origin if it was successfully
   * reached
   *
   * @param path
   * @param params non-encoded parameters of the request
   */
  public request<T>(path: string, params?: Record<string, string | number | boolean>): Promise<T> {

    return this.urlStrategy.retries((baseUrlsMap) => {
      super.origin = baseUrlsMap.app

      return super.request(path, params)
        .then((result: T) => {
          this.lastSuccessfulEndpoint = baseUrlsMap.app
          return result
        })
        .catch((err: NetworkError) => {
          this.lastSuccessfulEndpoint = undefined
          throw err
        })
    })
  }
}

namespace UrlStrategyNetwork {

  export type ConstructorParameters = {
    urlStrategy: UrlStrategy;
    urlStrategyConfig?: never;
  } | {
    urlStrategy?: never;
    urlStrategyConfig: UrlStrategyConfig;
  }
}
