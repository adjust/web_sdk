module.exports = {
  testMatch: [
    '<rootDir>/src/sdk/**/?(*.)(spec|test).{js,jsx}'
  ],
  transform: {
    '^.+\\.(js|jsx)$': 'babel-jest'
  },
  coveragePathIgnorePatterns: [
    '<rootDir>/node_modules/',
    '<rootDir>/src/sdk/__tests__/_utils.js',
    '<rootDir>/src/sdk/__tests__/main/main.suite.js',
    '<rootDir>/src/sdk/__tests__/storage/storage.suite.js'
  ],
  setupFiles: [
    'jest-localstorage-mock',
    '<rootDir>/src/sdk/__tests__/_utils.js'
  ],
  globals: {
    __ADJUST__NAMESPACE: 'adjust-sdk',
    __ADJUST__SDK_VERSION: 'TEST',
    __ADJUST__ENV: 'test'
  }
}
