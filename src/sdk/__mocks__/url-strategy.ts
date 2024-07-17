import { BaseUrlsMap } from "../url-strategy"

type Endpoints = keyof typeof testEndpoints

export const testEndpoints = {
  default: 'default',
  india: 'india',
  china: 'china',
  world: 'world',
  EU: 'eu',
  TR: 'tr',
  US: 'us',
}

export const singleEndpoint = {
  default: 'default'
}

export function getBaseUrlsIterator(endpoints: Partial<Record<Endpoints, string>> = singleEndpoint) {
  const _urls = [] as BaseUrlsMap[]

  for (const i in endpoints) {
    const urlMap = {
      app: 'app.' + i,
      gdpr: 'gdpr.' + i
    }
    _urls.push(urlMap)
  }

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
