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

  function getFromLocalStorage (storage, storeName) {
    return localStorage.getItem(`${storage}.${storeName}`)
  }

  function deleteDatabase (name) {
    return new Promise((resolve, reject) => {
      const request = global.indexedDB.deleteDatabase(name)
      request.onsuccess = () => resolve()
      request.onerror = reject
      request.onblocked = reject
    })
  }

  function checkIfDatabaseExists (name) {
    return new Promise((resolve, reject) => {
      let created = false
      const request = global.indexedDB.open(name)

      request.onupgradeneeded = () => {
        created = true
      }
      request.onerror = reject
      request.onsuccess = (event) => {
        const db = event.target.result
        db.close()
        resolve({ existed: !created, created })
      }
    })
  }

  async function databaseExists (name) {
    const result = await checkIfDatabaseExists(name)

    if (result.created) {
      await deleteDatabase(name)
    }

    return result.existed
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

  async function expectDatabaseExists (name, expectExists = true) {
    await expect(databaseExists(name)).resolves.toBe(expectExists)
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

    async function checkStorageMigrated (config) {
      const { namespace } = config
      const custom = !!namespace && namespace.length

      AdjustInstance.initSdk(config)

      await Utils.flushPromises()
      expectStorageExists(custom ? 'adjust-sdk-' + namespace : 'adjust-sdk')
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
      Storage = require('../../storage/storage').default
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

    it('Creates a custom-named IndexedDb storage', async () => {
      await Storage.init('test')
      Storage.destroy()

      await expectDatabaseExists('adjust-sdk-test')
      await Storage.deleteDatabase()
    })

    it('Creates a custom-named LocalStorage storage', async () => {
      jest.spyOn(IndexedDB, 'isSupported').mockImplementation(() => Promise.resolve(false))
      jest.spyOn(LocalStorage, 'isSupported').mockImplementation(() => Promise.resolve(true))

      AdjustInstance.initSdk({ ...config, namespace: 'test' })

      await Utils.flushPromises()
      expectLocalStorageExists('adjust-sdk-test')
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

      beforeEach(async () => {
        QuickStorage = require('../../storage/quick-storage').default
        IndexedDB = require('../../storage/indexeddb').IndexedDB
        Storage = require('../../storage/storage').default

        await Storage.init() // No namespace initially set
        await Storage.addItem('activityState', activityState) // Add some data to check it was cloned into new database
        Storage.destroy()
        await Utils.flushPromises()

        jest.resetModules() // Reset Storage module to clear cached initialisation promise

        QuickStorage = require('../../storage/quick-storage').default
        IndexedDB = require('../../storage/indexeddb').IndexedDB
        Storage = require('../../storage/storage').default
        Logger = require('../../logger')

        jest.spyOn(IndexedDB.prototype, 'setCustomName') // Set mocks
        jest.spyOn(Logger.default, 'info')
      })

      afterEach(() => {
        return AdjustInstance.__testonly__.clearDatabase()
          .then(() => {
            QuickStorage.deleteData(true)
          })
      })

      it('Migrates data', async () => {
        await Storage.init(namespace)

        expect(IndexedDB.prototype.setCustomName).toHaveBeenCalledWith(namespace)
        expect(Logger.default.info).toHaveBeenCalledWith('Database migration finished')
        await expectDatabaseExists(defaultName, false) // Check default-named database was removed
        await expectDatabaseExists(customName) // And a custom-named one exists
        await expect(Storage.getAll('activityState')).resolves.toEqual([activityState]) // Check new database contains data that was put into old one
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

      beforeAll(async () => {
        requireModules()

        await Storage.init() // No namespace initially set
        await Storage.addItem('activityState', activityState) // Add some data to check it was cloned into new database
        jest.resetModules() // Reset Storage module to clear cached initialisation promise

        requireModules()

        jest.spyOn(QuickStorage, 'setCustomName') // Set mocks
      })

      it('Migrates data', async () => {
        await Storage.init(namespace)

        expect(QuickStorage.setCustomName).toHaveBeenCalledWith(namespace)
        expectLocalStorageExists(defaultName, false) // Check default-named database was removed
        expectLocalStorageExists(customName) // And a custom-named one exists
        await expect(Storage.getAll('activityState')).resolves.toEqual([activityState]) // Check new database contains data that was put into old one
      })
    })
  })

})
