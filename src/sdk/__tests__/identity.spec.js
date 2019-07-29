import * as Identity from '../identity'
import * as StorageManager from '../storage/storage-manager'
import * as ActivityState from '../activity-state'
import * as State from '../state'
import * as Logger from '../logger'
import * as QuickStorage from '../storage/quick-storage'
import * as PubSub from '../pub-sub'
import {flushPromises} from './_common'
import {extend} from '../utilities'

jest.mock('../logger')

describe('test identity methods', () => {

  const storeNames = QuickStorage.default.names

  beforeAll(() => {
    jest.spyOn(PubSub, 'publish')
    jest.spyOn(StorageManager.default, 'getFirst')
    jest.spyOn(StorageManager.default, 'addItem')
    jest.spyOn(StorageManager.default, 'updateItem')
    jest.spyOn(ActivityState.default, 'destroy')
    jest.spyOn(Logger.default, 'log')
  })

  afterEach(() => {
    jest.clearAllMocks()
    localStorage.clear()
    Identity.destroy()
    State.default.session = null
    State.default.disabled = null
  })

  afterAll(() => {
    jest.restoreAllMocks()
  })

  it('destroys identity by destroying activity  state', () => {

    Identity.destroy()

    expect(ActivityState.default.destroy).toHaveBeenCalled()

  })

  describe('test toggle disable depending on initialization state', () => {

    afterEach(() => {
      StorageManager.default.clear('activityState')
      StorageManager.default.getFirst.mockClear()
      Identity.destroy()
    })

    it('checks disabled state before initiation', () => {

      expect(State.default.disabled).toBeNull()

      Identity.disable()

      expect(State.default.disabled).toBe('general')

      Identity.disable()

      expect(Logger.default.log).toHaveBeenLastCalledWith('Adjust SDK is already disabled')

      Identity.enable()

      expect(State.default.disabled).toBeNull()

      Identity.enable()

      expect(Logger.default.log).toHaveBeenLastCalledWith('Adjust SDK is already enabled')

    })

    it('checks disabled state after initiation', () => {

      expect.assertions(2)

      return Identity.start()
        .then(() => {
          expect(State.default.disabled).toBeNull()

          Identity.disable()

          expect(State.default.disabled).toBe('general')
        })
    })

    it('checks disabled state after initiation when initially disabled', () => {

      expect.assertions(2)

      Identity.disable()

      return Identity.start()
        .then(() => {
          expect(State.default.disabled).toBe('general')

          Identity.enable()

          expect(State.default.disabled).toBeNull()
        })
    })

    it('checks disabled state after storage has been lost', () => {

      expect(State.default.disabled).toBeNull()

      Identity.disable()

      expect(State.default.disabled).toBe('general')

      localStorage.clear()

      expect(State.default.disabled).toBe('general')

    })

    it('checks if disabled due to GDPR-Forget-Me request', () => {

      Identity.disable('gdpr')

      expect(State.default.disabled).toBe('gdpr')

      Identity.enable()

      expect(State.default.disabled).toBe('gdpr')
      expect(Logger.default.log).toHaveBeenLastCalledWith('Adjust SDK is disabled due to GDPR-Forget-me request and it can not be re-enabled')

      Identity.disable()

      expect(Logger.default.log).toHaveBeenLastCalledWith('Adjust SDK is already disabled')
      expect(State.default.disabled).toBe('gdpr')

    })

  })

  describe('when activity state exists', () => {

    beforeEach(() => {
      return StorageManager.default.addItem('activityState', {uuid: '123'})
        .then(() => {
          StorageManager.default.addItem.mockClear()
          return Identity.start()
        })
    })

    it('gets existing activity state', () => {
      expect(ActivityState.default.current).toEqual({uuid: '123'})
    })

    it('checks activity state and returns existing one', () => {

      expect.assertions(3)

      return Identity.start()
        .then(activityState => {

          const cachedActivityState = ActivityState.default.current

          expect(activityState).toEqual(cachedActivityState)
          expect(activityState).toEqual({uuid: '123'})
          expect(StorageManager.default.addItem).not.toHaveBeenCalled()
        })
    })

    it('checks activity state and restores from memory if storage got lost in the meantime', () => {

      expect.assertions(4)

      return StorageManager.default.deleteItem('activityState', '123')
        .then(Identity.start)
        .then(activityState => {

          const cachedActivityState = ActivityState.default.current

          expect(activityState).toEqual(cachedActivityState)
          expect(activityState).toEqual({uuid: '123'})
          expect(StorageManager.default.addItem).toHaveBeenCalledTimes(1)
          expect(StorageManager.default.addItem).toHaveBeenCalledWith('activityState', {uuid: '123'})
        })
    })

    it('checks activity state and restores disabled state from memory if storage got lost in the meantime', () => {

      expect.assertions(2)

      Identity.disable()

      QuickStorage.default.stores[storeNames.disabled] = null

      return Identity.start()
        .then(() => {
          expect(State.default.disabled).toEqual('general')
          expect(QuickStorage.default.stores[storeNames.disabled]).toEqual(1)
        })
    })

    it('checks activity state and creates new one when both storage and in-memory state are lost', () => {

      expect.assertions(4)

      Identity.destroy()

      return StorageManager.default.deleteItem('activityState', '123')
        .then(Identity.start)
        .then(activityState => {

          const cachedActivityState = ActivityState.default.current

          expect(activityState).toEqual(cachedActivityState)
          expect(activityState.uuid).not.toBe('123')
          expect(activityState.uuid).toBeDefined()
          expect(StorageManager.default.addItem).toHaveBeenCalledTimes(1)
        })
    })

    it('update last active', () => {

      expect.assertions(2)

      jest.spyOn(Date, 'now').mockReturnValueOnce(456)

      return Identity.persist()
        .then(activityState => {
          expect(activityState).toEqual({uuid: '123', lastActive: 456})
          expect(ActivityState.default.current).toEqual({uuid: '123', lastActive: 456})
        })
    })

    it('updates attribution and last active along with it', () => {

      expect.assertions(2)

      jest.spyOn(Date, 'now').mockReturnValueOnce(123456)
      ActivityState.default.current = extend(ActivityState.default.current, {attribution: {adid: 'bla'}})

      return Identity.persist()
        .then(activityState => {
          expect(activityState).toEqual({uuid: '123', lastActive: 123456, attribution: {adid: 'bla'}})
          expect(ActivityState.default.current).toEqual({uuid: '123', lastActive: 123456, attribution: {adid: 'bla'}})
        })

    })

    it('syncs in-memory activity state with updated stored version', () => {

      jest.spyOn(State.default, 'reload')

      let compareActivityState

      expect.assertions(4)

      return Identity.start()
        .then(activityState => {

          expect(activityState).toEqual(ActivityState.default.current)

          // update happens in another tab
          return StorageManager.default.updateItem('activityState', Object.assign({}, activityState, {lastActive: 123}))
        })
        .then(() => StorageManager.default.getFirst('activityState'))
        .then(activityState => {

          compareActivityState = Object.assign({}, activityState)

          expect(compareActivityState).not.toEqual(ActivityState.default.current)

          return Identity.sync()
        })
        .then(() => {
          expect(compareActivityState).toEqual(ActivityState.default.current)
          expect(State.default.reload).toHaveBeenCalled()
        })

    })

    it('clears activity state', () => {

      expect.assertions(3)

      Identity.clear()

      return flushPromises()
        .then(() => {
          expect(ActivityState.default.current).toEqual({uuid: 'unknown'})

          return StorageManager.default.getFirst('activityState')
        })
        .then(activityState => {
          expect(activityState).toEqual({uuid: 'unknown'})
          expect(ActivityState.default.current).toEqual(activityState)
        })
    })
  })

  describe('when activity state does not exist', () => {

    it('returns empty activity state', () => {
      expect(ActivityState.default.current).toBeNull()
    })

    it('starts activity state - checks activity state and creates new one', () => {

      expect.assertions(3)

      return Identity.start()
        .then(activityState => {

          const cachedActivityState = ActivityState.default.current

          expect(activityState).toEqual(cachedActivityState)
          expect(activityState.uuid).toBeDefined()
          expect(StorageManager.default.addItem).toHaveBeenCalledTimes(1)
        })
    })

    it('updates activity state', () => {

      expect.assertions(3)

      jest.spyOn(Date, 'now').mockReturnValue(456)

      return Identity.persist()
        .then(activityState => {

          const cachedActivityState = ActivityState.default.current

          expect(activityState).toEqual(cachedActivityState)
          expect(activityState).toMatchObject({lastActive: 456})
          expect(StorageManager.default.updateItem).toHaveBeenCalledTimes(1)
        })
    })
  })
})
