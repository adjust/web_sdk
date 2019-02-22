# Changelog
Here you can find changes for this project. When updating to a new version be sure to go through the list in order to understand what's new and what changed.

## [Unreleased]
### Added
- sdk is now exposed under all module definitions, so it works under CommonJS and AMD environments and is also available through global `adjustSDK`
- attribution callback support 

### Changed
- using exposed single instance instead of initiating it manually with the `new` (`adjustSDK.init(YOUR_CONFIG)`)
- using promises instead of callbacks in general (refer to [example app](#example-app)) 

[example-app]:  src/index.js
[Unreleased]: https://github.com/adjust/web_sdk_dev/pull/1
