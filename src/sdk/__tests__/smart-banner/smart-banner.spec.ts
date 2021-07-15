import * as DetectOS from '../../smart-banner/detect-os'
import { storage } from '../../smart-banner/local-storage'

jest.mock('../../logger')
jest.useFakeTimers()

// hardcoded for now, should be mocked as a part of server response
const defaultDismissInterval = 24 * 60 * 60 * 1000

describe('Smart banner tests', () => {
  const platform = DetectOS.DeviceOS.iOS
  let deviceOSSpy: jest.SpyInstance<DetectOS.DeviceOS | undefined>

  let Logger
  let smartBanner

  beforeAll(() => {
    deviceOSSpy = jest.spyOn(DetectOS, 'getDeviceOS').mockReturnValue(platform)
  })

  afterEach(() => {
    jest.resetModules()
  })

  afterAll(() => {
    jest.clearAllTimers()
    jest.clearAllMocks()
  })

  describe('general flow', () => {
    let dateSpy: jest.SpyInstance

    const now = Date.now()

    beforeAll(() => {
      Logger = require('../../logger').default
      jest.spyOn(Logger, 'log')
      jest.spyOn(Logger, 'error')

      smartBanner = require('../../smart-banner/smart-banner').SmartBanner

      jest.spyOn(document, 'createElement')
      jest.spyOn(storage, 'getItem')
      jest.spyOn(storage, 'setItem')
      dateSpy = jest.spyOn(Date, 'now')
      dateSpy.mockReturnValue(now)

      jest.spyOn(smartBanner, 'init')
    })

    it('smart banner initialised and shown', () => {
      smartBanner.init('abc123')

      expect(Logger.log).toHaveBeenCalledWith('Creating Smart Banner')

      expect(document.createElement).toHaveBeenCalled()

      expect(smartBanner.banner).not.toBeNull()
      expect(smartBanner.dismissButton).not.toBeNull()

      expect(Logger.log).toHaveBeenCalledWith('Smart Banner created')
    })

    it('can not initialise smart banner repeatedly', () => {
      smartBanner.init('abc123')

      expect(Logger.error).toHaveBeenCalledWith('Smart Banner already exists')
    })

    it('hide smart banner', () => {
      smartBanner.hide()

      expect(smartBanner.banner.hidden).toBeTruthy()
    })

    it('show smart banner', () => {
      smartBanner.show()

      expect(smartBanner.banner.hidden).toBeFalsy()
    })

    it('dismiss smart banner', () => {
      smartBanner.onDismiss()

      expect(storage.setItem).toHaveBeenCalledWith(smartBanner.dismissedStorageKey, now) // add timestamp in Local Storage

      expect(Logger.log).toHaveBeenCalledWith('Smart Banner dismissed')

      expect(Logger.log).toHaveBeenCalledWith('Smart Banner removed') // banner removed from DOM
      expect(smartBanner.banner).toBeNull()
      expect(smartBanner.dismissButton).toBeNull()

      expect(setTimeout).toHaveBeenCalledWith(expect.any(Function), defaultDismissInterval) // next initialisation scheduled
      expect(Logger.log).toHaveBeenCalledWith('Smart Banner creation scheduled on ' + new Date(now + defaultDismissInterval))
    })

    it('can not initialise again when dismissed', () => {
      smartBanner.init('abc123')

      expect(Logger.log).toHaveBeenCalledWith('Smart Banner was dismissed')

      expect(setTimeout).toHaveBeenCalledWith(expect.any(Function), defaultDismissInterval) // initialisation scheduled
      expect(Logger.log).toHaveBeenCalledWith('Smart Banner creation scheduled on ' + new Date(now + defaultDismissInterval))

      dateSpy.mockReturnValue(now + defaultDismissInterval)
      jest.advanceTimersByTime(defaultDismissInterval)
    })

    it('smart banner appeared after dismissal interval is over', () => {
      expect(smartBanner.init).toHaveBeenCalled()

      expect(Logger.log).toHaveBeenCalledWith('Creating Smart Banner')

      expect(document.createElement).toHaveBeenCalled()

      expect(smartBanner.banner).not.toBeNull()
      expect(smartBanner.dismissButton).not.toBeNull()

      expect(Logger.log).toHaveBeenCalledWith('Smart Banner created')
    })
  })

  describe('can not show or hide banner if it was not initialised', () => {
    beforeAll(() => {
      Logger = require('../../logger').default
      jest.spyOn(Logger, 'error')

      smartBanner = require('../../smart-banner/smart-banner').SmartBanner
    })

    it('hide smart banner', () => {
      smartBanner.hide()
      expect(Logger.error).toHaveBeenCalledWith('There is no Smart Banner to hide, have you called initialisation?')
    })

    it('show smart banner', () => {
      smartBanner.show()
      expect(Logger.error).toHaveBeenCalledWith('There is no Smart Banner to show, have you called initialisation?')
    })
  })

  /*describe(('no banner for platform'), () => {
    beforeAll(() => {
      Logger = require('../../logger').default
      jest.spyOn(Logger, 'log')

      deviceOSSpy.mockReturnValueOnce(undefined)
      smartBanner = require('../../smart-banner/smart-banner').SmartBanner
    })

    // getting smart banner data depending on platform isn't implemented yet
    it('logs message and does not create Smart Banner', () => {
      smartBanner.init('abc123')

      expect(Logger.log).toHaveBeenCalledWith(`There is no Smart Banners created for ${platform} platform`)
    })
  })*/

  describe(('not one of target platforms'), () => {
    beforeAll(() => {
      Logger = require('../../logger').default
      jest.spyOn(Logger, 'log')

      deviceOSSpy.mockReturnValueOnce(undefined)
      smartBanner = require('../../smart-banner/smart-banner').SmartBanner
    })

    it('logs message and does not create Smart Banner', () => {
      smartBanner.init('abc123')

      expect(Logger.log).toHaveBeenCalledWith('This platform is not one of the targeting ones, Smart Banner will not be shown')
    })
  })
})
