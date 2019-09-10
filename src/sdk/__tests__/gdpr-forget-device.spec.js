import * as GdprForgetDevice from '../gdpr-forget-device'
import * as Config from '../config'
import * as request from '../request'
import * as Time from '../time'
import * as Logger from '../logger'
import * as ActivityState from '../activity-state'
import * as State from '../state'
import * as PubSub from '../pub-sub'

jest.mock('../request')
jest.mock('../logger')
jest.useFakeTimers()

const appConfig = {
  appToken: '123abc',
  environment: 'sandbox'
}

function expectRequest () {
  const requestConfig = {
    url: '/gdpr_forget_device',
    method: 'POST'
  }

  const fullConfig = Object.assign({}, requestConfig, {
    params: Object.assign({
      createdAt: 'some-time',
      timeSpent: 0,
      sessionLength: 0,
      sessionCount: 1,
      lastInterval: 0
    }, requestConfig.params)
  })

  jest.runOnlyPendingTimers()
  expect(request.default).toHaveBeenCalledWith(fullConfig)
  request.default.mockClear()
}

function expectNotRequest () {
    jest.runOnlyPendingTimers()
    expect(request.default).not.toHaveBeenCalled()
}

describe('GDPR forget device functionality', () => {

  beforeAll(() => {
    jest.spyOn(request, 'default')
    jest.spyOn(Time, 'getTimestamp').mockReturnValue('some-time')
    jest.spyOn(Logger.default, 'log')
    jest.spyOn(PubSub, 'publish')

    ActivityState.default.current = {uuid: 'some-uuid'}
  })

  afterEach(() => {
    State.default.disabled = {}
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
    State.default.disabled = {reason: 'gdpr', pending: true}

    expect(Logger.default.log).toHaveBeenCalledWith('Adjust SDK will run GDPR Forget Me request after initialisation')

    expectNotRequest()

    Config.default.baseParams = appConfig

    GdprForgetDevice.check()

    expect(Logger.default.log).toHaveBeenCalledWith('Adjust SDK is running pending GDPR Forget Me request')
    expectRequest()

    return Utils.flushPromises()
  })

  it('runs forget request and prevents subsequent one', () => {

    GdprForgetDevice.forget()
    State.default.disabled = {reason: 'gdpr', pending: true}

    expectRequest()

    GdprForgetDevice.forget()

    expect(Logger.default.log).toHaveBeenCalledWith('Adjust SDK is already prepared to send GDPR Forget Me request')
    expectNotRequest()

    return Utils.flushPromises()
      .then(() => {
        expect(PubSub.publish).toHaveBeenCalledWith('sdk:gdpr-forget-me', true)
      })
  })

  it('prevents running forget request if sdk already disabled', () => {

    State.default.disabled = {reason: 'general'}
    GdprForgetDevice.forget()

    expect(Logger.default.log).toHaveBeenCalledWith('Adjust SDK is already disabled')

    State.default.disabled = {reason: 'gdpr'}
    GdprForgetDevice.forget()

    expect(Logger.default.log).toHaveBeenCalledWith('Adjust SDK is already disabled')

  })

})
