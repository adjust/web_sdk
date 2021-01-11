import * as LocalStorage from '../../storage/localstorage'
import Storage from '../../storage/storage'
import * as Identity from '../../identity'
import * as ActivityState from '../../activity-state'
import * as Logger from '../../logger'
import Suite from './storage.suite'
import { STORAGE_TYPES } from '../../constants'

jest.mock('../../logger')

describe('LocalStorage usage', () => {

  beforeAll(() => {
    jest.spyOn(Logger.default, 'warn')

    return Storage.init()
      .then(() => Logger.default.warn.mockClear())
  })

  afterAll(() => {
    jest.restoreAllMocks()
  })

  it('checks if localStorage is supported', () => {

    expect.assertions(10)

    const original = global.localStorage
    let supported = LocalStorage.isSupported()

    expect(supported).toBeTruthy()
    expect(Logger.default.warn).not.toHaveBeenCalled()

    delete global.localStorage

    supported = LocalStorage.isSupported()

    expect(supported).toBeFalsy()
    expect(Logger.default.warn).toHaveBeenCalledWith('LocalStorage is not supported in this browser')

    return Storage.getItem('activityState')
      .catch(error => {
        expect(error.name).toEqual('LSNotSupported')
        expect(error.message).toEqual('LocalStorage is not supported')

        return Storage.getAll('activityState')
      })
      .catch(error => {
        expect(error.name).toEqual('LSNotSupported')
        expect(error.message).toEqual('LocalStorage is not supported')

        return Storage.clear('activityState')
      })
      .catch(error => {
        expect(error.name).toEqual('LSNotSupported')
        expect(error.message).toEqual('LocalStorage is not supported')

        global.localStorage = original
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

    beforeAll(() => {
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
