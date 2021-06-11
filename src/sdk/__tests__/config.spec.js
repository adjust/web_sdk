import * as Logger from '../logger'

jest.mock('../logger')

describe('test global config', () => {
  describe('test environment', () => {
    jest.isolateModules(() => {
      const Config = require('../config')

      afterEach(() => {
        jest.clearAllMocks()
        Config.default.destroy()
      })

      afterAll(() => {
        jest.restoreAllMocks()
      })

      it('returns false for initialised state', () => {
        expect(Config.default.isInitialised()).toBeFalsy()
      })

      it('returns error when there are missing mandatory params', () => {

        jest.spyOn(Logger.default, 'error')

        Config.default.set({})

        expect(Logger.default.error).toHaveBeenCalledWith('You must define appToken and environment')
        expect(Config.default.isInitialised()).toBeFalsy()
        expect(Config.default.getBaseParams()).toEqual({})
        expect(Config.default.getCustomConfig()).toEqual({})

        Config.default.set({appToken: 'bla'})

        expect(Logger.default.error).toHaveBeenCalledWith('You must define environment')
        expect(Config.default.isInitialised()).toBeFalsy()
        expect(Config.default.getBaseParams()).toEqual({})
        expect(Config.default.getCustomConfig()).toEqual({})

      })

      it('returns true for correctly initialised state', () => {

        const appOptions = {
          appToken: '123abc',
          environment: 'sandbox'
        }

        Config.default.set(appOptions)

        const baseParams = Config.default.getBaseParams()
        const customConfig = Config.default.getCustomConfig()

        expect(Config.default.isInitialised()).toBeTruthy()
        expect(baseParams).toEqual(appOptions)
        expect(baseParams).not.toBe(appOptions)
        expect(customConfig).toEqual({})
      })

      it('overrides configuration with some custom settings', () => {
        Config.default.set({
          appToken: '123abc',
          environment: 'sandbox',
          customUrl: 'http://some-url.com',
          eventDeduplicationListLimit: 10
        })

        expect(Config.default.isInitialised()).toBeTruthy()
        expect(Config.default.getBaseParams()).toEqual({
          appToken: '123abc',
          environment: 'sandbox'
        })
        expect(Config.default.getCustomConfig()).toEqual({
          customUrl: 'http://some-url.com',
          eventDeduplicationListLimit: 10
        })
      })

      it('checks if only copies returned', () => {
        Config.default.set({
          appToken: '123abc',
          environment: 'sandbox',
          customUrl: 'http://some-url.com'
        })

        const baseParams1 = Config.default.getBaseParams()
        const baseParams2 = Config.default.getBaseParams()
        const customConfig1 = Config.default.getCustomConfig()
        const customConfig2 = Config.default.getCustomConfig()

        expect(baseParams1).toEqual(baseParams2)
        expect(baseParams1).not.toBe(baseParams2)
        expect(customConfig1).toEqual(customConfig2)
        expect(customConfig1).not.toBe(customConfig2)
      })

      it('sets only allowed parameters', () => {
        Config.default.set({
          appToken: '123abc',
          environment: 'sandbox',
          defaultTracker: 'tracker',
          externalDeviceId: 'external-device-id',
          customUrl: 'http://some-url.com',
          eventDeduplicationListLimit: 11,
          something: 'else'
        })

        expect(Config.default.isInitialised()).toBeTruthy()
        expect(Config.default.getBaseParams()).toEqual({
          appToken: '123abc',
          environment: 'sandbox',
          defaultTracker: 'tracker',
          externalDeviceId: 'external-device-id'
        })
        expect(Config.default.getCustomConfig()).toEqual({
          customUrl: 'http://some-url.com',
          eventDeduplicationListLimit: 11
        })
      })

      it('destroys config', () => {

        const appOptions = {
          appToken: '123abc',
          environment: 'sandbox',
          customUrl: 'url'
        }

        Config.default.set(appOptions)

        expect(Config.default.isInitialised()).toBeTruthy()
        expect(Config.default.getBaseParams()).toEqual({
          appToken: '123abc',
          environment: 'sandbox',
        })
        expect(Config.default.getCustomConfig()).toEqual({
          customUrl: 'url'
        })

        Config.default.destroy()

        expect(Config.default.isInitialised()).toBeFalsy()
        expect(Config.default.getBaseParams()).toEqual({})
        expect(Config.default.getCustomConfig()).toEqual({})
      })
    })
  })
})
