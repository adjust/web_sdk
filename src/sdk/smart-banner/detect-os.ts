/**
 * Operation systems
 */
export enum DeviceOS {
  Android = 'android',
  iOS = 'ios',
  WindowsPC = 'windows',
  WindowsPhone = 'windows-phone',
}

/**
 * Returns one of android, ios, windows, windows-phone or undefined for another OS.
 */
export function getDeviceOS(): Maybe<DeviceOS> {
  const userAgent = navigator?.userAgent?.toLowerCase()

  if (!userAgent || userAgent.length < 1) {
    return undefined
  }

  if(/ipad|iphone|ipod/.test(userAgent)) {
    return DeviceOS.iOS
  }

  // Checking Windows first because Lumia devices could have for example
  // "Mozilla/5.0 (Windows Mobile 10; Android 8.0.0; Microsoft; Lumia 950XL) ..." user agent
  if (userAgent.includes('windows')) {
    if (/phone|mobile/.test(userAgent)) {
      return DeviceOS.WindowsPhone
    }

    return DeviceOS.WindowsPC
  }

  if (userAgent.includes('android')) {
    return DeviceOS.Android
  }

  return undefined
}
