/* eslint-disable */
import * as ActivityState from '../activity-state'

describe('activity state functionality', () => {

  afterEach(() => {
    ActivityState.default.destroy()
  })

  it('ensures that only copy is returned', () => {

    const currentActivityState = {uuid: '123'}

    ActivityState.default.current = currentActivityState

    expect(ActivityState.default.current).not.toBe(currentActivityState)
    expect(ActivityState.default.current).toEqual(currentActivityState)

    currentActivityState.bla = 'truc'

    expect(currentActivityState).toEqual({uuid: '123', bla: 'truc'})
    expect(ActivityState.default.current).toEqual({uuid: '123'})

  })

  it('destroys activity state', () => {

    ActivityState.default.current = {uuid: '123'}

    expect(ActivityState.default.current).toEqual({uuid: '123'})

    ActivityState.default.destroy()

    expect(ActivityState.default.current).toBeNull()

  })

})
