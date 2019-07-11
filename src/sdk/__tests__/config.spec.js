import * as Config from '../config'
import * as Logger from '../logger'

jest.mock('../logger')

describe('test global config', () => {

  afterEach(() => {
    jest.clearAllMocks()
    Config.default.destroy()
  })

  afterAll(() => {
    jest.restoreAllMocks()
  })

  it('returns false for initialised state', () => {
    expect(Config.default.isInitialised()).toBeFalsy()
  })

  it('returns error when there are missing mandatory params', () => {

    jest.spyOn(Logger.default, 'error')

    Config.default.baseParams = {}

    expect(Logger.default.error).toHaveBeenCalledWith('You must define appToken and environment')
    expect(Config.default.isInitialised()).toBeFalsy()
    expect(Config.default.baseParams).toEqual({})

    Config.default.baseParams = {appToken: 'bla'}

    expect(Logger.default.error).toHaveBeenCalledWith('You must define environment')
    expect(Config.default.isInitialised()).toBeFalsy()
    expect(Config.default.baseParams).toEqual({})

  })

  it('returns true for correctly initialised state', () => {

    const appParams = {
      appToken: '123abc',
      environment: 'sandbox'
    }

    Config.default.baseParams = appParams

    expect(Config.default.isInitialised()).toBeTruthy()
    expect(Config.default.baseParams).toEqual(appParams)
    expect(Config.default.baseParams).not.toBe(appParams)
  })

  it('sets only allowed parameters', () => {

    Config.default.baseParams = {
      appToken: '123abc',
      environment: 'sandbox',
      defaultTracker: 'tracker',
      something: 'else'
    }

    expect(Config.default.isInitialised()).toBeTruthy()
    expect(Config.default.baseParams).toEqual({
      appToken: '123abc',
      environment: 'sandbox',
      defaultTracker: 'tracker',
    })

  })

  it('destroys config', () => {

    const appParams = {
      appToken: '123abc',
      environment: 'sandbox'
    }

    Config.default.baseParams = appParams

    expect(Config.default.isInitialised()).toBeTruthy()
    expect(Config.default.baseParams).toEqual(appParams)

    Config.default.destroy()

    expect(Config.default.isInitialised()).toBeFalsy()
    expect(Config.default.baseParams).toEqual({})
  })

})
