import Logger from '../../../logger'
import { NetworkError, NoConnectionError } from '../errors';

export type BaseUrlsMap = {
  endpointName: string;
  app: string;
  gdpr: string;
}

export abstract class UrlStrategy {
  abstract getPreferredUrls: () => BaseUrlsMap[];

  /**
   * Gets the list of preferred endpoints and wraps `sendRequest` function with iterative retries until available
   * endpoint found or another error occurred.
   */
  public retries<T>(sendRequest: (urls: BaseUrlsMap) => Promise<T>): Promise<T> {
    let attempt = 0

    const trySendRequest = (): Promise<T> => {
      const urlsMap = this.getPreferredUrls()[attempt++]

      return sendRequest(urlsMap)
        .catch((reason: NetworkError) => {
          if (reason === NoConnectionError) {
            Logger.log(`Failed to connect ${urlsMap.endpointName} endpoint`)

            if (attempt < this.getPreferredUrls.length) {
              Logger.log(`Trying ${urlsMap.endpointName} one`)

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
