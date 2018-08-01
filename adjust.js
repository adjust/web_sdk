(function (window) {

  function sendRequest(method, url, data, success_cb, error_cb) {

    var req = new XMLHttpRequest();

    req.open(method, url, !0);
    req.setRequestHeader('Client-SDK', 'js4.0.0');
    req.onreadystatechange = function () {
      if (req.readyState === 4) {
        if (req.status >= 200 && req.status < 400) {
          !!success_cb && success_cb(req.responseText);
        } else if (!!error_cb) {
          !!error_cb && error_cb(new Error('Server responded with HTTP ' + req.status), xhr);
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

    var _appToken = options.app_token;
    var _environment = options.environment;
    var _osName = options.os_name || 'android';

    return {
      trackSession: trackSession,
      trackEvent: trackEvent
    };

    function trackSession(options, onSuccess, onError) {

      var params = cloneObj(options.device_ids);
      params.app_token = _appToken;
      params.environment = _environment;
      params.os_name = _osName;

      sendRequest('GET', 'https://app.adjust.com/session?' + encodeQueryString(params), null, onSuccess, onError);

    }

    function trackEvent(options, onSuccess, onError) {

      var params = cloneObj(options.device_ids);
      params.event_token = options.event_token;
      params.app_token = _appToken;
      params.environment = _environment;
      params.os_name = _osName;

      sendRequest('GET', 'https://app.adjust.com/event?' + encodeQueryString(params), null, onSuccess, onError)
    }

  }

})(window);
