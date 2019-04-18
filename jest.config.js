module.exports = {
  testMatch: [
    '<rootDir>/src/sdk/**/?(*.)(spec|test).{js,jsx}'
  ],
  transform: {
    '^.+\\.(js|jsx)$': 'babel-jest'
  },
  setupFiles: ['jest-localstorage-mock'],
  globals: {
    __ADJUST__NAMESPACE: 'adjust-sdk',
    __ADJUST__SDK_VERSION: 'TEST',
    __ADJUST__ENV: 'test'
  }
}
