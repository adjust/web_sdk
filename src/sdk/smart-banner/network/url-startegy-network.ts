import { XhrNetwork } from './xhr-network'
import { UrlStrategy } from './url-strategy/url-strategy'
import { UrlStrategyFactory, UrlStrategyConfig } from './url-strategy/url-strategy-factory'
import { NetworkError } from './errors'

export class UrlStrategyNetwork extends XhrNetwork {
  private static readonly defaultEndpoint = 'https://app.adjust.com'
  private lastSuccessfulEndpoint: string | undefined
  private urlStrategy: UrlStrategy

  constructor({ urlStrategy, urlStrategyConfig }: UrlStrategyNetwork.ConstructorParameters) {
    super(UrlStrategyNetwork.defaultEndpoint)

    this.urlStrategy = urlStrategy || UrlStrategyFactory.create(urlStrategyConfig)
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
