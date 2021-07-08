import Log from './../logger'
import render, { dismissButtonId } from './assets/template'
import styles from './assets/styles.scss'

enum SmartBannerPosition {
  Top = 'top',
  Bottom = 'bottom'
}

interface SmartBannerData {
  image: string;
  header: string;
  description: string;
  buttonText: string;
  position: SmartBannerPosition;
}

/**
 * Adjust Web SDK Smart Banner
 */
class SmartBanner {
  private parent: HTMLElement;
  private banner: HTMLElement | null = null;

  /**
   * Loads banners from backend if available
   *
   * TODO: implement this stub
   */
  private getSmartBannerData(appWebToken: string): SmartBannerData {
    return {
      image: '',
      header: 'Adjust Smart Banners',
      description: 'Not so smart actually, but deep links do the magic anyway',
      buttonText: 'Let\'s go!',
      position: SmartBannerPosition.Top
    }
  }

  /**
   * Initiate Smart Banner.
   *
   * TODO: implement getting Smart Banner data and creating Smart Banner UI properly.
   *
   * @param appWebToken
   */
  init(appWebToken: string): void {
    Log.info('Initialise Smart Banner')

    const bannerData = this.getSmartBannerData(appWebToken)

    this.parent = document.body
    this.banner = document.createElement('div')
    this.banner.setAttribute('class', `${styles.banner} ${bannerData.position === SmartBannerPosition.Top ? styles.stickyToTop : styles.stickyToBottom}`)
    this.banner.innerHTML = render(bannerData.header, bannerData.description, bannerData.buttonText)

    if (bannerData.position === SmartBannerPosition.Top) {
      this.parent.insertBefore(this.banner, this.parent.firstChild)
    } else {
      this.parent.appendChild(this.banner)
    }

    const dismissButton = document.getElementById(dismissButtonId)
    if (dismissButton) {
      dismissButton.addEventListener('click', this.onDismiss, false)
    }
  }

  private destroy() {
    if (this.banner) {
      this.banner.remove()
      this.banner = null
      Log.info('Smart Banner removed')
    } else {
      Log.error('There is no Smart Banner to remove')
    }
  }

  private onDismiss = () => {
    // save dismiss timestamp
    this.destroy()
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
