import * as defaultParams from '../default-params'
import * as ActivityState from '../activity-state'
import * as Time from '../time'
import * as QuickStorage from '../storage/quick-storage'

jest.mock('../logger')

describe('request default parameters formation', () => {

  beforeAll(() => {
    jest.spyOn(Time, 'getTimestamp').mockReturnValue('some-time')
    ActivityState.default.current = {uuid: 'some-uuid'}
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('test tracking enabled', () => {

    let navigatorDNT
    let msDNT

    beforeEach(() => {
      Utils.setGlobalProp(global.navigator, 'doNotTrack')
      Utils.setGlobalProp(global.navigator, 'msDoNotTrack')

      navigatorDNT = jest.spyOn(global.navigator, 'doNotTrack', 'get')
      msDNT = jest.spyOn(global.navigator, 'msDoNotTrack', 'get')
    })

    afterEach(() => {
      delete global.navigator.doNotTrack
      delete global.navigator.msDoNotTrack
      delete global.doNotTrack
    })

    it('reads track_enabled from window.navigator.doNotTrack', () => {

      expect.assertions(5)

      return defaultParams.default()
        .then(params => {
          expect(params.trackingEnabled).toBeUndefined()

          navigatorDNT.mockReturnValue(0)

          return defaultParams.default()
        })
        .then(params => {
          expect(params.trackingEnabled).toEqual(true)

          navigatorDNT.mockReturnValue(1)

          return defaultParams.default()
        })
        .then(params => {
          expect(params.trackingEnabled).toEqual(false)

          navigatorDNT.mockReturnValue('no')

          return defaultParams.default()
        })
        .then(params => {
          expect(params.trackingEnabled).toEqual(true)

          navigatorDNT.mockReturnValue('yes')

          return defaultParams.default()
        })
        .then(params => {
          expect(params.trackingEnabled).toEqual(false)
        })

    })

    it('reads track_enabled from window.navigator.msDoNotTrack', () => {

      expect.assertions(5)

      return defaultParams.default()
        .then(params => {
          expect(params.trackingEnabled).toBeUndefined()

          msDNT.mockReturnValue(0)

          return defaultParams.default()
        })
        .then(params => {
          expect(params.trackingEnabled).toEqual(true)

          msDNT.mockReturnValue(1)

          return defaultParams.default()
        })
        .then(params => {
          expect(params.trackingEnabled).toEqual(false)

          msDNT.mockReturnValue('no')

          return defaultParams.default()
        })
        .then(params => {
          expect(params.trackingEnabled).toEqual(true)

          msDNT.mockReturnValue('yes')

          return defaultParams.default()
        })
        .then(params => {
          expect(params.trackingEnabled).toEqual(false)
        })
    })

    it('reads track_enabled from window.doNotTrack', () => {

      expect.assertions(5)

      return defaultParams.default()
        .then(params => {
          expect(params.trackingEnabled).toBeUndefined()

          global.doNotTrack = 0

          return defaultParams.default()
        })
        .then(params => {
          expect(params.trackingEnabled).toEqual(true)

          global.doNotTrack = 1

          return defaultParams.default()
        })
        .then(params => {
          expect(params.trackingEnabled).toEqual(false)

          global.doNotTrack = 'no'

          return defaultParams.default()
        })
        .then(params => {
          expect(params.trackingEnabled).toEqual(true)

          global.doNotTrack = 'yes'

          return defaultParams.default()
        })
        .then(params => {
          expect(params.trackingEnabled).toEqual(false)
        })
    })


  })

  it('test platform parameter - hardcoded to web', () => {
    expect.assertions(1)

    return defaultParams.default()
      .then(params => {
        expect(params.platform).toEqual('web')
      })
  })

  describe('test locale preferences', () => {

    const oldLocale = global.navigator.language
    let navigatorLanguage
    let navigatorUserLanguage

    beforeAll(() => {
      Utils.setGlobalProp(global.navigator, 'language')
      Utils.setGlobalProp(global.navigator, 'userLanguage')

      navigatorLanguage = jest.spyOn(global.navigator, 'language', 'get')
      navigatorUserLanguage = jest.spyOn(global.navigator, 'userLanguage', 'get')
    })

    afterAll(() => {
      global.navigator.language = oldLocale
      delete global.navigator.userLanguage
    })

    it('reads only language from locale', () => {

      navigatorLanguage.mockReturnValueOnce('sr')

      expect.assertions(2)

      return defaultParams.default()
        .then(params => {
          expect(params.language).toEqual('sr')
          expect(params.country).toBeUndefined()
        })

    })

    it('reads userLanguage from locale', () => {

      navigatorUserLanguage.mockReturnValueOnce('fr')

      expect.assertions(2)

      return defaultParams.default()
        .then(params => {
          expect(params.language).toEqual('fr')
          expect(params.country).toBeUndefined()
          delete global.navigator.userLanguage
        })

    })

    it('falls back to en when no locale available', () => {

      expect.assertions(2)

      return defaultParams.default()
        .then(params => {
          expect(params.language).toEqual('en')
          expect(params.country).toBeUndefined()
        })

    })

    it('reads both language and country from locale', () => {

      expect.assertions(4)

      navigatorLanguage.mockReturnValueOnce('fr-FR')

      return defaultParams.default()
        .then(params => {
          expect(params.language).toEqual('fr')
          expect(params.country).toEqual('fr')

          navigatorLanguage.mockReturnValueOnce('en-US')

          return defaultParams.default()
        })
        .then(params => {
          expect(params.language).toEqual('en')
          expect(params.country).toEqual('us')
        })

    })
  })

  describe('test navigator platform value', () => {
    const oldPlatform = global.navigator.platform
    const oldUserAgent = global.navigator.userAgent
    let navigatorPlatform
    let navigatorUserAgent

    beforeAll(() => {
      Utils.setGlobalProp(global.navigator, 'platform')
      Utils.setGlobalProp(global.navigator, 'userAgent')
      navigatorPlatform = jest.spyOn(global.navigator, 'platform', 'get')
      navigatorUserAgent = jest.spyOn(global.navigator, 'userAgent', 'get')
    })

    afterAll(() => {
      global.navigator.language = oldPlatform
      global.navigator.userAgent = oldUserAgent
    })

    it('reads machine_type - by default is undefined', () => {

      expect.assertions(2)

      return defaultParams.default()
        .then(params => {
          expect(params.machineType).toBeUndefined()

          navigatorPlatform.mockReturnValue('macos')

          return defaultParams.default()
        })
        .then(params => {
          expect(params.machineType).toBe('macos')
        })
    })

    it('reads machine_type on window machine and corrects it if user agent states that it is 64-bit machine', () => {

      expect.assertions(3)

      navigatorPlatform.mockReturnValue('Win32')
      navigatorUserAgent
        .mockReturnValueOnce('Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/72.0.3626.121 Safari/537.36')
        .mockReturnValueOnce('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.169 Safari/537.36')

      return defaultParams.default()
        .then(params => {
          expect(params.machineType).toBe('Win64')

          return defaultParams.default()
        })
        .then(params => {
          expect(params.machineType).toBe('Win64')

          return defaultParams.default()
        })
        .then(params => {
          expect(params.machineType).toBe('Win32')
        })
    })
  })

  it('test queue_size - by default is zero', () => {

    expect.assertions(2)

    return defaultParams.default()
      .then(params => {
        expect(params.queueSize).toBe(0)

        QuickStorage.default.stores[QuickStorage.default.names.queue] = [
          {timestamp: 1, url: '/url1'},
          {timestamp: 2, url: '/url2'},
          {timestamp: 3, url: '/url3'}
        ]

        return defaultParams.default()
      })
      .then(params => {
        expect(params.queueSize).toBe(3)
      })


  })

})
