import { UrlStrategy, getBaseUrlsIterator, BaseUrlsMap, BaseUrlsIterator, DataResidency } from '../url-strategy'
import * as Globals from '../globals'
import * as Logger from '../logger'

jest.mock('../logger')

describe('test url strategy', () => {
  const testEndpoints = {
    [UrlStrategy.Default]: {
      app: 'app.default',
      gdpr: 'gdpr.default'
    },
    [UrlStrategy.India]: {
      app: 'app.india',
      gdpr: 'gdpr.india'
    },
    [UrlStrategy.China]: {
      app: 'app.china',
      gdpr: 'gdpr.china'
    },
    [DataResidency.EU]: {
      app: 'app.eu',
      gdpr: 'gdpr.eu'
    },
    [DataResidency.TR]: {
      app: 'app.tr',
      gdpr: 'gdpr.tr'
    },
    [DataResidency.US]: {
      app: 'app.us',
      gdpr: 'gdpr.us'
    }
  }

  let Config

  const options = {
    appToken: '123abc',
    environment: 'sandbox'
  }

  const sendRequestMock = jest.fn(() => Promise.reject({ code: 'NO_CONNECTION' }))

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

  describe('BaseUrlsIterator tests', () => {

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

    it('returns all values through iteration when default url startegy used', () => {
      const iterator = getBaseUrlsIterator(testEndpoints)

      expect(iterator.next()).toEqual({ value: testEndpoints.default, done: false })
      expect(iterator.next()).toEqual({ value: testEndpoints.india, done: false })
      expect(iterator.next()).toEqual({ value: testEndpoints.china, done: false })
      expect(iterator.next()).toEqual({ value: undefined, done: true })
    })

    it('prefers Indian enpoint and does not try reach Chinese one when india url strategy set', () => {
      Config.set({ ...options, urlStrategy: UrlStrategy.India })

      const values = iterateThrough(getBaseUrlsIterator(testEndpoints))

      expect(values.length).toEqual(2)
      expect(values[0]).toEqual(testEndpoints.india)
      expect(values[1]).toEqual(testEndpoints.default)
    })

    it('prefers Chinese enpoint and does not try reach Indian one when china url strategy set', () => {
      Config.set({ ...options, urlStrategy: UrlStrategy.China })

      const values = iterateThrough(getBaseUrlsIterator(testEndpoints))

      expect(values.length).toEqual(2)
      expect(values[0]).toEqual(testEndpoints.china)
      expect(values[1]).toEqual(testEndpoints.default)
    })

    it('does not override custom url', () => {
      const customUrl = 'custom-url'
      Config.set({ ...options, customUrl })

      const values = iterateThrough(getBaseUrlsIterator(testEndpoints))

      expect(values.length).toEqual(1)
      expect(values[0]).toEqual({ app: 'custom-url', gdpr: 'custom-url' })
    })

    describe('reset allows to restart iteration', () => {

      it('iterates through all endpoints twice in default order', () => {
        const defaultEndpointsNumber = 3 // number of endpoints to try if default url strategy used

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
        const thirdIteration = iterateThrough(iterator, 3)
        iterator.reset()

        expect(firstIteration.length).toEqual(1)
        expect(secondIteration.length).toEqual(2)
        expect(thirdIteration.length).toEqual(3)

        expect(firstIteration[0]).toEqual(testEndpoints.default)
        expect(secondIteration[0]).toEqual(testEndpoints.default)
        expect(thirdIteration[0]).toEqual(testEndpoints.default)

        expect(secondIteration[1]).toEqual(testEndpoints.india)
        expect(thirdIteration[1]).toEqual(testEndpoints.india)

        expect(thirdIteration[2]).toEqual(testEndpoints.china)
      })
    })

    describe('data residency', () => {

      it.each([
        DataResidency.EU,
        DataResidency.US,
        DataResidency.TR
      ])('tries to reach only regional endpoint if data residency set', (dataResidency) => {
        Config.set({ ...options, dataResidency: dataResidency })

        const values = iterateThrough(getBaseUrlsIterator(testEndpoints))

        expect(values.length).toEqual(1)
        expect(values[0]).toEqual(testEndpoints[dataResidency])
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

        expect(Logger.default.warn).toHaveBeenCalledWith('Both urlStrategy and dataResidency are set in config, urlStartegy would be ignored')
        expect(values.length).toEqual(1)
        expect(values[0]).toEqual(testEndpoints[dataResidency])
      })
    })
  })
})
