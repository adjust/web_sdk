import { indexedDB as fakeIDB, IDBKeyRange } from 'fake-indexeddb'
import { values } from '../../utilities'

jest.useFakeTimers()

jest.mock('../../http')
jest.mock('../../logger')

describe('Custom namespace functionality', () => {
  global.indexedDB = fakeIDB
  global.IDBKeyRange = IDBKeyRange

  let AdjustInstance
  let Storage
  let IndexedDB
  let LocalStorage
  let QuickStorage

  const config = {
    appToken: 'some-app-token',
    environment: 'production',
    logLevel: 'verbose'
  }

  function nextTick (times = 1) {
    let result = Promise.resolve()
    for (let i = 0; i < times; i++) {
      result = result.then(() => {
        jest.runOnlyPendingTimers()
        return Utils.flushPromises()
      })
    }
    return result
  }

  function getFromLocalStorage (storage, storeName) {
    return localStorage.getItem(`${storage}.${storeName}`)
  }

  /**
   * Checks the localStorage contains saved preferences object
   */
  function expectStorageExists (storage) {
    const prefsStoreName = QuickStorage.storeNames.preferences.name
    const preferences = getFromLocalStorage(storage, prefsStoreName)
    expect(preferences).not.toBeNull()
  }

  /**
   * Checks the localStorage contains all the stores
   */
  function expectLocalStorageExists (storage, expectExists = true) {
    const storeNames = values(QuickStorage.storeNames)
    const stores = storeNames
      .map((storeOptions) => getFromLocalStorage(storage, storeOptions.name))
      .filter(i => i !== null && i !== undefined)

    if (expectExists) {
      expect(stores.length).toBe(storeNames.length)
    } else {
      // Preferences store exists even if IndexedDb available, so we expect there is 0 or 1 stores in local storage
      expect(stores.length).toBeLessThanOrEqual(1)
    }
  }

  /**
   * Checks indexeddb database exists or doesn't depending on `expectExists` argument
   * Function tries to open a database with provided name and expects callbacks called properly
   * 3 assertions
   */
  function expectDatabaseExists (name, expectExists = true) {
    let existedBefore = true

    const upgradeneededMock = jest.fn(() => existedBefore = false)
    const successMock = jest.fn((event) => {
      event.target.result.close()
      if (!existedBefore) {
        global.indexedDB.deleteDatabase(name)
      }
    })
    const errorMock = jest.fn()

    const request = global.indexedDB.open(name)

    request.onupgradeneeded = upgradeneededMock
    request.onerror = errorMock
    request.onsuccess = successMock

    return nextTick()
      .then(() => {
        if (expectExists) {
          expect(upgradeneededMock).not.toHaveBeenCalled()
        } else {
          expect(upgradeneededMock).toHaveBeenCalled()
        }

        jest.runOnlyPendingTimers()
      })
      .then(() => nextTick(2))
      .then(() => {
        expect(successMock).toHaveBeenCalled()
        expect(errorMock).not.toHaveBeenCalled()
      })
  }

  describe('Checks namespace is correct', () => {

    beforeEach(() => {
      QuickStorage = require('../../storage/quick-storage').default
      IndexedDB = require('../../storage/indexeddb').IndexedDB
      AdjustInstance = require('../../main').default

      jest.spyOn(IndexedDB, 'isSupported').mockImplementation(() => Promise.resolve(false))
    })

    afterEach(() => {
      AdjustInstance.stop()
      AdjustInstance.__testonly__.destroy()

      return AdjustInstance.__testonly__.clearDatabase()
        .then(() => {
          QuickStorage.deleteData(true)

          jest.clearAllMocks()
          jest.resetModules()
        })

    })

    function checkStorageMigrated (config) {
      const { namespace } = config
      const custom = !!namespace && namespace.length

      AdjustInstance.initSdk(config)

      expect.assertions(1)

      return Utils.flushPromises()
        .then(() => expectStorageExists(custom ? 'adjust-sdk-' + namespace : 'adjust-sdk'))
    }

    it.each([
      [{ ...config, namespace: undefined }],
      [{ ...config, namespace: null }],
      [{ ...config, namespace: '' }],
      [{ ...config, namespace: 'test' }]
    ])('Migrates only if proper namespace provided', checkStorageMigrated)

  })

  describe('No default-named storage created', () => {

    beforeEach(() => {
      QuickStorage = require('../../storage/quick-storage').default
      IndexedDB = require('../../storage/indexeddb').IndexedDB
      LocalStorage = require('../../storage/localstorage').LocalStorage
      AdjustInstance = require('../../main').default
    })

    afterEach(() => {
      QuickStorage.deleteData(true)

      jest.clearAllMocks()
      jest.resetModules()
    })

    it('Creates a custom-named IndexedDb storage', () => {
      AdjustInstance.initSdk({ ...config, namespace: 'test' })

      expect.assertions(3)

      return Utils.flushPromises()
        .then(() => nextTick(6))
        .then(() => {
          AdjustInstance.stop()
          AdjustInstance.__testonly__.destroy()
        })
        .then(() => expectDatabaseExists('adjust-sdk-test'))
        .then(() => AdjustInstance.__testonly__.clearDatabase())
    })

    it('Creates a custom-named LocalStorage storage', () => {
      jest.spyOn(IndexedDB, 'isSupported').mockImplementation(() => Promise.resolve(false))
      jest.spyOn(LocalStorage, 'isSupported').mockImplementation(() => Promise.resolve(true))

      AdjustInstance.initSdk({ ...config, namespace: 'test' })

      expect.assertions(1)

      return Utils.flushPromises()
        .then(() => expectLocalStorageExists('adjust-sdk-test'))
    })
  })

  describe('Default-named storage exists', () => {

    const activityState = { 'uuid': 'fake-uuid' }
    const namespace = 'test'
    const defaultName = 'adjust-sdk'
    const customName = `adjust-sdk-${namespace}`

    afterEach(() => {
      QuickStorage.deleteData(true)
      jest.resetModules()
    })

    describe('IndexedDb', () => {
      let Logger

      beforeEach(() => {
        QuickStorage = require('../../storage/quick-storage').default
        IndexedDB = require('../../storage/indexeddb').IndexedDB
        Storage = require('../../storage/storage').default

        return Storage.init() // No namespace initially set
          .then(() => Storage.addItem('activityState', activityState)) // Add some data to check it was cloned into new database
          .then(() => Storage.destroy())
          .then(Utils.flushPromises)
          .then(() => {
            jest.resetModules() // Reset Storage module to clear cached initialisation promise

            QuickStorage = require('../../storage/quick-storage').default
            IndexedDB = require('../../storage/indexeddb').IndexedDB
            Storage = require('../../storage/storage').default
            Logger = require('../../logger')

            jest.spyOn(IndexedDB.prototype, 'setCustomName') // Set mocks
            jest.spyOn(Logger.default, 'info')
          })
      })

      afterEach(() => {
        return AdjustInstance.__testonly__.clearDatabase()
          .then(() => {
            QuickStorage.deleteData(true)
          })
      })

      it('Migrates data', () => {
        expect.assertions(9)

        return Storage.init(namespace)
          .then(() => expect(IndexedDB.prototype.setCustomName).toHaveBeenCalledWith(namespace))
          .then(() => expect(Logger.default.info).toHaveBeenCalledWith('Database migration finished'))
          .then(() => expectDatabaseExists(defaultName, false)) // Check default-named database was removed
          .then(() => expectDatabaseExists(customName)) // And a custom-named one exists
          .then(() => Storage.getAll('activityState')) // Check new database contains data that was put into old one
          .then(records => expect(records[0]).toEqual(activityState))
      })

    })

    describe('LocalStorage', () => {
      function requireModules () {
        QuickStorage = require('../../storage/quick-storage').default
        LocalStorage = require('../../storage/localstorage').LocalStorage
        IndexedDB = require('../../storage/indexeddb').IndexedDB
        Storage = require('../../storage/storage').default

        jest.spyOn(IndexedDB, 'isSupported').mockImplementation(() => Promise.resolve(false))
        jest.spyOn(LocalStorage, 'isSupported').mockImplementation(() => Promise.resolve(true))
      }

      beforeAll(() => {
        requireModules()

        return Storage.init() // No namespace initially set
          .then(() => Storage.addItem('activityState', activityState)) // Add some data to check it was cloned into new database
          .then(() => {
            jest.resetModules() // Reset Storage module to clear cached initialisation promise

            requireModules()

            jest.spyOn(QuickStorage, 'setCustomName') // Set mocks
          })
      })

      it('Migrates data', () => {

        return Storage.init(namespace)
          .then(() => expect(QuickStorage.setCustomName).toHaveBeenCalledWith(namespace))
          .then(() => expectLocalStorageExists(defaultName, false)) // Check default-named database was removed
          .then(() => expectLocalStorageExists(customName)) // And a custom-named one exists
          .then(() => Storage.getAll('activityState')) // Check new database contains data that was put into old one
          .then(records => expect(records[0]).toEqual(activityState))
      })
    })
  })

})
