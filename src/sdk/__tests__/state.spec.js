import * as State from '../state'
import * as QuickStorage from '../storage/quick-storage'
import * as PubSub from '../pub-sub'

describe('activity state functionality', () => {

  const disabledStoreName = QuickStorage.default.names.disabled

  beforeAll(() => {
    jest.spyOn(PubSub, 'publish')
  })

  afterEach(() => {
    State.default.disabled = null
  })

  afterAll(() => {
    jest.restoreAllMocks()
  })

  it('gets disabled state', () => {

    expect(State.default.disabled).toBeNull()

    State.default.disabled = 'gdpr'

    expect(State.default.disabled).toEqual('gdpr')

  })

  it('reloads in-memory variables when storage got changed outside of current tab', () => {

    QuickStorage.default.stores[disabledStoreName] = 1

    expect(State.default.disabled).toEqual('general')

    QuickStorage.default.stores[disabledStoreName] = 2

    expect(State.default.disabled).toEqual('general')

    State.default.reload()

    expect(PubSub.publish).not.toHaveBeenCalled()

    State.default.disabled = null

    QuickStorage.default.stores[disabledStoreName] = 2

    State.default.reload()

    expect(PubSub.publish).toHaveBeenCalledWith('sdk:shutdown', true)
    expect(State.default.disabled).toEqual('gdpr')

  })

  it('recover storage from memory', () => {

    State.default.disabled = 'gdpr'

    expect(QuickStorage.default.stores[disabledStoreName]).toEqual(2)

    localStorage.clear()

    expect(State.default.disabled).toEqual('gdpr')
    expect(QuickStorage.default.stores[disabledStoreName]).toBeNull()

    State.default.recover()

    expect(State.default.disabled).toEqual('gdpr')
    expect(QuickStorage.default.stores[disabledStoreName]).toEqual(2)

  })

})
