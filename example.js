// Example usage
var device_ids = {
  gps_adid: '5056e23a-dc1d-418f-b5a2-4ab3e75daab2'
};

var adjust = new Adjust({
  app_token: 'rb4g27fje5ej',
  environment: 'production', // or 'sandbox'
  os_name: 'android'
});

adjust.trackSession({
  device_ids: device_ids
}, function () {
  console.log('success');
}, function () {
  console.log('error');
});

adjust.trackEvent({
  event_token: 'uqg17r',
  device_ids: device_ids
}, function () {
  console.log('success');
}, function () {
  console.log('error');
});
