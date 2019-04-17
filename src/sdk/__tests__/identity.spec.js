/* eslint-disable */
import * as Identity from '../identity'
import * as StorageManager from '../storage-manager'
import * as ActivityState from '../activity-state'

describe('test identity methods', () => {

  beforeAll(() => {
    jest.spyOn(StorageManager.default, 'getFirst')
    jest.spyOn(StorageManager.default, 'addItem')
  })

  afterEach(() => {
    jest.clearAllMocks()
    localStorage.clear()
    Identity.destroy()
  })

  afterAll(() => {
    jest.restoreAllMocks()
  })

  describe('when activity state exists', () => {

    beforeEach(() => {
      StorageManager.default.addItem('activityState', {uuid: '123'}).then(Identity.startActivityState)
      StorageManager.default.addItem.mockClear()
    })

    it('gets existing activity state', () => {
      expect(ActivityState.default.current).toEqual({uuid: '123'})
    })

    it('checks activity state and returns existing one', () => {

      expect.assertions(3)

      return Identity.startActivityState()
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
        .then(Identity.startActivityState)
        .then(activityState => {

          const cachedActivityState = ActivityState.default.current

          expect(activityState).toEqual(cachedActivityState)
          expect(activityState).toEqual({uuid: '123'})
          expect(StorageManager.default.addItem).toHaveBeenCalledTimes(1)
          expect(StorageManager.default.addItem).toHaveBeenCalledWith('activityState', {uuid: '123'})
        })
    })

    it('checks activity state and creates new one when both storage and in-memory state are lost', () => {

      expect.assertions(4)

      Identity.destroy()

      return StorageManager.default.deleteItem('activityState', '123')
        .then(Identity.startActivityState)
        .then(activityState => {

          const cachedActivityState = ActivityState.default.current

          expect(activityState).toEqual(cachedActivityState)
          expect(activityState.uuid).not.toBe('123')
          expect(activityState.uuid).toBeDefined()
          expect(StorageManager.default.addItem).toHaveBeenCalledTimes(1)
        })
    })

    it('updates activity state', () => {

      expect.assertions(4)

      return Identity.updateActivityState({lastActive: 456})
        .then(activityState => {

          const cachedActivityState = ActivityState.default.current

          expect(activityState).toEqual(cachedActivityState)
          expect(activityState).toEqual({uuid: '123', lastActive: 456})
          expect(ActivityState.default.current).toEqual({uuid: '123', lastActive: 456})
          expect(StorageManager.default.addItem).not.toHaveBeenCalled()
        })
    })

    it('syncs in-memory activity state with updated stored version', () => {

      let compare

      expect.assertions(5)

      return Identity.startActivityState()
        .then(activityState => {

          expect(activityState).toEqual(ActivityState.default.current)

          // update happens in another tab
          return StorageManager.default.updateItem('activityState', Object.assign({}, activityState, {lastActive: 123}))
        })
        .then(() => StorageManager.default.getFirst('activityState'))
        .then(activityState => {

          compare = Object.assign({}, activityState)

          expect(compare).not.toEqual(ActivityState.default.current)

          return Identity.sync()
        })
        .then(() => {
          expect(compare).toEqual(ActivityState.default.current)

          // update happens in another tab
          return StorageManager.default.updateItem('activityState', Object.assign({}, compare, {lastActive: 124}))
        })
        .then(() => StorageManager.default.getFirst('activityState'))
        .then(activityState => {

          compare = Object.assign({}, activityState)

          expect(compare).not.toEqual(ActivityState.default.current)

          return Identity.sync()
        })
        .then(() => {
          expect(compare).toEqual(ActivityState.default.current)
        })

    })
  })

  describe('when activity state does not exist', () => {

    it('returns empty activity state', () => {
      expect(ActivityState.default.current).toBeNull()
    })

    it('checks activity state and creates new one', () => {

      expect.assertions(3)

      return Identity.startActivityState()
        .then(activityState => {

          const cachedActivityState = ActivityState.default.current

          expect(activityState).toEqual(cachedActivityState)
          expect(activityState.uuid).toBeDefined()
          expect(StorageManager.default.addItem).toHaveBeenCalledTimes(1)
        })
    })

    it('updates activity state', () => {

      expect.assertions(3)

      return Identity.updateActivityState({lastActive: 456})
        .then(activityState => {

          const cachedActivityState = ActivityState.default.current

          expect(activityState).toEqual(cachedActivityState)
          expect(activityState).toMatchObject({lastActive: 456})
          expect(StorageManager.default.addItem).toHaveBeenCalledTimes(1)
        })
    })
  })
})
