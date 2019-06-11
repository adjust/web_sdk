/* eslint-disable */
import * as GdprForgetDevice from '../gdpr-forget-device'
import * as Config from '../config'
import * as request from '../request'
import * as Queue from '../queue'
import * as Time from '../time'
import * as Logger from '../logger'
import * as Identity from '../identity'
import {flushPromises} from './_helper'

jest.mock('../request')
jest.mock('../logger')
jest.useFakeTimers()

const appConfig = {
  appToken: '123abc',
  environment: 'sandbox',
  osName: 'ios'
}

function expectRequest () {

  const requestConfig = {
    url: '/gdpr_forget_device',
    method: 'POST'
  }

  const fullConfig = Object.assign({}, requestConfig, {
    params: Object.assign({
      createdAt: 'some-time'
    }, requestConfig.params, appConfig)
  })

  expect(Queue.push).toHaveBeenCalledWith(requestConfig)

  return flushPromises()
    .then(() => {
      jest.runOnlyPendingTimers()

      expect(request.default).toHaveBeenCalledWith(fullConfig)

      Queue.push.mockClear()
      request.default.mockClear()

      return flushPromises()
    })
}

function expectNotRequest () {
  expect(Queue.push).not.toHaveBeenCalled()

  return flushPromises()
    .then(() => {
      jest.runOnlyPendingTimers()

      expect(request.default).not.toHaveBeenCalled()

      Queue.push.mockClear()
      request.default.mockClear()
    })
}

describe('GDPR forget device functionality', () => {

  beforeAll(() => {
    jest.spyOn(request, 'default')
    jest.spyOn(Queue, 'push')
    jest.spyOn(Time, 'getTimestamp').mockReturnValue('some-time')
    jest.spyOn(Logger.default, 'log')
  })

  afterEach(() => {
    jest.clearAllMocks()
    GdprForgetDevice.destroy()
    localStorage.clear()
  })

  afterAll(() => {
    jest.restoreAllMocks()
    Config.default.destroy()
  })

  it('queue forget device until sdk is initialised', () => {

    GdprForgetDevice.forget()

    expect(Logger.default.log).toHaveBeenCalledWith('adjustSDK will run GDPR Forget Me request after initialisation')

    return expectNotRequest()
      .then(() => {

        Object.assign(Config.default.baseParams, appConfig)

        GdprForgetDevice.forget()

        expect(Logger.default.log).toHaveBeenCalledWith('adjustSDK already sent GDPR Forget Me request')

        return expectNotRequest()
      })
      .then(() => {
        expect(GdprForgetDevice.requested()).toBeTruthy()

        GdprForgetDevice.check()

        expect(Logger.default.log).toHaveBeenCalledWith('adjustSDK is running pending GDPR Forget Me request')

        return expectRequest()
      })
  })

  it('runs forget request and prevents subsequent one', () => {

    GdprForgetDevice.forget()

    return expectRequest()
      .then(() => {
        GdprForgetDevice.forget()

        expect(Logger.default.log).toHaveBeenCalledWith('adjustSDK already sent GDPR Forget Me request')

        return expectNotRequest()
      })
      .then(() => {
        expect(GdprForgetDevice.requested()).toBeTruthy()

        GdprForgetDevice.check()

        return expectNotRequest()
      })
  })

  it('prevents running forget request if sdk already disabled', () => {

    Identity.setDisabled(true)

    GdprForgetDevice.forget()

    expect(Logger.default.log).toHaveBeenCalledWith('adjustSDK is already disabled')
    expect(Logger.default.log).toHaveBeenCalledTimes(1)

    Identity.setDisabled(true, 'gdpr')

    GdprForgetDevice.forget()

    expect(Logger.default.log).toHaveBeenCalledWith('adjustSDK is already GDPR forgotten')
    expect(Logger.default.log).toHaveBeenCalledTimes(2)

  })

})
