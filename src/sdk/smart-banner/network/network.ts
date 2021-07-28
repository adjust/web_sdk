import { parseJson } from '../utilities'
import Globals from '../../globals'
import { urlStrategyRetries } from '../../url-strategy'
import { NetworkError, NoConnectionError } from './errors'

/**
 * Creates an XMLHttpRequest object and sends a GET request with provided encoded URL
 */
function xhr<T>(url: string): Promise<T> {
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

type Primitive = string | number | boolean

function encodeParams(params: Record<string, Primitive>): string {
  return Object.keys(params)
    .map(key => [encodeURIComponent(key), encodeURIComponent(params[key])].join('='))
    .join('&')
}

const defaultEndpoint = 'https://app.adjust.com'

let lastSuccessfulEndpoint: string | undefined

/**
 * Returns last succesfull endpoint or default (`https://app.adjust.com`) one
 */
export function getEndpoint(): string {
  return lastSuccessfulEndpoint || defaultEndpoint
}

export function request<T>(path: string, params: Record<string, Primitive> | undefined): Promise<T> {
  return urlStrategyRetries(baseUrlsMap => {
    const origin = baseUrlsMap.app
    const encodedParams = params ? `?${encodeParams(params)}` : ''

    return xhr<T>(`${origin}${path}${encodedParams}`)
      .then((result: T) => {
        lastSuccessfulEndpoint = baseUrlsMap.app
        return result
      })
      .catch((err: NetworkError) => {
        lastSuccessfulEndpoint = undefined
        throw err
      })
  })
}
