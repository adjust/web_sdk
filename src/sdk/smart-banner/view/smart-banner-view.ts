import styles from '../assets/styles.module.scss'
import render, { actionButtonId, appIconImageId, appIconPlaceholderId, dismissButtonId } from '../assets/template'
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

    this.dismissButton = this.getElemByClassAndId(styles.dismiss, dismissButtonId)
    if (this.dismissButton) {
      this.dismissButton.addEventListener('click', this.onDismiss)
    }

    const appIconPlaceholder = this.getElemByClassAndId<HTMLElement>(styles.placeholder, appIconPlaceholderId)
    const appIconImage = this.getElemByClassAndId<HTMLImageElement>(styles.image, appIconImageId)

    if (appIconImage && appIconPlaceholder) {
      new AppIcon(bannerData, appIconImage, appIconPlaceholder)
    }

    const actionButton = this.getElemByClassAndId<HTMLLinkElement>(styles.action, actionButtonId)
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

  private getElemByClassAndId<T extends Element>(classNames: string, id: string): T | null {
    if (this.banner) {
      return this.banner.getElementsByClassName(classNames).namedItem(id) as T
    }

    return null
  }
}
