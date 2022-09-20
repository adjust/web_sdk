import type { BaseUrlsMap, UrlStrategy } from '../url-strategy'

const urlStrategyModule = jest.requireActual('../url-strategy')

const testEndpoints = {
  default: { app: 'app.default', gdpr: '' },
  india: { app: 'app.india', gdpr: '' },
  china: { app: 'app.china', gdpr: '' }
}

const singleEndpoint = { default: { app: 'app', gdpr: 'gdpr' } }

export const mockEndpoints = {
  endpoints: testEndpoints,
  singleEndpoint
}

export function urlStrategyRetries<T>(
  sendRequest: (urls: BaseUrlsMap) => Promise<T>,
  endpoints: Partial<Record<UrlStrategy, BaseUrlsMap>> = mockEndpoints.endpoints
) {
  return urlStrategyModule.urlStrategyRetries(sendRequest, endpoints)
}

export function getBaseUrlsIterator(endpoints: Partial<Record<UrlStrategy, BaseUrlsMap>> = mockEndpoints.singleEndpoint) {
  return urlStrategyModule.getBaseUrlsIterator(endpoints)
}
