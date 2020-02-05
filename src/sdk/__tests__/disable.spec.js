import * as PubSub from '../pub-sub'
import * as Storage from '../storage/storage'
import * as ActivityState from '../activity-state'
import * as Logger from '../logger'
import * as Preferences from '../preferences'
import * as Identity from '../identity'
import * as Disable from '../disable'

jest.mock('../logger')

describe('test disable functionality', () => {
  beforeAll(() => {
    jest.spyOn(PubSub, 'publish')
    jest.spyOn(Storage.default, 'getFirst')
    jest.spyOn(Storage.default, 'addItem')
    jest.spyOn(Storage.default, 'updateItem')
    jest.spyOn(ActivityState.default, 'destroy')
    jest.spyOn(Logger.default, 'log')
    jest.spyOn(Preferences, 'reload')
  })

  afterEach(() => {
    jest.clearAllMocks()
    localStorage.clear()
    Identity.destroy()
    Preferences.setDisabled(null)
  })

  afterAll(() => {
    jest.restoreAllMocks()
  })

  it('checks disabled state', () => {

    expect(Preferences.getDisabled()).toBeNull()
    expect(Disable.status()).toBe('on')

    Disable.disable()

    expect(Preferences.getDisabled()).toEqual({reason: 'general', pending: false})
    expect(Disable.status()).toBe('off')

    Disable.disable()

    expect(Logger.default.log).toHaveBeenLastCalledWith('Adjust SDK disable process has already finished')
    expect(Disable.status()).toBe('off')

    Disable.restore()

    expect(Preferences.getDisabled()).toBeNull()
    expect(Disable.status()).toBe('on')

    Disable.restore()

    expect(Logger.default.log).toHaveBeenLastCalledWith('Adjust SDK is already enabled')
    expect(Disable.status()).toBe('on')

  })

  it('checks if disabled due to GDPR-Forget-Me request', () => {

    Disable.disable('gdpr', true)

    expect(Preferences.getDisabled()).toEqual({reason: 'gdpr', pending: true})
    expect(Disable.status()).toBe('paused')

    Disable.restore()

    expect(Preferences.getDisabled()).toEqual({reason: 'gdpr', pending: true})
    expect(Logger.default.log).toHaveBeenLastCalledWith('Adjust SDK is disabled due to GDPR-Forget-Me request and it can not be re-enabled')
    expect(Disable.status()).toBe('paused')

    Disable.disable()

    expect(Logger.default.log).toHaveBeenLastCalledWith('Adjust SDK GDPR disable process has already started')
    expect(Preferences.getDisabled()).toEqual({reason: 'gdpr', pending: true})
    expect(Disable.status()).toBe('paused')

    Disable.finish('gdpr')

    expect(Preferences.getDisabled()).toEqual({reason: 'gdpr', pending: false})
    expect(Disable.status()).toBe('off')
  })

  it('checks disabled state after storage has been lost', () => {

    expect(Preferences.getDisabled()).toBeNull()

    Disable.disable()

    expect(Preferences.getDisabled()).toEqual({reason: 'general', pending: false})
    expect(Disable.status()).toBe('off')

    localStorage.clear()

    expect(Preferences.getDisabled()).toEqual({reason: 'general', pending: false})
    expect(Disable.status()).toBe('off')
  })


})
