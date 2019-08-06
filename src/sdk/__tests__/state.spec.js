import * as QuickStorage from '../storage/quick-storage'
import * as PubSub from '../pub-sub'

describe('activity state functionality', () => {

  const disabledStoreName = QuickStorage.default.names.disabled

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
      const State = require('../state').default

      expect(State.disabled).toBeNull()

      State.disabled = {reason: 'gdpr', pending: false}

      expect(State.disabled.reason).toEqual('gdpr')
      expect(State.disabled.pending).toEqual(false)

      State.disabled = null

      expect(State.disabled).toBeNull()

      State.disabled = {reason: 'gdpr', pending: true}

      expect(State.disabled.reason).toEqual('gdpr')
      expect(State.disabled.pending).toEqual(true)
    })
  })

  it('reloads in-memory variables when storage got changed outside of current tab', () => {
    jest.isolateModules(() => {
      const State = require('../state').default

      QuickStorage.default.stores[disabledStoreName] = {reason: 'general', pending: false}

      expect(State.disabled.reason).toEqual('general')

      QuickStorage.default.stores[disabledStoreName] = {reason: 'gdpr', pending: false}

      expect(State.disabled.reason).toEqual('general')

      State.reload()

      expect(PubSub.publish).not.toHaveBeenCalled()

      State.disabled = null

      QuickStorage.default.stores[disabledStoreName] = {reason: 'gdpr', pending: false}

      State.reload()

      expect(PubSub.publish).toHaveBeenCalledWith('sdk:shutdown', true)
      expect(State.disabled.reason).toEqual('gdpr')
    })
  })

  it('recover storage from memory', () => {
    jest.isolateModules(() => {
      const State = require('../state').default

      State.disabled = {reason: 'gdpr', pending: false}

      expect(QuickStorage.default.stores[disabledStoreName]).toEqual({reason: 'gdpr', pending: false})

      localStorage.clear()

      expect(State.disabled.reason).toEqual('gdpr')
      expect(QuickStorage.default.stores[disabledStoreName]).toBeNull()

      State.recover()

      expect(State.disabled.reason).toEqual('gdpr')
      expect(QuickStorage.default.stores[disabledStoreName]).toEqual({reason: 'gdpr', pending: false})
    })
  })

})
