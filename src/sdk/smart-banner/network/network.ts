import { parseJson } from '../utilities'
import Globals from '../../globals'
import { urlStrategyRetries } from '../../url-strategy'
import { NetworkError, NoConnectionError } from './errors'

type Primitive = string | number | boolean

export class Network {
  private static defaultEndpoint = 'https://app.adjust.com'

  private static lastSuccessfulEndpoint: string | undefined

  /**
   * Creates an XMLHttpRequest object and sends a GET request with provided encoded URL
   * @param url encoded URL
   */
  private static xhr<T>(url: string): Promise<T> {
    return new Promise((resolve, reject: (err: NetworkError) => void) => {
      const xhr = new XMLHttpRequest()
      xhr.open('GET', url)

      const headers = [
        ['Client-SDK', `js${Globals.version}`],
        ['Content-Type', 'application/json']
      ]

      headers.forEach(([key, value]) => {
        xhr.setRequestHeader(key, value)
      })

      xhr.onerror = () => reject({ status: 0, message: '' })

      xhr.onreadystatechange = () => {
        if (xhr.readyState !== 4) {
          return
        }

        const okStatus = xhr.status >= 200 && xhr.status < 300
        const json = parseJson(xhr.responseText)

        if (xhr.status === 0) {
          reject(NoConnectionError)
        } else {
          if (okStatus) {
            resolve(json)
          } else {
            reject({ status: xhr.status, message: json || xhr.responseText || '' })
          }
        }
      }

      xhr.send()
    })
  }

  private static encodeParams(params: Record<string, Primitive>): string {
    return Object.keys(params)
      .map(key => [encodeURIComponent(key), encodeURIComponent(params[key])].join('='))
      .join('&')
  }

  /**
   * Returns last succesfull endpoint or default (`https://app.adjust.com`) one
   */
  public static getEndpoint(): string {
    return Network.lastSuccessfulEndpoint || Network.defaultEndpoint
  }

  public static request<T>(path: string, params?: Record<string, Primitive>): Promise<T> {
    return urlStrategyRetries(baseUrlsMap => {
      const origin = baseUrlsMap.app
      const encodedParams = params ? `?${Network.encodeParams(params)}` : ''

      return Network.xhr<T>(`${origin}${path}${encodedParams}`)
        .then((result: T) => {
          Network.lastSuccessfulEndpoint = baseUrlsMap.app
          return result
        })
        .catch((err: NetworkError) => {
          Network.lastSuccessfulEndpoint = undefined
          throw err
        })
    })
  }
}
