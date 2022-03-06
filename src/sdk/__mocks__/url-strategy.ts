import type { BaseUrlsMap, UrlStrategy } from '../url-strategy'

const module = jest.requireActual('../url-strategy')

const testEndpoints = {
  default: { app: 'app.default', gdpr: '' },
  india: { app: 'app.india', gdpr: '' },
  china: { app: 'app.china', gdpr: '' }
}

const testBaseUrls = { app: 'app', gdpr: 'gdpr' }

export const mockUrls = {
  endpoints: testEndpoints,
  baseUrls: testBaseUrls
}

export function urlStrategyRetries<T>(sendRequest: (urls: BaseUrlsMap) => Promise<T>, endpoints: Record<UrlStrategy, BaseUrlsMap> = mockUrls.endpoints) {
  return module.urlStrategyRetries(sendRequest, endpoints)
}

export function getBaseUrlsIterator(urls: BaseUrlsMap[] = [mockUrls.baseUrls]) {
  return module.getBaseUrlsIterator(urls)
}
