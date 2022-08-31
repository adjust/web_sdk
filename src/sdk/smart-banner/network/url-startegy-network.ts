import { NetworkDecorator, Network } from './network'
import { UrlStrategy } from './url-strategy/url-strategy'
import { UrlStrategyFactory, UrlStrategyConfig } from './url-strategy/url-strategy-factory'
import { NetworkError } from './errors'

export class NetworkWithUrlStrategy extends NetworkDecorator {
  private static readonly defaultEndpoint = 'https://app.adjust.com'
  private lastSuccessfulEndpoint: string | undefined
  private urlStrategy: UrlStrategy

  constructor(network: Network, { urlStrategy, urlStrategyConfig }: NetworkWithUrlStrategy.UrlStrategyParameters) {
    super(network)

    this.urlStrategy = urlStrategy || UrlStrategyFactory.create(urlStrategyConfig)
  }

  /**
   * Returns last succesfull endpoint or default (`https://app.adjust.com`) one
   */
  public get endpoint(): string {
    return this.lastSuccessfulEndpoint || NetworkWithUrlStrategy.defaultEndpoint
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
      this.network.endpoint = baseUrlsMap.app

      return this.network.request(path, params)
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

namespace NetworkWithUrlStrategy {
  export type UrlStrategyParameters = {
    urlStrategy: UrlStrategy;
    urlStrategyConfig?: never;
  } | {
    urlStrategy?: never;
    urlStrategyConfig: UrlStrategyConfig;
  }
}
