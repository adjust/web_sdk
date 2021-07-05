import { getDeviceOS, DeviceOS } from '../../smart-banner/detect-os'

describe('Returns recognizable device OS', () => {
  afterAll(() => {
    jest.restoreAllMocks()
  })

  function mockUserAgent(userAgent: string) {
    Utils.setGlobalProp(global.navigator, 'userAgent')
    jest.spyOn(global.navigator, 'userAgent', 'get').mockReturnValue(userAgent)
  }

  const testSet: [string, DeviceOS | undefined][] = [
    [
      'Mozilla/5.0 (Windows Mobile 10; Android 8.0.0; Microsoft; Lumia 950XL) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/77.0.3865.92 Mobile Safari/537.36 Edge/40.15254.369',
      DeviceOS.WindowsPhone
    ],
    [
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.169 Safari/537.36',
      DeviceOS.WindowsPC
    ],
    [
      'Mozilla/5.0 (Linux; Android 10; SAMSUNG SM-G975U) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/11.1 Chrome/75.0.3770.143 Mobile Safari/537.36',
      DeviceOS.Android
    ],
    [
      'Mozilla/5.0 (iPad; CPU OS 12_4_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/12.1.2 Mobile/15E148 Safari/604.1',
      DeviceOS.iOS
    ],
    [
      'Mozilla/5.0 (X11; Linux x86_64; rv:45.0) Gecko/20100101 Thunderbird/45.8.0',
      undefined
    ],
  ]


  test.each(testSet)('getDeviceOS(%s) should be %s', (ua: string, expected: DeviceOS) => {
    mockUserAgent(ua)
    expect(getDeviceOS()).toEqual(expected)
  })

})
