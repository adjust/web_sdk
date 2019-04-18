/* eslint-disable */
import * as Config from '../config'
import * as Attribution from '../attribution'
import * as request from '../request'
import * as PubSub from '../pub-sub'
import * as Time from '../time'
import * as Identity from '../identity'
import * as ActivityState from '../activity-state'
import {flushPromises} from './_helper'

jest.mock('../request')
jest.useFakeTimers()

describe('test attribution functionality', () => {

  beforeAll(() => {

    Object.assign(Config.default.baseParams, {
      app_token: '123abc',
      environment: 'sandbox',
      os_name: 'ios'
    })

    ActivityState.default.current = {}

    jest.spyOn(request, 'default')
    jest.spyOn(Identity, 'updateActivityState')
    jest.spyOn(PubSub, 'publish')
    jest.spyOn(Time, 'getTimestamp').mockReturnValue('some-time')
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

    expect.assertions(4)

    Attribution.checkAttribution({some: 'thing'})

    jest.runAllTimers()

    return flushPromises()
      .then(() => {
        expect(setTimeout.mock.calls[0][1]).toBe(150)
        expect(request.default).toHaveBeenCalledWith({
          url: '/attribution',
          params: {
            created_at: 'some-time',
            initiated_by: 'sdk',
            app_token: '123abc',
            environment: 'sandbox',
            os_name: 'ios'
          }
        })
        expect(Identity.updateActivityState).toHaveBeenCalledWith({attribution: formatted})
        expect(PubSub.publish).toHaveBeenCalledWith('attribution:change', formatted)
      })


  })

  it('sets timeout for attribution endpoint to be called which returns same attribution as before', () => {

    const currentAttribution = {adid: '123', attribution: {tracker_token: '123abc', tracker_name: 'tracker', network: 'bla'}}

    ActivityState.default.current = {attribution: Object.assign({adid: '123'}, currentAttribution.attribution)}
    request.default.mockResolvedValue(currentAttribution)

    expect.assertions(4)

    Attribution.checkAttribution({ask_in: 3000})

    jest.runAllTimers()

    return flushPromises()
      .then(() => {
        expect(setTimeout.mock.calls[0][1]).toBe(3000)
        expect(request.default).toHaveBeenCalledWith({
          url: '/attribution',
          params: {
            created_at: 'some-time',
            initiated_by: 'backend',
            app_token: '123abc',
            environment: 'sandbox',
            os_name: 'ios'
          }
        })
        expect(Identity.updateActivityState).not.toHaveBeenCalled()
        expect(PubSub.publish).not.toHaveBeenCalled()
      })

  })

  it('sets timeout for attribution endpoint to be called if no attribution found', () => {

    const newAttribution = {adid: '123', attribution: {tracker_token: '123abc', tracker_name: 'tracker', network: 'new'}}
    const formatted = {adid: '123', tracker_token: '123abc', tracker_name: 'tracker', network: 'new'}

    ActivityState.default.current = {}
    request.default.mockResolvedValue(newAttribution)

    expect.assertions(4)

    Attribution.checkAttribution({ask_in: 2000})

    jest.runAllTimers()

    return flushPromises()
      .then(() => {
        expect(setTimeout.mock.calls[0][1]).toBe(2000)
        expect(request.default).toHaveBeenCalledWith({
          url: '/attribution',
          params: {
            created_at: 'some-time',
            initiated_by: 'backend',
            app_token: '123abc',
            environment: 'sandbox',
            os_name: 'ios'
          }
        })
        expect(Identity.updateActivityState).toHaveBeenCalledWith({attribution: formatted})
        expect(PubSub.publish).toHaveBeenCalledWith('attribution:change', formatted)
      })

  })

  it('sets timeout for attribution endpoint to be called which returns different attribution (network is different)', () => {

    const oldAttribution = {adid: '123', tracker_token: '123abc', tracker_name: 'tracker', network: 'old'}
    const newAttribution = {adid: '123', attribution: {tracker_token: '123abc', tracker_name: 'tracker', network: 'new'}}
    const formatted = {adid: '123', tracker_token: '123abc', tracker_name: 'tracker', network: 'new'}

    ActivityState.default.current = {attribution: oldAttribution}
    request.default.mockResolvedValue(newAttribution)

    expect.assertions(4)

    Attribution.checkAttribution({ask_in: 2000})

    jest.runAllTimers()

    return flushPromises()
      .then(() => {
        expect(setTimeout.mock.calls[0][1]).toBe(2000)
        expect(request.default).toHaveBeenCalledWith({
          url: '/attribution',
          params: {
            created_at: 'some-time',
            initiated_by: 'backend',
            app_token: '123abc',
            environment: 'sandbox',
            os_name: 'ios'
          }
        })
        expect(Identity.updateActivityState).toHaveBeenCalledWith({attribution: formatted})
        expect(PubSub.publish).toHaveBeenCalledWith('attribution:change', formatted)
      })

  })

  it('sets timeout for attribution endpoint to be called which returns different attribution (tracker_name is different)', () => {

    const oldAttribution = {adid: '123', tracker_token: '123abc', tracker_name: 'tracker', network: 'old'}
    const newAttribution = {adid: '123', attribution: {tracker_token: '123abc', tracker_name: 'tracker new', network: 'old'}}
    const formatted = {adid: '123', tracker_token: '123abc', tracker_name: 'tracker new', network: 'old'}

    ActivityState.default.current = {attribution: oldAttribution}
    request.default.mockResolvedValue(newAttribution)

    expect.assertions(4)

    Attribution.checkAttribution({ask_in: 2000})

    jest.runAllTimers()

    return flushPromises()
      .then(() => {
        expect(setTimeout.mock.calls[0][1]).toBe(2000)
        expect(request.default).toHaveBeenCalledWith({
          url: '/attribution',
          params: {
            created_at: 'some-time',
            initiated_by: 'backend',
            app_token: '123abc',
            environment: 'sandbox',
            os_name: 'ios'
          }
        })
        expect(Identity.updateActivityState).toHaveBeenCalledWith({attribution: formatted})
        expect(PubSub.publish).toHaveBeenCalledWith('attribution:change', formatted)
      })

  })

  it('sets timeout for attribution endpoint to be called which returns ask_in', () => {

    const oldAttribution = {adid: '123', tracker_token: '123abc', tracker_name: 'tracker', network: 'old'}
    const newAttribution = {adid: '123', attribution: {tracker_token: '123abc', tracker_name: 'tracker', network: 'newest'}}
    const formatted = {adid: '123', tracker_token: '123abc', tracker_name: 'tracker', network: 'newest'}

    ActivityState.default.current = {attribution: oldAttribution}
    request.default.mockResolvedValue({ask_in: 3000})

    Attribution.checkAttribution({ask_in: 2000})

    jest.advanceTimersByTime(1)

    expect.assertions(10)

    return flushPromises()
      .then(() => {

        expect(setTimeout).toHaveBeenCalledTimes(1)
        expect(setTimeout.mock.calls[0][1]).toEqual(2000)
        expect(Identity.updateActivityState).not.toHaveBeenCalled()
        expect(PubSub.publish).not.toHaveBeenCalled()

        jest.advanceTimersByTime(2001)

        return flushPromises()
      }).then(() => {

        expect(setTimeout).toHaveBeenCalledTimes(2)
        expect(setTimeout.mock.calls[1][1]).toEqual(3000)
        expect(Identity.updateActivityState).not.toHaveBeenCalled()
        expect(PubSub.publish).not.toHaveBeenCalled()

        request.default.mockClear()
        request.default.mockResolvedValue(newAttribution)

        jest.runOnlyPendingTimers()

        return flushPromises()
      }).then(() => {
        expect(Identity.updateActivityState).toHaveBeenCalledWith({attribution: formatted})
        expect(PubSub.publish).toHaveBeenCalledWith('attribution:change', formatted)
      })
  })

  it('retires attribution request when failed request', () => {

    const currentAttribution = {adid: '123', attribution: {tracker_token: '123abc', tracker_name: 'tracker', network: 'bla'}}

    request.default.mockRejectedValue({error: 'An error'})

    Attribution.checkAttribution({ask_in: 2000})

    jest.advanceTimersByTime(1)

    expect.assertions(16)

    return flushPromises()
      .then(() => {
        expect(setTimeout).toHaveBeenCalledTimes(1)
        expect(setTimeout.mock.calls[0][1]).toEqual(2000)

        jest.runOnlyPendingTimers()

        return flushPromises()
      }).then(() => {
        expect(request.default).toHaveBeenCalledTimes(1)
        expect(setTimeout).toHaveBeenCalledTimes(2)
        expect(setTimeout.mock.calls[1][1]).toEqual(100)

        jest.runOnlyPendingTimers()

        return flushPromises()
      }).then(() => {
        expect(request.default).toHaveBeenCalledTimes(2)
        expect(setTimeout).toHaveBeenCalledTimes(3)
        expect(setTimeout.mock.calls[2][1]).toEqual(200)

        jest.runOnlyPendingTimers()

        return flushPromises()
      }).then(() => {
        expect(request.default).toHaveBeenCalledTimes(3)
        expect(setTimeout).toHaveBeenCalledTimes(4)
        expect(setTimeout.mock.calls[3][1]).toEqual(300)

        jest.runOnlyPendingTimers()

        return flushPromises()
      }).then(() => {
        expect(request.default).toHaveBeenCalledTimes(4)
        expect(setTimeout).toHaveBeenCalledTimes(5)
        expect(setTimeout.mock.calls[4][1]).toEqual(300)

        setTimeout.mockClear()
        request.default.mockClear()
        request.default.mockResolvedValue(currentAttribution)

        jest.runOnlyPendingTimers()

        return flushPromises()
      }).then(() => {
        expect(request.default).toHaveBeenCalledTimes(1)
        expect(setTimeout).not.toHaveBeenCalled()

        return flushPromises()
      })
  })

})
