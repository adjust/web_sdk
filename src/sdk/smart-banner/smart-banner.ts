import Logger from './../logger'
import { getDeviceOS } from './detect-os'
import { storage } from './local-storage'
import { fetchSmartBannerData, SmartBannerData } from './network/api'
import { SmartBannerView } from './view/smart-banner-view'
import { Network } from './network/network'

type LogLevel = 'none' | 'error' | 'warning' | 'info' | 'verbose'

/**
 * Adjust Web SDK Smart Banner
 */
class SmartBanner {
  private dismissedStorageKey = 'closed'
  private timer: NodeJS.Timeout | null = null
  private dataFetchPromise: Promise<SmartBannerData | null> | null
  private banner: SmartBannerView | null
  private logLevel: LogLevel

  /**
   * Initiate Smart Banner
   *
   * @param appWebToken token used to get data from backend
   */
  init(appWebToken: string, logLevel: LogLevel = 'error') {
    this.logLevel = logLevel
    Logger.setLogLevel(logLevel)

    if (this.banner) {
      Logger.error('Smart Banner already exists')
      return
    }

    if (this.dataFetchPromise) {
      Logger.error('Smart Banner is initialising already')
      return
    }

    const deviceOs = getDeviceOS()
    if (!deviceOs) {
      Logger.log('This platform is not one of the targeting ones, Smart Banner will not be shown')
      return
    }

    this.dataFetchPromise = fetchSmartBannerData(appWebToken, deviceOs)

    this.dataFetchPromise.then(bannerData => {
      this.dataFetchPromise = null

      if (!bannerData) {
        Logger.log(`No Smart Banners for ${deviceOs} platform found`)
        return
      }

      const whenToShow = this.getDateToShowAgain(bannerData.dismissInterval)
      if (Date.now() < whenToShow) {
        Logger.log('Smart Banner was dismissed')
        this.scheduleCreation(appWebToken, whenToShow)
        return
      }

      Logger.log('Creating Smart Banner')

      this.banner = new SmartBannerView(
        bannerData,
        () => this.dismiss(appWebToken, bannerData.dismissInterval),
        Network.getEndpoint()
      )

      Logger.log('Smart Banner created')
    })
  }

  /**
   * Show Smart Banner
   */
  show(): void {
    if (this.banner) {
      this.banner.show()
    } else if (this.dataFetchPromise) {
      Logger.log('Smart Banner will be shown after initialisation finished')

      this.dataFetchPromise
        .then(() => {
          Logger.log('Initialisation finished, showing Smart Banner')
          this.show()
        })
    } else {
      Logger.error('There is no Smart Banner to show, have you called initialisation?')
    }
  }

  /**
   * Hide Smart Banner
   */
  hide(): void {
    if (this.banner) {
      this.banner.hide()
    } else if (this.dataFetchPromise) {
      Logger.log('Smart Banner will be hidden after initialisation finished')

      this.dataFetchPromise
        .then(() => {
          Logger.log('Initialisation finished, hiding Smart Banner')
          this.hide()
        })
    } else {
      Logger.error('There is no Smart Banner to hide, have you called initialisation?')
    }
  }

  /**
   * Removes Smart Banner from DOM
   */
  private destroy() {
    if (this.banner) {
      this.banner.destroy()
      this.banner = null
      Logger.log('Smart Banner removed')
    } else {
      Logger.error('There is no Smart Banner to remove')
    }
  }

  /**
   * Schedules next Smart Banner show and removes banner from DOM
   */
  private dismiss(appWebToken: string, dismissInterval: number) {
    Logger.log('Smart Banner dismissed')

    storage.setItem(this.dismissedStorageKey, Date.now())
    const whenToShow = this.getDateToShowAgain(dismissInterval)
    this.scheduleCreation(appWebToken, whenToShow)

    this.destroy()
  }

  /**
   * Sets a timeout to schedule next Smart Banner show
   */
  private scheduleCreation(appWebToken: string, when: number) {
    if (this.timer) {
      Logger.log('Clearing previously scheduled creation of Smart Banner')
      clearTimeout(this.timer)
      this.timer = null
    }

    const delay = when - Date.now()
    this.timer = setTimeout(
      () => {
        this.timer = null
        this.init(appWebToken, this.logLevel)
      },
      delay)

    Logger.log('Smart Banner creation scheduled on ' + new Date(when))
  }

  /**
   * Returns date when Smart Banner should be shown again
   */
  private getDateToShowAgain(dismissInterval: number): number {
    const dismissedDate = storage.getItem(this.dismissedStorageKey)
    if (!dismissedDate) {
      return Date.now()
    }

    return dismissedDate + dismissInterval
  }
}

const smartBanner = new SmartBanner()

export { smartBanner as SmartBanner }
