export default  {
  version: `js${SDK_VERSION}`,
  baseUrl: IS_TEST ? '' : 'https://app.adjust.com',
  sessionWindow: 30, // minutes
  requestValidityWindow: 28 // days
}
