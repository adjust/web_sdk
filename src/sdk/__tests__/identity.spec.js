import * as Identity from '../identity'
import * as Storage from '../storage/storage'
import * as ActivityState from '../activity-state'
import * as Preferences from '../preferences'
import * as Logger from '../logger'
import * as QuickStorage from '../storage/quick-storage'
import * as PubSub from '../pub-sub'
import * as Disable from '../disable'

jest.mock('../logger')

describe('test identity methods', () => {

  const storeNames = QuickStorage.default.storeNames

  beforeAll(() => {
    jest.spyOn(PubSub, 'publish')
    jest.spyOn(Storage.default, 'addItem')
    jest.spyOn(Storage.default, 'updateItem')
    jest.spyOn(ActivityState.default, 'destroy')
    jest.spyOn(Logger.default, 'log')
    jest.spyOn(Preferences, 'reload')
  })

  afterEach(() => {
    jest.clearAllMocks()
    localStorage.clear()
    Identity.destroy()
    Preferences.setDisabled(null)
  })

  afterAll(() => {
    jest.restoreAllMocks()
  })

  it('destroys identity by destroying activity  state', () => {

    Identity.destroy()

    expect(ActivityState.default.destroy).toHaveBeenCalled()

  })

  it('prevents identity start multiple times', () => {

    expect.assertions(3)

    let activityState
    const promise = Identity.start()

    Identity.start()
      .catch(error => {
        expect(error).toEqual({interrupted: true, message: 'Adjust SDK start already in progress'})
      })

    return promise
      .then(as => {
        activityState = as
        return Storage.default.getAll('activityState')
      })
      .then(records => {
        expect(records.length).toBe(1)
        expect(records[0]).toEqual(activityState)
      })

  })

  it('checks disabled state after initiation', () => {

    expect.assertions(3)

    return Identity.start()
      .then(() => {
        expect(Preferences.getDisabled()).toBeNull()

        Disable.disable()

        expect(Preferences.getDisabled()).toEqual({reason: 'general', pending: false})
        expect(Disable.status()).toBe('off')
      })
  })

  it('checks disabled state after initiation when initially disabled', () => {

    expect.assertions(3)

    Disable.disable()

    return Identity.start()
      .then(() => {
        expect(Preferences.getDisabled()).toEqual({reason: 'general', pending: false})
        expect(Disable.status()).toBe('off')

        Disable.restore()

        expect(Preferences.getDisabled()).toBeNull()
      })
  })

  describe('when activity state exists', () => {

    beforeEach(() => {
      return Storage.default.addItem('activityState', {uuid: '123'})
        .then(() => {
          Storage.default.addItem.mockClear()
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
          expect(Storage.default.addItem).not.toHaveBeenCalled()
        })
    })

    it('checks activity state and restores from memory if storage got lost in the meantime', () => {

      expect.assertions(4)

      return Storage.default.deleteItem('activityState', '123')
        .then(Identity.start)
        .then(activityState => {

          const cachedActivityState = ActivityState.default.current

          expect(activityState).toEqual(cachedActivityState)
          expect(activityState).toEqual({uuid: '123'})
          expect(Storage.default.addItem).toHaveBeenCalledTimes(1)
          expect(Storage.default.addItem).toHaveBeenCalledWith('activityState', {uuid: '123'})
        })
    })

    it('checks activity state and restores disabled state from memory if storage got lost in the meantime', () => {

      expect.assertions(2)

      Disable.disable()

      QuickStorage.default.stores[storeNames.preferences.name] = null

      return Identity.start()
        .then(() => {
          expect(Preferences.getDisabled()).toEqual({reason: 'general', pending: false})
          expect(QuickStorage.default.stores[storeNames.preferences.name]).toEqual({sdkDisabled: {reason: 'general', pending: false}})
        })
    })

    it('checks activity state and creates new one when both storage and in-memory state are lost', () => {

      expect.assertions(4)

      Identity.destroy()

      return Storage.default.deleteItem('activityState', '123')
        .then(Identity.start)
        .then(activityState => {

          const cachedActivityState = ActivityState.default.current

          expect(activityState).toEqual(cachedActivityState)
          expect(activityState.uuid).not.toBe('123')
          expect(activityState.uuid).toBeDefined()
          expect(Storage.default.addItem).toHaveBeenCalledTimes(1)
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
      ActivityState.default.current = {...ActivityState.default.current, attribution: {adid: 'bla'}}

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
          return Storage.default.updateItem('activityState', {...activityState, lastActive: 123})
        })
        .then(() => Storage.default.getFirst('activityState'))
        .then(activityState => {

          compareActivityState = {...activityState}

          expect(compareActivityState).not.toEqual(ActivityState.default.current)

          return Identity.sync()
        })
        .then(() => {
          expect(compareActivityState).toEqual(ActivityState.default.current)
          expect(Preferences.reload).toHaveBeenCalled()
        })

    })

    it('ignores sync in-memory activity state when sdk is disabled', () => {

      const cachedActivityState = ActivityState.default.current

      expect.assertions(3)

      return Identity.start()
        .then(activityState => {

          Disable.disable()

          expect(activityState).toEqual(ActivityState.default.current)

          return Identity.sync()
        })
        .then(() => {
          expect(Preferences.reload).not.toHaveBeenCalled()
          expect(ActivityState.default.current).toEqual(cachedActivityState)
        })

    })

    it('clears activity state', () => {

      expect.assertions(4)

      Identity.clear()

      return Utils.flushPromises()
        .then(() => {
          expect(ActivityState.default.current).toEqual({uuid: 'unknown'})

          return Storage.default.getAll('activityState')
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

      return Storage.default.clear('activityState')
        .then(() => {
          Identity.clear()

          return Utils.flushPromises()
        })
        .then(() => {
          expect(ActivityState.default.current).toEqual({uuid: 'unknown'})

          return Storage.default.getFirst('activityState')
        })
        .then(activityState => {
          expect(activityState).toEqual({uuid: 'unknown'})
          expect(ActivityState.default.current).toEqual(activityState)
        })
    })
  })

  describe('when activity state does not exist', () => {

    it('returns empty activity state', () => {
      expect(ActivityState.default.current).toEqual({})
    })

    it('starts activity state - checks activity state and creates new one', () => {

      expect.assertions(3)

      return Identity.start()
        .then(activityState => {

          const cachedActivityState = ActivityState.default.current

          expect(activityState).toEqual(cachedActivityState)
          expect(activityState.uuid).toBeDefined()
          expect(Storage.default.addItem).toHaveBeenCalledTimes(1)
        })
    })

    it('interrupt start if sdk already gdpr forgotten but persisted state got lost', () => {

      expect.assertions(2)

      Disable.disable('gdpr')
      Identity.clear()

      return Utils.flushPromises()
        .then(() => {
          Preferences.setDisabled(null)

          return Identity.start()
        })
        .then(activityState => {
          expect(activityState).toBeNull()
          expect(ActivityState.default.current).toEqual({})
        })
    })

    it('ignores persist when sdk not initiated', () => {
      expect.assertions(3)

      jest.spyOn(Date, 'now').mockReturnValue(456)

      return Identity.persist()
        .then(activityState => {
          expect(activityState).toBeNull()
          expect(ActivityState.default.current).toEqual({})
          expect(Storage.default.updateItem).not.toHaveBeenCalled()
        })
    })

    it('ignores persist when sdk is disabled', () => {

      expect.assertions(3)

      Disable.disable()

      return Identity.persist()
        .then(activityState => {
          expect(activityState).toBeNull()
          expect(ActivityState.default.current).toEqual({})
          expect(Storage.default.updateItem).not.toHaveBeenCalled()
        })
    })
  })
})
