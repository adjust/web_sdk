import Config from './config'
import Logger from './logger'

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

/**
 * Returns a map of base URLs or a list of endpoint names depending on SDK configuration
 */
function getEndpointPreference(): BaseUrlsMap | EndpointName[] {
  const { customUrl, urlStrategy, dataResidency } = Config.getCustomConfig()

  if (customUrl) { // If custom URL is set then send all requests there
    return { app: customUrl, gdpr: customUrl }
  }

  if (dataResidency && urlStrategy) {
    Logger.warn('Both urlStrategy and dataResidency are set in config, urlStartegy would be ignored')
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
  [UrlStrategy.Default]: {
    app: 'https://app.adjust.com',
    gdpr: 'https://gdpr.adjust.com'
  },
  [UrlStrategy.India]: {
    app: 'https://app.adjust.net.in',
    gdpr: 'https://gdpr.adjust.net.in'
  },
  [UrlStrategy.China]: {
    app: 'https://app.adjust.world',
    gdpr: 'https://gdpr.adjust.world'
  },
  [DataResidency.EU]: {
    app: 'https://app.eu.adjust.com',
    gdpr: 'https://gdpr.eu.adjust.com'
  },
  [DataResidency.TR]: {
    app: 'https://app.tr.adjust.com',
    gdpr: 'https://gdpr.tr.adjust.com'
  },
  [DataResidency.US]: {
    app: 'https://app.us.adjust.com',
    gdpr: 'https://gdpr.us.adjust.com'
  }
}

interface BaseUrlsIterator extends Iterator<BaseUrlsMap> {
  reset: () => void;
}

function getPreferredUrls(endpoints: Partial<Record<UrlStrategy, BaseUrlsMap>>): BaseUrlsMap[] {
  const getPreferredUrls = getEndpointPreference()

  if (!Array.isArray(getPreferredUrls)) {
    return [getPreferredUrls]
  } else {
    const res = getPreferredUrls
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
