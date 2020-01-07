import * as QuickStorage from '../storage/quick-storage'
import * as PubSub from '../pub-sub'

describe('activity state functionality', () => {

  const disabledStoreName = QuickStorage.default.storeNames.disabled.name

  beforeAll(() => {
    jest.spyOn(PubSub, 'publish')
  })

  afterEach(() => {
    localStorage.clear()
  })

  afterAll(() => {
    jest.restoreAllMocks()
  })

  it('gets disabled state', () => {
    jest.isolateModules(() => {
      const Preferences = require('../preferences').default

      expect(Preferences.disabled).toBeNull()

      Preferences.disabled = {reason: 'gdpr', pending: false}

      expect(Preferences.disabled.reason).toEqual('gdpr')
      expect(Preferences.disabled.pending).toEqual(false)

      Preferences.disabled = null

      expect(Preferences.disabled).toBeNull()

      Preferences.disabled = {reason: 'gdpr', pending: true}

      expect(Preferences.disabled.reason).toEqual('gdpr')
      expect(Preferences.disabled.pending).toEqual(true)
    })
  })

  it('reloads in-memory variables when storage got changed outside of current tab', () => {
    jest.isolateModules(() => {
      const Preferences = require('../preferences').default

      QuickStorage.default.stores[disabledStoreName] = {reason: 'general', pending: false}

      expect(Preferences.disabled.reason).toEqual('general')

      QuickStorage.default.stores[disabledStoreName] = {reason: 'gdpr', pending: false}

      expect(Preferences.disabled.reason).toEqual('general')

      Preferences.reload()

      expect(PubSub.publish).not.toHaveBeenCalled()

      Preferences.disabled = null

      QuickStorage.default.stores[disabledStoreName] = {reason: 'gdpr', pending: false}

      Preferences.reload()

      expect(PubSub.publish).toHaveBeenCalledWith('sdk:shutdown', true)
      expect(Preferences.disabled.reason).toEqual('gdpr')
    })
  })

  it('recover storage from memory', () => {
    jest.isolateModules(() => {
      const Preferences = require('../preferences').default

      Preferences.disabled = {reason: 'gdpr', pending: false}

      expect(QuickStorage.default.stores[disabledStoreName]).toEqual({reason: 'gdpr', pending: false})

      localStorage.clear()

      expect(Preferences.disabled.reason).toEqual('gdpr')
      expect(QuickStorage.default.stores[disabledStoreName]).toBeNull()

      Preferences.recover()

      expect(Preferences.disabled.reason).toEqual('gdpr')
      expect(QuickStorage.default.stores[disabledStoreName]).toEqual({reason: 'gdpr', pending: false})
    })
  })

})
