const baseUrls = { app: 'app', gdpr: 'gdpr' }

function urlStrategyRetries(sendRequest) {
  return sendRequest(baseUrls)
}

function getBaseUrlsIterator() {
  return jest.requireActual('../url-strategy')
    .getBaseUrlsIterator([baseUrls])
}

export {
  urlStrategyRetries,
  getBaseUrlsIterator
}
