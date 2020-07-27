// @flow
declare var __ADJUST__NAMESPACE: string
declare var __ADJUST__SDK_VERSION: string
declare var process: {|
  env: {|
    NODE_ENV: 'development' | 'production' | 'test'
  |}
|}

const Globals = {
  namespace: __ADJUST__NAMESPACE || 'adjust-sdk',
  version: __ADJUST__SDK_VERSION || '5.0.0',
  env: process.env.NODE_ENV
}

export default Globals
