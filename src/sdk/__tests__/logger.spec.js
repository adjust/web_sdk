/* eslint-disable */
const _origDate = global.Date

describe('test Logger functionality', () => {
  const today = '2019-10-14T00:00:00.000Z'

  beforeAll(() => {
    jest.spyOn(console, 'log').mockImplementation(() => {})
    jest.spyOn(console, 'info').mockImplementation(() => {})
    jest.spyOn(console, 'warn').mockImplementation(() => {})
    jest.spyOn(console, 'error').mockImplementation(() => {})

    Utils.mockDate(new Date(2019, 9, 14))
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  afterAll(() => {
    global.Date = _origDate
  })

  describe('default behaviour', () => {
    jest.isolateModules(() => {
      const Logger = require('../logger')

      it('prints info/error message when changing log level', () => {

        Logger.default.setLogLevel()
        expect(console.info).toHaveBeenLastCalledWith('[adjust-sdk]', today, 'INFO: ', 'Log level set to verbose')

        Logger.default.setLogLevel('error')
        expect(console.info).toHaveBeenLastCalledWith('[adjust-sdk]', today, 'INFO: ', 'Log level set to error')

        Logger.default.setLogLevel('not-existing-level')
        expect(console.error).toHaveBeenLastCalledWith('[adjust-sdk]', today, 'ERROR:', 'You must set one of the available log levels: verbose, info, warning, error or none')

        Logger.default.setLogLevel()
      })

      it('prints multiple messages passed to each method', () => {

        Logger.default.log('Some', 'message')
        expect(console.log).toHaveBeenCalledWith('[adjust-sdk]', today, 'LOG:  ', 'Some', 'message')

        Logger.default.info('Some', 'info')
        expect(console.info).toHaveBeenCalledWith('[adjust-sdk]', today, 'INFO: ', 'Some', 'info')

        Logger.default.warn('Some', 'warning', 'message')
        expect(console.warn).toHaveBeenCalledWith('[adjust-sdk]', today, 'WARN: ', 'Some', 'warning', 'message')

        Logger.default.error('Some', 'error', 'message')
        expect(console.error).toHaveBeenCalledWith('[adjust-sdk]', today, 'ERROR:', 'Some', 'error', 'message')

      })
    })
  })

  describe('verbose log level by default in test environment', () => {
    jest.isolateModules(() => {
      const Logger = require('../logger')

      it('prints verbose messages', () => {
        Logger.default.log('Some message with looooong explanation')
        expect(console.log).toHaveBeenCalledWith('[adjust-sdk]', today, 'LOG:  ', 'Some message with looooong explanation')

      })

      it('prints info messages', () => {
        Logger.default.info('Some message')
        expect(console.info).toHaveBeenCalledWith('[adjust-sdk]', today, 'INFO: ', 'Some message')
      })

      it('prints warning messages', () => {
        Logger.default.warn('Some warning')
        expect(console.warn).toHaveBeenCalledWith('[adjust-sdk]', today, 'WARN: ', 'Some warning')
      })

      it('prints error messages', () => {
        Logger.default.error('Some error message')
        expect(console.error).toHaveBeenCalledWith('[adjust-sdk]', today, 'ERROR:', 'Some error message')
      })
    })
  })

  describe('verbose log level by default in development environment', () => {
    jest.isolateModules(() => {
      global.process.env.NODE_ENV = 'development'
      const Logger = require('../logger')

      beforeAll(() => {
        Logger.default.setLogLevel()
      })

      it('prints verbose messages', () => {
        Logger.default.log('Some message with looooong explanation')
        expect(console.log).toHaveBeenCalledWith('[adjust-sdk]', today, 'LOG:  ', 'Some message with looooong explanation')

      })

      it('prints info messages', () => {
        Logger.default.info('Some message')
        expect(console.info).toHaveBeenCalledWith('[adjust-sdk]', today, 'INFO: ', 'Some message')
      })

      it('prints warning messages', () => {
        Logger.default.warn('Some warning')
        expect(console.warn).toHaveBeenCalledWith('[adjust-sdk]', today, 'WARN: ', 'Some warning')
      })

      it('prints error messages', () => {
        Logger.default.error('Some error message')
        expect(console.error).toHaveBeenCalledWith('[adjust-sdk]', today, 'ERROR:', 'Some error message')
      })
    })
  })

  describe('error log level by default in production environment', () => {
    jest.isolateModules(() => {
      global.process.env.NODE_ENV = 'production'
      const Logger = require('../logger')

      beforeAll(() => {
        Logger.default.setLogLevel()
      })

      it('does not print verbose messages', () => {
        Logger.default.log('Some message with looooong explanation')
        expect(console.log).not.toHaveBeenCalled()

      })

      it('does not print info messages', () => {
        Logger.default.info('Some message')
        expect(console.info).not.toHaveBeenCalled()
      })

      it('does not print warning messages', () => {
        Logger.default.warn('Some warning')
        expect(console.warn).not.toHaveBeenCalled()
      })

      it('prints error messages', () => {
        Logger.default.error('Some error message')
        expect(console.error).toHaveBeenCalledWith('[adjust-sdk]', today, 'ERROR:', 'Some error message')
      })
    })
  })

  describe('error log level by default in unknown environment', () => {
    jest.isolateModules(() => {
      const Logger = require('../logger')

      beforeAll(() => {
        Logger.default.setLogLevel()
      })

      it('does not print verbose messages', () => {
        Logger.default.log('Some message with looooong explanation')
        expect(console.log).not.toHaveBeenCalled()

      })

      it('does not print info messages', () => {
        Logger.default.info('Some message')
        expect(console.info).not.toHaveBeenCalled()
      })

      it('does not print warning messages', () => {
        Logger.default.warn('Some warning')
        expect(console.warn).not.toHaveBeenCalled()
      })

      it('prints error messages', () => {
        Logger.default.error('Some error message')
        expect(console.error).toHaveBeenCalledWith('[adjust-sdk]', today, 'ERROR:', 'Some error message')
      })
    })
  })

  describe('explicit verbose log level', () => {
    jest.isolateModules(() => {
      const Logger = require('../logger')

      beforeAll(() => {
        Logger.default.setLogLevel('verbose')
      })

      it('prints verbose messages', () => {
        Logger.default.log('Some message with looooong explanation')
        expect(console.log).toHaveBeenCalledWith('[adjust-sdk]', today, 'LOG:  ', 'Some message with looooong explanation')

      })

      it('prints info messages', () => {
        Logger.default.info('Some message')
        expect(console.info).toHaveBeenCalledWith('[adjust-sdk]', today, 'INFO: ', 'Some message')
      })

      it('prints warning messages', () => {
        Logger.default.warn('Some warning')
        expect(console.warn).toHaveBeenCalledWith('[adjust-sdk]', today, 'WARN: ', 'Some warning')
      })

      it('prints error messages', () => {
        Logger.default.error('Some error message')
        expect(console.error).toHaveBeenCalledWith('[adjust-sdk]', today, 'ERROR:', 'Some error message')
      })
    })
  })

  describe('explicit info log level', () => {
    jest.isolateModules(() => {
      const Logger = require('../logger')

      beforeAll(() => {
        Logger.default.setLogLevel('info')
      })

      it('does not print verbose messages', () => {
        Logger.default.log('Some message with looooong explanation')
        expect(console.log).not.toHaveBeenCalled()

      })

      it('prints info messages', () => {
        Logger.default.info('Some message')
        expect(console.info).toHaveBeenCalledWith('[adjust-sdk]', today, 'INFO: ', 'Some message')
      })

      it('prints warning messages', () => {
        Logger.default.warn('Some warning')
        expect(console.warn).toHaveBeenCalledWith('[adjust-sdk]', today, 'WARN: ', 'Some warning')
      })

      it('prints error messages', () => {
        Logger.default.error('Some error message')
        expect(console.error).toHaveBeenCalledWith('[adjust-sdk]', today, 'ERROR:', 'Some error message')
      })
    })
  })

  describe('explicit warning log level', () => {
    jest.isolateModules(() => {
      const Logger = require('../logger')

      beforeAll(() => {
        Logger.default.setLogLevel('warning')
      })

      it('does not print verbose messages', () => {
        Logger.default.log('Some message with looooong explanation')
        expect(console.log).not.toHaveBeenCalled()

      })

      it('does not print info messages', () => {
        Logger.default.info('Some message')
        expect(console.log).not.toHaveBeenCalled()
      })

      it('prints warning messages', () => {
        Logger.default.warn('Some warning')
        expect(console.warn).toHaveBeenCalledWith('[adjust-sdk]', today, 'WARN: ', 'Some warning')
      })

      it('prints error messages', () => {
        Logger.default.error('Some error message')
        expect(console.error).toHaveBeenCalledWith('[adjust-sdk]', today, 'ERROR:', 'Some error message')
      })
    })
  })

  describe('explicit error log level', () => {
    jest.isolateModules(() => {
      const Logger = require('../logger')

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

      it('does not prints warning messages', () => {
        Logger.default.warn('Some warning')
        expect(console.warn).not.toHaveBeenCalled()
      })

      it('prints error messages', () => {
        Logger.default.error('Some error message')
        expect(console.error).toHaveBeenCalledWith('[adjust-sdk]', today, 'ERROR:', 'Some error message')
      })
    })
  })

  describe('explicit none log level', () => {
    jest.isolateModules(() => {
      const Logger = require('../logger')

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

      it('does not prints warning messages', () => {
        Logger.default.warn('Some warning')
        expect(console.warn).not.toHaveBeenCalled()
      })

      it('prints error messages', () => {
        Logger.default.error('Some error message')
        expect(console.error).not.toHaveBeenCalled()
      })
    })
  })

  describe('output logs into specified container', () => {
    jest.isolateModules(() => {
      const Logger = require('../logger')

      let logContainer
      let history = []

      beforeAll(() => {
        logContainer = document.createElement('div')
        logContainer.setAttribute('id', 'log')
        document.getElementsByTagName('body')[0].appendChild(logContainer)

        Logger.default.setLogLevel('verbose', '#log')

        history.push(`[adjust-sdk] ${today} INFO:  Log level set to verbose`)
      })

      it('prints verbose messages', () => {
        Logger.default.log('Some message with looooong explanation')

        history.push(`[adjust-sdk] ${today} LOG:   Some message with looooong explanation`)

        expect(console.log).toHaveBeenCalledWith('[adjust-sdk]', today, 'LOG:  ', 'Some message with looooong explanation')
        expect(logContainer.textContent).toEqual(history.join('\n') + '\n')

      })

      it('prints info messages', () => {
        Logger.default.info('Some message')

        history.push(`[adjust-sdk] ${today} INFO:  Some message`)

        expect(console.info).toHaveBeenCalledWith('[adjust-sdk]', today, 'INFO: ', 'Some message')
        expect(logContainer.textContent).toEqual(history.join('\n') + '\n')
      })

      it('prints warning messages', () => {
        Logger.default.warn('Some warning')

        history.push(`[adjust-sdk] ${today} WARN:  Some warning`)

        expect(console.warn).toHaveBeenCalledWith('[adjust-sdk]', today, 'WARN: ', 'Some warning')
        expect(logContainer.textContent).toEqual(history.join('\n') + '\n')
      })

      it('prints error messages', () => {
        Logger.default.error('Some error message')

        history.push(`[adjust-sdk] ${today} ERROR: Some error message`)

        expect(console.error).toHaveBeenCalledWith('[adjust-sdk]', today, 'ERROR:', 'Some error message')
        expect(logContainer.textContent).toEqual(history.join('\n') + '\n')
      })

      it('prints multiple messages that might be json', () => {
        const json = {info: 'look at the info'}

        Logger.default.log('Some info', json)

        history.push(`[adjust-sdk] ${today} LOG:   Some info ${JSON.stringify(json)}`)

        expect(console.log).toHaveBeenCalledWith('[adjust-sdk]', today, 'LOG:  ', 'Some info', json)
        expect(logContainer.textContent).toEqual(history.join('\n') + '\n')
      })
    })
  })
})
