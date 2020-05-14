import * as LocalStorage from '../../storage/localstorage'
import * as Storage from '../../storage/storage'
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

    expect.assertions(10)

    const original = global.localStorage
    let supported = LocalStorage.isSupported()

    expect(supported).toBeTruthy()
    expect(Logger.default.error).not.toHaveBeenCalled()

    delete global.localStorage

    supported = LocalStorage.isSupported()

    expect(supported).toBeFalsy()
    expect(Logger.default.error).toHaveBeenCalledWith('LocalStorage is not supported in this browser')

    return Storage.default.getItem('activityState')
      .catch(error => {
        expect(error.name).toEqual('LSNotSupported')
        expect(error.message).toEqual('LocalStorage is not supported')

        return Storage.default.getAll('activityState')
      })
      .catch(error => {
        expect(error.name).toEqual('LSNotSupported')
        expect(error.message).toEqual('LocalStorage is not supported')

        return Storage.default.clear('activityState')
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

    expect(Storage.default.type).toBe('localStorage')

    return Identity.start()
      .then(() => {

        Storage.default.destroy()
        localStorage.clear()

        activityState = ActivityState.default.current

        expect(activityState.uuid).toBeDefined()

        return Storage.default.getFirst('activityState')
      })
      .then(stored => {

        expect(stored).toEqual(activityState)
        expect(stored.uuid).toBeDefined()

        Identity.destroy()
      })

  })

  describe('run common tests for LocalStorage implementation', () => {
    afterEach(() => {
      localStorage.clear()
      Storage.default.destroy()
    })

    it('sets storage type to localStorage', () => {
      expect(Storage.default.type).toBe('localStorage')
    })

    Suite(Storage.default)()
  })

})
