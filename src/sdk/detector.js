let _osName
let _osVersion
/**
 * Regular expressions for detecting OS name and OS version
 * IMPORTANT: order does matter, do not change it!
 *
 * @type {Array}
 * @private
 */
const _osRules = [{
  name: 'windows-phone',
  nameRegex: /Windows\sPhone/,
  version: _getWindowsPhoneOSVersion
}, {
  name: 'android',
  nameRegex: /Android/,
  version: _getAndroidOSVersion
}, {
  name: 'ios',
  nameRegex: /(iPhone|iPad|iPod)/,
  version: _getiOSVersion
}, {
  name: 'windows',
  nameRegex: /Win/,
  version: _getWindowsOSVersion
}, {
  name: 'macos',
  nameRegex: /Mac OS X/,
  version: _getMacOSVersion
}, {
  name: 'webos',
  nameRegex: /webOS/,
  version: _getWebOSVersion
}, {
  name: 'symbian',
  nameRegex: /Symbian|SymbianOS|SymbOS/,
  version: _getSymbianOSVersion
}, {
  name: 'blackberry',
  nameRegex: /PlayBook|BlackBerry|BB10;/
}, {
  name: 'linux',
  nameRegex: /Linux/
}]

/**
 * Extract Windows Phone OS version
 *
 * @param {string} ua
 * @returns {string|undefined}
 * @private
 */
function _getWindowsPhoneOSVersion (ua) {
  const match = ua.match(/Windows\sPhone\s(OS\s)?([.\d]+)/) || []
  return match[2] || match[1]
}

/**
 * Extract Android OS version
 *
 * @param {string} ua
 * @returns {string|undefined}
 * @private
 */
function _getAndroidOSVersion (ua) {
  const match = ua.match(/Android\s([._\d]+)/) || []
  return match[1]
}

/**
 * Extract iOS version
 *
 * @param {string} ua
 * @returns {string|undefined}
 * @private
 */
function _getiOSVersion (ua) {

  let version = ua.match(/OS (\d+)_(\d+)_?(\d+)?/)
  const parse = (v) => parseInt(v || 0, 10)

  return [
    parse(version[1]),
    parse(version[2]),
    parse(version[3])
  ].join('.')
}

/**
 * Extract Windows OS version
 *
 * @param {string} ua
 * @returns {string|undefined}
 * @private
 */
function _getWindowsOSVersion (ua) {
  const windowsMap = [
    ['2000', /NT\s5\.0/],
    ['XP', /NT\s5\.(1|2)/],
    ['Vista', /NT\s6\.0/],
    ['7', /NT\s6\.1/],
    ['8', /NT\s6\.2/],
    ['8.1', /NT\s6\.3/],
    ['10', /NT\s(6\.4|10\.0)/]
  ]
  let version

  for (let i = 0; i < windowsMap.length; i += 1) {
    if (windowsMap[i][1].test(ua)) {
      return version = windowsMap[i][0]
    }
  }

  return version
}

/**
 * Extract Mac OS version
 *
 * @param {string} ua
 * @returns {string|undefined}
 * @private
 */
function _getMacOSVersion (ua) {
  const match = ua.match(/Mac OS X (10[._\d]+)/) || []
  return match[1].replace(/_/g, '.')
}

/**
 * Extract webOS version
 *
 * @param {string} ua
 * @returns {string|undefined}
 * @private
 */
function _getWebOSVersion (ua) {
  const match = ua.match(/webOS\/([.\d]+)/) || []
  return match[1]
}

/**
 * Extract Symbian OS version
 *
 * @param {string} ua
 * @returns {string|undefined}
 * @private
 */
function _getSymbianOSVersion (ua) {
  const match = ua.match(/Symbian(OS)?\/([.\da-z]+)/) || []
  return match[2] || match[1]
}

/**
 * Detects OS name and version, by default is undefined
 *
 * @returns {{osVersion: string|undefined, osName: string|undefined}}
 */
function getOsNameAndVersion () {

  const ua = navigator.userAgent || navigator.vendor || window.opera
  let result = {osName: _osName, osVersion: _osVersion}

  if ((_osName || _osVersion) && __ADJUST__ENV !== 'test') {
    return result
  }

  for (let i = 0; i < _osRules.length; i += 1) {
    if (_osRules[i].nameRegex.test(ua)) {
      return result = {
        osName: _osName = _osRules[i].name,
        osVersion: _osVersion = _osRules[i].version ? _osRules[i].version(ua) : undefined
      }
    }
  }

  return result
}

export {
  getOsNameAndVersion
}
