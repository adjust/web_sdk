import * as defaultParams from '../default-params'
import * as ActivityState from '../activity-state'
import * as Time from '../time'
import * as QuickStorage from '../quick-storage'
import {setGlobalProp} from './_helper'

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

    beforeEach(() => {
      setGlobalProp(global.window.navigator, 'doNotTrack')
      navigatorDNT = jest.spyOn(global.window.navigator, 'doNotTrack', 'get')
    })

    afterEach(() => {
      delete global.window.navigator.doNotTrack
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
  })

  it('test platform parameter - hardcoded to web', () => {
    expect.assertions(1)

    return defaultParams.default()
      .then(params => {
        expect(params.platform).toEqual('web')
      })
  })

  describe('test locale preferences', () => {

    const oldLocale = global.window.navigator.language
    let navigatorLanguage

    beforeAll(() => {
      setGlobalProp(global.window.navigator, 'language')
      navigatorLanguage = jest.spyOn(global.window.navigator, 'language', 'get')
    })

    afterAll(() => {
      global.window.navigator.language = oldLocale
    })

    it('reads only language from locale', () => {

      navigatorLanguage.mockReturnValue('en')

      expect.assertions(2)

      return defaultParams.default()
        .then(params => {
          expect(params.language).toEqual('en')
          expect(params.country).toBeUndefined()
        })

    })

    it('reads both language and country from locale', () => {

      expect.assertions(4)

      navigatorLanguage.mockReturnValue('fr-FR')

      return defaultParams.default()
        .then(params => {
          expect(params.language).toEqual('fr')
          expect(params.country).toEqual('fr')

          navigatorLanguage.mockReturnValue('en-US')

          return defaultParams.default()
        })
        .then(params => {
          expect(params.language).toEqual('en')
          expect(params.country).toEqual('us')
        })

    })
  })

  describe('test navigator platform value', () => {
    const oldPlatform = global.window.navigator.platform
    const oldUserAgent = global.window.navigator.userAgent
    let navigatorPlatform
    let userAgent

    beforeAll(() => {
      setGlobalProp(global.window.navigator, 'platform')
      setGlobalProp(global.window.navigator, 'userAgent')
      navigatorPlatform = jest.spyOn(global.window.navigator, 'platform', 'get')
      userAgent = jest.spyOn(global.window.navigator, 'userAgent', 'get')
    })

    afterAll(() => {
      global.window.navigator.language = oldPlatform
      global.window.navigator.userAgent = oldUserAgent
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

    it('reads machine_type on 64-bit window machine and corrects it if necessary', () => {

      expect.assertions(1)

      navigatorPlatform.mockReturnValue('Win32')
      userAgent.mockReturnValue('Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/72.0.3626.121 Safari/537.36')

      return defaultParams.default()
        .then(params => {
          expect(params.machineType).toBe('Win64')
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
