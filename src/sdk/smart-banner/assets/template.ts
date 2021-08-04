import styles from './styles.module.scss'

export default (positionStyle: string, header: string, description: string, buttonText: string, href: string) => `
  <div class="${styles.banner} ${positionStyle}">
    <div class="${styles.bannerBody}">
      <div class="${styles.content}">
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
      </div>
    </div>
  </div>`
