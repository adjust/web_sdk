// adjust JavaScript tracking library
(function (window) {
  var sendRequest = function(method, url, data, success_cb, error_cb) {
    var req = new XMLHttpRequest();
    
    req.open(method, url, true);
    req.setRequestHeader("Client-SDK", "js4.0.0");

    req.onreadystatechange = function() {
      if (req.readyState == 4) {
        if (req.status >= 200 && req.status < 400) {
          !!success_cb && success_cb(req.responseText);
        } else if (!!error_cb) {
          !!error_cb && error_cb(new Error("Server responded with HTTP " + req.status), xhr);
        }
      }
    };

    if (!!error_cb) {
      req.onerror = error_cb;
    }
    
    req.send(data);
  }

  var encodeQueryString = function(params) {
    var pairs = [];
    for (var k in params) {
      if (!params.hasOwnProperty(k)) {
        continue;
      }
      
      pairs.push(encodeURIComponent(k) + "=" + encodeURIComponent(params[k]))
    }

    return pairs.join("&");
  }

  var cloneObj = function(obj) {
    var copy = {};
    if (typeof(obj) != "object" || !obj) {
      return copy;
    }
    
    for (var k in obj) {
      if (!obj.hasOwnProperty(k)) {
        continue;
      }
      
      copy[k] = obj[k]
    }

    return copy;
  }

  if (!'withCredentials' in new XMLHttpRequest()) {
    sendRequest = function(){}; // suppress calls
  }

  window.Adjust = function(app_token, os_name) {
    this.trackSession = function(device_ids) {
      var params = cloneObj(device_ids);
      params["app_token"] = app_token;
      params["os_name"]   = os_name;
      
      sendRequest("GET", "https://app.adjust.com/session?" + encodeQueryString(params));
    };

    this.trackEvent = function(event_token, device_ids) {
      var params = cloneObj(device_ids);
      params["app_token"]   = app_token;
      params["event_token"] = event_token;
      params["os_name"]     = os_name;
      
      sendRequest("GET", "https://app.adjust.com/event?" + encodeQueryString(params));
    };
  }
})(window);
// End of adjust JavaScript tracking library

// Example usage
var app_token = "rb4g27fje5ej",
    event_token = "uqg17r",
    device_ids = {
      "gps_adid": "5056e23a-dc1d-418f-b5a2-4ab3e75daab2"
    };

var adjust = new Adjust(app_token, "android");
adjust.trackSession(device_ids);
adjust.trackEvent(event_token, device_ids);
