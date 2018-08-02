(function () {
  'use strict';

  // Example of SDK initialization
  var _adjust = new Adjust({
    app_token: '2fm9gkqubvpc',
    environment: 'sandbox', // or 'production'
    os_name: 'android',
    device_ids: {
      gps_adid: '5056e23a-dc1d-418f-b5a2-4ab3e75daab2'
    }
  });

  var _eventConfig = {
    event_token: 'g3mfiw',
    revenue: 1000,
    currency: 'EUR',
    callback_params: [{
      key: 'some-key-1',
      value: 'some-value-1'
    }, {
      key: 'some-key-2',
      value: 'some-value-2'
    }],
    partner_params: [{
      key: 'some-partner-key-1',
      value: 'some-partner-value-1'
    }, {
      key: 'some-partner-key-2',
      value: 'some-partner-value-2'
    }, {
      key: 'some-partner-key-1',
      value: 'some-partner-value-3'
    }]
  };

  // Internal (demo) stuff, don't touch!
  var _trackSessionBtn = document.querySelector('#track-session');
  var _trackEventBtn = document.querySelector('#track-event');
  var _logContainer = document.querySelector('#log');
  var _waitingForResponseMsg = 'waiting for response, please wait...';
  var _loading = {};

  _trackSessionBtn.addEventListener('click', handleTrackSession);
  _trackEventBtn.addEventListener('click', handleTrackEvent);

  function handleTrackSession() {

    if (_loading.session) {
      return;
    }

    _loading.session = true;

    prepareLog();

    _adjust.trackSession(function (result) {
      successCb(result, 'session');
    }, function (errorMsg, error) {
      errorCb(errorMsg, error, 'session');
    });

  }

  function handleTrackEvent() {

    if (_loading.event) {
      return;
    }

    _loading.event = true;

    prepareLog();

    _adjust.trackEvent(_eventConfig, function (result) {
      successCb(result, 'event');
    }, function (errorMsg, error) {
      errorCb(errorMsg, error, 'event');
    });

  }

  function prepareLog() {

    _logContainer.textContent = _waitingForResponseMsg;
    _logContainer.classList.remove('success');
    _logContainer.classList.remove('error');

  }

  function successCb(result, what) {

    _loading[what] = false;

    _logContainer.textContent = 'SUCCESS :)\n\n';
    _logContainer.textContent += result.responseText;
    _logContainer.classList.add('success');

  }

  function errorCb(errorMsg, error, what) {

    console.log(error);
    _loading[what] = false;

    _logContainer.textContent = 'ERROR :(\n\n';
    _logContainer.textContent += errorMsg + '\n\n';
    _logContainer.textContent += error.responseText;
    _logContainer.classList.add('error');

  }

})();
