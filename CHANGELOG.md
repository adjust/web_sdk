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
