import Logger from '../../../logger'
import { DeviceOS } from '../../../smart-banner/detect-os'
import { fetchSmartBannerData, Position } from '../../../smart-banner/api'
import { Network } from '../../../smart-banner/network/network'

jest.mock('../../../logger')

describe('Smart banner API tests', () => {
  describe('fetchSmartBannerData', () => {
    const webToken = 'abc123'
    const platform = DeviceOS.iOS

    const serverResponseMock = {
      platform: 'ios',
      position: 'bottom',
      tracker_token: 'none',
      title: 'Run App Name',
      description: 'You can run or install App Name',
      button_label: 'Go!'
    }

    let testNetwork: Network = {
      endpoint: 'test-endpoint',
      request: jest.fn()
    }

    let requestSpy: jest.SpyInstance

    beforeAll(() => {
      jest.spyOn(Logger, 'error')

      requestSpy = jest.spyOn(testNetwork, 'request')
    })

    afterEach(() => {
      jest.clearAllMocks()
    })

    it('returns data when request is succesfull', async () => {
      expect.assertions(2)
      requestSpy.mockResolvedValueOnce([serverResponseMock])

      const smartBannerData = await fetchSmartBannerData(webToken, platform, testNetwork)

      expect(smartBannerData).not.toBeNull()
      expect(smartBannerData).toEqual({
        appId: '',
        appName: '',
        position: Position.Bottom,
        header: serverResponseMock.title,
        description: serverResponseMock.description,
        buttonText: serverResponseMock.button_label,
        trackerToken: serverResponseMock.tracker_token,
        dismissInterval: 24 * 60 * 60 * 1000, // 1 day in millis before show banner next time
      })
    })

    it('returns null when no banners for platform', async () => {
      expect.assertions(1)
      requestSpy.mockResolvedValueOnce([{ ...serverResponseMock, platform: 'android' }])

      const smartBannerData = await fetchSmartBannerData(webToken, platform, testNetwork)

      expect(smartBannerData).toBeNull()
    })

    it('returns null when response invalid', async () => {
      expect.assertions(1)
      requestSpy.mockResolvedValueOnce([{ ...serverResponseMock, title: '' }])

      const smartBannerData = await fetchSmartBannerData(webToken, platform, testNetwork)

      expect(smartBannerData).toBeNull()
    })

    it('returns null when network error occurred', async () => {
      expect.assertions(2)

      const error = { status: 404, message: 'Not found' }
      requestSpy.mockRejectedValueOnce(error)

      const smartBannerData = await fetchSmartBannerData(webToken, platform, testNetwork)

      expect(smartBannerData).toBeNull()
      expect(Logger.error).toHaveBeenCalledWith('Network error occurred during loading Smart Banner: ' + JSON.stringify(error))
    })
  })
})
