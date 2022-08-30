import Logger from '../../../logger'
import { UrlStrategy } from './url-strategy'
import { BlockedUrlBypass } from './blocked-url-bypass'
import { CustomUrl } from './custom-url'
import { DataResidency } from './data-residency'

export type UrlStrategyConfig = {
  customUrl: string;
  urlStrategy?: never;
  dataResidency?: never;
} | {
  customUrl?: never;
  dataResidency: DataResidency.Region;
  urlStrategy?: never;
} | {
  customUrl?: never;
  dataResidency?: never;
  urlStrategy?: BlockedUrlBypass.Strategy;
}

export namespace UrlStrategyFactory {

  export function create(config: UrlStrategyConfig): UrlStrategy {
    if (config.urlStrategy && config.dataResidency) {
      Logger.warn('Both urlStrategy and dataResidency are set in config, urlStartegy would be ignored')
    }

    if (config.customUrl) {
      return new UrlStrategy(CustomUrl.preferredUrlsGetter(config.customUrl))
    } else if (config.dataResidency) {
      return new UrlStrategy(DataResidency.preferredUrlsGetter(config.dataResidency))
    } else {
      return new UrlStrategy(BlockedUrlBypass.preferredUrlsGetter(config.urlStrategy))
    }
  }
}
