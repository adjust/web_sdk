import Globals from '../../globals'
import { Network } from './network'
import { parseJson } from '../utilities'
import { NetworkError, NoConnectionError } from './errors'

type Primitive = string | number | boolean

/** Sends HTTP GET request using XMLHttpRequest */
export class XhrNetwork implements Network {
  constructor(protected origin: string) { }

  public get endpoint(): string {
    return this.origin
  }

  /**
   * Creates an XMLHttpRequest object and sends a GET request with provided encoded URL
   * @param url encoded URL
   */
  private xhr<T>(url: string): Promise<T> {
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

      xhr.onerror = () => reject(NoConnectionError)

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

  private encodeParams(params: Record<string, Primitive>): string {
    return Object.keys(params)
      .map(key => [encodeURIComponent(key), encodeURIComponent(params[key])].join('='))
      .join('&')
  }

  public request<T>(path: string, params?: Record<string, Primitive>): Promise<T> {
    const encodedParams = params ? `?${this.encodeParams(params)}` : ''

    return this.xhr<T>(`${this.origin}${path}${encodedParams}`)
  }
}
