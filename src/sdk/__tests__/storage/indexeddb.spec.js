import fakeIDB from 'fake-indexeddb'
import * as IDBKeyRange from 'fake-indexeddb/lib/FDBKeyRange'
import * as IndexedDB from '../../storage/indexeddb'
import * as ActivityState from '../../activity-state'
import * as QuickStorage from '../../storage/quick-storage'
import * as Logger from '../../logger'
import * as SchemeMap from '../../storage/scheme-map'
import Suite from './storage.suite'

jest.mock('../../logger')

describe('IndexedDB usage', () => {

  const storeNames = SchemeMap.default.storeNames.left

  global.indexedDB = fakeIDB
  global.IDBKeyRange = IDBKeyRange

  beforeAll(() => {
    jest.spyOn(Logger.default, 'warn')
  })

  afterAll(() => {
    jest.restoreAllMocks()
  })

  it('checks if indexedDB is supported', () => {

    let supported = IndexedDB.isSupported()

    expect(supported).toBeTruthy()
    expect(Logger.default.warn).not.toHaveBeenCalled()

    delete global.indexedDB

    supported = IndexedDB.isSupported()

    expect(supported).toBeFalsy()
    expect(Logger.default.warn).toHaveBeenCalledWith('IndexedDB is not supported in this browser')

    global.indexedDB = fakeIDB

  })

  it('forces no-support of indexedDB on iOS devices', () => {

    expect.assertions(4)

    Utils.setGlobalProp(global.navigator, 'platform')
    const platformSpy = jest.spyOn(global.navigator, 'platform', 'get')
    platformSpy.mockReturnValue('iPhone')

    expect(IndexedDB.isSupported()).toBeFalsy()
    expect(Logger.default.warn).toHaveBeenCalledWith('IndexedDB is not supported in this browser')

    IndexedDB.getAll('activityState')
      .catch(error => {
        expect(error.name).toEqual('IDBNotSupported')
        expect(error.message).toEqual('IndexedDB is not supported')
      })

    platformSpy.mockRestore()
  })

  describe('run common tests for IndexedDB implementation', () => {
    jest.isolateModules(() => {
      const Storage = require('../../storage/storage').default

      afterEach(() => {
        fakeIDB._databases.clear()
        Storage.destroy()
      })

      it('sets storage type to indexedDB', () => {
        expect(Storage.type).toBe('indexedDB')
      })

      Suite(Storage)()
    })
  })

  describe('integration with Identity and data restore', () => {
    jest.isolateModules(() => {
      const Identity = require('../../identity')
      const Storage = require('../../storage/storage').default

      it('restores activityState record from the running memory when db gets destroyed', () => {

        let activityState = null

        expect.assertions(4)

        expect(Storage.type).toBe('indexedDB')

        return Identity.start()
          .then(() => {

            Storage.destroy()
            fakeIDB._databases.clear()

            activityState = ActivityState.default.current

            expect(activityState.uuid).toBeDefined()

            return Storage.getFirst('activityState')
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
          {kt: 'key-11', k: 'key-1', v: 'value-1', t: 1},
          {kt: 'key-21', k: 'key-2', v: 'value-2', t: 1},
          {kt: 'key-32', k: 'key-3', v: 'value-3', t: 2}
        ]

        beforeEach(() => {
          Identity.destroy()
          localStorage.clear()
          fakeIDB._databases.clear()
          Storage.destroy()
        })

        it('returns empty results when migration is not available', () => {

          expect.assertions(2)

          return Storage.getFirst('activityState')
            .then(result => {
              expect(result).toBeUndefined()

              return Storage.getAll('queue')
            })
            .then(result => {
              expect(result).toEqual([])
            })

        })

        it('returns result migrated from the localStorage when upgraded within restarted window session', () => {

          // prepare some rows manually
          QuickStorage.default.stores[storeNames.queue.name] = queueSet
          QuickStorage.default.stores[storeNames.activityState.name] = activityStateSet
          QuickStorage.default.stores[storeNames.globalParams.name] = globalParamsSet

          expect.assertions(6)

          return Storage.getFirst('activityState')
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

              return Storage.getAll('queue')
            })
            .then(result => {
              expect(result).toEqual([
                {timestamp: 1, url: '/url'},
                {timestamp: 2, url: '/event'}
              ])
              expect(QuickStorage.default.stores[storeNames.queue.name]).toBeNull()
              expect(QuickStorage.default.stores[storeNames.activityState.name]).toBeNull()
              expect(QuickStorage.default.stores[storeNames.globalParams.name]).toBeNull()

              return Storage.getAll('globalParams')
            })
            .then(result => {
              expect(result).toEqual([
                {keyType: 'key-11', key: 'key-1', value: 'value-1', type: 'callback'},
                {keyType: 'key-21', key: 'key-2', value: 'value-2', type: 'callback'},
                {keyType: 'key-32', key: 'key-3', value: 'value-3', type: 'partner'}
              ])
            })
        })

        it('returns result migrated from the localStorage for queue and globalParams when upgraded in the middle of the window session', () => {

          expect.assertions(8)

          let inMemoryActivityState = null

          return Identity.start()
            .then(() => {

              inMemoryActivityState = ActivityState.default.current

              expect(inMemoryActivityState.uuid).toBeDefined()

              // prepare some rows manually
              QuickStorage.default.stores[storeNames.queue.name] = queueSet
              QuickStorage.default.stores[storeNames.activityState.name] = activityStateSet
              QuickStorage.default.stores[storeNames.globalParams.name] = globalParamsSet

              Storage.destroy()
              fakeIDB._databases.clear()

              return Storage.getFirst('activityState')
            })
            .then(result => {

              expect(result).toEqual(inMemoryActivityState)
              expect(result.uuid).toBeDefined()

              return Storage.getAll('queue')
            })
            .then(result => {
              expect(result).toEqual([
                {timestamp: 1, url: '/url'},
                {timestamp: 2, url: '/event'}
              ])
              expect(QuickStorage.default.stores[storeNames.queue.name]).toBeNull()
              expect(QuickStorage.default.stores[storeNames.activityState.name]).toBeNull()
              expect(QuickStorage.default.stores[storeNames.globalParams.name]).toBeNull()

              return Storage.getAll('globalParams')
            })
            .then(result => {
              expect(result).toEqual([
                {keyType: 'key-11', key: 'key-1', value: 'value-1', type: 'callback'},
                {keyType: 'key-21', key: 'key-2', value: 'value-2', type: 'callback'},
                {keyType: 'key-32', key: 'key-3', value: 'value-3', type: 'partner'}
              ])
            })
        })

        it('ignores db close if there is no db instance', () => {
          expect(() => {
            Storage.destroy()
          }).not.toThrow()
        })

      })
    })
  })
})
