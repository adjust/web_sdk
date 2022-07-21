import * as QuickStorage from '../storage/quick-storage'

describe('activity state functionality', () => {

  const storeName = QuickStorage.default.storeNames.preferences.name

  afterEach(() => {
    localStorage.clear()
  })

  afterAll(() => {
    jest.restoreAllMocks()
  })

  it('gets preferences', () => {
    jest.isolateModules(() => {
      const Preferences = require('../preferences')

      const PubSub = require('../pub-sub')
      jest.spyOn(PubSub, 'publish')

      expect(Preferences.getDisabled()).toBeNull()
      expect(Preferences.getThirdPartySharing()).toBeNull()

      Preferences.setDisabled({reason: 'gdpr', pending: false})
      Preferences.setThirdPartySharing({reason: 'general', pending: false})

      expect(Preferences.getDisabled()).toEqual({
        reason: 'gdpr',
        pending: false
      })
      expect(Preferences.getThirdPartySharing()).toEqual({
        reason: 'general',
        pending: false
      })

      Preferences.setDisabled(null)
      Preferences.setThirdPartySharing(null)

      expect(Preferences.getDisabled()).toBeNull()
      expect(Preferences.getThirdPartySharing()).toBeNull()

      Preferences.setDisabled({reason: 'gdpr', pending: true})
      Preferences.setThirdPartySharing({reason: 'general', pending: true})

      expect(Preferences.getDisabled()).toEqual({
        reason: 'gdpr',
        pending: true
      })
      expect(Preferences.getThirdPartySharing()).toEqual({
        reason: 'general',
        pending: true
      })
    })
  })

  it('reloads in-memory variables when storage got changed outside of current tab', () => {
    jest.isolateModules(() => {
      const Preferences = require('../preferences')

      const PubSub = require('../pub-sub')
      jest.spyOn(PubSub, 'publish')

      QuickStorage.default.stores[storeName] = {
        sdkDisabled: {reason: 'general', pending: false},
        thirdPartySharingDisabled: {reason: 'general', pending: true}
      }

      expect(Preferences.getDisabled()).toEqual({
        reason: 'general',
        pending: false
      })
      expect(Preferences.getThirdPartySharing()).toEqual({
        reason: 'general',
        pending: true
      })

      QuickStorage.default.stores[storeName] = {
        sdkDisabled: {reason: 'gdpr', pending: false},
        thirdPartySharingDisabled: {reason: 'general', pending: false}
      }

      expect(Preferences.getDisabled()).toEqual({
        reason: 'general',
        pending: false
      })
      expect(Preferences.getThirdPartySharing()).toEqual({
        reason: 'general',
        pending: true
      })

      Preferences.reload()

      expect(PubSub.publish).not.toHaveBeenCalled()
      expect(Preferences.getDisabled()).toEqual({
        reason: 'gdpr',
        pending: false
      })
      expect(Preferences.getThirdPartySharing()).toEqual({
        reason: 'general',
        pending: false
      })

      Preferences.setDisabled(null)
      Preferences.setThirdPartySharing(null)

      QuickStorage.default.stores[storeName] = {
        sdkDisabled: {reason: 'gdpr', pending: true},
        thirdPartySharingDisabled: {reason: 'general', pending: true}
      }

      Preferences.reload()

      expect(PubSub.publish).toHaveBeenCalledWith('sdk:shutdown')
      expect(Preferences.getDisabled()).toEqual({
        reason: 'gdpr',
        pending: true
      })
      expect(Preferences.getThirdPartySharing()).toEqual({
        reason: 'general',
        pending: true
      })
    })
  })

  it('recover storage from memory', () => {
    jest.isolateModules(() => {
      const Preferences = require('../preferences')

      Preferences.setDisabled({reason: 'gdpr', pending: false})
      Preferences.setThirdPartySharing({reason: 'general', pending: true})

      expect(QuickStorage.default.stores[storeName]).toEqual({
        sdkDisabled: {reason: 'gdpr', pending: false},
        thirdPartySharingDisabled: {reason: 'general', pending: true}
      })

      localStorage.clear()

      expect(Preferences.getDisabled()).toEqual({
        reason: 'gdpr',
        pending: false
      })
      expect(Preferences.getThirdPartySharing()).toEqual({
        reason: 'general',
        pending: true
      })
      expect(QuickStorage.default.stores[storeName]).toBeNull()

      Preferences.recover()

      expect(Preferences.getDisabled()).toEqual({
        reason: 'gdpr',
        pending: false
      })
      expect(Preferences.getThirdPartySharing()).toEqual({
        reason: 'general',
        pending: true
      })
      expect(QuickStorage.default.stores[storeName]).toEqual({
        sdkDisabled: {reason: 'gdpr', pending: false},
        thirdPartySharingDisabled: {reason: 'general', pending: true}
      })
    })
  })

})
