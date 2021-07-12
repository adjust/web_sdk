import Log from './../logger'
import { getDeviceOS, DeviceOS } from './detect-os'
import { storage } from './local-storage'
import render, { dismissButtonId } from './assets/template'
import styles from './assets/styles.module.scss'

enum SmartBannerPosition {
  Top = 'top',
  Bottom = 'bottom'
}

interface SmartBannerData {
  image: string;
  header: string;
  description: string;
  buttonText: string;
  dismissInterval: number;
  position: SmartBannerPosition;
}

/**
 * Adjust Web SDK Smart Banner
 */
class SmartBanner {
  private dismissedStorageKey = 'closed'

  private parent: HTMLElement = document.body
  private banner: HTMLElement | null = null
  private dismissButton: Element | null = null

  private onDismiss: (() => void) | null
  private timer: NodeJS.Timeout | null = null

  /**
   * Loads banners from backend if available
   *
   * TODO: implement this stub
   */
  private getSmartBannerData(appWebToken: string, deviceOs: DeviceOS): SmartBannerData | null {
    return {
      image: '',
      header: 'Adjust Smart Banners',
      description: 'Not so smart actually, but deep links do the magic anyway',
      buttonText: 'Let\'s go!',
      dismissInterval: 24 * 60 * 60 * 1000, // 1 day in millis before show banner next time
      position: SmartBannerPosition.Top
    }
  }

  /**
   * Initiate Smart Banner.
   *
   * @param appWebToken token used to get data from backend
   */
  init(appWebToken: string): void {
    Log.info('Smart Banner initialisation called')

    if (this.banner) {
      Log.error('Smart Banner already exists')
      return
    }

    const deviceOs = getDeviceOS()
    if (!deviceOs) {
      Log.info('This platform is not one of the targeting ones, Smart Banner will not be shown')
      return
    }

    const bannerData = this.getSmartBannerData(appWebToken, deviceOs)
    if (!bannerData) {
      Log.info(`There is no Smart Banners created for [${deviceOs}] platform`)
      return
    }

    if (this.isDismissed(bannerData.dismissInterval)) {
      const whenToShow = this.getDateToShowAgain(bannerData.dismissInterval)
      Log.info('Smart Banner was dismissed')
      this.scheduleCreation(appWebToken, whenToShow)
      return
    }

    Log.info('Creating Smart Banner')

    this.banner = document.createElement('div')
    this.banner.setAttribute('class', `${styles.banner} ${bannerData.position === SmartBannerPosition.Top ? styles.stickyToTop : styles.stickyToBottom}`)
    this.banner.innerHTML = render(bannerData.header, bannerData.description, bannerData.buttonText)

    if (bannerData.position === SmartBannerPosition.Top) {
      this.parent.insertBefore(this.banner, this.parent.firstChild)
    } else {
      this.parent.appendChild(this.banner)
    }

    this.dismissButton = this.banner.getElementsByClassName(styles.dismiss).namedItem(dismissButtonId)
    if (this.dismissButton) {
      this.onDismiss = () => this.dismissButtonHandler(appWebToken, bannerData.dismissInterval)
      this.dismissButton.addEventListener('click', this.onDismiss)
    }

    Log.info('Smart Banner created')
  }

  private destroy() {
    if (this.banner) {
      this.banner.remove()
      this.banner = null
      this.dismissButton = null
      Log.info('Smart Banner removed')
    } else {
      Log.error('There is no Smart Banner to remove')
    }
  }

  private dismissButtonHandler(appWebToken: string, dismissInterval: number) {
    Log.info('Smart Banner dismissed')

    if (this.dismissButton && this.onDismiss) {
      this.dismissButton.removeEventListener('click', this.onDismiss)
    }

    storage.setItem(this.dismissedStorageKey, Date.now())
    const whenToShow = this.getDateToShowAgain(dismissInterval)
    this.scheduleCreation(appWebToken, whenToShow)

    this.destroy()
  }

  private scheduleCreation(appWebToken: string, when: number) {
    if (this.timer) {
      Log.info('Clearing previously scheduled creation of Smart Banner')
      clearTimeout(this.timer)
    }

    const delay = when - Date.now()
    Log.info('Smart Banner creation scheduled on ' + new Date(when))
    this.timer = setTimeout(() => {
      this.timer = null
      this.init(appWebToken)
    }, delay)
  }

  private getDateToShowAgain(dismissInterval: number): number {
    const dismissedDate = storage.getItem(this.dismissedStorageKey)
    if (!dismissedDate) {
      return Date.now()
    }

    return dismissedDate + dismissInterval
  }

  private isDismissed(dismissInterval: number): boolean {
    const timeToShow = this.getDateToShowAgain(dismissInterval)
    const now = Date.now()
    return now < timeToShow
  }

  show(): void {
    if (this.banner) {
      this.banner.hidden = false
    } else {
      Log.error('There is no Smart Banner to show, have you called initialisation?')
    }
  }

  hide(): void {
    if (this.banner) {
      this.banner.hidden = true
    } else {
      Log.error('There is no Smart Banner to hide, have you called initialisation?')
    }
  }
}

const smartBanner = new SmartBanner()

export { smartBanner as SmartBanner }
