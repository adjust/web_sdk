import * as QuickStorage from '../storage/quick-storage'
import * as PubSub from '../pub-sub'

describe('activity state functionality', () => {

  const storeName = QuickStorage.default.storeNames.preferences.name

  beforeAll(() => {
    jest.spyOn(PubSub, 'publish')
  })

  afterEach(() => {
    localStorage.clear()
  })

  afterAll(() => {
    jest.restoreAllMocks()
  })

  it('gets preferences', () => {
    jest.isolateModules(() => {
      const Preferences = require('../preferences').default

      expect(Preferences.disabled).toBeNull()
      expect(Preferences.getThirdPartySharing()).toBeNull()

      Preferences.disabled = {reason: 'gdpr', pending: false}
      Preferences.setThirdPartySharing({reason: 'general', pending: false})

      expect(Preferences.disabled.reason).toEqual('gdpr')
      expect(Preferences.disabled.pending).toEqual(false)
      expect(Preferences.getThirdPartySharing()).toEqual({
        reason: 'general',
        pending: false
      })

      Preferences.disabled = null
      Preferences.setThirdPartySharing(null)

      expect(Preferences.disabled).toBeNull()
      expect(Preferences.getThirdPartySharing()).toBeNull()

      Preferences.disabled = {reason: 'gdpr', pending: true}
      Preferences.setThirdPartySharing({reason: 'general', pending: true})

      expect(Preferences.disabled.reason).toEqual('gdpr')
      expect(Preferences.disabled.pending).toEqual(true)
      expect(Preferences.getThirdPartySharing()).toEqual({
        reason: 'general',
        pending: true
      })
    })
  })

  it('reloads in-memory variables when storage got changed outside of current tab', () => {
    jest.isolateModules(() => {
      const Preferences = require('../preferences').default

      QuickStorage.default.stores[storeName] = {
        sdkDisabled: {reason: 'general', pending: false},
        thirdPartySharingDisabled: {reason: 'general', pending: true}
      }

      expect(Preferences.disabled.reason).toEqual('general')
      expect(Preferences.disabled.pending).toEqual(false)
      expect(Preferences.getThirdPartySharing()).toEqual({
        reason: 'general',
        pending: true
      })

      QuickStorage.default.stores[storeName] = {
        sdkDisabled: {reason: 'gdpr', pending: false},
        thirdPartySharingDisabled: {reason: 'general', pending: false}
      }

      expect(Preferences.disabled.reason).toEqual('general')
      expect(Preferences.disabled.pending).toEqual(false)
      expect(Preferences.getThirdPartySharing()).toEqual({
        reason: 'general',
        pending: true
      })

      Preferences.reload()

      expect(PubSub.publish).not.toHaveBeenCalled()
      expect(Preferences.disabled.reason).toEqual('gdpr')
      expect(Preferences.disabled.pending).toEqual(false)
      expect(Preferences.getThirdPartySharing()).toEqual({
        reason: 'general',
        pending: false
      })

      Preferences.disabled = null
      Preferences.setThirdPartySharing(null)

      QuickStorage.default.stores[storeName] = {
        sdkDisabled: {reason: 'gdpr', pending: true},
        thirdPartySharingDisabled: {reason: 'general', pending: true}
      }

      Preferences.reload()

      expect(PubSub.publish).toHaveBeenCalledWith('sdk:shutdown', true)
      expect(Preferences.disabled.reason).toEqual('gdpr')
      expect(Preferences.disabled.pending).toEqual(true)
      expect(Preferences.getThirdPartySharing()).toEqual({
        reason: 'general',
        pending: true
      })
    })
  })

  it('recover storage from memory', () => {
    jest.isolateModules(() => {
      const Preferences = require('../preferences').default

      Preferences.disabled = {reason: 'gdpr', pending: false}
      Preferences.setThirdPartySharing({reason: 'general', pending: true})

      expect(QuickStorage.default.stores[storeName]).toEqual({
        sdkDisabled: {reason: 'gdpr', pending: false},
        thirdPartySharingDisabled: {reason: 'general', pending: true}
      })

      localStorage.clear()

      expect(Preferences.disabled.reason).toEqual('gdpr')
      expect(Preferences.disabled.pending).toEqual(false)
      expect(Preferences.getThirdPartySharing()).toEqual({
        reason: 'general',
        pending: true
      })
      expect(QuickStorage.default.stores[storeName]).toBeNull()

      Preferences.recover()

      expect(Preferences.disabled.reason).toEqual('gdpr')
      expect(Preferences.disabled.pending).toEqual(false)
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
