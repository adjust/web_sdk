import Config from './config'
import Logger from './logger'

enum UrlStrategy {
  Default = 'default',
  India = 'india',
  China = 'china'
}

type EndpointName = UrlStrategy

type BaseUrlsMap = {
  app: string;
  gdpr: string;
}

/**
 * Returns a map of base URLs or a list of endpoint names depending on SDK configuration
 */
function getEndpointPreference(): BaseUrlsMap | EndpointName[] {
  const { customUrl, urlStrategy } = Config.getCustomConfig()

  if (customUrl) { // If custom URL is set then send all requests there
    return { app: customUrl, gdpr: customUrl }
  }

  if (urlStrategy === UrlStrategy.India) {
    return [UrlStrategy.India, UrlStrategy.Default]
  }

  if (urlStrategy === UrlStrategy.China) {
    return [UrlStrategy.China, UrlStrategy.Default]
  }

  return [UrlStrategy.Default, UrlStrategy.India, UrlStrategy.China]
}

const endpointMap: Record<UrlStrategy, BaseUrlsMap> = {
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
  }
}

const endpointNiceNames: Record<UrlStrategy, string> = {
  [UrlStrategy.Default]: 'default',
  [UrlStrategy.India]: 'Indian',
  [UrlStrategy.China]: 'Chinese'
}

/**
 * Gets the list of preferred endpoints and wraps `sendRequest` function with iterative retries until available
 * endpoint found or another error occurred.
 */
function urlStrategyRetries<T>(
  sendRequest: (urls: BaseUrlsMap) => Promise<T>,
  endpoints: Record<UrlStrategy, BaseUrlsMap> = endpointMap
): Promise<T> {
  const preferredUrls = getEndpointPreference()

  if (!Array.isArray(preferredUrls)) {
    // There is only one endpoint
    return sendRequest(preferredUrls)
  } else {
    let attempt = 0

    const trySendRequest = (): Promise<T> => {
      const endpointKey = preferredUrls[attempt++]
      const urlsMap = endpoints[endpointKey]

      return sendRequest(urlsMap)
        .catch((reason) => {
          if (reason.code === 'NO_CONNECTION') {
            Logger.log(`Failed to connect ${endpointNiceNames[endpointKey]} endpoint`)

            if (attempt < preferredUrls.length) {
              Logger.log(`Trying ${endpointNiceNames[preferredUrls[attempt]]} one`)

              return trySendRequest() // Trying next endpoint
            }
          }

          // Another error occurred or we ran out of attempts, re-throw
          throw reason
        })
    }

    return trySendRequest()
  }
}

export { urlStrategyRetries, UrlStrategy, BaseUrlsMap }
