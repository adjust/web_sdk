/* eslint-disable */
import * as defaultParams from '../default-params'
import * as ActivityState from '../activity-state'
import * as Time from '../time'

function configureGlobalProp (o, prop) {
  Object.defineProperty(o, prop, {
    configurable: true,
    get () { return undefined }
  })
}

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
      configureGlobalProp(window.navigator, 'doNotTrack')
      configureGlobalProp(window, 'doNotTrack')
      configureGlobalProp(window.navigator, 'msDoNotTrack')

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

  it('test os_name and os_version - by default is unknown', () => {

    const params = defaultParams.default()

    expect(params.osName).toEqual('unknown')
    expect(params.osVersion).toEqual(undefined)

  })

  it('test browser_name and browser_version - by default is unknown', () => {

    const params = defaultParams.default()

    expect(params.browserName).toEqual('unknown')
    expect(params.browserVersion).toEqual(undefined)

  })

})
