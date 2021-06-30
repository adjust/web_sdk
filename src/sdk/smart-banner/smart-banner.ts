import Log from './../logger'
import render from './assets/template'
import styles from './assets/styles.scss'

/**
 * Adjust Web SDK Smart Banner
 */
class SmartBanner {
  private parent: HTMLElement;
  private banner: HTMLElement;

  /**
   * Loads banners from backend if available
   *
   * TODO: implement this stub
   */
  private getBanners(appWebToken: string) {
    return {
      parentId: '',
      image: '',
      header: 'Adjust Smart Banners',
      description: 'Not so smart actually, but deep links do the magic anyway',
      buttonText: 'Let\'s go!'
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

    const bannerData = this.getBanners(appWebToken)

    this.parent = bannerData.parentId && document.getElementById(bannerData.parentId) || document.body
    this.banner = document.createElement('div')
    this.banner.setAttribute('class', styles.banner)
    this.banner.innerHTML = render(bannerData.header, bannerData.description, bannerData.buttonText)

    this.parent.appendChild(this.banner)
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
