import { UrlStrategy, urlStrategyRetries, getBaseUrlsIterator, BaseUrlsMap, BaseUrlsIterator } from '../url-strategy'
import * as Globals from '../globals'

jest.mock('../logger')

describe('test url strategy', () => {
  const testEndpoints = {
    default: {
      app: 'app.default',
      gdpr: 'gdpr.default'
    },
    india: {
      app: 'app.india',
      gdpr: 'gdpr.india'
    },
    china: {
      app: 'app.china',
      gdpr: 'gdpr.china'
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

  describe('Promise-based urlStrategyRetries tests', () => {

    it('does not override custom url', () => {
      const customUrl = 'custom-url'
      Config.set({ ...options, customUrl })

      expect.assertions(2)

      return urlStrategyRetries(sendRequestMock, testEndpoints)
        .catch(reason => expect(reason).toEqual({ code: 'NO_CONNECTION' }))
        .then(() => expect(sendRequestMock).toHaveBeenCalledWith({ app: customUrl, gdpr: customUrl }))
    })

    it('retries to send request to endpoints iteratively', () => {
      expect.assertions(5)

      return urlStrategyRetries(sendRequestMock, testEndpoints)
        .catch(reason => expect(reason).toEqual({ code: 'NO_CONNECTION' }))
        .then(() => {
          expect(sendRequestMock).toHaveBeenCalledTimes(3)
          expect(sendRequestMock).toHaveBeenCalledWith({ app: testEndpoints.default.app, gdpr: testEndpoints.default.gdpr })
          expect(sendRequestMock).toHaveBeenCalledWith({ app: testEndpoints.india.app, gdpr: testEndpoints.india.gdpr })
          expect(sendRequestMock).toHaveBeenCalledWith({ app: testEndpoints.china.app, gdpr: testEndpoints.china.gdpr })
        })
    })

    it('prefers Indian enpoint and does not try reach Chinese one when india url strategy set', () => {
      Config.set({ ...options, urlStrategy: UrlStrategy.India })

      expect.assertions(4)

      return urlStrategyRetries(sendRequestMock, testEndpoints)
        .catch(reason => expect(reason).toEqual({ code: 'NO_CONNECTION' }))
        .then(() => {
          expect(sendRequestMock).toHaveBeenCalledTimes(2)
          expect(sendRequestMock).toHaveBeenCalledWith({ app: testEndpoints.india.app, gdpr: testEndpoints.india.gdpr })
          expect(sendRequestMock).toHaveBeenCalledWith({ app: testEndpoints.default.app, gdpr: testEndpoints.default.gdpr })
        })
    })

    it('prefers Chinese enpoint and does not try reach Indian one when china url strategy set', () => {
      Config.set({ ...options, urlStrategy: UrlStrategy.China })

      expect.assertions(4)

      return urlStrategyRetries(sendRequestMock, testEndpoints)
        .catch(reason => expect(reason).toEqual({ code: 'NO_CONNECTION' }))
        .then(() => {
          expect(sendRequestMock).toHaveBeenCalledTimes(2)
          expect(sendRequestMock).toHaveBeenCalledWith({ app: testEndpoints.china.app, gdpr: testEndpoints.china.gdpr })
          expect(sendRequestMock).toHaveBeenCalledWith({ app: testEndpoints.default.app, gdpr: testEndpoints.default.gdpr })
        })
    })

    it('stops to iterate endpoints if connected succesfully', () => {
      const sendRequestMock = jest.fn()
        .mockImplementationOnce(() => Promise.reject({ code: 'NO_CONNECTION' }))
        .mockImplementationOnce(() => Promise.resolve())

      expect.assertions(1)

      return urlStrategyRetries(sendRequestMock, testEndpoints)
        .then(() => expect(sendRequestMock).toHaveBeenCalledTimes(2))
    })

    it('does not iterate endpoints if another error happened', () => {
      const sendRequestMock = jest.fn(() => Promise.reject({ code: 'UNKNOWN' }))

      expect.assertions(1)

      return urlStrategyRetries(sendRequestMock, testEndpoints)
        .catch(() => expect(sendRequestMock).toHaveBeenCalledTimes(1))
    })

  })

  describe('BaseUrlsIterator tests', () => {

    const numberOfIterations = Object.keys(testEndpoints).length

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

      expect(iterator.next()).toEqual({value: testEndpoints.default, done: false})
      expect(iterator.next()).toEqual({value: testEndpoints.india, done: false})
      expect(iterator.next()).toEqual({value: testEndpoints.china, done: false})
      expect(iterator.next()).toEqual({value: undefined, done: true})
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

      it('iterate through all endpoints twice', () => {
        const iterator = getBaseUrlsIterator(testEndpoints)

        const first = iterateThrough(iterator)

        iterator.reset()

        const second = iterateThrough(iterator)

        expect(first.length).toEqual(numberOfIterations)
        expect(second.length).toEqual(numberOfIterations)
        expect(second).toEqual(first)
      })

      it('iterate partially then reset', () => {
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
  })
})
