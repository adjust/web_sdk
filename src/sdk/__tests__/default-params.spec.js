/* eslint-disable */
import * as defaultParams from '../default-params'
import * as ActivityState from '../activity-state'
import * as Time from '../time'
import {setGlobalProp} from './_helper'

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

  it('test cpu_type - by default is undefined', () => {
    expect.assertions(1)

    return defaultParams.default()
      .then(params => {
        expect(params.cpuType).toBeUndefined()
      })
  })

})
