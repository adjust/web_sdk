## Summary

This is the guide to the Javascript SDK of Adjust™ for web sites or web apps. You can read more about Adjust™ at [adjust.com].

Read this in other languages: [English][en-readme], [中文][zh-readme], [日本語][ja-readme], [한국어][ko-readme].

## Table of contents

* [Example apps](#example-app)
* [Installation](#installation)
* [Initialization](#initialization)   
* [Event tracking](#event-tracking)
* [Global callback parameters](#global-callback-parameters)
* [Global partner parameters](#global-partner-parameters)
* [Offline/Online mode](#offline-online-mode)
* [Stop/Restart SDK](#stop-restart-sdk)
* [GDPR Forget Me](#gdpr-forget-me)
* [Marketing Opt-out](#marketing-opt-out)
* [License](#license)

## <a id="example-app">Example apps</a>

You can check how our SDK can be used in the web app by checking [example app][example-app] in this repository.

## <a id="installation">Installation</a>

This SDK can be used to track installs, sessions and events. Simply add the Adjust Web SDK to your web app.

Our sdk is exposed under all module definitions, so it works under CommonJS and AMD environments and is also available through global `Adjust` when loaded through CDN.

To lazy load the Adjust Web SDK through CDN paste the following snippet into the `<head>` tag:
```html
<script type="application/javascript">
!function(t,a,e,r,s,l,d,n,o){t.Adjust=t.Adjust||{},t.Adjust_q=t.Adjust_q||[];for(var c=0;c<l.length;c++)d(t.Adjust,t.Adjust_q,l[c]);n=a.createElement("script"),o=a.getElementsByTagName("script")[0],n.async=!0,n.src="https://cdn.adjust.com/adjust-latest.min.js",n.onload=function(){for(var a=0;a<t.Adjust_q.length;a++)t.Adjust[t.Adjust_q[a][0]].apply(t.Adjust,t.Adjust_q[a][1]);t.Adjust_q=[]},o.parentNode.insertBefore(n,o)}(window,document,0,0,0,["initSdk","trackEvent","addGlobalCallbackParameters","addGlobalPartnerParameters","removeGlobalCallbackParameter","removeGlobalPartnerParameter","clearGlobalCallbackParameters","clearGlobalPartnerParameters","switchToOfflineMode","switchBackToOnlineMode","stop","restart","gdprForgetMe","disableThirdPartySharing"],function(t,a,e){t[e]=function(){a.push([e,arguments])}});
</script>
```

The Adjust Web SDK should be loaded only once per page and it should be initiated once per page load.

When loading the sdk through CDN we suggest using minified version. You can target specific version like `https://cdn.adjust.com/adjust-5.1.0.min.js`, or you can target latest version `https://cdn.adjust.com/adjust-latest.min.js` if you want automatic updates without need to change the target file. The sdk files are cached so they are served as fast as possible, and the cache is refreshed every half an hour. If you want updates immediately make sure to target specific version.   

It's also possible to install our sdk through NPM:

```
npm install @adjustcom/adjust-web-sdk --save
```

## <a id="initialization">Initialization</a>

In order to initialize the Adjust Web SDK you must call the `Adjust.initSdk` method as soon as possible:

```js
Adjust.initSdk({
  appToken: 'YOUR_APP_TOKEN',
  environment: 'production'
});
```
 
Here is the full list of available parameters for the `initSdk` method:

### Mandatory params

<a id="app-token">**appToken**</a> `string`

Initialization method requires this parameter, so make sure to provide valid app token

<a id="environment">**environment**</a> `string` 

This param is also mandatory. Available options are `production` or `sandbox`. Use `sandbox` in case you are testing the SDK locally with your web app

### Optional params
 
<a id="attribution-callback">**attributionCallback**</a> `function`

This param accepts function, and it's a callback function for the attribution change. Two arguments are provided to the callback, first one is an internal event name (can be ignored), and the other one is the object which holds information about the changed attribution

Example:
```js
Adjust.initSdk({
  // ... other params go here, including mandatory ones
  attributionCallback: function (e, attribution) {
    // e: internal event name, can be ignored
    // attribution: details about the changed attribution
  }
});
```

<a id="default-tracker">**defaultTracker**</a> `string`

By default, users who are not attributed to any campaigns will be attributed to the Organic tracker of the app. If you want to overwrite this behaviour and attributed this type of traffic under a different tracker, you can use this method to set a different default tracker.

<a id="custom-url">**customUrl**</a> `string`

By default all requests go to adjust's endpoints. You are able to redirect all requests to your custom endpoint 

<a id="event-deduplication-list-limit">**eventDeduplicationListLimit**</a> `number`

By default this param is set to `10`. It is possible to override this limit but make sure that it is a positive number and not too big. This will cache last `n` deduplication ids (defined by this param) and use them to deduplicate events with repeating ids

<a id="log-level">**logLevel**</a> `string`

By default this param is set to `error`. Possible values are `none`, `error`, `warning`, `info`, `verbose`. We highly recommend that you use `verbose` when testing in order to see precise logs and to make sure integration is done properly.
Here are more details about each log level:
- `verbose` - will print detailed messages in case of certain actions
- `info` - will print only basic info messages, warnings and errors
- `warning` - will print only warning and error messages
- `error` - will print only error message
- `none` - won't print anything

<a id="log-output">**logOutput**</a> `string`

It's possible to define html container where you want to see your logs. This is useful when testing on mobile devices and when you want to see logs directly on the screen (recommended only for testing)


## <a id="event-tracking">Event tracking</a>

You can use adjust to track events. Lets say you want to track every tap on a particular button. You would create a new event token in your [dashboard], which has an associated event token - looking something like `abc123`. In order to track this event from your web app, you should do following:

```js
Adjust.trackEvent({
  eventToken: 'YOUR_EVENT_TOKEN'
})
```

Make sure to track event only after you [initialize](#initialization) the Adjust SDK.
Here is the full list of available parameters for the `trackEvent` method:

### Mandatory params

<a id="event-token">**eventToken**</a> `string`

Track event method requires this parameter, make sure to provide valid event token

### Optional params

<a id="revenue">**revenue**</a> `number`

In case you want to attach revenue to an event (for example you would like to track some purchase that happened inside your web app) then you need to provide positive value for this param. It's also mandatory to provide [`currency`](#currency) param described in the next block

<a id="currency">**currency**</a> `string`

You need to provide this param if you want to track revenue event. Please use valid currency code like `EUR`, `USD` and so on

Example:

```js
Adjust.trackEvent({
  // ... other params go here, including mandatory ones
  revenue: 110,
  currency: 'EUR'
})
```

When you set a currency token, adjust will automatically convert the incoming revenues into a reporting revenue of your choice. Read more about [currency conversion here][currency-conversion].

You can read more about revenue and event tracking in the [event tracking guide](https://help.adjust.com/tracking/revenue-events).

<a id="callback-params">**callbackParams**</a> `array`

You can register a callback URL for your events in your [dashboard]. We will send a GET request to that URL whenever the event is tracked. You can add callback parameters to that event by adding `callbackParams` parameter to the map object passed to `trackEvent` method. We will then append these parameters to your callback URL.

For example, suppose you have registered the URL `https://www.mydomain.com/callback` then track an event like this:

```js
Adjust.trackEvent({
  // ... other params go here, including mandatory ones
  callbackParams: [
    {key: 'key', value: 'value'}, 
    {key: 'foo', value: 'bar'}
  ]
})
```

In that case we would track the event and send a request to:

    https://www.mydomain.com/callback?key=value&foo=bar

Please note that we don't store any of your custom parameters, but only append them to your callbacks, thus without a callback they will not be saved nor sent to you.

You can read more about using URL callbacks, including a full list of available values, in our [callbacks guide][callbacks-guide].

<a id="partner-params">**partnerParams**</a> `array`

You can also add parameters to be transmitted to network partners, which have been activated in your Adjust dashboard.
This works similarly to the callback parameters mentioned above, but can be added by adding `partnerParams` parameter to the map object passed to `trackEvent` method:

```js
Adjust.trackEvent({
  // ... other params go here, including mandatory ones
  partnerParams: [
    {key: 'key', value: 'value'}, 
    {key: 'foo', value: 'bar'}
  ]
})
```

You can read more about special partners and these integrations in our [guide to special partners][special-partners].

<a id="deduplication-id">**deduplicationId**</a> `string`

It's possible to provide event deduplication id in order to avoid tracking duplicated events. Deduplication list limit is set in initialization configuration as described [above](#event-deduplication-list-limit)

## <a id="global-callback-parameters">Global callback parameters</a>

There are several methods available for global callback parameters like adding, removing and clearing them. Here is the list of each available method:

<a id="add-global-callback-parameters">**addGlobalCallbackParameters**</a>

It's possible to add global callback parameters, which will be appended automatically to each session and event request. Note that callback params passed directly to `trackEvent` method will override existing global callback params. This method accepts an `array` is the same format as for [`callbackParams`](#callback-params) parameter from `trackEvent` method

Example:

```js
Adjust.addGlobalCallbackParameters([
  {key: 'key1', value: 'value1'},
  {key: 'key2', value: 'value2'}
]);
```

<a id="remove-global-callback-parameter">**removeGlobalCallbackParameter**</a>

To remove particular callback parameter use this method by providing the key of a global callback param which needs to be removed

Example:

```js
Adjust.removeGlobalCallbackParameter('key1');
```

<a id="clear-global-callback-parameters">**clearGlobalCallbackParameters**</a>

In order to clear all global callback parameters simply call this method

Example:

```js
Adjust.clearGlobalCallbackParameters();
```

## <a id="global-partner-parameters">Global partner parameters</a>

It's possible to add, remove and clear global partner parameters in the similar way as for [global callback parameters](#global-callback-parameters). Here is the list of each available method:


<a id="add-global-parnter-parameters">**addGlobalPartnerParameters**</a>

It's possible to add global partner parameters, which will be appended automatically to each session and event request. Note that partner params passed directly to `trackEvent` method will override existing global partner params. This method accepts an `array` is the same format as for [`partnerParams`](#partner-params) parameter from `trackEvent` method

Example:

```js
Adjust.addGlobalPartnerParameters([
  {key: 'key1', value: 'value1'},
  {key: 'key2', value: 'value2'}
]);
```

<a id="remove-global-partner-parameter">**removeGlobalPartnerParameter**</a>

To remove particular partner parameter use this method by providing the key of a global partner param which needs to be removed

Example:

```js
Adjust.removeGlobalPartnerParameter('key1');
```

<a id="clear-global-partner-parameters">**clearGlobalPartnerParameters**</a>

In order to clear all global partner parameters simply call this method

Example:

```js
Adjust.clearGlobalPartnerParameters();
```

## <a id="offline-online-mode">Offline/Online mode</a>

By default when initiated Adjust SDK is always in online mode. But you can put it into offline mode if you want to pause all network requests such as tracking events and sessions (although initial session will ignore this mode and will be sent anyway).
There are two methods available to swich on and off the offline mode:

<a id="switch-to-offline-mode">**switchToOfflineMode**</a>

This method will put the Adjust SDK into offline mode

Example:

```js
Adjust.switchToOfflineMode();
```

<a id="switch-back-to-online-mode">**switchBackToOnlineMode**</a>

This method will put the Adjust SDK back to online mode

```js
Adjust.switchBackToOnlineMode();
```

## <a id="stop-restart-sdk">Stop/Restart SDK</a>

It's possible to completely stop the SDK from running in certain situations. 
This means that SDK will stop tracking sessions and events and in general will stop working entirely.
But it's possible to restart it after some time. Here are available methods for this functionality:

<a id="stop">**stop**</a>

This will stop running Adjust SDK

Example:

```js
Adjust.stop();
``` 

<a id="restart">**restart**</a>

This will restart Adjust SDK

Example:

```js
Adjust.restart();
``` 


## <a id="gdpr-forget-me">GDPR Forget Me</a>

There is functionality available to GDPR Forget particular user. This will notify our backend behind the scene and will stop Adjust SDK from running. 
There is one method available for this:

<a id="gdpr-forge-me">**gdprForgetMe**</a>

This method will stop Adjust SDK from running and will notify adjust backend that user wants to be GDPR forgotten.
Once this method is run it's not possible to restart Adjust SDK anymore.

Example:

```js
Adjust.gdprForgetMe();
```

You can find more details [here](https://help.adjust.com/manage-data/data-privacy/gdpr)

## <a id="marketing-opt-out">Marketing Opt-out</a>

There is functionality for the Marketing Opt-out, which is disabling third-party sharing ability. This will notify our backed in the same manner as it does for GDPR Forget me.

There is one method available for this:

<a id="disable-third-party-sharing">**disableThirdPartySharing**</a>

Example:

```js
Adjust.disableThirdPartySharing();
```

## <a id="license">License</a>

The Adjust SDK is licensed under the MIT License.

Copyright (c) 2020 Adjust GmbH, https://www.adjust.com

Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the "Software"), to deal in
the Software without restriction, including without limitation the rights to
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies
of the Software, and to permit persons to whom the Software is furnished to do
so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.


[adjust.com]:   https://adjust.com
[dashboard]:    https://adjust.com
[example-app]:  src/demo.html

[callbacks-guide]:      https://help.adjust.com/manage-data/raw-data-exports/callbacks
[special-partners]:     https://help.adjust.com/dashboard/integrated-partners
[currency-conversion]:  https://help.adjust.com/tracking/revenue-events/currency-conversion

[en-readme]:  README.md
[zh-readme]:  docs/chinese/README.md
[ja-readme]:  docs/japanese/README.md
[ko-readme]:  docs/korean/README.md
