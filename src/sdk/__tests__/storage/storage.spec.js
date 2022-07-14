import * as Logger from '../../logger'
import { STORAGE_TYPES } from '../../constants'
import * as IndexedDB from '../../storage/indexeddb'
import * as LocalStorage from '../../storage/localstorage'

jest.mock('../../logger')

jest.mock('../../storage/indexeddb')
jest.mock('../../storage/localstorage')

describe('test storage availability', () => {

  function mockAvailability (idbSupport, lsSupport) {
    jest.spyOn(IndexedDB.IndexedDB, 'isSupported').mockImplementation(() => Promise.resolve(idbSupport))
    jest.spyOn(IndexedDB.IndexedDB.prototype, 'setCustomName').mockImplementation(() => Promise.resolve())

    jest.spyOn(LocalStorage.LocalStorage, 'isSupported').mockImplementation(() => Promise.resolve(lsSupport))
  }

  beforeAll(() => {
    jest.spyOn(Logger.default, 'error')
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  afterAll(() => {
    jest.restoreAllMocks()
  })

  it('reports that there is no storage available', () => {

    expect.assertions(2)

    jest.isolateModules(() => {
      mockAvailability(false, false)

      const Storage = require('../../storage/storage').default

      return Storage.init()
        .then(storage => {
          expect(storage.type).toBe(STORAGE_TYPES.NO_STORAGE)

          expect(Logger.default.error).toHaveBeenCalledWith('There is no storage available, app will run with minimum set of features')
        })
    })
  })

  it('sets indexedDB as available storage', () => {

    expect.assertions(2)

    jest.isolateModules(() => {
      mockAvailability(true, false)

      const Storage = require('../../storage/storage').default

      return Storage.init()
        .then(storage => {
          expect(storage).not.toBeNull()
          expect(Storage.getType()).toBe(STORAGE_TYPES.INDEXED_DB)
        })
    })
  })

  it('sets localStorage as available storage', () => {

    expect.assertions(2)

    jest.isolateModules(() => {
      mockAvailability(false, true)

      const Storage = require('../../storage/storage').default

      return Storage.init()
        .then(storage => {
          expect(storage).not.toBeNull()
          expect(Storage.getType()).toBe(STORAGE_TYPES.LOCAL_STORAGE)
        })
    })
  })

  it('prefers indexedDB over localStorage as available storage', () => {

    expect.assertions(2)

    jest.isolateModules(() => {
      mockAvailability(true, true)

      const Storage = require('../../storage/storage').default

      return Storage.init()
        .then(storage => {
          expect(storage).not.toBeNull()
          expect(Storage.getType()).toBe(STORAGE_TYPES.INDEXED_DB)
        })
    })
  })

})

