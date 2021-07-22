import Globals from '../../globals'
import { urlStrategyRetries } from '../../url-strategy'

/**
 * Creates an XMLHttpRequest object and sends a GET request with provided encoded URL
 */
function xhr<T>(url: string): Promise<T> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.open('GET', url)

    const headers = [
      ['Client-SDK', `js${Globals.version}`],
      ['Content-Type', 'application/json']
    ]

    headers
      .forEach(([key, value]) => {
        xhr.setRequestHeader(key, value)
      })

    xhr.onload = () => {
      if (xhr.status != 200) {
        reject(`status: ${xhr.status}, message: ${xhr.statusText}`)
      } else {
        resolve(JSON.parse(xhr.responseText))
      }
    }

    xhr.onerror = () => reject('unknown')

    xhr.send()
  })
}

type Primitive = string | number | boolean

function encodeParams(params: Record<string, Primitive>): string {
  return Object.keys(params)
    .map(key => [encodeURIComponent(key), encodeURIComponent(params[key])].join('='))
    .join('&')
}

export function request<T>(path: string, params: Record<string, Primitive> | undefined): Promise<T> {
  return urlStrategyRetries(baseUrlsMap => {
    const origin = baseUrlsMap.app
    const encodedParams = params ? `?${encodeParams(params)}` : ''

    return xhr<T>(`${origin}${path}${encodedParams}`)
  })
}
