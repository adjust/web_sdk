export default {
  get second () {
    return 1000
  },
  get minute () {
    return 60 * this.second
  },
  get hour () {
    return 60 * this.minute
  },
  get day () {
    return 24 * this.hour
  }
}
