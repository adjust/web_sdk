import * as Logger from '../logger'

jest.mock('../logger')

describe('test storage availability', () => {

  function mockAvailability (idbSupport, lsSupport) {
    jest.doMock('../indexeddb', () => ({
      isSupported () { return idbSupport }
    }))
    jest.doMock('../localstorage', () => ({
      isSupported () { return lsSupport }
    }))
  }

  beforeAll(() => {
    jest.spyOn(Logger.default, 'error')
    jest.spyOn(Logger.default, 'info')
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

      const StorageManager = require('../storage-manager')

      expect(StorageManager.default).toBeNull()
      expect(Logger.default.error).toHaveBeenCalledWith('There is no storage available, app will run with minimum set of features')
    })
  })

  it('sets indexedDB as available storage', () => {

    expect.assertions(2)

    jest.isolateModules(() => {
      mockAvailability(true, false)

      const StorageManager = require('../storage-manager')

      expect(StorageManager.default).not.toBeNull()
      expect(Logger.default.info).toHaveBeenCalledWith('Available storage is indexedDB')
    })
  })

  it('sets localStorage as available storage', () => {

    expect.assertions(2)

    jest.isolateModules(() => {
      mockAvailability(false, true)

      const StorageManager = require('../storage-manager')

      expect(StorageManager.default).not.toBeNull()
      expect(Logger.default.info).toHaveBeenCalledWith('Available storage is localStorage')
    })
  })

  it('prefers indexedDB over localStorage as available storage', () => {

    expect.assertions(2)

    jest.isolateModules(() => {
      mockAvailability(true, true)

      const StorageManager = require('../storage-manager')

      expect(StorageManager.default).not.toBeNull()
      expect(Logger.default.info).toHaveBeenCalledWith('Available storage is indexedDB')
    })
  })

})

