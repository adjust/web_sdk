# Changelog
Here you can find changes for this project. When updating to a new version be sure to go through the list in order to understand what's new and what changed.

## [Unreleased]
### Added
- sdk is now exposed under all module definitions, so it works under CommonJS and AMD environments and is also available through global `Adjust` when loaded through cdn
- attribution callback support 
- retry mechanism for failed attribution requests 
- http request queueing with retry mechanism
- use of **indexedDB** with **localStorage** as a fallback
- settings global callback and partner parameters, along with removal of previously set ones
- offline mode
- possibility to set the log level on init and optionally specify log container
- disable/enable sdk
- GDPR Forget Me ability
- ability to define default tracker through configuration
- sdk click when referrer available
- traffic redirection
- event deduplication

### Changed
- using exposed single instance instead of initiating it manually with the `new` (`Adjust.init(YOUR_CONFIG)`)
- session is now automatically tracked, method `trackSession` is no longer available

[example-app]:  src/index.js
[Unreleased]: https://github.com/adjust/web_sdk_dev/pull/1
