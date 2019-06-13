/* eslint-disable */
import * as Identity from '../identity'
import * as StorageManager from '../storage-manager'
import * as ActivityState from '../activity-state'
import * as Logger from '../logger'
import * as QuickStorage from '../quick-storage'
import * as PubSub from '../pub-sub'
import {flushPromises} from './_helper'

jest.mock('../logger')

describe('test identity methods', () => {

  beforeAll(() => {
    jest.spyOn(PubSub, 'publish')
    jest.spyOn(StorageManager.default, 'getFirst')
    jest.spyOn(StorageManager.default, 'addItem')
    jest.spyOn(ActivityState.default, 'destroy')
    jest.spyOn(Logger.default, 'log')
  })

  afterEach(() => {
    jest.clearAllMocks()
    localStorage.clear()
    Identity.destroy()
    ActivityState.default.state = {disabled: false}
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

      expect(Identity.isDisabled()).toBeFalsy()

      Identity.disable()

      expect(Identity.isDisabled()).toBeTruthy()

      Identity.disable()

      expect(Logger.default.log).toHaveBeenLastCalledWith('adjustSDK is already disabled')

      Identity.enable()

      expect(Identity.isDisabled()).toBeFalsy()

      Identity.enable()

      expect(Logger.default.log).toHaveBeenLastCalledWith('adjustSDK is already enabled')

    })

    it('checks disabled state after initiation', () => {

      expect.assertions(2)

      return Identity.start()
        .then(() => {
          expect(Identity.isDisabled()).toBeFalsy()

          Identity.disable()

          expect(Identity.isDisabled()).toBeTruthy()
        })
    })

    it('checks disabled state after initiation when initially disabled', () => {

      expect.assertions(2)

      Identity.disable()

      return Identity.start()
        .then(() => {
          expect(Identity.isDisabled()).toBeTruthy()

          Identity.enable()

          expect(Identity.isDisabled()).toBeFalsy()
        })
    })

    it('checks disabled state after storage has been lost', () => {

      expect(Identity.isDisabled()).toBeFalsy()

      Identity.disable()

      expect(Identity.isDisabled()).toBeTruthy()

      localStorage.clear()

      expect(Identity.isDisabled()).toBeTruthy()

    })

    it('checks if disabled due to GDPR-Forget-Me request', () => {

      Identity.disable('gdpr')

      expect(Identity.isDisabled()).toBeTruthy()
      expect(Identity.isGdprForgotten()).toBeTruthy()

      Identity.enable()

      expect(Identity.isDisabled()).toBeTruthy()
      expect(Logger.default.log).toHaveBeenLastCalledWith('adjustSDK is disabled due to GDPR-Forget-me request and it can not be re-enabled')

      Identity.disable()

      expect(Logger.default.log).toHaveBeenLastCalledWith('adjustSDK is already disabled')
      expect(Identity.isDisabled()).toBeTruthy()
      expect(Identity.isGdprForgotten()).toBeTruthy()

    })

  })

  describe('when activity state exists', () => {

    beforeEach(() => {
      StorageManager.default.addItem('activityState', {uuid: '123'}).then(Identity.start)
      StorageManager.default.addItem.mockClear()
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

      QuickStorage.default.state = null

      return Identity.start()
        .then(() => {
          expect(ActivityState.default.state).toEqual({disabled: true, reason: 'general'})
          expect(QuickStorage.default.state).toEqual(ActivityState.default.state)
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

    it('updates last active or ignores it when necessary', () => {

      let cachedActivityState = {}

      expect.assertions(5)

      jest.spyOn(Date, 'now').mockReturnValueOnce(456)

      return Identity.updateLastActive()
        .then(activityState => {

          cachedActivityState = ActivityState.default.current

          expect(activityState).toEqual(cachedActivityState)
          expect(activityState).toEqual({uuid: '123', lastActive: 456})
          expect(ActivityState.default.current).toEqual({uuid: '123', lastActive: 456})
          expect(StorageManager.default.addItem).not.toHaveBeenCalled()

          return Identity.updateLastActive(true)
        })
        .then(activityState => {
          expect(activityState).toEqual(cachedActivityState)
        })
    })

    it('updates attribution', () => {

      expect.assertions(4)

      return Identity.updateAttribution({adid: '456'})
        .then(activityState => {

          const cachedActivityState = ActivityState.default.current

          expect(activityState).toEqual(cachedActivityState)
          expect(activityState).toEqual({uuid: '123', attribution: {adid: '456'}})
          expect(ActivityState.default.current).toEqual({uuid: '123', attribution: {adid: '456'}})
          expect(StorageManager.default.addItem).not.toHaveBeenCalled()
        })

    })

    it('syncs in-memory activity state with updated stored version', () => {

      let compareActivityState
      let compareDisabledState

      expect.assertions(11)

      return Identity.start()
        .then(activityState => {

          expect(activityState).toEqual(ActivityState.default.current)

          // update happens in another tab
          return StorageManager.default.updateItem('activityState', Object.assign({}, activityState, {lastActive: 123}))
        })
        .then(() => StorageManager.default.getFirst('activityState'))
        .then(activityState => {

          compareActivityState = Object.assign({}, activityState)
          compareDisabledState = Object.assign({}, QuickStorage.default.state)

          expect(compareActivityState).not.toEqual(ActivityState.default.current)
          expect(compareDisabledState).toEqual(ActivityState.default.state)

          return Identity.sync()
        })
        .then(() => {
          expect(PubSub.publish).not.toHaveBeenCalled()
          expect(compareActivityState).toEqual(ActivityState.default.current)
          expect(compareDisabledState).toEqual(ActivityState.default.state)

          // update happens in another tab
          QuickStorage.default.state = {disabled: true}
          return StorageManager.default.updateItem('activityState', Object.assign({}, compareActivityState, {lastActive: 124}))
        })
        .then(() => StorageManager.default.getFirst('activityState'))
        .then(activityState => {

          compareActivityState = Object.assign({}, activityState)
          compareDisabledState = Object.assign({}, QuickStorage.default.state)

          expect(compareActivityState).not.toEqual(ActivityState.default.current)
          expect(compareDisabledState).not.toEqual(ActivityState.default.state)

          return Identity.sync()
        })
        .then(() => {
          expect(PubSub.publish).toHaveBeenCalledWith('sdk:shutdown', true)
          expect(compareActivityState).toEqual(ActivityState.default.current)
          expect(compareDisabledState).toEqual(ActivityState.default.state)
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

      return Identity.updateLastActive()
        .then(activityState => {

          const cachedActivityState = ActivityState.default.current

          expect(activityState).toEqual(cachedActivityState)
          expect(activityState).toMatchObject({lastActive: 456})
          expect(StorageManager.default.addItem).toHaveBeenCalledTimes(1)
        })
    })
  })
})
