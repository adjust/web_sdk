import styles from './styles.scss'

// TODO: replace .adjust-logo with a correct one to show client's image
export default (header: string, description: string, buttonText: string) => `
  <div class=${styles.bannerBody}>
    <i class="adjust-logo"></i>
    <div class="${styles.textContainer}">
      <h4 class="${styles.bannerText}">${header}</h4>
      <p class="${styles.bannerText}">${description}</p>
    </div>
    <button>${buttonText}</button>
  </div>`
