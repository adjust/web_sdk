/* eslint-disable */
import * as Config from '../config'
import * as Attribution from '../attribution'
import * as request from '../request'
import * as PubSub from '../pub-sub'
import * as Time from '../time'
import * as Identity from '../identity'
import * as ActivityState from '../activity-state'
import * as Logger from '../logger'
import {flushPromises} from './_helper'

jest.mock('../request')
jest.mock('../logger')
jest.useFakeTimers()

describe('test attribution functionality', () => {

  beforeAll(() => {

    Object.assign(Config.default.baseParams, {
      appToken: '123abc',
      environment: 'sandbox',
      osName: 'ios'
    })

    ActivityState.default.current = {}

    jest.spyOn(request, 'default')
    jest.spyOn(Identity, 'updateAttribution')
    jest.spyOn(PubSub, 'publish')
    jest.spyOn(Time, 'getTimestamp').mockReturnValue('some-time')
    jest.spyOn(Logger.default, 'log')
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  afterAll(() => {
    Config.clear()
    ActivityState.default.current = {}

    jest.clearAllTimers()
    jest.restoreAllMocks()
  })

  it('does not do anything if there is no ask_in parameter', () => {

    ActivityState.default.current = {attribution: {tracker_token: '123abc', tracker_name: 'tracker', network: 'bla'}}

    expect.assertions(2)

    Attribution.checkAttribution({some: 'thing'})
      .then(result => {
        expect(result).toEqual({some: 'thing'})
        expect(setTimeout).not.toHaveBeenCalled()
      })

    jest.runAllTimers()

  })

  it('does self-initiated attribution call after initial session', () => {

    const newAttribution = {adid: '123', attribution: {tracker_token: '123abc', tracker_name: 'tracker', network: 'new'}}
    const formatted = {adid: '123', tracker_token: '123abc', tracker_name: 'tracker', network: 'new'}

    ActivityState.default.current = {}
    request.default.mockResolvedValue(newAttribution)

    expect.assertions(6)

    Attribution.checkAttribution({some: 'thing'})

    expect(Logger.default.log).toHaveBeenLastCalledWith('Trying request /attribution in 150ms')
    expect(setTimeout).toHaveBeenLastCalledWith(expect.any(Function), 150)

    jest.runOnlyPendingTimers()

    expect(request.default).toHaveBeenCalledWith({
      url: '/attribution',
      params: {
        createdAt: 'some-time',
        initiatedBy: 'sdk',
        appToken: '123abc',
        environment: 'sandbox',
        osName: 'ios'
      }
    })

    return flushPromises()
      .then(() => {
        expect(Logger.default.log).toHaveBeenCalledWith('Request /attribution has been finished')
        expect(Identity.updateAttribution).toHaveBeenCalledWith(formatted)
        expect(PubSub.publish).toHaveBeenCalledWith('attribution:change', formatted)
      })

  })

  it('sets timeout for attribution endpoint to be called which returns same attribution as before', () => {

    const currentAttribution = {adid: '123', attribution: {tracker_token: '123abc', tracker_name: 'tracker', network: 'bla'}}

    ActivityState.default.current = {attribution: Object.assign({adid: '123'}, currentAttribution.attribution)}
    request.default.mockResolvedValue(currentAttribution)

    expect.assertions(6)

    Attribution.checkAttribution({ask_in: 3000})

    expect(Logger.default.log).toHaveBeenLastCalledWith('Trying request /attribution in 3000ms')
    expect(setTimeout).toHaveBeenLastCalledWith(expect.any(Function), 3000)

    jest.runOnlyPendingTimers()

    expect(request.default).toHaveBeenCalledWith({
      url: '/attribution',
      params: {
        createdAt: 'some-time',
        initiatedBy: 'backend',
        appToken: '123abc',
        environment: 'sandbox',
        osName: 'ios'
      }
    })

    return flushPromises()
      .then(() => {
        expect(Logger.default.log).toHaveBeenCalledWith('Request /attribution has been finished')
        expect(Identity.updateAttribution).not.toHaveBeenCalled()
        expect(PubSub.publish).not.toHaveBeenCalled()
      })

  })

  it('sets timeout for attribution endpoint to be called if no attribution found', () => {

    const newAttribution = {adid: '123', attribution: {tracker_token: '123abc', tracker_name: 'tracker', network: 'new'}}
    const formatted = {adid: '123', tracker_token: '123abc', tracker_name: 'tracker', network: 'new'}

    ActivityState.default.current = {}
    request.default.mockResolvedValue(newAttribution)

    expect.assertions(6)

    Attribution.checkAttribution({ask_in: 2000})

    expect(Logger.default.log).toHaveBeenLastCalledWith('Trying request /attribution in 2000ms')
    expect(setTimeout).toHaveBeenLastCalledWith(expect.any(Function), 2000)

    jest.runOnlyPendingTimers()

    expect(request.default).toHaveBeenCalledWith({
      url: '/attribution',
      params: {
        createdAt: 'some-time',
        initiatedBy: 'backend',
        appToken: '123abc',
        environment: 'sandbox',
        osName: 'ios'
      }
    })

    return flushPromises()
      .then(() => {
        expect(Logger.default.log).toHaveBeenCalledWith('Request /attribution has been finished')
        expect(Identity.updateAttribution).toHaveBeenCalledWith(formatted)
        expect(PubSub.publish).toHaveBeenCalledWith('attribution:change', formatted)
      })

  })

  it('sets timeout for attribution endpoint to be called which returns different attribution (network is different)', () => {

    const oldAttribution = {adid: '123', tracker_token: '123abc', tracker_name: 'tracker', network: 'old'}
    const newAttribution = {adid: '123', attribution: {tracker_token: '123abc', tracker_name: 'tracker', network: 'new'}}
    const formatted = {adid: '123', tracker_token: '123abc', tracker_name: 'tracker', network: 'new'}

    ActivityState.default.current = {attribution: oldAttribution}
    request.default.mockResolvedValue(newAttribution)

    expect.assertions(6)

    Attribution.checkAttribution({ask_in: 2000})

    expect(Logger.default.log).toHaveBeenLastCalledWith('Trying request /attribution in 2000ms')
    expect(setTimeout).toHaveBeenLastCalledWith(expect.any(Function), 2000)

    jest.runOnlyPendingTimers()

    expect(request.default).toHaveBeenCalledWith({
      url: '/attribution',
      params: {
        createdAt: 'some-time',
        initiatedBy: 'backend',
        appToken: '123abc',
        environment: 'sandbox',
        osName: 'ios'
      }
    })

    return flushPromises()
      .then(() => {
        expect(Logger.default.log).toHaveBeenCalledWith('Request /attribution has been finished')
        expect(Identity.updateAttribution).toHaveBeenCalledWith(formatted)
        expect(PubSub.publish).toHaveBeenCalledWith('attribution:change', formatted)
      })

  })

  it('sets timeout for attribution endpoint to be called which returns different attribution (tracker_name is different)', () => {

    const oldAttribution = {adid: '123', tracker_token: '123abc', tracker_name: 'tracker', network: 'old'}
    const newAttribution = {adid: '123', attribution: {tracker_token: '123abc', tracker_name: 'tracker new', network: 'old'}}
    const formatted = {adid: '123', tracker_token: '123abc', tracker_name: 'tracker new', network: 'old'}

    ActivityState.default.current = {attribution: oldAttribution}
    request.default.mockResolvedValue(newAttribution)

    expect.assertions(6)

    Attribution.checkAttribution({ask_in: 2000})

    expect(Logger.default.log).toHaveBeenLastCalledWith('Trying request /attribution in 2000ms')
    expect(setTimeout).toHaveBeenLastCalledWith(expect.any(Function), 2000)

    jest.runOnlyPendingTimers()

    expect(request.default).toHaveBeenCalledWith({
      url: '/attribution',
      params: {
        createdAt: 'some-time',
        initiatedBy: 'backend',
        appToken: '123abc',
        environment: 'sandbox',
        osName: 'ios'
      }
    })

    return flushPromises()
      .then(() => {
        expect(Logger.default.log).toHaveBeenCalledWith('Request /attribution has been finished')
        expect(Identity.updateAttribution).toHaveBeenCalledWith(formatted)
        expect(PubSub.publish).toHaveBeenCalledWith('attribution:change', formatted)
      })

  })

  it('sets timeout for attribution endpoint to be called which returns ask_in', () => {

    const oldAttribution = {adid: '123', tracker_token: '123abc', tracker_name: 'tracker', network: 'old'}
    const newAttribution = {adid: '123', attribution: {tracker_token: '123abc', tracker_name: 'tracker', network: 'newest'}}
    const formatted = {adid: '123', tracker_token: '123abc', tracker_name: 'tracker', network: 'newest'}

    ActivityState.default.current = {attribution: oldAttribution}
    request.default.mockResolvedValue({ask_in: 3000})

    expect.assertions(20)

    Attribution.checkAttribution({ask_in: 2000})

    expect(Logger.default.log).toHaveBeenLastCalledWith('Trying request /attribution in 2000ms')
    expect(setTimeout).toHaveBeenCalledTimes(1)
    expect(setTimeout).toHaveBeenLastCalledWith(expect.any(Function), 2000)

    jest.runOnlyPendingTimers()

    expect(request.default).toHaveBeenCalledTimes(1)

    return flushPromises()
      .then(() => {
        expect(Identity.updateAttribution).not.toHaveBeenCalled()
        expect(PubSub.publish).not.toHaveBeenCalled()

        jest.runOnlyPendingTimers()

        expect(Logger.default.log).toHaveBeenLastCalledWith('Trying request /attribution in 3000ms')
        expect(setTimeout).toHaveBeenCalledTimes(2)
        expect(setTimeout).toHaveBeenLastCalledWith(expect.any(Function), 3000)
        expect(request.default).toHaveBeenCalledTimes(2)

        return flushPromises()
      }).then(() => {

        expect(Identity.updateAttribution).not.toHaveBeenCalled()
        expect(PubSub.publish).not.toHaveBeenCalled()

        request.default.mockClear()
        request.default.mockResolvedValue(newAttribution)

        jest.runOnlyPendingTimers()

        expect(Logger.default.log).toHaveBeenLastCalledWith('Trying request /attribution in 3000ms')
        expect(setTimeout).toHaveBeenCalledTimes(3)
        expect(setTimeout).toHaveBeenLastCalledWith(expect.any(Function), 3000)
        expect(request.default).toHaveBeenCalledTimes(1)

        setTimeout.mockClear()

        return flushPromises()
      }).then(() => {

        jest.runOnlyPendingTimers()

        expect(Logger.default.log).toHaveBeenCalledWith('Request /attribution has been finished')
        expect(Identity.updateAttribution).toHaveBeenCalledWith(formatted)
        expect(PubSub.publish).toHaveBeenCalledWith('attribution:change', formatted)
        expect(setTimeout).not.toHaveBeenCalled()
      })
  })

  it('retires attribution request when failed request', () => {

    const currentAttribution = {adid: '123', attribution: {tracker_token: '123abc', tracker_name: 'tracker', network: 'bla'}}

    request.default.mockRejectedValue({error: 'An error'})

    expect.assertions(26)

    Attribution.checkAttribution({ask_in: 2000})

    expect(Logger.default.log).toHaveBeenLastCalledWith('Trying request /attribution in 2000ms')
    expect(setTimeout).toHaveBeenCalledTimes(1)
    expect(setTimeout).toHaveBeenLastCalledWith(expect.any(Function), 2000)

    jest.runOnlyPendingTimers()

    expect(request.default).toHaveBeenCalledTimes(1)

    return flushPromises()
      .then(() => {
        jest.runOnlyPendingTimers()

        expect(Logger.default.log).toHaveBeenLastCalledWith('Re-trying request /attribution in 100ms')
        expect(request.default).toHaveBeenCalledTimes(2)
        expect(setTimeout).toHaveBeenCalledTimes(2)
        expect(setTimeout).toHaveBeenLastCalledWith(expect.any(Function), 100)

        return flushPromises()
      }).then(() => {
        jest.runOnlyPendingTimers()

        expect(Logger.default.log).toHaveBeenLastCalledWith('Re-trying request /attribution in 200ms')
        expect(request.default).toHaveBeenCalledTimes(3)
        expect(setTimeout).toHaveBeenCalledTimes(3)
        expect(setTimeout).toHaveBeenLastCalledWith(expect.any(Function), 200)

        return flushPromises()
      }).then(() => {

        jest.runOnlyPendingTimers()

        expect(Logger.default.log).toHaveBeenLastCalledWith('Re-trying request /attribution in 300ms')
        expect(request.default).toHaveBeenCalledTimes(4)
        expect(setTimeout).toHaveBeenCalledTimes(4)
        expect(setTimeout).toHaveBeenLastCalledWith(expect.any(Function), 300)

        return flushPromises()
      }).then(() => {

        jest.runOnlyPendingTimers()

        expect(Logger.default.log).toHaveBeenLastCalledWith('Re-trying request /attribution in 300ms')
        expect(request.default).toHaveBeenCalledTimes(5)
        expect(setTimeout).toHaveBeenCalledTimes(5)
        expect(setTimeout).toHaveBeenLastCalledWith(expect.any(Function), 300)

        return flushPromises()
      }).then(() => {

        request.default.mockClear()
        request.default.mockResolvedValue(currentAttribution)

        jest.runOnlyPendingTimers()

        expect(Logger.default.log).toHaveBeenLastCalledWith('Re-trying request /attribution in 300ms')
        expect(request.default).toHaveBeenCalledTimes(1)
        expect(setTimeout).toHaveBeenCalledTimes(6)
        expect(setTimeout).toHaveBeenLastCalledWith(expect.any(Function), 300)

        setTimeout.mockClear()

        return flushPromises()
      }).then(() => {

        jest.runOnlyPendingTimers()

        expect(Logger.default.log).toHaveBeenCalledWith('Request /attribution has been finished')
        expect(setTimeout).not.toHaveBeenCalled()
      })
  })

  it('cancels initiated attribution call', () => {

    const newAttribution = {adid: '123', attribution: {tracker_token: '123abc', tracker_name: 'tracker', network: 'new'}}

    ActivityState.default.current = {}
    request.default.mockResolvedValue(newAttribution)

    expect.assertions(6)

    Attribution.checkAttribution({ask_in: 2000})

    expect(Logger.default.log).toHaveBeenLastCalledWith('Trying request /attribution in 2000ms')
    expect(setTimeout).toHaveBeenLastCalledWith(expect.any(Function), 2000)

    Attribution.destroy()

    jest.runOnlyPendingTimers()

    expect(request.default).not.toHaveBeenCalled()

    return flushPromises()
      .then(() => {
        expect(Logger.default.log).toHaveBeenLastCalledWith('Previous /attribution request attempt canceled')
        expect(Identity.updateAttribution).not.toHaveBeenCalled()
        expect(PubSub.publish).not.toHaveBeenCalled()
      })

  })

  it('cancels previously initiated attribution call with another one', () => {

    const newAttribution = {adid: '123', attribution: {tracker_token: '123abc', tracker_name: 'tracker', network: 'new'}}
    const formatted = {adid: '123', tracker_token: '123abc', tracker_name: 'tracker', network: 'new'}

    ActivityState.default.current = {}
    request.default.mockResolvedValue(newAttribution)

    expect.assertions(9)

    Attribution.checkAttribution({ask_in: 2000})

    expect(Logger.default.log).toHaveBeenLastCalledWith('Trying request /attribution in 2000ms')
    expect(setTimeout).toHaveBeenLastCalledWith(expect.any(Function), 2000)

    Logger.default.log.mockClear()

    // initiate another attribution call
    Attribution.checkAttribution({ask_in: 2000})

    expect(Logger.default.log.mock.calls[0][0]).toBe('Previous /attribution request attempt canceled')
    expect(Logger.default.log.mock.calls[1][0]).toBe('Trying request /attribution in 2000ms')

    jest.runOnlyPendingTimers()

    expect(request.default).toHaveBeenCalledTimes(1)

    return flushPromises()
      .then(() => {
        expect(request.default).toHaveBeenCalledTimes(1)
        expect(Logger.default.log).toHaveBeenCalledWith('Request /attribution has been finished')
        expect(Identity.updateAttribution).toHaveBeenCalledWith(formatted)
        expect(PubSub.publish).toHaveBeenCalledWith('attribution:change', formatted)
      })

  })

})
