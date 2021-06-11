import { UrlStrategy, urlStrategyRetries } from '../url-strategy'
import * as Globals from '../globals'

jest.mock('../logger')

describe('test url strategy', () => {

  describe('development environment', () => {
    let Config

    const options = {
      appToken: '123abc',
      environment: 'sandbox'
    }

    const sendRequestMock = jest.fn(() => Promise.reject({ code: 'NO_CONNECTION' }))

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

    it('does not override custom url', () => {
      const customUrl = 'custom-url'
      Config.set({ ...options, customUrl })

      return urlStrategyRetries(sendRequestMock, testEndpoints)
        .catch(reason => expect(reason).toEqual({ code: 'NO_CONNECTION' }))
        .then(() => expect(sendRequestMock).toHaveBeenCalledWith({ app: customUrl, gdpr: customUrl }))
    })

    it('retries send requesrt to endpoints iteratively', () => {
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

      return urlStrategyRetries(sendRequestMock, testEndpoints)
        .then(() => expect(sendRequestMock).toHaveBeenCalledTimes(2))
    })

    it('does not iterate endpoints if another error happened', () => {
      const sendRequestMock = jest.fn(() => Promise.reject({ code: 'UNKNOWN' }))

      return urlStrategyRetries(sendRequestMock, testEndpoints)
        .catch(() => expect(sendRequestMock).toHaveBeenCalledTimes(1))
    })
  })
})
