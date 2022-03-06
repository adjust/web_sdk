import * as GdprForgetDevice from '../gdpr-forget-device'
import * as Config from '../config'
import * as http from '../http'
import * as Time from '../time'
import * as Logger from '../logger'
import * as ActivityState from '../activity-state'
import * as Preferences from '../preferences'
import * as PubSub from '../pub-sub'

jest.mock('../http')
jest.mock('../logger')
jest.mock('../url-strategy')
jest.useFakeTimers()

const appOptions = {
  appToken: '123abc',
  environment: 'sandbox'
}

function expectRequest () {
  const requestConfig = {
    url: '/gdpr_forget_device',
    method: 'POST'
  }

  const fullConfig = {
    endpoint: 'gdpr',
    ...requestConfig,
    params: {
      attempts: 1,
      createdAt: 'some-time',
      timeSpent: 0,
      sessionLength: 0,
      sessionCount: 1,
      lastInterval: 0,
      ...requestConfig.params
    }
  }

  jest.runOnlyPendingTimers()
  expect(http.default).toHaveBeenCalledWith(fullConfig)
  http.default.mockClear()
}

function expectNotRequest () {
    jest.runOnlyPendingTimers()
    expect(http.default).not.toHaveBeenCalled()
}

describe('GDPR forget device functionality', () => {

  beforeAll(() => {
    jest.spyOn(http, 'default')
    jest.spyOn(Time, 'getTimestamp').mockReturnValue('some-time')
    jest.spyOn(Logger.default, 'log')
    jest.spyOn(PubSub, 'publish')

    ActivityState.default.init({uuid: 'some-uuid'})
  })

  afterEach(() => {
    Preferences.setDisabled(null)
    jest.clearAllMocks()
    GdprForgetDevice.destroy()
    localStorage.clear()
  })

  afterAll(() => {
    jest.restoreAllMocks()
    Config.default.destroy()
    ActivityState.default.destroy()
  })

  it('queue forget device until sdk is initialised', () => {

    GdprForgetDevice.forget()
    Preferences.setDisabled({reason: 'gdpr', pending: true})

    expect(Logger.default.log).toHaveBeenCalledWith('Adjust SDK will run GDPR Forget Me request after initialisation')

    expectNotRequest()

    Config.default.set(appOptions)

    GdprForgetDevice.check()

    expect(Logger.default.log).toHaveBeenCalledWith('Adjust SDK is running pending GDPR Forget Me request')
    expectRequest()

    return Utils.flushPromises()
  })

  it('runs forget request and prevents subsequent one', () => {

    expect.assertions(4)

    GdprForgetDevice.forget()
    Preferences.setDisabled({reason: 'gdpr', pending: true})

    expectRequest()

    GdprForgetDevice.forget()

    expect(Logger.default.log).toHaveBeenCalledWith('Adjust SDK is already prepared to send GDPR Forget Me request')
    expectNotRequest()

    return Utils.flushPromises()
      .then(() => {
        expect(PubSub.publish).toHaveBeenCalledWith('sdk:gdpr-forget-me')
      })
  })

  it('prevents running forget request if sdk already disabled', () => {

    Preferences.setDisabled({reason: 'general'})
    GdprForgetDevice.forget()

    expect(Logger.default.log).toHaveBeenCalledWith('Adjust SDK is already disabled')

    Preferences.setDisabled({reason: 'gdpr'})
    GdprForgetDevice.forget()

    expect(Logger.default.log).toHaveBeenCalledWith('Adjust SDK is already disabled')

  })

})
