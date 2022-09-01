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
  function incorrectOptionIgnoreMessage(higherPriority: string, lowerPriority: string) {
    Logger.warn(`Both ${higherPriority} and ${lowerPriority} are set in config, ${lowerPriority} will be ignored`)
  }

  export function create(config: UrlStrategyConfig): UrlStrategy {
    const { customUrl, dataResidency, urlStrategy } = config

    if (customUrl) {
      if (dataResidency || urlStrategy) {
        incorrectOptionIgnoreMessage('customUrl', dataResidency ? 'dataResidency' : 'urlStrategy')
      }

      return new UrlStrategy(CustomUrl.preferredUrlsGetter(customUrl))
    } else if (dataResidency) {
      if (urlStrategy) {
        incorrectOptionIgnoreMessage('dataResidency', 'urlStrategy')
      }

      return new UrlStrategy(DataResidency.preferredUrlsGetter(dataResidency))
    } else {
      return new UrlStrategy(BlockedUrlBypass.preferredUrlsGetter(urlStrategy))
    }
  }
}
