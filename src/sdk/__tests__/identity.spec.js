/* eslint-disable */
import * as Identity from '../identity'
import * as Storage from '../storage'
import * as ActivityState from '../activity-state'

describe('test identity methods', () => {

  beforeAll(() => {
    jest.spyOn(Storage.default, 'getFirst')
    jest.spyOn(Storage.default, 'addItem')
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
      Storage.default.addItem('activityState', {uuid: '123'}).then(Identity.startActivityState)
      Storage.default.addItem.mockClear()
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
          expect(Storage.default.addItem).not.toHaveBeenCalled()
        })
    })

    it('checks activity state and restores from memory if storage got lost in the meantime', () => {

      expect.assertions(4)

      return Storage.default.deleteItem('activityState', '123')
        .then(Identity.startActivityState)
        .then(activityState => {

          const cachedActivityState = ActivityState.default.current

          expect(activityState).toEqual(cachedActivityState)
          expect(activityState).toEqual({uuid: '123'})
          expect(Storage.default.addItem).toHaveBeenCalledTimes(1)
          expect(Storage.default.addItem).toHaveBeenCalledWith('activityState', {uuid: '123'})
        })
    })

    it('checks activity state and creates new one when both storage and in-memory state are lost', () => {

      expect.assertions(4)

      Identity.destroy()

      return Storage.default.deleteItem('activityState', '123')
        .then(Identity.startActivityState)
        .then(activityState => {

          const cachedActivityState = ActivityState.default.current

          expect(activityState).toEqual(cachedActivityState)
          expect(activityState.uuid).not.toBe('123')
          expect(activityState.uuid).toBeDefined()
          expect(Storage.default.addItem).toHaveBeenCalledTimes(1)
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
          expect(Storage.default.addItem).not.toHaveBeenCalled()
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
          expect(Storage.default.addItem).toHaveBeenCalledTimes(1)
        })
    })

    it('updates activity state', () => {

      expect.assertions(3)

      return Identity.updateActivityState({lastActive: 456})
        .then(activityState => {

          const cachedActivityState = ActivityState.default.current

          expect(activityState).toEqual(cachedActivityState)
          expect(activityState).toMatchObject({lastActive: 456})
          expect(Storage.default.addItem).toHaveBeenCalledTimes(1)
        })
    })
  })
})
