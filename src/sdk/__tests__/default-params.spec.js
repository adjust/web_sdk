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
    let windowDNT
    let msDNT

    beforeEach(() => {
      setGlobalProp(window.navigator, 'doNotTrack')
      setGlobalProp(window, 'doNotTrack')
      setGlobalProp(window.navigator, 'msDoNotTrack')

      navigatorDNT = jest.spyOn(window.navigator, 'doNotTrack', 'get')
      windowDNT = jest.spyOn(window, 'doNotTrack', 'get')
      msDNT = jest.spyOn(window.navigator, 'msDoNotTrack', 'get')
    })

    afterEach(() => {
      delete window.navigator.doNotTrack
      delete window.navigator.msDoNotTrack
      delete window.doNotTrack
    })

    it('reads track_enabled from window.navigator.doNotTrack', () => {

      const initial = defaultParams.default()

      expect(initial.trackingEnabled).toBeUndefined()

      navigatorDNT.mockReturnValue(0)
      expect(defaultParams.default().trackingEnabled).toEqual(true)

      navigatorDNT.mockReturnValue(1)
      expect(defaultParams.default().trackingEnabled).toEqual(false)

      navigatorDNT.mockReturnValue('no')
      expect(defaultParams.default().trackingEnabled).toEqual(true)

      navigatorDNT.mockReturnValue('yes')
      expect(defaultParams.default().trackingEnabled).toEqual(false)

    })

    it('reads track_enabled from window.doNotTrack', () => {

      const initial = defaultParams.default()

      expect(initial.trackingEnabled).toBeUndefined()

      windowDNT.mockReturnValue(0)
      expect(defaultParams.default().trackingEnabled).toEqual(true)

      windowDNT.mockReturnValue(1)
      expect(defaultParams.default().trackingEnabled).toEqual(false)

      windowDNT.mockReturnValue('no')
      expect(defaultParams.default().trackingEnabled).toEqual(true)

      windowDNT.mockReturnValue('yes')
      expect(defaultParams.default().trackingEnabled).toEqual(false)

    })

    it('reads track_enabled from window.navigator.msDoNotTrack', () => {

      const initial = defaultParams.default()

      expect(initial.trackingEnabled).toBeUndefined()

      msDNT.mockReturnValue(0)
      expect(defaultParams.default().trackingEnabled).toEqual(true)

      msDNT.mockReturnValue(1)
      expect(defaultParams.default().trackingEnabled).toEqual(false)

      msDNT.mockReturnValue('no')
      expect(defaultParams.default().trackingEnabled).toEqual(true)

      msDNT.mockReturnValue('yes')
      expect(defaultParams.default().trackingEnabled).toEqual(false)

    })
  })

  it('test platform parameter - hardcoded to web', () => {
    expect(defaultParams.default().platform).toEqual('web')
  })

  describe('test locale preferences', () => {

    const oldLocale = window.navigator.language
    let navigatorLanguage

    beforeAll(() => {
      setGlobalProp(window.navigator, 'language')
      navigatorLanguage = jest.spyOn(window.navigator, 'language', 'get')
    })

    afterAll(() => {
      window.navigator.language = oldLocale
    })

    it('reads only language from locale', () => {

      navigatorLanguage.mockReturnValue('en')

      const params = defaultParams.default()

      expect(params.language).toEqual('en')
      expect(params.country).toEqual(undefined)

    })

    it('reads both language and country from locale', () => {

      navigatorLanguage.mockReturnValue('fr-FR')

      let params = defaultParams.default()

      expect(params.language).toEqual('fr')
      expect(params.country).toEqual('fr')

      navigatorLanguage.mockReturnValue('en-US')

      params = defaultParams.default()

      expect(params.language).toEqual('en')
      expect(params.country).toEqual('us')

    })
  })

  it('test cpu_type - by default is undefined', () => {
    expect(defaultParams.default().cpuType).toEqual(undefined)
  })

})
