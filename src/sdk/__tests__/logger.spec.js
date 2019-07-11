import * as Logger from '../logger'

describe('test Logger functionality', () => {

  beforeAll(() => {
    jest.spyOn(console, 'log').mockImplementation(() => {})
    jest.spyOn(console, 'info').mockImplementation(() => {})
    jest.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  afterAll(() => {
    global.__ADJUST__ENV = 'test'
    Logger.default.setLogLevel()
  })

  it('prints info/error message when changing log level', () => {

    Logger.default.setLogLevel()
    expect(console.info).toHaveBeenLastCalledWith('[adjust-sdk]', 'INFO:', 'Log level set to verbose')

    Logger.default.setLogLevel('error')
    expect(console.info).toHaveBeenLastCalledWith('[adjust-sdk]', 'INFO:', 'Log level set to error')

    Logger.default.setLogLevel('not-existing-level')
    expect(console.error).toHaveBeenLastCalledWith('[adjust-sdk]', 'ERROR:', 'You must set one of the available log levels: verbose, info, error or none')

    Logger.default.setLogLevel()
  })

  it('prints multiple messages passed to each method', () => {

    Logger.default.log('Some', 'message')
    expect(console.log).toHaveBeenCalledWith('[adjust-sdk]', 'LOG:', 'Some', 'message')

    Logger.default.info('Some', 'info')
    expect(console.info).toHaveBeenCalledWith('[adjust-sdk]', 'INFO:', 'Some', 'info')

    Logger.default.error('Some', 'error', 'message')
    expect(console.error).toHaveBeenCalledWith('[adjust-sdk]', 'ERROR:', 'Some', 'error', 'message')

  })

  describe('verbose log level by default in test environment', () => {

    it('prints verbose messages', () => {
      Logger.default.log('Some message with looooong explanation')
      expect(console.log).toHaveBeenCalledWith('[adjust-sdk]', 'LOG:', 'Some message with looooong explanation')

    })

    it('prints info messages', () => {
      Logger.default.info('Some message')
      expect(console.info).toHaveBeenCalledWith('[adjust-sdk]', 'INFO:', 'Some message')
    })

    it('prints error messages', () => {
      Logger.default.error('Some error message')
      expect(console.error).toHaveBeenCalledWith('[adjust-sdk]', 'ERROR:', 'Some error message')
    })

  })

  describe('verbose log level by default in development environment', () => {

    beforeAll(() => {
      global.__ADJUST__ENV = 'development'
      Logger.default.setLogLevel()
    })

    afterAll(() => {
      global.__ADJUST__ENV = 'test'
    })

    it('prints verbose messages', () => {
      Logger.default.log('Some message with looooong explanation')
      expect(console.log).toHaveBeenCalledWith('[adjust-sdk]', 'LOG:', 'Some message with looooong explanation')

    })

    it('prints info messages', () => {
      Logger.default.info('Some message')
      expect(console.info).toHaveBeenCalledWith('[adjust-sdk]', 'INFO:', 'Some message')
    })

    it('prints error messages', () => {
      Logger.default.error('Some error message')
      expect(console.error).toHaveBeenCalledWith('[adjust-sdk]', 'ERROR:', 'Some error message')
    })

  })

  describe('error log level by default in production environment', () => {

    beforeAll(() => {
      global.__ADJUST__ENV = 'production'
      Logger.default.setLogLevel()
    })

    afterAll(() => {
      global.__ADJUST__ENV = 'test'
    })

    it('does not print verbose messages', () => {
      Logger.default.log('Some message with looooong explanation')
      expect(console.log).not.toHaveBeenCalled()

    })

    it('does not print info messages', () => {
      Logger.default.info('Some message')
      expect(console.info).not.toHaveBeenCalled()
    })

    it('prints error messages', () => {
      Logger.default.error('Some error message')
      expect(console.error).toHaveBeenCalledWith('[adjust-sdk]', 'ERROR:', 'Some error message')
    })

  })

  describe('explicit verbose log level', () => {

    beforeAll(() => {
      Logger.default.setLogLevel('verbose')
    })

    it('prints verbose messages', () => {
      Logger.default.log('Some message with looooong explanation')
      expect(console.log).toHaveBeenCalledWith('[adjust-sdk]', 'LOG:', 'Some message with looooong explanation')

    })

    it('prints info messages', () => {
      Logger.default.info('Some message')
      expect(console.info).toHaveBeenCalledWith('[adjust-sdk]', 'INFO:', 'Some message')
    })

    it('prints error messages', () => {
      Logger.default.error('Some error message')
      expect(console.error).toHaveBeenCalledWith('[adjust-sdk]', 'ERROR:', 'Some error message')
    })

  })

  describe('explicit info log level', () => {

    beforeAll(() => {
      Logger.default.setLogLevel('info')
    })

    it('does not print verbose messages', () => {
      Logger.default.log('Some message with looooong explanation')
      expect(console.log).not.toHaveBeenCalled()

    })

    it('prints info messages', () => {
      Logger.default.info('Some message')
      expect(console.info).toHaveBeenCalledWith('[adjust-sdk]', 'INFO:', 'Some message')
    })

    it('prints error messages', () => {
      Logger.default.error('Some error message')
      expect(console.error).toHaveBeenCalledWith('[adjust-sdk]', 'ERROR:', 'Some error message')
    })

  })

  describe('explicit error log level', () => {

    beforeAll(() => {
      Logger.default.setLogLevel('error')
    })

    it('does not print verbose messages', () => {
      Logger.default.log('Some message with looooong explanation')
      expect(console.log).not.toHaveBeenCalled()

    })

    it('does not print info messages', () => {
      Logger.default.info('Some message')
      expect(console.log).not.toHaveBeenCalled()
    })

    it('prints error messages', () => {
      Logger.default.error('Some error message')
      expect(console.error).toHaveBeenCalledWith('[adjust-sdk]', 'ERROR:', 'Some error message')
    })

  })

  describe('explicit none log level', () => {

    beforeAll(() => {
      Logger.default.setLogLevel('none')
    })

    it('does not print verbose messages', () => {
      Logger.default.log('Some message with looooong explanation')
      expect(console.log).not.toHaveBeenCalled()

    })

    it('does not print info messages', () => {
      Logger.default.info('Some message')
      expect(console.log).not.toHaveBeenCalled()
    })

    it('prints error messages', () => {
      Logger.default.error('Some error message')
      expect(console.error).not.toHaveBeenCalled()
    })

  })

})
