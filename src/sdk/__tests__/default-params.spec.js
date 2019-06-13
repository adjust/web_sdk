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

      expect(defaultParams.default()).toEqual({
        createdAt: 'some-time',
        sentAt: 'some-time',
        webUuid: 'some-uuid',
        gpsAdid: 'some-uuid'
      })

      navigatorDNT.mockReturnValue(0)
      expect(defaultParams.default()).toMatchObject({trackingEnabled: true})

      navigatorDNT.mockReturnValue(1)
      expect(defaultParams.default()).toMatchObject({trackingEnabled: false})

      navigatorDNT.mockReturnValue('no')
      expect(defaultParams.default()).toMatchObject({trackingEnabled: true})

      navigatorDNT.mockReturnValue('yes')
      expect(defaultParams.default()).toMatchObject({trackingEnabled: false})

    })

    it('reads track_enabled from window.doNotTrack', () => {

      expect(defaultParams.default()).toEqual({
        createdAt: 'some-time',
        sentAt: 'some-time',
        webUuid: 'some-uuid',
        gpsAdid: 'some-uuid'
      })

      windowDNT.mockReturnValue(0)
      expect(defaultParams.default()).toMatchObject({trackingEnabled: true})

      windowDNT.mockReturnValue(1)
      expect(defaultParams.default()).toMatchObject({trackingEnabled: false})

      windowDNT.mockReturnValue('no')
      expect(defaultParams.default()).toMatchObject({trackingEnabled: true})

      windowDNT.mockReturnValue('yes')
      expect(defaultParams.default()).toMatchObject({trackingEnabled: false})

    })

    it('reads track_enabled from window.navigator.msDoNotTrack', () => {

      expect(defaultParams.default()).toEqual({
        createdAt: 'some-time',
        sentAt: 'some-time',
        webUuid: 'some-uuid',
        gpsAdid: 'some-uuid'
      })

      msDNT.mockReturnValue(0)
      expect(defaultParams.default()).toMatchObject({trackingEnabled: true})

      msDNT.mockReturnValue(1)
      expect(defaultParams.default()).toMatchObject({trackingEnabled: false})

      msDNT.mockReturnValue('no')
      expect(defaultParams.default()).toMatchObject({trackingEnabled: true})

      msDNT.mockReturnValue('yes')
      expect(defaultParams.default()).toMatchObject({trackingEnabled: false})

    })
  })


})
