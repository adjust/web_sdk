import styles from './styles.scss'

export default (header: string, description: string, buttonText: string) => `
  <div class=${styles.bannerBody}>
    <button class="dismiss"></button>
    <div class="${styles.appIcon}"></div>
    <div class="${styles.textContainer}">
      <h4 class="${styles.bannerText}">${header}</h4>
      <p class="${styles.bannerText}">${description}</p>
    </div>
    <button class="action">${buttonText}</button>
  </div>`
