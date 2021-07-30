import styles from '../assets/styles.module.scss'
import render from '../assets/template'
import { Position, SmartBannerData } from '../network/api'
import { AppIcon } from './app-icon'

export class SmartBannerView {
  private parent: HTMLElement = document.body
  private banner: HTMLElement
  private dismissButton: Element | null = null

  private onDismiss: (() => void)

  constructor(data: SmartBannerData, onDismiss: () => void, endpoint: string) {
    this.onDismiss = onDismiss

    this.render(data, endpoint)
  }

  private render(bannerData: SmartBannerData, endpoint: string) {
    this.banner = document.createElement('div')
    const positionStyle = bannerData.position === Position.Top ? styles.stickyToTop : styles.stickyToBottom
    this.banner.setAttribute('class', `${styles.banner} ${positionStyle}`)
    this.banner.innerHTML = render(bannerData.header, bannerData.description, bannerData.buttonText)

    if (bannerData.position === Position.Top) {
      this.parent.insertBefore(this.banner, this.parent.firstChild)
    } else {
      this.parent.appendChild(this.banner)
    }

    this.dismissButton = this.getElemByClass(styles.dismiss)
    if (this.dismissButton) {
      this.dismissButton.addEventListener('click', this.onDismiss)
    }

    const appIconPlaceholder = this.getElemByClass<HTMLElement>(styles.placeholder)
    const appIconImage = this.getElemByClass<HTMLImageElement>(styles.image)

    if (appIconImage && appIconPlaceholder) {
      new AppIcon(bannerData, appIconImage, appIconPlaceholder)
    }

    const actionButton = this.getElemByClass<HTMLLinkElement>(styles.action)
    if (actionButton) {
      const query = bannerData.deeplinkPath ? `?deeplink=${encodeURIComponent(bannerData.deeplinkPath)}` : ''
      actionButton.href = `${endpoint}/${bannerData.trackerToken}${query}`
    }
  }

  public show() {
    this.banner.hidden = false
  }

  public hide() {
    this.banner.hidden = true
  }

  public destroy() {
    this.removeDismissButtonHandler()
    this.banner.remove()
  }

  private removeDismissButtonHandler() {
    if (this.dismissButton && this.onDismiss) {
      this.dismissButton.removeEventListener('click', this.onDismiss)
      this.dismissButton = null
    }
  }

  private getElemByClass<T extends Element>(classNames: string): T | null {
    if (this.banner) {
      const elements = this.banner.getElementsByClassName(classNames)
      return elements.length > 0 ? elements[0] as T : null
    }

    return null
  }
}
