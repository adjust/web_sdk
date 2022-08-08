import * as Attribution from '../attribution'
import * as http from '../http'
import * as PubSub from '../pub-sub'
import * as Time from '../time'
import * as Identity from '../identity'
import * as ActivityState from '../activity-state'
import * as Logger from '../logger'
import * as Storage from '../storage/storage'

jest.mock('../http')
jest.mock('../logger')
jest.useFakeTimers()

describe('test attribution functionality', () => {

  beforeAll(() => {
    ActivityState.default.init({})

    jest.spyOn(http, 'default')
    jest.spyOn(Identity, 'persist')
    jest.spyOn(PubSub, 'publish')
    jest.spyOn(Time, 'getTimestamp').mockReturnValue('some-time')
    jest.spyOn(Logger.default, 'log')
    jest.spyOn(ActivityState.default, 'updateSessionOffset')
    jest.spyOn(global, 'setTimeout')
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

    ActivityState.default.current = {attribution: {tracker_token: '123abc', tracker_name: 'tracker', network: 'bla'}, installed: 1}

    const sessionResult = {some: 'thing'}
    const attributionPromise = Attribution.check(sessionResult)

    jest.runOnlyPendingTimers()

    expect.assertions(4)

    expect(http.default).not.toHaveBeenCalled()
    expect(ActivityState.default.updateSessionOffset).not.toHaveBeenCalled()
    expect(Identity.persist).not.toHaveBeenCalled()

    attributionPromise
      .then(result => {
        expect(result).toEqual(ActivityState.default.current)
      })

  })

  it('does self-initiated attribution call after initial session', () => {

    const newAttribution = {adid: '123', attribution: {tracker_token: '123abc', tracker_name: 'tracker', network: 'new', something: 'wrong'}}
    const formatted = {adid: '123', tracker_token: '123abc', tracker_name: 'tracker', network: 'new'}

    ActivityState.default.current = {installed: 1}
    http.default.mockResolvedValue(newAttribution)

    expect.assertions(8)

    Attribution.check()

    jest.runOnlyPendingTimers()

    expect(http.default).toHaveBeenCalledTimes(1)
    expect(http.default.mock.calls[0][0]).toMatchObject({
      url: '/attribution',
      params: {initiatedBy: 'sdk'}
    })
    expect(ActivityState.default.updateSessionOffset).toHaveBeenCalledTimes(1)
    expect(Identity.persist).toHaveBeenCalledTimes(1)

    return Utils.flushPromises()
      .then(() => Storage.default.getFirst('activityState'))
      .then(activityState => {
        expect(Identity.persist).toHaveBeenCalledTimes(2)
        expect(activityState.attribution).toEqual(formatted)
        expect(ActivityState.default.current.attribution).toEqual(formatted)
        expect(PubSub.publish).toHaveBeenCalledWith('attribution:change', formatted)
      })

  })

  it('tries self-initiated attribution call but cancels if no initial session recognized', () => {

    ActivityState.default.current = {}

    const attributionPromise = Attribution.check()

    jest.runOnlyPendingTimers()

    expect.assertions(4)

    expect(http.default).not.toHaveBeenCalled()
    expect(ActivityState.default.updateSessionOffset).not.toHaveBeenCalled()
    expect(Identity.persist).not.toHaveBeenCalled()

    attributionPromise
      .then(result => {
        expect(result).toEqual({})
      })

  })

  it('request attribution but retries request if retry_in was returned by backend', () => {

    ActivityState.default.current = {installed: 1}
    http.default.mockResolvedValue({retry_in: 2500})

    expect.assertions(24)

    Attribution.check()

    jest.runOnlyPendingTimers()

    expect(http.default).toHaveBeenCalledTimes(1)
    expect(http.default.mock.calls[0][0]).toMatchObject({
      url: '/attribution',
      params: {initiatedBy: 'sdk'}
    })
    expect(ActivityState.default.updateSessionOffset).toHaveBeenCalledTimes(1)
    expect(Identity.persist).toHaveBeenCalledTimes(1)
    expect(setTimeout).toHaveBeenCalledTimes(1)
    expect(setTimeout).toHaveBeenLastCalledWith(expect.any(Function), 150)

    return Utils.flushPromises()
      .then(() => Storage.default.getFirst('activityState'))
      .then(activityState => {
        expect(Identity.persist).toHaveBeenCalledTimes(1)
        expect(activityState.attribution).toBeUndefined()
        expect(ActivityState.default.current.attribution).toBeUndefined()
        expect(PubSub.publish).not.toHaveBeenCalled()
        expect(setTimeout).toHaveBeenCalledTimes(2)
        expect(setTimeout).toHaveBeenLastCalledWith(expect.any(Function), 2500)

        http.default.mockResolvedValue({retry_in: 3500})

        jest.runOnlyPendingTimers()

        expect(http.default).toHaveBeenCalledTimes(2)

        return Utils.flushPromises()
      })
      .then(() => Storage.default.getFirst('activityState'))
      .then(activityState => {
        expect(Identity.persist).toHaveBeenCalledTimes(1)
        expect(activityState.attribution).toBeUndefined()
        expect(ActivityState.default.current.attribution).toBeUndefined()
        expect(PubSub.publish).not.toHaveBeenCalled()
        expect(setTimeout).toHaveBeenCalledTimes(3)
        expect(setTimeout).toHaveBeenLastCalledWith(expect.any(Function), 3500)

        http.default.mockClear()
        http.default.mockResolvedValue('')

        jest.runOnlyPendingTimers()

        expect(http.default).toHaveBeenCalledTimes(1)

        return Utils.flushPromises()
      })
      .then(() => Storage.default.getFirst('activityState'))
      .then(activityState => {

        jest.runOnlyPendingTimers()

        expect(activityState.attribution).toBeUndefined()
        expect(ActivityState.default.current.attribution).toBeUndefined()
        expect(Identity.persist).toHaveBeenCalledTimes(1)
        expect(PubSub.publish).not.toHaveBeenCalled()
      })
  })

  it('ignores empty attribution result even if there is no stored attribution at the moment', () => {

    ActivityState.default.current = {installed: 1}
    http.default.mockResolvedValue(null)

    expect.assertions(8)

    Attribution.check({ask_in: 200})

    jest.runOnlyPendingTimers()

    expect(http.default).toHaveBeenCalledTimes(1)
    expect(http.default.mock.calls[0][0]).toMatchObject({
      url: '/attribution',
      params: {initiatedBy: 'backend'}
    })
    expect(ActivityState.default.updateSessionOffset).toHaveBeenCalledTimes(1)
    expect(Identity.persist).toHaveBeenCalledTimes(1)

    return Utils.flushPromises()
      .then(() => Storage.default.getFirst('activityState'))
      .then(activityState => {
        expect(Identity.persist).toHaveBeenCalledTimes(1)
        expect(activityState.attribution).toBeUndefined()
        expect(ActivityState.default.current.attribution).toBeUndefined()
        expect(PubSub.publish).not.toHaveBeenCalled()
      })

  })

  it('ignores attribution result with unknown parameters', () => {

    ActivityState.default.current = {installed: 1}
    http.default.mockResolvedValue({some: 'thing', totally: 'unknown'})

    expect.assertions(8)

    Attribution.check({ask_in: 2000})

    jest.runOnlyPendingTimers()

    expect(http.default).toHaveBeenCalledTimes(1)
    expect(http.default.mock.calls[0][0]).toMatchObject({
      url: '/attribution',
      params: {initiatedBy: 'backend'}
    })
    expect(ActivityState.default.updateSessionOffset).toHaveBeenCalledTimes(1)
    expect(Identity.persist).toHaveBeenCalledTimes(1)

    return Utils.flushPromises()
      .then(() => Storage.default.getFirst('activityState'))
      .then(activityState => {
        expect(Identity.persist).toHaveBeenCalledTimes(1)
        expect(activityState.attribution).toBeUndefined()
        expect(ActivityState.default.current.attribution).toBeUndefined()
        expect(PubSub.publish).not.toHaveBeenCalled()
      })

  })

  it('requests timed-out attribution which returns the same as existing one', () => {

    const currentAttribution = {adid: '123', attribution: {tracker_token: '123abc', tracker_name: 'tracker', network: 'bla'}}
    const cachedActivityState = {attribution: {adid: '123', ...currentAttribution.attribution}, installed: 1}

    ActivityState.default.current = cachedActivityState
    http.default.mockResolvedValue(currentAttribution)

    expect.assertions(8)

    Attribution.check({ask_in: 3000})

    jest.runOnlyPendingTimers()

    expect(http.default).toHaveBeenCalledTimes(1)
    expect(http.default.mock.calls[0][0]).toMatchObject({
      url: '/attribution',
      params: {initiatedBy: 'backend'}
    })
    expect(ActivityState.default.updateSessionOffset).toHaveBeenCalledTimes(1)
    expect(Identity.persist).toHaveBeenCalledTimes(1)

    return Utils.flushPromises()
      .then(() => Storage.default.getFirst('activityState'))
      .then(activityState => {
        expect(Identity.persist).toHaveBeenCalledTimes(1)
        expect(activityState.attribution).toEqual(cachedActivityState.attribution)
        expect(ActivityState.default.current.attribution).toEqual(cachedActivityState.attribution)
        expect(PubSub.publish).not.toHaveBeenCalled()
      })

  })

  it('requests timed-out attribution which returns new attribution', () => {

    const newAttribution = {adid: '123', attribution: {tracker_token: '123abc', tracker_name: 'tracker', network: 'new', state: 'installed'}}
    const formatted = {adid: '123', tracker_token: '123abc', tracker_name: 'tracker', network: 'new', state: 'installed'}

    ActivityState.default.current = {installed: 1}
    http.default.mockResolvedValue(newAttribution)

    expect.assertions(7)

    Attribution.check({ask_in: 2000})

    jest.runOnlyPendingTimers()

    expect(http.default).toHaveBeenCalledTimes(1)
    expect(ActivityState.default.updateSessionOffset).toHaveBeenCalledTimes(1)
    expect(Identity.persist).toHaveBeenCalledTimes(1)

    return Utils.flushPromises()
      .then(() => Storage.default.getFirst('activityState'))
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

    ActivityState.default.current = {attribution: oldAttribution, installed: 1}
    http.default.mockResolvedValue(newAttribution)

    expect.assertions(7)

    Attribution.check({ask_in: 2000})

    jest.runOnlyPendingTimers()

    expect(http.default).toHaveBeenCalledTimes(1)
    expect(ActivityState.default.updateSessionOffset).toHaveBeenCalledTimes(1)
    expect(Identity.persist).toHaveBeenCalledTimes(1)

    return Utils.flushPromises()
      .then(() => Storage.default.getFirst('activityState'))
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

    ActivityState.default.current = {attribution: oldAttribution, installed: 1}
    http.default.mockResolvedValue(newAttribution)

    expect.assertions(6)

    Attribution.check({ask_in: 2000})

    jest.runOnlyPendingTimers()

    expect(http.default).toHaveBeenCalledTimes(1)
    expect(Identity.persist).toHaveBeenCalledTimes(1)

    return Utils.flushPromises()
      .then(() => Storage.default.getFirst('activityState'))
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

    ActivityState.default.current = {attribution: oldAttribution, installed: 1}
    http.default.mockResolvedValue({ask_in: 3000})

    expect.assertions(22)

    Attribution.check({ask_in: 2000})

    jest.runOnlyPendingTimers()

    expect(http.default).toHaveBeenCalledTimes(1)
    expect(Identity.persist).toHaveBeenCalledTimes(1)
    expect(setTimeout).toHaveBeenCalledTimes(1)
    expect(setTimeout).toHaveBeenLastCalledWith(expect.any(Function), 2000)

    return Utils.flushPromises()
      .then(() => Storage.default.getFirst('activityState'))
      .then(activityState => {
        expect(PubSub.publish).not.toHaveBeenCalled()
        expect(Identity.persist).toHaveBeenCalledTimes(1)
        expect(activityState.attribution).toEqual(oldAttribution)
        expect(ActivityState.default.current.attribution).toEqual(oldAttribution)
        expect(setTimeout).toHaveBeenCalledTimes(2)
        expect(setTimeout).toHaveBeenLastCalledWith(expect.any(Function), 3000)

        jest.runOnlyPendingTimers()

        expect(http.default).toHaveBeenCalledTimes(2)

        return Utils.flushPromises()
      })
      .then(() => Storage.default.getFirst('activityState'))
      .then(activityState => {

        expect(PubSub.publish).not.toHaveBeenCalled()
        expect(Identity.persist).toHaveBeenCalledTimes(1)
        expect(activityState.attribution).toEqual(oldAttribution)
        expect(ActivityState.default.current.attribution).toEqual(oldAttribution)
        expect(setTimeout).toHaveBeenCalledTimes(3)
        expect(setTimeout).toHaveBeenLastCalledWith(expect.any(Function), 3000)

        http.default.mockClear()
        http.default.mockResolvedValue(newAttribution)

        jest.runOnlyPendingTimers()

        expect(http.default).toHaveBeenCalledTimes(1)

        return Utils.flushPromises()
      })
      .then(() => Storage.default.getFirst('activityState'))
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

    ActivityState.default.current = {installed: 1}
    http.default.mockRejectedValue(Utils.errorResponse())

    expect.assertions(21)

    Attribution.check({ask_in: 2000})

    jest.runOnlyPendingTimers()

    expect(http.default).toHaveBeenCalledTimes(1)
    expect(Identity.persist).toHaveBeenCalledTimes(1)

    return Utils.flushPromises()
      .then(() => Storage.default.getFirst('activityState'))
      .then(activityState => {

        expect(PubSub.publish).not.toHaveBeenCalled()
        expect(Identity.persist).toHaveBeenCalledTimes(1)
        expect(activityState.attribution).toBeUndefined()
        expect(ActivityState.default.current.attribution).toBeUndefined()

        jest.runOnlyPendingTimers()

        expect(http.default).toHaveBeenCalledTimes(2)

        return Utils.flushPromises()
      })
      .then(() => Storage.default.getFirst('activityState'))
      .then(activityState => {

        expect(PubSub.publish).not.toHaveBeenCalled()
        expect(Identity.persist).toHaveBeenCalledTimes(1)
        expect(activityState.attribution).toBeUndefined()
        expect(ActivityState.default.current.attribution).toBeUndefined()

        jest.runOnlyPendingTimers()

        expect(http.default).toHaveBeenCalledTimes(3)

        return Utils.flushPromises()
      })
      .then(() => Storage.default.getFirst('activityState'))
      .then(activityState => {

        expect(PubSub.publish).not.toHaveBeenCalled()
        expect(Identity.persist).toHaveBeenCalledTimes(1)
        expect(activityState.attribution).toBeUndefined()
        expect(ActivityState.default.current.attribution).toBeUndefined()

        http.default.mockClear()
        http.default.mockResolvedValue(newAttribution)

        jest.runOnlyPendingTimers()

        expect(http.default).toHaveBeenCalledTimes(1)

        return Utils.flushPromises()
      })
      .then(() => Storage.default.getFirst('activityState'))
      .then(activityState => {
        expect(activityState.attribution).toEqual(formatted)
        expect(ActivityState.default.current.attribution).toEqual(formatted)
        expect(Identity.persist).toHaveBeenCalledTimes(2)
        expect(PubSub.publish).toHaveBeenCalledWith('attribution:change', formatted)
      })
  })

  it('cancels initiated attribution call', () => {

    const newAttribution = {adid: '123', attribution: {tracker_token: '123abc', tracker_name: 'tracker', network: 'new'}}

    ActivityState.default.current = {installed: 1}
    http.default.mockResolvedValue(newAttribution)

    expect.assertions(6)

    Attribution.check({ask_in: 2000})
    Attribution.destroy()

    jest.runOnlyPendingTimers()

    expect(http.default).not.toHaveBeenCalled()
    expect(Identity.persist).toHaveBeenCalledTimes(1)

    return Utils.flushPromises()
      .then(() => Storage.default.getFirst('activityState'))
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

    ActivityState.default.current = {installed: 1}
    http.default.mockResolvedValue(newAttribution)

    expect.assertions(8)

    Attribution.check({ask_in: 2000})
    // initiate another attribution call
    Attribution.check({ask_in: 3000})

    jest.runOnlyPendingTimers()

    expect(http.default).toHaveBeenCalledTimes(1)
    expect(Identity.persist).toHaveBeenCalledTimes(2)

    return Utils.flushPromises()
      .then(() => Storage.default.getFirst('activityState'))
      .then(activityState => {
        expect(http.default).toHaveBeenCalledTimes(1)
        expect(activityState.attribution).toEqual(formatted)
        expect(ActivityState.default.current.attribution).toEqual(formatted)
        expect(Identity.persist).toHaveBeenCalledTimes(3)
        expect(PubSub.publish).toHaveBeenCalledTimes(1)
        expect(PubSub.publish).toHaveBeenCalledWith('attribution:change', formatted)
      })

  })

})
