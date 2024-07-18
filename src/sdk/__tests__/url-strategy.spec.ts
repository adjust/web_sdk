import {
  UrlStrategy,
  getBaseUrlsIterator,
  BaseUrlsMap,
  BaseUrlsIterator,
  DataResidency,
  UrlStrategyConfig
} from '../url-strategy'
import * as Globals from '../globals'
import * as Logger from '../logger'
import * as Constants from '../constants';

Constants.BASE_URL_PREFIX = 'app.';
Constants.GDPR_URL_PREFIX = 'gdpr.';
Constants.BASE_URL_NO_SUB_DOMAIN_PREFIX = '';

jest.mock('../logger')

describe('test url strategy', () => {
  const testEndpoints = {
    default: 'default',
    india: 'india',
    china: 'china',
    world: 'world',
    EU: 'eu',
    TR: 'tr',
    US: 'us',
  }

  // returns an object containing `app` and `gdpr` endpoints
  const getIteratorValue = (endpoint: string) => ({
    app: Constants.BASE_URL_PREFIX + endpoint,
    gdpr: Constants.GDPR_URL_PREFIX + endpoint
  })

  let Config

  const options = {
    appToken: '123abc',
    environment: 'sandbox'
  }

  const env = Globals.default.env

  beforeAll(() => {
    Globals.default.env = 'development'
    jest.spyOn(Logger.default, 'warn')
  })

  beforeEach(() => {
    Config = require('../config').default
  })

  afterEach(() => {
    Config.destroy()
    jest.clearAllMocks()
  })

  afterAll(() => {
    Globals.default.env = env
    jest.restoreAllMocks()
  })

  const iterateThrough = (iterator: BaseUrlsIterator, iterationsNumber?: number) => {
    const results: BaseUrlsMap[] = []
    let current
    let steps = iterationsNumber === undefined ? -1 : iterationsNumber

    do {
      current = iterator.next()
      if (current.value) {
        results.push(current.value)
      }
    } while (!current.done && --steps !== 0)

    return results
  }

  describe('BaseUrlsIterator tests', () => {

    it('returns all values through iteration when default url startegy used', () => {
      const iterator = getBaseUrlsIterator(testEndpoints)

      expect(iterator.next()).toEqual({ value: getIteratorValue(testEndpoints.default), done: false })
      expect(iterator.next()).toEqual({ value: getIteratorValue(testEndpoints.world), done: false })
      expect(iterator.next()).toEqual({ value: undefined, done: true })
    })

    it('prefers Indian enpoint and does not try reach Chinese one when india url strategy set', () => {
      Config.set({ ...options, urlStrategy: UrlStrategy.India })

      const values = iterateThrough(getBaseUrlsIterator(testEndpoints))

      expect(values.length).toBe(2)
      expect(values[0]).toEqual(getIteratorValue(testEndpoints.india))
      expect(values[1]).toEqual(getIteratorValue(testEndpoints.default))
    })

    it('prefers Chinese enpoint and does not try reach Indian one when china url strategy set', () => {
      Config.set({ ...options, urlStrategy: UrlStrategy.China })

      const values = iterateThrough(getBaseUrlsIterator(testEndpoints))

      expect(values.length).toBe(2)
      expect(values[0]).toEqual(getIteratorValue(testEndpoints.china))
      expect(values[1]).toEqual(getIteratorValue(testEndpoints.default))
    })

    it('does not override custom url', () => {
      const customUrl = 'custom-url'
      Config.set({ ...options, customUrl })

      const values = iterateThrough(getBaseUrlsIterator(testEndpoints))

      expect(values.length).toBe(1)
      expect(values[0]).toEqual({ app: 'custom-url', gdpr: 'custom-url' })
    })

    describe('reset allows to restart iteration', () => {

      it('iterates through all endpoints twice in default order', () => {
        const defaultEndpointsNumber = 2 // number of endpoints to try if default url strategy used

        const iterator = getBaseUrlsIterator(testEndpoints)

        const first = iterateThrough(iterator)

        iterator.reset()

        const second = iterateThrough(iterator)

        expect(first.length).toEqual(defaultEndpointsNumber)
        expect(second.length).toEqual(defaultEndpointsNumber)
        expect(second).toEqual(first)
      })

      it('iterates partially then reset', () => {
        const iterator = getBaseUrlsIterator(testEndpoints)

        const firstIteration = iterateThrough(iterator, 1)
        iterator.reset()
        const secondIteration = iterateThrough(iterator, 2)
        iterator.reset()

        expect(firstIteration.length).toBe(1)
        expect(secondIteration.length).toBe(2)

        expect(firstIteration[0]).toEqual(getIteratorValue(testEndpoints.default))
        expect(secondIteration[0]).toEqual(getIteratorValue(testEndpoints.default))

        expect(secondIteration[1]).toEqual(getIteratorValue(testEndpoints.world))
      })
    })

  })

  describe('Data Residency', () => {

    it.each([
      DataResidency.EU,
      DataResidency.US,
      DataResidency.TR
    ])('tries to reach only regional endpoint if data residency set', (dataResidency) => {
      Config.set({ ...options, dataResidency: dataResidency })

      const values = iterateThrough(getBaseUrlsIterator(testEndpoints))

      expect(values.length).toBe(1)
      expect(values[0]).toEqual(getIteratorValue(testEndpoints[dataResidency]))
    })

    it.each([
      [UrlStrategy.China, DataResidency.EU],
      [UrlStrategy.China, DataResidency.US],
      [UrlStrategy.China, DataResidency.TR],
      [UrlStrategy.India, DataResidency.EU],
      [UrlStrategy.India, DataResidency.US],
      [UrlStrategy.India, DataResidency.TR]
    ])('drops url strategy if data residency set', (urlStrategy, dataResidency) => {
      Config.set({ ...options, urlStrategy: urlStrategy, dataResidency: dataResidency })

      const values = iterateThrough(getBaseUrlsIterator(testEndpoints))

      expect(Logger.default.warn).toHaveBeenCalledWith('Both dataResidency and urlStrategy are set in config, urlStrategy will be ignored')
      expect(values.length).toBe(1)
      expect(values[0]).toEqual(getIteratorValue(testEndpoints[dataResidency]))
    })
  })

  describe('Set URL Strategy as a list of domains', () => {
    it('logs a warning and uses default endpoints if passed domain list is not defined', () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const urlStrategy: UrlStrategyConfig = { domains: undefined, useSubdomains: true } as any
      Config.set({ ...options, urlStrategy })

      const values = iterateThrough(getBaseUrlsIterator(testEndpoints))

      expect(values.length).toBe(2)
      expect(values[0]).toEqual(getIteratorValue(testEndpoints.default))
      expect(values[1]).toEqual(getIteratorValue(testEndpoints.world))
      expect(Logger.default.warn).toHaveBeenCalledWith('Invalid urlStartegy: `domains` should be a non-empty array')
    })

    it('logs a warning and uses default endpoints if passed domain list is empty', () => {
      const urlStrategy: UrlStrategyConfig = { domains: [], useSubdomains: true }
      Config.set({ ...options, urlStrategy })

      const values = iterateThrough(getBaseUrlsIterator(testEndpoints))

      expect(values.length).toBe(2)
      expect(values[0]).toEqual(getIteratorValue(testEndpoints.default))
      expect(values[1]).toEqual(getIteratorValue(testEndpoints.world))
      expect(Logger.default.warn).toHaveBeenCalledWith('Invalid urlStartegy: `domains` should be a non-empty array')
    })

    it('uses passed endpoints', () => {
      const urlStrategy: UrlStrategyConfig = { domains: ['example.com', 'my.domain.org', 'page.de'], useSubdomains: true }
      Config.set({ ...options, urlStrategy })

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const values = iterateThrough(getBaseUrlsIterator([] as any)) // passing endpoints needed only for backward compatibility

      expect(values.length).toBe(3)
      expect(values[0]).toEqual(getIteratorValue('example.com'))
      expect(values[1]).toEqual(getIteratorValue('my.domain.org'))
      expect(values[2]).toEqual(getIteratorValue('page.de'))
    })

    it('does not add subdomains when `useSubdomains` is false', () => {
      const urlStrategy: UrlStrategyConfig = { domains: ['example.com', 'my.domain.org', 'page.de'], useSubdomains: false }
      Config.set({ ...options, urlStrategy })

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const values = iterateThrough(getBaseUrlsIterator([] as any)) // passing endpoints needed only for backward compatibility

      expect(values.length).toBe(3)
      expect(values[0]).toEqual({app: 'example.com', gdpr: 'example.com'})
      expect(values[1]).toEqual({app: 'my.domain.org', gdpr: 'my.domain.org'})
      expect(values[2]).toEqual({app: 'page.de', gdpr: 'page.de'})
    })
  })
})
