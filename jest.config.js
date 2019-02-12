module.exports = {
  testMatch: [
    "<rootDir>/src/sdk/**/?(*.)(spec|test).{js,jsx}"
  ],
  transform: {
    '^.+\\.(js|jsx)$': 'babel-jest'
  },
  setupFiles: ["jest-localstorage-mock"],
  globals: {
    SDK_VERSION: 'TEST',
    IS_TEST: true
  }
};
