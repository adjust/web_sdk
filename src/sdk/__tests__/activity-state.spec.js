/* eslint-disable */
import * as ActivityState from '../activity-state'

describe('activity state functionality', () => {

  it('ensures that only copy is returned', () => {

    const current = {uuid: '123'}

    ActivityState.default.current = current

    expect(ActivityState.default.current).not.toBe(current)
    expect(ActivityState.default.current).toEqual(current)

    current.bla = 'truc'

    expect(current).toEqual({uuid: '123', bla: 'truc'})
    expect(ActivityState.default.current).toEqual({uuid: '123'})

  })

  it('checks if activity state is unknown', () => {

    expect(ActivityState.default.isUnknown()).toBeFalsy()

    ActivityState.default.current = {uuid: 'unknown'}

    expect(ActivityState.default.isUnknown()).toBeTruthy()

  })

  it('destroys activity state', () => {

    ActivityState.default.current = {uuid: '123'}

    expect(ActivityState.default.current).toEqual({uuid: '123'})

    ActivityState.default.destroy()

    expect(ActivityState.default.current).toBeNull()

  })

})
