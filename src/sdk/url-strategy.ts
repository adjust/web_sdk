import Config from './config'
import Logger from './logger'
import {
  ENDPOINTS,
  BASE_URL_PREFIX,
  GDPR_URL_PREFIX,
  BASE_URL_NO_SUB_DOMAIN_PREFIX
} from './constants'

export interface UrlStrategyConfig {
  /** The country or countries of data residence, or the endpoints to which you want to send SDK traffic. */
  domains: Array<string>;

  /** Whether the source should prefix a subdomain. */
  useSubdomains: boolean;

  /** Whether the domain should be used for data residency. */
  isDataResidency?: boolean;
}

function getDefaultUrlStrategyConfig(endpoints: Record<Endpoints, string>) {
  return {
    domains: [endpoints.default, endpoints.world],
    useSubdomains: true,
    isDataResidency: false
  }
}

enum UrlStrategy {
  Default = 'default',
  India = 'india',
  China = 'china'
}

enum DataResidency {
  EU = 'EU',
  TR = 'TR',
  US = 'US'
}

type BaseUrlsMap = {
  app: string;
  gdpr: string;
}

function incorrectOptionIgnoredMessage(higherPriority: string, lowerPriority: string) {
  Logger.warn(`Both ${higherPriority} and ${lowerPriority} are set in config, ${lowerPriority} will be ignored`)
}

/**
 * In case if deprecated parameters or no urlStrategy provided returns the most appropriate UrlStrategyConfig,
 * and `null` otherwise
 */
function transfromDeprecatedParamsToUrlStrategyConfig(endpoints: Record<Endpoints, string>): UrlStrategyConfig | null {
  const { customUrl, urlStrategy, dataResidency } = Config.getCustomConfig()

  if (customUrl) { // If custom URL is set then send all requests there
    Logger.warn('customUrl is deprecated, use urlStrategy instead')

    if (dataResidency || urlStrategy) {
      incorrectOptionIgnoredMessage('customUrl', dataResidency ? 'dataResidency' : 'urlStrategy')
    }

    return { domains: [customUrl], useSubdomains: false, isDataResidency: false }
  }

  if (dataResidency && urlStrategy) {
    incorrectOptionIgnoredMessage('dataResidency', 'urlStrategy')
  }

  if (dataResidency) {
    Logger.warn('dataResidency is deprecated, use urlStrategy instead')

    return { domains: [endpoints[dataResidency]], useSubdomains: true, isDataResidency: true }
  }

  if (typeof urlStrategy === 'string') {
    Logger.warn('urlStrategy string literals (\'china\' and \'india\') are deprected, use UrlStartegyConfig instead')

    if (urlStrategy === UrlStrategy.India) {
      return {
        domains: [endpoints.india, endpoints.default],
        useSubdomains: true,
        isDataResidency: false
      }
    }

    if (urlStrategy === UrlStrategy.China) {
      return {
        domains: [endpoints.china, endpoints.default],
        useSubdomains: true,
        isDataResidency: false
      }
    }
  }

  if (!urlStrategy) {
    return getDefaultUrlStrategyConfig(endpoints)
  }

  return null
}

/**
 * Checks if passed UrlStrategyConfig is valid and returns it, returns `DEFAULT_URL_STRATEGY_CONFIG` otherwise
 */
function validateUrlStrategyConfig(endpoints: Record<Endpoints, string>): UrlStrategyConfig {
  const { urlStrategy } = Config.getCustomConfig()

  if (urlStrategy && typeof urlStrategy === 'object') {
    const config = urlStrategy as UrlStrategyConfig;

    if (!config.domains || !Array.isArray(config.domains) || config.domains.length < 1) {
      Logger.warn('Invalid urlStartegy: `domains` should be a non-empty array')

      return getDefaultUrlStrategyConfig(endpoints)
    }

    return { domains: config.domains, useSubdomains: !!config.useSubdomains, isDataResidency: !!config.isDataResidency }
  }

  return getDefaultUrlStrategyConfig(endpoints)
}

function getUrlStrategyConfig(endpoints: Record<Endpoints, string>): UrlStrategyConfig {
  return transfromDeprecatedParamsToUrlStrategyConfig(endpoints) || validateUrlStrategyConfig(endpoints)
}

interface BaseUrlsIterator extends Iterator<BaseUrlsMap> {
  reset: () => void;
}

function getPreferredUrls(endpoints: Record<Endpoints, string>): BaseUrlsMap[] {
  const urlStrategyConfig: UrlStrategyConfig = getUrlStrategyConfig(endpoints)

  const urls = [] as BaseUrlsMap[]

  //if (urlStrategyConfig.isDataResidency) { }

  for (const domain of urlStrategyConfig.domains) {
    const map = urlStrategyConfig.useSubdomains
      ? {
        app: `${BASE_URL_PREFIX}${domain}`,
        gdpr: `${GDPR_URL_PREFIX}${domain}`
      }
      : {
        app: `${BASE_URL_NO_SUB_DOMAIN_PREFIX}${domain}`,
        gdpr: `${BASE_URL_NO_SUB_DOMAIN_PREFIX}${domain}`
      }

    urls.push(map)
  }

  return urls;
}

type Endpoints = keyof typeof ENDPOINTS

function getBaseUrlsIterator(endpoints: Record<Endpoints, string> = ENDPOINTS): BaseUrlsIterator {
  const _urls = getPreferredUrls(endpoints)

  let _counter = 0

  return {
    next: () => {
      if (_counter < _urls.length) {
        return { value: _urls[_counter++], done: false }
      } else {
        return { value: undefined, done: true }
      }
    },
    reset: () => {
      _counter = 0
    }
  }
}

export { getBaseUrlsIterator, BaseUrlsIterator, UrlStrategy, DataResidency, BaseUrlsMap }
