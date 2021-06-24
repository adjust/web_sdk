import Log from './../logger'
import template from './template.html'
import './styles.scss'

/**
 * Adjust Web SDK Smart Banner
 */
class SmartBanner {
  private parent: HTMLElement;
  private banner: HTMLElement;

  /**
   * Loads banners from backend if available
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

  init(appWebToken: string): void {
    Log.info('Initialise Smart Banner')

    const banner = this.getBanners(appWebToken)

    this.parent = banner.parentId && document.getElementById(banner.parentId) || document.body
    this.banner = document.createElement('div')
    this.banner.setAttribute('class', 'banner')
    this.banner.innerHTML = template

    this.parent.appendChild(this.banner)
  }

  showBanner(): void {
    if (this.banner) {
      this.banner.hidden = false
    } else {
      Log.error('There is no Smart Banner to show, have you called initialisation?')
    }
  }

  hideBanner(): void {
    if (this.banner) {
      this.banner.hidden = true
    } else {
      Log.error('There is no Smart Banner to hide, have you called initialisation?')
    }
  }
}

const smartBanner = new SmartBanner()

export { smartBanner as SmartBanner }
