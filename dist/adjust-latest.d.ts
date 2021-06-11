// Type definitions for Adjust Web SDK

interface GlobalParams {
  key: string;
  value: string;
}

interface EventParams {

  /** Required, make sure to provide valid event token. */
  eventToken: string;

  /** Optional. In case you want to attach revenue to an event (for example you would like to track some purchase that
   * happened inside your web app) then you need to provide positive value for this param.
   *
   * **Important**: it's mandatory to provide `currency` if you use this one. */
  revenue?: number;

  /** Optional. Should be a valid currency code like `EUR`, `USD` and so on.
   *
   * @example
   * Adjust.trackEvent({
   *   // ... other params go here, including mandatory ones
   *   revenue: 110,
   *   currency: 'EUR'
   *  })
   * */
  currency?: string;

  /** Optional. It's an event deduplication id in order to avoid tracking duplicated events. Deduplication list limit
   * is set with {@link InitOptions.eventDeduplicationListLimit} parameter passed to `Adjust.initSdk` method*/
  deduplicationId?: string;

  /** Optional. You can register a callback URL for your events in your dashboard. We will send a GET request to that
   * URL whenever the event is tracked. You can add callback parameters to that event by adding `callbackParams`
   * parameter to the map object passed to `trackEvent` method. We will then append these parameters to your callback URL.
   *
   * @example For example, suppose you have registered the URL `https://www.mydomain.com/callback` then track an event like this:
   * Adjust.trackEvent({
   *   // ... other params go here, including mandatory ones
   *   callbackParams: [
   *     {key: 'key', value: 'value'},
   *     {key: 'foo', value: 'bar'}
   *   ]
   * })
   *
   * In that case we would track the event and send a request to `https://www.mydomain.com/callback?key=value&foo=bar`.
   *
   * Please note that we do not store any of your custom parameters, but only append them to your callbacks, thus
   * without a callback they will not be saved nor sent to you. */
  callbackParams?: Array<GlobalParams>;

  /** Optional. You can also add parameters to be transmitted to network partners, which have been activated in your
   * Adjust dashboard. This works similarly to the callback parameters.
   *
   * @example
   * Adjust.trackEvent({
   *   // ... other params go here, including mandatory ones
   *   partnerParams: [
   *     {key: 'key', value: 'value'},
   *     {key: 'foo', value: 'bar'}
   *   ]
   * })
   * */
  partnerParams?: Array<GlobalParams>;
}

interface InitOptions {

  /** Required to initialise SDK instance, please make sure to provide valid app token. */
  appToken: string;

  /** Required to initialise SDK instance, available options are `production` or `sandbox`. Use `sandbox` in case you
   * are testing the SDK locally with your web app. */
  environment: 'production' | 'sandbox';

  /** Optional. By default, users who are not attributed to any campaigns will be attributed to the Organic tracker of
   * the app. If you want to overwrite this behaviour and attributed this type of traffic under a different tracker,
   * you can use this method to set a different default tracker. */
  defaultTracker?: string;

  /** Optional. */
  externalDeviceId?: string;

  /** Optional. By default all requests go to Adjust's endpoints. You are able to redirect all requests to your custom
   * endpoint. */
  customUrl?: string;

  /** Optional. By default this param is set to `10`. It is possible to override this limit but make sure that it is a
   * positive number and not too big. This will cache last `n` deduplication ids (defined by this param) and use them
   * to deduplicate events with repeating ids. */
  eventDeduplicationListLimit?: number;

  /** Optional. */
  urlStrategy?: 'india' | 'china';

  /**
   * Optional. A custom namespace for SDK data storage. If not set then default one is used.
   * It's useful when there are multiple applications on the same domain to allow SDK distinguish storages and don't
   * mix the data up.
   *
   * Please note it's possible to set custom namespace for existing default-named storage, all data will be preserved
   * and moved to the custom namespace. Once custom namespace is set it's not possible to rename it or undo without
   * data loss.
   */
  namespace?: string;

  /** Optional. This is a callback function for the attribution change. Two arguments are provided to the callback,
   * first one is an internal event name (can be ignored), and the other one is the Object which holds information
   * about the changed attribution.
   *
   * @example
   * Adjust.initSdk({
   *   // ... other params go here, including mandatory ones
   *   attributionCallback: function (e, attribution) {
   *     // e: internal event name, can be ignored
   *     // attribution: details about the changed attribution
   *   }
   * }); */
  attributionCallback?: (e: string, attribution: Object) => any;

  /** Optional. Logging level used by SDK instance. By default this param is set to `error`. We highly recommend that
   * you use `verbose` when testing in order to see precise logs and to make sure integration is done properly.
   * Here are more details about each log level:
   * - `verbose` - will print detailed messages in case of certain actions
   * - `info` - will print only basic info messages, warnings and errors
   * - `warning` - will print only warning and error messages
   * - `error` - will print only error message
   * - `none` - won't print anything
   */
  logLevel?: 'none' | 'error' | 'warning' | 'info' | 'verbose';

  /**
   * Optional. Query selector to define html container if you want to see your logs directly on the screen. This could
   * be useful when testing on mobile devices.
   *
   * @example
   * Adjust.initSdk({
   *   // ... other params go here, including mandatory ones
   *   logOutput: '#output'
   * }); */
  logOutput?: string;
}

/**
 * Initiate the instance with options object, should be called as soon as possible
 *
 * @param {InitOptions} options Options to initiate the SDK instance.
 *
 * @example
 * Adjust.initSdk({
 *   appToken: 'YOUR_APP_TOKEN',
 *   environment: 'production',
 *   logLevel: 'info'
 * });
 */
function initSdk({ logLevel, logOutput, ...options }: InitOptions): void

/**
 * Track event with already initiated Adjust SDK instance
 *
 * @param {EventParams} params Parameters of event to be tracked.
 *
 * @example
 * Adjust.trackEvent({
 *   eventToken: 'YOUR_EVENT_TOKEN',
 *   revenue: 111,
 *   currency: 'EUR',
 *   callbackParams: [
 *     {key: 'some-key-1', value: 'some-value-1'},
 *     {key: 'some-key-2', value: 'some-value-2'},
 *     {key: 'key1', value: 'new-value1'}
 *   ],
 *   partnerParams: [
 *     {key: 'key-1', value: 'new-value-1'},
 *     {key: 'some-partner-key-1', value: 'some-partner-value-1'},
 *     {key: 'key-2', value: 'new-value-2'},
 *     {key: 'some-partner-key-2', value: 'some-partner-value-2'},
 *     {key: 'some-partner-key-1', value: 'some-partner-value-3'}
 *   ]
 * });
 */
function trackEvent(params: EventParams): void

/**
 * Add global callback parameters
 *
 * Global callback parameters will be appended automatically to each session and event request. Note that callback
 * params passed directly to `trackEvent` method will override existing global callback params.
 *
 * @example
 * Adjust.addGlobalCallbackParameters([
 *   {key: 'key1', value: 'value1'},
 *   {key: 'key2', value: 'value2'}
 * ]);
 *
 * @param {Array} params
 */
function addGlobalCallbackParameters(params: Array<GlobalParams>): void

/**
 * Add global partner parameters
 *
 * Global partner parameters will be appended automatically to each session and event request. Note that partner
 * params passed directly to `trackEvent` method will override existing global partner params.
 *
 * @example
 * Adjust.addGlobalPartnerParameters([
 *   {key: 'key1', value: 'value1'},
 *   {key: 'key2', value: 'value2'}
 * ]);
 *
 * @param {Array} params
 */
function addGlobalPartnerParameters(params: Array<GlobalParams>): void

/**
 * Remove global callback parameter by key
 *
 * To remove particular callback parameter use this method by providing the key of a global callback param which needs
 * to be removed.
 *
 * @example
 * Adjust.removeGlobalCallbackParameter('key1');
 *
 * @param {string} key
 */
function removeGlobalCallbackParameter(key: string): void

/**
 * Remove global partner parameter by key
 *
 * To remove particular partner parameter use this method by providing the key of a global partner param which needs
 * to be removed.
 *
 * @example
 * Adjust.removeGlobalPartnerParameter('key1');
 *
 * @param {string} key
 */
function removeGlobalPartnerParameter(key: string): void

/**
 * Remove all global callback parameters
 */
function clearGlobalCallbackParameters(): void

/**
 * Remove all global partner parameters
 */
function clearGlobalPartnerParameters(): void

/**
 * Switch offline mode
 */
function switchToOfflineMode(): void

/**
 * Switch online mode
 */
function switchBackToOnlineMode(): void

/**
 * Stop SDK
 *
 * To completely stop the SDK from running in certain situations. This means that SDK will stop tracking sessions and
 * events and in general will stop working entirely. But it's possible to restart it after some time with
 * `Adjust.restart()` method.
 */
function stop(): void

/**
 * Restart sdk if not GDPR forgotten
 */
function restart(): void

/**
 * Disable sdk and send GDPR-Forget-Me request
 *
 * This method will stop Adjust SDK from running and will notify adjust backend that user wants to be GDPR forgotten.
 * Once this method is run it's not possible to restart Adjust SDK anymore.
 */
function gdprForgetMe(): void

/**
 * Disable third party sharing
 *
 * Marketing Opt-out, which is disabling third-party sharing ability. This method will notify our backed in the same
 * manner as it does for GDPR Forget me.
 */
function disableThirdPartySharing(): void

const Adjust = {
  initSdk,
  trackEvent,
  addGlobalCallbackParameters,
  addGlobalPartnerParameters,
  removeGlobalCallbackParameter,
  removeGlobalPartnerParameter,
  clearGlobalCallbackParameters,
  clearGlobalPartnerParameters,
  switchToOfflineMode,
  switchBackToOnlineMode,
  stop,
  restart,
  gdprForgetMe,
  disableThirdPartySharing
}

export default Adjust
