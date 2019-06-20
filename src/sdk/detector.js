let _osName
let _osVersion
let _browserName
let _browserVersion
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
 * Get User Agent string
 *
 * @returns {string | string}
 * @private
 */
function _getUserAgent () {
  return navigator.userAgent || navigator.vendor || window.opera
}

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
  const ua = _getUserAgent()
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

/**
 * Provide json structure for browser name and version detection
 *
 * @param {string|undefined} browserName
 * @param {string|undefined} browserVersion
 * @returns {{browserVersion: string|undefined, browserName: string|undefined}}
 * @private
 */
function _browserParams (browserName, browserVersion) {
  return {
    browserName: _browserName = browserName,
    browserVersion: _browserVersion = browserVersion
  }
}

/**
 * Try to do a sub-match to detect UA edge cases for iOS and Android devices
 *
 * @param {string} ua
 * @returns {Array|undefined}
 * @private
 */
function _subMatch (ua) {
  const map = {OPR: 'Opera', EdgiOS: 'Edge', EdgA: 'Edge', CriOS: 'Chrome', OPiOS: 'Opera Mini', FxiOS: 'Firefox'}
  const subMatch = ua.match(/\b(OPR|Edge|EdgiOS|EdgA|CriOS|Opera\sMini|OPiOS|FxiOS)\/(\d+)/)

  if (subMatch) {
    return [
      subMatch[1].replace((new RegExp(Object.keys(map).join('|'))), k => map[k]),
      subMatch[2]
    ]
  }
}

/**
 * Detect browser name and version
 *
 * @returns {{browserVersion: string|undefined, browserName: string|undefined}}
 */
function getBrowserNameAndVersion () {
  const ua = _getUserAgent()

  if ((_browserName || _browserVersion) && __ADJUST__ENV !== 'test') {
    return _browserParams(_browserName, _browserVersion)
  }

  let match = ua.match(/(opera|opios|chrome|crios|safari|firefox|fxios|msie|trident(?=\/))\/?\s*(\d+)/i) || []
  let subMatch

  if (match[1] === 'Trident' || match[1] === 'MSIE') {
    if (match[1] === 'Trident') {
      subMatch = ['IE', /\brv[ :]+(\d+)/g.exec(ua)[1]]
    } else {
      subMatch = ua.indexOf('Opera') !== -1 ? ['Opera', undefined] : (['IE', /MSIE\s(\d+)/.exec(ua)[1]])
    }
    return _browserParams(subMatch[0], subMatch[1])
  }

  subMatch = _subMatch(ua)

  if (subMatch) {
    return _browserParams(subMatch[0], subMatch[1])
  }

  match = match[2] ? [match[1], match[2]] : []

  if(match && (subMatch = ua.match(/version\/(\d+)/i))) {
    match.splice(1, 1, subMatch[1])
  }

  return _browserParams(match[0], match[1])
}

/**
 * Basic device detection
 *
 * @returns {string}
 */
function getDeviceType () {
  const ua = _getUserAgent()

  if ((navigator.platform || '').toLowerCase().indexOf('mac') !== -1) {
    return 'mac'
  }

  if (/bot|googlebot|crawler|spider|robot|crawling|slurp/i.test(ua)) {
    return 'bot'
  }

  if (/(iPhone|iPad|iPod)/.test(ua) && !window.MSStream) {
    if (/iPod/.test(ua)) {
      return 'ipod'
    }
    if (/iPhone/.test(ua)) {
      return 'iphone'
    }
    if (/iPad/.test(ua)) {
      return 'ipad'
    }
  }

  if( /Android|webOS|BlackBerry|IEMobile|Opera Mini/i.test(ua) ) {
    return 'mobile'
  }
}

/**
 * Get cpu type from navigator.platform property
 *
 * @returns {string}
 */
function getCpuType () {
  const ua = _getUserAgent()
  const overrideWin32 = navigator.platform === 'Win32' && (ua.indexOf('WOW64') !== -1 || ua.indexOf('Win64') !== -1)

  return overrideWin32 ? 'Win64' : navigator.platform
}

export {
  getOsNameAndVersion,
  getBrowserNameAndVersion,
  getDeviceType,
  getCpuType
}
