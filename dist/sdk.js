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


// CONCATENATED MODULE: ./src/sdk/request.js


/**
 * Get an error object with necessary data
 *
 * @param {Object} xhr
 * @returns {Object}
 * @private
 */

function _getErrorObject(xhr) {
  return {
    status: xhr.status,
    statusText: xhr.statusText,
    response: xhr.response,
    responseText: xhr.responseText
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
 * Request factory to perform all kind of api requests
 *
 * @param {string} url
 * @param {string} [method='GET']
 * @param {Object} [params={}]
 * @returns {Promise}
 */


function request(_ref) {
  var url = _ref.url,
      _ref$method = _ref.method,
      method = _ref$method === void 0 ? 'GET' : _ref$method,
      _ref$params = _ref.params,
      params = _ref$params === void 0 ? {} : _ref$params;

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
      if (xhr.readyState !== 4) return;

      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(xhr.response);
      } else {
        reject(_getErrorObject(xhr));
      }
    };

    xhr.onerror = function () {
      return reject(_getErrorObject(xhr));
    };

    xhr.send(method === 'GET' ? undefined : encodedParams);
  });
}
// CONCATENATED MODULE: ./src/sdk/main.js
function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }



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
 * @param params
 */


function init() {
  var params = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

  if (_isInitiated()) {
    throw new Error('You already initiated your instance');
  }

  var missingParamsMessage = _getMissingParams(params);

  if (missingParamsMessage) {
    throw new Error(missingParamsMessage);
  }

  _params = Object.assign({}, params);
}
/**
 * Track session with already initiated instance
 *
 * @returns {Promise}
 */


function trackSession() {
  if (!_isInitiated()) {
    throw new Error('You must init your instance');
  }

  return request({
    url: '/session',
    method: 'POST',
    params: _getBaseParams()
  });
}
/**
 * Track event with already initiated instance
 *
 * @param {Object} params
 * @returns {Promise}
 */


function trackEvent() {
  var params = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

  if (!_isInitiated()) {
    throw new Error('You must init your instance');
  }

  return request({
    url: '/event',
    method: 'POST',
    params: Object.assign(_getBaseParams(), Object.assign({
      event_token: params.eventToken,
      callback_params: _convertToMap(params.callbackParams),
      partner_params: _convertToMap(params.partnerParams)
    }, _getRevenue(params.revenue, params.currency)))
  });
}
/**
 * Destroy the instance
 */


function destroy() {
  _clear(); // TODO destroy everything else that is needed

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
    return Object.assign(acc, _defineProperty({}, o.key, o.value));
  }, {});
}

var Adjust = {
  getAppToken: getAppToken,
  getEnvironment: getEnvironment,
  getOsName: getOsName,
  init: init,
  trackSession: trackSession,
  trackEvent: trackEvent,
  destroy: destroy
};
Object.freeze(Adjust);
/* harmony default export */ var main = __webpack_exports__["default"] = (Adjust);

/***/ })
/******/ ])["default"];
});