import Logger from '../logger'
import { getDeviceOS } from './detect-os'
import { Storage, StorageFactory } from './storage/factory'
import { fetchSmartBannerData, SmartBannerData } from './api'
import { SmartBannerView } from './view/smart-banner-view'
import { Network } from './network/network'
import { XhrNetwork } from './network/xhr-network'
import { NetworkWithUrlStrategy } from './network/url-startegy-network'
import { DataResidency } from './network/url-strategy/data-residency'

type LogLevel = 'none' | 'error' | 'warning' | 'info' | 'verbose'

type Callback = () => any;

interface SmartBannerOptions {
  webToken: string;
  logLevel?: LogLevel;
  dataResidency?: DataResidency.Region;
  onCreated?: Callback;
  onDismissed?: Callback;
}

/**
 * Adjust Web SDK Smart Banner
 */
export class SmartBanner {
  private readonly STORAGE_KEY_DISMISSED = 'closed'
  private network: Network
  private storage: Storage
  private timer: ReturnType<typeof setTimeout> | null = null
  private dataFetchPromise: Promise<SmartBannerData | null> | null
  private banner: SmartBannerView | null
  private onCreated?: Callback
  private onDismissed?: Callback

  constructor({ webToken, logLevel = 'error', dataResidency, onCreated, onDismissed }: SmartBannerOptions, network?: Network) {
    this.onCreated = onCreated
    this.onDismissed = onDismissed

    Logger.setLogLevel(logLevel)

    const config = dataResidency ? { dataResidency } : {}
    this.network = network || new NetworkWithUrlStrategy(new XhrNetwork(), { urlStrategyConfig: config })

    this.storage = StorageFactory.createStorage()

    this.init(webToken)
  }

  /**
   * Initiate Smart Banner
   *
   * @param webToken token used to get data from backend
   */
  init(webToken: string) {
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

    this.dataFetchPromise = fetchSmartBannerData(webToken, deviceOs, this.network)

    this.dataFetchPromise.then(bannerData => {
      this.dataFetchPromise = null

      if (!bannerData) {
        Logger.log(`No Smart Banners for ${deviceOs} platform found`)
        return
      }

      const whenToShow = this.getDateToShowAgain(bannerData.dismissInterval)
      if (Date.now() < whenToShow) {
        Logger.log('Smart Banner was dismissed')
        this.scheduleCreation(webToken, whenToShow)
        return
      }

      Logger.log('Creating Smart Banner')

      this.banner = new SmartBannerView(
        bannerData,
        () => this.dismiss(webToken, bannerData.dismissInterval),
        this.network.endpoint
      )

      Logger.log('Smart Banner created')

      if (this.onCreated) {
        this.onCreated()
      }
    })
  }

  /**
   * Show Smart Banner
   */
  show(): void {
    if (this.banner) {
      this.banner.show()
      return
    }

    if (this.dataFetchPromise) {
      Logger.log('Smart Banner will be shown after initialisation finished')

      this.dataFetchPromise
        .then(() => {
          Logger.log('Initialisation finished, showing Smart Banner')
          this.show()
        })

      return
    }

    Logger.error('There is no Smart Banner to show, have you called initialisation?')
  }

  /**
   * Hide Smart Banner
   */
  hide(): void {
    if (this.banner) {
      this.banner.hide()
      return
    }

    if (this.dataFetchPromise) {
      Logger.log('Smart Banner will be hidden after initialisation finished')

      this.dataFetchPromise
        .then(() => {
          Logger.log('Initialisation finished, hiding Smart Banner')
          this.hide()
        })

      return
    }

    Logger.error('There is no Smart Banner to hide, have you called initialisation?')
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
  private dismiss(webToken: string, dismissInterval: number) {
    Logger.log('Smart Banner dismissed')

    this.storage.setItem(this.STORAGE_KEY_DISMISSED, Date.now())
    const whenToShow = this.getDateToShowAgain(dismissInterval)
    this.scheduleCreation(webToken, whenToShow)

    this.destroy()

    if (this.onDismissed) {
      this.onDismissed()
    }
  }

  /**
   * Sets a timeout to schedule next Smart Banner show
   */
  private scheduleCreation(webToken: string, when: number) {
    if (this.timer) {
      Logger.log('Clearing previously scheduled creation of Smart Banner')
      clearTimeout(this.timer)
      this.timer = null
    }

    const delay = when - Date.now()
    this.timer = setTimeout(
      () => {
        this.timer = null
        this.init(webToken)
      },
      delay)

    Logger.log('Smart Banner creation scheduled on ' + new Date(when))
  }

  /**
   * Returns date when Smart Banner should be shown again
   */
  private getDateToShowAgain(dismissInterval: number): number {
    const dismissedDate = this.storage.getItem(this.STORAGE_KEY_DISMISSED)

    if (!dismissedDate || typeof dismissedDate !== 'number') {
      return Date.now()
    }

    return dismissedDate + dismissInterval
  }
}
