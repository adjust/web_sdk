/* eslint-disable */
import * as detector from '../detector'

describe('os name and version detector', () => {

  let userAgentSpy

  beforeEach(() => {
    userAgentSpy = jest.spyOn(window.navigator, 'userAgent', 'get')
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('detects iOS', () => {

    userAgentSpy.mockReturnValue('Mozilla/5.0 (iPhone; CPU iPhone OS 12_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148')

    expect(detector.getOsNameAndVersion().osName).toEqual('ios')
    expect(detector.getOsNameAndVersion().osVersion).toEqual('12.2.0')

    userAgentSpy.mockReturnValue('Mozilla/5.0 (iPad; CPU OS 12_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148')

    expect(detector.getOsNameAndVersion().osName).toEqual('ios')
    expect(detector.getOsNameAndVersion().osVersion).toEqual('12.2.0')

    userAgentSpy.mockReturnValue('Mozilla/5.0 (iPhone; CPU iPhone OS 12_1_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/16D57')

    expect(detector.getOsNameAndVersion().osName).toEqual('ios')
    expect(detector.getOsNameAndVersion().osVersion).toEqual('12.1.4')

    userAgentSpy.mockReturnValue('Mozilla/5.0 (iPhone; CPU iPhone OS 10_3_3 like Mac OS X) AppleWebKit/603.3.8 (KHTML, like Gecko) Version/10.0 Mobile/14G60 Safari/602.1')

    expect(detector.getOsNameAndVersion().osName).toEqual('ios')
    expect(detector.getOsNameAndVersion().osVersion).toEqual('10.3.3')

    userAgentSpy.mockReturnValue('Mozilla/5.0 (iPad; CPU OS 9_3_5 like Mac OS X) AppleWebKit/601.1.46 (KHTML, like Gecko) Version/9.0 Mobile/13G36 Safari/601.1')

    expect(detector.getOsNameAndVersion().osName).toEqual('ios')
    expect(detector.getOsNameAndVersion().osVersion).toEqual('9.3.5')

  })

  it('detects Android', () => {

    userAgentSpy.mockReturnValue('Mozilla/5.0 (Linux; U; Android 2.2) AppleWebKit/533.1 (KHTML, like Gecko) Version/4.0 Mobile Safari/533.1')

    expect(detector.getOsNameAndVersion().osName).toEqual('android')
    expect(detector.getOsNameAndVersion().osVersion).toEqual('2.2')

    userAgentSpy.mockReturnValue('Mozilla/5.0 (Linux; Android 4.2.1; en-us; Nexus 5 Build/JOP40D) AppleWebKit/535.19 (KHTML, like Gecko; googleweblight) Chrome/38.0.1025.166 Mobile Safari/535.19')

    expect(detector.getOsNameAndVersion().osName).toEqual('android')
    expect(detector.getOsNameAndVersion().osVersion).toEqual('4.2.1')

    userAgentSpy.mockReturnValue('Mozilla/5.0 (Linux; Android 9; SM-G960F Build/PPR1.180610.011; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/74.0.3729.157 Mobile Safari/537.36')

    expect(detector.getOsNameAndVersion().osName).toEqual('android')
    expect(detector.getOsNameAndVersion().osVersion).toEqual('9')

    userAgentSpy.mockReturnValue('Mozilla/5.0 (Linux; Android 6.0.1; SM-G532G Build/MMB29T) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/63.0.3239.83 Mobile Safari/537.36')

    expect(detector.getOsNameAndVersion().osName).toEqual('android')
    expect(detector.getOsNameAndVersion().osVersion).toEqual('6.0.1')

    userAgentSpy.mockReturnValue('Mozilla/5.0 (Linux; Android 5.1.1; vivo X7 Build/LMY47V; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/48.0.2564.116 Mobile Safari/537.36 baiduboxapp/8.6.5 (Baidu; P1 5.1.1)')

    expect(detector.getOsNameAndVersion().osName).toEqual('android')
    expect(detector.getOsNameAndVersion().osVersion).toEqual('5.1.1')

    userAgentSpy.mockReturnValue('Mozilla/5.0 (Linux; U; Android 4.3; de-de; GT-I9300 Build/JSS15J) AppleWebKit/534.30 (KHTML, like Gecko) Version/4.0 Mobile Safari/534.30')

    expect(detector.getOsNameAndVersion().osName).toEqual('android')
    expect(detector.getOsNameAndVersion().osVersion).toEqual('4.3')

    userAgentSpy.mockReturnValue('Mozilla/5.0 (Linux; Android 7.0; SAMSUNG SM-G610M Build/NRD90M) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/7.4 Chrome/59.0.3071.125 Mobile Safari/537.36')

    expect(detector.getOsNameAndVersion().osName).toEqual('android')
    expect(detector.getOsNameAndVersion().osVersion).toEqual('7.0')

  })


  it('detects Windows Phone', () => {

    userAgentSpy.mockReturnValue('Mozilla/5.0 (Mobile; Windows Phone 8.1; Android 4.0; ARM; Trident/7.0; Touch; rv:11.0; IEMobile/11.0; NOKIA; Lumia 635) like iPhone OS 7_0_3 Mac OS X AppleWebKit/537 (KHTML, like Gecko) Mobile Safari/537')

    expect(detector.getOsNameAndVersion().osName).toEqual('windows-phone')
    expect(detector.getOsNameAndVersion().osVersion).toEqual('8.1')

    userAgentSpy.mockReturnValue('Mozilla/5.0 (compatible; MSIE 9.0; Windows Phone OS 7.5; Trident/5.0; IEMobile/9.0; NOKIA; Lumia 710)')

    expect(detector.getOsNameAndVersion().osName).toEqual('windows-phone')
    expect(detector.getOsNameAndVersion().osVersion).toEqual('7.5')

    userAgentSpy.mockReturnValue('Mozilla/5.0 (compatible; MSIE 10.0; Windows Phone 8.0; Trident/6.0; IEMobile/10.0; ARM; Touch; NOKIA; Lumia 520)')

    expect(detector.getOsNameAndVersion().osName).toEqual('windows-phone')
    expect(detector.getOsNameAndVersion().osVersion).toEqual('8.0')

    userAgentSpy.mockReturnValue('Mozilla/5.0 (Windows Phone 10.0; Android 6.0.1; NOKIA; Lumia 830) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/51.0.2704.79 Mobile Safari/537.36 Edge/14.14393')

    expect(detector.getOsNameAndVersion().osName).toEqual('windows-phone')
    expect(detector.getOsNameAndVersion().osVersion).toEqual('10.0')

    userAgentSpy.mockReturnValue('Mozilla/5.0 (Windows Phone 10.0; Android 6.0.1; Xbox; Xbox One) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Mobile Safari/537.36 Edge/16.16299')

    expect(detector.getOsNameAndVersion().osName).toEqual('windows-phone')
    expect(detector.getOsNameAndVersion().osVersion).toEqual('10.0')

  })

  it('detects Windows', () => {

    userAgentSpy.mockReturnValue('Mozilla/4.0 (compatible; MSIE 6.0; Windows NT 5.0)')

    expect(detector.getOsNameAndVersion().osName).toEqual('windows')
    expect(detector.getOsNameAndVersion().osVersion).toEqual('2000')

    userAgentSpy.mockReturnValue('Mozilla/4.0 (compatible; MSIE 6.0; Windows NT 5.1; SV1; .NET CLR 1.1.4322)')

    expect(detector.getOsNameAndVersion().osName).toEqual('windows')
    expect(detector.getOsNameAndVersion().osVersion).toEqual('XP')

    userAgentSpy.mockReturnValue('Mozilla/5.0 (Windows; U; Windows NT 5.1; en-US; rv:1.7.12) Gecko/20050915 Firefox/1.0.7')

    expect(detector.getOsNameAndVersion().osName).toEqual('windows')
    expect(detector.getOsNameAndVersion().osVersion).toEqual('XP')

    userAgentSpy.mockReturnValue('Mozilla/4.0 (compatible; MSIE 7.0; Windows NT 6.0)')

    expect(detector.getOsNameAndVersion().osName).toEqual('windows')
    expect(detector.getOsNameAndVersion().osVersion).toEqual('Vista')

    userAgentSpy.mockReturnValue('Mozilla/5.0 (Windows NT 6.1; WOW64; Trident/7.0; rv:11.0) like Gecko')

    expect(detector.getOsNameAndVersion().osName).toEqual('windows')
    expect(detector.getOsNameAndVersion().osVersion).toEqual('7')

    userAgentSpy.mockReturnValue('Mozilla/5.0 (Windows NT 6.2; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/60.0.3112.90 Safari/537.36')

    expect(detector.getOsNameAndVersion().osName).toEqual('windows')
    expect(detector.getOsNameAndVersion().osVersion).toEqual('8')

    userAgentSpy.mockReturnValue('Mozilla/5.0 (Windows NT 6.3; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/60.0.3112.113 Safari/537.36')

    expect(detector.getOsNameAndVersion().osName).toEqual('windows')
    expect(detector.getOsNameAndVersion().osVersion).toEqual('8.1')

    userAgentSpy.mockReturnValue('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.169 Safari/537.36')

    expect(detector.getOsNameAndVersion().osName).toEqual('windows')
    expect(detector.getOsNameAndVersion().osVersion).toEqual('10')

    userAgentSpy.mockReturnValue('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/64.0.3282.140 Safari/537.36 Edge/17.17134')

    expect(detector.getOsNameAndVersion().osName).toEqual('windows')
    expect(detector.getOsNameAndVersion().osVersion).toEqual('10')

  })

  it('detects MacOS', () => {

    userAgentSpy.mockReturnValue('Mozilla/5.0 (Macintosh; U; Intel Mac OS X 10_6_6; en-en) AppleWebKit/533.19.4 (KHTML, like Gecko) Version/5.0.3 Safari/533.19.4')

    expect(detector.getOsNameAndVersion().osName).toEqual('macos')
    expect(detector.getOsNameAndVersion().osVersion).toEqual('10.6.6')

    userAgentSpy.mockReturnValue('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_9_3) AppleWebKit/537.75.14 (KHTML, like Gecko) Version/7.0.3 Safari/7046A194A')

    expect(detector.getOsNameAndVersion().osName).toEqual('macos')
    expect(detector.getOsNameAndVersion().osVersion).toEqual('10.9.3')

    userAgentSpy.mockReturnValue('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_6) AppleWebKit/601.7.8 (KHTML, like Gecko)')

    expect(detector.getOsNameAndVersion().osName).toEqual('macos')
    expect(detector.getOsNameAndVersion().osVersion).toEqual('10.11.6')

    userAgentSpy.mockReturnValue('Mozilla/5.0 (Macintosh; Intel Mac OS X 10.11; rv:45.0) Gecko/20100101 Firefox/45.0')

    expect(detector.getOsNameAndVersion().osName).toEqual('macos')
    expect(detector.getOsNameAndVersion().osVersion).toEqual('10.11')

    userAgentSpy.mockReturnValue('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_5) AppleWebKit/605.1.15 (KHTML, like Gecko)')

    expect(detector.getOsNameAndVersion().osName).toEqual('macos')
    expect(detector.getOsNameAndVersion().osVersion).toEqual('10.14.5')

    userAgentSpy.mockReturnValue('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_6) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/12.0.1 Safari/605.1.15')

    expect(detector.getOsNameAndVersion().osName).toEqual('macos')
    expect(detector.getOsNameAndVersion().osVersion).toEqual('10.13.6')

    userAgentSpy.mockReturnValue('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_5) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/12.1.1 Safari/605.1.15')

    expect(detector.getOsNameAndVersion().osName).toEqual('macos')
    expect(detector.getOsNameAndVersion().osVersion).toEqual('10.14.5')

    userAgentSpy.mockReturnValue('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/70.0.3538.102 Safari/537.36')

    expect(detector.getOsNameAndVersion().osName).toEqual('macos')
    expect(detector.getOsNameAndVersion().osVersion).toEqual('10.14.1')

    userAgentSpy.mockReturnValue('Mozilla/5.0 (Macintosh; Intel Mac OS X 10.13; rv:62.0) Gecko/20100101 Firefox/62.0')

    expect(detector.getOsNameAndVersion().osName).toEqual('macos')
    expect(detector.getOsNameAndVersion().osVersion).toEqual('10.13')

  })

  it('detects webOS', () => {

    userAgentSpy.mockReturnValue('Mozilla/5.0 (webOS/2.0.1; U; en-US) AppleWebKit/532.2 (KHTML, like Gecko) Version/1.0 Safari/532.2 Pre/1.2')

    expect(detector.getOsNameAndVersion().osName).toEqual('webos')
    expect(detector.getOsNameAndVersion().osVersion).toEqual('2.0.1')

  })

  it('detects Symbian', () => {

    userAgentSpy.mockReturnValue('Mozilla/5.0 (Symbian/3; Series60/5.2 NokiaN8-00/012.002; Profile/MIDP-2.1 Configuration/CLDC-1.1 ) AppleWebKit/533.4 (KHTML, like Gecko) NokiaBrowser/7.3.0 Mobile Safari/533.4 3gpp-gba')

    expect(detector.getOsNameAndVersion().osName).toEqual('symbian')
    expect(detector.getOsNameAndVersion().osVersion).toEqual('3')

    userAgentSpy.mockReturnValue('Opera/9.80 (S60; SymbOS; Opera Mobi/SYB-1204232256; U; en-GB) Presto/2.10.254 Version/12.00')

    expect(detector.getOsNameAndVersion().osName).toEqual('symbian')
    expect(detector.getOsNameAndVersion().osVersion).toEqual(undefined)

    userAgentSpy.mockReturnValue('Nokia7610/2.0 (5.0509.0) SymbianOS/7.0s Series60/2.1 Profile/MIDP-2.0 Configuration/CLDC-1.0')

    expect(detector.getOsNameAndVersion().osName).toEqual('symbian')
    expect(detector.getOsNameAndVersion().osVersion).toEqual('7.0s')

  })

  it('detects BlackBerry', () => {

    userAgentSpy.mockReturnValue('BlackBerry8520/5.0.0.681 Profile/MIDP-2.1 Configuration/CLDC-1.1 VendorID/600')

    expect(detector.getOsNameAndVersion().osName).toEqual('blackberry')
    expect(detector.getOsNameAndVersion().osVersion).toEqual(undefined)

    userAgentSpy.mockReturnValue('Mozilla/5.0 (BlackBerry; U; BlackBerry 9780; en-GB) AppleWebKit/534.8+ (KHTML, like Gecko) Version/6.0.0.546 Mobile Safari/534.8+')

    expect(detector.getOsNameAndVersion().osName).toEqual('blackberry')
    expect(detector.getOsNameAndVersion().osVersion).toEqual(undefined)

    userAgentSpy.mockReturnValue('Mozilla/5.0 (BB10; Kbd) AppleWebKit/537.35+ (KHTML, like Gecko) Version/10.3.2.2876 Mobile Safari/537.35+')

    expect(detector.getOsNameAndVersion().osName).toEqual('blackberry')
    expect(detector.getOsNameAndVersion().osVersion).toEqual(undefined)

  })

  it('detects Linux', () => {

    userAgentSpy.mockReturnValue('Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/44.0.2403.157 Safari/537.36')

    expect(detector.getOsNameAndVersion().osName).toEqual('linux')
    expect(detector.getOsNameAndVersion().osVersion).toEqual(undefined)

    userAgentSpy.mockReturnValue('Mozilla/5.0 (X11; U; Linux Core i7-4980HQ; de; rv:32.0; compatible; JobboerseBot; http://www.jobboerse.com/bot.htm) Gecko/20100101 Firefox/38.0')

    expect(detector.getOsNameAndVersion().osName).toEqual('linux')
    expect(detector.getOsNameAndVersion().osVersion).toEqual(undefined)

    userAgentSpy.mockReturnValue('Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/74.0.3729.157 Safari/537.36')

    expect(detector.getOsNameAndVersion().osName).toEqual('linux')
    expect(detector.getOsNameAndVersion().osVersion).toEqual(undefined)

    userAgentSpy.mockReturnValue('Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:61.0) Gecko/20100101 Firefox/61.0')

    expect(detector.getOsNameAndVersion().osName).toEqual('linux')
    expect(detector.getOsNameAndVersion().osVersion).toEqual(undefined)

  })

})
