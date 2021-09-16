### Version 5.2.1 (16th September 2021)
#### Fixed
- Fixed top-level Typescript declarations.

---

### Version 5.2.0 (3rd August 2021)
#### Added
- [beta] Smart banners.

---

### Version 5.1.2 (11th June 2021)
#### Added
- Added Typescript support.
- Added URL strategy with retries when request are being blocked by firewall.
- Added custom storage namespace.

#### Fixed
- Fixed issue with using IndexedDb in cross-origin iframe in Safari.

---

### Version 5.1.1 (14th December 2020)
#### Added
- Added `warning` log level to make non-critical issues look less frightening.

#### Fixed
- Fixed state synchronization issues between multiple tabs.
- Fixed issue with switching the SDK offline and online which could cause requests loss.

---

### Version 5.1.0 (5th August 2020)
#### Added
- Added external device ID support.

#### Fixed
- Fixed SDK initialization in IE11.

---

### Version 5.0.0 (15th May 2020)
#### Added
- New major SDK update.
- Added SDK exposure under all module definitions, so it works under **CommonJS** and **AMD** environments and is also available through global `Adjust` when loaded through **cdn**.
- Added attribution callback support.
- Added retry mechanism for failed attribution requests.
- Added HTTP request queueing with retry mechanism.
- Added usage of **indexedDB** with **localStorage** as a fallback.
- Added global callback and partner parameters, along with removal of previously set ones.
- Added offline mode.
- Added possibility to set the log level on init and optionally specify log container.
- Added SDK stop and restart possibility.
- Added GDPR forget me ability.
- Added ability to define default tracker through configuration.
- Added sending of `sdk_click` package when referrer is available.
- Added traffic redirection possibility.
- Added event deduplication.
- Added disable third party sharing option.

#### Changed
- Switched to using exposed single instance instead of initiating it manually with the `new` (`Adjust.initSdk(YOUR_CONFIG)`).
- Automated session tracking, method `trackSession` is no longer available.
