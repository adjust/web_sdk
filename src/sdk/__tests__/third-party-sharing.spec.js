import * as ThirdPartySharing from '../third-party-sharing'
import * as Config from '../config'
import * as Queue from '../queue'
import * as http from '../http'
import * as Time from '../time'
import * as Logger from '../logger'
import * as ActivityState from '../activity-state'
import * as Preferences from '../preferences'

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
    url: '/disable_third_party_sharing',
    method: 'POST'
  }

  const fullConfig = {
    endpoint: 'app',
    ...requestConfig,
    params: {
      attempts: 1,
      createdAt: 'some-time',
      timeSpent: 0,
      sessionLength: 0,
      sessionCount: 1,
      lastInterval: 0
    }
  }

  jest.runOnlyPendingTimers()

  expect(Queue.push).toHaveBeenCalledWith(requestConfig)

  const promise = Utils.flushPromises()
    .then(() => {
      jest.runOnlyPendingTimers()

      expect(http.default).toHaveBeenCalledWith(fullConfig)

      return Utils.flushPromises()
    })
    .then(() => {
      ThirdPartySharing.finish()

      expect(Logger.default.log).toHaveBeenCalledWith('Third-party sharing opt-out is now finished')

      Queue.push.mockClear()
      http.default.mockClear()
    })

  return {promise, assertions: 3}
}

function expectNotRequest () {
    jest.runOnlyPendingTimers()
    expect(Queue.push).not.toHaveBeenCalled()
}

describe('Third-party sharing opt-out functionality', () => {

  beforeAll(() => {
    jest.spyOn(Queue, 'push')
    jest.spyOn(http, 'default')
    jest.spyOn(Time, 'getTimestamp').mockReturnValue('some-time')
    jest.spyOn(Logger.default, 'log')

    ActivityState.default.init({uuid: 'some-uuid'})
  })

  afterEach(() => {
    Preferences.setThirdPartySharing(null)
    jest.clearAllMocks()
    Queue.destroy()
    localStorage.clear()
  })

  afterAll(() => {
    jest.restoreAllMocks()
    Config.default.destroy()
    ActivityState.default.destroy()
  })

  it('queue third-party sharing opt-out until sdk is initialised', () => {

    ThirdPartySharing.optOut()
    ThirdPartySharing.disable()

    expect(Logger.default.log).toHaveBeenCalledWith('Adjust SDK will run third-party sharing opt-out request after initialisation')
    expect(Logger.default.log).toHaveBeenLastCalledWith('Third-party sharing opt-out is now started')
    expectNotRequest()

    Config.default.set(appOptions)
    ThirdPartySharing.check()

    expect(Logger.default.log).toHaveBeenLastCalledWith('Adjust SDK is running pending third-party sharing opt-out request')

    const a = expectRequest()

    expect.assertions(a.assertions + 4)

    return a.promise
  })

  it('runs third-party sharing opt-out request and prevents subsequent one', () => {

    ThirdPartySharing.optOut()
    ThirdPartySharing.disable()

    const a = expectRequest()

    ThirdPartySharing.optOut()

    expect.assertions(a.assertions + 4)

    expect(Logger.default.log).toHaveBeenCalledTimes(2)
    expect(Logger.default.log).toHaveBeenCalledWith('Third-party sharing opt-out is now started')
    expect(Logger.default.log).toHaveBeenLastCalledWith('Adjust SDK already queued third-party sharing opt-out request')

    return a.promise
      .then(() => {
        expectNotRequest()
      })
  })

  it('prevents running opt-out request if third-party tracking already disabled', () => {

    Preferences.setThirdPartySharing({reason: 'general', pending: true})
    ThirdPartySharing.optOut()

    expect(Logger.default.log).toHaveBeenCalledTimes(1)
    expect(Logger.default.log).toHaveBeenLastCalledWith('Adjust SDK already queued third-party sharing opt-out request')

    Preferences.setThirdPartySharing({reason: 'general'})
    ThirdPartySharing.optOut()

    expect(Logger.default.log).toHaveBeenCalledTimes(2)
    expect(Logger.default.log).toHaveBeenLastCalledWith('Third-party sharing opt-out is already done')
  })

  it('prevents third-party-sharing disable process if already started or finished', () => {

    ThirdPartySharing.disable()

    expect(Logger.default.log).toHaveBeenCalledTimes(1)
    expect(Logger.default.log).toHaveBeenLastCalledWith('Third-party sharing opt-out is now started')

    ThirdPartySharing.disable()

    expect(Logger.default.log).toHaveBeenCalledTimes(2)
    expect(Logger.default.log).toHaveBeenLastCalledWith('Third-party sharing opt-out has already started')

    ThirdPartySharing.finish()

    expect(Logger.default.log).toHaveBeenCalledTimes(3)
    expect(Logger.default.log).toHaveBeenLastCalledWith('Third-party sharing opt-out is now finished')

    ThirdPartySharing.finish()

    expect(Logger.default.log).toHaveBeenCalledTimes(4)
    expect(Logger.default.log).toHaveBeenLastCalledWith('Third-party sharing opt-out has already finished')

  })

})
