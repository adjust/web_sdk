/* eslint-disable */
import * as ActivityState from '../activity-state'
import {MINUTE, SECOND} from '../constants'

describe('activity state functionality', () => {

  const now = Date.now()
  let dateNowSpy
  let currentTime

  beforeAll(() => {
    dateNowSpy = jest.spyOn(Date, 'now')
  })

  beforeEach(() => {
    currentTime = now
    dateNowSpy.mockReturnValue(currentTime)
    ActivityState.default.current = {uuid: 'some-uuid'}
    ActivityState.default.toForeground()
  })

  afterEach(() => {
    jest.clearAllMocks()
    ActivityState.default.destroy()
    localStorage.clear()
  })

  afterAll(() => {
    jest.restoreAllMocks()
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

  it('returns zero for time spent and session lenght initially', () => {
    ActivityState.default.toForeground()

    dateNowSpy.mockReturnValue(currentTime)
    ActivityState.default.updateSessionOffset()

    const params = ActivityState.default.getParams()

    expect(params.timeSpent).toEqual(0)
    expect(params.sessionLength).toEqual(0)
  })

  it('returns zero for time spent and positive value for session length after some time when not in foreground', () => {
    ActivityState.default.toBackground()

    dateNowSpy.mockReturnValue(currentTime += 2 * MINUTE)
    ActivityState.default.updateSessionOffset()

    const params = ActivityState.default.getParams()

    expect(params.timeSpent).toEqual(0)
    expect(params.sessionLength).toEqual((2 * MINUTE) / SECOND)
  })

  it('returns positive number for time spent and session length after some time when in foreground', () => {

    let params

    ActivityState.default.toForeground()

    dateNowSpy.mockReturnValue(currentTime += 3 * MINUTE)
    ActivityState.default.updateSessionOffset()

    params = ActivityState.default.getParams()

    expect(params.timeSpent).toEqual((3 * MINUTE) / SECOND)
    expect(params.sessionLength).toEqual((3 * MINUTE) / SECOND)

    dateNowSpy.mockReturnValue(currentTime += 5 * MINUTE)
    ActivityState.default.updateSessionOffset()

    params = ActivityState.default.getParams()

    expect(params.timeSpent).toEqual((8 * MINUTE) / SECOND)
    expect(params.sessionLength).toEqual((8 * MINUTE) / SECOND)

    ActivityState.default.toBackground()

    dateNowSpy.mockReturnValue(currentTime += MINUTE)
    ActivityState.default.updateSessionOffset()

    params = ActivityState.default.getParams()

    expect(params.timeSpent).toEqual((8 * MINUTE) / SECOND)
    expect(params.sessionLength).toEqual((9 * MINUTE) / SECOND)
  })

  it('measures session length while within session window', () => {

    ActivityState.default.toForeground()

    dateNowSpy.mockReturnValue(currentTime += 3 * MINUTE)
    ActivityState.default.updateSessionOffset()

    expect(ActivityState.default.getParams().sessionLength).toEqual((3 * MINUTE) / SECOND)

    ActivityState.default.toBackground()

    dateNowSpy.mockReturnValue(currentTime += 29 * MINUTE)
    ActivityState.default.updateSessionOffset()

    expect(ActivityState.default.getParams().sessionLength).toEqual((32 * MINUTE) / SECOND)

    ActivityState.default.toForeground()

    dateNowSpy.mockReturnValue(currentTime += MINUTE)
    ActivityState.default.updateSessionOffset()

    expect(ActivityState.default.getParams().sessionLength).toEqual((33 * MINUTE) / SECOND)

    ActivityState.default.toBackground()

    dateNowSpy.mockReturnValue(currentTime += 30 * MINUTE)
    ActivityState.default.updateSessionOffset()

    expect(ActivityState.default.getParams().sessionLength).toEqual((33 * MINUTE) / SECOND)

  })

  it('resets time spent and session length and continues counting from zero if still in foreground', () => {
    let params

    ActivityState.default.toForeground()

    dateNowSpy.mockReturnValue(currentTime += 6 * MINUTE)
    ActivityState.default.updateSessionOffset()

    params = ActivityState.default.getParams()

    expect(params.timeSpent).toEqual((6 * MINUTE) / SECOND)
    expect(params.sessionLength).toEqual((6 * MINUTE) / SECOND)

    ActivityState.default.resetSessionOffset()
    dateNowSpy.mockReturnValue(currentTime += 2 * MINUTE)
    ActivityState.default.updateSessionOffset()

    params = ActivityState.default.getParams()

    expect(params.timeSpent).toEqual((2 * MINUTE) / SECOND)
    expect(params.sessionLength).toEqual((2 * MINUTE) / SECOND)
  })

  it('resets time spent and session length and returns zero if went to background', () => {
    let params

    ActivityState.default.toForeground()

    dateNowSpy.mockReturnValue(currentTime += 2 * MINUTE)
    ActivityState.default.updateSessionOffset()

    params = ActivityState.default.getParams()

    expect(params.timeSpent).toEqual((2 * MINUTE) / SECOND)
    expect(params.sessionLength).toEqual((2 * MINUTE) / SECOND)

    ActivityState.default.resetSessionOffset()
    ActivityState.default.toBackground()

    params = ActivityState.default.getParams()

    expect(params.timeSpent).toEqual(0)
    expect(params.sessionLength).toEqual(0)

    dateNowSpy.mockReturnValue(currentTime += 3 * MINUTE)
    ActivityState.default.updateSessionOffset()

    params = ActivityState.default.getParams()

    expect(params.timeSpent).toEqual(0)
    expect(params.sessionLength).toEqual((3 * MINUTE) / SECOND)
  })

  it('includes time offset in time spent and session length from the last preserved point', () => {
    let params

    ActivityState.default.toForeground()

    dateNowSpy.mockReturnValue(currentTime += 3 * MINUTE)
    ActivityState.default.updateSessionOffset()

    params = ActivityState.default.getParams()

    expect(params.timeSpent).toEqual((3 * MINUTE) / SECOND)
    expect(params.sessionLength).toEqual((3 * MINUTE) / SECOND)

    dateNowSpy.mockReturnValue(currentTime += 2 * MINUTE)
    ActivityState.default.updateSessionOffset()

    params = ActivityState.default.getParams()

    expect(params.timeSpent).toEqual((5 * MINUTE) / SECOND)
    expect(params.sessionLength).toEqual((5 * MINUTE) / SECOND)

    ActivityState.default.updateSessionOffset()
    ActivityState.default.toBackground()

    dateNowSpy.mockReturnValue(currentTime += MINUTE)
    ActivityState.default.updateSessionOffset()

    params = ActivityState.default.getParams()

    expect(params.timeSpent).toEqual((5 * MINUTE) / SECOND)
    expect(params.sessionLength).toEqual((6 * MINUTE) / SECOND)

    ActivityState.default.updateSessionOffset()
    ActivityState.default.toForeground()

    dateNowSpy.mockReturnValue(currentTime += MINUTE)
    ActivityState.default.updateSessionOffset()

    params = ActivityState.default.getParams()

    expect(params.timeSpent).toEqual((6 * MINUTE) / SECOND)
    expect(params.sessionLength).toEqual((7 * MINUTE) / SECOND)
  })

  it('update session count on demand and never resets it', () => {

    ActivityState.default.toForeground()

    expect(ActivityState.default.getParams().sessionCount).toEqual(1)

    ActivityState.default.updateParam('sessionCount')

    expect(ActivityState.default.getParams().sessionCount).toEqual(2)

    ActivityState.default.updateParam('sessionCount')
    ActivityState.default.updateParam('sessionCount')

    expect(ActivityState.default.getParams().sessionCount).toEqual(4)

    ActivityState.default.resetSessionOffset()

    expect(ActivityState.default.getParams().sessionCount).toEqual(4)

    ActivityState.default.destroy()

    const params = ActivityState.default.getParams()

    expect(params.timeSpent).toBeUndefined()
    expect(params.sessionLength).toBeUndefined()
    expect(params.sessionCount).toBeUndefined()

  })

})
