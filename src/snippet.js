/* eslint-disable */
(function (window, document, tag, url, corsMode, integrity, sdkName, methods, asyncMethods, classes, instanceAlias, placeholder, asyncPlaceholder, script, first) {

  var queueName = sdkName + '_q';
  var callsQueueName = sdkName + '_c';

  window[sdkName] = window[sdkName] || {};
  window[queueName] = window[queueName] || [];
  window[callsQueueName] = window[callsQueueName] || [];

  // creating wrappers for SDK functions
  for (let i = 0; i < methods.length; i++) {
    placeholder(window[sdkName], window[queueName], methods[i]);
  }

  // creating wrappers for SDK async functions
  for (let i = 0; i < asyncMethods.length; i++) {
    asyncPlaceholder(window[sdkName], window[queueName], asyncMethods[i]);
  }

  // creating wrappers for SDK classes and their methods
  for (let i = 0; i < classes.length; i++) {
    const ctor = classes[i][0]
    const classMethods = classes[i][1]

    let pretender
    window[sdkName][ctor] = function (...args) {
      pretender = this
      window[callsQueueName].push(function () {
        // calling real constructor
        pretender[instanceAlias] = new window[sdkName][ctor](...args)
      })
      return pretender
    }

    for (let j = 0; j < classMethods.length; j++) {
      const methodName = classMethods[j]
      window[sdkName][ctor].prototype[methodName] = function (...args) {
        window[callsQueueName].push(function () {
          // calling real method
          pretender[instanceAlias][methodName](...args)
        })
      }
    }
  }

  script = document.createElement(tag);
  first = document.getElementsByTagName(tag)[0];
  script.async = true;
  script.src = url;

  if (integrity) {
    script.crossOrigin = corsMode;
    script.integrity = integrity;
  }

  script.onload = function () {
    // create all real objects and call their methods
    for (var i = 0; i < window[callsQueueName].length; i++) {
      window[callsQueueName][i]()
    }
    window[callsQueueName] = [];

    // call all real SDK functions
    for (var i = 0; i < window[queueName].length; i++) {
      if (window[queueName][i][1][0] && window[queueName][i][1][0][instanceAlias]) {
        // if argument was an instance of some class, call function with real instance
        // TODO: this doesn't support SDK functions with multiple parameters when some of them is a class instance
        window[sdkName][window[queueName][i][0]](window[queueName][i][1][0][instanceAlias])
      } else {
        const promiseProxy = window[queueName][i][2];
        if (promiseProxy) {
          window[sdkName][window[queueName][i][0]].apply(window[sdkName], window[queueName][i][1])
            .then(result => promiseProxy.resolve(result))
        } else {
          window[sdkName][window[queueName][i][0]].apply(window[sdkName], window[queueName][i][1]);
        }
      }
    }
    window[queueName] = [];
  }
  first.parentNode.insertBefore(script, first);
})(
  window,
  document,
  'script',
  `https://cdn.adjust.com/adjust-${env.VERSION}.min.js`,
  'anonymous',
  env.INTEGRITY,
  'Adjust',
  [
    'initSdk',
    'getAttribution',
    'getWebUUID',
    'setReferrer',
    'trackEvent',
    'addGlobalCallbackParameters',
    'addGlobalPartnerParameters',
    'removeGlobalCallbackParameter',
    'removeGlobalPartnerParameter',
    'clearGlobalCallbackParameters',
    'clearGlobalPartnerParameters',
    'switchToOfflineMode',
    'switchBackToOnlineMode',
    'stop',
    'restart',
    'gdprForgetMe',
    'disableThirdPartySharing',
    'trackThirdPartySharing',
    'initSmartBanner',
    'showSmartBanner',
    'hideSmartBanner',
  ],
  ['waitForAttribution', 'waitForWebUUID'],
  [['ThirdPartySharing', ['addGranularOption', 'addPartnerSharingSetting']]],
  '__realObj',
  function (context, queue, methodName) {
    context[methodName] = function () {
      queue.push([methodName, arguments]);
    };
  },
  function (context, queue, methodName) {
    context[methodName] = function () {
      const proxy = {}
      proxy.promise = new Promise((outerResolve, outerReject) => {
        proxy.resolve = outerResolve
        proxy.reject = outerReject
      })
      queue.push([methodName, arguments, proxy]);
      return proxy.promise;
    };
  },
)
