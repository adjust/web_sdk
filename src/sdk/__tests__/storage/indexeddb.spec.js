import fakeIDB from 'fake-indexeddb'
import * as IDBKeyRange from 'fake-indexeddb/lib/FDBKeyRange'
import * as IndexedDB from '../../storage/indexeddb'
import * as ActivityState from '../../activity-state'
import * as QuickStorage from '../../storage/quick-storage'
import * as Logger from '../../logger'
import * as SchemeMap from '../../storage/scheme-map'
import runSuite from './_storage.common'

jest.mock('../../logger')

describe('IndexedDB usage', () => {

  const storeNames = SchemeMap.default.storeNames.left

  window.indexedDB = fakeIDB
  window.IDBKeyRange = IDBKeyRange

  beforeAll(() => {
    jest.spyOn(Logger.default, 'error')
  })

  afterAll(() => {
    jest.restoreAllMocks()
  })

  it('checks if indexedDB is supported', () => {

    let supported = IndexedDB.isSupported()

    expect(supported).toBeTruthy()
    expect(Logger.default.error).not.toHaveBeenCalled()

    delete window.indexedDB

    supported = IndexedDB.isSupported()

    expect(supported).toBeFalsy()
    expect(Logger.default.error).toHaveBeenCalledWith('IndexedDB is not supported in this browser')

    window.indexedDB = fakeIDB

  })

  describe('run common tests for IndexedDB implementation', () => {
    jest.isolateModules(() => {
      const StorageManager = require('../../storage/storage-manager').default

      it('sets storage type to indexedDB', () => {
        expect(StorageManager.type).toBe('indexedDB')
      })

      runSuite(StorageManager)()
    })
  })

  describe('integration with Identity and data restore', () => {
    jest.isolateModules(() => {
      const Identity = require('../../identity')
      const StorageManager = require('../../storage/storage-manager').default

      it('restores activityState record from the running memory when db gets destroyed', () => {

        let activityState = null

        expect.assertions(4)

        expect(StorageManager.type).toBe('indexedDB')

        return Identity.start()
          .then(() => {

            StorageManager.destroy()
            fakeIDB._databases.clear()

            activityState = ActivityState.default.current

            expect(activityState.uuid).toBeDefined()

            return StorageManager.getFirst('activityState')
          })
          .then(stored => {

            expect(stored).toEqual(activityState)
            expect(stored.uuid).toBeDefined()

            Identity.destroy()
          })
      })

      describe('tests in case indexedDB got supported due to a browser upgrade', () => {

        const queueSet = [
          {t: 1, u: '/url'},
          {t: 2, u: 2}
        ]
        const activityStateSet = [
          {u: 1, la: 12345, at: {a: 'blabla', tt: '123abc', tn: 'tracker', nt: 'bla'}}
        ]
        const globalParamsSet = [
          {k: 'key-1', v: 'value-1', t: 1},
          {k: 'key-2', v: 'value-2', t: 1},
          {k: 'key-3', v: 'value-3', t: 2}
        ]

        beforeEach(() => {
          Identity.destroy()
          localStorage.clear()
          fakeIDB._databases.clear()
          StorageManager.destroy()
        })

        it('returns empty results when migration is not available', () => {

          expect.assertions(2)

          return StorageManager.getFirst('activityState')
            .then(result => {
              expect(result).toBeUndefined()

              return StorageManager.getAll('queue')
            })
            .then(result => {
              expect(result).toEqual([])
            })

        })

        it('returns result migrated from the localStorage when upgraded within restarted window session', () => {

          // prepare some rows manually
          QuickStorage.default.stores[storeNames.queue] = queueSet
          QuickStorage.default.stores[storeNames.activityState] = activityStateSet
          QuickStorage.default.stores[storeNames.globalParams] = globalParamsSet

          expect.assertions(6)

          return StorageManager.getFirst('activityState')
            .then(result => {
              expect(result).toEqual({
                uuid: 1,
                lastActive: 12345,
                attribution: {
                  adid: 'blabla',
                  tracker_token: '123abc',
                  tracker_name: 'tracker',
                  network: 'bla'
                }
              })

              return StorageManager.getAll('queue')
            })
            .then(result => {
              expect(result).toEqual([
                {timestamp: 1, url: '/url'},
                {timestamp: 2, url: '/event'}
              ])
              expect(QuickStorage.default.stores[storeNames.queue]).toBeNull()
              expect(QuickStorage.default.stores[storeNames.activityState]).toBeNull()
              expect(QuickStorage.default.stores[storeNames.globalParams]).toBeNull()

              return StorageManager.getAll('globalParams')
            })
            .then(result => {
              expect(result).toEqual([
                {key: 'key-1', value: 'value-1', type: 'callback'},
                {key: 'key-2', value: 'value-2', type: 'callback'},
                {key: 'key-3', value: 'value-3', type: 'partner'}
              ])
            })
        })

        it('returns result migrated from localStorage for queue and globalParams when upgraded in the middle of the window session', () => {

          expect.assertions(8)

          let inMemoryActivityState = null

          return Identity.start()
            .then(() => {

              inMemoryActivityState = ActivityState.default.current

              expect(inMemoryActivityState.uuid).toBeDefined()

              // prepare some rows manually
              QuickStorage.default.stores[storeNames.queue] = queueSet
              QuickStorage.default.stores[storeNames.activityState] = activityStateSet
              QuickStorage.default.stores[storeNames.globalParams] = globalParamsSet

              StorageManager.destroy()
              fakeIDB._databases.clear()

              return StorageManager.getFirst('activityState')
            })
            .then(result => {

              expect(result).toEqual(inMemoryActivityState)
              expect(result.uuid).toBeDefined()

              return StorageManager.getAll('queue')
            })
            .then(result => {
              expect(result).toEqual([
                {timestamp: 1, url: '/url'},
                {timestamp: 2, url: '/event'}
              ])
              expect(QuickStorage.default.stores[storeNames.queue]).toBeNull()
              expect(QuickStorage.default.stores[storeNames.activityState]).toBeNull()
              expect(QuickStorage.default.stores[storeNames.globalParams]).toBeNull()

              return StorageManager.getAll('globalParams')
            })
            .then(result => {
              expect(result).toEqual([
                {key: 'key-1', value: 'value-1', type: 'callback'},
                {key: 'key-2', value: 'value-2', type: 'callback'},
                {key: 'key-3', value: 'value-3', type: 'partner'}
              ])
            })
        })

      })
    })
  })
})
