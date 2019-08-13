import * as LocalStorage from '../../storage/localstorage'
import * as StorageManager from '../../storage/storage-manager'
import * as Identity from '../../identity'
import * as ActivityState from '../../activity-state'
import * as Logger from '../../logger'
import Suite from './storage.suite'

jest.mock('../../logger')

describe('LocalStorage usage', () => {

  beforeAll(() => {
    jest.spyOn(Logger.default, 'error')
  })

  afterAll(() => {
    jest.restoreAllMocks()
  })

  it('checks if localStorage is supported', () => {

    const original = window.localStorage
    let supported = LocalStorage.isSupported()

    expect(supported).toBeTruthy()
    expect(Logger.default.error).not.toHaveBeenCalled()

    delete window.localStorage

    supported = LocalStorage.isSupported()

    expect(supported).toBeFalsy()
    expect(Logger.default.error).toHaveBeenCalledWith('LocalStorage is not supported in this browser')

    window.localStorage = original
  })


  it('restores activityState record from the running memory when db gets destroyed', () => {

    let activityState = null

    expect.assertions(4)

    expect(StorageManager.default.type).toBe('localStorage')

    return Identity.start()
      .then(() => {

        StorageManager.default.destroy()
        localStorage.clear()

        activityState = ActivityState.default.current

        expect(activityState.uuid).toBeDefined()

        return StorageManager.default.getFirst('activityState')
      })
      .then(stored => {

        expect(stored).toEqual(activityState)
        expect(stored.uuid).toBeDefined()

        Identity.destroy()
      })

  })

  describe('run common tests for LocalStorage implementation', () => {
    it('sets storage type to localStorage', () => {
      expect(StorageManager.default.type).toBe('localStorage')
    })

    Suite(StorageManager.default)()
  })

})
