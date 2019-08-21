import * as Identity from '../identity'
import * as StorageManager from '../storage/storage-manager'
import * as ActivityState from '../activity-state'
import * as State from '../state'
import * as Logger from '../logger'
import * as QuickStorage from '../storage/quick-storage'
import * as PubSub from '../pub-sub'
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
    jest.spyOn(State.default, 'reload')
  })

  afterEach(() => {
    jest.clearAllMocks()
    localStorage.clear()
    Identity.destroy()
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

    it('prevents identity start multiple times', () => {

      expect.assertions(3)

      let activityState
      const promise = Identity.start()

      Identity.start()
        .catch(error => {
          expect(error).toEqual({message: 'Adjust SDK start already in progress'})
        })

      return promise
        .then(as => {
          activityState = as
          return StorageManager.default.getAll('activityState')
        })
        .then(records => {
          expect(records.length).toEqual(1)
          expect(records[0]).toEqual(activityState)
        })

    })

    it('checks disabled state before initiation', () => {

      expect(State.default.disabled).toBeNull()
      expect(Identity.status()).toBe('on')

      Identity.disable()

      expect(State.default.disabled).toEqual({reason: 'general', pending: false})
      expect(Identity.status()).toBe('off')

      Identity.disable()

      expect(Logger.default.log).toHaveBeenLastCalledWith('Adjust SDK is already disabled')
      expect(Identity.status()).toBe('off')

      Identity.enable()

      expect(State.default.disabled).toBeNull()
      expect(Identity.status()).toBe('on')

      Identity.enable()

      expect(Logger.default.log).toHaveBeenLastCalledWith('Adjust SDK is already enabled')
      expect(Identity.status()).toBe('on')

    })

    it('checks disabled state after initiation', () => {

      expect.assertions(3)

      return Identity.start()
        .then(() => {
          expect(State.default.disabled).toBeNull()

          Identity.disable()

          expect(State.default.disabled).toEqual({reason: 'general', pending: false})
          expect(Identity.status()).toBe('off')
        })
    })

    it('checks disabled state after initiation when initially disabled', () => {

      expect.assertions(3)

      Identity.disable()

      return Identity.start()
        .then(() => {
          expect(State.default.disabled).toEqual({reason: 'general', pending: false})
          expect(Identity.status()).toBe('off')

          Identity.enable()

          expect(State.default.disabled).toBeNull()
        })
    })

    it('checks disabled state after storage has been lost', () => {

      expect(State.default.disabled).toBeNull()

      Identity.disable()

      expect(State.default.disabled).toEqual({reason: 'general', pending: false})
      expect(Identity.status()).toBe('off')

      localStorage.clear()

      expect(State.default.disabled).toEqual({reason: 'general', pending: false})
      expect(Identity.status()).toBe('off')

    })

    it('checks if disabled due to GDPR-Forget-Me request', () => {

      Identity.disable({reason: 'gdpr', pending: true})

      expect(State.default.disabled).toEqual({reason: 'gdpr', pending: true})
      expect(Identity.status()).toBe('paused')

      Identity.enable()

      expect(State.default.disabled).toEqual({reason: 'gdpr', pending: true})
      expect(Logger.default.log).toHaveBeenLastCalledWith('Adjust SDK is disabled due to GDPR-Forget-Me request and it can not be re-enabled')
      expect(Identity.status()).toBe('paused')

      Identity.disable()

      expect(Logger.default.log).toHaveBeenLastCalledWith('Adjust SDK is already disabled due to GDPR-Forget-Me request')
      expect(State.default.disabled).toEqual({reason: 'gdpr', pending: true})
      expect(Identity.status()).toBe('paused')

      Identity.clear()

      expect(State.default.disabled).toEqual({reason: 'gdpr', pending: false})
      expect(Identity.status()).toBe('off')
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
          expect(State.default.disabled).toEqual({reason: 'general', pending: false})
          expect(QuickStorage.default.stores[storeNames.disabled]).toEqual({reason: 'general', pending: false})
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

    it('ignores sync in-memory activity state when sdk is disabled', () => {

      const cachedActivityState = ActivityState.default.current

      expect.assertions(3)

      return Identity.start()
        .then(activityState => {

          Identity.disable()

          expect(activityState).toEqual(ActivityState.default.current)

          return Identity.sync()
        })
        .then(() => {
          expect(State.default.reload).not.toHaveBeenCalled()
          expect(ActivityState.default.current).toEqual(cachedActivityState)
        })

    })

    it('clears activity state', () => {

      expect.assertions(4)

      Identity.clear()

      return Utils.flushPromises()
        .then(() => {
          expect(ActivityState.default.current).toEqual({uuid: 'unknown'})

          return StorageManager.default.getAll('activityState')
        })
        .then(records => {
          const activityState = records[0]
          expect(records.length).toBe(1)
          expect(activityState).toEqual({uuid: 'unknown'})
          expect(ActivityState.default.current).toEqual(activityState)
        })
    })

    it('clears activity state even when persisted data has been lost', () => {

      expect.assertions(3)

      return StorageManager.default.clear('activityState')
        .then(() => {
          Identity.clear()

          return Utils.flushPromises()
        })
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

    it('interrupt start if sdk already gdpr forgotten but persisted state got lost', () => {

      expect.assertions(2)

      Identity.disable({reason: 'gdpr'})
      Identity.clear()

      return Utils.flushPromises()
        .then(() => {
          State.default.disabled = null

          return Identity.start()
        })
        .then(activityState => {
          expect(activityState).toBeNull()
          expect(ActivityState.default.current).toBeNull()
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

    it('ignores persist when sdk is disabled', () => {

      expect.assertions(3)

      Identity.disable()

      return Identity.persist()
        .then(activityState => {
          expect(activityState).toBeNull()
          expect(ActivityState.default.current).toBeNull()
          expect(StorageManager.default.updateItem).not.toHaveBeenCalled()
        })
    })
  })
})
