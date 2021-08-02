import styles from './styles.module.scss'

export default (header: string, description: string, buttonText: string, href: string) => `
  <div class=${styles.bannerBody}>
    <button class="${styles.dismiss}"></button>
    <div class="${styles.appIcon}">
      <div class="${styles.placeholder}"></div>
      <img class="${styles.image}" alt="${header}">
    </div>
    <div class="${styles.textContainer}">
      <h4 class="${styles.bannerText}">${header}</h4>
      <p class="${styles.bannerText}">${description}</p>
    </div>
    <a class="${styles.action}" href=${href}>${buttonText}</a>
  </div>`
