import Logger from '../../../logger'
import { NetworkError, NoConnectionError } from '../errors'

export type BaseUrlsMap = {
  endpointName: string;
  app: string;
  gdpr: string;
}

export class UrlStrategy {
  static NoPreferredUrlsDefinedError = new ReferenceError('UrlStrategy: No preferred URL defined')

  constructor(private preferredUrls: () => BaseUrlsMap[]) { }

  /**
   * Gets the list of preferred endpoints and wraps `sendRequest` function with iterative retries until available
   * endpoint found or another error occurred.
   */
  public retries<T>(sendRequest: (urls: BaseUrlsMap) => Promise<T>): Promise<T> {
    let attempt = 0

    const trySendRequest = (): Promise<T> => {
      const preferredUrls = this.preferredUrls()

      if (!preferredUrls || preferredUrls.length === 0) {
        Logger.error(UrlStrategy.NoPreferredUrlsDefinedError.message)
        throw UrlStrategy.NoPreferredUrlsDefinedError
      }

      const urlsMap = preferredUrls[attempt++]

      return sendRequest(urlsMap)
        .catch((reason: NetworkError) => {
          if (reason === NoConnectionError) {
            Logger.log(`Failed to connect ${urlsMap.endpointName} endpoint`)

            if (attempt < preferredUrls.length) {
              Logger.log(`Trying ${preferredUrls[attempt].endpointName} one`)

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
