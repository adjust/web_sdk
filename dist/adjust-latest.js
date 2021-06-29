(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["Adjust"] = factory();
	else
		root["Adjust"] = factory();
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
/******/ 	return __webpack_require__(__webpack_require__.s = 23);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

var defineProperty = __webpack_require__(2);

function ownKeys(object, enumerableOnly) {
  var keys = Object.keys(object);

  if (Object.getOwnPropertySymbols) {
    var symbols = Object.getOwnPropertySymbols(object);

    if (enumerableOnly) {
      symbols = symbols.filter(function (sym) {
        return Object.getOwnPropertyDescriptor(object, sym).enumerable;
      });
    }

    keys.push.apply(keys, symbols);
  }

  return keys;
}

function _objectSpread2(target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i] != null ? arguments[i] : {};

    if (i % 2) {
      ownKeys(Object(source), true).forEach(function (key) {
        defineProperty(target, key, source[key]);
      });
    } else if (Object.getOwnPropertyDescriptors) {
      Object.defineProperties(target, Object.getOwnPropertyDescriptors(source));
    } else {
      ownKeys(Object(source)).forEach(function (key) {
        Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
      });
    }
  }

  return target;
}

module.exports = _objectSpread2;
module.exports["default"] = module.exports, module.exports.__esModule = true;

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

var arrayWithHoles = __webpack_require__(15);

var iterableToArrayLimit = __webpack_require__(16);

var unsupportedIterableToArray = __webpack_require__(7);

var nonIterableRest = __webpack_require__(17);

function _slicedToArray(arr, i) {
  return arrayWithHoles(arr) || iterableToArrayLimit(arr, i) || unsupportedIterableToArray(arr, i) || nonIterableRest();
}

module.exports = _slicedToArray;
module.exports["default"] = module.exports, module.exports.__esModule = true;

/***/ }),
/* 2 */
/***/ (function(module, exports) {

function _defineProperty(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }

  return obj;
}

module.exports = _defineProperty;
module.exports["default"] = module.exports, module.exports.__esModule = true;

/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(process, global) {/*!
 * @overview es6-promise - a tiny implementation of Promises/A+.
 * @copyright Copyright (c) 2014 Yehuda Katz, Tom Dale, Stefan Penner and contributors (Conversion to ES6 API by Jake Archibald)
 * @license   Licensed under MIT license
 *            See https://raw.githubusercontent.com/stefanpenner/es6-promise/master/LICENSE
 * @version   v4.2.8+1e68dce6
 */

(function (global, factory) {
	 true ? module.exports = factory() :
	undefined;
}(this, (function () { 'use strict';

function objectOrFunction(x) {
  var type = typeof x;
  return x !== null && (type === 'object' || type === 'function');
}

function isFunction(x) {
  return typeof x === 'function';
}



var _isArray = void 0;
if (Array.isArray) {
  _isArray = Array.isArray;
} else {
  _isArray = function (x) {
    return Object.prototype.toString.call(x) === '[object Array]';
  };
}

var isArray = _isArray;

var len = 0;
var vertxNext = void 0;
var customSchedulerFn = void 0;

var asap = function asap(callback, arg) {
  queue[len] = callback;
  queue[len + 1] = arg;
  len += 2;
  if (len === 2) {
    // If len is 2, that means that we need to schedule an async flush.
    // If additional callbacks are queued before the queue is flushed, they
    // will be processed by this flush that we are scheduling.
    if (customSchedulerFn) {
      customSchedulerFn(flush);
    } else {
      scheduleFlush();
    }
  }
};

function setScheduler(scheduleFn) {
  customSchedulerFn = scheduleFn;
}

function setAsap(asapFn) {
  asap = asapFn;
}

var browserWindow = typeof window !== 'undefined' ? window : undefined;
var browserGlobal = browserWindow || {};
var BrowserMutationObserver = browserGlobal.MutationObserver || browserGlobal.WebKitMutationObserver;
var isNode = typeof self === 'undefined' && typeof process !== 'undefined' && {}.toString.call(process) === '[object process]';

// test for web worker but not in IE10
var isWorker = typeof Uint8ClampedArray !== 'undefined' && typeof importScripts !== 'undefined' && typeof MessageChannel !== 'undefined';

// node
function useNextTick() {
  // node version 0.10.x displays a deprecation warning when nextTick is used recursively
  // see https://github.com/cujojs/when/issues/410 for details
  return function () {
    return process.nextTick(flush);
  };
}

// vertx
function useVertxTimer() {
  if (typeof vertxNext !== 'undefined') {
    return function () {
      vertxNext(flush);
    };
  }

  return useSetTimeout();
}

function useMutationObserver() {
  var iterations = 0;
  var observer = new BrowserMutationObserver(flush);
  var node = document.createTextNode('');
  observer.observe(node, { characterData: true });

  return function () {
    node.data = iterations = ++iterations % 2;
  };
}

// web worker
function useMessageChannel() {
  var channel = new MessageChannel();
  channel.port1.onmessage = flush;
  return function () {
    return channel.port2.postMessage(0);
  };
}

function useSetTimeout() {
  // Store setTimeout reference so es6-promise will be unaffected by
  // other code modifying setTimeout (like sinon.useFakeTimers())
  var globalSetTimeout = setTimeout;
  return function () {
    return globalSetTimeout(flush, 1);
  };
}

var queue = new Array(1000);
function flush() {
  for (var i = 0; i < len; i += 2) {
    var callback = queue[i];
    var arg = queue[i + 1];

    callback(arg);

    queue[i] = undefined;
    queue[i + 1] = undefined;
  }

  len = 0;
}

function attemptVertx() {
  try {
    var vertx = Function('return this')().require('vertx');
    vertxNext = vertx.runOnLoop || vertx.runOnContext;
    return useVertxTimer();
  } catch (e) {
    return useSetTimeout();
  }
}

var scheduleFlush = void 0;
// Decide what async method to use to triggering processing of queued callbacks:
if (isNode) {
  scheduleFlush = useNextTick();
} else if (BrowserMutationObserver) {
  scheduleFlush = useMutationObserver();
} else if (isWorker) {
  scheduleFlush = useMessageChannel();
} else if (browserWindow === undefined && "function" === 'function') {
  scheduleFlush = attemptVertx();
} else {
  scheduleFlush = useSetTimeout();
}

function then(onFulfillment, onRejection) {
  var parent = this;

  var child = new this.constructor(noop);

  if (child[PROMISE_ID] === undefined) {
    makePromise(child);
  }

  var _state = parent._state;


  if (_state) {
    var callback = arguments[_state - 1];
    asap(function () {
      return invokeCallback(_state, child, callback, parent._result);
    });
  } else {
    subscribe(parent, child, onFulfillment, onRejection);
  }

  return child;
}

/**
  `Promise.resolve` returns a promise that will become resolved with the
  passed `value`. It is shorthand for the following:

  ```javascript
  let promise = new Promise(function(resolve, reject){
    resolve(1);
  });

  promise.then(function(value){
    // value === 1
  });
  ```

  Instead of writing the above, your code now simply becomes the following:

  ```javascript
  let promise = Promise.resolve(1);

  promise.then(function(value){
    // value === 1
  });
  ```

  @method resolve
  @static
  @param {Any} value value that the returned promise will be resolved with
  Useful for tooling.
  @return {Promise} a promise that will become fulfilled with the given
  `value`
*/
function resolve$1(object) {
  /*jshint validthis:true */
  var Constructor = this;

  if (object && typeof object === 'object' && object.constructor === Constructor) {
    return object;
  }

  var promise = new Constructor(noop);
  resolve(promise, object);
  return promise;
}

var PROMISE_ID = Math.random().toString(36).substring(2);

function noop() {}

var PENDING = void 0;
var FULFILLED = 1;
var REJECTED = 2;

function selfFulfillment() {
  return new TypeError("You cannot resolve a promise with itself");
}

function cannotReturnOwn() {
  return new TypeError('A promises callback cannot return that same promise.');
}

function tryThen(then$$1, value, fulfillmentHandler, rejectionHandler) {
  try {
    then$$1.call(value, fulfillmentHandler, rejectionHandler);
  } catch (e) {
    return e;
  }
}

function handleForeignThenable(promise, thenable, then$$1) {
  asap(function (promise) {
    var sealed = false;
    var error = tryThen(then$$1, thenable, function (value) {
      if (sealed) {
        return;
      }
      sealed = true;
      if (thenable !== value) {
        resolve(promise, value);
      } else {
        fulfill(promise, value);
      }
    }, function (reason) {
      if (sealed) {
        return;
      }
      sealed = true;

      reject(promise, reason);
    }, 'Settle: ' + (promise._label || ' unknown promise'));

    if (!sealed && error) {
      sealed = true;
      reject(promise, error);
    }
  }, promise);
}

function handleOwnThenable(promise, thenable) {
  if (thenable._state === FULFILLED) {
    fulfill(promise, thenable._result);
  } else if (thenable._state === REJECTED) {
    reject(promise, thenable._result);
  } else {
    subscribe(thenable, undefined, function (value) {
      return resolve(promise, value);
    }, function (reason) {
      return reject(promise, reason);
    });
  }
}

function handleMaybeThenable(promise, maybeThenable, then$$1) {
  if (maybeThenable.constructor === promise.constructor && then$$1 === then && maybeThenable.constructor.resolve === resolve$1) {
    handleOwnThenable(promise, maybeThenable);
  } else {
    if (then$$1 === undefined) {
      fulfill(promise, maybeThenable);
    } else if (isFunction(then$$1)) {
      handleForeignThenable(promise, maybeThenable, then$$1);
    } else {
      fulfill(promise, maybeThenable);
    }
  }
}

function resolve(promise, value) {
  if (promise === value) {
    reject(promise, selfFulfillment());
  } else if (objectOrFunction(value)) {
    var then$$1 = void 0;
    try {
      then$$1 = value.then;
    } catch (error) {
      reject(promise, error);
      return;
    }
    handleMaybeThenable(promise, value, then$$1);
  } else {
    fulfill(promise, value);
  }
}

function publishRejection(promise) {
  if (promise._onerror) {
    promise._onerror(promise._result);
  }

  publish(promise);
}

function fulfill(promise, value) {
  if (promise._state !== PENDING) {
    return;
  }

  promise._result = value;
  promise._state = FULFILLED;

  if (promise._subscribers.length !== 0) {
    asap(publish, promise);
  }
}

function reject(promise, reason) {
  if (promise._state !== PENDING) {
    return;
  }
  promise._state = REJECTED;
  promise._result = reason;

  asap(publishRejection, promise);
}

function subscribe(parent, child, onFulfillment, onRejection) {
  var _subscribers = parent._subscribers;
  var length = _subscribers.length;


  parent._onerror = null;

  _subscribers[length] = child;
  _subscribers[length + FULFILLED] = onFulfillment;
  _subscribers[length + REJECTED] = onRejection;

  if (length === 0 && parent._state) {
    asap(publish, parent);
  }
}

function publish(promise) {
  var subscribers = promise._subscribers;
  var settled = promise._state;

  if (subscribers.length === 0) {
    return;
  }

  var child = void 0,
      callback = void 0,
      detail = promise._result;

  for (var i = 0; i < subscribers.length; i += 3) {
    child = subscribers[i];
    callback = subscribers[i + settled];

    if (child) {
      invokeCallback(settled, child, callback, detail);
    } else {
      callback(detail);
    }
  }

  promise._subscribers.length = 0;
}

function invokeCallback(settled, promise, callback, detail) {
  var hasCallback = isFunction(callback),
      value = void 0,
      error = void 0,
      succeeded = true;

  if (hasCallback) {
    try {
      value = callback(detail);
    } catch (e) {
      succeeded = false;
      error = e;
    }

    if (promise === value) {
      reject(promise, cannotReturnOwn());
      return;
    }
  } else {
    value = detail;
  }

  if (promise._state !== PENDING) {
    // noop
  } else if (hasCallback && succeeded) {
    resolve(promise, value);
  } else if (succeeded === false) {
    reject(promise, error);
  } else if (settled === FULFILLED) {
    fulfill(promise, value);
  } else if (settled === REJECTED) {
    reject(promise, value);
  }
}

function initializePromise(promise, resolver) {
  try {
    resolver(function resolvePromise(value) {
      resolve(promise, value);
    }, function rejectPromise(reason) {
      reject(promise, reason);
    });
  } catch (e) {
    reject(promise, e);
  }
}

var id = 0;
function nextId() {
  return id++;
}

function makePromise(promise) {
  promise[PROMISE_ID] = id++;
  promise._state = undefined;
  promise._result = undefined;
  promise._subscribers = [];
}

function validationError() {
  return new Error('Array Methods must be provided an Array');
}

var Enumerator = function () {
  function Enumerator(Constructor, input) {
    this._instanceConstructor = Constructor;
    this.promise = new Constructor(noop);

    if (!this.promise[PROMISE_ID]) {
      makePromise(this.promise);
    }

    if (isArray(input)) {
      this.length = input.length;
      this._remaining = input.length;

      this._result = new Array(this.length);

      if (this.length === 0) {
        fulfill(this.promise, this._result);
      } else {
        this.length = this.length || 0;
        this._enumerate(input);
        if (this._remaining === 0) {
          fulfill(this.promise, this._result);
        }
      }
    } else {
      reject(this.promise, validationError());
    }
  }

  Enumerator.prototype._enumerate = function _enumerate(input) {
    for (var i = 0; this._state === PENDING && i < input.length; i++) {
      this._eachEntry(input[i], i);
    }
  };

  Enumerator.prototype._eachEntry = function _eachEntry(entry, i) {
    var c = this._instanceConstructor;
    var resolve$$1 = c.resolve;


    if (resolve$$1 === resolve$1) {
      var _then = void 0;
      var error = void 0;
      var didError = false;
      try {
        _then = entry.then;
      } catch (e) {
        didError = true;
        error = e;
      }

      if (_then === then && entry._state !== PENDING) {
        this._settledAt(entry._state, i, entry._result);
      } else if (typeof _then !== 'function') {
        this._remaining--;
        this._result[i] = entry;
      } else if (c === Promise$1) {
        var promise = new c(noop);
        if (didError) {
          reject(promise, error);
        } else {
          handleMaybeThenable(promise, entry, _then);
        }
        this._willSettleAt(promise, i);
      } else {
        this._willSettleAt(new c(function (resolve$$1) {
          return resolve$$1(entry);
        }), i);
      }
    } else {
      this._willSettleAt(resolve$$1(entry), i);
    }
  };

  Enumerator.prototype._settledAt = function _settledAt(state, i, value) {
    var promise = this.promise;


    if (promise._state === PENDING) {
      this._remaining--;

      if (state === REJECTED) {
        reject(promise, value);
      } else {
        this._result[i] = value;
      }
    }

    if (this._remaining === 0) {
      fulfill(promise, this._result);
    }
  };

  Enumerator.prototype._willSettleAt = function _willSettleAt(promise, i) {
    var enumerator = this;

    subscribe(promise, undefined, function (value) {
      return enumerator._settledAt(FULFILLED, i, value);
    }, function (reason) {
      return enumerator._settledAt(REJECTED, i, reason);
    });
  };

  return Enumerator;
}();

/**
  `Promise.all` accepts an array of promises, and returns a new promise which
  is fulfilled with an array of fulfillment values for the passed promises, or
  rejected with the reason of the first passed promise to be rejected. It casts all
  elements of the passed iterable to promises as it runs this algorithm.

  Example:

  ```javascript
  let promise1 = resolve(1);
  let promise2 = resolve(2);
  let promise3 = resolve(3);
  let promises = [ promise1, promise2, promise3 ];

  Promise.all(promises).then(function(array){
    // The array here would be [ 1, 2, 3 ];
  });
  ```

  If any of the `promises` given to `all` are rejected, the first promise
  that is rejected will be given as an argument to the returned promises's
  rejection handler. For example:

  Example:

  ```javascript
  let promise1 = resolve(1);
  let promise2 = reject(new Error("2"));
  let promise3 = reject(new Error("3"));
  let promises = [ promise1, promise2, promise3 ];

  Promise.all(promises).then(function(array){
    // Code here never runs because there are rejected promises!
  }, function(error) {
    // error.message === "2"
  });
  ```

  @method all
  @static
  @param {Array} entries array of promises
  @param {String} label optional string for labeling the promise.
  Useful for tooling.
  @return {Promise} promise that is fulfilled when all `promises` have been
  fulfilled, or rejected if any of them become rejected.
  @static
*/
function all(entries) {
  return new Enumerator(this, entries).promise;
}

/**
  `Promise.race` returns a new promise which is settled in the same way as the
  first passed promise to settle.

  Example:

  ```javascript
  let promise1 = new Promise(function(resolve, reject){
    setTimeout(function(){
      resolve('promise 1');
    }, 200);
  });

  let promise2 = new Promise(function(resolve, reject){
    setTimeout(function(){
      resolve('promise 2');
    }, 100);
  });

  Promise.race([promise1, promise2]).then(function(result){
    // result === 'promise 2' because it was resolved before promise1
    // was resolved.
  });
  ```

  `Promise.race` is deterministic in that only the state of the first
  settled promise matters. For example, even if other promises given to the
  `promises` array argument are resolved, but the first settled promise has
  become rejected before the other promises became fulfilled, the returned
  promise will become rejected:

  ```javascript
  let promise1 = new Promise(function(resolve, reject){
    setTimeout(function(){
      resolve('promise 1');
    }, 200);
  });

  let promise2 = new Promise(function(resolve, reject){
    setTimeout(function(){
      reject(new Error('promise 2'));
    }, 100);
  });

  Promise.race([promise1, promise2]).then(function(result){
    // Code here never runs
  }, function(reason){
    // reason.message === 'promise 2' because promise 2 became rejected before
    // promise 1 became fulfilled
  });
  ```

  An example real-world use case is implementing timeouts:

  ```javascript
  Promise.race([ajax('foo.json'), timeout(5000)])
  ```

  @method race
  @static
  @param {Array} promises array of promises to observe
  Useful for tooling.
  @return {Promise} a promise which settles in the same way as the first passed
  promise to settle.
*/
function race(entries) {
  /*jshint validthis:true */
  var Constructor = this;

  if (!isArray(entries)) {
    return new Constructor(function (_, reject) {
      return reject(new TypeError('You must pass an array to race.'));
    });
  } else {
    return new Constructor(function (resolve, reject) {
      var length = entries.length;
      for (var i = 0; i < length; i++) {
        Constructor.resolve(entries[i]).then(resolve, reject);
      }
    });
  }
}

/**
  `Promise.reject` returns a promise rejected with the passed `reason`.
  It is shorthand for the following:

  ```javascript
  let promise = new Promise(function(resolve, reject){
    reject(new Error('WHOOPS'));
  });

  promise.then(function(value){
    // Code here doesn't run because the promise is rejected!
  }, function(reason){
    // reason.message === 'WHOOPS'
  });
  ```

  Instead of writing the above, your code now simply becomes the following:

  ```javascript
  let promise = Promise.reject(new Error('WHOOPS'));

  promise.then(function(value){
    // Code here doesn't run because the promise is rejected!
  }, function(reason){
    // reason.message === 'WHOOPS'
  });
  ```

  @method reject
  @static
  @param {Any} reason value that the returned promise will be rejected with.
  Useful for tooling.
  @return {Promise} a promise rejected with the given `reason`.
*/
function reject$1(reason) {
  /*jshint validthis:true */
  var Constructor = this;
  var promise = new Constructor(noop);
  reject(promise, reason);
  return promise;
}

function needsResolver() {
  throw new TypeError('You must pass a resolver function as the first argument to the promise constructor');
}

function needsNew() {
  throw new TypeError("Failed to construct 'Promise': Please use the 'new' operator, this object constructor cannot be called as a function.");
}

/**
  Promise objects represent the eventual result of an asynchronous operation. The
  primary way of interacting with a promise is through its `then` method, which
  registers callbacks to receive either a promise's eventual value or the reason
  why the promise cannot be fulfilled.

  Terminology
  -----------

  - `promise` is an object or function with a `then` method whose behavior conforms to this specification.
  - `thenable` is an object or function that defines a `then` method.
  - `value` is any legal JavaScript value (including undefined, a thenable, or a promise).
  - `exception` is a value that is thrown using the throw statement.
  - `reason` is a value that indicates why a promise was rejected.
  - `settled` the final resting state of a promise, fulfilled or rejected.

  A promise can be in one of three states: pending, fulfilled, or rejected.

  Promises that are fulfilled have a fulfillment value and are in the fulfilled
  state.  Promises that are rejected have a rejection reason and are in the
  rejected state.  A fulfillment value is never a thenable.

  Promises can also be said to *resolve* a value.  If this value is also a
  promise, then the original promise's settled state will match the value's
  settled state.  So a promise that *resolves* a promise that rejects will
  itself reject, and a promise that *resolves* a promise that fulfills will
  itself fulfill.


  Basic Usage:
  ------------

  ```js
  let promise = new Promise(function(resolve, reject) {
    // on success
    resolve(value);

    // on failure
    reject(reason);
  });

  promise.then(function(value) {
    // on fulfillment
  }, function(reason) {
    // on rejection
  });
  ```

  Advanced Usage:
  ---------------

  Promises shine when abstracting away asynchronous interactions such as
  `XMLHttpRequest`s.

  ```js
  function getJSON(url) {
    return new Promise(function(resolve, reject){
      let xhr = new XMLHttpRequest();

      xhr.open('GET', url);
      xhr.onreadystatechange = handler;
      xhr.responseType = 'json';
      xhr.setRequestHeader('Accept', 'application/json');
      xhr.send();

      function handler() {
        if (this.readyState === this.DONE) {
          if (this.status === 200) {
            resolve(this.response);
          } else {
            reject(new Error('getJSON: `' + url + '` failed with status: [' + this.status + ']'));
          }
        }
      };
    });
  }

  getJSON('/posts.json').then(function(json) {
    // on fulfillment
  }, function(reason) {
    // on rejection
  });
  ```

  Unlike callbacks, promises are great composable primitives.

  ```js
  Promise.all([
    getJSON('/posts'),
    getJSON('/comments')
  ]).then(function(values){
    values[0] // => postsJSON
    values[1] // => commentsJSON

    return values;
  });
  ```

  @class Promise
  @param {Function} resolver
  Useful for tooling.
  @constructor
*/

var Promise$1 = function () {
  function Promise(resolver) {
    this[PROMISE_ID] = nextId();
    this._result = this._state = undefined;
    this._subscribers = [];

    if (noop !== resolver) {
      typeof resolver !== 'function' && needsResolver();
      this instanceof Promise ? initializePromise(this, resolver) : needsNew();
    }
  }

  /**
  The primary way of interacting with a promise is through its `then` method,
  which registers callbacks to receive either a promise's eventual value or the
  reason why the promise cannot be fulfilled.
   ```js
  findUser().then(function(user){
    // user is available
  }, function(reason){
    // user is unavailable, and you are given the reason why
  });
  ```
   Chaining
  --------
   The return value of `then` is itself a promise.  This second, 'downstream'
  promise is resolved with the return value of the first promise's fulfillment
  or rejection handler, or rejected if the handler throws an exception.
   ```js
  findUser().then(function (user) {
    return user.name;
  }, function (reason) {
    return 'default name';
  }).then(function (userName) {
    // If `findUser` fulfilled, `userName` will be the user's name, otherwise it
    // will be `'default name'`
  });
   findUser().then(function (user) {
    throw new Error('Found user, but still unhappy');
  }, function (reason) {
    throw new Error('`findUser` rejected and we're unhappy');
  }).then(function (value) {
    // never reached
  }, function (reason) {
    // if `findUser` fulfilled, `reason` will be 'Found user, but still unhappy'.
    // If `findUser` rejected, `reason` will be '`findUser` rejected and we're unhappy'.
  });
  ```
  If the downstream promise does not specify a rejection handler, rejection reasons will be propagated further downstream.
   ```js
  findUser().then(function (user) {
    throw new PedagogicalException('Upstream error');
  }).then(function (value) {
    // never reached
  }).then(function (value) {
    // never reached
  }, function (reason) {
    // The `PedgagocialException` is propagated all the way down to here
  });
  ```
   Assimilation
  ------------
   Sometimes the value you want to propagate to a downstream promise can only be
  retrieved asynchronously. This can be achieved by returning a promise in the
  fulfillment or rejection handler. The downstream promise will then be pending
  until the returned promise is settled. This is called *assimilation*.
   ```js
  findUser().then(function (user) {
    return findCommentsByAuthor(user);
  }).then(function (comments) {
    // The user's comments are now available
  });
  ```
   If the assimliated promise rejects, then the downstream promise will also reject.
   ```js
  findUser().then(function (user) {
    return findCommentsByAuthor(user);
  }).then(function (comments) {
    // If `findCommentsByAuthor` fulfills, we'll have the value here
  }, function (reason) {
    // If `findCommentsByAuthor` rejects, we'll have the reason here
  });
  ```
   Simple Example
  --------------
   Synchronous Example
   ```javascript
  let result;
   try {
    result = findResult();
    // success
  } catch(reason) {
    // failure
  }
  ```
   Errback Example
   ```js
  findResult(function(result, err){
    if (err) {
      // failure
    } else {
      // success
    }
  });
  ```
   Promise Example;
   ```javascript
  findResult().then(function(result){
    // success
  }, function(reason){
    // failure
  });
  ```
   Advanced Example
  --------------
   Synchronous Example
   ```javascript
  let author, books;
   try {
    author = findAuthor();
    books  = findBooksByAuthor(author);
    // success
  } catch(reason) {
    // failure
  }
  ```
   Errback Example
   ```js
   function foundBooks(books) {
   }
   function failure(reason) {
   }
   findAuthor(function(author, err){
    if (err) {
      failure(err);
      // failure
    } else {
      try {
        findBoooksByAuthor(author, function(books, err) {
          if (err) {
            failure(err);
          } else {
            try {
              foundBooks(books);
            } catch(reason) {
              failure(reason);
            }
          }
        });
      } catch(error) {
        failure(err);
      }
      // success
    }
  });
  ```
   Promise Example;
   ```javascript
  findAuthor().
    then(findBooksByAuthor).
    then(function(books){
      // found books
  }).catch(function(reason){
    // something went wrong
  });
  ```
   @method then
  @param {Function} onFulfilled
  @param {Function} onRejected
  Useful for tooling.
  @return {Promise}
  */

  /**
  `catch` is simply sugar for `then(undefined, onRejection)` which makes it the same
  as the catch block of a try/catch statement.
  ```js
  function findAuthor(){
  throw new Error('couldn't find that author');
  }
  // synchronous
  try {
  findAuthor();
  } catch(reason) {
  // something went wrong
  }
  // async with promises
  findAuthor().catch(function(reason){
  // something went wrong
  });
  ```
  @method catch
  @param {Function} onRejection
  Useful for tooling.
  @return {Promise}
  */


  Promise.prototype.catch = function _catch(onRejection) {
    return this.then(null, onRejection);
  };

  /**
    `finally` will be invoked regardless of the promise's fate just as native
    try/catch/finally behaves
  
    Synchronous example:
  
    ```js
    findAuthor() {
      if (Math.random() > 0.5) {
        throw new Error();
      }
      return new Author();
    }
  
    try {
      return findAuthor(); // succeed or fail
    } catch(error) {
      return findOtherAuther();
    } finally {
      // always runs
      // doesn't affect the return value
    }
    ```
  
    Asynchronous example:
  
    ```js
    findAuthor().catch(function(reason){
      return findOtherAuther();
    }).finally(function(){
      // author was either found, or not
    });
    ```
  
    @method finally
    @param {Function} callback
    @return {Promise}
  */


  Promise.prototype.finally = function _finally(callback) {
    var promise = this;
    var constructor = promise.constructor;

    if (isFunction(callback)) {
      return promise.then(function (value) {
        return constructor.resolve(callback()).then(function () {
          return value;
        });
      }, function (reason) {
        return constructor.resolve(callback()).then(function () {
          throw reason;
        });
      });
    }

    return promise.then(callback, callback);
  };

  return Promise;
}();

Promise$1.prototype.then = then;
Promise$1.all = all;
Promise$1.race = race;
Promise$1.resolve = resolve$1;
Promise$1.reject = reject$1;
Promise$1._setScheduler = setScheduler;
Promise$1._setAsap = setAsap;
Promise$1._asap = asap;

/*global self*/
function polyfill() {
  var local = void 0;

  if (typeof global !== 'undefined') {
    local = global;
  } else if (typeof self !== 'undefined') {
    local = self;
  } else {
    try {
      local = Function('return this')();
    } catch (e) {
      throw new Error('polyfill failed because global object is unavailable in this environment');
    }
  }

  var P = local.Promise;

  if (P) {
    var promiseToString = null;
    try {
      promiseToString = Object.prototype.toString.call(P.resolve());
    } catch (e) {
      // silently ignored
    }

    if (promiseToString === '[object Promise]' && !P.cast) {
      return;
    }
  }

  local.Promise = Promise$1;
}

// Strange compat..
Promise$1.polyfill = polyfill;
Promise$1.Promise = Promise$1;

return Promise$1;

})));



//# sourceMappingURL=es6-promise.map

/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(13), __webpack_require__(14)))

/***/ }),
/* 4 */
/***/ (function(module, exports) {

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}

module.exports = _classCallCheck;
module.exports["default"] = module.exports, module.exports.__esModule = true;

/***/ }),
/* 5 */
/***/ (function(module, exports) {

function _defineProperties(target, props) {
  for (var i = 0; i < props.length; i++) {
    var descriptor = props[i];
    descriptor.enumerable = descriptor.enumerable || false;
    descriptor.configurable = true;
    if ("value" in descriptor) descriptor.writable = true;
    Object.defineProperty(target, descriptor.key, descriptor);
  }
}

function _createClass(Constructor, protoProps, staticProps) {
  if (protoProps) _defineProperties(Constructor.prototype, protoProps);
  if (staticProps) _defineProperties(Constructor, staticProps);
  return Constructor;
}

module.exports = _createClass;
module.exports["default"] = module.exports, module.exports.__esModule = true;

/***/ }),
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

var arrayWithoutHoles = __webpack_require__(18);

var iterableToArray = __webpack_require__(19);

var unsupportedIterableToArray = __webpack_require__(7);

var nonIterableSpread = __webpack_require__(20);

function _toConsumableArray(arr) {
  return arrayWithoutHoles(arr) || iterableToArray(arr) || unsupportedIterableToArray(arr) || nonIterableSpread();
}

module.exports = _toConsumableArray;
module.exports["default"] = module.exports, module.exports.__esModule = true;

/***/ }),
/* 7 */
/***/ (function(module, exports, __webpack_require__) {

var arrayLikeToArray = __webpack_require__(8);

function _unsupportedIterableToArray(o, minLen) {
  if (!o) return;
  if (typeof o === "string") return arrayLikeToArray(o, minLen);
  var n = Object.prototype.toString.call(o).slice(8, -1);
  if (n === "Object" && o.constructor) n = o.constructor.name;
  if (n === "Map" || n === "Set") return Array.from(o);
  if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return arrayLikeToArray(o, minLen);
}

module.exports = _unsupportedIterableToArray;
module.exports["default"] = module.exports, module.exports.__esModule = true;

/***/ }),
/* 8 */
/***/ (function(module, exports) {

function _arrayLikeToArray(arr, len) {
  if (len == null || len > arr.length) len = arr.length;

  for (var i = 0, arr2 = new Array(len); i < len; i++) {
    arr2[i] = arr[i];
  }

  return arr2;
}

module.exports = _arrayLikeToArray;
module.exports["default"] = module.exports, module.exports.__esModule = true;

/***/ }),
/* 9 */
/***/ (function(module, exports, __webpack_require__) {

var objectWithoutPropertiesLoose = __webpack_require__(12);

function _objectWithoutProperties(source, excluded) {
  if (source == null) return {};
  var target = objectWithoutPropertiesLoose(source, excluded);
  var key, i;

  if (Object.getOwnPropertySymbols) {
    var sourceSymbolKeys = Object.getOwnPropertySymbols(source);

    for (i = 0; i < sourceSymbolKeys.length; i++) {
      key = sourceSymbolKeys[i];
      if (excluded.indexOf(key) >= 0) continue;
      if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue;
      target[key] = source[key];
    }
  }

  return target;
}

module.exports = _objectWithoutProperties;
module.exports["default"] = module.exports, module.exports.__esModule = true;

/***/ }),
/* 10 */
/***/ (function(module, exports) {

function _typeof(obj) {
  "@babel/helpers - typeof";

  if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
    module.exports = _typeof = function _typeof(obj) {
      return typeof obj;
    };

    module.exports["default"] = module.exports, module.exports.__esModule = true;
  } else {
    module.exports = _typeof = function _typeof(obj) {
      return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
    };

    module.exports["default"] = module.exports, module.exports.__esModule = true;
  }

  return _typeof(obj);
}

module.exports = _typeof;
module.exports["default"] = module.exports, module.exports.__esModule = true;

/***/ }),
/* 11 */
/***/ (function(module, exports) {

module.exports = "<div class=\"banner-body flex-box-row\"> <i class=adjust-logo></i> <div class=flex-one> <h4 class=banner-text>Adjust Smart Banners</h4> <h5 class=banner-text>Not so smart actually, but deep links do the magic</h5> </div> <button>Go to App</button> </div> ";

/***/ }),
/* 12 */
/***/ (function(module, exports) {

function _objectWithoutPropertiesLoose(source, excluded) {
  if (source == null) return {};
  var target = {};
  var sourceKeys = Object.keys(source);
  var key, i;

  for (i = 0; i < sourceKeys.length; i++) {
    key = sourceKeys[i];
    if (excluded.indexOf(key) >= 0) continue;
    target[key] = source[key];
  }

  return target;
}

module.exports = _objectWithoutPropertiesLoose;
module.exports["default"] = module.exports, module.exports.__esModule = true;

/***/ }),
/* 13 */
/***/ (function(module, exports) {

// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;
process.prependListener = noop;
process.prependOnceListener = noop;

process.listeners = function (name) { return [] }

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };


/***/ }),
/* 14 */
/***/ (function(module, exports) {

var g;

// This works in non-strict mode
g = (function() {
	return this;
})();

try {
	// This works if eval is allowed (see CSP)
	g = g || new Function("return this")();
} catch (e) {
	// This works if the window reference is available
	if (typeof window === "object") g = window;
}

// g can still be undefined, but nothing to do about it...
// We return undefined, instead of nothing here, so it's
// easier to handle this case. if(!global) { ...}

module.exports = g;


/***/ }),
/* 15 */
/***/ (function(module, exports) {

function _arrayWithHoles(arr) {
  if (Array.isArray(arr)) return arr;
}

module.exports = _arrayWithHoles;
module.exports["default"] = module.exports, module.exports.__esModule = true;

/***/ }),
/* 16 */
/***/ (function(module, exports) {

function _iterableToArrayLimit(arr, i) {
  var _i = arr == null ? null : typeof Symbol !== "undefined" && arr[Symbol.iterator] || arr["@@iterator"];

  if (_i == null) return;
  var _arr = [];
  var _n = true;
  var _d = false;

  var _s, _e;

  try {
    for (_i = _i.call(arr); !(_n = (_s = _i.next()).done); _n = true) {
      _arr.push(_s.value);

      if (i && _arr.length === i) break;
    }
  } catch (err) {
    _d = true;
    _e = err;
  } finally {
    try {
      if (!_n && _i["return"] != null) _i["return"]();
    } finally {
      if (_d) throw _e;
    }
  }

  return _arr;
}

module.exports = _iterableToArrayLimit;
module.exports["default"] = module.exports, module.exports.__esModule = true;

/***/ }),
/* 17 */
/***/ (function(module, exports) {

function _nonIterableRest() {
  throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}

module.exports = _nonIterableRest;
module.exports["default"] = module.exports, module.exports.__esModule = true;

/***/ }),
/* 18 */
/***/ (function(module, exports, __webpack_require__) {

var arrayLikeToArray = __webpack_require__(8);

function _arrayWithoutHoles(arr) {
  if (Array.isArray(arr)) return arrayLikeToArray(arr);
}

module.exports = _arrayWithoutHoles;
module.exports["default"] = module.exports, module.exports.__esModule = true;

/***/ }),
/* 19 */
/***/ (function(module, exports) {

function _iterableToArray(iter) {
  if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter);
}

module.exports = _iterableToArray;
module.exports["default"] = module.exports, module.exports.__esModule = true;

/***/ }),
/* 20 */
/***/ (function(module, exports) {

function _nonIterableSpread() {
  throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}

module.exports = _nonIterableSpread;
module.exports["default"] = module.exports, module.exports.__esModule = true;

/***/ }),
/* 21 */
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(22)(false);
// imports


// module
exports.push([module.i, ".flex-box-column{display:-webkit-box;display:-moz-box;display:-ms-flexbox;display:-webkit-flex;display:flex;-webkit-flex-direction:column;-ms-flex-direction:column;flex-direction:column;-webkit-box-direction:normal;-moz-box-direction:normal;box-direction:normal;-webkit-box-orient:vertical;-moz-box-orient:vertical;box-orient:vertical}.flex-box-row{display:-webkit-box;display:-moz-box;display:-ms-flexbox;display:-webkit-flex;display:flex;-webkit-flex-direction:row;-ms-flex-direction:row;flex-direction:row;-webkit-box-direction:normal;-moz-box-direction:normal;box-direction:normal;-webkit-box-orient:horizontal;-moz-box-orient:horizontal;box-orient:horizontal}.flex-auto{-webkit-box-flex:0 0 auto;-moz-box-flex:0 0 auto;-webkit-flex:0 0 auto;-ms-flex:0 0 auto;flex:0 0 auto}.flex-one{-webkit-box-flex:1 1 0%;-moz-box-flex:1 1 0%;-webkit-flex:1 1 0%;-ms-flex:1 1 0%;flex:1 1 0%;min-height:0;min-width:0}.flex-two{-webkit-box-flex:2;-moz-box-flex:2;-webkit-flex:2;-ms-flex:2;flex:2}.banner{width:100vw;position:fixed;left:0;bottom:0;background-color:white}.banner .banner-body{align-items:center;margin:2px 8px}.banner .banner-body .banner-text{overflow:hidden;white-space:nowrap;text-overflow:ellipsis}.banner .banner-body button{background-color:#00bed5;color:white;border:none;border-radius:2px;padding:8px 10px;display:inline-block;vertical-align:middle;text-transform:uppercase;text-align:center;font-size:.9em;letter-spacing:.02em;cursor:pointer}\n", ""]);

// exports


/***/ }),
/* 22 */
/***/ (function(module, exports) {

/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/
// css base code, injected by the css-loader
module.exports = function(useSourceMap) {
	var list = [];

	// return the list of modules as css string
	list.toString = function toString() {
		return this.map(function (item) {
			var content = cssWithMappingToString(item, useSourceMap);
			if(item[2]) {
				return "@media " + item[2] + "{" + content + "}";
			} else {
				return content;
			}
		}).join("");
	};

	// import a list of modules into the list
	list.i = function(modules, mediaQuery) {
		if(typeof modules === "string")
			modules = [[null, modules, ""]];
		var alreadyImportedModules = {};
		for(var i = 0; i < this.length; i++) {
			var id = this[i][0];
			if(typeof id === "number")
				alreadyImportedModules[id] = true;
		}
		for(i = 0; i < modules.length; i++) {
			var item = modules[i];
			// skip already imported module
			// this implementation is not 100% perfect for weird media query combinations
			//  when a module is imported multiple times with different media queries.
			//  I hope this will never occur (Hey this way we have smaller bundles)
			if(typeof item[0] !== "number" || !alreadyImportedModules[item[0]]) {
				if(mediaQuery && !item[2]) {
					item[2] = mediaQuery;
				} else if(mediaQuery) {
					item[2] = "(" + item[2] + ") and (" + mediaQuery + ")";
				}
				list.push(item);
			}
		}
	};
	return list;
};

function cssWithMappingToString(item, useSourceMap) {
	var content = item[1] || '';
	var cssMapping = item[3];
	if (!cssMapping) {
		return content;
	}

	if (useSourceMap && typeof btoa === 'function') {
		var sourceMapping = toComment(cssMapping);
		var sourceURLs = cssMapping.sources.map(function (source) {
			return '/*# sourceURL=' + cssMapping.sourceRoot + source + ' */'
		});

		return [content].concat(sourceURLs).concat([sourceMapping]).join('\n');
	}

	return [content].join('\n');
}

// Adapted from convert-source-map (MIT)
function toComment(sourceMap) {
	// eslint-disable-next-line no-undef
	var base64 = btoa(unescape(encodeURIComponent(JSON.stringify(sourceMap))));
	var data = 'sourceMappingURL=data:application/json;charset=utf-8;base64,' + base64;

	return '/*# ' + data + ' */';
}


/***/ }),
/* 23 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
// ESM COMPAT FLAG
__webpack_require__.r(__webpack_exports__);

// EXTERNAL MODULE: ./node_modules/@babel/runtime/helpers/objectSpread2.js
var objectSpread2 = __webpack_require__(0);
var objectSpread2_default = /*#__PURE__*/__webpack_require__.n(objectSpread2);

// EXTERNAL MODULE: ./node_modules/@babel/runtime/helpers/objectWithoutProperties.js
var objectWithoutProperties = __webpack_require__(9);
var objectWithoutProperties_default = /*#__PURE__*/__webpack_require__.n(objectWithoutProperties);

// EXTERNAL MODULE: ./node_modules/@babel/runtime/helpers/slicedToArray.js
var slicedToArray = __webpack_require__(1);
var slicedToArray_default = /*#__PURE__*/__webpack_require__.n(slicedToArray);

// EXTERNAL MODULE: ./node_modules/@babel/runtime/helpers/toConsumableArray.js
var toConsumableArray = __webpack_require__(6);
var toConsumableArray_default = /*#__PURE__*/__webpack_require__.n(toConsumableArray);

// CONCATENATED MODULE: ./src/sdk/constants.js
var SECOND = 1000;
var MINUTE = SECOND * 60;
var HOUR = MINUTE * 60;
var DAY = HOUR * 24;
var REASON_GENERAL = 'general';
var REASON_GDPR = 'gdpr';
var HTTP_ERRORS = {
  'TRANSACTION_ERROR': 'XHR transaction failed due to an error',
  'SERVER_MALFORMED_RESPONSE': 'Response from server is malformed',
  'SERVER_INTERNAL_ERROR': 'Internal error occurred on the server',
  'SERVER_CANNOT_PROCESS': 'Server was not able to process the request, probably due to error coming from the client',
  'NO_CONNECTION': 'No internet connectivity',
  'SKIP': 'Skipping slower attempt',
  'MISSING_URL': 'Url is not provided'
};
var STORAGE_TYPES = {
  NO_STORAGE: 'noStorage',
  INDEXED_DB: 'indexedDB',
  LOCAL_STORAGE: 'localStorage'
};
// EXTERNAL MODULE: ./node_modules/@babel/runtime/helpers/defineProperty.js
var defineProperty = __webpack_require__(2);
var defineProperty_default = /*#__PURE__*/__webpack_require__.n(defineProperty);

// EXTERNAL MODULE: ./node_modules/@babel/runtime/helpers/typeof.js
var helpers_typeof = __webpack_require__(10);
var typeof_default = /*#__PURE__*/__webpack_require__.n(helpers_typeof);

// CONCATENATED MODULE: ./src/sdk/utilities.ts





/**
 * Build human readable list
 */
function buildList(array
/*: Array<unknown>*/
)
/*: string*/
{
  if (!array.length) {
    return '';
  }

  if (array.length === 1) {
    return "".concat(array[0]);
  }

  var lastIndex = array.length - 1;
  var firstPart = array.slice(0, lastIndex).join(', ');
  return "".concat(firstPart, " and ").concat(array[lastIndex]);
}
/**
 * Check if object is empty
 */


function isEmpty(obj
/*: Record<string, unknown>*/
)
/*: boolean*/
{
  return !Object.keys(obj).length && obj.constructor === Object;
}
/**
 * Check if value is object
 */


function isObject(obj
/*: any*/
)
/*: boolean*/
{
  // eslint-disable-line @typescript-eslint/no-explicit-any
  return typeof_default()(obj) === 'object' && obj !== null && !(obj instanceof Array);
}
/**
 * Check if string is valid json
 */


function isValidJson(string
/*: string*/
)
/*: boolean*/
{
  try {
    var json = JSON.parse(string);
    return isObject(json);
  } catch (e) {
    return false;
  }
}
/**
 * Find index of an element in the list and return it
 */


function findIndex
/*:: <K extends string, T extends Record<K, unknown>>*/
(array
/*: Array<T>*/
, key
/*: K | Array<K>*/
, target
/*: T*/
)
/*: number*/
{
  function isEqual(item
  /*: T*/
  ) {
    return Array.isArray(key) ? key.every(function (k) {
      return item[k] === target[k];
    }) : item[key] === target;
  }

  for (var i = 0; i < array.length; i += 1) {
    if (isEqual(array[i])) {
      return i;
    }
  }

  return -1;
}
/**
 * Convert array with key/value item structure into key/value pairs object
 */


function convertToMap
/*:: <T>*/
()
/*: Record<string, T>*/
{
  var array
  /*: Array<{ key: string, value: T }>*/
  = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
  return array.reduce(function (acc, o) {
    return objectSpread2_default()(objectSpread2_default()({}, acc), {}, defineProperty_default()({}, o.key, o.value));
  }, {});
}
/**
 * Find intersecting values of provided array against given values
 */


function intersection
/*:: <T>*/
()
/*: Array<T>*/
{
  var array
  /*: Array<T>*/
  = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
  var values
  /*: Array<T>*/
  = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
  return array.filter(function (item) {
    return values.indexOf(item) !== -1;
  });
}
/**
 * Check if particular url is a certain request
 */


function isRequest(url
/*: string*/
, requestName
/*: string*/
)
/*: boolean*/
{
  var regex = new RegExp("\\/".concat(requestName, "(\\/.*|\\?.*){0,1}$"));
  return regex.test(url);
}
/**
 * Extract the host name for the url
 */


function getHostName()
/*: string*/
{
  var url = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
  return url.replace(/^(http(s)*:\/\/)*(www\.)*/, '').split('/')[0].split('?')[0];
}
/**
 * Transform array entry into object key:value pair entry
 */


function reducer
/*:: <K extends string, T>*/
(acc
/*: Record<K, T>*/
, _ref)
/*: Record<K, T>*/
{
  var _ref2 = slicedToArray_default()(_ref, 2),
      key = _ref2[0],
      value = _ref2[1];

  return objectSpread2_default()(objectSpread2_default()({}, acc), {}, defineProperty_default()({}, key, value));
}
/**
 * Extracts object entries in the [key, value] format
 */


function entries
/*:: <K extends string, T>*/
(object
/*: Record<K, T>*/
)
/*: Array<[K, T]>*/
{
  return Object.keys(object).map(function (key
  /*: K*/
  ) {
    return [key, object[key]];
  });
}
/**
 * Extracts object values
 */


function utilities_values
/*:: <T>*/
(object
/*: Record<string, T>*/
)
/*: Array<T>*/
{
  return Object.keys(object).map(function (key
  /*: string*/
  ) {
    return object[key];
  });
}
/**
 * Check if value is empty in any way (empty object, false value, zero) and use it as predicate method
 */


function isEmptyEntry(value
/*: any*/
)
/*: boolean*/
{
  // eslint-disable-line @typescript-eslint/no-explicit-any
  if (isObject(value)) {
    return !isEmpty(value);
  }

  return !!value || value === 0;
}


// CONCATENATED MODULE: ./src/sdk/globals.js
/*:: declare var __ADJUST__NAMESPACE: string*/

/*:: declare var __ADJUST__SDK_VERSION: string*/

/*:: declare var process: {|
  env: {|
    NODE_ENV: 'development' | 'production' | 'test'
  |}
|}*/
var Globals = {
  namespace: "adjust-sdk" || false,
  version: "5.1.2" || false,
  env: "production"
};
/* harmony default export */ var globals = (Globals);
// CONCATENATED MODULE: ./src/sdk/logger.js


var _levels2;



/*:: import { type LogOptionsT } from './types';*/

/*:: type LogLevelT = $PropertyType<LogOptionsT, 'logLevel'>*/

/*:: type MethodNameT = 'log' | 'info' | 'error' | 'warn'*/

var LEVEL_NONE = 'none';
var LEVEL_ERROR = 'error';
var LEVEL_WARNING = 'warning';
var LEVEL_INFO = 'info';
var LEVEL_VERBOSE = 'verbose';
/**
 * Logger levels
 * - none -> nothing is printed to the console
 * - error -> prints only error
 * - info -> prints info and error
 * - verbose -> prints log, info and error
 *
 * @type {Object}
 * @private
 */

var _levels = (_levels2 = {}, defineProperty_default()(_levels2, LEVEL_NONE, -1), defineProperty_default()(_levels2, LEVEL_ERROR, 0), defineProperty_default()(_levels2, LEVEL_WARNING, 1), defineProperty_default()(_levels2, LEVEL_INFO, 2), defineProperty_default()(_levels2, LEVEL_VERBOSE, 3), _levels2);
/**
 * Spaces placed after log level tag in console to align messages.
 *
 * @type {Object}
 * @private
 */


var _spaces = {
  'log': '  ',
  'info': ' ',
  'warn': ' ',
  'error': ''
};
/**
 * Default logger level per environment
 *
 * @type {Object}
 * @private
 */

var _envLogLevels = {
  development: LEVEL_VERBOSE,
  production: LEVEL_ERROR,
  test: LEVEL_VERBOSE
};
/**
 * Current logger level
 */

var _level = _getDefaultLogLevel();
/**
 * Optional output container to display logs for easier debugging
 *
 * @type {string}
 * @private
 */


var _output = '';
/**
 * Get default logger error per environment and fallback to error level when unknown env
 *
 * @returns {string}
 * @private
 */

function _getDefaultLogLevel()
/*: LogLevelT*/
{
  return _envLogLevels[globals.env] || LEVEL_ERROR;
}
/**
 * Set logger level, fallback to default log level
 *
 * @param {string=} logLevel
 * @param {string=} logOutput
 */


function setLogLevel(logLevel
/*: LogLevelT*/
, logOutput
/*: string*/
)
/*: void*/
{
  var exists = !logLevel || Object.keys(_levels).indexOf(logLevel) !== -1;

  if (!exists) {
    _log('error', 'error', 'You must set one of the available log levels: verbose, info, warning, error or none');

    return;
  }

  _level = logLevel || _getDefaultLogLevel();
  _output = logOutput;

  _log('info', logLevel, "Log level set to ".concat(_level));
}
/**
 * Output the message to the console
 *
 * @param {string} methodName
 * @param {string} logLevel
 * @param {Array} args
 * @private
 */


function _log(methodName
/*: MethodNameT*/
, logLevel
/*: LogLevelT*/
)
/*: void*/
{
  var _console;

  if (_levels[_level] < _levels[logLevel]) {
    return;
  }

  var time = new Date().toISOString();
  var spaces = _spaces[methodName];
  var messagePrefix = ["[".concat(globals.namespace, "]"), time, "".concat(methodName.toUpperCase(), ":").concat(spaces)];
  var outputContainer = _output ? document.querySelector(_output) : null;

  for (var _len = arguments.length, args = new Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
    args[_key - 2] = arguments[_key];
  }

  (_console = console)[methodName].apply(_console, messagePrefix.concat(args)); // eslint-disable-line


  if (outputContainer) {
    outputContainer.textContent += "".concat(messagePrefix.join(' '), " ").concat(args.map(function (m) {
      return isObject(m) ? JSON.stringify(m) : m;
    }).join(' '), "\n");
    outputContainer.scrollTop = outputContainer.scrollHeight;
  }
}
/**
 * Apply predefined log level and return log method
 *
 * @param {string} name
 * @param {string} logLevel
 * @returns {Function: (Array) => void}
 * @private
 */


function _applyLevel(name
/*: MethodNameT*/
, logLevel
/*: LogLevelT*/
) {
  return function () {
    for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
      args[_key2] = arguments[_key2];
    }

    _log.apply(void 0, [name, logLevel].concat(args));
  };
}

var Logger = {
  setLogLevel: setLogLevel,
  log: _applyLevel('log', LEVEL_VERBOSE),
  info: _applyLevel('info', LEVEL_INFO),
  warn: _applyLevel('warn', LEVEL_WARNING),
  error: _applyLevel('error', LEVEL_ERROR)
};
/* harmony default export */ var logger = (Logger);
// CONCATENATED MODULE: ./src/sdk/config.js




/*:: // 
import { type BaseParamsT, type CustomConfigT, type InitOptionsT, type BaseParamsListT, type BaseParamsMandatoryListT, type CustomConfigListT } from './types';*/



/**
 * Base parameters set by client
 * - app token
 * - environment
 * - default tracker
 * - external device ID
 *
 * @type {Object}
 * @private
 */

var _baseParams
/*: BaseParamsT*/
= {};
/**
 * Custom config set by client
 * - url override
 * - event deduplication list limit
 *
 * @type {Object}
 * @private
 */

var _customConfig
/*: CustomConfigT*/
= {};
/**
 * Mandatory fields to set for sdk initialization
 *
 * @type {string[]}
 * @private
 */

var _mandatory
/*: BaseParamsMandatoryListT*/
= ['appToken', 'environment'];
/**
 * Allowed params to be sent with each request
 *
 * @type {string[]}
 * @private
 */

var _allowedParams
/*: BaseParamsListT*/
= [].concat(_mandatory, ['defaultTracker', 'externalDeviceId']);
/**
 * Allowed configuration overrides
 *
 * @type {string[]}
 * @private
 */


var _allowedConfig
/*: CustomConfigListT*/
= ['urlStrategy', 'customUrl', 'eventDeduplicationListLimit', 'namespace'];
/**
 * Global configuration object used across the sdk
 *
 * @type {{
 * namespace: string,
 * version: string,
 * sessionWindow: number,
 * sessionTimerWindow: number,
 * requestValidityWindow: number
 * }}
 */

var _baseConfig = {
  sessionWindow: 30 * MINUTE,
  sessionTimerWindow: 60 * SECOND,
  requestValidityWindow: 28 * DAY
};
/**
 * Check of configuration has been initialized
 *
 * @returns {boolean}
 */

function isInitialised()
/*: boolean*/
{
  return _mandatory.reduce(function (acc, key) {
    return acc && !!_baseParams[key];
  }, true);
}
/**
 * Get base params set by client
 *
 * @returns {Object}
 */


function getBaseParams()
/*: BaseParamsT*/
{
  return objectSpread2_default()({}, _baseParams);
}
/**
 * Set base params and custom config for the sdk to run
 *
 * @param {Object} options
 */


function set(options
/*: InitOptionsT*/
)
/*: void*/
{
  if (hasMissing(options)) {
    return;
  }

  var filteredParams = [].concat(toConsumableArray_default()(_allowedParams), _allowedConfig).filter(function (key) {
    return !!options[key];
  }).map(function (key) {
    return [key, options[key]];
  });
  _baseParams = filteredParams.filter(function (_ref) {
    var _ref2 = slicedToArray_default()(_ref, 1),
        key = _ref2[0];

    return _allowedParams.indexOf(key) !== -1;
  }).reduce(reducer, {});
  _customConfig = filteredParams.filter(function (_ref3) {
    var _ref4 = slicedToArray_default()(_ref3, 1),
        key = _ref4[0];

    return _allowedConfig.indexOf(key) !== -1;
  }).reduce(reducer, {});
}
/**
 * Get custom config set by client
 *
 * @returns {Object}
 */


function getCustomConfig()
/*: CustomConfigT*/
{
  return objectSpread2_default()({}, _customConfig);
}
/**
 * Check if there are  missing mandatory parameters
 *
 * @param {Object} params
 * @returns {boolean}
 * @private
 */


function hasMissing(params
/*: BaseParamsT*/
)
/*: boolean*/
{
  var missing = _mandatory.filter(function (value) {
    return !params[value];
  });

  if (missing.length) {
    logger.error("You must define ".concat(buildList(missing)));
    return true;
  }

  return false;
}
/**
 * Restore config to its default state
 */


function destroy()
/*: void*/
{
  _baseParams = {};
  _customConfig = {};
}

var Config = objectSpread2_default()(objectSpread2_default()({}, _baseConfig), {}, {
  set: set,
  getBaseParams: getBaseParams,
  getCustomConfig: getCustomConfig,
  isInitialised: isInitialised,
  hasMissing: hasMissing,
  destroy: destroy
});

/* harmony default export */ var sdk_config = (Config);
// CONCATENATED MODULE: ./src/sdk/storage/scheme.ts


var _values2;


var StoreName;

(function (StoreName) {
  StoreName["Queue"] = "queue";
  StoreName["ActivityState"] = "activityState";
  StoreName["GlobalParams"] = "globalParams";
  StoreName["EventDeduplication"] = "eventDeduplication";
})(StoreName || (StoreName = {}));

var PreferencesStoreName;

(function (PreferencesStoreName) {
  PreferencesStoreName["Preferences"] = "preferences";
})(PreferencesStoreName || (PreferencesStoreName = {}));

var ShortStoreName;

(function (ShortStoreName) {
  ShortStoreName["Queue"] = "q";
  ShortStoreName["ActivityState"] = "as";
  ShortStoreName["GlobalParams"] = "gp";
  ShortStoreName["EventDeduplication"] = "ed";
})(ShortStoreName || (ShortStoreName = {}));

var ShortPreferencesStoreName;

(function (ShortPreferencesStoreName) {
  ShortPreferencesStoreName["Preferences"] = "p";
})(ShortPreferencesStoreName || (ShortPreferencesStoreName = {}));

var _queueScheme
/*: StoreOptions*/
= {
  keyPath: 'timestamp',
  autoIncrement: false,
  fields: {
    url: {
      key: 'u',
      values: {
        '/session': 1,
        '/event': 2,
        '/gdpr_forget_device': 3,
        '/sdk_click': 4,
        '/disable_third_party_sharing': 5
      }
    },
    method: {
      key: 'm',
      values: {
        GET: 1,
        POST: 2,
        PUT: 3,
        DELETE: 4
      }
    },
    timestamp: 't',
    createdAt: 'ca',
    params: {
      key: 'p',
      keys: {
        timeSpent: 'ts',
        sessionLength: 'sl',
        sessionCount: 'sc',
        eventCount: 'ec',
        lastInterval: 'li',
        eventToken: 'et',
        revenue: 're',
        currency: 'cu',
        callbackParams: 'cp',
        partnerParams: 'pp'
      }
    }
  }
};
var _activityStateScheme
/*: StoreOptions*/
= {
  keyPath: 'uuid',
  autoIncrement: false,
  fields: {
    uuid: {
      key: 'u',
      values: {
        unknown: '-'
      }
    },
    timeSpent: 'ts',
    sessionLength: 'sl',
    sessionCount: 'sc',
    eventCount: 'ec',
    lastActive: 'la',
    lastInterval: 'li',
    installed: {
      key: 'in',
      values: {
        false: 0,
        true: 1
      }
    },
    attribution: {
      key: 'at',
      keys: {
        adid: 'a',
        tracker_token: 'tt',
        tracker_name: 'tn',
        network: 'nt',
        campaign: 'cm',
        adgroup: 'ag',
        creative: 'cr',
        click_label: 'cl',
        state: {
          key: 'st',
          values: {
            installed: 1,
            reattributed: 2
          }
        }
      }
    }
  }
};
var _globalParamsScheme
/*: StoreOptions*/
= {
  keyPath: 'keyType',
  autoIncrement: false,
  index: 'type',
  fields: {
    keyType: {
      key: 'kt',
      composite: ['key', 'type']
    },
    key: 'k',
    value: 'v',
    type: {
      key: 't',
      values: {
        callback: 1,
        partner: 2
      }
    }
  }
};
var _eventDeduplicationScheme
/*: StoreOptions*/
= {
  keyPath: 'internalId',
  autoIncrement: true,
  fields: {
    internalId: 'ii',
    id: 'i'
  }
};
var _preferencesScheme
/*: StoreOptionsOptionalKey*/
= {
  fields: {
    thirdPartySharingDisabled: {
      key: 'td',
      keys: {
        reason: {
          key: 'r',
          values: defineProperty_default()({}, REASON_GENERAL, 1)
        },
        pending: {
          key: 'p',
          values: {
            false: 0,
            true: 1
          }
        }
      }
    },
    sdkDisabled: {
      key: 'sd',
      keys: {
        reason: {
          key: 'r',
          values: (_values2 = {}, defineProperty_default()(_values2, REASON_GENERAL, 1), defineProperty_default()(_values2, REASON_GDPR, 2), _values2)
        },
        pending: {
          key: 'p',
          values: {
            false: 0,
            true: 1
          }
        }
      }
    }
  }
};
var scheme_scheme
/*: Scheme*/
= {
  queue: {
    name: ShortStoreName.Queue,
    scheme: _queueScheme
  },
  activityState: {
    name: ShortStoreName.ActivityState,
    scheme: _activityStateScheme
  },
  globalParams: {
    name: ShortStoreName.GlobalParams,
    scheme: _globalParamsScheme
  },
  eventDeduplication: {
    name: ShortStoreName.EventDeduplication,
    scheme: _eventDeduplicationScheme
  },
  preferences: {
    name: ShortPreferencesStoreName.Preferences,
    scheme: _preferencesScheme,
    permanent: true
  }
};

function isPredefinedValuesField(field
/*: Maybe<StoreFieldScheme>*/
)
/*: field is StoreFieldPredefinedValues*/
{
  return !!field && Object.prototype.hasOwnProperty.call(field, 'values');
}

function isNestingStoreField(field
/*: Maybe<StoreFieldScheme>*/
)
/*: field is StoreFieldNestingFields*/
{
  return !!field && Object.prototype.hasOwnProperty.call(field, 'keys');
}

function isCompositeKeyStoreField(field
/*: Maybe<StoreFieldScheme>*/
)
/*: field is StoreFieldCompositeKey*/
{
  return !!field && Object.prototype.hasOwnProperty.call(field, 'composite');
}

function isComplexStoreField(field
/*: Maybe<StoreFieldScheme>*/
)
/*: field is StoreFieldComplex*/
{
  return !!field && typeof field !== 'string';
}


/* harmony default export */ var storage_scheme = (scheme_scheme);
// CONCATENATED MODULE: ./src/sdk/storage/scheme-map.ts





/**
 * Cast value into it's original type
 */
function _parseValue(value
/*: string*/
)
/*: any*/
{
  // eslint-disable-line @typescript-eslint/no-explicit-any
  try {
    return JSON.parse(value);
  } catch (e) {
    return value;
  }
}
/**
 * Flip key/value pairs
 */


function _flipObject(obj
/*: Record<string, unknown>*/
)
/*: Record<string, unknown>*/
{
  return entries(obj).map(function (_ref) {
    var _ref2 = slicedToArray_default()(_ref, 2),
        key = _ref2[0],
        value = _ref2[1];

    return [value, _parseValue(key)];
  }).reduce(reducer, {});
}
/**
 * Flip store name definition names:
 * - short key pointing the long one along with additional configuration
 */


function _flipStoreNames(obj
/*: StoresConfigurationMap*/
)
/*: StoresConfigurationMapFlipped*/
{
  var flippedConfigs
  /*: Array<[ShortStoreNames, StoreConfigurationFlipped]>*/
  = entries(obj).map(function (_ref3) {
    var _ref4 = slicedToArray_default()(_ref3, 2),
        name = _ref4[0],
        options = _ref4[1];

    var config = {
      name: name,
      permanent: options.permanent
    };
    return [options.name, config];
  });
  return flippedConfigs.reduce(reducer, {});
}
/**
 * Flip store scheme values
 */


function _flipStoreScheme(storeName
/*: StoreNames*/
, key
/*: string*/
, scheme
/*: StoreFieldScheme*/
) {
  var values = isPredefinedValuesField(scheme) ? {
    values: _flipObject(scheme.values)
  } : {};
  var keys = isNestingStoreField(scheme) ? {
    keys: _flipScheme(storeName, scheme.keys)
  } : {};
  var composite = isCompositeKeyStoreField(scheme) ? {
    composite: scheme.composite.map(function (key) {
      return _getShortKey(storeName, key);
    })
  } : {};
  return objectSpread2_default()(objectSpread2_default()(objectSpread2_default()({
    key: key
  }, values), keys), composite);
}
/**
 * Flip general scheme recursivelly
 */


function _flipScheme(storeName
/*: StoreNames*/
, fieldsScheme
/*: StoreFields*/
) {
  return entries(fieldsScheme).map(function (_ref5) {
    var _ref6 = slicedToArray_default()(_ref5, 2),
        key = _ref6[0],
        scheme = _ref6[1];

    return isComplexStoreField(scheme) ? [scheme.key, _flipStoreScheme(storeName, key, scheme)] : [scheme, key];
  }).reduce(reducer, {});
}
/**
 * Extend base scheme with some more maps for encoding
 */


function _prepareLeft()
/*: StoreScheme*/
{
  var storesOptions
  /*: Array<[StoreNames, StoreOptionsOptionalKey]>*/
  = entries(storage_scheme).map(function (_ref7) {
    var _ref8 = slicedToArray_default()(_ref7, 2),
        storeName = _ref8[0],
        store = _ref8[1];

    var options
    /*: StoreOptionsOptionalKey*/
    = {
      keyPath: store.scheme.keyPath,
      autoIncrement: store.scheme.autoIncrement,
      index: store.scheme.index,
      fields: store.scheme.fields
    };
    return [storeName, options];
  });
  return storesOptions.reduce(reducer, {});
}
/**
 * Prepare scheme for decoding
 */


function _prepareRight()
/*: StoreScheme*/
{
  var storesOptionsEncoded
  /*: Array<[StoreNames, StoreOptionsOptionalKey]>*/
  = entries(Left).map(function (_ref9) {
    var _ref10 = slicedToArray_default()(_ref9, 2),
        storeName = _ref10[0],
        storeScheme = _ref10[1];

    var options
    /*: StoreOptionsOptionalKey*/
    = {
      keyPath: _getShortKey(storeName, storeScheme.keyPath),
      autoIncrement: storeScheme.autoIncrement,
      index: _getShortKey(storeName, storeScheme.index),
      fields: _flipScheme(storeName, storeScheme.fields)
    };
    return [storeName, options];
  });
  return storesOptionsEncoded.reduce(reducer, {});
}
/**
 * Get available values for encoding
 */


function _getValuesMap()
/*: Record<string, number>*/
{
  // all pairs of predefined keys and values such as {GET: 1}
  return entries(storage_scheme).reduce(function (acc, _ref11) {
    var _ref12 = slicedToArray_default()(_ref11, 2),
        store = _ref12[1];

    return acc.concat(store.scheme.fields);
  }, []).map(function (scheme) {
    return utilities_values(scheme).filter(isPredefinedValuesField).map(function (map) {
      return entries(map.values);
    }).reduce(function (acc, map) {
      return acc.concat(map);
    }, []);
  }).reduce(function (acc, map) {
    return acc.concat(map);
  }, []).reduce(reducer, {});
}
/**
 * Get short key version of a specified key
 */


function _getShortKey(storeName
/*: StoreNames*/
, key
/*: Maybe<string>*/
)
/*: Maybe<string>*/
{
  if (!key) {
    return undefined;
  }

  var map = storage_scheme[storeName].scheme.fields[key];

  if (isComplexStoreField(map)) {
    return map.key;
  }

  return map || key;
}
/**
 * Get store names and their general configuration (if store is permanent or not)
 */


function _getStoreNames()
/*: StoresConfigurationMap*/
{
  var storeNames
  /*: Array<[StoreName, StoreConfiguration]>*/
  = entries(storage_scheme).map(function (_ref13) {
    var _ref14 = slicedToArray_default()(_ref13, 2),
        name = _ref14[0],
        store = _ref14[1];

    var config = {
      name: store.name,
      permanent: store.permanent
    };
    return [name, config];
  });
  return storeNames.reduce(reducer, {});
}

var Left = _prepareLeft();

var Right = _prepareRight();

var Values = _getValuesMap();

var StoreNamesAndConfigs = _getStoreNames();

/* harmony default export */ var scheme_map = ({
  left: Left,
  right: Right,
  values: Values,
  storeNames: {
    left: StoreNamesAndConfigs,
    right: _flipStoreNames(StoreNamesAndConfigs)
  }
});
// CONCATENATED MODULE: ./src/sdk/storage/types.ts
var _Promise = typeof Promise === 'undefined' ? __webpack_require__(3).Promise : Promise;


var KeyRangeCondition;

(function (KeyRangeCondition) {
  KeyRangeCondition["LowerBound"] = "lowerBound";
  KeyRangeCondition["UpperBound"] = "upperBound";
})(KeyRangeCondition || (KeyRangeCondition = {}));

function valueIsRecord(value
/*: StoredValue | Record<string, unknown>*/
)
/*: value is Record<string, unknown>*/
{
  return isObject(value);
}


// CONCATENATED MODULE: ./src/sdk/storage/converter.ts







var Direction;

(function (Direction) {
  Direction["right"] = "right";
  Direction["left"] = "left";
})(Direction || (Direction = {}));

/**
 * Get value from the map if available
 */
function _getValue(map
/*: Nullable<Record<string, StoredValue>>*/
, value
/*: StoredValue*/
)
/*: StoredValue*/
{
  return map ? map[value] !== undefined ? map[value] : value : value;
}
/**
 * Convert key and value by defined scheme
 */


function _convert(storeName
/*: StoreNameType*/
, dir
/*: Direction*/
, key
/*: string*/
, value
/*: StoredValue | StoredRecord*/
, scheme
/*: StoreFieldScheme*/
)
/*: [string, unknown]*/
{
  if (!scheme) {
    return [key, value];
  }

  var encodedKey = isComplexStoreField(scheme) ? scheme.key : scheme;

  if (valueIsRecord(value)) {
    var keys = isNestingStoreField(scheme) ? scheme.keys : null;
    return [encodedKey, convertRecord(storeName, dir, value, keys)];
  }

  var valuesMap = isPredefinedValuesField(scheme) ? scheme.values : null;
  return [encodedKey, _getValue(valuesMap, value)];
}
/**
 * Convert record by defined direction and scheme
 */


/**
 * Convert record by defined direction and scheme
 * Note: the function signature is duplicated because TS hides function implementation
 */
function convertRecord(storeName
/*: StoreNameType*/
, dir
/*: Direction*/
, record
/*: Maybe<StoredRecord>*/
, scheme
/*: StoreFields*/
)
/*: Maybe<StoredRecord>*/
{
  if (!record) {
    return undefined;
  }

  var _scheme
  /*: StoreFields*/
  = scheme || scheme_map[dir][convertStoreName(storeName, Direction.right)].fields;

  return entries(record).map(function (_ref) {
    var _ref2 = slicedToArray_default()(_ref, 2),
        key = _ref2[0],
        value = _ref2[1];

    return _convert(storeName, dir, key, value, _scheme[key]);
  }).reduce(function (acc, _ref3) {
    var _ref4 = slicedToArray_default()(_ref3, 2),
        key = _ref4[0],
        value = _ref4[1];

    return objectSpread2_default()(objectSpread2_default()({}, acc), {}, defineProperty_default()({}, key, value));
  }, {});
}
/**
 * Convert records by defined direction
 */


function convertRecords(storeName
/*: StoreNameType*/
, dir
/*: Direction*/
)
/*: Array<StoredRecord>*/
{
  var records
  /*: Array<StoredRecord>*/
  = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : [];
  return records.map(function (record) {
    return convertRecord(storeName, dir, record);
  });
}
/**
 * Convert values by defined direction
 */


function convertValues(storeName
/*: StoreNameType*/
, dir
/*: Direction*/
, target
/*: StoredRecordId*/
)
/*: StoredValue | Array<StoredValue>*/
{
  var scheme
  /*: StoreOptions*/
  = scheme_map[dir][convertStoreName(storeName, Direction.right)];
  var keyPathScheme = scheme.fields[scheme.keyPath];
  var values = target instanceof Array ? target.slice() : [target];
  var keys = isCompositeKeyStoreField(keyPathScheme) ? keyPathScheme.composite : [scheme.keyPath];
  var converted = keys.map(function (key
  /*: string*/
  , index
  /*: number*/
  ) {
    var field = scheme.fields[key];
    var predefinedValuesMap = isPredefinedValuesField(field) ? field.values : null;
    return _getValue(predefinedValuesMap, values[index]);
  });
  return converted.length === 1 ? converted[0] : converted;
}
/**
 * Encode value by defined scheme
 */


function encodeValue(target
/*: StoredValue*/
)
/*: StoredValue*/
{
  return scheme_map.values[target] || target;
}
/**
 * Convert store name by defined direction
 */


function convertStoreName(storeName
/*: StoreNameType*/
, dir
/*: Direction*/
)
/*: StoreNameType*/
{
  return (scheme_map.storeNames[dir][storeName] || {}).name || storeName;
}
/**
 * Decode error message by replacing short store name with long readable one
 */


function decodeErrorMessage(storeName
/*: ShortStoreNames*/
, error
/*: Error*/
)
/*: Error*/
{
  return {
    name: error.name,
    message: error.message.replace("\"".concat(storeName, "\""), convertStoreName(storeName, Direction.right))
  };
}


// EXTERNAL MODULE: ./node_modules/@babel/runtime/helpers/classCallCheck.js
var classCallCheck = __webpack_require__(4);
var classCallCheck_default = /*#__PURE__*/__webpack_require__.n(classCallCheck);

// EXTERNAL MODULE: ./node_modules/@babel/runtime/helpers/createClass.js
var createClass = __webpack_require__(5);
var createClass_default = /*#__PURE__*/__webpack_require__.n(createClass);

// CONCATENATED MODULE: ./src/sdk/time.js
/**
 * Prepend zero to be used in certain format
 *
 * @param {number} value
 * @param {number} power
 * @returns {string}
 * @private
 */
function _prependZero(value
/*: number*/
)
/*: string*/
{
  var power
  /*: number*/
  = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;
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
 *
 * @param date
 * @returns {string}
 * @private
 */


function _getDate(date
/*: Date*/
)
/*: string*/
{
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


function _getTime(date
/*: Date*/
)
/*: string*/
{
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


function _getTimezone(date
/*: Date*/
)
/*: string*/
{
  var offsetInMinutes = date.getTimezoneOffset();

  var hoursOffset = _prependZero(Math.floor(Math.abs(offsetInMinutes) / 60));

  var minutesOffset = _prependZero(Math.abs(offsetInMinutes) % 60);

  var sign = offsetInMinutes > 0 ? '-' : '+';
  return sign + hoursOffset + minutesOffset;
}
/**
 * Get the timestamp in the backend format
 *
 * @param {number=} timestamp
 * @returns {string}
 */


function getTimestamp(timestamp
/*: number*/
)
/*: string*/
{
  var d = timestamp ? new Date(timestamp) : new Date();

  var date = _getDate(d);

  var time = _getTime(d);

  var timezone = _getTimezone(d);

  return "".concat(date, "T").concat(time, "Z").concat(timezone);
}
/**
 * Calculate time passed between two dates in milliseconds
 *
 * @param {number} d1
 * @param {number} d2
 * @returns {number}
 */


function timePassed(d1
/*: number*/
, d2
/*: number*/
)
/*: number*/
{
  if (isNaN(d1) || isNaN(d2)) {
    return 0;
  }

  return Math.abs(d2 - d1);
}


// CONCATENATED MODULE: ./src/sdk/activity-state.js


/*:: // 
import { type UrlT, type ActivityStateMapT, type CommonRequestParams } from './types';*/




/**
 * Reference to the activity state
 *
 * @type {Object}
 * @private
 */

var _activityState
/*: ActivityStateMapT*/
= {};
/**
 * Started flag, if activity state has been initiated
 *
 * @type {boolean}
 * @private
 */

var _started
/*: boolean*/
= false;
/**
 * Active flag, if in foreground
 *
 * @type {boolean}
 * @private
 */

var _active
/*: boolean*/
= false;
/**
 * Get current activity state
 *
 * @returns {Object}
 */

function currentGetter()
/*: ActivityStateMapT*/
{
  return _started ? objectSpread2_default()({}, _activityState) : {};
}
/**
 * Set current activity state
 *
 * @param {Object} params
 */


function currentSetter() {
  var params
  /*: ActivityStateMapT*/
  = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  _activityState = _started ? objectSpread2_default()({}, params) : {};
}
/**
 * Initiate in-memory activity state
 *
 * @param {Object} params
 */


function activity_state_init(params
/*: ActivityStateMapT*/
) {
  _started = true;
  currentSetter(params);
}
/**
 * Check if activity state is started
 *
 * @returns {boolean}
 */


function isStarted() {
  return _started;
}
/**
 * Update last active point
 *
 * @private
 */


function updateLastActive()
/*: void*/
{
  if (!_started) {
    return;
  }

  _activityState.lastInterval = _getLastInterval();
  _activityState.lastActive = Date.now();
}
/**
 * Update activity state with new params
 *
 * @param {Object} params
 * @private
 */


function _update(params
/*: ActivityStateMapT*/
)
/*: void*/
{
  _activityState = objectSpread2_default()(objectSpread2_default()({}, _activityState), params);
}
/**
 * Set active flag to true when going foreground
 */


function toForeground()
/*: void*/
{
  _active = true;
}
/**
 * Set active flag to false when going background
 */


function toBackground()
/*: void*/
{
  _active = false;
}
/**
 * Get time offset from the last active point
 *
 * @returns {number}
 * @private
 */


function _getOffset()
/*: number*/
{
  var lastActive = _activityState.lastActive;
  return Math.round(timePassed(lastActive, Date.now()) / SECOND);
}
/**
 * Get time spent with optional offset from last point
 *
 * @returns {number}
 * @private
 */


function _getTimeSpent()
/*: number*/
{
  return (_activityState.timeSpent || 0) + (_active ? _getOffset() : 0);
}
/**
 * Get session length with optional offset from last point
 *
 * @returns {number}
 * @private
 */


function _getSessionLength()
/*: number*/
{
  var lastActive = _activityState.lastActive;
  var withinWindow = timePassed(lastActive, Date.now()) < sdk_config.sessionWindow;
  var withOffset = _active || !_active && withinWindow;
  return (_activityState.sessionLength || 0) + (withOffset ? _getOffset() : 0);
}
/**
 * Get total number of sessions so far
 *
 * @returns {number}
 * @private
 */


function _getSessionCount()
/*: number*/
{
  return _activityState.sessionCount || 0;
}
/**
 * Get total number of events so far
 *
 * @returns {number}
 * @private
 */


function _getEventCount()
/*: number*/
{
  return _activityState.eventCount || 0;
}
/**
 * Get time passed since last activity was recorded
 *
 * @returns {number}
 * @private
 */


function _getLastInterval()
/*: number*/
{
  var lastActive = _activityState.lastActive;

  if (lastActive) {
    return Math.round(timePassed(lastActive, Date.now()) / SECOND);
  }

  return -1;
}
/**
 * Initiate session params and go to foreground
 */


function initParams()
/*: void*/
{
  updateSessionOffset();
  toForeground();
}
/**
 * Get activity state params that are sent with each request
 *
 * @returns {Object}
 */


function getParams(url
/*: UrlT*/
)
/*: ?CommonRequestParams*/
{
  if (!_started) {
    return null;
  }

  var lastInterval = _activityState.lastInterval >= 0 ? _activityState.lastInterval : 0;
  var baseParams
  /*: CommonRequestParams*/
  = {
    timeSpent: _activityState.timeSpent || 0,
    sessionLength: _activityState.sessionLength || 0,
    sessionCount: _activityState.sessionCount || 1,
    lastInterval: lastInterval || 0
  };

  if (url && isRequest(url, 'event')) {
    baseParams.eventCount = _activityState.eventCount;
  }

  return baseParams;
}
/**
 * Update activity state parameters depending on the endpoint which has been run
 *
 * @param {string} url
 * @param {boolean=false} auto
 */


function updateParams(url
/*: string*/
, auto
/*: boolean*/
)
/*: void*/
{
  if (!_started) {
    return;
  }

  var params = {};
  params.timeSpent = _getTimeSpent();
  params.sessionLength = _getSessionLength();

  if (isRequest(url, 'session')) {
    params.sessionCount = _getSessionCount() + 1;
  }

  if (isRequest(url, 'event')) {
    params.eventCount = _getEventCount() + 1;
  }

  _update(params);

  if (!auto) {
    updateLastActive();
  }
}
/**
 * Update installed flag - first session has been finished
 */


function updateInstalled()
/*: void*/
{
  if (!_started) {
    return;
  }

  if (_activityState.installed) {
    return;
  }

  _update({
    installed: true
  });
}
/**
 * Update session params which depend on the time offset since last measure point
 */


function updateSessionOffset()
/*: void*/
{
  if (!_started) {
    return;
  }

  var timeSpent = _getTimeSpent();

  var sessionLength = _getSessionLength();

  _update({
    timeSpent: timeSpent,
    sessionLength: sessionLength
  });

  updateLastActive();
}
/**
 * Update session length
 */


function updateSessionLength()
/*: void*/
{
  if (!_started) {
    return;
  }

  var sessionLength = _getSessionLength();

  _update({
    sessionLength: sessionLength
  });

  updateLastActive();
}
/**
 * Reset time spent and session length to zero
 */


function resetSessionOffset()
/*: void*/
{
  if (!_started) {
    return;
  }

  _update({
    timeSpent: 0,
    sessionLength: 0
  });
}
/**
 * Destroy current activity state
 */


function activity_state_destroy()
/*: void*/
{
  _activityState = {};
  _started = false;
  _active = false;
}

var ActivityState = {
  get current() {
    return currentGetter();
  },

  set current(value) {
    currentSetter(value);
  },

  init: activity_state_init,
  isStarted: isStarted,
  toForeground: toForeground,
  toBackground: toBackground,
  initParams: initParams,
  getParams: getParams,
  updateParams: updateParams,
  updateInstalled: updateInstalled,
  updateSessionOffset: updateSessionOffset,
  updateSessionLength: updateSessionLength,
  resetSessionOffset: resetSessionOffset,
  updateLastActive: updateLastActive,
  destroy: activity_state_destroy
};
/* harmony default export */ var activity_state = (ActivityState);
// CONCATENATED MODULE: ./src/sdk/pub-sub.js


/*:: type CallbackT<T> = {|
  id: string,
  cb: (string, T) => mixed
|}*/

/**
 * List of events with subscribed callbacks
 *
 * @type {Object}
 * @private
 */
var _list = {};
/**
 * Reference to timeout ids so they can be cleared on destroy
 *
 * @type {Array}
 * @private
 */

var _timeoutIds = [];
/**
 * Get unique id for the callback to use for unsubscribe
 *
 * @returns {string}
 * @private
 */

function _getId()
/*: string*/
{
  return 'id' + Math.random().toString(36).substr(2, 16);
}
/**
 * Subscribe to a certain event
 *
 * @param {string} name
 * @param {Function} cb
 * @returns {string}
 */


function subscribe
/*:: <T>*/
(name
/*: string*/
, cb
/*: $PropertyType<CallbackT<T>, 'cb'>*/
)
/*: string*/
{
  var id = _getId();

  var callback
  /*: CallbackT<T>*/
  = {
    id: id,
    cb: cb
  };

  if (!_list[name]) {
    _list[name] = [];
  }

  _list[name].push(callback);

  return id;
}
/**
 * Unsubscribe particular callback from an event
 *
 * @param {string} id
 */


function unsubscribe(id
/*: string*/
)
/*: void*/
{
  if (!id) {
    return;
  }

  entries(_list).some(function (_ref) {
    var _ref2 = slicedToArray_default()(_ref, 2),
        callbacks = _ref2[1];

    return callbacks.some(function (callback
    /*: CallbackT<T>*/
    , i
    /*: number*/
    ) {
      if (callback.id === id) {
        callbacks.splice(i, 1);
        return true;
      }
    });
  });
}
/**
 * Publish certain event with optional arguments
 *
 * @param {string} name
 * @param {*} args
 * @returns {Array}
 */


function publish
/*:: <T>*/
(name
/*: string*/
, args
/*: T*/
)
/*: void*/
{
  if (!_list[name]) {
    return;
  }

  _list[name].forEach(function (item
  /*: CallbackT<T>*/
  ) {
    if (typeof item.cb === 'function') {
      _timeoutIds.push(setTimeout(function () {
        return item.cb(name, args);
      }));
    }
  });
}
/**
 * Destroy all registered events with their callbacks
 */


function pub_sub_destroy()
/*: void*/
{
  _timeoutIds.forEach(clearTimeout);

  _timeoutIds = [];
  _list = {};
}


// CONCATENATED MODULE: ./src/sdk/storage/quick-storage.ts









var quick_storage_QuickStorage = /*#__PURE__*/function () {
  function QuickStorage() {
    var _this = this;

    classCallCheck_default()(this, QuickStorage);

    defineProperty_default()(this, "defaultName", globals.namespace);

    defineProperty_default()(this, "storageName", this.defaultName);

    defineProperty_default()(this, "storeNames", scheme_map.storeNames.left);

    defineProperty_default()(this, "storesMap", void 0);

    this.storesMap = {};
    var read = this.read.bind(this);
    var write = this.write.bind(this);
    utilities_values(this.storeNames).forEach(function (store) {
      var shortStoreName = store.name;
      Object.defineProperty(_this.storesMap, shortStoreName, {
        get: function get() {
          return read(shortStoreName);
        },
        set: function set(value) {
          write(shortStoreName, value);
        }
      });
    });
    Object.freeze(this.storesMap);
  }
  /**
   * Sets custom name to use in data keys and updates existing keys in localStorage
   */


  createClass_default()(QuickStorage, [{
    key: "read",
    value:
    /**
    * Get the value for specified key
    */
    function read(key
    /*: ShortStoreName | ShortPreferencesStoreName*/
    )
    /*: Nullable<StoreContent>*/
    {
      var valueToParse = localStorage.getItem("".concat(this.storageName, ".").concat(key));
      var value = valueToParse ? JSON.parse(valueToParse) : null;

      if (key === ShortPreferencesStoreName.Preferences && value) {
        return convertRecord(ShortPreferencesStoreName.Preferences, Direction.right, value);
      }

      return value;
    }
    /**
     * Set the value for specified key
     */

  }, {
    key: "write",
    value: function write(key
    /*: ShortStoreName | ShortPreferencesStoreName*/
    , value
    /*: StoreContent*/
    ) {
      if (!value) {
        localStorage.removeItem("".concat(this.storageName, ".").concat(key));
      } else {
        localStorage.setItem("".concat(this.storageName, ".").concat(key), JSON.stringify(value instanceof Array ? value : convertRecord(ShortPreferencesStoreName.Preferences, Direction.left, value)));
      }
    }
    /**
     * Clear all data related to the sdk
     */

  }, {
    key: "clear",
    value: function clear() {
      this.deleteData();
    }
    /**
     * Clear all data related to the sdk
     *
     * @param wipe if true then also remove permanent data such as user's preferences
     */

  }, {
    key: "deleteData",
    value: function deleteData() {
      var _this2 = this;

      var wipe = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;
      utilities_values(this.storeNames).forEach(function (store) {
        if (wipe || !store.permanent) {
          localStorage.removeItem("".concat(_this2.storageName, ".").concat(store.name));
        }
      });
    }
  }, {
    key: "setCustomName",
    value: function setCustomName(customName
    /*: string*/
    ) {
      var _this3 = this;

      if (!customName || !customName.length) {
        return;
      }

      var newName = "".concat(globals.namespace, "-").concat(customName); // Clone data

      utilities_values(this.storeNames).forEach(function (store) {
        var key = store.name;
        var rawData = localStorage.getItem("".concat(_this3.storageName, ".").concat(key)); // Get data from the store, no need to encode it

        if (rawData) {
          localStorage.setItem("".concat(newName, ".").concat(key), rawData); // Put data into a new store
        }
      });
      this.deleteData(true);
      this.storageName = newName;
    }
  }, {
    key: "stores",
    get: function get() {
      return this.storesMap;
    }
  }]);

  return QuickStorage;
}();

/* harmony default export */ var quick_storage = (new quick_storage_QuickStorage());
// CONCATENATED MODULE: ./src/sdk/preferences.js





/*:: type SdkDisabledT = {|
  reason: REASON_GENERAL | REASON_GDPR,
  pending: boolean
|}*/

/*:: type ThirdPartySharingDisabledT = {|
  reason: REASON_GENERAL,
  pending: boolean
|}*/

/*:: type PreferencesT = {|
  thirdPartySharingDisabled?: ?ThirdPartySharingDisabledT,
  sdkDisabled?: ?SdkDisabledT
|}*/

/**
 * Name of the store used by preferences
 *
 * @type {string}
 * @private
 */
var _storeName
/*: string*/
= storage_scheme.preferences.name;
/**
 * Local reference to be used for recovering preserved state
 *
 * @type {Object}
 * @private
 */

var _preferences
/*: ?PreferencesT*/
= _getPreferences();
/**
 * Get preferences stored in the localStorage
 *
 * @returns {Object}
 * @private
 */


function _getPreferences()
/*: ?PreferencesT*/
{
  if (!_preferences) {
    _setPreferences();
  }

  return _preferences ? objectSpread2_default()({}, _preferences) : null;
}
/**
 * Set local reference of the preserved preferences
 *
 * @private
 */


function _setPreferences()
/*: void*/
{
  _preferences = quick_storage.stores[_storeName];
}
/**
 * Get current disabled state
 *
 * @returns {Object|null}
 */


function getDisabled()
/*: ?SdkDisabledT*/
{
  var preferences = _getPreferences();

  return preferences ? preferences.sdkDisabled : null;
}
/**
 * Set current disabled state
 *
 * @param {Object|null} value
 */


function setDisabled(value
/*: ?SdkDisabledT*/
)
/*: void*/
{
  var sdkDisabled = value ? objectSpread2_default()({}, value) : null;
  quick_storage.stores[_storeName] = objectSpread2_default()(objectSpread2_default()({}, _getPreferences()), {}, {
    sdkDisabled: sdkDisabled
  });

  _setPreferences();
}
/**
 * Get current third-party-sharing disabled state
 *
 * @returns {Object}
 * @private
 */


function getThirdPartySharing()
/*: ?ThirdPartySharingDisabledT*/
{
  var preferences = _getPreferences();

  return preferences ? preferences.thirdPartySharingDisabled : null;
}
/**
 * Set current third-party-sharing disabled state
 *
 * @param {Object=} value
 * @private
 */


function setThirdPartySharing(value
/*: ?ThirdPartySharingDisabledT*/
)
/*: void*/
{
  var thirdPartySharingDisabled = value ? objectSpread2_default()({}, value) : null;
  quick_storage.stores[_storeName] = objectSpread2_default()(objectSpread2_default()({}, _getPreferences()), {}, {
    thirdPartySharingDisabled: thirdPartySharingDisabled
  });

  _setPreferences();
}
/**
 * Reload current preferences from localStorage if changed outside of current scope (e.g. tab)
 */


function reload()
/*: void*/
{
  var stored
  /*: PreferencesT*/
  = quick_storage.stores[_storeName] || {};
  var sdkDisabled
  /*: ?SdkDisabledT*/
  = (_preferences || {}).sdkDisabled || null;

  if (stored.sdkDisabled && !sdkDisabled) {
    publish('sdk:shutdown');
  }

  _setPreferences();
}
/**
 * Recover preferences from memory if storage was lost
 */


function recover()
/*: void*/
{
  var stored
  /*: ?PreferencesT*/
  = quick_storage.stores[_storeName];

  if (!stored) {
    quick_storage.stores[_storeName] = objectSpread2_default()({}, _preferences);
  }
}


// CONCATENATED MODULE: ./src/sdk/storage/indexeddb.ts






var indexeddb_Promise = typeof Promise === 'undefined' ? __webpack_require__(3).Promise : Promise;











var Action;

(function (Action) {
  Action["add"] = "add";
  Action["put"] = "put";
  Action["get"] = "get";
  Action["list"] = "list";
  Action["clear"] = "clear";
  Action["delete"] = "delete";
})(Action || (Action = {}));

var AccessMode;

(function (AccessMode) {
  AccessMode["readonly"] = "readonly";
  AccessMode["readwrite"] = "readwrite";
})(AccessMode || (AccessMode = {}));

var indexeddb_IndexedDBWrapper = /*#__PURE__*/function () {
  function IndexedDBWrapper() {
    classCallCheck_default()(this, IndexedDBWrapper);

    defineProperty_default()(this, "dbDefaultName", globals.namespace);

    defineProperty_default()(this, "dbName", this.dbDefaultName);

    defineProperty_default()(this, "dbVersion", 1);

    defineProperty_default()(this, "idbFactory", void 0);

    defineProperty_default()(this, "indexedDbConnection", null);

    defineProperty_default()(this, "notSupportedError", {
      name: 'IDBNotSupported',
      message: 'IndexedDB is not supported'
    });

    defineProperty_default()(this, "databaseOpenError", {
      name: 'CannotOpenDatabaseError',
      message: 'Cannot open a database'
    });

    defineProperty_default()(this, "noConnectionError", {
      name: 'NoDatabaseConnection',
      message: 'Cannot open a transaction'
    });

    var idb = IndexedDBWrapper.getIndexedDB();

    if (!idb) {
      throw this.notSupportedError;
    }

    this.idbFactory = idb;
  }
  /**
   * Sets custom name if provided and migrates database
   */


  createClass_default()(IndexedDBWrapper, [{
    key: "setCustomName",
    value: function setCustomName(customName
    /*: string*/
    )
    /*: Promise<void>*/
    {
      if (customName && customName.length > 0) {
        this.dbName = "".concat(globals.namespace, "-").concat(customName);
        return this.migrateDb(this.dbDefaultName, this.dbName);
      }

      return indexeddb_Promise.resolve();
    }
    /**
     * Opens database with defined name and resolves with database connection if successed
     * @param name name of database to open
     * @param version optional version of database schema
     * @param upgradeCallback optional `IDBOpenRequest.onupgradeneeded` event handler
     */

  }, {
    key: "openDatabase",
    value: function openDatabase(name
    /*: string*/
    , upgradeCallback
    /*: (event: IDBVersionChangeEvent, reject: () => void) => void*/
    , version
    /*: number*/
    )
    /*: Promise<IDBDatabase>*/
    {
      var _this = this;

      return IndexedDBWrapper.isSupported().then(function (supported) {
        if (!supported) {
          return indexeddb_Promise.reject(_this.notSupportedError);
        } else {
          return new indexeddb_Promise(function (resolve, reject) {
            var request = _this.idbFactory.open(name, version);

            if (upgradeCallback) {
              request.onupgradeneeded = function (event) {
                return upgradeCallback(event, reject);
              };
            }

            request.onsuccess = function (event
            /*: IDBOpenDBEvent*/
            ) {
              var connection = event.target.result;

              if (connection) {
                resolve(connection);
              } else {
                reject(_this.databaseOpenError);
              }
            };

            request.onerror = reject;
          });
        }
      });
    }
    /**
     * Checks if database with passed name exists
     */

  }, {
    key: "databaseExists",
    value: function databaseExists(name
    /*: string*/
    )
    /*: Promise<boolean>*/
    {
      var _this2 = this;

      return new indexeddb_Promise(function (resolve
      /*: (result: boolean) => void*/
      ) {
        var existed = true;

        _this2.openDatabase(name, function () {
          existed = false;
        }).then(function (connection) {
          connection.close();

          if (existed) {
            return;
          } // We didn't have this database before the check, so remove it


          return _this2.deleteDatabaseByName(name);
        }).then(function () {
          return resolve(existed);
        });
      });
    }
  }, {
    key: "cloneData",
    value: function cloneData(defaultDbConnection
    /*: IDBDatabase*/
    , customDbConnection
    /*: IDBDatabase*/
    )
    /*: Promise<void>*/
    {
      var _this3 = this;

      // Function to clone a single store
      var cloneStore = function cloneStore(storeName
      /*: ShortStoreName*/
      ) {
        var connection = _this3.indexedDbConnection;
        _this3.indexedDbConnection = defaultDbConnection;
        return _this3.getAll(storeName) // Get all records from default-named database
        .then(function (records) {
          _this3.indexedDbConnection = customDbConnection;

          if (records.length < 1) {
            // There is no records in the store
            return;
          }

          return _this3.addBulk(storeName, records, true); // Put all records into custom-named database
        }).then(function () {
          _this3.indexedDbConnection = connection; // Restore initial state
        });
      }; // Type guard to filter stores


      function isStoreName(key
      /*: ShortStoreNames*/
      )
      /*: key is ShortStoreName*/
      {
        return key !== 'p';
      } // Get names of stores


      var storeNames
      /*: ShortStoreName[]*/
      = utilities_values(scheme_map.storeNames.left).map(function (store) {
        return store.name;
      }).filter(isStoreName);
      var cloneStorePromises = storeNames.map(function (name) {
        return function () {
          return cloneStore(name);
        };
      }); // Run clone operations one by one

      return cloneStorePromises.reduce(function (previousTask, currentTask) {
        return previousTask.then(currentTask);
      }, indexeddb_Promise.resolve());
    }
    /**
     * Migrates created database with default name to custom
     * The IndexedDb API doesn't provide method to rename existing database so we have to create a new database, clone
     * data and remove the old one.
     */

  }, {
    key: "migrateDb",
    value: function migrateDb(defaultName
    /*: string*/
    , customName
    /*: string*/
    )
    /*: Promise<void>*/
    {
      var _this4 = this;

      return this.databaseExists(defaultName).then(function (defaultExists) {
        if (defaultExists) {
          // Migration hadn't finished yet
          return indexeddb_Promise.all([_this4.openDatabase(defaultName, _this4.handleUpgradeNeeded, _this4.dbVersion), // Open the default database, migrate version if needed
          _this4.openDatabase(customName, _this4.handleUpgradeNeeded, _this4.dbVersion) // Open or create a new database, migrate version if needed
          ]).then(function (_ref) {
            var _ref2 = slicedToArray_default()(_ref, 2),
                defaultDbConnection = _ref2[0],
                customDbConnection = _ref2[1];

            return _this4.cloneData(defaultDbConnection, customDbConnection).then(function () {
              _this4.indexedDbConnection = customDbConnection;
              defaultDbConnection.close();
              return _this4.deleteDatabaseByName(defaultName);
            });
          }).then(function () {
            return logger.info('Database migration finished');
          });
        } else {
          // There is no default-named database, let's just create or open a custom-named one
          return _this4.openDatabase(customName, _this4.handleUpgradeNeeded, _this4.dbVersion).then(function (customDbConnection) {
            _this4.indexedDbConnection = customDbConnection;
          });
        }
      });
    }
    /**
     * Handle database upgrade/initialization
     * - store activity state from memory if database unexpectedly got lost in the middle of the window session
     * - migrate data from localStorage if available on browser upgrade
     */

  }, {
    key: "handleUpgradeNeeded",
    value: function handleUpgradeNeeded(e
    /*: IDBVersionChangeEvent*/
    , reject
    /*: (reason: Event) => void*/
    ) {
      var db = e.target.result;
      e.target.transaction.onerror = reject;
      e.target.transaction.onabort = reject;
      var storeNames = scheme_map.storeNames.left;
      var activityState = activity_state.current || {};
      var inMemoryAvailable = activityState && !isEmpty(activityState);
      entries(storeNames).filter(function (_ref3) {
        var _ref4 = slicedToArray_default()(_ref3, 2),
            store = _ref4[1];

        return !store.permanent;
      }).forEach(function (_ref5) {
        var _ref6 = slicedToArray_default()(_ref5, 2),
            longStoreName = _ref6[0],
            store = _ref6[1];

        var shortStoreName = store.name;
        var options = scheme_map.right[longStoreName];
        var objectStore = db.createObjectStore(shortStoreName, {
          keyPath: options.keyPath,
          autoIncrement: options.autoIncrement || false
        });

        if (options.index) {
          objectStore.createIndex("".concat(options.index, "Index"), options.index);
        }

        if (shortStoreName === ShortStoreName.ActivityState && inMemoryAvailable) {
          objectStore.add(convertRecord(longStoreName, Direction.left, activityState));
          logger.info('Activity state has been recovered');
          return;
        }

        var localStorageRecord
        /*: Nullable<Array<StoredRecord>>*/
        = quick_storage.stores[shortStoreName];

        if (localStorageRecord) {
          localStorageRecord.forEach(function (record) {
            return objectStore.add(record);
          });
          logger.info("Migration from localStorage done for ".concat(longStoreName, " store"));
        }
      });
      recover();
      quick_storage.clear();
    }
    /**
     * Open the database connection and create store if not existent
     */

  }, {
    key: "open",
    value: function open()
    /*: Promise<{ success: boolean }>*/
    {
      var _this5 = this;

      if (this.indexedDbConnection) {
        return indexeddb_Promise.resolve({
          success: true
        });
      }

      return this.openDatabase(this.dbName, this.handleUpgradeNeeded, this.dbVersion).then(function (connection) {
        _this5.indexedDbConnection = connection;

        _this5.indexedDbConnection.onclose = function () {
          return _this5.destroy;
        };

        return {
          success: true
        };
      });
    }
    /**
     * Get transaction and the store
     */

  }, {
    key: "getTransactionStore",
    value: function getTransactionStore(_ref7, reject
    /*: (reason: Event) => void*/
    , db
    /*: IDBDatabase*/
    )
    /*: Transaction*/
    {
      var storeName = _ref7.storeName,
          mode = _ref7.mode;
      var transaction
      /*: IDBTransaction*/
      = db.transaction([storeName], mode);
      var store = transaction.objectStore(storeName);
      var options = scheme_map.right[convertStoreName(storeName, Direction.right)];
      var index;

      if (options.index) {
        index = store.index("".concat(options.index, "Index"));
      }

      transaction.onerror = reject;
      transaction.onabort = reject;
      return {
        transaction: transaction,
        store: store,
        index: index,
        options: options
      };
    }
    /**
     * Override the error by extracting only name and message of the error
     */

  }, {
    key: "overrideError",
    value: function overrideError(reject
    /*: (reason: Error) => void*/
    , error
    /*: IDBError*/
    ) {
      var _error$target$error = error.target.error,
          name = _error$target$error.name,
          message = _error$target$error.message;
      return reject({
        name: name,
        message: message
      });
    }
    /**
     * Get list of composite keys if available
     */

  }, {
    key: "getCompositeKeys",
    value: function getCompositeKeys(options
    /*: StoreOptions*/
    )
    /*: Nullable<Array<string>>*/
    {
      var keyField = options.fields[options.keyPath];
      return isCompositeKeyStoreField(keyField) ? keyField.composite : null;
    }
    /**
     * Check if target is an object
     */

  }, {
    key: "targetIsObject",
    value: function targetIsObject(target
    /*: Nullable<StoredRecord | StoredRecordId>*/
    )
    /*: target is Record<string, StoredValue>*/
    {
      return isObject(target);
    }
    /**
     * Prepare the target to be queried depending on the composite key if defined
     */

  }, {
    key: "prepareTarget",
    value: function prepareTarget(options
    /*: StoreOptions*/
    , target
    /*: Nullable<StoredRecord | StoredRecordId>*/
    , action
    /*: Action*/
    )
    /*: Nullable<StoredRecord | StoredRecordId>*/
    {
      if (action === Action.clear || !target) {
        return null; // No target needed when we clear the whole store
      }

      var composite = this.getCompositeKeys(options);
      var needObjectTarget = [Action.add, Action.put].indexOf(action) !== -1;

      if (needObjectTarget) {
        if (this.targetIsObject(target)) {
          // target is a StoredRecord
          // extend target with composite path if needed and return it
          return composite ? objectSpread2_default()(defineProperty_default()({}, options.keyPath, composite.map(function (key) {
            return target[key];
          }).join('')), target) : target;
        }

        return null;
      } // target is StoredRecordId (plain or composite)


      return target instanceof Array ? target.join('') : target;
    }
    /**
     * Prepare the result to be return depending on the composite key definition
     */

  }, {
    key: "prepareResult",
    value: function prepareResult(options
    /*: StoreOptions*/
    , target
    /*: Nullable<StoredRecord | StoredRecordId>*/
    )
    /*: Nullable<Array<StoredValue>>*/
    {
      var composite = this.getCompositeKeys(options);

      if (composite && this.targetIsObject(target)) {
        return composite.map(function (key) {
          return target[key];
        });
      }

      return null;
    }
    /**
     * Initiate the database request
     */

  }, {
    key: "initRequest",
    value: function initRequest(_ref8)
    /*: Promise<Maybe<StoredRecord | StoredRecordId>>*/
    {
      var _this6 = this;

      var storeName = _ref8.storeName,
          _ref8$target = _ref8.target,
          target = _ref8$target === void 0 ? null : _ref8$target,
          action = _ref8.action,
          _ref8$mode = _ref8.mode,
          mode = _ref8$mode === void 0 ? AccessMode.readonly : _ref8$mode;
      return this.open().then(function () {
        return new indexeddb_Promise(function (resolve, reject) {
          if (!_this6.indexedDbConnection) {
            reject(_this6.noConnectionError);
          } else {
            var _this6$getTransaction = _this6.getTransactionStore({
              storeName: storeName,
              mode: mode
            }, reject, _this6.indexedDbConnection),
                store = _this6$getTransaction.store,
                options = _this6$getTransaction.options;

            var request = store[action](_this6.prepareTarget(options, target, action));

            var _result = _this6.prepareResult(options, target);

            request.onsuccess = function () {
              if (action === Action.get && !request.result) {
                reject({
                  name: 'NotRecordFoundError',
                  message: "Requested record not found in \"".concat(storeName, "\" store")
                });
              } else {
                resolve(_result || request.result || target);
              }
            };

            request.onerror = function (error
            /*: Event*/
            ) {
              return _this6.overrideError(reject, error);
            };
          }
        });
      });
    }
    /**
     * Initiate bulk database request by reusing the same transaction to perform the operation
     */

  }, {
    key: "initBulkRequest",
    value: function initBulkRequest(_ref9)
    /*: Promise<Array<StoredRecord | StoredRecordId>>*/
    {
      var _this7 = this;

      var storeName = _ref9.storeName,
          target = _ref9.target,
          action = _ref9.action,
          _ref9$mode = _ref9.mode,
          mode = _ref9$mode === void 0 ? AccessMode.readwrite : _ref9$mode;

      if (!target || target && !target.length) {
        return indexeddb_Promise.reject({
          name: 'NoTargetDefined',
          message: "No array provided to perform ".concat(action, " bulk operation into \"").concat(storeName, "\" store")
        });
      }

      return this.open().then(function () {
        return new indexeddb_Promise(function (resolve, reject) {
          if (!_this7.indexedDbConnection) {
            reject(_this7.noConnectionError);
          } else {
            var _this7$getTransaction = _this7.getTransactionStore({
              storeName: storeName,
              mode: mode
            }, reject, _this7.indexedDbConnection),
                transaction = _this7$getTransaction.transaction,
                store = _this7$getTransaction.store,
                options = _this7$getTransaction.options; // Array contains or StoredRecord either RecordIds, but not both at the same time


            var _result2 = new Array();

            var current = target[0];

            transaction.oncomplete = function () {
              return resolve(_result2);
            };

            var request = function request(req) {
              req.onerror = function (error) {
                return _this7.overrideError(reject, error);
              };

              req.onsuccess = function () {
                _result2.push(_this7.prepareResult(options, current) || req.result);

                current = target[_result2.length];

                if (_result2.length < target.length) {
                  request(store[action](_this7.prepareTarget(options, current, action)));
                }
              };
            };

            request(store[action](_this7.prepareTarget(options, current, action)));
          }
        });
      });
    }
    /**
     * Open cursor for bulk operations or listing
     */

  }, {
    key: "openCursor",
    value: function openCursor(_ref10)
    /*: Promise<Array<StoredRecord | StoredRecordId>>*/
    {
      var _this8 = this;

      var storeName = _ref10.storeName,
          action = _ref10.action,
          _ref10$range = _ref10.range,
          range = _ref10$range === void 0 ? null : _ref10$range,
          _ref10$firstOnly = _ref10.firstOnly,
          firstOnly = _ref10$firstOnly === void 0 ? false : _ref10$firstOnly,
          _ref10$mode = _ref10.mode,
          mode = _ref10$mode === void 0 ? AccessMode.readonly : _ref10$mode;
      return this.open().then(function () {
        return new indexeddb_Promise(function (resolve, reject) {
          if (!_this8.indexedDbConnection) {
            reject(_this8.noConnectionError);
          } else {
            var _this8$getTransaction = _this8.getTransactionStore({
              storeName: storeName,
              mode: mode
            }, reject, _this8.indexedDbConnection),
                transaction = _this8$getTransaction.transaction,
                store = _this8$getTransaction.store,
                index = _this8$getTransaction.index,
                options = _this8$getTransaction.options;

            var cursorRequest
            /*: OpenIDBCursorRequest*/
            = (index || store).openCursor(range);
            var items = new Array();

            transaction.oncomplete = function () {
              return resolve(items);
            };

            cursorRequest.onsuccess = function (e) {
              var cursor = e.target.result;

              if (cursor) {
                if (action === Action.delete) {
                  cursor.delete();
                  items.push(_this8.prepareResult(options, cursor.value) || cursor.value[options.keyPath]);
                } else {
                  items.push(cursor.value);
                }

                if (!firstOnly) {
                  cursor.continue();
                }
              }
            };

            cursorRequest.onerror = function (error) {
              return _this8.overrideError(reject, error);
            };
          }
        });
      });
    }
  }, {
    key: "deleteDatabaseByName",
    value: function deleteDatabaseByName(dbName
    /*: string*/
    )
    /*: Promise<void>*/
    {
      var _this9 = this;

      return new indexeddb_Promise(function (resolve, reject) {
        var request = _this9.idbFactory.deleteDatabase(dbName);

        request.onerror = function (error) {
          return _this9.overrideError(reject, error);
        };

        request.onsuccess = function () {
          return resolve();
        };

        request.onblocked = function (e) {
          return reject(e.target);
        };
      });
    }
    /**
     * Get all records from particular store
     */

  }, {
    key: "getAll",
    value: function getAll(storeName
    /*: ShortStoreName*/
    )
    /*: Promise<Array<StoredRecord>>*/
    {
      var firstOnly = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
      return this.openCursor({
        storeName: storeName,
        action: Action.list,
        firstOnly: firstOnly
      });
    }
    /**
     * Get the first row from the store
     */

  }, {
    key: "getFirst",
    value: function getFirst(storeName
    /*: ShortStoreName*/
    )
    /*: Promise<Maybe<StoredRecord>>*/
    {
      return this.getAll(storeName, true).then(function (all) {
        return all.length ? all[0] : undefined;
      });
    }
    /**
     * Get item from a particular store
     */

  }, {
    key: "getItem",
    value: function getItem(storeName
    /*: ShortStoreName*/
    , target
    /*: StoredRecordId*/
    )
    /*: Promise<StoredRecord>*/
    {
      return this.initRequest({
        storeName: storeName,
        target: target,
        action: Action.get
      });
    }
    /**
     * Return filtered result by value on available index
     */

  }, {
    key: "filterBy",
    value: function filterBy(storeName
    /*: ShortStoreName*/
    , by
    /*: StoredValue*/
    )
    /*: Promise<Array<StoredRecord>>*/
    {
      var range = IDBKeyRange.only(by);
      return this.openCursor({
        storeName: storeName,
        action: Action.list,
        range: range
      });
    }
    /**
     * Add item to a particular store
     */

  }, {
    key: "addItem",
    value: function addItem(storeName
    /*: ShortStoreName*/
    , target
    /*: StoredRecord*/
    )
    /*: Promise<StoredRecordId>*/
    {
      return this.initRequest({
        storeName: storeName,
        target: target,
        action: Action.add,
        mode: AccessMode.readwrite
      });
    }
    /**
     * Add multiple items into particular store
     */

  }, {
    key: "addBulk",
    value: function addBulk(storeName
    /*: ShortStoreName*/
    , target
    /*: Array<StoredRecord>*/
    , overwrite
    /*: boolean*/
    )
    /*: Promise<Array<StoredRecordId>>*/
    {
      return this.initBulkRequest({
        storeName: storeName,
        target: target,
        action: overwrite ? Action.put : Action.add,
        mode: AccessMode.readwrite
      });
    }
    /**
     * Update item in a particular store
     */

  }, {
    key: "updateItem",
    value: function updateItem(storeName
    /*: ShortStoreName*/
    , target
    /*: StoredRecord*/
    )
    /*: Promise<StoredRecordId>*/
    {
      return this.initRequest({
        storeName: storeName,
        target: target,
        action: Action.put,
        mode: AccessMode.readwrite
      });
    }
    /**
     * Delete item from a particular store
     */

  }, {
    key: "deleteItem",
    value: function deleteItem(storeName
    /*: ShortStoreName*/
    , target
    /*: StoredRecordId*/
    )
    /*: Promise<StoredRecordId>*/
    {
      return this.initRequest({
        storeName: storeName,
        target: target,
        action: Action.delete,
        mode: AccessMode.readwrite
      });
    }
    /**
     * Delete items until certain bound (primary key as a bound scope)
     */

  }, {
    key: "deleteBulk",
    value: function deleteBulk(storeName
    /*: ShortStoreName*/
    , value
    /*: StoredValue*/
    , condition
    /*: KeyRangeCondition*/
    )
    /*: Promise<Array<StoredRecordId>>*/
    {
      var range = condition ? IDBKeyRange[condition](value) : IDBKeyRange.only(value);
      return this.openCursor({
        storeName: storeName,
        action: Action.delete,
        range: range,
        mode: AccessMode.readwrite
      });
    }
    /**
     * Trim the store from the left by specified length
     */

  }, {
    key: "trimItems",
    value: function trimItems(storeName
    /*: ShortStoreName*/
    , length
    /*: number*/
    )
    /*: Promise<Array<StoredRecordId>>*/
    {
      var _this10 = this;

      var options = scheme_map.right[convertStoreName(storeName, Direction.right)];
      return this.getAll(storeName).then(function (records) {
        return records.length ? records[length - 1] : null;
      }).then(function (record) {
        return record ? _this10.deleteBulk(storeName, record[options.keyPath], KeyRangeCondition.UpperBound) : [];
      });
    }
    /**
     * Count the number of records in the store
     */

  }, {
    key: "count",
    value: function count(storeName
    /*: ShortStoreName*/
    )
    /*: Promise<number>*/
    {
      var _this11 = this;

      return this.open().then(function () {
        return new indexeddb_Promise(function (resolve, reject) {
          if (!_this11.indexedDbConnection) {
            reject(_this11.noConnectionError);
          } else {
            var _this11$getTransactio = _this11.getTransactionStore({
              storeName: storeName,
              mode: AccessMode.readonly
            }, reject, _this11.indexedDbConnection),
                store = _this11$getTransactio.store;

            var request = store.count();

            request.onsuccess = function () {
              return resolve(request.result);
            };

            request.onerror = function (error) {
              return _this11.overrideError(reject, error);
            };
          }
        });
      });
    }
    /**
     * Clear all records from a particular store
     */

  }, {
    key: "clear",
    value: function clear(storeName
    /*: ShortStoreName*/
    )
    /*: Promise<void>*/
    {
      return this.initRequest({
        storeName: storeName,
        action: Action.clear,
        mode: AccessMode.readwrite
      });
    }
    /**
     * Close the database and destroy the reference to it
     */

  }, {
    key: "destroy",
    value: function destroy()
    /*: void*/
    {
      if (this.indexedDbConnection) {
        this.indexedDbConnection.close();
      }

      this.indexedDbConnection = null;
    }
    /**
     * Close db connection and delete the db
     * WARNING: should be used only by adjust's demo app!
     */

  }, {
    key: "deleteDatabase",
    value: function deleteDatabase()
    /*: Promise<void>*/
    {
      this.destroy();
      return this.deleteDatabaseByName(this.dbName);
    }
  }], [{
    key: "tryOpen",
    value:
    /**
     * Cached promise of IndexedDB validation
     */

    /**
     * Tries to open a temporary database
     */
    function tryOpen(db
    /*: IDBFactory*/
    )
    /*: Promise<boolean>*/
    {
      return new indexeddb_Promise(function (resolve) {
        try {
          var request = db.open(IndexedDBWrapper.dbValidationName);

          request.onsuccess = function () {
            request.result.close();
            db.deleteDatabase(IndexedDBWrapper.dbValidationName);
            resolve(true);
          };

          request.onerror = function () {
            return resolve(false);
          };
        } catch (error) {
          resolve(false);
        }
      });
    }
    /**
     * Check if IndexedDB is supported in the current browser (exclude iOS forcefully)
     */

  }, {
    key: "isSupported",
    value: function isSupported()
    /*: Promise<boolean>*/
    {
      if (IndexedDBWrapper.isSupportedPromise) {
        return IndexedDBWrapper.isSupportedPromise;
      } else {
        IndexedDBWrapper.isSupportedPromise = new indexeddb_Promise(function (resolve) {
          var indexedDB = IndexedDBWrapper.getIndexedDB();
          var iOS = !!navigator.platform && /iPad|iPhone|iPod/.test(navigator.platform);

          if (!indexedDB || iOS) {
            logger.warn('IndexedDB is not supported in this browser');
            resolve(false);
          } else {
            var dbOpenablePromise = IndexedDBWrapper.tryOpen(indexedDB).then(function (dbOpenable) {
              if (!dbOpenable) {
                logger.warn('IndexedDB is not supported in this browser');
              }

              return dbOpenable;
            });
            resolve(dbOpenablePromise);
          }
        });
      }

      return IndexedDBWrapper.isSupportedPromise;
    }
    /**
     * Get indexedDB instance
     */

  }, {
    key: "getIndexedDB",
    value: function getIndexedDB()
    /*: Maybe<IDBFactory>*/
    {
      return window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
    }
  }]);

  return IndexedDBWrapper;
}();

defineProperty_default()(indexeddb_IndexedDBWrapper, "dbValidationName", 'validate-db-openable');

defineProperty_default()(indexeddb_IndexedDBWrapper, "isSupportedPromise", null);


// CONCATENATED MODULE: ./src/sdk/storage/localstorage.ts







var localstorage_Promise = typeof Promise === 'undefined' ? __webpack_require__(3).Promise : Promise;











var localstorage_LocalStorageWrapper = /*#__PURE__*/function () {
  function LocalStorageWrapper() {
    classCallCheck_default()(this, LocalStorageWrapper);
  }

  createClass_default()(LocalStorageWrapper, [{
    key: "open",
    value:
    /**
     * Prepare schema details if not existent
     */
    function open()
    /*: Promise<StorageOpenStatus>*/
    {
      return LocalStorageWrapper.isSupported().then(function (supported) {
        if (!supported) {
          return {
            status: 'error',
            error: {
              name: 'LSNotSupported',
              message: 'LocalStorage is not supported'
            }
          };
        }

        var storeNames = scheme_map.storeNames.left;
        var activityState = activity_state.current || {};
        var inMemoryAvailable = activityState && !isEmpty(activityState);
        entries(storeNames).filter(function (_ref) {
          var _ref2 = slicedToArray_default()(_ref, 2),
              store = _ref2[1];

          return !store.permanent;
        }).forEach(function (_ref3) {
          var _ref4 = slicedToArray_default()(_ref3, 2),
              longStoreName = _ref4[0],
              store = _ref4[1];

          var shortStoreName = store.name;

          if (shortStoreName === ShortStoreName.ActivityState && !quick_storage.stores[shortStoreName]) {
            quick_storage.stores[shortStoreName] = inMemoryAvailable ? [convertRecord(longStoreName, Direction.left, activityState)] : [];
          } else if (!quick_storage.stores[shortStoreName]) {
            quick_storage.stores[shortStoreName] = [];
          }
        });
        recover();
        return {
          status: 'success'
        };
      });
    }
    /**
     * Get list of composite keys if available
     */

  }, {
    key: "getCompositeKeys",
    value: function getCompositeKeys(options
    /*: StoreOptions*/
    )
    /*: Nullable<Array<string>>*/
    {
      var field = options.fields[options.keyPath];
      return isCompositeKeyStoreField(field) ? field.composite : null;
    }
    /**
     * Get composite keys when defined or fallback to primary key for particular store
     */

  }, {
    key: "getKeys",
    value: function getKeys(storeName
    /*: ShortStoreName*/
    )
    /*: Array<string>*/
    {
      var name = convertStoreName(storeName, Direction.right);
      var options
      /*: StoreOptions*/
      = scheme_map.right[name];
      return this.getCompositeKeys(options) || [options.keyPath];
    }
    /**
     * Return next index using the current one and undefined if current is undefined
     */

  }, {
    key: "nextIndex",
    value: function nextIndex(current
    /*: Maybe<number>*/
    )
    /*: Maybe<number>*/
    {
      return typeof current === 'number' ? current + 1 : undefined;
    }
    /**
     * Initiate quasi-database request
     */

  }, {
    key: "initRequest",
    value: function initRequest
    /*:: <T>*/
    (_ref5, action
    /*: Action<T>*/
    )
    /*: Promise<T>*/
    {
      var _this = this;

      var storeName = _ref5.storeName,
          id = _ref5.id,
          item = _ref5.item;
      var options = scheme_map.right[convertStoreName(storeName, Direction.right)];
      return this.open().then(function (open) {
        if (open.status === 'error') {
          return localstorage_Promise.reject(open.error);
        }

        return new localstorage_Promise(function (resolve, reject) {
          var items
          /*: Array<StoredRecord>*/
          = quick_storage.stores[storeName];

          var keys = _this.getKeys(storeName);

          var lastId = (items[items.length - 1] || {})[options.keyPath] || 0;
          var target
          /*: StoredRecord*/
          ;

          if (!id) {
            target = objectSpread2_default()({}, item);
          } else {
            var ids = Array.isArray(id) ? id.slice() : [id];
            target = keys.map(function (key, index) {
              return [key, ids[index]];
            }).reduce(reducer, {});
          }

          var index = target ? findIndex(items, keys, target) : 0;
          return action(resolve, reject, {
            keys: keys,
            items: items,
            index: index,
            options: options,
            lastId: lastId
          });
        });
      });
    }
    /**
     * Sort the array by provided key (key can be a composite one)
     * - by default sorts in ascending order by primary keys
     * - force order by provided value
     */

  }, {
    key: "sort",
    value: function sort
    /*:: <T>*/
    (items
    /*: Array<T>*/
    , keys
    /*: Array<string>*/
    , exact
    /*: Nullable<StoredValue>*/
    )
    /*: Array<T>*/
    {
      var clone = toConsumableArray_default()(items);

      var reversed = keys.slice().reverse();

      function compare(a
      /*: T*/
      , b
      /*: T*/
      , key
      /*: string*/
      ) {
        var expr1 = exact ? exact === a[key] : a[key] < b[key];
        var expr2 = exact ? exact > a[key] : a[key] > b[key];
        return expr1 ? -1 : expr2 ? 1 : 0;
      }

      return clone.sort(function (a, b) {
        return reversed.reduce(function (acc, key) {
          return acc || compare(a, b, key);
        }, 0);
      });
    }
    /**
     * Prepare the target to be queried depending on the composite key if defined
     */

  }, {
    key: "prepareTarget",
    value: function prepareTarget(options
    /*: StoreOptions*/
    , target
    /*: StoredRecord*/
    , next
    /*: number*/
    )
    /*: StoredRecord*/
    {
      var composite = this.getCompositeKeys(options);
      return composite ? objectSpread2_default()(defineProperty_default()({}, options.keyPath, composite.map(function (key) {
        return target[key];
      }).join('')), target) : options.autoIncrement && next ? objectSpread2_default()(defineProperty_default()({}, options.keyPath, next), target) : objectSpread2_default()({}, target);
    }
    /**
     * Prepare the result to be return depending on the composite key definition
     */

  }, {
    key: "prepareResult",
    value: function prepareResult(options
    /*: StoreOptions*/
    , target
    /*: StoredRecord*/
    )
    /*: StoredRecordId*/
    {
      var composite = this.getCompositeKeys(options);

      if (composite) {
        return composite.map(function (key) {
          return target[key];
        }).filter(function (value) {
          return (
            /*: value is StoredValue*/
            !valueIsRecord(value)
          );
        });
      }

      return target[options.keyPath];
    }
    /**
     * Get all records from particular store
     */

  }, {
    key: "getAll",
    value: function getAll(storeName
    /*: ShortStoreName*/
    )
    /*: Promise<Array<StoredRecord>>*/
    {
      var _this2 = this;

      var firstOnly = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
      return this.open().then(function (open) {
        if (open.status === 'error') {
          return localstorage_Promise.reject(open.error);
        }

        return new localstorage_Promise(function (resolve, reject) {
          var value = quick_storage.stores[storeName];

          if (value instanceof Array) {
            resolve(firstOnly ? [value[0]] : _this2.sort(value, _this2.getKeys(storeName)));
          } else {
            reject({
              name: 'NotFoundError',
              message: "No objectStore named ".concat(storeName, " in this database")
            });
          }
        });
      });
    }
    /**
     * Get the first row from the store
     */

  }, {
    key: "getFirst",
    value: function getFirst(storeName
    /*: ShortStoreName*/
    )
    /*: Promise<Maybe<StoredRecord>>*/
    {
      return this.getAll(storeName, true).then(function (all) {
        return all.length ? all[0] : undefined;
      });
    }
    /**
     * Get item from a particular store
     */

  }, {
    key: "getItem",
    value: function getItem(storeName
    /*: ShortStoreName*/
    , id
    /*: StoredRecordId*/
    )
    /*: Promise<StoredRecord>*/
    {
      var _this3 = this;

      var action
      /*: Action<StoredRecord>*/
      = function action
      /*: Action<StoredRecord>*/
      (resolve, reject, _ref6) {
        var items = _ref6.items,
            index = _ref6.index,
            options = _ref6.options;

        if (index === -1) {
          reject({
            name: 'NotRecordFoundError',
            message: "Requested record not found in \"".concat(storeName, "\" store")
          });
        } else {
          resolve(_this3.prepareTarget(options, items[index]));
        }
      };

      return this.initRequest({
        storeName: storeName,
        id: id
      }, action);
    }
    /**
     * Return filtered result by value on available index
     */

  }, {
    key: "filterBy",
    value: function filterBy(storeName
    /*: ShortStoreName*/
    , by
    /*: StoredValue*/
    )
    /*: Promise<Array<StoredRecord>>*/
    {
      return this.getAll(storeName).then(function (result
      /*: Array<StoredRecord>*/
      ) {
        return result.filter(function (item) {
          var store = scheme_map.right[convertStoreName(storeName, Direction.right)];
          var indexedValue = store.index && item[store.index];
          return indexedValue === by;
        });
      });
    }
    /**
     * Add item to a particular store
     */

  }, {
    key: "addItem",
    value: function addItem(storeName
    /*: ShortStoreName*/
    , item
    /*: StoredRecord*/
    )
    /*: Promise<StoredRecordId>*/
    {
      var _this4 = this;

      return this.initRequest({
        storeName: storeName,
        item: item
      }, function (resolve, reject, _ref7) {
        var items = _ref7.items,
            index = _ref7.index,
            options = _ref7.options,
            lastId = _ref7.lastId;

        if (index !== -1) {
          reject({
            name: 'ConstraintError',
            message: "Constraint was not satisfied, trying to add existing item into \"".concat(storeName, "\" store")
          });
        } else {
          items.push(_this4.prepareTarget(options, item, _this4.nextIndex(lastId)));
          quick_storage.stores[storeName] = items;
          resolve(_this4.prepareResult(options, item));
        }
      });
    }
    /**
     * Add multiple items into particular store
     */

  }, {
    key: "addBulk",
    value: function addBulk(storeName
    /*: ShortStoreName*/
    , target
    /*: Array<StoredRecord>*/
    , overwrite
    /*: boolean*/
    )
    /*: Promise<Array<StoredRecordId>>*/
    {
      var _this5 = this;

      return this.initRequest({
        storeName: storeName
      }, function (resolve, reject, _ref8) {
        var keys = _ref8.keys,
            items = _ref8.items,
            options = _ref8.options,
            lastId = _ref8.lastId;

        if (!target || target && !target.length) {
          reject({
            name: 'NoTargetDefined',
            message: "No array provided to perform add bulk operation into \"".concat(storeName, "\" store")
          });
          return;
        }

        var id = lastId;
        var newItems = target.map(function (item) {
          return _this5.prepareTarget(options, item, id = _this5.nextIndex(id));
        });
        var overlapping = newItems.filter(function (item) {
          return findIndex(items, keys, item) !== -1;
        }).map(function (item) {
          return item[options.keyPath];
        });
        var currentItems = overwrite ? items.filter(function (item) {
          return overlapping.indexOf(item[options.keyPath]) === -1;
        }) : toConsumableArray_default()(items);

        if (overlapping.length && !overwrite) {
          reject({
            name: 'ConstraintError',
            message: "Constraint was not satisfied, trying to add existing items into \"".concat(storeName, "\" store")
          });
        } else {
          quick_storage.stores[storeName] = _this5.sort([].concat(toConsumableArray_default()(currentItems), toConsumableArray_default()(newItems)), keys);
          var result = target.map(function (item) {
            return _this5.prepareResult(options, item);
          });
          resolve(result);
        }
      });
    }
    /**
     * Update item in a particular store
     */

  }, {
    key: "updateItem",
    value: function updateItem(storeName
    /*: ShortStoreName*/
    , item
    /*: StoredRecord*/
    )
    /*: Promise<StoredRecordId>*/
    {
      var _this6 = this;

      return this.initRequest({
        storeName: storeName,
        item: item
      }, function (resolve, _, _ref9) {
        var items = _ref9.items,
            index = _ref9.index,
            options = _ref9.options,
            lastId = _ref9.lastId;
        var nextId = index === -1 ? _this6.nextIndex(lastId) : undefined;

        var target = _this6.prepareTarget(options, item, nextId);

        if (index === -1) {
          items.push(target);
        } else {
          items.splice(index, 1, target);
        }

        quick_storage.stores[storeName] = items;
        resolve(_this6.prepareResult(options, item));
      });
    }
    /**
     * Delete item from a particular store
     */

  }, {
    key: "deleteItem",
    value: function deleteItem(storeName
    /*: ShortStoreName*/
    , id
    /*: StoredRecordId*/
    )
    /*: Promise<StoredRecordId>*/
    {
      return this.initRequest({
        storeName: storeName,
        id: id
      }, function (resolve, _, _ref10) {
        var items = _ref10.items,
            index = _ref10.index;

        if (index !== -1) {
          items.splice(index, 1);
          quick_storage.stores[storeName] = items;
        }

        resolve(id);
      });
    }
    /**
     * Find index of the item with the closest value to the bound
     */

  }, {
    key: "findMax",
    value: function findMax(array
    /*: Array<StoredRecord>*/
    , key
    /*: string*/
    , value
    /*: StoredValue*/
    )
    /*: number*/
    {
      if (!array.length) {
        return -1;
      }

      var max = {
        index: -1,
        value: typeof value === 'string' ? '' : 0
      };

      for (var i = 0; i < array.length; i += 1) {
        if (array[i][key] <= value) {
          if (array[i][key] >= max.value) {
            max = {
              value: array[i][key],
              index: i
            };
          }
        } else {
          return max.index;
        }
      }

      return max.index;
    }
    /**
     * Delete items until certain bound (primary key as a bound scope)
     * Returns array of deleted elements
     */

  }, {
    key: "deleteBulk",
    value: function deleteBulk(storeName
    /*: ShortStoreName*/
    , value
    /*: StoredValue*/
    , condition
    /*: KeyRangeCondition*/
    )
    /*: Promise<Array<StoredRecordId>>*/
    {
      var _this7 = this;

      return this.getAll(storeName).then(function (items
      /*: Array<StoredRecord>*/
      ) {
        var keys = _this7.getKeys(storeName);

        var key = scheme_map.right[convertStoreName(storeName, Direction.right)].index || keys[0];
        var exact = condition ? null : value;

        var sorted
        /*: Array<StoredRecord>*/
        = _this7.sort(items, keys, exact);

        var index = _this7.findMax(sorted, key, value);

        if (index === -1) {
          return [];
        }

        var start = condition === KeyRangeCondition.LowerBound ? index : 0;
        var end = !condition || condition === KeyRangeCondition.UpperBound ? index + 1 : sorted.length;
        var deleted
        /*: Array<StoredRecordId>*/
        = sorted.splice(start, end).map(function (item) {
          return keys.length === 1 ? item[key] : keys.map(function (k) {
            return item[k];
          });
        });
        quick_storage.stores[storeName] = sorted;
        return deleted;
      });
    }
    /**
     * Trim the store from the left by specified length
     */

  }, {
    key: "trimItems",
    value: function trimItems(storeName
    /*: ShortStoreName*/
    , length
    /*: number*/
    )
    /*: Promise<Array<StoredRecordId>>*/
    {
      var _this8 = this;

      var convertedName = convertStoreName(storeName, Direction.right);
      var options
      /*: StoreOptions*/
      = scheme_map.right[convertedName];
      return this.getAll(storeName).then(function (records
      /*: Array<Record<string, StoredValue>>*/
      ) {
        return records.length ? records[length - 1] : null;
      }).then(function (record) {
        return record ? _this8.deleteBulk(storeName, record[options.keyPath], KeyRangeCondition.UpperBound) : [];
      });
    }
    /**
     * Count the number of records in the store
     */

  }, {
    key: "count",
    value: function count(storeName
    /*: ShortStoreName*/
    )
    /*: Promise<number>*/
    {
      return this.open().then(function (open) {
        if (open.status === 'error') {
          return localstorage_Promise.reject(open.error);
        }

        var records = quick_storage.stores[storeName];
        return localstorage_Promise.resolve(records instanceof Array ? records.length : 1);
      });
    }
    /**
     * Clear all records from a particular store
     */

  }, {
    key: "clear",
    value: function clear(storeName
    /*: ShortStoreName*/
    )
    /*: Promise<void>*/
    {
      return this.open().then(function (open) {
        if (open.status === 'error') {
          return localstorage_Promise.reject(open.error);
        }

        return new localstorage_Promise(function (resolve) {
          quick_storage.stores[storeName] = [];
          resolve();
        });
      });
    }
    /**
     * Does nothing, it simply matches the common storage interface
     */

  }, {
    key: "destroy",
    value: function destroy() {} // eslint-disable-line

    /**
     * Does nothing, it simply matches the common storage interface
     */

  }, {
    key: "deleteDatabase",
    value: function deleteDatabase() {} // eslint-disable-line

  }], [{
    key: "isSupported",
    value:
    /**
     * Cached promise of LocalStorage validation
     */

    /**
     * Check if LocalStorage is supported in the current browser
     */
    function isSupported()
    /*: Promise<boolean>*/
    {
      if (LocalStorageWrapper.isSupportedPromise) {
        return LocalStorageWrapper.isSupportedPromise;
      } else {
        var uid = new Date().toString();
        var storage = window.localStorage;
        LocalStorageWrapper.isSupportedPromise = new localstorage_Promise(function (resolve
        /*: (value: boolean) => void*/
        ) {
          storage.setItem(uid, uid);
          var result = storage.getItem(uid) === uid;
          storage.removeItem(uid);
          var support = !!(result && storage);
          resolve(support);
        }).catch(function () {
          logger.warn('LocalStorage is not supported in this browser');
          return localstorage_Promise.resolve(false);
        });
      }

      return LocalStorageWrapper.isSupportedPromise;
    }
  }]);

  return LocalStorageWrapper;
}();

defineProperty_default()(localstorage_LocalStorageWrapper, "isSupportedPromise", null);


// CONCATENATED MODULE: ./src/sdk/storage/storage.ts



var storage_Promise = typeof Promise === 'undefined' ? __webpack_require__(3).Promise : Promise;








var storage_StorageType;

(function (StorageType) {
  StorageType[StorageType["noStorage"] = STORAGE_TYPES.NO_STORAGE] = "noStorage";
  StorageType[StorageType["indexedDB"] = STORAGE_TYPES.INDEXED_DB] = "indexedDB";
  StorageType[StorageType["localStorage"] = STORAGE_TYPES.LOCAL_STORAGE] = "localStorage";
})(storage_StorageType || (storage_StorageType = {}));

/**
 * Methods to extend
 */
var _methods
/*: CommonStorageMethods*/
= {
  getAll: _getAll,
  getFirst: _getFirst,
  getItem: _getItem,
  filterBy: _filterBy,
  addItem: _addItem,
  addBulk: _addBulk,
  updateItem: _updateItem,
  deleteItem: _deleteItem,
  deleteBulk: _deleteBulk,
  trimItems: _trimItems,
  count: _count,
  clear: _clear,
  destroy: _destroy,
  deleteDatabase: _deleteDatabase
};
/**
 * Extends storage's getAll method by decoding returned records
 */

function _getAll(storage
/*: IStorage*/
, storeName
/*: ShortStoreName*/
, firstOnly
/*: boolean*/
) {
  return storage.getAll(storeName, firstOnly).then(function (records) {
    return convertRecords(storeName, Direction.right, records);
  });
}
/**
 * Extends storage's getFirst method by decoding returned record
 */


function _getFirst(storage
/*: IStorage*/
, storeName
/*: ShortStoreName*/
) {
  return storage.getFirst(storeName).then(function (record) {
    return convertRecord(storeName, Direction.right, record);
  });
}
/**
 * Extends storage's getItem method by encoding target value and then decoding returned record
 */


function _getItem(storage
/*: IStorage*/
, storeName
/*: ShortStoreName*/
, target
/*: StoredRecordId*/
) {
  return storage.getItem(storeName, convertValues(storeName, Direction.left, target)).then(function (record) {
    return convertRecord(storeName, Direction.right, record);
  }).catch(function (error) {
    return storage_Promise.reject(decodeErrorMessage(storeName, error));
  });
}
/**
 * Extends storage's filterBy method by encoding target value and then decoding returned records
 */


function _filterBy(storage
/*: IStorage*/
, storeName
/*: ShortStoreName*/
, target
/*: string*/
) {
  return storage.filterBy(storeName, encodeValue(target)).then(function (records) {
    return convertRecords(storeName, Direction.right, records);
  });
}
/**
 * Extends storage's addItem method by encoding target record and then decoding returned keys
 */


function _addItem(storage
/*: IStorage*/
, storeName
/*: ShortStoreName*/
, record
/*: StoredRecord*/
) {
  var convertedRecord = convertRecord(storeName, Direction.left, record);
  return storage.addItem(storeName, convertedRecord).then(function (target) {
    return convertValues(storeName, Direction.right, target);
  }).catch(function (error) {
    return storage_Promise.reject(decodeErrorMessage(storeName, error));
  });
}
/**
 * Extends storage's addBulk method by encoding target records and then decoding returned keys
 */


function _addBulk(storage
/*: IStorage*/
, storeName
/*: ShortStoreName*/
, records
/*: Array<StoredRecord>*/
, overwrite
/*: boolean*/
) {
  var convertedRecords
  /*: Array<StoredRecord>*/
  = convertRecords(storeName, Direction.left, records);
  return storage.addBulk(storeName, convertedRecords, overwrite).then(function (values) {
    return values.map(function (target) {
      return convertValues(storeName, Direction.right, target);
    });
  }).catch(function (error) {
    return storage_Promise.reject(decodeErrorMessage(storeName, error));
  });
}
/**
 * Extends storage's updateItem method by encoding target record and then decoding returned keys
 */


function _updateItem(storage
/*: IStorage*/
, storeName
/*: ShortStoreName*/
, record
/*: StoredRecord*/
) {
  var convertedRecord = convertRecord(storeName, Direction.left, record);
  return storage.updateItem(storeName, convertedRecord).then(function (target) {
    return convertValues(storeName, Direction.right, target);
  });
}
/**
 * Extends storage's deleteItem method by encoding target value and then decoding returned keys
 */


function _deleteItem(storage
/*: IStorage*/
, storeName
/*: ShortStoreName*/
, target
/*: StoredRecordId*/
) {
  return storage.deleteItem(storeName, convertValues(storeName, Direction.left, target)).then(function (target) {
    return convertValues(storeName, Direction.right, target);
  });
}
/**
 * Extends storage's deleteBulk method by encoding target value and then decoding returned records that are deleted
 */


function _deleteBulk(storage
/*: IStorage*/
, storeName
/*: ShortStoreName*/
, value
/*: StoredValue*/
, condition
/*: KeyRangeCondition*/
) {
  return storage.deleteBulk(storeName, encodeValue(value), condition).then(function (records) {
    return records.map(function (record) {
      return convertValues(storeName, Direction.right, record);
    });
  });
}
/**
 * Extends storage's trimItems method by passing encoded storage name
 */


function _trimItems(storage
/*: IStorage*/
, storeName
/*: ShortStoreName*/
, length
/*: number*/
) {
  return storage.trimItems(storeName, length);
}
/**
 * Extends storage's count method by passing encoded storage name
 */


function _count(storage
/*: IStorage*/
, storeName
/*: ShortStoreName*/
) {
  return storage.count(storeName);
}
/**
 * Extends storage's clear method by passing encoded storage name
 */


function _clear(storage
/*: IStorage*/
, storeName
/*: ShortStoreName*/
) {
  return storage.clear(storeName);
}
/**
 * Calls storage's destroy method
 */


function _destroy(storage
/*: IStorage*/
) {
  return storage.destroy();
}
/**
 * Calls storage's deleteDatabase method
 */


function _deleteDatabase(storage
/*: IndexedDB | LocalStorage*/
) {
  return storage.deleteDatabase();
}
/**
 * Augment whitelisted methods with encoding/decoding functionality
 */


function _augment()
/*: StorageMethods*/
{
  var methods
  /*: Array<[MethodName, StorageMethod]>*/
  = entries(_methods).map(function (_ref) {
    var _ref2 = slicedToArray_default()(_ref, 2),
        methodName = _ref2[0],
        method = _ref2[1];

    var augmentedMethod
    /*: StorageMethod*/
    = function augmentedMethod
    /*: StorageMethod*/
    (storeName
    /*: StoreName*/
    ) {
      for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        args[_key - 1] = arguments[_key];
      }

      return storage_init().then(function (_ref3) {
        var storage = _ref3.storage;

        if (storage) {
          return method.call.apply(method, [null, storage, convertStoreName(storeName, Direction.left)].concat(args));
        }
      });
    };

    return [methodName, augmentedMethod];
  });
  return methods.reduce(reducer, {});
}
/**
 * Type of available storage
 */


var storage_type
/*: StorageType*/
;
/**
 * Returns type of used storage which is one of possible values INDEXED_DB, LOCAL_STORAGE or NO_STORAGE if there is no
 * storage available
 */

function getType()
/*: StorageType*/
{
  return storage_type;
}
/**
 * Cached promise of Storage initialization
 */


var _initializationPromise
/*: Nullable<Promise<Storage>>*/
= null;
/**
 * Check which storage is available and pick it up
 * Prefer indexedDB over localStorage
 */

function storage_init(dbName
/*: string*/
)
/*: Promise<Storage>*/
{
  var storage
  /*: Nullable<IStorage>*/
  = null;

  if (_initializationPromise !== null) {
    return _initializationPromise;
  } else {
    _initializationPromise = storage_Promise.all([indexeddb_IndexedDBWrapper.isSupported(), localstorage_LocalStorageWrapper.isSupported()]).then(function (_ref4) {
      var _ref5 = slicedToArray_default()(_ref4, 2),
          idbSupported = _ref5[0],
          lsSupported = _ref5[1];

      quick_storage.setCustomName(dbName);

      if (idbSupported) {
        storage_type = storage_StorageType.indexedDB;
        var idb = new indexeddb_IndexedDBWrapper();
        return idb.setCustomName(dbName).then(function () {
          return storage = idb;
        });
      } else if (lsSupported) {
        storage_type = storage_StorageType.localStorage;
        storage = new localstorage_LocalStorageWrapper();
        return storage_Promise.resolve(storage);
      } else {
        logger.error('There is no storage available, app will run with minimum set of features');
        storage_type = storage_StorageType.noStorage;
        storage = null;
        return storage_Promise.resolve(storage);
      }
    }).then(function () {
      return {
        type: storage_type,
        storage: storage
      };
    });
  }

  return _initializationPromise;
}

/* harmony default export */ var storage_storage = (objectSpread2_default()({
  init: storage_init,
  getType: getType
}, _augment()));
// CONCATENATED MODULE: ./src/sdk/default-params.js



var default_params_Promise = typeof Promise === 'undefined' ? __webpack_require__(3).Promise : Promise;
/*:: // 
import { type NavigatorT, type CreatedAtT, type SentAtT, type WebUuidT, type TrackEnabledT, type PlatformT, type LanguageT, type MachineTypeT, type QueueSizeT, type DefaultParamsT } from './types';*/





/**
 * Get created at timestamp
 *
 * @returns {{createdAt: string}}
 * @private
 */

function _getCreatedAt()
/*: CreatedAtT*/
{
  return {
    createdAt: getTimestamp()
  };
}
/**
 * Get sent at timestamp
 *
 * @returns {{sentAt: string}}
 * @private
 */


function _getSentAt()
/*: SentAtT*/
{
  return {
    sentAt: getTimestamp()
  };
}
/**
 * Read uuid from the activity state
 *
 * @returns {{webUuid: string}}
 * @private
 */


function _getWebUuid()
/*: WebUuidT*/
{
  return {
    webUuid: activity_state.current.uuid
  };
}
/**
 * Get track enabled parameter by reading doNotTrack
 *
 * @returns {{trackingEnabled: boolean}|null}
 * @private
 */


function _getTrackEnabled()
/*: ?TrackEnabledT*/
{
  var navigatorExt = (navigator
  /*: NavigatorT*/
  );
  var isNavigatorDNT = typeof navigatorExt.doNotTrack !== 'undefined';
  var isWindowDNT = typeof window.doNotTrack !== 'undefined';
  var isMsDNT = typeof navigatorExt.msDoNotTrack !== 'undefined';
  var dnt = isNavigatorDNT ? navigatorExt.doNotTrack : isWindowDNT ? window.doNotTrack : isMsDNT ? navigatorExt.msDoNotTrack : null;

  if (parseInt(dnt, 10) === 0 || dnt === 'no') {
    return {
      trackingEnabled: true
    };
  }

  if (parseInt(dnt, 10) === 1 || dnt === 'yes') {
    return {
      trackingEnabled: false
    };
  }

  return null;
}
/**
 * Get platform parameter => hardcoded to `web`
 *
 * @returns {{platform: string}}
 * @private
 */


function _getPlatform()
/*: PlatformT*/
{
  return {
    platform: 'web'
  };
}
/**
 * Get language preferences
 *
 * @returns {{language: string, country: string|undefined}}
 * @private
 */


function _getLanguage()
/*: LanguageT*/
{
  var navigatorExt = (navigator
  /*: NavigatorT*/
  );

  var _split = (navigatorExt.language || navigatorExt.userLanguage || 'en').split('-'),
      _split2 = slicedToArray_default()(_split, 2),
      language = _split2[0],
      country = _split2[1];

  return {
    language: language,
    country: country ? '' + country.toLowerCase() : undefined
  };
}
/**
 * Get machine type from navigator.platform property
 *
 * @returns {{machineType: (string|undefined)}}
 */


function _getMachineType()
/*: MachineTypeT*/
{
  var ua = navigator.userAgent || navigator.vendor;
  var overrideWin32 = navigator.platform === 'Win32' && (ua.indexOf('WOW64') !== -1 || ua.indexOf('Win64') !== -1);
  return {
    machineType: overrideWin32 ? 'Win64' : navigator.platform
  };
}
/**
 * Get the current queue size
 *
 * @returns {Promise}
 * @private
 */


function _getQueueSize()
/*: Promise<QueueSizeT>*/
{
  return storage_storage.getAll('queue').then(function (records) {
    return {
      queueSize: records.length
    };
  });
}

function default_params_defaultParams()
/*: Promise<DefaultParamsT>*/
{
  return _getQueueSize().then(function (queueSize) {
    return objectSpread2_default()(objectSpread2_default()(objectSpread2_default()(objectSpread2_default()(objectSpread2_default()(objectSpread2_default()(objectSpread2_default()(objectSpread2_default()({}, _getCreatedAt()), _getSentAt()), _getWebUuid()), _getTrackEnabled()), _getPlatform()), _getLanguage()), _getMachineType()), queueSize);
  });
}
// CONCATENATED MODULE: ./src/sdk/url-strategy.ts


var _endpointMap, _endpointNiceNames;

var url_strategy_Promise = typeof Promise === 'undefined' ? __webpack_require__(3).Promise : Promise;



var UrlStrategy;

(function (UrlStrategy) {
  UrlStrategy["Default"] = "default";
  UrlStrategy["India"] = "india";
  UrlStrategy["China"] = "china";
})(UrlStrategy || (UrlStrategy = {}));

/**
 * Returns a map of base URLs or a list of endpoint names depending on SDK configuration
 */
function getEndpointPreference()
/*: BaseUrlsMap | EndpointName[]*/
{
  var _Config$getCustomConf = sdk_config.getCustomConfig(),
      customUrl = _Config$getCustomConf.customUrl,
      urlStrategy = _Config$getCustomConf.urlStrategy;

  if (customUrl) {
    // If custom URL is set then send all requests there
    return {
      app: customUrl,
      gdpr: customUrl
    };
  }

  if (urlStrategy === UrlStrategy.India) {
    return [UrlStrategy.India, UrlStrategy.Default];
  }

  if (urlStrategy === UrlStrategy.China) {
    return [UrlStrategy.China, UrlStrategy.Default];
  }

  return [UrlStrategy.Default, UrlStrategy.India, UrlStrategy.China];
}

var endpointMap
/*: Record<UrlStrategy, BaseUrlsMap>*/
= (_endpointMap = {}, defineProperty_default()(_endpointMap, UrlStrategy.Default, {
  app: 'https://app.adjust.com',
  gdpr: 'https://gdpr.adjust.com'
}), defineProperty_default()(_endpointMap, UrlStrategy.India, {
  app: 'https://app.adjust.net.in',
  gdpr: 'https://gdpr.adjust.net.in'
}), defineProperty_default()(_endpointMap, UrlStrategy.China, {
  app: 'https://app.adjust.world',
  gdpr: 'https://gdpr.adjust.world'
}), _endpointMap);
var endpointNiceNames
/*: Record<UrlStrategy, string>*/
= (_endpointNiceNames = {}, defineProperty_default()(_endpointNiceNames, UrlStrategy.Default, 'default'), defineProperty_default()(_endpointNiceNames, UrlStrategy.India, 'Indian'), defineProperty_default()(_endpointNiceNames, UrlStrategy.China, 'Chinese'), _endpointNiceNames);
/**
 * Gets the list of preferred endpoints and wraps `sendRequest` function with iterative retries until available
 * endpoint found or another error occurred.
 */

function urlStrategyRetries(sendRequest
/*: (urls: BaseUrlsMap) => Promise<unknown>*/
)
/*: Promise<unknown>*/
{
  var endpoints
  /*: Record<UrlStrategy, BaseUrlsMap>*/
  = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : endpointMap;
  var preferredUrls = getEndpointPreference();

  if (!Array.isArray(preferredUrls)) {
    // There is only one endpoint
    return sendRequest(preferredUrls);
  } else {
    var attempt = 0;

    var trySendRequest
    /*: () => Promise<unknown>*/
    = function trySendRequest
    /*: () => Promise<unknown>*/
    () {
      var endpointKey = preferredUrls[attempt++];
      var urlsMap = endpoints[endpointKey];
      return sendRequest(urlsMap).catch(function (reason) {
        if (reason.code === 'NO_CONNECTION') {
          logger.log("Failed to connect ".concat(endpointNiceNames[endpointKey], " endpoint"));

          if (attempt < preferredUrls.length) {
            logger.log("Trying ".concat(endpointNiceNames[preferredUrls[attempt]], " one"));
            return trySendRequest(); // Trying next endpoint
          }
        } // Another error occurred or we ran out of attempts, re-throw


        throw reason;
      });
    };

    return trySendRequest();
  }
}


// CONCATENATED MODULE: ./src/sdk/http.js



var http_Promise = typeof Promise === 'undefined' ? __webpack_require__(3).Promise : Promise;
/*:: // 
import { type UrlT, type DefaultParamsT, type HttpSuccessResponseT, type HttpErrorResponseT, type HttpRequestParamsT, type ErrorCodeT } from './types';*/










/*:: type ParamsWithAttemptsT = $PropertyType<HttpRequestParamsT, 'params'>*/

/**
 * Get filtered response from successful request
 *
 * @param {Object} xhr
 * @param {String} url
 * @returns {Object}
 * @private
 */
function _getSuccessResponse(xhr
/*: XMLHttpRequest*/
, url
/*: UrlT*/
)
/*: HttpSuccessResponseT*/
{
  var result = JSON.parse(xhr.responseText);
  var response = {
    status: 'success',
    adid: result.adid,
    timestamp: result.timestamp,
    ask_in: result.ask_in,
    retry_in: result.retry_in,
    continue_in: result.continue_in,
    tracking_state: result.tracking_state,
    attribution: undefined,
    message: undefined
  };

  if (isRequest(url, 'attribution')) {
    response.attribution = result.attribution;
    response.message = result.message;
  }

  return entries(response).filter(function (_ref) {
    var _ref2 = slicedToArray_default()(_ref, 2),
        value = _ref2[1];

    return !!value;
  }).reduce(reducer, {});
}
/**
 * Get an error object which is about to be passed to resolve or reject method
 *
 * @param {Object} xhr
 * @param {string} code
 * @param {boolean=} proceed
 * @returns {Object}
 * @private
 */


function _getErrorResponse(xhr
/*: XMLHttpRequest*/
, code
/*: ErrorCodeT*/
)
/*: HttpErrorResponseT*/
{
  var proceed
  /*: boolean*/
  = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
  return {
    status: 'error',
    action: proceed ? 'CONTINUE' : 'RETRY',
    response: isValidJson(xhr.responseText) ? JSON.parse(xhr.responseText) : xhr.responseText,
    message: HTTP_ERRORS[code],
    code: code
  };
}
/**
 * Encode parameter depending on the type
 *
 * @param {string} key
 * @param {*} value
 * @returns {string}
 * @private
 */


function _encodeParam(_ref3)
/*: string*/
{
  var _ref4 = slicedToArray_default()(_ref3, 2),
      key = _ref4[0],
      value = _ref4[1];

  var encodedKey = encodeURIComponent(key);
  var encodedValue = value;

  if (typeof value === 'string') {
    encodedValue = encodeURIComponent(value);
  }

  if (isObject(value)) {
    encodedValue = encodeURIComponent(JSON.stringify(value) || '');
  }

  return [encodedKey, encodedValue].join('=');
}
/**
 * Creates the log key with some spaces appended to it
 *
 * @param {string} header
 * @param {string} str
 * @returns {string}
 * @private
 */


function _logKey(header
/*: string*/
, str
/*: string*/
)
/*: string*/
{
  var spaces = header.slice(0, header.length - str.length - 1).split('').reduce(function (acc) {
    return acc.concat(' ');
  }, '');
  return "".concat(str).concat(spaces, ":");
}
/**
 * Encode key-value pairs to be used in url
 *
 * @param {Object} params
 * @param {Object} defaultParams
 * @returns {string}
 * @private
 */


function _encodeParams(params
/*: ParamsWithAttemptsT*/
, defaultParams
/*: DefaultParamsT*/
)
/*: string*/
{
  var logParamsHeader = 'REQUEST PARAMETERS:';

  var toSnakeCase = function toSnakeCase(key) {
    return key.replace(/([A-Z])/g, function ($1) {
      return "_".concat($1.toLowerCase());
    });
  };

  var allParams = entries(objectSpread2_default()(objectSpread2_default()(objectSpread2_default()({}, sdk_config.getBaseParams()), defaultParams), params)).map(function (_ref5) {
    var _ref6 = slicedToArray_default()(_ref5, 2),
        key = _ref6[0],
        value = _ref6[1];

    return [toSnakeCase(key), value];
  });
  logger.log(logParamsHeader);
  return allParams.filter(function (_ref7) {
    var _ref8 = slicedToArray_default()(_ref7, 2),
        value = _ref8[1];

    return isEmptyEntry(value);
  }).map(function (_ref9) {
    var _ref10 = slicedToArray_default()(_ref9, 2),
        key = _ref10[0],
        value = _ref10[1];

    logger.log(_logKey(logParamsHeader, key), value);
    return _encodeParam([key, value]);
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


function _handleReadyStateChange(reject, resolve, _ref11) {
  var xhr = _ref11.xhr,
      url = _ref11.url;

  if (xhr.readyState !== 4) {
    return;
  }

  var okStatus = xhr.status >= 200 && xhr.status < 300;
  var validJson = isValidJson(xhr.responseText);

  if (xhr.status === 0) {
    reject(_getErrorResponse(xhr, 'NO_CONNECTION'));
  } else {
    if (validJson) {
      return okStatus ? resolve(_getSuccessResponse(xhr, url)) : resolve(_getErrorResponse(xhr, 'SERVER_CANNOT_PROCESS', true));
    } else {
      return okStatus ? reject(_getErrorResponse(xhr, 'SERVER_MALFORMED_RESPONSE')) : reject(_getErrorResponse(xhr, 'SERVER_INTERNAL_ERROR'));
    }
  }
}
/**
 * Prepare url and params depending on the resource type
 *
 * @param {string} url
 * @param {string} method
 * @param {Object} params
 * @param {Object} defaultParams
 * @returns {{encodedParams: string, fullUrl: string}}
 * @private
 */


function _prepareUrlAndParams(_ref12, defaultParams
/*: DefaultParamsT*/
, baseUrlsMap
/*: BaseUrlsMap*/
)
/*: {fullUrl: string, encodedParams: string}*/
{
  var url = _ref12.url,
      method = _ref12.method,
      params = _ref12.params;

  var encodedParams = _encodeParams(params, defaultParams);

  var base = url === '/gdpr_forget_device' ? 'gdpr' : 'app';
  var baseUrl = baseUrlsMap[base];
  return {
    fullUrl: baseUrl + url + (method === 'GET' ? "?".concat(encodedParams) : ''),
    encodedParams: encodedParams
  };
}
/**
 * Set headers for the xhr object
 *
 * @param {XMLHttpRequest} xhr
 * @param {string} method
 * @private
 */


function _prepareHeaders(xhr
/*: XMLHttpRequest*/
, method
/*: $PropertyType<HttpRequestParamsT, 'method'>*/
)
/*: void*/
{
  var logHeader = 'REQUEST HEADERS:';
  var headers = [['Client-SDK', "js".concat(globals.version)], ['Content-Type', method === 'POST' ? 'application/x-www-form-urlencoded' : 'application/json']];
  logger.log(logHeader);
  headers.forEach(function (_ref13) {
    var _ref14 = slicedToArray_default()(_ref13, 2),
        key = _ref14[0],
        value = _ref14[1];

    xhr.setRequestHeader(key, value);
    logger.log(_logKey(logHeader, key), value);
  });
}
/**
 * Build xhr to perform all kind of api requests
 *
 * @param {string} url
 * @param {string} [method='GET']
 * @param {Object} [params={}]
 * @param {Object} defaultParams
 * @returns {Promise}
 */


function _buildXhr(_ref15, defaultParams
/*: DefaultParamsT*/
, baseUrlsMap
/*: BaseUrlsMap*/
)
/*: Promise<HttpSuccessResponseT | HttpErrorResponseT>*/
{
  var url = _ref15.url,
      _ref15$method = _ref15.method,
      method = _ref15$method === void 0 ? 'GET' : _ref15$method,
      _ref15$params = _ref15.params,
      params = _ref15$params === void 0 ? {} : _ref15$params;

  var _prepareUrlAndParams2 = _prepareUrlAndParams({
    url: url,
    method: method,
    params: params
  }, defaultParams, baseUrlsMap),
      fullUrl = _prepareUrlAndParams2.fullUrl,
      encodedParams = _prepareUrlAndParams2.encodedParams;

  return new http_Promise(function (resolve, reject) {
    var xhr = new XMLHttpRequest();
    xhr.open(method, fullUrl, true);

    _prepareHeaders(xhr, method);

    xhr.onreadystatechange = function () {
      return _handleReadyStateChange(reject, resolve, {
        xhr: xhr,
        url: url
      });
    };

    xhr.onerror = function () {
      return reject(_getErrorResponse(xhr, 'TRANSACTION_ERROR'));
    };

    xhr.send(method === 'GET' ? undefined : encodedParams);
  });
}

function _sendRequestWithUrlStrategyRetries(options
/*: HttpRequestParamsT*/
, defaultParams
/*: DefaultParamsT*/
) {
  return urlStrategyRetries(function (baseUrlsMap) {
    return _buildXhr(options, defaultParams, baseUrlsMap);
  });
}
/**
 * Intercept response from backend
 *
 * @param {Object} result
 * @param {string} result.status
 * @param {string} url
 * @returns {Object}
 * @private
 */


function _interceptResponse(result
/*: HttpSuccessResponseT | HttpErrorResponseT*/
, url
/*: UrlT*/
)
/*: HttpSuccessResponseT | HttpErrorResponseT*/
{
  if (result.status === 'success') {
    return _interceptSuccess(result, url);
  }

  return result;
}
/**
 * Intercept successful response from backend and:
 * - always check if tracking_state is set to `opted_out` and if yes disable sdk
 * - check if ask_in parameter is present in order to check if attribution have been changed
 * - emit session finish event if session request
 *
 * @param {Object} result
 * @param {string} result.tracking_state
 * @param {number} result.ask_in
 * @param {string} url
 * @returns {Object}
 * @private
 */


function _interceptSuccess(result
/*: HttpSuccessResponseT*/
, url)
/*: HttpSuccessResponseT*/
{
  var isGdprRequest = isRequest(url, 'gdpr_forget_device');
  var isAttributionRequest = isRequest(url, 'attribution');
  var isSessionRequest = isRequest(url, 'session');
  var isThirdPartySharingOptOutRequest = isRequest(url, 'disable_third_party_sharing');
  var optedOut = result.tracking_state === 'opted_out';

  if (!isGdprRequest && optedOut) {
    publish('sdk:gdpr-forget-me');
    return result;
  }

  if (!isAttributionRequest && !isGdprRequest && !optedOut && result.ask_in) {
    publish('attribution:check', result);
  }

  if (isSessionRequest) {
    publish('session:finished', result);
  }

  if (isThirdPartySharingOptOutRequest) {
    publish('sdk:third-party-sharing-opt-out');
    return result;
  }

  return result;
}
/**
 * Http request factory to perform all kind of api requests
 *
 * @param {Object} options
 * @returns {Promise}
 */


function http(options
/*: HttpRequestParamsT*/
)
/*: Promise<HttpSuccessResponseT | HttpErrorResponseT>*/
{
  return default_params_defaultParams().then(function (defaultParams) {
    return _sendRequestWithUrlStrategyRetries(options, defaultParams);
  }).then(function (result) {
    return _interceptResponse(result, options.url);
  });
}
// CONCATENATED MODULE: ./src/sdk/backoff.js
/*:: // 
import { type BackOffStrategyT } from './types';*/

/**
 * Options for the back-off strategy for different environments
 *
 * @type {Object}
 */

var _options = {
  long: {
    delay: 2 * MINUTE,
    maxDelay: DAY,
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
};
/**
 * Get random number in provided range
 *
 * @param {number} min
 * @param {number} max
 * @returns {number}
 * @private
 */

function _randomInRange(min, max) {
  return Math.random() * (max - min) + min;
}
/**
 * Calculate exponential back-off with optional jitter factor applied
 *
 * @param {number} attempts
 * @param {string} strategy
 * @returns {number}
 */


function backOff(attempts
/*: number*/
, strategy
/*: ?BackOffStrategyT*/
)
/*: number*/
{
  strategy = strategy || 'long';
  var options =  false ? undefined : _options[strategy];
  var delay = options.delay * Math.pow(2, attempts - 1);
  delay = Math.min(delay, options.maxDelay);

  if (options.minRange && options.maxRange) {
    delay = delay * _randomInRange(options.minRange, options.maxRange);
  }

  return Math.round(delay);
}
// CONCATENATED MODULE: ./src/sdk/listeners.js


/*:: // 
import { type DocumentT } from './types';*/

/*:: type EventCbT = (e: Event) => void*/

/*:: type PageVisibilityHiddenAttr = 'hidden' | 'mozHidden' | 'msHidden' | 'oHidden' | 'webkitHidden'*/

/*:: type PageVisibilityEventName = 'visibilitychange' | 'mozvisibilitychange' | 'msvisibilitychange' | 'ovisibilitychange' | 'webkitvisibilitychange'*/

/*:: type PageVisibilityApiMap = {|
  hidden: PageVisibilityHiddenAttr,
  visibilityChange: PageVisibilityEventName
|}*/

var _connected
/*: boolean*/
= navigator.onLine;
/**
 * Bind to online and offline events
 */

function register()
/*: void*/
{
  on(window, 'online', _handleOnline);
  on(window, 'offline', _handleOffline);
}
/**
 * Handle online event, set connected flag to true
 *
 * @private
 */


function _handleOnline()
/*: void*/
{
  _connected = true;
}
/**
 * Handle offline event, set connected flag to false
 * @private
 */


function _handleOffline()
/*: void*/
{
  _connected = false;
}
/**
 * Bind event to an element
 *
 * @param {Window|Document} element
 * @param {string} eventName
 * @param {Function} func
 */


function on(element
/*: Document | any*/
, eventName
/*: string*/
, func
/*: EventCbT*/
)
/*: void*/
{
  if (element.addEventListener) {
    element.addEventListener(eventName, func, false);
  }
}
/**
 * Unbind event off an element
 *
 * @param {Window|Document} element
 * @param {string} eventName
 * @param {Function} func
 */


function off(element
/*: Document | any*/
, eventName
/*: string*/
, func
/*: EventCbT*/
)
/*: void*/
{
  if (element.removeEventListener) {
    element.removeEventListener(eventName, func, false);
  }
}
/**
 * Get Page Visibility API attributes that can be accessed depending on the browser implementation
 *
 * @returns {{hidden: string, visibilityChange: string}|null}
 * @private
 */


function getVisibilityApiAccess()
/*: ?PageVisibilityApiMap*/
{
  var documentExt = (document
  /*: DocumentT*/
  );

  if (typeof documentExt.hidden !== 'undefined') {
    return {
      hidden: 'hidden',
      visibilityChange: 'visibilitychange'
    };
  }

  var accessMap
  /*: {[key: PageVisibilityHiddenAttr]: PageVisibilityEventName}*/
  = {
    mozHidden: 'mozvisibilitychange',
    msHidden: 'msvisibilitychange',
    oHidden: 'ovisibilitychange',
    webkitHidden: 'webkitvisibilitychange'
  };
  var accessMapEntries = entries(accessMap);

  for (var i = 0; i < accessMapEntries.length; i += 1) {
    var _accessMapEntries$i = slicedToArray_default()(accessMapEntries[i], 2),
        hidden = _accessMapEntries$i[0],
        visibilityChange = _accessMapEntries$i[1];

    if (typeof documentExt[hidden] !== 'undefined') {
      return {
        hidden: hidden,
        visibilityChange: visibilityChange
      };
    }
  }

  return null;
}
/**
 * Check if connected to internet
 *
 * @returns {boolean}
 */


function isConnected()
/*: boolean*/
{
  return _connected;
}
/**
 * Unbind from online and offline events
 */


function listeners_destroy()
/*: void*/
{
  off(window, 'online', _handleOnline);
  off(window, 'offline', _handleOffline);
}


// CONCATENATED MODULE: ./src/sdk/request.js



var request_Promise = typeof Promise === 'undefined' ? __webpack_require__(3).Promise : Promise;
/*:: // 
import { type HttpSuccessResponseT, type HttpErrorResponseT, type HttpContinueCbT, type BackOffStrategyT, type WaitT, type UrlT, type MethodT, type RequestParamsT, type HttpRequestParamsT } from './types';*/









/*:: type RequestConfigT = {|
  url?: UrlT,
  method?: MethodT,
  params?: RequestParamsT,
  continueCb?: HttpContinueCbT,
  strategy?: BackOffStrategyT,
  wait?: ?WaitT
|}*/

/*:: type DefaultConfigT = {|
  url?: UrlT,
  method: MethodT,
  params?: RequestParamsT,
  continueCb?: HttpContinueCbT
|}*/

/*:: type AttemptsT = number*/

/*:: type StartAtT = number*/

var DEFAULT_ATTEMPTS
/*: AttemptsT*/
= 0;
var DEFAULT_WAIT
/*: WaitT*/
= 150;
var MAX_WAIT
/*: WaitT*/
= 0x7FFFFFFF; // 2^31 - 1

var NO_CONNECTION_WAIT = 60 * SECOND;

var request_Request = function Request() {
  var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
      url = _ref.url,
      _ref$method = _ref.method,
      method = _ref$method === void 0 ? 'GET' : _ref$method,
      _ref$params = _ref.params,
      params = _ref$params === void 0 ? {} : _ref$params,
      continueCb = _ref.continueCb,
      strategy = _ref.strategy,
      wait = _ref.wait;

  /**
   * Global param values set on request instantiation and later used for restore
   *
   * @type {{url: string, method: string, params: Object, continueCb: Function}}
   * @private
   */
  var _default
  /*: DefaultConfigT*/
  = {
    url: url,
    method: method,
    params: params,
    continueCb: continueCb
  };
  /**
   * Url param per instance or per request
   *
   * @type {string}
   * @private
   */

  var _url
  /*: ?UrlT*/
  = url;
  /**
   * Method param per instance or per request, defaults to `GET`
   *
   * @type {string}
   * @private
   */

  var _method
  /*: MethodT*/
  = method;
  /**
   * Request params per instance or per request
   *
   * @type {Object}
   * @private
   */

  var _params
  /*: RequestParamsT*/
  = objectSpread2_default()({}, params);
  /**
   * Optional continue callback per instance or per request
   *
   * @type {Function}
   * @private
   */


  var _continueCb
  /*: ?HttpContinueCbT*/
  = continueCb;
  /**
   * Back-off strategy
   *
   * @type {string|null}
   * @private
   */

  var _strategy
  /*: ?BackOffStrategyT*/
  = strategy;
  /**
   * Timeout id to be used for clearing
   *
   * @type {number|null}
   * @private
   */

  var _timeoutId
  /*: ?TimeoutID*/
  = null;
  /**
   * Number of request and connection attempts
   *
   * @type {{request: number, connection: number}}
   * @private
   */

  var _attempts
  /*: {
      request: AttemptsT,
      connection: AttemptsT
    }*/
  = {
    request: DEFAULT_ATTEMPTS,
    connection: DEFAULT_ATTEMPTS
  };
  /**
   * Waiting time for the request to be sent
   *
   * @type {number}
   * @private
   */

  var _wait
  /*: WaitT*/
  = _prepareWait(wait);
  /**
   * Timestamp when the request has been scheduled
   *
   * @type {Date|null}
   * @private
   */


  var _startAt
  /*: ?StartAtT*/
  = null;
  /**
   * Ensure that wait is not more than maximum 32int so it does not cause overflow in setTimeout
   *
   * @param {number} wait
   * @returns {number}
   * @private
   */

  function _prepareWait(wait
  /*: ?WaitT*/
  )
  /*: WaitT*/
  {
    wait = wait || DEFAULT_WAIT;
    return wait > MAX_WAIT ? MAX_WAIT : wait;
  }
  /**
   * Override current parameters if available
   *
   * @param {string=} url
   * @param {string=} method
   * @param {Object=} params
   * @param {Function=} continueCb
   * @private
   */


  function _prepareParams(_ref2)
  /*: void*/
  {
    var url = _ref2.url,
        method = _ref2.method,
        params = _ref2.params,
        continueCb = _ref2.continueCb;

    if (url) {
      _url = url;
    }

    if (method) {
      _method = method;
    }

    if (!isEmpty(params)) {
      _params = objectSpread2_default()({}, params);
    }

    _params = objectSpread2_default()({
      createdAt: getTimestamp()
    }, _params);

    if (typeof continueCb === 'function') {
      _continueCb = continueCb;
    }
  }
  /**
   * Clear previous attempt if new one is about to happen faster
   *
   * @param {number} wait
   * @returns {boolean}
   * @private
   */


  function _skip(wait
  /*: ?WaitT*/
  )
  /*: boolean*/
  {
    if (!_startAt) {
      return false;
    }

    if (_timeoutId) {
      var remainingTime = _wait - (Date.now() - _startAt);

      if (wait && remainingTime < wait) {
        return true;
      }

      clear();
    }

    return false;
  }
  /**
   * Prepare request to be sent away
   *
   * @param {number=} wait
   * @param {boolean=false} retrying
   * @returns {Promise}
   * @private
   */


  function _prepareRequest(_ref3)
  /*: Promise<HttpSuccessResponseT | HttpErrorResponseT>*/
  {
    var wait = _ref3.wait,
        retrying = _ref3.retrying;
    _wait = wait ? _prepareWait(wait) : _wait;

    if (_skip(wait)) {
      return request_Promise.resolve({
        status: 'error',
        action: 'CONTINUE',
        response: '',
        message: HTTP_ERRORS['SKIP'],
        code: 'SKIP'
      });
    }

    if (!_url) {
      logger.error('You must define url for the request to be sent');
      return request_Promise.reject({
        status: 'error',
        action: 'CONTINUE',
        response: '',
        message: HTTP_ERRORS['MISSING_URL'],
        code: 'MISSING_URL'
      });
    }

    logger.log("".concat(retrying ? 'Re-trying' : 'Trying', " request ").concat(_url, " in ").concat(_wait, "ms"));
    _startAt = Date.now();
    return _preRequest({
      url: _url,
      method: _method,
      params: objectSpread2_default()({
        attempts: 1
      }, _params)
    });
  }
  /**
   * Check if there is internet connect and if not then setup the timeout
   *
   * @param {Object} options
   * @returns {Promise}
   * @private
   */


  function _preRequest(options
  /*: HttpRequestParamsT*/
  )
  /*: Promise<HttpSuccessResponseT | HttpErrorResponseT>*/
  {
    _clearTimeout();

    if (isConnected()) {
      return _request(options);
    }

    _attempts.connection += 1;
    logger.log("No internet connectivity, trying request ".concat(options.url, " in ").concat(NO_CONNECTION_WAIT, "ms"));
    return new request_Promise(function (resolve) {
      _timeoutId = setTimeout(function () {
        resolve(_preRequest(options));
      }, NO_CONNECTION_WAIT);
    });
  }
  /**
   * Do the timed-out request with retry mechanism
   *
   * @param {Object} options
   * @returns {Promise}
   * @private
   */


  function _request(options
  /*: HttpRequestParamsT*/
  )
  /*: Promise<HttpSuccessResponseT | HttpErrorResponseT>*/
  {
    return new request_Promise(function (resolve, reject) {
      _timeoutId = setTimeout(function () {
        _startAt = null;
        var filteredParams = entries(options.params).filter(function (_ref4) {
          var _ref5 = slicedToArray_default()(_ref4, 2),
              value = _ref5[1];

          return isEmptyEntry(value);
        }).reduce(reducer, {});
        return http({
          url: options.url,
          method: options.method,
          params: objectSpread2_default()(objectSpread2_default()({}, filteredParams), {}, {
            attempts: (_attempts.request ? _attempts.request + 1 : 1) + _attempts.connection
          })
        }).then(function (result) {
          return _continue(result, resolve);
        }).catch(function (result) {
          return _error(result, resolve, reject);
        });
      }, _wait);
    });
  }
  /**
   * Restore to global parameters
   *
   * @private
   */


  function _restore()
  /*: void*/
  {
    _url = _default.url;
    _method = _default.method;
    _params = objectSpread2_default()({}, _default.params);
    _continueCb = _default.continueCb;
  }
  /**
   * Finish the request by restoring and clearing
   *
   * @param {boolean=false} failed
   * @private
   */


  function _finish(failed
  /*: boolean*/
  )
  /*: void*/
  {
    logger.log("Request ".concat(_url || 'unknown', " ").concat(failed ? 'failed' : 'has been finished'));
    _attempts.request = DEFAULT_ATTEMPTS;
    _attempts.connection = DEFAULT_ATTEMPTS;
    _wait = DEFAULT_WAIT;

    _restore();

    clear();
  }
  /**
   * Retry request with optional new waiting period
   *
   * @param {number=} wait
   * @returns {Promise}
   * @private
   */


  function _retry(wait
  /*: WaitT*/
  )
  /*: Promise<HttpSuccessResponseT | HttpErrorResponseT>*/
  {
    _attempts.request += 1;
    clear();
    return _prepareRequest({
      wait: wait || backOff(_attempts.request, _strategy),
      retrying: true
    });
  }
  /**
   * Decide how to continue, either:
   * - retry if requested
   * - call custom success callback
   * - or finish the request by default
   *
   * @param {Object} result
   * @param {number} result.retry_in
   * @param {Function} resolve
   * @private
   */


  function _continue(result
  /*: HttpSuccessResponseT | HttpErrorResponseT*/
  , resolve)
  /*: void*/
  {
    if (result && result.retry_in) {
      resolve(_retry(result.retry_in));
      return;
    }

    if (typeof _continueCb === 'function') {
      _continueCb(result, _finish, _retry);
    } else {
      _finish();
    }

    resolve(result);
  }
  /**
   * Ensure to resolve on retry and finish request when unknown error
   *
   * @param {Object} result
   * @param {Function} resolve
   * @param {Function} reject
   * @private
   */


  function _error(result
  /*: HttpErrorResponseT*/
  , resolve, reject)
  /*: void*/
  {
    if (result && result.action === 'RETRY') {
      resolve(_retry(result.code === 'NO_CONNECTION' ? NO_CONNECTION_WAIT : undefined));
      return;
    }

    _finish(true);

    reject(result || {});
  }
  /**
   * Send the request after specified or default waiting period
   *
   * @param {string=} url
   * @param {string=} method
   * @param {Object=} params
   * @param {Function=} continueCb
   * @param {number=} wait
   * @returns {Promise}
   */


  function send()
  /*: Promise<HttpSuccessResponseT | HttpErrorResponseT>*/
  {
    var _ref6 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
        url = _ref6.url,
        method = _ref6.method,
        _ref6$params = _ref6.params,
        params = _ref6$params === void 0 ? {} : _ref6$params,
        continueCb = _ref6.continueCb,
        wait = _ref6.wait;

    _prepareParams({
      url: url,
      method: method,
      params: params,
      continueCb: continueCb
    });

    return _prepareRequest({
      wait: wait
    });
  }
  /**
   * Check if request is running
   *
   * @returns {boolean}
   */


  function isRunning()
  /*: boolean*/
  {
    return !!_timeoutId;
  }
  /**
   * Clear request/connection timeout
   *
   * @private
   */


  function _clearTimeout()
  /*: void*/
  {
    if (_timeoutId) {
      clearTimeout(_timeoutId);
    }

    _timeoutId = null;
  }
  /**
   * Clear the current request
   */


  function clear()
  /*: void*/
  {
    var stillRunning = !!_startAt;

    _clearTimeout();

    _startAt = null;

    if (stillRunning) {
      _wait = DEFAULT_WAIT;
      _attempts.request = DEFAULT_ATTEMPTS;
      _attempts.connection = DEFAULT_ATTEMPTS;
      logger.log("Previous ".concat(_url || 'unknown', " request attempt canceled"));

      _restore();
    }
  }

  return {
    send: send,
    isRunning: isRunning,
    clear: clear
  };
};

/* harmony default export */ var request = (request_Request);
// CONCATENATED MODULE: ./src/sdk/disable.js



/*:: type StatusT = 'on' | 'off' | 'paused'*/

/*:: type ReasonT = REASON_GDPR | REASON_GENERAL*/

/*:: type PendingT = boolean*/

/*:: type ReasonMapT = {|
  reason: ReasonT,
  pending: PendingT
|}*/

/**
 * Get the disable action name depending on the reason
 *
 * @param {string} reason
 * @returns {string}
 * @private
 */
var disable_disableReason = function _disableReason(reason
/*: ReasonT*/
) {
  return reason === REASON_GDPR ? 'GDPR disable' : 'disable';
};
/**
 * Get log messages depending on the disable reason
 *
 * @param {string} reason
 * @returns {Object}
 * @private
 */


var _logMessages = function _logMessages(reason
/*: ReasonT*/
) {
  return {
    start: {
      inProgress: "Adjust SDK ".concat(disable_disableReason(reason), " process has already started"),
      done: "Adjust SDK ".concat(disable_disableReason(reason), " process is now started")
    },
    finish: {
      inProgress: "Adjust SDK ".concat(disable_disableReason(reason), " process has already finished"),
      done: "Adjust SDK ".concat(disable_disableReason(reason), " process is now finished")
    }
  };
};
/**
 * Start or finish disable process
 *
 * @param {string} reason
 * @param {boolean} pending
 * @param {string} expectedAction
 * @returns {boolean}
 * @private
 */


function _disable(_ref, expectedAction
/*: 'start' | 'finish'*/
)
/*: boolean*/
{
  var reason = _ref.reason,
      pending = _ref.pending;
  var disabled = getDisabled() || {};
  var action = expectedAction === 'start' && disabled.pending ? 'start' : 'finish';
  var shouldNotStart = expectedAction === 'start' && disabled.reason;
  var shouldNotFinish = expectedAction === 'finish' && disabled.reason && !disabled.pending;

  if (shouldNotStart || shouldNotFinish) {
    logger.log(_logMessages(disabled.reason)[action].inProgress);
    return false;
  }

  logger.log(_logMessages(reason)[action].done);
  setDisabled({
    reason: reason || REASON_GENERAL,
    pending: pending
  });
  return true;
}
/**
 * Disable sdk due to a particular reason
 *
 * @param {string} reason
 * @param {boolean} pending
 * @private
 */


function disable(reason
/*: ?ReasonT*/
)
/*: boolean*/
{
  var pending
  /*: ?PendingT*/
  = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
  return _disable({
    reason: reason,
    pending: pending || false
  }, 'start');
}
/**
 * Finish disable process if previously set to pending state
 *
 * @param {string} reason
 * @returns {boolean}
 */


function disable_finish(reason
/*: ReasonT*/
)
/*: boolean*/
{
  return _disable({
    reason: reason,
    pending: false
  }, 'finish');
}
/**
 * Enable sdk if not GDPR forgotten
 */


function restore()
/*: boolean*/
{
  var disabled = getDisabled() || {};

  if (disabled.reason === REASON_GDPR) {
    logger.log('Adjust SDK is disabled due to GDPR-Forget-Me request and it can not be re-enabled');
    return false;
  }

  if (!disabled.reason) {
    logger.log('Adjust SDK is already enabled');
    return false;
  }

  logger.log('Adjust SDK has been enabled');
  setDisabled(null);
  return true;
}
/**
 * Get the current status of the sdk
 * - on: not disabled
 * - paused: partially disabled, waiting for the opt-out confirmation from the backend
 * - off: completely disabled
 *
 * @returns {string}
 */


function disable_status()
/*: StatusT*/
{
  var disabled = getDisabled() || {};

  if (disabled.reason === REASON_GENERAL || disabled.reason === REASON_GDPR && !disabled.pending) {
    return 'off';
  } else if (disabled.reason === REASON_GDPR && disabled.pending) {
    return 'paused';
  }

  return 'on';
}


// CONCATENATED MODULE: ./src/sdk/identity.js


var identity_Promise = typeof Promise === 'undefined' ? __webpack_require__(3).Promise : Promise;
/*:: // 
import { type ActivityStateMapT } from './types';*/









/*:: type InterceptT = {|
  exists: boolean,
  stored?: ?ActivityStateMapT
|}*/

/**
 * Name of the store used by activityState
 *
 * @type {string}
 * @private
 */
var identity_storeName = 'activityState';
/**
 * Boolean used in start in order to avoid duplicated activity state
 *
 * @type {boolean}
 * @private
 */

var _starting
/*: boolean*/
= false;
/**
 * Generate random  uuid v4
 *
 * @returns {string}
 * @private
 */

function _generateUuid()
/*: string*/
{
  var seed = Date.now();
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    var r = (seed + Math.random() * 16) % 16 | 0;
    seed = Math.floor(seed / 16);
    return (c === 'x' ? r : r & (0x3 | 0x8)).toString(16);
  });
}
/**
 * Inspect stored activity state and check if disable needs to be repeated
 *
 * @param {Object=} stored
 * @returns {Object}
 * @private
 */


function _intercept(stored
/*: ActivityStateMapT*/
)
/*: InterceptT*/
{
  if (!stored) {
    return {
      exists: false
    };
  }

  if (stored.uuid === 'unknown') {
    disable({
      reason: REASON_GDPR
    });
    activity_state.destroy();
    return {
      exists: true,
      stored: null
    };
  }

  activity_state.init(stored);
  return {
    exists: true,
    stored: stored
  };
}
/**
 * Cache stored activity state into running memory
 *
 * @returns {Promise}
 */


function identity_start()
/*: Promise<ActivityStateMapT>*/
{
  if (_starting) {
    return identity_Promise.reject({
      interrupted: true,
      message: 'Adjust SDK start already in progress'
    });
  }

  _starting = true;
  return storage_storage.getFirst(identity_storeName).then(_intercept).then(function (result
  /*: InterceptT*/
  ) {
    if (result.exists) {
      _starting = false;
      return result.stored;
    }

    var activityState = isEmpty(activity_state.current) ? {
      uuid: _generateUuid()
    } : activity_state.current;
    return storage_storage.addItem(identity_storeName, activityState).then(function () {
      activity_state.init(activityState);
      reload();
      _starting = false;
      return activityState;
    });
  });
}
/**
 * Check if sdk is running at all (totally disabled or inactive activity state)
 *
 * @returns {boolean}
 * @private
 */


function _isLive() {
  return disable_status() !== 'off' && activity_state.isStarted();
}
/**
 * Persist changes made directly in activity state and update lastActive flag
 *
 * @returns {Promise}
 */


function persist()
/*: Promise<?ActivityStateMapT>*/
{
  if (!_isLive()) {
    return identity_Promise.resolve(null);
  }

  var activityState = objectSpread2_default()(objectSpread2_default()({}, activity_state.current), {}, {
    lastActive: Date.now()
  });

  return storage_storage.updateItem(identity_storeName, activityState).then(function () {
    return activity_state.current = activityState;
  });
}
/**
 * Sync in-memory activityState with the one from store
 * - should be used when change from another tab is possible and critical
 *
 * @returns {Promise}
 */


function sync()
/*: Promise<ActivityStateMapT>*/
{
  return storage_storage.getFirst(identity_storeName).then(function (activityState
  /*: ActivityStateMapT*/
  ) {
    var current = activity_state.current;
    var lastActive = current.lastActive || 0;

    if (_isLive() && lastActive < activityState.lastActive) {
      // Checking if another SDK instance was installed while this one was in backgound
      var installedUpdated = !current.installed && activityState.installed;
      var sessionCountUpdated = (current.sessionCount || 0) < (activityState.sessionCount || 0);

      if (installedUpdated || sessionCountUpdated) {
        publish('sdk:installed');
      }

      activity_state.current = activityState;
      reload();
    }

    return activityState;
  });
}
/**
 * Clear activity state store - set uuid to be unknown
 */


function identity_clear()
/*: void*/
{
  var newActivityState = {
    uuid: 'unknown'
  };
  activity_state.current = newActivityState;
  return storage_storage.clear(identity_storeName).then(function () {
    return storage_storage.addItem(identity_storeName, newActivityState);
  });
}
/**
 * Destroy current activity state
 */


function identity_destroy()
/*: void*/
{
  activity_state.destroy();
}


// CONCATENATED MODULE: ./src/sdk/queue.js



var queue_Promise = typeof Promise === 'undefined' ? __webpack_require__(3).Promise : Promise;
/*:: // 
import { type HttpSuccessResponseT, type HttpErrorResponseT, type HttpFinishCbT, type WaitT, type UrlT, type MethodT, type RequestParamsT, type ActivityStateMapT } from './types';*/










/*:: type PendingT = {|
  timestamp: number,
  url: UrlT,
  method?: MethodT,
  createdAt?: number,
  params: RequestParamsT
|}*/

/**
 * Http request instance
 *
 * @type {Object}
 * @private
 */
var queue_request = request({
  strategy: 'long',
  continueCb: queue_continue
});
/**
 * Check if in offline mode
 *
 * @type {boolean}
 * @private
 */


var _isOffline = false;
/**
 * Name of the store used by queue
 *
 * @type {string}
 * @private
 */

var queue_storeName = 'queue';
/**
 * Current running state and task timestamp
 *
 * @type {{running: boolean, timestamp: void|number, pause: void|Object}}
 * @private
 */

var _current
/*: {|
  running: boolean,
  timestamp: ?number,
  pause: ?{|
    timestamp: number,
    wait: WaitT
  |}
|}*/
= {
  running: false,
  timestamp: null,
  pause: null
};
/**
 * Remove from the top and continue running pending requests
 *
 * @param {Object} result
 * @param {Function} finish
 * @returns {Promise}
 * @private
 */

function queue_continue(result
/*: HttpSuccessResponseT | HttpErrorResponseT*/
, finish
/*: HttpFinishCbT*/
)
/*: Promise<HttpSuccessResponseT | HttpErrorResponseT>*/
{
  var wait = result && result.continue_in || null;
  _current.pause = wait ? {
    timestamp: Date.now(),
    wait: wait
  } : null;
  return storage_storage.getFirst(queue_storeName).then(function (pending) {
    return pending ? storage_storage.deleteItem(queue_storeName, pending.timestamp) : null;
  }).then(function () {
    finish();
    _current.running = false;
    return run({
      wait: wait
    });
  });
}
/**
 * Correct timestamp if equal or less then previous one to avoid constraint errors
 * Cases when needed:
 * - test environment
 * - when pushing to queue synchronously, one after an other
 *
 * @returns {number}
 * @private
 */


function _prepareTimestamp()
/*: number*/
{
  var timestamp = Date.now();

  if (_current.timestamp && timestamp <= _current.timestamp) {
    timestamp = _current.timestamp + 1;
  }

  _current.timestamp = timestamp;
  return timestamp;
}
/**
 * Persist activity state change with session offset reset after session request
 *
 * @param {string} url
 * @returns {Promise}
 * @private
 */


function _persist(url)
/*: Promise<?ActivityStateMapT>*/
{
  if (isRequest(url, 'session')) {
    activity_state.resetSessionOffset();
  }

  activity_state.updateLastActive();
  return persist();
}
/**
 * Push request to the queue
 *
 * @param {string} url
 * @param {string} method
 * @param {Object=} params
 * @param {boolean=} auto
 * @param {number=} timestamp
 * @returns {Promise}
 */


function push(_ref) {
  var url = _ref.url,
      method = _ref.method,
      params = _ref.params;

  var _ref2 = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
      auto = _ref2.auto,
      timestamp = _ref2.timestamp;

  activity_state.updateParams(url, auto);
  var filteredParams = entries(params || {}).filter(function (_ref3) {
    var _ref4 = slicedToArray_default()(_ref3, 2),
        value = _ref4[1];

    return isEmptyEntry(value);
  }).reduce(reducer, {});
  var pending
  /*: PendingT*/
  = {
    timestamp: _prepareTimestamp(),
    url: url,
    method: method,
    params: objectSpread2_default()(objectSpread2_default()({}, activity_state.getParams(url)), filteredParams)
  };

  if (timestamp) {
    pending.createdAt = timestamp;
  }

  return storage_storage.addItem(queue_storeName, pending).then(function () {
    return _persist(url);
  }).then(function () {
    return _current.running ? {} : run();
  });
}
/**
 * Prepare to send pending request if available
 *
 * @param {number} timestamp
 * @param {number=} createdAt
 * @param {string=} url
 * @param {string=} method
 * @param {Object=} params
 * @param {number=} wait
 * @returns {Promise}
 * @private
 */


function _prepareToSend()
/*: Promise<mixed>*/
{
  var _ref5 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
      timestamp = _ref5.timestamp,
      createdAt = _ref5.createdAt,
      url = _ref5.url,
      method = _ref5.method,
      params = _ref5.params;

  var wait
  /*:: ?: ?WaitT*/
  = arguments.length > 1 ? arguments[1] : undefined;
  var activityState = activity_state.current || {};
  var firstSession = url === '/session' && !activityState.installed;
  var noPending = !url && !method && !params;

  if (_isOffline && !firstSession || noPending) {
    _current.running = false;
    return queue_Promise.resolve({});
  }

  return queue_request.send({
    url: url,
    method: method,
    params: objectSpread2_default()(objectSpread2_default()({}, params), {}, {
      createdAt: getTimestamp(createdAt || timestamp)
    }),
    wait: wait || _checkWait()
  });
}
/**
 * Check if there is waiting period required
 *
 * @returns {void|number}
 * @private
 */


function _checkWait()
/*: ?WaitT*/
{
  var _ref6 = _current.pause || {},
      timestamp = _ref6.timestamp,
      wait = _ref6.wait;

  var rest = Date.now() - (timestamp || 0);
  return rest < wait ? wait - rest : null;
}
/**
 * Run all pending requests
 *
 * @param {boolean=false} cleanUp
 * @param {number=} wait
 * @returns {Promise}
 */


function run()
/*: Promise<mixed>*/
{
  var _ref7 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
      cleanUp = _ref7.cleanUp,
      wait = _ref7.wait;

  if (_current.running) {
    return queue_Promise.resolve({});
  }

  _current.running = true;

  var chain = queue_Promise.resolve({});

  if (cleanUp) {
    chain = chain.then(_cleanUp);
  }

  return chain.then(function () {
    return storage_storage.getFirst(queue_storeName);
  }).then(function (pending) {
    return _prepareToSend(pending, wait);
  });
}
/**
 * Set offline mode to on or off
 * - if on then all requests are queued
 * - if off then run all pending requests
 *
 * @param {boolean} state
 */


function setOffline(state
/*: boolean*/
)
/*: void*/
{
  if (state === undefined) {
    logger.error('State not provided, true or false has to be defined');
    return;
  }

  if (state === _isOffline) {
    logger.error("The app is already in ".concat(state ? 'offline' : 'online', " mode"));
    return;
  }

  var wasOffline = _isOffline;
  _isOffline = state;

  if (!state && wasOffline) {
    run();
  }

  logger.info("The app is now in ".concat(state ? 'offline' : 'online', " mode"));
}
/**
 * Clean up stale pending requests
 *
 * @private
 * @returns {Promise}
 */


function _cleanUp()
/*: Promise<mixed>*/
{
  var upperBound = Date.now() - sdk_config.requestValidityWindow;
  return storage_storage.deleteBulk(queue_storeName, upperBound, 'upperBound');
}
/**
 * Check if there is pending timeout to be flushed
 * i.e. if queue is running
 *
 * @returns {boolean}
 */


function queue_isRunning()
/*: boolean*/
{
  return _current.running;
}
/**
 * Clear queue store
 */


function queue_clear()
/*: void*/
{
  return storage_storage.clear(queue_storeName);
}
/**
 * Destroy queue by clearing current timeout
 */


function queue_destroy()
/*: void*/
{
  queue_request.clear();

  _current.running = false;
  _current.timestamp = null;
  _current.pause = null;
}


// CONCATENATED MODULE: ./src/sdk/global-params.js


var global_params_Promise = typeof Promise === 'undefined' ? __webpack_require__(3).Promise : Promise;
/*:: // 
import { type GlobalParamsT, type GlobalParamsMapT } from './types';*/





/*:: type TypeT = 'callback' | 'partner'*/

/*:: type KeysT = [string, TypeT]*/

/*:: type KeysArrayT = Array<KeysT>*/

/**
 * Name of the store used by global params
 *
 * @type {string}
 * @private
 */
var global_params_storeName = 'globalParams';
/**
 * Error message for type missing
 *
 * @type {Object}
 * @private
 */

var global_params_error = {
  short: 'No type provided',
  long: 'Global parameter type not provided, `callback` or `partner` types are available'
};
/**
 * Omit type parameter from the collection
 *
 * @param {Array} params
 * @returns {Array}
 * @private
 */

function _omitType(params)
/*: Array<GlobalParamsT>*/
{
  return (params || []).map(function (_ref) {
    var key = _ref.key,
        value = _ref.value;
    return {
      key: key,
      value: value
    };
  });
}
/**
 * Get callback and partner global parameters
 *
 * @returns {Promise}
 */


function get()
/*: Promise<GlobalParamsMapT>*/
{
  return global_params_Promise.all([storage_storage.filterBy(global_params_storeName, 'callback'), storage_storage.filterBy(global_params_storeName, 'partner')]).then(function (_ref2) {
    var _ref3 = slicedToArray_default()(_ref2, 2),
        callbackParams = _ref3[0],
        partnerParams = _ref3[1];

    return {
      callbackParams: _omitType(callbackParams),
      partnerParams: _omitType(partnerParams)
    };
  });
}
/**
 * Add global parameters, either callback or partner params
 *
 * @param {Array} params
 * @param {string} type
 * @returns {Promise}
 */


function add(params
/*: Array<GlobalParamsT>*/
, type
/*: TypeT*/
)
/*: void | Promise<KeysArrayT>*/
{
  if (type === undefined) {
    logger.error(global_params_error.long);
    return global_params_Promise.reject({
      message: global_params_error.short
    });
  }
  /*:: type GlobalParamsWithTypeT = {|...GlobalParamsT, type: string|}*/


  var map
  /*: {[key: string]: string}*/
  = convertToMap(params);
  var prepared
  /*: Array<GlobalParamsWithTypeT>*/
  = Object.keys(map).map(function (key) {
    return {
      key: key,
      value: map[key],
      type: type
    };
  });
  return global_params_Promise.all([storage_storage.filterBy(global_params_storeName, type), storage_storage.addBulk(global_params_storeName, prepared, true)]).then(function (_ref4) {
    var _ref5 = slicedToArray_default()(_ref4, 2),
        oldParams = _ref5[0],
        newParams = _ref5[1];

    var intersecting = intersection(oldParams.map(function (param) {
      return param.key;
    }), newParams.map(function (param) {
      return param[0];
    }));
    logger.log("Following ".concat(type, " parameters have been saved: ").concat(prepared.map(function (p) {
      return "".concat(p.key, ":").concat(p.value);
    }).join(', ')));

    if (intersecting.length) {
      logger.log("Keys: ".concat(intersecting.join(', '), " already existed so their values have been updated"));
    }

    return newParams;
  });
}
/**
 * Remove global parameter by key and type
 *
 * @param {string} key
 * @param {string} type
 * @returns {Promise}
 */


function remove(key
/*: string*/
, type
/*: TypeT*/
)
/*: void | Promise<KeysT>*/
{
  if (type === undefined) {
    logger.error(global_params_error.long);
    return global_params_Promise.reject({
      message: global_params_error.short
    });
  }

  return storage_storage.deleteItem(global_params_storeName, [key, type]).then(function (result) {
    logger.log("".concat(key, " ").concat(type, " parameter has been deleted"));
    return result;
  });
}
/**
 * Remove all global parameters of certain type
 * @param {string} type
 * @returns {Promise}
 */


function removeAll(type
/*: TypeT*/
)
/*: void | Promise<KeysArrayT>*/
{
  if (type === undefined) {
    logger.error(global_params_error.long);
    return global_params_Promise.reject({
      message: global_params_error.short
    });
  }

  return storage_storage.deleteBulk(global_params_storeName, type).then(function (result) {
    logger.log("All ".concat(type, " parameters have been deleted"));
    return result;
  });
}
/**
 * Clear globalParams store
 */


function global_params_clear()
/*: void*/
{
  return storage_storage.clear(global_params_storeName);
}


// CONCATENATED MODULE: ./src/sdk/session.js
var session_Promise = typeof Promise === 'undefined' ? __webpack_require__(3).Promise : Promise;
/*:: // 
import { type DocumentT, type HttpSuccessResponseT, type HttpErrorResponseT, type GlobalParamsMapT, type SessionRequestParamsT } from './types';*/












/**
 * Flag to mark if session watch is already on
 *
 * @type {boolean}
 * @private
 */

var _running = false;
/**
 * Reference to interval id to be used for clearing
 *
 * @type {number}
 * @private
 */

var _idInterval
/*: ?IntervalID*/
;
/**
 * Reference to timeout id to be used for clearing
 *
 * @type {number}
 * @private
 */


var _idTimeout
/*: ?TimeoutID*/
;
/**
 * Browser-specific prefixes for accessing Page Visibility API
 *
 * @type {{hidden, visibilityChange}}
 * @private
 */


var _pva;
/**
 * Reference to the document casted to a plain object
 *
 * @type {Document}
 */


var session_documentExt = (document
/*: DocumentT*/
);
/**
 * Initiate session watch:
 * - bind to visibility change event to track window state (if out of focus or closed)
 * - initiate activity state params and visibility state
 * - check session initially
 * - set the timer to update last active timestamp
 *
 * @returns {Promise}
 */

function watch()
/*: Promise<mixed>*/
{
  _pva = getVisibilityApiAccess();

  if (_running) {
    return session_Promise.reject({
      interrupted: true,
      message: 'Session watch already initiated'
    });
  }

  _running = true;
  subscribe('session:finished', _handleSessionRequestFinish);

  if (_pva) {
    on(session_documentExt, _pva.visibilityChange, _handleVisibilityChange);
  }

  if (_pva && session_documentExt[_pva.hidden]) {
    logger.log('Session request attempt canceled because the tab is still hidden');
    return session_Promise.resolve({});
  }

  activity_state.initParams();
  return _checkSession();
}
/**
 * Check if session watch is running
 *
 * @returns {boolean}
 */


function session_isRunning()
/*: boolean*/
{
  return _running;
}
/**
 * Destroy session watch
 */


function session_destroy()
/*: void*/
{
  _running = false;
  activity_state.toBackground();

  _stopTimer();

  if (_pva) {
    clearTimeout(_idTimeout);
    off(session_documentExt, _pva.visibilityChange, _handleVisibilityChange);
  }
}
/**
 * Handle transit to background:
 * - stop the timer
 * - update session params
 * - persist changes (store updated activity state)
 *
 * @returns {Promise}
 * @private
 */


function _handleBackground()
/*: Promise<mixed>*/
{
  _stopTimer();

  activity_state.updateSessionOffset();
  activity_state.toBackground();
  return persist();
}
/**
 * Handle transit to foreground:
 * - update session length
 * - check for the session and restart the timer
 *
 * @returns {Promise}
 * @private
 */


function _handleForeground()
/*: Promise<mixed>*/
{
  return sync().then(function () {
    activity_state.updateSessionLength();
    activity_state.toForeground();
  }).then(_checkSession);
}
/**
 * Handle visibility change and perform appropriate actions
 *
 * @private
 */


function _handleVisibilityChange()
/*: void*/
{
  clearTimeout(_idTimeout);
  var handler = _pva && session_documentExt[_pva.hidden] ? _handleBackground : _handleForeground;
  _idTimeout = setTimeout(handler, 0);
}
/**
 * Handle session request finish; update installed state
 *
 * @param {string} e
 * @param {Object} result
 * @returns {Promise|void}
 * @private
 */


function _handleSessionRequestFinish(e
/*: string*/
, result
/*: HttpSuccessResponseT | HttpErrorResponseT*/
)
/*: ?Promise<mixed>*/
{
  if (result && result.status === 'error') {
    logger.error('Session was not successful, error was returned from the server:', result.response);
    return;
  }

  activity_state.updateInstalled();
  publish('sdk:installed');
  return persist();
}
/**
 * Start the session timer, every N seconds:
 * - update session params
 * - persist changes (store updated activity state)
 *
 * @private
 */


function _startTimer()
/*: void*/
{
  _stopTimer();

  _idInterval = setInterval(function () {
    activity_state.updateSessionOffset();
    return persist();
  }, sdk_config.sessionTimerWindow);
}
/**
 * Stop the session timer
 *
 * @private
 */


function _stopTimer()
/*: void*/
{
  clearInterval(_idInterval);
}
/**
 * Prepare parameters for the session tracking
 *
 * @param {Array} callbackParams
 * @param {Array} partnerParams
 * @returns {Object}
 * @private
 */


function session_prepareParams(_ref)
/*: SessionRequestParamsT*/
{
  var callbackParams = _ref.callbackParams,
      partnerParams = _ref.partnerParams;
  return {
    callbackParams: callbackParams.length ? convertToMap(callbackParams) : null,
    partnerParams: partnerParams.length ? convertToMap(partnerParams) : null
  };
}
/**
 * Track session by sending the request to the server
 *
 * @private
 */


function _trackSession()
/*: Promise<mixed>*/
{
  return get().then(function (globalParams) {
    push({
      url: '/session',
      method: 'POST',
      params: session_prepareParams(globalParams)
    }, {
      auto: true
    });
  });
}
/**
 * Check if session needs to be tracked
 *
 * @private
 */


function _checkSession()
/*: Promise<mixed>*/
{
  _startTimer();

  var activityState = activity_state.current;
  var lastInterval = activityState.lastInterval;
  var isEnqueued = activityState.sessionCount > 0;
  var currentWindow = lastInterval * SECOND;

  if (!isEnqueued || isEnqueued && currentWindow >= sdk_config.sessionWindow) {
    return _trackSession();
  }

  publish('attribution:check');
  return persist();
}


// CONCATENATED MODULE: ./src/sdk/attribution.js



var attribution_Promise = typeof Promise === 'undefined' ? __webpack_require__(3).Promise : Promise;
/*:: // 
import { type HttpSuccessResponseT, type HttpErrorResponseT, type HttpFinishCbT, type HttpRetryCbT, type AttributionStateT, type AttributionWhiteListT, type ActivityStateMapT, type AttributionMapT } from './types';*/








/**
 * Http request instance
 *
 * @type {Object}
 * @private
 */

var attribution_request = request({
  url: '/attribution',
  strategy: 'short',
  continueCb: attribution_continue
});
/**
 * List of valid attribution parameters
 *
 * @type {string[]}
 * @private
 */


var _whitelist
/*: AttributionWhiteListT*/
= ['tracker_token', 'tracker_name', 'network', 'campaign', 'adgroup', 'creative', 'click_label', 'state'];
/**
 * Check if new attribution is the same as old one
 *
 * @param {string} adid
 * @param {Object=} attribution
 * @returns {boolean}
 * @private
 */

function _isSame(_ref)
/*: boolean*/
{
  var adid = _ref.adid,
      attribution = _ref.attribution;
  var oldAttribution = activity_state.current.attribution || {};

  var anyDifferent = attribution && _whitelist.some(function (k) {
    return oldAttribution[k] !== attribution[k];
  });

  return !anyDifferent && adid === oldAttribution.adid;
}
/**
 * Check if attribution result is valid
 *
 * @param {string} adid
 * @param {Object=} attribution
 * @returns {boolean}
 * @private
 */


function _isValid(_ref2)
/*: boolean*/
{
  var _ref2$adid = _ref2.adid,
      adid = _ref2$adid === void 0 ? '' : _ref2$adid,
      _ref2$attribution = _ref2.attribution,
      attribution = _ref2$attribution === void 0 ? {} : _ref2$attribution;
  return !!adid && !!intersection(_whitelist, Object.keys(attribution)).length;
}
/**
 * Update attribution and initiate client's callback
 *
 * @param {Object} result
 * @private
 */


function _setAttribution(result
/*: HttpSuccessResponseT*/
)
/*: Promise<AttributionStateT>*/
{
  if (isEmpty(result) || !_isValid(result) || _isSame(result)) {
    return attribution_Promise.resolve({
      state: 'same'
    });
  }

  var attribution
  /*: AttributionMapT*/
  = entries(result.attribution).filter(function (_ref3) {
    var _ref4 = slicedToArray_default()(_ref3, 1),
        key = _ref4[0];

    return _whitelist.indexOf(key) !== -1;
  }).reduce(reducer, {
    adid: result.adid
  });
  activity_state.current = objectSpread2_default()(objectSpread2_default()({}, activity_state.current), {}, {
    attribution: attribution
  });
  return persist().then(function () {
    publish('attribution:change', attribution);
    logger.info('Attribution has been updated');
    return {
      state: 'changed'
    };
  });
}
/**
 * Store attribution or make another request if attribution not yet available
 *
 * @param {Object} result
 * @param {Function} finish
 * @param {Function} retry
 * @returns {Promise}
 * @private
 */


function attribution_continue(result
/*: HttpSuccessResponseT | HttpErrorResponseT*/
, finish
/*: HttpFinishCbT*/
, retry
/*: HttpRetryCbT*/
)
/*: Promise<HttpSuccessResponseT | HttpErrorResponseT | AttributionStateT>*/
{
  if (!result || result && result.status === 'error') {
    finish();
    return attribution_Promise.resolve({
      state: 'unknown'
    });
  }

  if (!result.ask_in) {
    finish();
    return _setAttribution(result);
  }

  return retry(result.ask_in);
}
/**
 * Request attribution if session asked for it
 *
 * @param {Object=} sessionResult
 * @param {number=} sessionResult.ask_in
 */


function check(sessionResult
/*: HttpSuccessResponseT*/
)
/*: Promise<?ActivityStateMapT>*/
{
  var activityState = activity_state.current;
  var askIn = (sessionResult || {}).ask_in;

  if (!askIn && (activityState.attribution || !activityState.installed)) {
    return attribution_Promise.resolve(activityState);
  }

  attribution_request.send({
    params: objectSpread2_default()({
      initiatedBy: !sessionResult ? 'sdk' : 'backend'
    }, activity_state.getParams()),
    wait: askIn
  });

  activity_state.updateSessionOffset();
  return persist();
}
/**
 * Destroy attribution by clearing running request
 */


function attribution_destroy()
/*: void*/
{
  attribution_request.clear();
}


// CONCATENATED MODULE: ./src/sdk/gdpr-forget-device.js








/**
 * Http request instance
 *
 * @type {Object}
 * @private
 */

var gdpr_forget_device_request = request({
  url: '/gdpr_forget_device',
  method: 'POST',
  strategy: 'short'
});
/**
 * Log messages used in different scenarios
 *
 * @type {Object}
 * @private
 */


var gdpr_forget_device_logMessages = {
  running: 'Adjust SDK is running pending GDPR Forget Me request',
  pending: 'Adjust SDK will run GDPR Forget Me request after initialisation',
  paused: 'Adjust SDK is already prepared to send GDPR Forget Me request',
  off: 'Adjust SDK is already disabled'
};
/**
 * Request GDPR-Forget-Me in order to disable sdk
 *
 * @param {boolean} force
 * @returns {boolean}
 */

function forget(force
/*: boolean*/
)
/*: boolean*/
{
  var sdkStatus = disable_status();

  if (!force && sdkStatus !== 'on') {
    logger.log(gdpr_forget_device_logMessages[sdkStatus]);
    return false;
  }

  if (!sdk_config.isInitialised()) {
    logger.log(gdpr_forget_device_logMessages.pending);
    return true;
  }

  gdpr_forget_device_request.send({
    params: objectSpread2_default()({}, activity_state.getParams())
  }).then(function () {
    publish('sdk:gdpr-forget-me');
  });

  return true;
}
/**
 * Start disable of the sdk due to GDPR-Forget-me request
 *
 * @returns {boolean}
 */


function gdpr_forget_device_disable() {
  return disable(REASON_GDPR, true);
}
/**
 * Finish disable of the sdk due to GDRP-Forget-me request
 *
 * @returns {boolean}
 */


function gdpr_forget_device_finish() {
  return disable_finish(REASON_GDPR);
}
/**
 * Check if there is pending GDPR-Forget-Me request
 */


function gdpr_forget_device_check()
/*: void*/
{
  if (disable_status() === 'paused') {
    logger.log(gdpr_forget_device_logMessages.running);
    forget(true);
  }
}
/**
 * Destroy by clearing running request
 */


function gdpr_forget_device_destroy()
/*: void*/
{
  gdpr_forget_device_request.clear();
}


// CONCATENATED MODULE: ./src/sdk/third-party-sharing.js





/*:: type ThirdPartySharingStatusT = 'pending' | 'on' | 'off'*/

/**
 * Log messages used in different scenarios
 *
 * @type {Object}
 * @private
 */
var third_party_sharing_logMessages = {
  running: 'Adjust SDK is running pending third-party sharing opt-out request',
  delayed: 'Adjust SDK will run third-party sharing opt-out request after initialisation',
  pending: 'Adjust SDK already queued third-party sharing opt-out request',
  off: 'Third-party sharing opt-out is already done',
  start: {
    inProgress: 'Third-party sharing opt-out has already started',
    done: 'Third-party sharing opt-out is now started'
  },
  finish: {
    inProgress: 'Third-party sharing opt-out has already finished',
    done: 'Third-party sharing opt-out is now finished'
  }
};
/**
 * Get the status of the third-party sharing
 *
 * @returns {string}
 * @private
 */

function _status()
/*: ThirdPartySharingStatusT*/
{
  var disabled = getThirdPartySharing() || {};

  if (disabled.reason) {
    return disabled.pending ? 'pending' : 'off';
  }

  return 'on';
}
/**
 * Request third-party sharing opt-out request
 *
 * @param {boolean} force
 * @returns {boolean}
 */


function optOut(force
/*: boolean*/
) {
  var status = _status();

  if (!force && status !== 'on') {
    logger.log(third_party_sharing_logMessages[status]);
    return false;
  }

  if (!sdk_config.isInitialised()) {
    logger.log(third_party_sharing_logMessages.delayed);
    return true;
  }

  push({
    url: '/disable_third_party_sharing',
    method: 'POST'
  });
  return true;
}
/**
 * Start or finish thrid-party sharing disable process
 *
 * @param {boolean} pending
 * @param {string} expectedAction
 * @returns {boolean}
 * @private
 */


function third_party_sharing_disable(pending
/*: boolean*/
, expectedAction
/*: 'start' | 'finish'*/
)
/*: boolean*/
{
  var disabled = getThirdPartySharing() || {};
  var action = expectedAction === 'start' && pending ? 'start' : 'finish';
  var shouldNotStart = expectedAction === 'start' && disabled.reason;
  var shouldNotFinish = expectedAction === 'finish' && disabled.reason && !disabled.pending;

  if (shouldNotStart || shouldNotFinish) {
    logger.log(third_party_sharing_logMessages[action].inProgress);
    return false;
  }

  logger.log(third_party_sharing_logMessages[action].done);
  setThirdPartySharing({
    reason: REASON_GENERAL,
    pending: pending
  });
  return true;
}
/**
 * Start the third-party sharing disable process
 *
 * @returns {boolean}
 */


function sdk_third_party_sharing_disable()
/*: boolean*/
{
  return third_party_sharing_disable(true, 'start');
}
/**
 * Finalize the third-party sharing process
 *
 * @returns {boolean}
 */


function third_party_sharing_finish() {
  return third_party_sharing_disable(false, 'finish');
}
/**
 * Check if there s pending third-party sharing opt-out request
 */


function third_party_sharing_check()
/*: void*/
{
  if (_status() === 'pending') {
    logger.log(third_party_sharing_logMessages.running);
    optOut(true);
  }
}


// CONCATENATED MODULE: ./src/sdk/scheduler.js

/*:: type TaskT = {|
  method: (timestamp?: number) => mixed,
  description: string,
  timestamp: number
|}*/

/**
 * Delayed tasks list
 *
 * @type {Array}
 * @private
 */
var _tasks
/*: Array<TaskT>*/
= [];
/**
 * Put the dask in the delayed list
 *
 * @param {Function} method
 * @param {string} description
 */

function delay(method
/*: $PropertyType<TaskT, 'method'>*/
, description
/*: $PropertyType<TaskT, 'description'>*/
)
/*: void*/
{
  _tasks.push({
    method: method,
    description: description,
    timestamp: Date.now()
  });
}
/**
 * Flush all delayed tasks
 */


function flush()
/*: void*/
{
  _tasks.forEach(function (task
  /*: TaskT*/
  ) {
    if (typeof task.method === 'function') {
      logger.log("Delayed ".concat(task.description, " task is running now"));
      task.method(task.timestamp);
    }
  });

  _tasks = [];
}
/**
 * Destroy all pending tasks
 */


function scheduler_destroy()
/*: void*/
{
  _tasks = [];
}


// CONCATENATED MODULE: ./src/sdk/event.js


var event_Promise = typeof Promise === 'undefined' ? __webpack_require__(3).Promise : Promise;
/*:: // 
import { type EventParamsT, type EventRequestParamsT, type GlobalParamsMapT, type GlobalKeyValueParamsT } from './types';*/








/*:: type RevenueT = {
  revenue: string,
  currency: string
}*/

var DEFAULT_EVENT_DEDUPLICATION_LIST_LIMIT = 10;
/**
 * Name of the store used by event deduplication ids
 *
 * @type {string}
 * @private
 */

var event_storeName = 'eventDeduplication';
/**
 * Get revenue value if positive and limit to 5 decimal places
 *
 * @param {number=} revenue
 * @param {string=} currency
 * @returns {Object}
 * @private
 */

function _getRevenue(revenue
/*: number | void*/
, currency
/*: string | void*/
)
/*: RevenueT*/
{
  if (isNaN(revenue)) {
    return {};
  }

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
 * Prepare parameters for the event tracking
 *
 * @param {Object} params
 * @param {string} params.eventToken
 * @param {number=} params.revenue
 * @param {string=} params.currency
 * @param {Array=} params.callbackParams
 * @param {Array=} params.partnerParams
 * @param {Array} callbackParams
 * @param {Array} partnerParams
 * @returns {Object}
 * @private
 */


function event_prepareParams(params
/*: EventParamsT*/
, _ref)
/*: EventRequestParamsT*/
{
  var callbackParams = _ref.callbackParams,
      partnerParams = _ref.partnerParams;
  var globalParams = {};

  var baseParams = objectSpread2_default()({
    eventToken: params.eventToken
  }, _getRevenue(params.revenue, params.currency));

  var eventCallbackParams
  /*: GlobalKeyValueParamsT*/
  = objectSpread2_default()(objectSpread2_default()({}, convertToMap(callbackParams)), convertToMap(params.callbackParams));

  var eventPartnerParams
  /*: GlobalKeyValueParamsT*/
  = objectSpread2_default()(objectSpread2_default()({}, convertToMap(partnerParams)), convertToMap(params.partnerParams));

  if (!isEmpty(eventCallbackParams)) {
    globalParams.callbackParams = eventCallbackParams;
  }

  if (!isEmpty(eventPartnerParams)) {
    globalParams.partnerParams = eventPartnerParams;
  }

  return objectSpread2_default()(objectSpread2_default()({}, baseParams), globalParams);
}
/**
 * Get event deduplication ids
 *
 * @returns {Promise}
 * @private
 */


function _getEventDeduplicationIds()
/*: Promise<Array<string>>*/
{
  return storage_storage.getAll(event_storeName).then(function (records) {
    return records.map(function (record) {
      return record.id;
    });
  });
}
/**
 * Push event deduplication id and trim the store if out of the limit
 *
 * @param {string} id
 * @returns {Promise}
 * @private
 */


function _pushEventDeduplicationId(id
/*: string*/
)
/*: Promise<number>*/
{
  var customLimit = sdk_config.getCustomConfig().eventDeduplicationListLimit;
  var limit = customLimit > 0 ? customLimit : DEFAULT_EVENT_DEDUPLICATION_LIST_LIMIT;
  return storage_storage.count(event_storeName).then(function (count) {
    var chain = event_Promise.resolve();

    if (count >= limit) {
      var removeLength = count - limit + 1;
      logger.log("Event deduplication list limit has been reached. Oldest ids are about to be removed (".concat(removeLength, " of them)"));
      chain = storage_storage.trimItems(event_storeName, removeLength);
    }

    return chain;
  }).then(function () {
    logger.info("New event deduplication id is added to the list: ".concat(id));
    return storage_storage.addItem(event_storeName, {
      id: id
    });
  });
}
/**
 * Check if deduplication id is already stored
 * - if yes then reject
 * - if not then push the id into storage
 *
 * @param {string=} id
 * @returns {Promise}
 * @private
 */


function _checkEventDeduplicationId(id
/*: string*/
)
/*: Promise<?number>*/
{
  if (!id) {
    return event_Promise.resolve();
  }

  return _getEventDeduplicationIds().then(function (list) {
    return list.indexOf(id) === -1 ? _pushEventDeduplicationId(id) : event_Promise.reject({
      message: "Event won't be tracked, since it was previously tracked with the same deduplication id ".concat(id)
    });
  });
}
/**
 * Track event by sending the request to the server
 *
 * @param {Object} params
 * @param {number=} timestamp
 * @return Promise
 */


function event_event(params
/*: EventParamsT*/
, timestamp
/*: number*/
)
/*: void | Promise<void>*/
{
  if (!params || params && (isEmpty(params) || !params.eventToken)) {
    logger.error('You must provide event token in order to track event');
    return;
  }

  return _checkEventDeduplicationId(params.deduplicationId).then(get).then(function (globalParams) {
    push({
      url: '/event',
      method: 'POST',
      params: event_prepareParams(params, globalParams)
    }, {
      timestamp: timestamp
    });
  }).catch(function (error) {
    if (error && error.message) {
      logger.error(error.message);
    }
  });
}
// CONCATENATED MODULE: ./src/sdk/sdk-click.js
/*:: // 
import { type SdkClickRequestParamsT } from './types';*/



/**
 * Check the following:
 * - redirected from somewhere other then client's website
 * - there is adjust_referrer query param
 *
 * @returns {boolean}
 * @private
 */

function _getReferrer()
/*: ?string*/
{
  return window.location.search.substring(1).split('&').map(function (pair) {
    return pair.split('=');
  }).reduce(reducer, {})['adjust_referrer'];
}
/**
 * Prepare params for the sdk click request
 *
 * @param {string} referrer
 * @returns {Object}
 * @private
 */


function sdk_click_prepareParams(referrer)
/*: SdkClickRequestParamsT*/
{
  return {
    clickTime: getTimestamp(),
    source: 'web_referrer',
    referrer: decodeURIComponent(referrer)
  };
}
/**
 * Check if there are parameters to send through sdk_click request
 */


function sdkClick()
/*: void*/
{
  var referrer = _getReferrer();

  if (referrer) {
    push({
      url: '/sdk_click',
      method: 'POST',
      params: sdk_click_prepareParams(referrer)
    });
  }
}
// EXTERNAL MODULE: ./src/sdk/smart-banner/assets/template.html
var template = __webpack_require__(11);
var template_default = /*#__PURE__*/__webpack_require__.n(template);

// EXTERNAL MODULE: ./src/sdk/smart-banner/assets/styles.scss
var styles = __webpack_require__(21);

// CONCATENATED MODULE: ./src/sdk/smart-banner/smart-banner.ts






/**
 * Adjust Web SDK Smart Banner
 */

var smart_banner_SmartBanner = /*#__PURE__*/function () {
  function SmartBanner() {
    classCallCheck_default()(this, SmartBanner);

    defineProperty_default()(this, "parent", void 0);

    defineProperty_default()(this, "banner", void 0);
  }

  createClass_default()(SmartBanner, [{
    key: "getBanners",
    value:
    /**
     * Loads banners from backend if available
     */
    function getBanners(appWebToken
    /*: string*/
    ) {
      return {
        parentId: '',
        image: '',
        header: 'Adjust Smart Banners',
        description: 'Not so smart actually, but deep links do the magic anyway',
        buttonText: 'Let\'s go!'
      };
    }
  }, {
    key: "init",
    value: function init(appWebToken
    /*: string*/
    )
    /*: void*/
    {
      logger.info('Initialise Smart Banner');
      var banner = this.getBanners(appWebToken);
      this.parent = banner.parentId && document.getElementById(banner.parentId) || document.body;
      this.banner = document.createElement('div');
      this.banner.setAttribute('class', 'banner');
      this.banner.innerHTML = template_default.a;
      this.parent.appendChild(this.banner);
    }
  }, {
    key: "showBanner",
    value: function showBanner()
    /*: void*/
    {
      if (this.banner) {
        this.banner.hidden = false;
      } else {
        logger.error('There is no Smart Banner to show, have you called initialisation?');
      }
    }
  }, {
    key: "hideBanner",
    value: function hideBanner()
    /*: void*/
    {
      if (this.banner) {
        this.banner.hidden = true;
      } else {
        logger.error('There is no Smart Banner to hide, have you called initialisation?');
      }
    }
  }]);

  return SmartBanner;
}();

var smartBanner = new smart_banner_SmartBanner();

// CONCATENATED MODULE: ./src/sdk/main.js


var _excluded = ["logLevel", "logOutput"];

var main_Promise = typeof Promise === 'undefined' ? __webpack_require__(3).Promise : Promise;
/*:: // 
import { type InitOptionsT, type LogOptionsT, type EventParamsT, type GlobalParamsT, type CustomErrorT, type ActivityStateMapT } from './types';*/





















/*:: type InitConfigT = $ReadOnly<{|...InitOptionsT, ...LogOptionsT|}>*/

/**
 * In-memory parameters to be used if restarting
 *
 * @type {Object}
 * @private
 */
var main_options
/*: ?InitOptionsT*/
= null;
/**
 * Flag to mark id sdk is in starting process
 *
 * @type {boolean}
 * @private
 */

var _isInitialising
/*: boolean*/
= false;
/**
 * Flag to mark if sdk is started
 *
 * @type {boolean}
 * @private
 */

var _isStarted
/*: boolean*/
= false;
/**
 * Flag to mark if sdk is installed to delay public methods until SDK is ready to perform them
 *
 * @type {boolean}
 * @private
 */

var _isInstalled
/*: boolean*/
= false;
/**
 * Initiate the instance with parameters
 *
 * @param {Object} options
 * @param {string} logLevel
 * @param {string} logOutput
 */

function initSdk()
/*: void*/
{
  var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
      logLevel = _ref.logLevel,
      logOutput = _ref.logOutput,
      options = objectWithoutProperties_default()(_ref, _excluded);

  logger.setLogLevel(logLevel, logOutput);

  if (_isInitialised()) {
    logger.error('You already initiated your instance');
    return;
  }

  if (sdk_config.hasMissing(options)) {
    return;
  }

  _isInitialising = true;
  storage_storage.init(options.namespace).then(function (availableStorage) {
    if (availableStorage.type === STORAGE_TYPES.NO_STORAGE) {
      logger.error('Adjust SDK can not start, there is no storage available');
      return;
    }

    logger.info("Available storage is ".concat(availableStorage.type));
    main_options = objectSpread2_default()({}, options);

    _start(options);
  });
}
/**
 * Track event with already initiated instance
 *
 * @param {Object} params
 */


function trackEvent(params
/*: EventParamsT*/
)
/*: void*/
{
  _preCheck('track event', function (timestamp) {
    return event_event(params, timestamp);
  }, {
    schedule: true,
    stopBeforeInit: true
  });
}
/**
 * Add global callback parameters
 *
 * @param {Array} params
 */


function addGlobalCallbackParameters(params
/*: Array<GlobalParamsT>*/
)
/*: void*/
{
  _preCheck('add global callback parameters', function () {
    return add(params, 'callback');
  });
}
/**
 * Add global partner parameters
 *
 * @param {Array} params
 */


function addGlobalPartnerParameters(params
/*: Array<GlobalParamsT>*/
)
/*: void*/
{
  _preCheck('add global partner parameters', function () {
    return add(params, 'partner');
  });
}
/**
 * Remove global callback parameter by key
 *
 * @param {string} key
 */


function removeGlobalCallbackParameter(key
/*: string*/
)
/*: void*/
{
  _preCheck('remove global callback parameter', function () {
    return remove(key, 'callback');
  });
}
/**
 * Remove global partner parameter by key
 *
 * @param {string} key
 */


function removeGlobalPartnerParameter(key
/*: string*/
)
/*: void*/
{
  _preCheck('remove global partner parameter', function () {
    return remove(key, 'partner');
  });
}
/**
 * Remove all global callback parameters
 */


function clearGlobalCallbackParameters()
/*: void*/
{
  _preCheck('remove all global callback parameters', function () {
    return removeAll('callback');
  });
}
/**
 * Remove all global partner parameters
 */


function clearGlobalPartnerParameters()
/*: void*/
{
  _preCheck('remove all global partner parameters', function () {
    return removeAll('partner');
  });
}
/**
 * Switch offline mode
 */


function switchToOfflineMode()
/*: void*/
{
  _preCheck('set offline mode', function () {
    return setOffline(true);
  });
}
/**
 * Switch online mode
 */


function switchBackToOnlineMode()
/*: void*/
{
  _preCheck('set online mode', function () {
    return setOffline(false);
  });
}
/**
 * Stop SDK
 */


function stop()
/*: void*/
{
  var done = disable();

  if (done && sdk_config.isInitialised()) {
    _shutdown();
  }
}
/**
 * Restart sdk if not GDPR forgotten
 */


function restart()
/*: void*/
{
  var done = restore();

  if (done && main_options) {
    _start(main_options);
  }
}
/**
 * Disable sdk and send GDPR-Forget-Me request
 */


function gdprForgetMe()
/*: void*/
{
  var done = forget();

  if (!done) {
    return;
  }

  done = gdpr_forget_device_disable();

  if (done && sdk_config.isInitialised()) {
    _pause();
  }
}
/**
 * Disable third party sharing
 */


function disableThirdPartySharing()
/*: void*/
{
  _preCheck('disable third-party sharing', _handleDisableThirdPartySharing, {
    schedule: true,
    stopBeforeInit: false
  });
}

function initSmartBanner(_ref2)
/*: void*/
{
  var appWebToken = _ref2.appWebToken;
  smartBanner.init(appWebToken);
}

function showSmartBanner()
/*: void*/
{
  smartBanner.showBanner();
}

function hideSmartBanner()
/*: void*/
{
  smartBanner.hideBanner();
}
/**
 * Handle third party sharing disable
 *
 * @private
 */


function _handleDisableThirdPartySharing()
/*: void*/
{
  var done = optOut();

  if (!done) {
    return;
  }

  sdk_third_party_sharing_disable();
}
/**
 * Handle GDPR-Forget-Me response
 *
 * @private
 */


function _handleGdprForgetMe()
/*: void*/
{
  if (disable_status() !== 'paused') {
    return;
  }

  gdpr_forget_device_finish();

  main_Promise.all([identity_clear(), global_params_clear(), queue_clear()]).then(main_destroy);
}
/**
 * Check if sdk initialisation was started
 *
 * @private
 */


function _isInitialised()
/*: boolean*/
{
  return _isInitialising || sdk_config.isInitialised();
}
/**
 * Pause sdk by canceling:
 * - queue execution
 * - session watch
 * - attribution listener
 *
 * @private
 */


function _pause()
/*: void*/
{
  _isInitialising = false;
  _isStarted = false;
  scheduler_destroy();
  queue_destroy();
  session_destroy();
  attribution_destroy();
}
/**
 * Shutdown all dependencies
 * @private
 */


function _shutdown(async)
/*: void*/
{
  if (async) {
    logger.log('Adjust SDK has been shutdown due to asynchronous disable');
  }

  _pause();

  pub_sub_destroy();
  identity_destroy();
  listeners_destroy();
  storage_storage.destroy();
  sdk_config.destroy();
}
/**
 * Destroy the instance
 *
 * @private
 */


function main_destroy()
/*: void*/
{
  _isInstalled = false;

  _shutdown();

  gdpr_forget_device_destroy();
  main_options = null;
  logger.log('Adjust SDK instance has been destroyed');
}
/**
 * Check the sdk status and proceed with certain actions
 *
 * @param {Object} activityState
 * @returns {Promise|boolean}
 * @private
 */


function main_continue(activityState
/*: ActivityStateMapT*/
)
/*: Promise<void>*/
{
  logger.log("Adjust SDK is starting with web_uuid set to ".concat(activityState.uuid));
  var isInstalled = activity_state.current.installed;
  gdpr_forget_device_check();

  if (!isInstalled) {
    third_party_sharing_check();
  }

  var sdkStatus = disable_status();

  var message = function message(rest) {
    return "Adjust SDK start has been interrupted ".concat(rest);
  };

  if (sdkStatus === 'off') {
    _shutdown();

    return main_Promise.reject({
      interrupted: true,
      message: message('due to complete async disable')
    });
  }

  if (sdkStatus === 'paused') {
    _pause();

    return main_Promise.reject({
      interrupted: true,
      message: message('due to partial async disable')
    });
  }

  if (_isStarted) {
    return main_Promise.reject({
      interrupted: true,
      message: message('due to multiple synchronous start attempt')
    });
  }

  run({
    cleanUp: true
  });
  return watch().then(function () {
    _isInitialising = false;
    _isStarted = true;

    if (isInstalled) {
      _handleSdkInstalled();

      third_party_sharing_check();
    }
  });
}
/**
 * Handles SDK installed and runs delayed tasks
 */


function _handleSdkInstalled() {
  _isInstalled = true;
  flush();
  unsubscribe('sdk:installed');
}
/**
 * Handle error coming from the chain of commands
 *
 * @param {Object|Error} error
 * @private
 */


function main_error(error
/*: CustomErrorT | Error*/
) {
  if (error.interrupted) {
    logger.log(error.message);
    return;
  }

  _shutdown();

  logger.error('Adjust SDK start has been canceled due to an error', error);

  if (error.stack) {
    throw error;
  }
}
/**
 * Start the execution by preparing the environment for the current usage
 * - prepares mandatory parameters
 * - register some global event listeners (online, offline events)
 * - subscribe to a GDPR-Forget-Me request event
 * - subscribe to the attribution change event
 * - register activity state if doesn't exist
 * - run pending GDPR-Forget-Me if pending
 * - run the package queue if not empty
 * - start watching the session
 *
 * @param {Object} options
 * @param {string} options.appToken
 * @param {string} options.environment
 * @param {string=} options.defaultTracker
 * @param {string=} options.externalDeviceId
 * @param {string=} options.customUrl
 * @param {number=} options.eventDeduplicationListLimit
 * @param {Function=} options.attributionCallback
 * @private
 */


function _start(options
/*: InitOptionsT*/
)
/*: void*/
{
  if (disable_status() === 'off') {
    logger.log('Adjust SDK is disabled, can not start the sdk');
    return;
  }

  sdk_config.set(options);
  register();
  subscribe('sdk:installed', _handleSdkInstalled);
  subscribe('sdk:shutdown', function () {
    return _shutdown(true);
  });
  subscribe('sdk:gdpr-forget-me', _handleGdprForgetMe);
  subscribe('sdk:third-party-sharing-opt-out', third_party_sharing_finish);
  subscribe('attribution:check', function (e, result) {
    return check(result);
  });

  if (typeof options.attributionCallback === 'function') {
    subscribe('attribution:change', options.attributionCallback);
  }

  identity_start().then(main_continue).then(sdkClick).catch(main_error);
}
/**
 * Check if it's possible to run provided method
 *
 * @param {string} description
 * @param {Function} callback
 * @param {boolean=false} schedule
 * @private
 */


function _preCheck(description
/*: string*/
, callback
/*: () => mixed*/
) {
  var _ref3 = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {},
      schedule = _ref3.schedule,
      stopBeforeInit = _ref3.stopBeforeInit;

  if (storage_storage.getType() === STORAGE_TYPES.NO_STORAGE) {
    logger.log("Adjust SDK can not ".concat(description, ", no storage available"));
    return;
  }

  if (disable_status() !== 'on') {
    logger.log("Adjust SDK is disabled, can not ".concat(description));
    return;
  }

  if (schedule && stopBeforeInit && !_isInitialised()) {
    logger.error("Adjust SDK can not ".concat(description, ", sdk instance is not initialized"));
    return;
  }

  if (typeof callback === 'function') {
    if (schedule && !(_isInstalled && _isStarted) && (stopBeforeInit || _isInitialised())) {
      delay(callback, description);
      logger.log("Running ".concat(description, " is delayed until Adjust SDK is up"));
    } else {
      callback();
    }
  }
}

function _clearDatabase() {
  return storage_storage.deleteDatabase();
}

var Adjust = {
  initSdk: initSdk,
  trackEvent: trackEvent,
  addGlobalCallbackParameters: addGlobalCallbackParameters,
  addGlobalPartnerParameters: addGlobalPartnerParameters,
  removeGlobalCallbackParameter: removeGlobalCallbackParameter,
  removeGlobalPartnerParameter: removeGlobalPartnerParameter,
  clearGlobalCallbackParameters: clearGlobalCallbackParameters,
  clearGlobalPartnerParameters: clearGlobalPartnerParameters,
  switchToOfflineMode: switchToOfflineMode,
  switchBackToOnlineMode: switchBackToOnlineMode,
  stop: stop,
  restart: restart,
  gdprForgetMe: gdprForgetMe,
  disableThirdPartySharing: disableThirdPartySharing,
  initSmartBanner: initSmartBanner,
  showSmartBanner: showSmartBanner,
  hideSmartBanner: hideSmartBanner,
  __testonly__: {
    destroy: main_destroy,
    clearDatabase: _clearDatabase
  }
};
/* harmony default export */ var main = __webpack_exports__["default"] = (Adjust);

/***/ })
/******/ ])["default"];
});