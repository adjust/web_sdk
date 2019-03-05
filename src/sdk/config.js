import Constants from './constants'

export default  {
  version: `js${SDK_VERSION}`,
  baseUrl: IS_TEST ? '' : 'https://app.adjust.com',
  sessionWindow: 30 * Constants.minute,
  sessionTimerWindow: 60 * Constants.second,
  requestValidityWindow: 28 * Constants.day
}
