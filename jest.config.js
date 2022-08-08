module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  testMatch: [
    '<rootDir>/src/sdk/**/?(*.)(spec|test).{js,ts}'
  ],
  transform: {
    '^.+\\.js$': 'babel-jest',
  },
  coveragePathIgnorePatterns: [
    '<rootDir>/node_modules/',
    '<rootDir>/src/sdk/__tests__/_setup/_utils.js',
    '<rootDir>/src/sdk/__tests__/_setup/_matchers.js',
    '<rootDir>/src/sdk/__tests__/_setup/global.d.ts',
    '<rootDir>/src/sdk/__tests__/main/main.suite.js',
    '<rootDir>/src/sdk/__tests__/storage/storage.suite.js'
  ],
  setupFiles: [
    'jest-localstorage-mock',
    '<rootDir>/src/sdk/__tests__/_setup/_utils.js',
    '<rootDir>/src/sdk/__tests__/_setup/global.d.ts',
  ],
  setupFilesAfterEnv: [
    '<rootDir>/src/sdk/__tests__/_setup/_matchers.js'
  ],
  moduleNameMapper: {
    "\.(css|scss)$": "<rootDir>/src/sdk/__mocks__/style.js"
  },
  globals: {
    __ADJUST__NAMESPACE: 'adjust-sdk',
    __ADJUST__SDK_VERSION: 'TEST'
  }
}
