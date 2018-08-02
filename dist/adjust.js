(function (window) {
  'use strict';

  function sendRequest(method, url, data, success_cb, error_cb) {

    var req = new XMLHttpRequest();

    req.open(method, url, !0);
    req.setRequestHeader('Client-SDK', 'js4.1.0');
    req.onreadystatechange = function () {
      if (req.readyState === 4) {
        if (req.status >= 200 && req.status < 400) {
          !!success_cb && success_cb(req);
        } else if (!!error_cb) {
          !!error_cb && error_cb(new Error('Server responded with HTTP ' + req.status), req);
        }
      }
    };

    if (!!error_cb) {
      req.onerror = error_cb
    }

    req.send(data)
  }

  function encodeQueryString(params) {
    var pairs = [];
    for (var k in params) {
      if (!params.hasOwnProperty(k)) {
        continue
      }
      pairs.push(encodeURIComponent(k) + '=' + encodeURIComponent(params[k]))
    }
    return pairs.join('&')
  }

  function cloneObj(obj) {
    var copy = {};
    if (typeof(obj) !== 'object' || !obj) {
      return copy
    }
    for (var k in obj) {
      if (!obj.hasOwnProperty(k)) {
        continue
      }
      copy[k] = obj[k]
    }
    return copy
  }

  if (!'withCredentials' in new XMLHttpRequest()) {
    sendRequest = function () {}
  }

  window.Adjust = function Adjust(options) {

    options = options || {};

    var _appToken = options.app_token;
    var _environment = options.environment;
    var _osName = options.os_name || 'android';

    return {
      trackSession: trackSession,
      trackEvent: trackEvent
    };

    function trackSession(options, onSuccess, onError) {

      options = options || {};

      var params = cloneObj(options.device_ids);

      params.app_token = _appToken;
      params.environment = _environment;
      params.os_name = _osName;

      sendRequest('GET', 'https://app.adjust.com/session?' + encodeQueryString(params), null, onSuccess, onError);

    }

    function trackEvent(options, onSuccess, onError) {

      options = options || {};

      var revenue = _getRevenue(options);
      var callbackParams = _getMap(options.callback_params);
      var partnerParams = _getMap(options.partner_params);
      var params = cloneObj(options.device_ids);

      if (revenue) {
        params.revenue = revenue.revenue;
        params.currency = revenue.currency;
      }

      if (callbackParams) {
        params.callback_params = JSON.stringify(callbackParams);
      }

      if (partnerParams) {
        params.partner_params = JSON.stringify(partnerParams);
      }

      params.event_token = options.event_token;
      params.app_token = _appToken;
      params.environment = _environment;
      params.os_name = _osName;

      sendRequest('GET', 'https://app.adjust.com/event?' + encodeQueryString(params), null, onSuccess, onError)

    }

    function _getRevenue(options) {

      var revenue = parseFloat(options.revenue);

      if (revenue < 0 || !options.currency) {
        return null;
      }

      return {
        revenue: revenue.toFixed(5),
        currency: options.currency
      };

    }

    function _getMap(params) {

      params = params || [];

      if (!params.length) {
        return null;
      }

      var map = {};

      for (var i = 0; i < params.length; i++) {
        map[params[i].key] = params[i].value;
      }

      return cloneObj(map);

    }

  }

})(window);
