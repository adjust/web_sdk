import styles from './styles.module.scss'

export const dismissButtonId = 'dismiss-button'
export const appIconImageId = 'app-icon-image'
export const appIconPlaceholderId = 'app-icon-placeholder'

export default (header: string, description: string, buttonText: string) => `
  <div class=${styles.bannerBody}>
    <button id="${dismissButtonId}" class="${styles.dismiss}"></button>
    <div class="${styles.appIcon}">
      <div id="${appIconPlaceholderId}" class="${styles.placeholder}"></div>
      <img id="${appIconImageId}" class="${styles.image}" alt="App Icon"></img>
    </div>
    <div class="${styles.textContainer}">
      <h4 class="${styles.bannerText}">${header}</h4>
      <p class="${styles.bannerText}">${description}</p>
    </div>
    <button class="${styles.action}">${buttonText}</button>
  </div>`
