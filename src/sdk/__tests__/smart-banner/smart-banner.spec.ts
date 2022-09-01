import Logger from '../../logger'
import * as Api from '../../smart-banner/api'
import * as DetectOS from '../../smart-banner/detect-os'
import { storage } from '../../smart-banner/local-storage'
import { SmartBanner } from '../../smart-banner/smart-banner'

jest.mock('../../logger')
jest.useFakeTimers()

describe('Smart Banner tests', () => {
  const webToken = 'abc123'
  const defaultDismissInterval = 60 * 60 * 1000 // 1 hour in millis
  const platform = DetectOS.DeviceOS.iOS
  const bannerData: Api.SmartBannerData = {
    appId: 'none',
    appName: 'Adjust Web SDK',
    header: 'Adjust Smart Banners',
    description: 'Not so smart actually, but deeplinks do the magic anyway',
    buttonText: 'Let\'s go!',
    dismissInterval: defaultDismissInterval,
    position: Api.Position.Top,
    trackerToken: 'abcd'
  }

  let smartBanner

  beforeAll(() => {
    jest.spyOn(document, 'createElement')
    jest.spyOn(Logger, 'log')
    jest.spyOn(Logger, 'error')
    jest.spyOn(global, 'setTimeout')

    smartBanner = new SmartBanner({ webToken })
  })

  beforeEach(() => {
    jest.spyOn(DetectOS, 'getDeviceOS').mockReturnValue(platform)
    jest.spyOn(Api, 'fetchSmartBannerData').mockResolvedValue(bannerData)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('initialisation', () => {

    afterEach(() => {
      smartBanner.destroy()
    })

    it(('initialises and renders banner'), async () => {
      expect.assertions(5)

      smartBanner.init(webToken)
      await Utils.flushPromises() // resolves data fetch promise that allows initialisation to finish

      expect(Logger.log).toHaveBeenCalledWith('Creating Smart Banner')
      expect(document.createElement).toHaveBeenCalled()
      expect(smartBanner.banner).not.toBeNull()
      expect(smartBanner.dismissButton).not.toBeNull()
      expect(Logger.log).toHaveBeenCalledWith('Smart Banner created')
    })

    describe('can not call init repeatedly', () => {
      it('initialisation in progress', async () => {
        expect.assertions(1)

        smartBanner.init(webToken) // setup

        smartBanner.init(webToken)

        expect(Logger.error).toHaveBeenCalledWith('Smart Banner is initialising already')

        await Utils.flushPromises() // tear down
      })

      it('initialisation finished', async () => {
        expect.assertions(1)

        smartBanner.init(webToken) // setup
        await Utils.flushPromises() // allow initialisation to finish

        smartBanner.init(webToken)

        expect(Logger.error).toHaveBeenCalledWith('Smart Banner already exists')
      })
    })

    it('logs message when no banner for platform', async () => {
      jest.spyOn(Api, 'fetchSmartBannerData').mockResolvedValueOnce(null)

      expect.assertions(1)

      smartBanner.init(webToken)
      await Utils.flushPromises()

      expect(Logger.log).toHaveBeenCalledWith(`No Smart Banners for ${platform} platform found`)
    })

    it('logs message when no target platform', () => {
      jest.spyOn(DetectOS, 'getDeviceOS').mockReturnValueOnce(undefined)

      smartBanner.init(webToken)

      expect(Logger.log).toHaveBeenCalledWith('This platform is not one of the targeting ones, Smart Banner will not be shown')
    })
  })

  describe('hide and show', () => {
    beforeAll(() => {
      jest.spyOn(smartBanner, 'hide')
      jest.spyOn(smartBanner, 'show')
    })

    describe('Smart Banner initialised', () => {
      beforeEach(() => {
        smartBanner.init(webToken)
        return Utils.flushPromises() // resolves data fetch promise that allows initialisation to finish
          .then(() => {
            jest.spyOn(smartBanner.banner, 'hide')
            jest.spyOn(smartBanner.banner, 'show')
          })
      })

      afterEach(() => {
        smartBanner.destroy()
      })

      it('hides banner', () => {
        smartBanner.hide()

        expect(smartBanner.banner.hide).toHaveBeenCalled()
      })

      it('shows banner', () => {
        smartBanner.show()

        expect(smartBanner.banner.show).toHaveBeenCalled()
      })
    })

    describe('Smart Banner is still initialising', () => {
      afterEach(() => {
        smartBanner.destroy()
        jest.clearAllMocks()
      })

      it('logs a message when hide called and hides after initialisation finished', async () => {
        expect.assertions(3)

        smartBanner.init()
        smartBanner.hide()

        expect(Logger.log).toHaveBeenCalledWith('Smart Banner will be hidden after initialisation finished')

        await Utils.flushPromises() // resolves data fetch promise that allows initialisation to finish

        expect(Logger.log).toHaveBeenCalledWith('Initialisation finished, hiding Smart Banner')
        expect(smartBanner.hide).toHaveBeenCalledTimes(2)
      })

      it('logs a message when show called and shows after initialisation finished', async () => {
        expect.assertions(3)

        smartBanner.init()
        smartBanner.show()

        expect(Logger.log).toHaveBeenCalledWith('Smart Banner will be shown after initialisation finished')

        await Utils.flushPromises() // resolves data fetch promise that allows initialisation to finish

        expect(Logger.log).toHaveBeenCalledWith('Initialisation finished, showing Smart Banner')
        expect(smartBanner.show).toHaveBeenCalledTimes(2)
      })
    })

    describe('Smart Banner was not initialised', () => {
      it('logs an error when hide called', () => {
        smartBanner.hide()

        expect(Logger.error).toHaveBeenCalledWith('There is no Smart Banner to hide, have you called initialisation?')
      })

      it('logs an error when show called', () => {
        smartBanner.show()

        expect(Logger.error).toHaveBeenCalledWith('There is no Smart Banner to show, have you called initialisation?')
      })
    })
  })

  describe('dismiss', () => {
    const now = Date.now()

    beforeAll(() => {
      jest.spyOn(Date, 'now').mockReturnValue(now)
      jest.spyOn(storage, 'setItem')
      jest.spyOn(smartBanner, 'init')
      jest.spyOn(smartBanner, 'destroy')
    })

    beforeEach(() => {
      smartBanner.init()
      return Utils.flushPromises()
        .then(() => {
          jest.clearAllMocks()

          smartBanner.dismiss(webToken, defaultDismissInterval)
        })
    })

    afterEach(() => {
      localStorage.clear()
    })

    it('banner removed from DOM when dismissed', () => {
      expect.assertions(7)

      expect(storage.setItem).toHaveBeenCalledWith(smartBanner.STORAGE_KEY_DISMISSED, now) // add timestamp in Local Storage

      expect(Logger.log).toHaveBeenCalledWith('Smart Banner dismissed')
      expect(smartBanner.destroy).toHaveBeenCalled()

      expect(setTimeout).toHaveBeenCalledWith(expect.any(Function), defaultDismissInterval) // next initialisation scheduled
      expect(Logger.log).toHaveBeenCalledWith('Smart Banner creation scheduled on ' + new Date(now + defaultDismissInterval))

      expect(Logger.log).toHaveBeenCalledWith('Smart Banner removed') // banner removed from DOM
      expect(smartBanner.banner).toBeNull()
    })

    it('intialisation reschedules banner display when dismiss interval has not over', async () => {
      expect.assertions(4)

      smartBanner.init(webToken)
      await Utils.flushPromises()

      expect(Logger.log).toHaveBeenCalledWith('Smart Banner was dismissed')
      expect(Logger.log).toHaveBeenCalledWith('Clearing previously scheduled creation of Smart Banner')

      expect(setTimeout).toHaveBeenCalledWith(expect.any(Function), defaultDismissInterval) // initialisation scheduled
      expect(Logger.log).toHaveBeenCalledWith('Smart Banner creation scheduled on ' + new Date(now + defaultDismissInterval))
    })

    it('banner is displayed again when dismiss interval is over', async () => {
      expect.assertions(6)

      jest.spyOn(Date, 'now').mockReturnValue(now + defaultDismissInterval)
      jest.advanceTimersByTime(defaultDismissInterval)

      expect(smartBanner.init).toHaveBeenCalled()

      await Utils.flushPromises()

      expect(Logger.log).toHaveBeenCalledWith('Creating Smart Banner')
      expect(document.createElement).toHaveBeenCalled()
      expect(smartBanner.banner).not.toBeNull()
      expect(smartBanner.dismissButton).not.toBeNull()
      expect(Logger.log).toHaveBeenCalledWith('Smart Banner created')

      smartBanner.destroy()
    })
  })
})
