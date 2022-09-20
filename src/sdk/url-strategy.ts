import Config from './config'
import Logger from './logger'
import { ENDPOINTS } from './constants'

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

type EndpointName = UrlStrategy | DataResidency

type BaseUrlsMap = {
  app: string;
  gdpr: string;
}

function incorrectOptionIgnoredMessage(higherPriority: string, lowerPriority: string) {
  Logger.warn(`Both ${higherPriority} and ${lowerPriority} are set in config, ${lowerPriority} will be ignored`)
}

/**
 * Returns a map of base URLs or a list of endpoint names depending on SDK configuration
 */
function getEndpointPreference(): BaseUrlsMap | EndpointName[] {
  const { customUrl, urlStrategy, dataResidency } = Config.getCustomConfig()

  if (customUrl) { // If custom URL is set then send all requests there
    if (dataResidency || urlStrategy) {
      incorrectOptionIgnoredMessage('customUrl', dataResidency ? 'dataResidency' : 'urlStrategy')
    }

    return { app: customUrl, gdpr: customUrl }
  }

  if (dataResidency && urlStrategy) {
    incorrectOptionIgnoredMessage('dataResidency', 'urlStrategy')
  }

  if (dataResidency) {
    return [dataResidency]
  }

  if (urlStrategy === UrlStrategy.India) {
    return [UrlStrategy.India, UrlStrategy.Default]
  }

  if (urlStrategy === UrlStrategy.China) {
    return [UrlStrategy.China, UrlStrategy.Default]
  }

  return [UrlStrategy.Default, UrlStrategy.India, UrlStrategy.China]
}

const endpointMap: Record<UrlStrategy | DataResidency, BaseUrlsMap> = {
  [UrlStrategy.Default]: ENDPOINTS.default,
  [UrlStrategy.India]: ENDPOINTS.india,
  [UrlStrategy.China]: ENDPOINTS.china,
  [DataResidency.EU]: ENDPOINTS.EU,
  [DataResidency.TR]: ENDPOINTS.TR,
  [DataResidency.US]: ENDPOINTS.US
}

interface BaseUrlsIterator extends Iterator<BaseUrlsMap> {
  reset: () => void;
}

function getPreferredUrls(endpoints: Partial<Record<UrlStrategy, BaseUrlsMap>>): BaseUrlsMap[] {
  const preference = getEndpointPreference()

  if (!Array.isArray(preference)) {
    return [preference]
  } else {
    const res = preference
      .map(strategy => endpoints[strategy] || null)
      .filter((i): i is BaseUrlsMap => !!i)

    return res
  }
}

function getBaseUrlsIterator(endpoints: Partial<Record<UrlStrategy | DataResidency, BaseUrlsMap>> = endpointMap): BaseUrlsIterator {
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
