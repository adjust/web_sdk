/* eslint-disable */
import * as Attribution from '../attribution'
import * as request from '../request'
import * as PubSub from '../pub-sub'
import * as Time from '../time'
import * as Identity from '../identity'
import * as ActivityState from '../activity-state'
import * as Logger from '../logger'
import * as StorageManager from '../storage-manager'
import * as Scheme from '../scheme'
import {errorResponse, flushPromises} from './_helper'

jest.mock('../request')
jest.mock('../logger')
jest.useFakeTimers()

describe('test attribution functionality', () => {

  const storeNames = Scheme.default.names

  beforeAll(() => {
    ActivityState.default.current = {}

    jest.spyOn(request, 'default')
    jest.spyOn(Identity, 'persist')
    jest.spyOn(PubSub, 'publish')
    jest.spyOn(Time, 'getTimestamp').mockReturnValue('some-time')
    jest.spyOn(Logger.default, 'log')
    jest.spyOn(ActivityState.default, 'updateSessionOffset')
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  afterAll(() => {
    ActivityState.default.destroy()

    jest.clearAllTimers()
    jest.restoreAllMocks()
  })

  it('does nothing if there is no ask_in parameter and attribution already stored', () => {

    ActivityState.default.current = {attribution: {tracker_token: '123abc', tracker_name: 'tracker', network: 'bla'}}

    const sessionResult = {some: 'thing'}
    const attributionPromise = Attribution.check(sessionResult)

    jest.runOnlyPendingTimers()

    expect.assertions(4)

    expect(request.default).not.toHaveBeenCalled()
    expect(ActivityState.default.updateSessionOffset).not.toHaveBeenCalled()
    expect(Identity.persist).not.toHaveBeenCalled()

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

    expect.assertions(8)

    Attribution.check({some: 'thing'})

    jest.runOnlyPendingTimers()

    expect(request.default).toHaveBeenCalledTimes(1)
    expect(request.default.mock.calls[0][0]).toMatchObject({
      url: '/attribution',
      params: {initiatedBy: 'sdk'}
    })
    expect(ActivityState.default.updateSessionOffset).toHaveBeenCalledTimes(1)
    expect(Identity.persist).toHaveBeenCalledTimes(1)

    return flushPromises()
      .then(() => StorageManager.default.getFirst(storeNames.activityState))
      .then(activityState => {
        expect(Identity.persist).toHaveBeenCalledTimes(2)
        expect(activityState.attribution).toEqual(formatted)
        expect(ActivityState.default.current.attribution).toEqual(formatted)
        expect(PubSub.publish).toHaveBeenCalledWith('attribution:change', formatted)
      })

  })

  it('requests timed-out attribution which returns the same as existing one', () => {

    const currentAttribution = {adid: '123', attribution: {tracker_token: '123abc', tracker_name: 'tracker', network: 'bla'}}
    const cachedActivityState = {attribution: Object.assign({adid: '123'}, currentAttribution.attribution)}

    ActivityState.default.current = cachedActivityState
    request.default.mockResolvedValue(currentAttribution)

    expect.assertions(8)

    Attribution.check({ask_in: 3000})

    jest.runOnlyPendingTimers()

    expect(request.default).toHaveBeenCalledTimes(1)
    expect(request.default.mock.calls[0][0]).toMatchObject({
      url: '/attribution',
      params: {initiatedBy: 'backend'}
    })
    expect(ActivityState.default.updateSessionOffset).toHaveBeenCalledTimes(1)
    expect(Identity.persist).toHaveBeenCalledTimes(1)

    return flushPromises()
      .then(() => StorageManager.default.getFirst(storeNames.activityState))
      .then(activityState => {
        expect(Identity.persist).toHaveBeenCalledTimes(1)
        expect(activityState.attribution).toEqual(cachedActivityState.attribution)
        expect(ActivityState.default.current.attribution).toEqual(cachedActivityState.attribution)
        expect(PubSub.publish).not.toHaveBeenCalled()
      })

  })

  it('requests timed-out attribution which returns new attribution', () => {

    const newAttribution = {adid: '123', attribution: {tracker_token: '123abc', tracker_name: 'tracker', network: 'new'}}
    const formatted = {adid: '123', tracker_token: '123abc', tracker_name: 'tracker', network: 'new'}

    ActivityState.default.current = {}
    request.default.mockResolvedValue(newAttribution)

    expect.assertions(7)

    Attribution.check({ask_in: 2000})

    jest.runOnlyPendingTimers()

    expect(request.default).toHaveBeenCalledTimes(1)
    expect(ActivityState.default.updateSessionOffset).toHaveBeenCalledTimes(1)
    expect(Identity.persist).toHaveBeenCalledTimes(1)

    return flushPromises()
      .then(() => StorageManager.default.getFirst(storeNames.activityState))
      .then(activityState => {
        expect(Identity.persist).toHaveBeenCalledTimes(2)
        expect(activityState.attribution).toEqual(formatted)
        expect(ActivityState.default.current.attribution).toEqual(formatted)
        expect(PubSub.publish).toHaveBeenCalledWith('attribution:change', formatted)
      })

  })

  it('requests timed-out attribution which returns different than existing one (network is different)', () => {

    const oldAttribution = {adid: '123', tracker_token: '123abc', tracker_name: 'tracker', network: 'old'}
    const newAttribution = {adid: '123', attribution: {tracker_token: '123abc', tracker_name: 'tracker', network: 'new'}}
    const formatted = {adid: '123', tracker_token: '123abc', tracker_name: 'tracker', network: 'new'}

    ActivityState.default.current = {attribution: oldAttribution}
    request.default.mockResolvedValue(newAttribution)

    expect.assertions(7)

    Attribution.check({ask_in: 2000})

    jest.runOnlyPendingTimers()

    expect(request.default).toHaveBeenCalledTimes(1)
    expect(ActivityState.default.updateSessionOffset).toHaveBeenCalledTimes(1)
    expect(Identity.persist).toHaveBeenCalledTimes(1)

    return flushPromises()
      .then(() => StorageManager.default.getFirst(storeNames.activityState))
      .then(activityState => {
        expect(Identity.persist).toHaveBeenCalledTimes(2)
        expect(activityState.attribution).toEqual(formatted)
        expect(ActivityState.default.current.attribution).toEqual(formatted)
        expect(PubSub.publish).toHaveBeenCalledWith('attribution:change', formatted)
      })

  })

  it('requests timed-out attribution which returns different than existing one (tracker_name is different)', () => {

    const oldAttribution = {adid: '123', tracker_token: '123abc', tracker_name: 'tracker', network: 'old'}
    const newAttribution = {adid: '123', attribution: {tracker_token: '123abc', tracker_name: 'tracker new', network: 'old'}}
    const formatted = {adid: '123', tracker_token: '123abc', tracker_name: 'tracker new', network: 'old'}

    ActivityState.default.current = {attribution: oldAttribution}
    request.default.mockResolvedValue(newAttribution)

    expect.assertions(6)

    Attribution.check({ask_in: 2000})

    jest.runOnlyPendingTimers()

    expect(request.default).toHaveBeenCalledTimes(1)
    expect(Identity.persist).toHaveBeenCalledTimes(1)

    return flushPromises()
      .then(() => StorageManager.default.getFirst(storeNames.activityState))
      .then(activityState => {
        expect(Identity.persist).toHaveBeenCalledTimes(2)
        expect(activityState.attribution).toEqual(formatted)
        expect(ActivityState.default.current.attribution).toEqual(formatted)
        expect(PubSub.publish).toHaveBeenCalledWith('attribution:change', formatted)
      })

  })

  it('requests timed-out attribution which requires yet another call', () => {

    const oldAttribution = {adid: '123', tracker_token: '123abc', tracker_name: 'tracker', network: 'old'}
    const newAttribution = {adid: '123', attribution: {tracker_token: '123abc', tracker_name: 'tracker', network: 'newest'}}
    const formatted = {adid: '123', tracker_token: '123abc', tracker_name: 'tracker', network: 'newest'}

    ActivityState.default.current = {attribution: oldAttribution}
    request.default.mockResolvedValue({ask_in: 3000})

    expect.assertions(16)

    Attribution.check({ask_in: 2000})

    jest.runOnlyPendingTimers()

    expect(request.default).toHaveBeenCalledTimes(1)
    expect(Identity.persist).toHaveBeenCalledTimes(1)

    return flushPromises()
      .then(() => StorageManager.default.getFirst(storeNames.activityState))
      .then(activityState => {
        expect(PubSub.publish).not.toHaveBeenCalled()
        expect(Identity.persist).toHaveBeenCalledTimes(1)
        expect(activityState.attribution).toEqual(oldAttribution)
        expect(ActivityState.default.current.attribution).toEqual(oldAttribution)

        jest.runOnlyPendingTimers()

        expect(request.default).toHaveBeenCalledTimes(2)

        return flushPromises()
      })
      .then(() => StorageManager.default.getFirst(storeNames.activityState))
      .then(activityState => {

        expect(PubSub.publish).not.toHaveBeenCalled()
        expect(Identity.persist).toHaveBeenCalledTimes(1)
        expect(activityState.attribution).toEqual(oldAttribution)
        expect(ActivityState.default.current.attribution).toEqual(oldAttribution)

        request.default.mockClear()
        request.default.mockResolvedValue(newAttribution)

        jest.runOnlyPendingTimers()

        expect(request.default).toHaveBeenCalledTimes(1)

        return flushPromises()
      })
      .then(() => StorageManager.default.getFirst(storeNames.activityState))
      .then(activityState => {

        jest.runOnlyPendingTimers()

        expect(activityState.attribution).toEqual(formatted)
        expect(ActivityState.default.current.attribution).toEqual(formatted)
        expect(Identity.persist).toHaveBeenCalledTimes(2)
        expect(PubSub.publish).toHaveBeenCalledWith('attribution:change', formatted)
      })
  })

  it('retires attribution request when failed request', () => {

    const newAttribution = {adid: '123', attribution: {tracker_token: '123abc', tracker_name: 'tracker', network: 'bla'}}
    const formatted = {adid: '123', tracker_token: '123abc', tracker_name: 'tracker', network: 'bla'}

    ActivityState.default.current = {}
    request.default.mockRejectedValue(errorResponse())

    expect.assertions(21)

    Attribution.check({ask_in: 2000})

    jest.runOnlyPendingTimers()

    expect(request.default).toHaveBeenCalledTimes(1)
    expect(Identity.persist).toHaveBeenCalledTimes(1)

    return flushPromises()
      .then(() => StorageManager.default.getFirst(storeNames.activityState))
      .then(activityState => {

        expect(PubSub.publish).not.toHaveBeenCalled()
        expect(Identity.persist).toHaveBeenCalledTimes(1)
        expect(activityState.attribution).toBeUndefined()
        expect(ActivityState.default.current.attribution).toBeUndefined()

        jest.runOnlyPendingTimers()

        expect(request.default).toHaveBeenCalledTimes(2)

        return flushPromises()
      })
      .then(() => StorageManager.default.getFirst(storeNames.activityState))
      .then(activityState => {

        expect(PubSub.publish).not.toHaveBeenCalled()
        expect(Identity.persist).toHaveBeenCalledTimes(1)
        expect(activityState.attribution).toBeUndefined()
        expect(ActivityState.default.current.attribution).toBeUndefined()

        jest.runOnlyPendingTimers()

        expect(request.default).toHaveBeenCalledTimes(3)

        return flushPromises()
      })
      .then(() => StorageManager.default.getFirst(storeNames.activityState))
      .then(activityState => {

        expect(PubSub.publish).not.toHaveBeenCalled()
        expect(Identity.persist).toHaveBeenCalledTimes(1)
        expect(activityState.attribution).toBeUndefined()
        expect(ActivityState.default.current.attribution).toBeUndefined()

        request.default.mockClear()
        request.default.mockResolvedValue(newAttribution)

        jest.runOnlyPendingTimers()

        expect(request.default).toHaveBeenCalledTimes(1)

        return flushPromises()
      })
      .then(() => StorageManager.default.getFirst(storeNames.activityState))
      .then(activityState => {
        expect(activityState.attribution).toEqual(formatted)
        expect(ActivityState.default.current.attribution).toEqual(formatted)
        expect(Identity.persist).toHaveBeenCalledTimes(2)
        expect(PubSub.publish).toHaveBeenCalledWith('attribution:change', formatted)
      })
  })

  it('cancels initiated attribution call', () => {

    const newAttribution = {adid: '123', attribution: {tracker_token: '123abc', tracker_name: 'tracker', network: 'new'}}

    ActivityState.default.current = {}
    request.default.mockResolvedValue(newAttribution)

    expect.assertions(6)

    Attribution.check({ask_in: 2000})
    Attribution.destroy()

    jest.runOnlyPendingTimers()

    expect(request.default).not.toHaveBeenCalled()
    expect(Identity.persist).toHaveBeenCalledTimes(1)

    return flushPromises()
      .then(() => StorageManager.default.getFirst(storeNames.activityState))
      .then(activityState => {
        expect(activityState.attribution).toBeUndefined()
        expect(ActivityState.default.current.attribution).toBeUndefined()
        expect(Identity.persist).toHaveBeenCalledTimes(1)
        expect(PubSub.publish).not.toHaveBeenCalled()
      })

  })

  it('cancels previously initiated attribution call with another one', () => {

    const newAttribution = {adid: '123', attribution: {tracker_token: '123abc', tracker_name: 'tracker', network: 'new'}}
    const formatted = {adid: '123', tracker_token: '123abc', tracker_name: 'tracker', network: 'new'}

    ActivityState.default.current = {}
    request.default.mockResolvedValue(newAttribution)

    expect.assertions(8)

    Attribution.check({ask_in: 2000})
    // initiate another attribution call
    Attribution.check({ask_in: 3000})

    jest.runOnlyPendingTimers()

    expect(request.default).toHaveBeenCalledTimes(1)
    expect(Identity.persist).toHaveBeenCalledTimes(2)

    return flushPromises()
      .then(() => StorageManager.default.getFirst(storeNames.activityState))
      .then(activityState => {
        expect(request.default).toHaveBeenCalledTimes(1)
        expect(activityState.attribution).toEqual(formatted)
        expect(ActivityState.default.current.attribution).toEqual(formatted)
        expect(Identity.persist).toHaveBeenCalledTimes(3)
        expect(PubSub.publish).toHaveBeenCalledTimes(1)
        expect(PubSub.publish).toHaveBeenCalledWith('attribution:change', formatted)
      })

  })

})
