/* eslint-disable */
import * as Config from '../config'
import * as Attribution from '../attribution'
import * as request from '../request'
import * as Storage from '../storage'
import * as PubSub from '../pub-sub'
import * as Time from '../time'
import * as Identity from '../identity'
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

    jest.spyOn(request, 'default')
    jest.spyOn(Storage.default, 'updateItem')
    jest.spyOn(Identity, 'checkActivityState')
    jest.spyOn(PubSub, 'publish')
    jest.spyOn(Time, 'getTimestamp').mockReturnValue('some-time')
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  afterAll(() => {
    Object.assign(Config.default.baseParams, {
      app_token: '',
      environment: '',
      os_name: ''
    })

    jest.clearAllTimers()
    jest.restoreAllMocks()
  })

  it('does not do anything if there is no ask_in parameter', () => {

    expect.assertions(2)

    Attribution.checkAttribution({some: 'thing'})
      .then(result => {
        expect(result).toEqual({some: 'thing'})
        expect(setTimeout).not.toHaveBeenCalled()
      })

    jest.runAllTimers()

  })

  it('sets timeout for attribution endpoint to be called which returns same attribution as before', () => {

    const currentAttribution = {adid: '123', attribution: {tracker_token: '123abc', tracker_name: 'tracker', network: 'bla'}}

    Identity.checkActivityState.mockResolvedValue({attribution: Object.assign({adid: '123'}, currentAttribution.attribution)})
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
            app_token: '123abc',
            environment: 'sandbox',
            os_name: 'ios'
          }
        })
        expect(Storage.default.updateItem).not.toHaveBeenCalled()
        expect(PubSub.publish).not.toHaveBeenCalled()
      })

  })

  it('sets timeout for attribution endpoint to be called if no attribution found', () => {

    const newAttribution = {adid: '123', attribution: {tracker_token: '123abc', tracker_name: 'tracker', network: 'new'}}
    const formatted = {adid: '123', tracker_token: '123abc', tracker_name: 'tracker', network: 'new'}

    Identity.checkActivityState.mockResolvedValue({})
    request.default.mockResolvedValue(newAttribution)

    expect.assertions(5)

    Attribution.checkAttribution({ask_in: 2000})

    jest.runAllTimers()

    return flushPromises()
      .then(() => {
        expect(setTimeout.mock.calls[0][1]).toBe(2000)
        expect(request.default).toHaveBeenCalledWith({
          url: '/attribution',
          params: {
            created_at: 'some-time',
            app_token: '123abc',
            environment: 'sandbox',
            os_name: 'ios'
          }
        })
        expect(Storage.default.updateItem.mock.calls[0][0]).toEqual('activityState')
        expect(Storage.default.updateItem.mock.calls[0][1]).toEqual({attribution: formatted})
        expect(PubSub.publish).toHaveBeenCalledWith('attribution:change', formatted)
      })

  })

  it('sets timeout for attribution endpoint to be called which returns different attribution (network is different)', () => {

    const oldAttribution = {adid: '123', tracker_token: '123abc', tracker_name: 'tracker', network: 'old'}
    const newAttribution = {adid: '123', attribution: {tracker_token: '123abc', tracker_name: 'tracker', network: 'new'}}
    const formatted = {adid: '123', tracker_token: '123abc', tracker_name: 'tracker', network: 'new'}

    Identity.checkActivityState.mockResolvedValue({attribution: oldAttribution})
    request.default.mockResolvedValue(newAttribution)

    expect.assertions(5)

    Attribution.checkAttribution({ask_in: 2000})

    jest.runAllTimers()

    return flushPromises()
      .then(() => {
        expect(setTimeout.mock.calls[0][1]).toBe(2000)
        expect(request.default).toHaveBeenCalledWith({
          url: '/attribution',
          params: {
            created_at: 'some-time',
            app_token: '123abc',
            environment: 'sandbox',
            os_name: 'ios'
          }
        })
        expect(Storage.default.updateItem.mock.calls[0][0]).toEqual('activityState')
        expect(Storage.default.updateItem.mock.calls[0][1]).toEqual({attribution: formatted})
        expect(PubSub.publish).toHaveBeenCalledWith('attribution:change', formatted)
      })

  })

  it('sets timeout for attribution endpoint to be called which returns different attribution (tracker_name is different)', () => {

    const oldAttribution = {adid: '123', tracker_token: '123abc', tracker_name: 'tracker', network: 'old'}
    const newAttribution = {adid: '123', attribution: {tracker_token: '123abc', tracker_name: 'tracker new', network: 'old'}}
    const formatted = {adid: '123', tracker_token: '123abc', tracker_name: 'tracker new', network: 'old'}

    Identity.checkActivityState.mockResolvedValue({attribution: oldAttribution})
    request.default.mockResolvedValue(newAttribution)

    expect.assertions(5)

    Attribution.checkAttribution({ask_in: 2000})

    jest.runAllTimers()

    return flushPromises()
      .then(() => {
        expect(setTimeout.mock.calls[0][1]).toBe(2000)
        expect(request.default).toHaveBeenCalledWith({
          url: '/attribution',
          params: {
            created_at: 'some-time',
            app_token: '123abc',
            environment: 'sandbox',
            os_name: 'ios'
          }
        })
        expect(Storage.default.updateItem.mock.calls[0][0]).toEqual('activityState')
        expect(Storage.default.updateItem.mock.calls[0][1]).toEqual({attribution: formatted})
        expect(PubSub.publish).toHaveBeenCalledWith('attribution:change', formatted)
      })

  })

  it('sets timeout for attribution endpoint to be called which returns ask_in', () => {

    const oldAttribution = {adid: '123', tracker_token: '123abc', tracker_name: 'tracker', network: 'old'}
    const newAttribution = {adid: '123', attribution: {tracker_token: '123abc', tracker_name: 'tracker', network: 'newest'}}
    const formatted = {adid: '123', tracker_token: '123abc', tracker_name: 'tracker', network: 'newest'}

    Identity.checkActivityState.mockResolvedValue({attribution: oldAttribution})
    request.default.mockResolvedValue({ask_in: 3000})

    Attribution.checkAttribution({ask_in: 2000})

    jest.advanceTimersByTime(1)

    expect.assertions(11)

    return flushPromises()
      .then(() => {

        expect(setTimeout).toHaveBeenCalledTimes(1)
        expect(setTimeout.mock.calls[0][1]).toEqual(2000)
        expect(Storage.default.updateItem).not.toHaveBeenCalled()
        expect(PubSub.publish).not.toHaveBeenCalled()

        jest.advanceTimersByTime(2001)

        return flushPromises()
      }).then(() => {

        expect(setTimeout).toHaveBeenCalledTimes(2)
        expect(setTimeout.mock.calls[1][1]).toEqual(3000)
        expect(Storage.default.updateItem).not.toHaveBeenCalled()
        expect(PubSub.publish).not.toHaveBeenCalled()

        request.default.mockClear()
        request.default.mockResolvedValue(newAttribution)

        jest.runOnlyPendingTimers()

        return flushPromises()
      }).then(() => {
        expect(Storage.default.updateItem.mock.calls[0][0]).toEqual('activityState')
        expect(Storage.default.updateItem.mock.calls[0][1]).toEqual({attribution: formatted})
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
