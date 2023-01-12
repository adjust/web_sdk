import * as Config from '../config'
import * as event from '../event'
import * as Queue from '../queue'
import * as Time from '../time'
import * as GlobalParams from '../global-params'
import * as Logger from '../logger'
import * as http from '../http'
import * as ActivityState from '../activity-state'
import * as Storage from '../storage/storage'

jest.mock('../http')
jest.mock('../logger')
jest.mock('../url-strategy')
jest.useFakeTimers()

const appOptions = {
  appToken: '123abc',
  environment: 'sandbox'
}

/**
 * Skips until Promises resolved and runs Jest timers to make event tracking promise resolve.
 * Expects that event was added to the Queue and than request wa sent over HTTP
 *
 *  2 assertions
 */
function expectRequest (requestConfig, timestamp) {

  const fullConfig = {
    endpoint: 'app',
    ...requestConfig,
    params: {
      attempts: 1,
      createdAt: 'some-time',
      timeSpent: 0,
      sessionLength: 0,
      sessionCount: 1,
      eventCount: 1,
      lastInterval: 0,
      ...requestConfig.params
    }
  }

  return Utils.flushPromises()
    .then(() => {
      expect(Queue.push).toHaveBeenCalledWith(requestConfig, { timestamp })

      jest.runOnlyPendingTimers()

      expect(http.default).toHaveBeenCalledWith(fullConfig)

      return Utils.flushPromises()
    })
}

describe('event tracking functionality', () => {

  beforeAll(() => {
    jest.spyOn(http, 'default')
    jest.spyOn(Queue, 'push')
    jest.spyOn(Time, 'getTimestamp').mockReturnValue('some-time')
    jest.spyOn(Logger.default, 'error')
    jest.spyOn(Logger.default, 'info')
    jest.spyOn(Logger.default, 'log')
    jest.spyOn(Storage.default, 'addItem')
    jest.spyOn(Storage.default, 'trimItems')

    ActivityState.default.init({ uuid: 'some-uuid' })
  })

  afterEach(() => {
    ActivityState.default.current = { ...ActivityState.default.current, eventCount: 0 }
    localStorage.clear()
    jest.clearAllMocks()
  })

  afterAll(() => {
    Config.default.destroy()
    ActivityState.default.destroy()

    jest.clearAllTimers()
    jest.restoreAllMocks()
  })

  describe('after initialisation', () => {

    beforeAll(() => {
      Config.default.set(appOptions)
    })

    it('logs an error and return when event token is not provided', async () => {
      const expected = 'You must provide event token in order to track event'

      expect.assertions(2)

      await expect(event.default({})).rejects.toBe(expected)
      expect(Logger.default.error).toHaveBeenCalledWith(expected)
    })

    it('resolves event request successfully without revenue and some map params', async () => {

      expect.assertions(3)

      const eventPromise = event.default({
        eventToken: '123abc',
        callbackParams: [{ key: 'some-key', value: 'some-value' }],
        revenue: 0
      })

      await expectRequest({
        url: '/event',
        method: 'POST',
        params: {
          eventToken: '123abc',
          callbackParams: { 'some-key': 'some-value' }
        }
      })

      await expect(eventPromise).toResolve()
    })

    it('resolves event request successfully without revenue and some map params 2', async () => {

      const timestamp = 1575380422927

      expect.assertions(3)

      const eventPromise = event.default({
        eventToken: '123abc',
        callbackParams: [{ key: 'some-key', value: 'some-value' }],
        revenue: 0
      }, timestamp)

      await expectRequest({
        url: '/event',
        method: 'POST',
        params: {
          eventToken: '123abc',
          callbackParams: { 'some-key': 'some-value' }
        }
      }, timestamp)

      await expect(eventPromise).toResolve()
    })

    it('resolves event request successfully with revenue but no currency', async () => {

      expect.assertions(3)

      const eventPromise = event.default({
        eventToken: '123abc',
        revenue: 1000
      })

      await expectRequest({
        url: '/event',
        method: 'POST',
        params: {
          eventToken: '123abc'
        }
      })

      await expect(eventPromise).toResolve()
    })

    it('resolves event request successfully but ignores malformed revenue', async () => {

      expect.assertions(3)

      const eventPromise = event.default({
        eventToken: '123abc',
        currency: 'EUR'
      })

      await expectRequest({
        url: '/event',
        method: 'POST',
        params: {
          eventToken: '123abc'
        }
      })

      await expect(eventPromise).toResolve()
    })

    it('resolves event request successfully with revenue and some map params', async () => {

      expect.assertions(3)

      const eventPromise = event.default({
        eventToken: '123abc',
        callbackParams: [
          { key: 'some-key', value: 'some-value' }
        ],
        partnerParams: [
          { key: 'key1', value: 'value1' },
          { key: 'key2', value: 'value2' }
        ],
        revenue: 100,
        currency: 'EUR'
      })

      await expectRequest({
        url: '/event',
        method: 'POST',
        params: {
          eventToken: '123abc',
          callbackParams: { 'some-key': 'some-value' },
          partnerParams: { key1: 'value1', key2: 'value2' },
          revenue: '100.00000',
          currency: 'EUR'
        }
      })

      await expect(eventPromise).toResolve()
    })

    it('sets default callback parameters to be appended to each track event request', async () => {

      const callbackParams = [
        { key: 'key1', value: 'value1' },
        { key: 'key2', value: 'value2' }
      ]

      expect.assertions(3)

      await GlobalParams.add(callbackParams, 'callback')

      const eventPromise = event.default({
        eventToken: 'bla',
        revenue: 34.67,
        currency: 'EUR'
      })

      await expectRequest({
        url: '/event',
        method: 'POST',
        params: {
          eventToken: 'bla',
          callbackParams: { key1: 'value1', key2: 'value2' },
          revenue: '34.67000',
          currency: 'EUR'
        }
      })

      await expect(eventPromise).toResolve()
    })

    it('sets default partner parameters to be appended to each track event request', async () => {

      const partnerParams = [
        { key: 'key1', value: 'value1' },
        { key: 'key2', value: 'value2' }
      ]

      expect.assertions(3)

      await GlobalParams.add(partnerParams, 'partner')

      const eventPromise = event.default({
        eventToken: 'bla'
      })

      await expectRequest({
        url: '/event',
        method: 'POST',
        params: {
          eventToken: 'bla',
          partnerParams: { key1: 'value1', key2: 'value2' }
        }
      })

      await expect(eventPromise).toResolve()
    })

    it('overrides some default callback parameters with callback parameters passed directly', async () => {

      const callbackParams = [
        { key: 'key1', value: 'value1' },
        { key: 'key2', value: 'value2' }
      ]

      expect.assertions(3)

      await GlobalParams.add(callbackParams, 'callback')

      const eventPromise = event.default({
        eventToken: 'bla',
        callbackParams: [
          { key: 'key1', value: 'new value1' },
          { key: 'key3', value: 'value3' }
        ]
      })

      await expectRequest({
        url: '/event',
        method: 'POST',
        params: {
          eventToken: 'bla',
          callbackParams: { key1: 'new value1', key2: 'value2', key3: 'value3' }
        }
      })

      await expect(eventPromise).toResolve()
    })

    it('sets default callback and partner parameters and override both with some parameters passed directly', () => {

      const callbackParams = [
        { key: 'key1', value: 'value1' },
        { key: 'key2', value: 'value2' },
        { key: 'key1', value: 'last value1' }
      ]
      const partnerParams = [
        { key: 'some', value: 'thing' },
        { key: 'very', value: 'nice' },
        { key: 'bla', value: 'truc' }
      ]
      expect.assertions(2)

      return Promise.all([
        GlobalParams.add(callbackParams, 'callback'),
        GlobalParams.add(partnerParams, 'partner')
      ])
        .then(() => {
          event.default({
            eventToken: 'bla',
            callbackParams: [
              { key: 'key2', value: 'new value2' }
            ],
            partnerParams: [
              { key: 'very', value: 'bad' },
              { key: 'trt', value: 'prc' }
            ]
          })

          return expectRequest({
            url: '/event',
            method: 'POST',
            params: {
              eventToken: 'bla',
              callbackParams: { key1: 'last value1', key2: 'new value2' },
              partnerParams: { some: 'thing', very: 'bad', bla: 'truc', trt: 'prc' }
            }
          })
        })
    })

    describe('event deduplication process', () => {

      it('resolves event request successfully when no deduplication id provided', async () => {
        expect.assertions(6)

        const eventPromise = event.default({
          eventToken: '123abc'
        })

        await expectRequest({
          url: '/event',
          method: 'POST',
          params: {
            eventToken: '123abc'
          }
        }) // + 2 assertions

        await expect(eventPromise).toResolve()

        expect(Storage.default.trimItems).not.toHaveBeenCalled()
        expect(Storage.default.addItem.mock.calls.length).toBe(1)
        expect(Storage.default.addItem.mock.calls[0][0]).toBe('queue')
      })

      it('resolves event request successfully when provided deduplication id does not exist in the list', async () => {

        expect.assertions(6)

        const eventPromise = event.default({
          eventToken: '123abc',
          deduplicationId: '123-abc-456'
        })

        await expectRequest({
          url: '/event',
          method: 'POST',
          params: {
            eventToken: '123abc',
            deduplicationId: '123-abc-456'
          }
        }) // + 2 assertions

        await expect(eventPromise).toResolve()

        expect(Storage.default.trimItems).not.toHaveBeenCalled()
        expect(Storage.default.addItem).toHaveBeenCalledWith('eventDeduplication', { id: '123-abc-456' })
        expect(Logger.default.info).toHaveBeenCalledWith('New event deduplication id is added to the list: 123-abc-456')
      })

      it('rejects event tracking when already existing deduplication id provided', async () => {

        const list = [
          { id: 'dedup-1234-abc' },
          { id: 'dedup-1235-abc' },
          { id: 'dedup-1236-abc' }
        ]

        expect.assertions(6)

        await Storage.default.addBulk('eventDeduplication', list)

        await expect(event.default({
          eventToken: '123abc',
          deduplicationId: 'dedup-1235-abc'
        })).toReject()

        expect(Storage.default.trimItems).not.toHaveBeenCalled()
        expect(Storage.default.addItem).not.toHaveBeenCalled()
        expect(Logger.default.error).toHaveBeenCalledWith('Event won\'t be tracked, since it was previously tracked with the same deduplication id dedup-1235-abc')

        expect(Queue.push).not.toHaveBeenCalled()
        jest.runOnlyPendingTimers()
        expect(http.default).not.toHaveBeenCalled()
      })
    })

    describe('trim deduplication list', () => {
      it('trims list by one when default limit is set', async () => {
        const list = [
          { id: 'dedup-1230-abc' },
          { id: 'dedup-1231-abc' },
          { id: 'dedup-1232-abc' },
          { id: 'dedup-1233-abc' },
          { id: 'dedup-1234-abc' },
          { id: 'dedup-1235-abc' },
          { id: 'dedup-1236-abc' },
          { id: 'dedup-1237-abc' },
          { id: 'dedup-1238-abc' },
          { id: 'dedup-1239-abc' }
        ]

        expect.assertions(14)

        await Storage.default.addBulk('eventDeduplication', list)

        const eventPromise = event.default({
          eventToken: '123abc',
          deduplicationId: 'dedup-1240-abc'
        })

        await expectRequest({
          url: '/event',
          method: 'POST',
          params: {
            eventToken: '123abc',
            deduplicationId: 'dedup-1240-abc'
          }
        }) // + 2 assertions

        await expect(eventPromise).toResolve()

        expect(Storage.default.trimItems).toHaveBeenCalledWith('eventDeduplication', 1)
        expect(Logger.default.log).toHaveBeenCalledWith('Event deduplication list limit has been reached. Oldest ids are about to be removed (1 of them)')
        expect(Storage.default.addItem).toHaveBeenCalledWith('eventDeduplication', { id: 'dedup-1240-abc' })
        expect(Logger.default.info).toHaveBeenCalledWith('New event deduplication id is added to the list: dedup-1240-abc')

        const currentList = await Storage.default.getAll('eventDeduplication')

        Storage.default.trimItems.mockClear()
        Storage.default.addItem.mockClear()
        Queue.push.mockClear()
        http.default.mockClear()

        expect(currentList.map(r => r.id)).toEqual([
          'dedup-1231-abc',
          'dedup-1232-abc',
          'dedup-1233-abc',
          'dedup-1234-abc',
          'dedup-1235-abc',
          'dedup-1236-abc',
          'dedup-1237-abc',
          'dedup-1238-abc',
          'dedup-1239-abc',
          'dedup-1240-abc'
        ])

        await expect(event.default({
          eventToken: '123abc',
          deduplicationId: 'dedup-1240-abc'
        })).toReject() // the error is being caught inside event tracking, so outside we have a fullfiled one

        expect(Storage.default.trimItems).not.toHaveBeenCalled()
        expect(Storage.default.addItem).not.toHaveBeenCalled()
        expect(Logger.default.error).toHaveBeenCalledWith('Event won\'t be tracked, since it was previously tracked with the same deduplication id dedup-1240-abc')

        expect(Queue.push).not.toHaveBeenCalled()
        jest.runOnlyPendingTimers()
        expect(http.default).not.toHaveBeenCalled()
      })

      it('trims the list by difference when custom limit is set and is lower than previous one', async () => {

        Config.default.destroy()
        Config.default.set({ ...appOptions, eventDeduplicationListLimit: 4 })

        const list = [
          { id: 'dedup-1232-abc' },
          { id: 'dedup-1233-abc' },
          { id: 'dedup-1234-abc' },
          { id: 'dedup-1235-abc' },
          { id: 'dedup-1236-abc' },
          { id: 'dedup-1237-abc' },
          { id: 'dedup-1238-abc' },
          { id: 'dedup-1239-abc' }
        ]

        expect.assertions(8)

        await Storage.default.addBulk('eventDeduplication', list)

        const eventPromise = event.default({
          eventToken: '123abc',
          deduplicationId: 'dedup-1240-abc'
        })

        await expectRequest({
          url: '/event',
          method: 'POST',
          params: {
            eventToken: '123abc',
            deduplicationId: 'dedup-1240-abc'
          }
        }) // + 2 assertions

        await expect(eventPromise).toResolve()

        expect(Storage.default.trimItems).toHaveBeenCalledWith('eventDeduplication', 5)
        expect(Logger.default.log).toHaveBeenCalledWith('Event deduplication list limit has been reached. Oldest ids are about to be removed (5 of them)')
        expect(Storage.default.addItem).toHaveBeenCalledWith('eventDeduplication', { id: 'dedup-1240-abc' })
        expect(Logger.default.info).toHaveBeenCalledWith('New event deduplication id is added to the list: dedup-1240-abc')

        const currentList = await Storage.default.getAll('eventDeduplication')

        expect(currentList.map(r => r.id)).toEqual([
          'dedup-1237-abc',
          'dedup-1238-abc',
          'dedup-1239-abc',
          'dedup-1240-abc'
        ])
      })

      it('skips trim when custom limit is set and is greater than the previous one', async () => {

        Config.default.destroy()
        Config.default.set({ ...appOptions, eventDeduplicationListLimit: 16 })

        const list = [
          { id: 'dedup-1230-abc' },
          { id: 'dedup-1231-abc' },
          { id: 'dedup-1232-abc' },
          { id: 'dedup-1233-abc' },
          { id: 'dedup-1234-abc' },
          { id: 'dedup-1235-abc' },
          { id: 'dedup-1236-abc' },
          { id: 'dedup-1237-abc' },
          { id: 'dedup-1238-abc' },
          { id: 'dedup-1239-abc' }
        ]

        expect.assertions(7)

        await Storage.default.addBulk('eventDeduplication', list)

        const eventPromise = event.default({
          eventToken: '123abc',
          deduplicationId: 'dedup-1240-abc'
        })

        // letting event to be resolved
        await expectRequest({
          url: '/event',
          method: 'POST',
          params: {
            eventToken: '123abc',
            deduplicationId: 'dedup-1240-abc'
          }
        }) // + 2 assertions

        await expect(eventPromise).toResolve()

        expect(Storage.default.trimItems).not.toHaveBeenCalled()
        expect(Storage.default.addItem).toHaveBeenCalledWith('eventDeduplication', { id: 'dedup-1240-abc' })
        expect(Logger.default.info).toHaveBeenCalledWith('New event deduplication id is added to the list: dedup-1240-abc')

        const currentList = await Storage.default.getAll('eventDeduplication')

        expect(currentList.map(r => r.id)).toEqual([
          'dedup-1230-abc',
          'dedup-1231-abc',
          'dedup-1232-abc',
          'dedup-1233-abc',
          'dedup-1234-abc',
          'dedup-1235-abc',
          'dedup-1236-abc',
          'dedup-1237-abc',
          'dedup-1238-abc',
          'dedup-1239-abc',
          'dedup-1240-abc'
        ])

      })
    })
  })
})
