// Example usage
var app_token = "rb4g27fje5ej",
   environment = "production", // or "sandbox"
   event_token = "uqg17r",
   os_name = 'android'
   device_ids = {
     "gps_adid": "5056e23a-dc1d-418f-b5a2-4ab3e75daab2"
   };

var adjust = new Adjust(app_token, environment, "android");
adjust.trackSession(device_ids);
adjust.trackEvent(event_token, device_ids);