/* eslint-disable */
import * as ActivityState from '../activity-state'
import * as QuickStorage from '../quick-storage'

describe('activity state functionality', () => {

  afterEach(() => {
    ActivityState.default.destroy()
    ActivityState.default.state = null

  })

  it('ensures that only copy is returned', () => {

    const currentActivityState = {uuid: '123'}
    const currentDisabledState = {disabled: false}

    ActivityState.default.current = currentActivityState
    ActivityState.default.state = currentDisabledState

    expect(ActivityState.default.current).not.toBe(currentActivityState)
    expect(ActivityState.default.current).toEqual(currentActivityState)
    expect(ActivityState.default.state).not.toBe(currentDisabledState)
    expect(ActivityState.default.state).toEqual(currentDisabledState)

    currentActivityState.bla = 'truc'
    currentDisabledState.reason = 'bla'

    expect(currentActivityState).toEqual({uuid: '123', bla: 'truc'})
    expect(currentDisabledState).toEqual({disabled: false, reason: 'bla'})
    expect(ActivityState.default.current).toEqual({uuid: '123'})
    expect(ActivityState.default.state).toEqual({disabled: false})

  })

  it('caches disabled state from localStorage', () => {

    QuickStorage.default.state = {disabled: true, reason: 'gdpr'}

    expect(ActivityState.default.state).toEqual({disabled: true, reason: 'gdpr'})

  })

  it('destroys activity state but ignores disabled state', () => {

    ActivityState.default.current = {uuid: '123'}
    ActivityState.default.state = {disabled: true, reason: 'general'}

    expect(ActivityState.default.current).toEqual({uuid: '123'})
    expect(ActivityState.default.state).toEqual({disabled: true, reason: 'general'})

    ActivityState.default.destroy()

    expect(ActivityState.default.current).toBeNull()
    expect(ActivityState.default.state).toEqual({disabled: true, reason: 'general'})

  })

})
