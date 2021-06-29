module.exports = {
  testMatch: [
    '<rootDir>/src/sdk/**/?(*.)(spec|test).{js,ts}'
  ],
  transform: {
    '^.+\\.(js|ts)$': 'babel-jest',
    "^.+\\.html?$": "html-loader-jest",
  },
  coveragePathIgnorePatterns: [
    '<rootDir>/node_modules/',
    '<rootDir>/src/sdk/__tests__/_utils.js',
    '<rootDir>/src/sdk/__tests__/_matchers.js',
    '<rootDir>/src/sdk/__tests__/main/main.suite.js',
    '<rootDir>/src/sdk/__tests__/storage/storage.suite.js'
  ],
  setupFiles: [
    'jest-localstorage-mock',
    '<rootDir>/src/sdk/__tests__/_utils.js'
  ],
  setupFilesAfterEnv: [
    '<rootDir>/src/sdk/__tests__/_matchers.js'
  ],
  moduleNameMapper: {
    "\.(css|scss)$": "<rootDir>/src/sdk/__mocks__/style.js"
  },
  globals: {
    __ADJUST__NAMESPACE: 'adjust-sdk',
    __ADJUST__SDK_VERSION: 'TEST'
  }
}
