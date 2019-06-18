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

  describe('os detection', () => {

    let os

    it('detects iOS', () => {

      userAgentSpy.mockReturnValue('Mozilla/5.0 (iPhone; CPU iPhone OS 12_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148')

      os = detector.getOsNameAndVersion()

      expect(os.osName).toEqual('ios')
      expect(os.osVersion).toEqual('12.2.0')

      userAgentSpy.mockReturnValue('Mozilla/5.0 (iPad; CPU OS 12_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148')

      os = detector.getOsNameAndVersion()

      expect(os.osName).toEqual('ios')
      expect(os.osVersion).toEqual('12.2.0')

      userAgentSpy.mockReturnValue('Mozilla/5.0 (iPhone; CPU iPhone OS 12_1_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/16D57')

      os = detector.getOsNameAndVersion()

      expect(os.osName).toEqual('ios')
      expect(os.osVersion).toEqual('12.1.4')

      userAgentSpy.mockReturnValue('Mozilla/5.0 (iPhone; CPU iPhone OS 10_3_3 like Mac OS X) AppleWebKit/603.3.8 (KHTML, like Gecko) Version/10.0 Mobile/14G60 Safari/602.1')

      os = detector.getOsNameAndVersion()

      expect(os.osName).toEqual('ios')
      expect(os.osVersion).toEqual('10.3.3')

      userAgentSpy.mockReturnValue('Mozilla/5.0 (iPad; CPU OS 9_3_5 like Mac OS X) AppleWebKit/601.1.46 (KHTML, like Gecko) Version/9.0 Mobile/13G36 Safari/601.1')

      os = detector.getOsNameAndVersion()

      expect(os.osName).toEqual('ios')
      expect(os.osVersion).toEqual('9.3.5')

    })

    it('detects Android', () => {

      userAgentSpy.mockReturnValue('Mozilla/5.0 (Linux; U; Android 2.2) AppleWebKit/533.1 (KHTML, like Gecko) Version/4.0 Mobile Safari/533.1')

      os = detector.getOsNameAndVersion()

      expect(os.osName).toEqual('android')
      expect(os.osVersion).toEqual('2.2')

      userAgentSpy.mockReturnValue('Mozilla/5.0 (Linux; Android 4.2.1; en-us; Nexus 5 Build/JOP40D) AppleWebKit/535.19 (KHTML, like Gecko; googleweblight) Chrome/38.0.1025.166 Mobile Safari/535.19')

      os = detector.getOsNameAndVersion()

      expect(os.osName).toEqual('android')
      expect(os.osVersion).toEqual('4.2.1')

      userAgentSpy.mockReturnValue('Mozilla/5.0 (Linux; Android 9; SM-G960F Build/PPR1.180610.011; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/74.0.3729.157 Mobile Safari/537.36')

      os = detector.getOsNameAndVersion()

      expect(os.osName).toEqual('android')
      expect(os.osVersion).toEqual('9')

      userAgentSpy.mockReturnValue('Mozilla/5.0 (Linux; Android 6.0.1; SM-G532G Build/MMB29T) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/63.0.3239.83 Mobile Safari/537.36')

      os = detector.getOsNameAndVersion()

      expect(os.osName).toEqual('android')
      expect(os.osVersion).toEqual('6.0.1')

      userAgentSpy.mockReturnValue('Mozilla/5.0 (Linux; Android 5.1.1; vivo X7 Build/LMY47V; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/48.0.2564.116 Mobile Safari/537.36 baiduboxapp/8.6.5 (Baidu; P1 5.1.1)')

      os = detector.getOsNameAndVersion()

      expect(os.osName).toEqual('android')
      expect(os.osVersion).toEqual('5.1.1')

      userAgentSpy.mockReturnValue('Mozilla/5.0 (Linux; U; Android 4.3; de-de; GT-I9300 Build/JSS15J) AppleWebKit/534.30 (KHTML, like Gecko) Version/4.0 Mobile Safari/534.30')

      os = detector.getOsNameAndVersion()

      expect(os.osName).toEqual('android')
      expect(os.osVersion).toEqual('4.3')

      userAgentSpy.mockReturnValue('Mozilla/5.0 (Linux; Android 7.0; SAMSUNG SM-G610M Build/NRD90M) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/7.4 Chrome/59.0.3071.125 Mobile Safari/537.36')

      os = detector.getOsNameAndVersion()

      expect(os.osName).toEqual('android')
      expect(os.osVersion).toEqual('7.0')

    })


    it('detects Windows Phone', () => {

      userAgentSpy.mockReturnValue('Mozilla/5.0 (Mobile; Windows Phone 8.1; Android 4.0; ARM; Trident/7.0; Touch; rv:11.0; IEMobile/11.0; NOKIA; Lumia 635) like iPhone OS 7_0_3 Mac OS X AppleWebKit/537 (KHTML, like Gecko) Mobile Safari/537')

      os = detector.getOsNameAndVersion()

      expect(os.osName).toEqual('windows-phone')
      expect(os.osVersion).toEqual('8.1')

      userAgentSpy.mockReturnValue('Mozilla/5.0 (compatible; MSIE 9.0; Windows Phone OS 7.5; Trident/5.0; IEMobile/9.0; NOKIA; Lumia 710)')

      os = detector.getOsNameAndVersion()

      expect(os.osName).toEqual('windows-phone')
      expect(os.osVersion).toEqual('7.5')

      userAgentSpy.mockReturnValue('Mozilla/5.0 (compatible; MSIE 10.0; Windows Phone 8.0; Trident/6.0; IEMobile/10.0; ARM; Touch; NOKIA; Lumia 520)')

      os = detector.getOsNameAndVersion()

      expect(os.osName).toEqual('windows-phone')
      expect(os.osVersion).toEqual('8.0')

      userAgentSpy.mockReturnValue('Mozilla/5.0 (Windows Phone 10.0; Android 6.0.1; NOKIA; Lumia 830) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/51.0.2704.79 Mobile Safari/537.36 Edge/14.14393')

      os = detector.getOsNameAndVersion()

      expect(os.osName).toEqual('windows-phone')
      expect(os.osVersion).toEqual('10.0')

      userAgentSpy.mockReturnValue('Mozilla/5.0 (Windows Phone 10.0; Android 6.0.1; Xbox; Xbox One) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Mobile Safari/537.36 Edge/16.16299')

      os = detector.getOsNameAndVersion()

      expect(os.osName).toEqual('windows-phone')
      expect(os.osVersion).toEqual('10.0')

    })

    it('detects Windows', () => {

      userAgentSpy.mockReturnValue('Mozilla/4.0 (compatible; MSIE 6.0; Windows NT 5.0)')

      os = detector.getOsNameAndVersion()

      expect(os.osName).toEqual('windows')
      expect(os.osVersion).toEqual('2000')

      userAgentSpy.mockReturnValue('Mozilla/4.0 (compatible; MSIE 6.0; Windows NT 5.1; SV1; .NET CLR 1.1.4322)')

      os = detector.getOsNameAndVersion()

      expect(os.osName).toEqual('windows')
      expect(os.osVersion).toEqual('XP')

      userAgentSpy.mockReturnValue('Mozilla/5.0 (Windows; U; Windows NT 5.1; en-US; rv:1.7.12) Gecko/20050915 Firefox/1.0.7')

      os = detector.getOsNameAndVersion()

      expect(os.osName).toEqual('windows')
      expect(os.osVersion).toEqual('XP')

      userAgentSpy.mockReturnValue('Mozilla/4.0 (compatible; MSIE 7.0; Windows NT 6.0)')

      os = detector.getOsNameAndVersion()

      expect(os.osName).toEqual('windows')
      expect(os.osVersion).toEqual('Vista')

      userAgentSpy.mockReturnValue('Mozilla/5.0 (Windows NT 6.1; WOW64; Trident/7.0; rv:11.0) like Gecko')

      os = detector.getOsNameAndVersion()

      expect(os.osName).toEqual('windows')
      expect(os.osVersion).toEqual('7')

      userAgentSpy.mockReturnValue('Mozilla/5.0 (Windows NT 6.2; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/60.0.3112.90 Safari/537.36')

      os = detector.getOsNameAndVersion()

      expect(os.osName).toEqual('windows')
      expect(os.osVersion).toEqual('8')

      userAgentSpy.mockReturnValue('Mozilla/5.0 (Windows NT 6.3; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/60.0.3112.113 Safari/537.36')

      os = detector.getOsNameAndVersion()

      expect(os.osName).toEqual('windows')
      expect(os.osVersion).toEqual('8.1')

      userAgentSpy.mockReturnValue('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.169 Safari/537.36')

      os = detector.getOsNameAndVersion()

      expect(os.osName).toEqual('windows')
      expect(os.osVersion).toEqual('10')

      userAgentSpy.mockReturnValue('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/64.0.3282.140 Safari/537.36 Edge/17.17134')

      os = detector.getOsNameAndVersion()

      expect(os.osName).toEqual('windows')
      expect(os.osVersion).toEqual('10')

    })

    it('detects MacOS', () => {

      userAgentSpy.mockReturnValue('Mozilla/5.0 (Macintosh; U; Intel Mac OS X 10_6_6; en-en) AppleWebKit/533.19.4 (KHTML, like Gecko) Version/5.0.3 Safari/533.19.4')

      os = detector.getOsNameAndVersion()

      expect(os.osName).toEqual('macos')
      expect(os.osVersion).toEqual('10.6.6')

      userAgentSpy.mockReturnValue('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_9_3) AppleWebKit/537.75.14 (KHTML, like Gecko) Version/7.0.3 Safari/7046A194A')

      os = detector.getOsNameAndVersion()

      expect(os.osName).toEqual('macos')
      expect(os.osVersion).toEqual('10.9.3')

      userAgentSpy.mockReturnValue('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_6) AppleWebKit/601.7.8 (KHTML, like Gecko)')

      os = detector.getOsNameAndVersion()

      expect(os.osName).toEqual('macos')
      expect(os.osVersion).toEqual('10.11.6')

      userAgentSpy.mockReturnValue('Mozilla/5.0 (Macintosh; Intel Mac OS X 10.11; rv:45.0) Gecko/20100101 Firefox/45.0')

      os = detector.getOsNameAndVersion()

      expect(os.osName).toEqual('macos')
      expect(os.osVersion).toEqual('10.11')

      userAgentSpy.mockReturnValue('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_5) AppleWebKit/605.1.15 (KHTML, like Gecko)')

      os = detector.getOsNameAndVersion()

      expect(os.osName).toEqual('macos')
      expect(os.osVersion).toEqual('10.14.5')

      userAgentSpy.mockReturnValue('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_6) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/12.0.1 Safari/605.1.15')

      os = detector.getOsNameAndVersion()

      expect(os.osName).toEqual('macos')
      expect(os.osVersion).toEqual('10.13.6')

      userAgentSpy.mockReturnValue('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_5) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/12.1.1 Safari/605.1.15')

      os = detector.getOsNameAndVersion()

      expect(os.osName).toEqual('macos')
      expect(os.osVersion).toEqual('10.14.5')

      userAgentSpy.mockReturnValue('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/70.0.3538.102 Safari/537.36')

      os = detector.getOsNameAndVersion()

      expect(os.osName).toEqual('macos')
      expect(os.osVersion).toEqual('10.14.1')

      userAgentSpy.mockReturnValue('Mozilla/5.0 (Macintosh; Intel Mac OS X 10.13; rv:62.0) Gecko/20100101 Firefox/62.0')

      os = detector.getOsNameAndVersion()

      expect(os.osName).toEqual('macos')
      expect(os.osVersion).toEqual('10.13')

    })

    it('detects webOS', () => {

      userAgentSpy.mockReturnValue('Mozilla/5.0 (webOS/2.0.1; U; en-US) AppleWebKit/532.2 (KHTML, like Gecko) Version/1.0 Safari/532.2 Pre/1.2')

      os = detector.getOsNameAndVersion()

      expect(os.osName).toEqual('webos')
      expect(os.osVersion).toEqual('2.0.1')

    })

    it('detects Symbian', () => {

      userAgentSpy.mockReturnValue('Mozilla/5.0 (Symbian/3; Series60/5.2 NokiaN8-00/012.002; Profile/MIDP-2.1 Configuration/CLDC-1.1 ) AppleWebKit/533.4 (KHTML, like Gecko) NokiaBrowser/7.3.0 Mobile Safari/533.4 3gpp-gba')

      os = detector.getOsNameAndVersion()

      expect(os.osName).toEqual('symbian')
      expect(os.osVersion).toEqual('3')

      userAgentSpy.mockReturnValue('Opera/9.80 (S60; SymbOS; Opera Mobi/SYB-1204232256; U; en-GB) Presto/2.10.254 Version/12.00')

      os = detector.getOsNameAndVersion()

      expect(os.osName).toEqual('symbian')
      expect(os.osVersion).toEqual(undefined)

      userAgentSpy.mockReturnValue('Nokia7610/2.0 (5.0509.0) SymbianOS/7.0s Series60/2.1 Profile/MIDP-2.0 Configuration/CLDC-1.0')

      os = detector.getOsNameAndVersion()

      expect(os.osName).toEqual('symbian')
      expect(os.osVersion).toEqual('7.0s')

    })

    it('detects BlackBerry', () => {

      userAgentSpy.mockReturnValue('BlackBerry8520/5.0.0.681 Profile/MIDP-2.1 Configuration/CLDC-1.1 VendorID/600')

      os = detector.getOsNameAndVersion()

      expect(os.osName).toEqual('blackberry')
      expect(os.osVersion).toEqual(undefined)

      userAgentSpy.mockReturnValue('Mozilla/5.0 (BlackBerry; U; BlackBerry 9780; en-GB) AppleWebKit/534.8+ (KHTML, like Gecko) Version/6.0.0.546 Mobile Safari/534.8+')

      os = detector.getOsNameAndVersion()

      expect(os.osName).toEqual('blackberry')
      expect(os.osVersion).toEqual(undefined)

      userAgentSpy.mockReturnValue('Mozilla/5.0 (BB10; Kbd) AppleWebKit/537.35+ (KHTML, like Gecko) Version/10.3.2.2876 Mobile Safari/537.35+')

      os = detector.getOsNameAndVersion()

      expect(os.osName).toEqual('blackberry')
      expect(os.osVersion).toEqual(undefined)

    })

    it('detects Linux', () => {

      userAgentSpy.mockReturnValue('Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/44.0.2403.157 Safari/537.36')

      os = detector.getOsNameAndVersion()

      expect(os.osName).toEqual('linux')
      expect(os.osVersion).toEqual(undefined)

      userAgentSpy.mockReturnValue('Mozilla/5.0 (X11; U; Linux Core i7-4980HQ; de; rv:32.0; compatible; JobboerseBot; http://www.jobboerse.com/bot.htm) Gecko/20100101 Firefox/38.0')

      os = detector.getOsNameAndVersion()

      expect(os.osName).toEqual('linux')
      expect(os.osVersion).toEqual(undefined)

      userAgentSpy.mockReturnValue('Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/74.0.3729.157 Safari/537.36')

      os = detector.getOsNameAndVersion()

      expect(os.osName).toEqual('linux')
      expect(os.osVersion).toEqual(undefined)

      userAgentSpy.mockReturnValue('Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:61.0) Gecko/20100101 Firefox/61.0')

      os = detector.getOsNameAndVersion()

      expect(os.osName).toEqual('linux')
      expect(os.osVersion).toEqual(undefined)

    })
  })

  describe('browser detection', () => {

    let browser

    it('detects Chrome', () => {

      userAgentSpy.mockReturnValue('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.169 Safari/537.36')

      browser = detector.getBrowserNameAndVersion()

      expect(browser.browserName).toEqual('Chrome')
      expect(browser.browserVersion).toEqual('74')


      userAgentSpy.mockReturnValue('Mozilla/5.0 (iPhone; CPU iPhone OS 12_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/70.0.3538.75 Mobile/15E148 Safari/605.1')

      browser = detector.getBrowserNameAndVersion()

      expect(browser.browserName).toEqual('Chrome')
      expect(browser.browserVersion).toEqual('70')


      userAgentSpy.mockReturnValue('Mozilla/5.0 (Linux; Android 6.0.1; SM-G532G Build/MMB29T) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/63.0.3239.83 Mobile Safari/537.36')

      browser = detector.getBrowserNameAndVersion()

      expect(browser.browserName).toEqual('Chrome')
      expect(browser.browserVersion).toEqual('63')


      userAgentSpy.mockReturnValue('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/60.0.3112.113 Safari/537.36')

      browser = detector.getBrowserNameAndVersion()

      expect(browser.browserName).toEqual('Chrome')
      expect(browser.browserVersion).toEqual('60')


      userAgentSpy.mockReturnValue('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36')

      browser = detector.getBrowserNameAndVersion()

      expect(browser.browserName).toEqual('Chrome')
      expect(browser.browserVersion).toEqual('58')


      userAgentSpy.mockReturnValue('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_6_8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/49.0.2623.112 Safari/537.36')

      browser = detector.getBrowserNameAndVersion()

      expect(browser.browserName).toEqual('Chrome')
      expect(browser.browserVersion).toEqual('49')


      userAgentSpy.mockReturnValue('Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/44.0.2403.157 Safari/537.36')

      browser = detector.getBrowserNameAndVersion()

      expect(browser.browserName).toEqual('Chrome')
      expect(browser.browserVersion).toEqual('44')


      userAgentSpy.mockReturnValue('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2272.89 Safari/537.36')

      browser = detector.getBrowserNameAndVersion()

      expect(browser.browserName).toEqual('Chrome')
      expect(browser.browserVersion).toEqual('41')


      userAgentSpy.mockReturnValue('Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/36.0.1985.143 Safari/537.36')

      browser = detector.getBrowserNameAndVersion()

      expect(browser.browserName).toEqual('Chrome')
      expect(browser.browserVersion).toEqual('36')


      userAgentSpy.mockReturnValue('Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.1 (KHTML, like Gecko) Chrome/21.0.1180.83 Safari/537.1')

      browser = detector.getBrowserNameAndVersion()

      expect(browser.browserName).toEqual('Chrome')
      expect(browser.browserVersion).toEqual('21')


      userAgentSpy.mockReturnValue('Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/534.24 (KHTML, like Gecko) Chrome/11.0.696.3 Safari/534.24')

      browser = detector.getBrowserNameAndVersion()

      expect(browser.browserName).toEqual('Chrome')
      expect(browser.browserVersion).toEqual('11')


      userAgentSpy.mockReturnValue('Mozilla/5.0 (en-us) AppleWebKit/534.14 (KHTML, like Gecko; Google Wireless Transcoder) Chrome/9.0.597 Safari/534.14 wimb_monitor.py/1.0')

      browser = detector.getBrowserNameAndVersion()

      expect(browser.browserName).toEqual('Chrome')
      expect(browser.browserVersion).toEqual('9')

    })

    it('detects Internet Explorer', () => {

      userAgentSpy.mockReturnValue('Mozilla/4.0 (compatible; MSIE 6.0; Windows NT 5.1; SV1; .NET CLR 1.1.4322)')

      browser = detector.getBrowserNameAndVersion()

      expect(browser.browserName).toEqual('IE')
      expect(browser.browserVersion).toEqual('6')


      userAgentSpy.mockReturnValue('Mozilla/4.0 (compatible; MSIE 7.0; Windows NT 6.0)')

      browser = detector.getBrowserNameAndVersion()

      expect(browser.browserName).toEqual('IE')
      expect(browser.browserVersion).toEqual('7')


      userAgentSpy.mockReturnValue('Mozilla/4.0 (compatible; MSIE 8.0; Windows NT 5.1; Trident/4.0)')

      browser = detector.getBrowserNameAndVersion()

      expect(browser.browserName).toEqual('IE')
      expect(browser.browserVersion).toEqual('8')


      userAgentSpy.mockReturnValue('Mozilla/4.0 (compatible; MSIE 9.0; Windows NT 6.1; 125LA; .NET CLR 2.0.50727; .NET CLR 3.0.04506.648; .NET CLR 3.5.21022)')

      browser = detector.getBrowserNameAndVersion()

      expect(browser.browserName).toEqual('IE')
      expect(browser.browserVersion).toEqual('9')


      userAgentSpy.mockReturnValue('Mozilla/5.0 (compatible; MSIE 10.0; Windows NT 6.2)')

      browser = detector.getBrowserNameAndVersion()

      expect(browser.browserName).toEqual('IE')
      expect(browser.browserVersion).toEqual('10')


      userAgentSpy.mockReturnValue('Mozilla/5.0 (Windows NT 6.1; WOW64; Trident/7.0; rv:11.0) like Gecko')

      browser = detector.getBrowserNameAndVersion()

      expect(browser.browserName).toEqual('IE')
      expect(browser.browserVersion).toEqual('11')

    })

    it('detects Edge', () => {

      userAgentSpy.mockReturnValue('Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/42.0.2311.135 Safari/537.36 Edge/12.10240')

      browser = detector.getBrowserNameAndVersion()

      expect(browser.browserName).toEqual('Edge')
      expect(browser.browserVersion).toEqual('12')


      userAgentSpy.mockReturnValue('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/51.0.2704.79 Safari/537.36 Edge/14.14393')

      browser = detector.getBrowserNameAndVersion()

      expect(browser.browserName).toEqual('Edge')
      expect(browser.browserVersion).toEqual('14')


      userAgentSpy.mockReturnValue('Mozilla/5.0 (Windows Phone 10.0; Android 6.0.1; NOKIA; Lumia 830) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/51.0.2704.79 Mobile Safari/537.36 Edge/14.14393')

      browser = detector.getBrowserNameAndVersion()

      expect(browser.browserName).toEqual('Edge')
      expect(browser.browserVersion).toEqual('14')


      userAgentSpy.mockReturnValue('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/52.0.2743.116 Safari/537.36 Edge/15.15063')

      browser = detector.getBrowserNameAndVersion()

      expect(browser.browserName).toEqual('Edge')
      expect(browser.browserVersion).toEqual('15')


      userAgentSpy.mockReturnValue('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/64.0.3282.140 Safari/537.36 Edge/17.17134')

      browser = detector.getBrowserNameAndVersion()

      expect(browser.browserName).toEqual('Edge')
      expect(browser.browserVersion).toEqual('17')


      userAgentSpy.mockReturnValue('Mozilla/5.0 (Linux; Android 8.1.0; SM-J530G Build/M1AJQ) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.86 Mobile Safari/537.36 EdgA/42.0.0.2804')

      browser = detector.getBrowserNameAndVersion()

      expect(browser.browserName).toEqual('Edge')
      expect(browser.browserVersion).toEqual('42')

    })

    it('detects Firefox', () => {

      userAgentSpy.mockReturnValue('Mozilla/5.0 (Windows NT 6.1; WOW64; rv:54.0) Gecko/20100101 Firefox/54.0')

      browser = detector.getBrowserNameAndVersion()

      expect(browser.browserName).toEqual('Firefox')
      expect(browser.browserVersion).toEqual('54')


      userAgentSpy.mockReturnValue('Mozilla/5.0 (X11; U; Linux Core i7-4980HQ; de; rv:32.0; compatible; JobboerseBot; http://www.jobboerse.com/bot.htm) Gecko/20100101 Firefox/38.0')

      browser = detector.getBrowserNameAndVersion()

      expect(browser.browserName).toEqual('Firefox')
      expect(browser.browserVersion).toEqual('38')


      userAgentSpy.mockReturnValue('Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:63.0) Gecko/20100101 Firefox/63.0')

      browser = detector.getBrowserNameAndVersion()

      expect(browser.browserName).toEqual('Firefox')
      expect(browser.browserVersion).toEqual('63')


      userAgentSpy.mockReturnValue('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10; rv:33.0) Gecko/20100101 Firefox/33.0')

      browser = detector.getBrowserNameAndVersion()

      expect(browser.browserName).toEqual('Firefox')
      expect(browser.browserVersion).toEqual('33')


      userAgentSpy.mockReturnValue('Mozilla/5.0 (Macintosh; Intel Mac OS X 10.13; rv:62.0) Gecko/20100101 Firefox/62.0')

      browser = detector.getBrowserNameAndVersion()

      expect(browser.browserName).toEqual('Firefox')
      expect(browser.browserVersion).toEqual('62')


      userAgentSpy.mockReturnValue('Mozilla/5.0 (iPhone; CPU iPhone OS 8_3 like Mac OS X) AppleWebKit/600.1.4 (KHTML, like Gecko) FxiOS/1.0 Mobile/12F69 Safari/600.1.4')

      browser = detector.getBrowserNameAndVersion()

      expect(browser.browserName).toEqual('Firefox')
      expect(browser.browserVersion).toEqual('1')

    })

    it('detects Opera', () => {

      userAgentSpy.mockReturnValue('Opera/9.80 (Windows NT 6.1; WOW64) Presto/2.12.388 Version/12.18')

      browser = detector.getBrowserNameAndVersion()

      expect(browser.browserName).toEqual('Opera')
      expect(browser.browserVersion).toEqual('12')


      userAgentSpy.mockReturnValue('Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/56.0.2924.87 Safari/537.36 OPR/43.0.2442.991')

      browser = detector.getBrowserNameAndVersion()

      expect(browser.browserName).toEqual('Opera')
      expect(browser.browserVersion).toEqual('43')


      userAgentSpy.mockReturnValue('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.100 Safari/537.36 OPR/56.0.3051.99')

      browser = detector.getBrowserNameAndVersion()

      expect(browser.browserName).toEqual('Opera')
      expect(browser.browserVersion).toEqual('56')


      userAgentSpy.mockReturnValue('Opera/9.80 (Android; Opera Mini/11.0.1912/37.7549; U; pl) Presto/2.12.423 Version/12.16')

      browser = detector.getBrowserNameAndVersion()

      expect(browser.browserName).toEqual('Opera Mini')
      expect(browser.browserVersion).toEqual('11')


      userAgentSpy.mockReturnValue('Opera/9.80 (BlackBerry; Opera Mini/7.1.32256/28.3392; U; en) Presto/2.8.119 Version/11.10')

      browser = detector.getBrowserNameAndVersion()

      expect(browser.browserName).toEqual('Opera Mini')
      expect(browser.browserVersion).toEqual('7')


      userAgentSpy.mockReturnValue('Opera/9.80 (J2ME/MIDP; Opera Mini/4.4.31891/29.3417; U; en) Presto/2.8.119 Version/11.10')

      browser = detector.getBrowserNameAndVersion()

      expect(browser.browserName).toEqual('Opera Mini')
      expect(browser.browserVersion).toEqual('4')


      userAgentSpy.mockReturnValue('Mozilla/5.0 (iPhone; CPU iPhone OS 8_1_2 like Mac OS X) AppleWebKit/600.1.4 (KHTML, like Gecko) OPiOS/9.1.0.86723 Mobile/12B440 Safari/9537.53')

      browser = detector.getBrowserNameAndVersion()

      expect(browser.browserName).toEqual('Opera Mini')
      expect(browser.browserVersion).toEqual('9')


      userAgentSpy.mockReturnValue('Mozilla/4.0 (compatible; MSIE 6.0; Windows NT 5.1) Opera 7.54 [en]')

      browser = detector.getBrowserNameAndVersion()

      expect(browser.browserName).toEqual('Opera')
      expect(browser.browserVersion).toEqual(undefined)


    })

    it('detects Safari', () => {

      userAgentSpy.mockReturnValue('Mozilla/5.0 (Macintosh; U; Intel Mac OS X 10_6_6; en-en) AppleWebKit/533.19.4 (KHTML, like Gecko) Version/5.0.3 Safari/533.19.4')

      browser = detector.getBrowserNameAndVersion()

      expect(browser.browserName).toEqual('Safari')
      expect(browser.browserVersion).toEqual('5')


      userAgentSpy.mockReturnValue('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_9_3) AppleWebKit/537.75.14 (KHTML, like Gecko) Version/7.0.3 Safari/7046A194A')

      browser = detector.getBrowserNameAndVersion()

      expect(browser.browserName).toEqual('Safari')
      expect(browser.browserVersion).toEqual('7')


      userAgentSpy.mockReturnValue('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_5) AppleWebKit/603.3.8 (KHTML, like Gecko) Version/10.1.2 Safari/603.3.8')

      browser = detector.getBrowserNameAndVersion()

      expect(browser.browserName).toEqual('Safari')
      expect(browser.browserVersion).toEqual('10')


      userAgentSpy.mockReturnValue('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_6) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/12.0.1 Safari/605.1.15')

      browser = detector.getBrowserNameAndVersion()

      expect(browser.browserName).toEqual('Safari')
      expect(browser.browserVersion).toEqual('12')


      userAgentSpy.mockReturnValue('Mozilla/5.0 (iPhone; CPU iPhone OS 12_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/12.1 Mobile/15E148 Safari/604.1')

      browser = detector.getBrowserNameAndVersion()

      expect(browser.browserName).toEqual('Safari')
      expect(browser.browserVersion).toEqual('12')


      userAgentSpy.mockReturnValue('Mozilla/5.0 (iPhone; CPU iPhone OS 10_3_3 like Mac OS X) AppleWebKit/603.3.8 (KHTML, like Gecko) Version/10.0 Mobile/14G60 Safari/602.1')

      browser = detector.getBrowserNameAndVersion()

      expect(browser.browserName).toEqual('Safari')
      expect(browser.browserVersion).toEqual('10')


      userAgentSpy.mockReturnValue('Mozilla/5.0 (iPad; CPU OS 9_3_5 like Mac OS X) AppleWebKit/601.1.46 (KHTML, like Gecko) Version/9.0 Mobile/13G36 Safari/601.1')

      browser = detector.getBrowserNameAndVersion()

      expect(browser.browserName).toEqual('Safari')
      expect(browser.browserVersion).toEqual('9')


    })

  })

})
