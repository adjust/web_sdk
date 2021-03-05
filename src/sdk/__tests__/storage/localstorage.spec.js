import Storage from '../../storage/storage'
import * as Identity from '../../identity'
import * as ActivityState from '../../activity-state'
import Suite from './storage.suite'
import { STORAGE_TYPES } from '../../constants'

jest.mock('../../logger')

describe('LocalStorage usage', () => {

  afterAll(() => {
    jest.restoreAllMocks()
  })

  describe('testing localStorage support', () => {
    let Logger

    jest.isolateModules(() => {

      beforeEach(() => {
        jest.resetModules()

        require('../../preferences')

        Logger = require('../../logger')
        jest.spyOn(Logger.default, 'warn')

        return Storage.init().then(() => Logger.default.warn.mockClear())
      })

      it('checks if localStorage is supported', () => {
        expect.assertions(2)

        const LocalStorage = require('../../storage/localstorage').LocalStorage

        return LocalStorage.isSupported()
          .then(supported => {
            expect(supported).toBeTruthy()
            expect(Logger.default.warn).not.toHaveBeenCalled()
          })
      })

      it('throws error if localStorage is not supported', () => {
        expect.assertions(2)

        const original = global.localStorage
        delete global.localStorage

        const LocalStorage = require('../../storage/localstorage').LocalStorage

        return LocalStorage.isSupported()
          .then(supported => {
            expect(supported).toBeFalsy()
            expect(Logger.default.warn).toHaveBeenCalledWith('LocalStorage is not supported in this browser')

            global.localStorage = original
          })
      })
    })
  })

  it('restores activityState record from the running memory when db gets destroyed', () => {

    let activityState = null

    expect.assertions(4)

    expect(Storage.getType()).toBe(STORAGE_TYPES.LOCAL_STORAGE)

    return Identity.start()
      .then(() => {

        Storage.destroy()
        localStorage.clear()

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

  describe('run common tests for LocalStorage implementation', () => {
    jest.isolateModules(() => {

      let Storage = null

      beforeAll(() => {
        jest.resetModules()

        require('../../storage/localstorage')
        Storage = require('../../storage/storage').default

        return Storage.init()
      })

      afterEach(() => {
        localStorage.clear()
        Storage.destroy()
      })

      it('sets storage type to localStorage', () => {
        expect(Storage.getType()).toBe(STORAGE_TYPES.LOCAL_STORAGE)
      })

      Suite(() => Storage)()
    })
  })

})
