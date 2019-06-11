/* eslint-disable */
import * as Attribution from '../attribution'
import * as request from '../request'
import * as PubSub from '../pub-sub'
import * as Time from '../time'
import * as Identity from '../identity'
import * as ActivityState from '../activity-state'
import * as Logger from '../logger'
import {errorResponse, flushPromises} from './_helper'

jest.mock('../request')
jest.mock('../logger')
jest.useFakeTimers()

describe('test attribution functionality', () => {

  beforeAll(() => {
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
    ActivityState.default.current = {}

    jest.clearAllTimers()
    jest.restoreAllMocks()
  })

  it('does nothing if there is no ask_in parameter and attribution already stored', () => {

    ActivityState.default.current = {attribution: {tracker_token: '123abc', tracker_name: 'tracker', network: 'bla'}}

    const sessionResult = {some: 'thing'}
    const attributionPromise = Attribution.check(sessionResult)

    jest.runOnlyPendingTimers()

    expect.assertions(2)

    expect(request.default).not.toHaveBeenCalled()

    attributionPromise
      .then(result => {
        expect(result).toEqual(sessionResult)
      })

  })

  it('does self-initiated attribution call after initial session', () => {

    const newAttribution = {adid: '123', attribution: {tracker_token: '123abc', tracker_name: 'tracker', network: 'new'}}
    const formatted = {adid: '123', tracker_token: '123abc', tracker_name: 'tracker', network: 'new'}

    ActivityState.default.current = {}
    request.default.mockResolvedValue(newAttribution)

    expect.assertions(4)

    Attribution.check({some: 'thing'})

    jest.runOnlyPendingTimers()

    expect(request.default).toHaveBeenCalledTimes(1)
    expect(request.default.mock.calls[0][0]).toMatchObject({
      url: '/attribution',
      params: {initiatedBy: 'sdk'}
    })

    return flushPromises()
      .then(() => {
        expect(Identity.updateAttribution).toHaveBeenCalledWith(formatted)
        expect(PubSub.publish).toHaveBeenCalledWith('attribution:change', formatted)
      })

  })

  it('requests timed-out attribution which returns the same as existing one', () => {

    const currentAttribution = {adid: '123', attribution: {tracker_token: '123abc', tracker_name: 'tracker', network: 'bla'}}

    ActivityState.default.current = {attribution: Object.assign({adid: '123'}, currentAttribution.attribution)}
    request.default.mockResolvedValue(currentAttribution)

    expect.assertions(4)

    Attribution.check({ask_in: 3000})

    jest.runOnlyPendingTimers()

    expect(request.default).toHaveBeenCalledTimes(1)
    expect(request.default.mock.calls[0][0]).toMatchObject({
      url: '/attribution',
      params: {initiatedBy: 'backend'}
    })

    return flushPromises()
      .then(() => {
        expect(Identity.updateAttribution).not.toHaveBeenCalled()
        expect(PubSub.publish).not.toHaveBeenCalled()
      })

  })

  it('requests timed-out attribution which returns new attribution', () => {

    const newAttribution = {adid: '123', attribution: {tracker_token: '123abc', tracker_name: 'tracker', network: 'new'}}
    const formatted = {adid: '123', tracker_token: '123abc', tracker_name: 'tracker', network: 'new'}

    ActivityState.default.current = {}
    request.default.mockResolvedValue(newAttribution)

    expect.assertions(3)

    Attribution.check({ask_in: 2000})

    jest.runOnlyPendingTimers()

    expect(request.default).toHaveBeenCalledTimes(1)

    return flushPromises()
      .then(() => {
        expect(Identity.updateAttribution).toHaveBeenCalledWith(formatted)
        expect(PubSub.publish).toHaveBeenCalledWith('attribution:change', formatted)
      })

  })

  it('requests timed-out attribution which returns different than existing one (network is different)', () => {

    const oldAttribution = {adid: '123', tracker_token: '123abc', tracker_name: 'tracker', network: 'old'}
    const newAttribution = {adid: '123', attribution: {tracker_token: '123abc', tracker_name: 'tracker', network: 'new'}}
    const formatted = {adid: '123', tracker_token: '123abc', tracker_name: 'tracker', network: 'new'}

    ActivityState.default.current = {attribution: oldAttribution}
    request.default.mockResolvedValue(newAttribution)

    expect.assertions(3)

    Attribution.check({ask_in: 2000})

    jest.runOnlyPendingTimers()

    expect(request.default).toHaveBeenCalledTimes(1)

    return flushPromises()
      .then(() => {
        expect(Identity.updateAttribution).toHaveBeenCalledWith(formatted)
        expect(PubSub.publish).toHaveBeenCalledWith('attribution:change', formatted)
      })

  })

  it('requests timed-out attribution which returns different than existing one (tracker_name is different)', () => {

    const oldAttribution = {adid: '123', tracker_token: '123abc', tracker_name: 'tracker', network: 'old'}
    const newAttribution = {adid: '123', attribution: {tracker_token: '123abc', tracker_name: 'tracker new', network: 'old'}}
    const formatted = {adid: '123', tracker_token: '123abc', tracker_name: 'tracker new', network: 'old'}

    ActivityState.default.current = {attribution: oldAttribution}
    request.default.mockResolvedValue(newAttribution)

    expect.assertions(3)

    Attribution.check({ask_in: 2000})

    jest.runOnlyPendingTimers()

    expect(request.default).toHaveBeenCalledTimes(1)

    return flushPromises()
      .then(() => {
        expect(Identity.updateAttribution).toHaveBeenCalledWith(formatted)
        expect(PubSub.publish).toHaveBeenCalledWith('attribution:change', formatted)
      })

  })

  it('requests timed-out attribution which requires yet another call', () => {

    const oldAttribution = {adid: '123', tracker_token: '123abc', tracker_name: 'tracker', network: 'old'}
    const newAttribution = {adid: '123', attribution: {tracker_token: '123abc', tracker_name: 'tracker', network: 'newest'}}
    const formatted = {adid: '123', tracker_token: '123abc', tracker_name: 'tracker', network: 'newest'}

    ActivityState.default.current = {attribution: oldAttribution}
    request.default.mockResolvedValue({ask_in: 3000})

    expect.assertions(9)

    Attribution.check({ask_in: 2000})

    jest.runOnlyPendingTimers()

    expect(request.default).toHaveBeenCalledTimes(1)

    return flushPromises()
      .then(() => {
        expect(Identity.updateAttribution).not.toHaveBeenCalled()
        expect(PubSub.publish).not.toHaveBeenCalled()

        jest.runOnlyPendingTimers()

        expect(request.default).toHaveBeenCalledTimes(2)

        return flushPromises()
      }).then(() => {

        expect(Identity.updateAttribution).not.toHaveBeenCalled()
        expect(PubSub.publish).not.toHaveBeenCalled()

        request.default.mockClear()
        request.default.mockResolvedValue(newAttribution)

        jest.runOnlyPendingTimers()

        expect(request.default).toHaveBeenCalledTimes(1)

        return flushPromises()
      }).then(() => {

        jest.runOnlyPendingTimers()

        expect(Identity.updateAttribution).toHaveBeenCalledWith(formatted)
        expect(PubSub.publish).toHaveBeenCalledWith('attribution:change', formatted)
      })
  })

  it('retires attribution request when failed request', () => {

    const newAttribution = {adid: '123', attribution: {tracker_token: '123abc', tracker_name: 'tracker', network: 'bla'}}
    const formatted = {adid: '123', tracker_token: '123abc', tracker_name: 'tracker', network: 'bla'}

    ActivityState.default.current = {}
    request.default.mockRejectedValue(errorResponse())

    expect.assertions(12)

    Attribution.check({ask_in: 2000})

    jest.runOnlyPendingTimers()

    expect(request.default).toHaveBeenCalledTimes(1)

    return flushPromises()
      .then(() => {

        expect(Identity.updateAttribution).not.toHaveBeenCalled()
        expect(PubSub.publish).not.toHaveBeenCalled()

        jest.runOnlyPendingTimers()

        expect(request.default).toHaveBeenCalledTimes(2)

        return flushPromises()
      }).then(() => {

        expect(Identity.updateAttribution).not.toHaveBeenCalled()
        expect(PubSub.publish).not.toHaveBeenCalled()

        jest.runOnlyPendingTimers()

        expect(request.default).toHaveBeenCalledTimes(3)

        return flushPromises()
      }).then(() => {

        expect(Identity.updateAttribution).not.toHaveBeenCalled()
        expect(PubSub.publish).not.toHaveBeenCalled()

        request.default.mockClear()
        request.default.mockResolvedValue(newAttribution)

        jest.runOnlyPendingTimers()

        expect(request.default).toHaveBeenCalledTimes(1)

        return flushPromises()
      }).then(() => {
        expect(Identity.updateAttribution).toHaveBeenCalledWith(formatted)
        expect(PubSub.publish).toHaveBeenCalledWith('attribution:change', formatted)
      })
  })

  it('cancels initiated attribution call', () => {

    const newAttribution = {adid: '123', attribution: {tracker_token: '123abc', tracker_name: 'tracker', network: 'new'}}

    ActivityState.default.current = {}
    request.default.mockResolvedValue(newAttribution)

    expect.assertions(3)

    Attribution.check({ask_in: 2000})
    Attribution.destroy()

    jest.runOnlyPendingTimers()

    expect(request.default).not.toHaveBeenCalled()

    return flushPromises()
      .then(() => {
        expect(Identity.updateAttribution).not.toHaveBeenCalled()
        expect(PubSub.publish).not.toHaveBeenCalled()
      })

  })

  it('cancels previously initiated attribution call with another one', () => {

    const newAttribution = {adid: '123', attribution: {tracker_token: '123abc', tracker_name: 'tracker', network: 'new'}}
    const formatted = {adid: '123', tracker_token: '123abc', tracker_name: 'tracker', network: 'new'}

    ActivityState.default.current = {}
    request.default.mockResolvedValue(newAttribution)

    expect.assertions(6)

    Attribution.check({ask_in: 2000})
    // initiate another attribution call
    Attribution.check({ask_in: 3000})

    jest.runOnlyPendingTimers()

    expect(request.default).toHaveBeenCalledTimes(1)

    return flushPromises()
      .then(() => {
        expect(request.default).toHaveBeenCalledTimes(1)
        expect(Identity.updateAttribution).toHaveBeenCalledTimes(1)
        expect(Identity.updateAttribution).toHaveBeenCalledWith(formatted)
        expect(PubSub.publish).toHaveBeenCalledTimes(1)
        expect(PubSub.publish).toHaveBeenCalledWith('attribution:change', formatted)
      })

  })

})
