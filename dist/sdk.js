(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["adjustSDK"] = factory();
	else
		root["adjustSDK"] = factory();
})(window, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);

// CONCATENATED MODULE: ./src/sdk/config.js
/* harmony default export */ var config = ({
  version: "js".concat("4.1.0"),
  baseUrl:  false ? undefined : 'https://app.adjust.com'
});
// CONCATENATED MODULE: ./src/sdk/utilities.js
function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

/**
 * Build human readable list
 *
 * @param {Array} array
 * @returns {String}
 */
function buildList(array) {
  if (!array.length) {
    return '';
  }

  if (array.length === 1) {
    return array[0];
  }

  var lastIndex = array.length - 1;
  var firstPart = array.slice(0, lastIndex).join(', ');
  return "".concat(firstPart, " and ").concat(array[lastIndex]);
}
/**
 * Check if object is empty
 *
 * @param {Object} obj
 * @returns {boolean}
 */


function isEmpty(obj) {
  return !Object.keys(obj).length && obj.constructor === Object;
}
/**
 * Check if value is object
 *
 * @param {Object} obj
 * @returns {boolean}
 */


function isObject(obj) {
  return _typeof(obj) === 'object' && obj !== null;
}
/**
 * Check if string is valid json
 *
 * @param {string} string
 * @returns {boolean}
 * @private
 */


function isValidJson(string) {
  try {
    var json = JSON.parse(string);
    return _typeof(json) === 'object';
  } catch (e) {
    return false;
  }
}
/**
 * Prepend zero to be used in certain format
 *
 * @param {number} value
 * @param {number} power
 * @returns {string}
 * @private
 */


function _prependZero(value) {
  var power = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;
  var formatted = value + '';

  for (var i = 1; i <= power; i += 1) {
    if (value < Math.pow(10, i)) {
      formatted = "0".concat(formatted);
    }
  }

  return formatted;
}
/**
 * Get formatted date (YYYY-MM-DD)
 * @param date
 * @returns {string}
 * @private
 */


function _getDate(date) {
  var day = _prependZero(date.getDate());

  var month = _prependZero(date.getMonth() + 1);

  var year = date.getFullYear();
  return [year, month, day].join('-');
}
/**
 * Get formatted hours, minutes, seconds and milliseconds (HH:mm:ss.SSS)
 *
 * @param {Date} date
 * @returns {string}
 * @private
 */


function _getTime(date) {
  var hours = _prependZero(date.getHours(), 1);

  var minutes = _prependZero(date.getMinutes());

  var seconds = _prependZero(date.getSeconds());

  var milliseconds = _prependZero(date.getMilliseconds(), 2);

  return [hours, minutes, seconds].join(':') + '.' + milliseconds;
}
/**
 * Get formatted timezone (ZZ)
 *
 * @param {Date} date
 * @returns {string}
 * @private
 */


function _getTimezone(date) {
  var offsetInMinutes = date.getTimezoneOffset();

  var hoursOffset = _prependZero(Math.floor(Math.abs(offsetInMinutes) / 60));

  var minutesOffset = _prependZero(Math.abs(offsetInMinutes) % 60);

  var sign = offsetInMinutes > 0 ? '-' : '+';
  return sign + hoursOffset + minutesOffset;
}
/**
 * Get the timestamp in the backend format
 *
 * @param {Date=} d
 * @returns {string}
 */


function getTimestamp(d) {
  d = d || new Date();

  var date = _getDate(d);

  var time = _getTime(d);

  var timezone = _getTimezone(d);

  return "".concat(date, "T").concat(time, "Z").concat(timezone);
}
/**
 * Extract timestamp from the date
 *
 * @param {string|number} d
 * @returns {number}
 * @private
 */


function _extractTimestamp(d) {
  var date = /Z/.test(d) ? d.replace('Z', '') : d;
  return new Date(date).getTime();
}
/**
 * Calculate time passed between two days (in days)
 *
 * @param {string|number} d1
 * @param {string|number} d2
 * @returns {number}
 */


function timePassed(d1, d2) {
  if (!d1 || !d2) {
    return 0;
  }

  var date1 = _extractTimestamp(d1);

  var date2 = _extractTimestamp(d2);

  var diff = Math.abs(date2 - date1);
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}


// CONCATENATED MODULE: ./src/sdk/storage.js
/**
 * Storage namespace
 *
 * @type {string}
 * @private
 */
var _storeName = 'adjustStore';
/**
 * Main storage instance
 */

var _store = _getStorage();
/**
 * Check if storage is available and return it if yes
 *
 * @returns {boolean}
 * @private
 */


function _getStorage() {
  var uid = new Date().toString();
  var storage;
  var result;

  try {
    (storage = window.localStorage).setItem(uid, uid);
    result = storage.getItem(uid) === uid;
    storage.removeItem(uid);
    return result && storage;
  } catch (exception) {
    throw new Error('Local storage is not supported in this browser!');
  }
}
/**
 * Set key-value pair into the storage
 *
 * @param {string} name
 * @param {*} value
 */


function setItem(name, value) {
  _store.setItem("".concat(_storeName, ".").concat(name), JSON.stringify(value));
}
/**
 * Get particular item from the storage and return parsed value
 *
 * @param {string} name
 * @param {*} [defaultValue={}]
 * @returns {Object}
 */


function getItem(name) {
  var defaultValue = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

  var value = _store.getItem("".concat(_storeName, ".").concat(name));

  return value ? JSON.parse(value) : defaultValue;
}
/**
 * Remove item from teh storage
 *
 * @param {string} name
 * @returns {*}
 */


function removeItem(name) {
  return _store.removeItem("".concat(_storeName, ".").concat(name));
}


// CONCATENATED MODULE: ./src/sdk/pub-sub.js
/**
 * List of events with subscribed callbacks
 *
 * @type {Object}
 * @private
 */
var _list = {};
/**
 * Get unique id for the callback to use for unsubscribe
 *
 * @returns {string}
 * @private
 */

function _getId() {
  return 'id' + Math.random().toString(36).substr(2, 16);
}
/**
 * Subscribe to a certain event
 *
 * @param {string} name
 * @param {Function} cb
 * @returns {string}
 */


function subscribe(name, cb) {
  var id = _getId();

  if (!_list[name]) {
    _list[name] = [];
  }

  _list[name].push({
    id: id,
    cb: cb
  });

  return id;
}
/**
 * Unsubscribe particular callback from an event
 *
 * @param {string} id
 */


function unsubscribe(id) {
  if (!id) {
    return;
  }

  var _loop = function _loop(name) {
    if (_list.hasOwnProperty(name) && _list[name]) {
      _list[name].forEach(function (item, j) {
        if (item.id === id) {
          _list[name].splice(j, 1);
        }
      });
    }
  };

  for (var name in _list) {
    _loop(name);
  }
}
/**
 * Publish certain event with optional arguments
 *
 * @param {string} name
 * @param {*} args
 * @returns {boolean}
 */


function publish(name, args) {
  if (!_list[name]) {
    return false;
  }

  _list[name].forEach(function (item) {
    item.cb(name, args);
  });
}
/**
 * Destroy all registered events with their callbacks
 */


function destroy() {
  for (var name in _list) {
    if (_list.hasOwnProperty(name)) {
      delete _list[name];
    }
  }
}


// CONCATENATED MODULE: ./src/sdk/backoff.js
var SECOND = 1000;
var MINUTE = 60 * SECOND;
var HOUR = 60 * MINUTE;
/**
 * Options for the back-off strategy for different environments
 *
 * @type {Object}
 */

var _options = {
  long: {
    delay: 2 * MINUTE,
    maxDelay: 24 * HOUR,
    minRange: 0.5,
    maxRange: 1.0
  },
  short: {
    delay: 200,
    maxDelay: HOUR,
    minRange: 0.5,
    maxRange: 1.0
  },
  test: {
    delay: 100,
    maxDelay: 300
  }
  /**
   * Get random number in provided range
   *
   * @param {number} min
   * @param {number} max
   * @returns {number}
   * @private
   */

};

function _randomInRange(min, max) {
  return Math.random() * (max - min) + min;
}
/**
 * Calculate exponential back-off with jitter factor applied
 *
 * @param {number} attempts
 * @param {string} [strategy='long']
 * @returns {number}
 */


function backOff(attempts) {
  var strategy = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'long';
  var options =  false ? undefined : _options[strategy];
  var delay = options.delay * Math.pow(2, attempts - 1);
  delay = Math.min(delay, options.maxDelay);

  if (options.minRange && options.maxRange) {
    delay = delay * _randomInRange(options.minRange, options.maxRange);
  }

  return Math.round(delay);
}
// CONCATENATED MODULE: ./src/sdk/attribution.js





/**
 * Timeout id and wait when delayed attribution check is about to happen
 *
 * @type {Object}
 * @private
 */

var _timeout = {
  id: null,
  attempts: 0
  /**
   * Check if new attribution is the same as old one
   *
   * @param {string} adid
   * @param {Object} newAttr
   * @returns {boolean}
   * @private
   */

};

function _isSame(adid, newAttr) {
  var oldAttr = getItem('attribution', {});
  var check = ['tracker_token', 'tracker_name', 'network', 'campaign', 'adgroup', 'creative', 'click_label'];
  var anyDifferent = check.some(function (attr) {
    return oldAttr[attr] !== newAttr[attr];
  });
  return !anyDifferent && adid === oldAttr.adid;
}
/**
 * Set new attribution and notify client's callback
 *
 * @param {Object} result
 * @param {Object} result.attribution
 * @private
 */


function _setAttribution() {
  var result = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  var adid = result.adid || null;
  var attribution = result.attribution || {};

  if (_isSame(adid, attribution)) {
    return;
  }

  setItem('attribution', Object.assign({
    adid: adid
  }, attribution));
  publish('attribution:change', result);
}
/**
 * Make delayed request after provided time
 *
 * @param {number} wait
 * @param {Object} params
 * @returns {Promise}
 * @private
 */


function _delayedRequest(wait, params) {
  clearTimeout(_timeout.id);
  return new Promise(function (resolve) {
    _timeout.id = setTimeout(function () {
      return _request(resolve, params);
    }, wait);
  });
}
/**
 * Retry request after some pre-calculated time
 *
 * @param {Object} params
 * @returns {Promise}
 * @private
 */


function _retry(params) {
  _timeout.attempts += 1;
  return _delayedRequest(backOff(_timeout.attempts), params);
}
/**
 * Make the request and retry if necessary
 *
 * @param {Function} resolve
 * @param {Object} params
 * @returns {Promise}
 * @private
 */


function _request(resolve, params) {
  return request({
    url: '/attribution',
    params: Object.assign(params.base || params, {
      created_at: params.created_at
    })
  }).then(function (result) {
    return resolve(_requestAttribution(result, params));
  }).catch(function () {
    return _retry(params);
  });
}
/**
 * Request the attribution if needed and when retrieved then try to preserve it
 *
 * @param {Object} result
 * @param {Object} params
 * @returns {Promise}
 * @private
 */


function _requestAttribution() {
  var result = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  var params = arguments.length > 1 ? arguments[1] : undefined;

  if (!result.ask_in) {
    _setAttribution(result);

    return Promise.resolve(result);
  }

  _timeout.attempts = 0;
  return _delayedRequest(result.ask_in, params);
}
/**
 * Check attribution of the user and perform certain actions if retrieved
 *
 * @param {Object} sessionResult
 * @param {number} sessionResult.ask_in
 * @param {Object} params
 */


function checkAttribution() {
  var sessionResult = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  var params = arguments.length > 1 ? arguments[1] : undefined;

  if (!sessionResult.ask_in) {
    return Promise.resolve(sessionResult);
  }

  params.created_at = getTimestamp();
  return _requestAttribution(sessionResult, params);
}
// CONCATENATED MODULE: ./src/sdk/request.js
function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }




/**
 * Check if attribution requst
 *
 * @param {string} url
 * @returns {boolean}
 * @private
 */

function _isAttributionRequest(url) {
  return /\/attribution/.test(url);
}
/**
 * Get filtered response from successful request
 *
 * @param {Object} xhr
 * @param {String} url
 * @returns {Object}
 * @private
 */


function _getSuccessObject(xhr, url) {
  var response = xhr.response ? JSON.parse(xhr.response) : {};
  var append = _isAttributionRequest(url) ? ['attribution', 'message'] : [];
  return ['adid', 'timestamp', 'ask_in'].concat(append).filter(function (key) {
    return response[key];
  }).reduce(function (acc, key) {
    return Object.assign(acc, _defineProperty({}, key, response[key]));
  }, {});
}
/**
 * Get an error object with necessary data
 *
 * @param {Object} xhr
 * @param {boolean=} onlyResponse
 * @returns {Object}
 * @private
 */


function _getErrorObject(xhr, onlyResponse) {
  if (onlyResponse) {
    return JSON.parse(xhr.response);
  }

  var error = {
    error: 'Unknown error, retry will follow'
  };
  return {
    status: xhr.status,
    statusText: xhr.statusText,
    response: error,
    responseText: JSON.stringify(error)
  };
}
/**
 * Encode key-value pairs to be used in url
 *
 * @param {Object} params
 * @returns {string}
 * @private
 */


function _encodeParams(params) {
  var baseParams = params.base || {};
  var otherParams = params.other || {};
  var autoParams = {
    created_at: getTimestamp(),
    sent_at: getTimestamp()
  };
  params = params.base ? Object.assign(autoParams, baseParams, otherParams) : Object.assign(autoParams, params);
  return Object.entries(params).filter(function (pair) {
    if (isObject(pair[1])) {
      return !isEmpty(pair[1]);
    }

    return !!pair[1] || pair[1] === 0;
  }).map(function (pair) {
    return pair.map(function (value) {
      if (isObject(value)) {
        value = JSON.stringify(value);
      }

      return encodeURIComponent(value);
    }).join('=');
  }).join('&');
}
/**
 * Handle xhr response from server
 *
 * @param {Function} reject
 * @param {Function} resolve
 * @param {Object} xhr
 * @param {string} url
 * @private
 */


function _handleReadyStateChange(reject, resolve, _ref) {
  var xhr = _ref.xhr,
      url = _ref.url;
  if (xhr.readyState !== 4) return;

  if (xhr.status >= 200 && xhr.status < 300) {
    if (isValidJson(xhr.response)) {
      resolve(_getSuccessObject(xhr, url));
    } else {
      reject(_getErrorObject(xhr));
    }
  } else if (xhr.status === 0) {
    reject(_getErrorObject(xhr));
  } else {
    resolve(_getErrorObject(xhr, true));
  }
}
/**
 * Build xhr to perform all kind of api requests
 *
 * @param {string} url
 * @param {string} [method='GET']
 * @param {Object} [params={}]
 * @returns {Promise}
 */


function _buildXhr(_ref2) {
  var url = _ref2.url,
      _ref2$method = _ref2.method,
      method = _ref2$method === void 0 ? 'GET' : _ref2$method,
      _ref2$params = _ref2.params,
      params = _ref2$params === void 0 ? {} : _ref2$params;

  var encodedParams = _encodeParams(params);

  url = config.baseUrl + url;

  if (method === 'GET') {
    url += "?".concat(encodedParams);
  }

  return new Promise(function (resolve, reject) {
    var xhr = new XMLHttpRequest();
    xhr.open(method, url, true);
    xhr.setRequestHeader('Client-SDK', config.version);

    if (method === 'POST') {
      xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    }

    xhr.onreadystatechange = function () {
      return _handleReadyStateChange(reject, resolve, {
        xhr: xhr,
        url: url
      });
    };

    xhr.onerror = function () {
      return reject(_getErrorObject(xhr));
    };

    xhr.send(method === 'GET' ? undefined : encodedParams);
  });
}
/**
 * Check attribution asynchronously and pass the previous result immediately
 *
 * @param {Object} result
 * @param {Object} options
 * @returns {Object}
 * @private
 */


function _checkAttribution(result, options) {
  if (!_isAttributionRequest(options.url) && result.ask_in) {
    checkAttribution(result, options.params);
  }

  return result;
}
/**
 * Request factory to perform all kind of api requests
 *
 * @param {Object} options
 * @returns {Promise}
 */


function request(options) {
  return _buildXhr(options).then(function (result) {
    return _checkAttribution(result, options);
  });
}
// CONCATENATED MODULE: ./src/sdk/queue.js




/**
 * Timeout id and wait when pending request is about to happen
 *
 * @type {Object}
 * @private
 */

var queue_timeout = {
  id: null,
  attempts: 0,
  wait: 150
  /**
   * Remove from the top and continue running pending requests
   *
   * @private
   */

};

function _continue() {
  var pending = getItem('queue', []);
  pending.shift();
  setItem('queue', pending);
  queue_timeout.attempts = 0;
  queue_timeout.wait = 150;
  run();
}
/**
 * Retry pending request after some time
 *
 * @private
 */


function queue_retry() {
  queue_timeout.attempts += 1;
  queue_timeout.wait = backOff(queue_timeout.attempts);
  run();
}
/**
 * Push request to the queue
 *
 * @param {string} url
 * @param {string} method
 * @param {Object} params
 */


function push(_ref) {
  var url = _ref.url,
      method = _ref.method,
      params = _ref.params;
  var pending = getItem('queue', []);
  pending.push({
    url: url,
    method: method,
    params: params
  });
  setItem('queue', pending);

  if (!queue_timeout.id) {
    run();
  }
}
/**
 * Run all pending requests
 * @param {boolean} cleanUpFirst
 */


function run(cleanUpFirst) {
  if (cleanUpFirst) {
    _cleanUp();
  }

  var pending = getItem('queue', []);
  var params = pending[0];
  clearTimeout(queue_timeout.id);
  queue_timeout.id = null;

  if (!params) {
    return;
  }

  queue_timeout.id = setTimeout(function () {
    return request(params).then(_continue).catch(queue_retry);
  }, queue_timeout.wait);
}
/**
 * Clean up stale pending requests
 *
 * @private
 */


function _cleanUp() {
  var pending = getItem('queue', []);
  setItem('queue', pending.filter(function (call) {
    return timePassed(call.params.created_at, Date.now()) <= 28;
  }));
}

/* harmony default export */ var queue = ({
  push: push,
  run: run
});
// CONCATENATED MODULE: ./src/sdk/main.js
function main_defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }




/**
 * Definition of mandatory fields
 *
 * @type {string[]}
 * @private
 */

var _mandatory = ['app_token', 'environment', 'os_name'];
/**
 * Available parameters to set
 *
 * @type {{app_token: string, environment: string, os_name: string, device_ids: {}}}
 * @private
 */

var _params = {
  app_token: '',
  environment: '',
  os_name: '',
  device_ids: {}
  /**
   * Get app token parameter
   *
   * @returns {string}
   */

};

function getAppToken() {
  return _params.app_token;
}
/**
 * Get environment parameter
 *
 * @returns {string}
 */


function getEnvironment() {
  return _params.environment;
}
/**
 * Get os name parameter
 *
 * @returns {string}
 */


function getOsName() {
  return _params.os_name;
}
/**
 * Initiate the instance with parameters
 *
 * @param {Object} params
 * @param {Function=} cb
 */


function init() {
  var params = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  var cb = arguments.length > 1 ? arguments[1] : undefined;

  if (_isInitiated()) {
    throw new Error('You already initiated your instance');
  }

  var missingParamsMessage = _getMissingParams(params);

  if (missingParamsMessage) {
    throw new Error(missingParamsMessage);
  }

  _params = Object.assign({}, params);

  if (typeof cb === 'function') {
    subscribe('attribution:change', cb);
  }

  queue.run(true);
}
/**
 * Track session with already initiated instance
 */


function trackSession() {
  if (!_isInitiated()) {
    throw new Error('You must init your instance');
  }

  queue.push({
    url: '/session',
    method: 'POST',
    params: Object.assign({
      created_at: getTimestamp()
    }, _getBaseParams())
  });
}
/**
 * Track event with already initiated instance
 *
 * @param {Object} params
 */


function trackEvent() {
  var params = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

  if (!_isInitiated()) {
    throw new Error('You must init your instance');
  }

  queue.push({
    url: '/event',
    method: 'POST',
    params: {
      base: Object.assign({
        created_at: getTimestamp()
      }, _getBaseParams()),
      other: Object.assign({
        event_token: params.eventToken,
        callback_params: _convertToMap(params.callbackParams),
        partner_params: _convertToMap(params.partnerParams)
      }, _getRevenue(params.revenue, params.currency))
    }
  });
}
/**
 * Destroy the instance
 */


function main_destroy() {
  _clear(); // TODO destroy everything else that is needed


  destroy();
}
/**
 * Get base params for api calls
 *
 * @returns {Object}
 * @private
 */


function _getBaseParams() {
  return Object.assign({
    app_token: _params.app_token,
    environment: _params.environment,
    os_name: _params.os_name
  }, _params.device_ids);
}
/**
 * Get missing parameters that are defined as mandatory
 *
 * @param {Object} params
 * @returns {string}
 * @private
 */


function _getMissingParams(params) {
  var missing = _mandatory.filter(function (value) {
    return !params[value];
  });

  if (missing.length) {
    return "You must define ".concat(buildList(missing));
  }

  return '';
}
/**
 * Check if instance is initiated
 *
 * @returns {boolean}
 * @private
 */


function _isInitiated() {
  return !!(_params.app_token && _params.environment && _params.os_name);
}
/**
 * Clear the instance
 *
 * @private
 */


function _clear() {
  _params = {
    app_token: '',
    environment: '',
    os_name: '',
    device_ids: {}
  };
}
/**
 * Get revenue value if positive and limit to 5 decimal places
 *
 * @param {number} revenue
 * @param {string} currency
 * @returns {Object}
 * @private
 */


function _getRevenue(revenue, currency) {
  revenue = parseFloat(revenue);

  if (revenue < 0 || !currency) {
    return {};
  }

  return {
    revenue: revenue.toFixed(5),
    currency: currency
  };
}
/**
 * Convert array like map into object map
 *
 * @param {Array} params
 * @returns {Object}
 * @private
 */


function _convertToMap() {
  var params = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
  return params.reduce(function (acc, o) {
    return Object.assign(acc, main_defineProperty({}, o.key, o.value));
  }, {});
}

var Adjust = {
  getAppToken: getAppToken,
  getEnvironment: getEnvironment,
  getOsName: getOsName,
  init: init,
  trackSession: trackSession,
  trackEvent: trackEvent,
  destroy: main_destroy
};
Object.freeze(Adjust);
/* harmony default export */ var main = __webpack_exports__["default"] = (Adjust);

/***/ })
/******/ ])["default"];
});