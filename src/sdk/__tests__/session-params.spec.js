/* eslint-disable */
import * as SessionParams from '../session-params'
import * as ActivityState from '../activity-state'
import {MINUTE, SECOND} from '../constants'

describe('session params functionality', () => {

  let dateNowSpy
  let currentTime = Date.now()

  beforeAll(() => {
    dateNowSpy = jest.spyOn(Date, 'now')
  })

  afterEach(() => {
    jest.clearAllMocks()
    ActivityState.default.current = {}
    localStorage.clear()
  })

  afterAll(() => {
    jest.restoreAllMocks()
    SessionParams.reset()
  })

  it('returns zero initially', () => {
    SessionParams.toForeground()

    dateNowSpy.mockReturnValue(currentTime)
    SessionParams.updateAll()

    const params = SessionParams.getAll()

    expect(params.timeSpent).toEqual(0)
    expect(params.sessionLength).toEqual(0)
  })

  it('returns zero for time spent and positive value for session length after some time when not in foreground', () => {
    SessionParams.toBackground()

    dateNowSpy.mockReturnValue(currentTime += 2 * MINUTE)
    SessionParams.updateAll()

    const params = SessionParams.getAll()

    expect(params.timeSpent).toEqual(0)
    expect(params.sessionLength).toEqual((2 * MINUTE) / SECOND)
  })

  it('returns positive number after some time when in foreground', () => {

    let params

    SessionParams.toForeground()

    dateNowSpy.mockReturnValue(currentTime += 3 * MINUTE)
    SessionParams.updateAll()

    params = SessionParams.getAll()

    expect(params.timeSpent).toEqual((3 * MINUTE) / SECOND)
    expect(params.sessionLength).toEqual((3 * MINUTE) / SECOND)

    dateNowSpy.mockReturnValue(currentTime += 5 * MINUTE)
    SessionParams.updateAll()

    params = SessionParams.getAll()

    expect(params.timeSpent).toEqual((8 * MINUTE) / SECOND)
    expect(params.sessionLength).toEqual((8 * MINUTE) / SECOND)

    SessionParams.toBackground()

    dateNowSpy.mockReturnValue(currentTime += MINUTE)
    SessionParams.updateAll()

    params = SessionParams.getAll()

    expect(params.timeSpent).toEqual((8 * MINUTE) / SECOND)
    expect(params.sessionLength).toEqual((9 * MINUTE) / SECOND)
  })

  it('measures session length while within session window', () => {

    SessionParams.toForeground()

    dateNowSpy.mockReturnValue(currentTime += 3 * MINUTE)
    SessionParams.updateAll()

    expect(SessionParams.getAll().sessionLength).toEqual((3 * MINUTE) / SECOND)

    SessionParams.toBackground()

    dateNowSpy.mockReturnValue(currentTime += 29 * MINUTE)
    SessionParams.updateAll()

    expect(SessionParams.getAll().sessionLength).toEqual((32 * MINUTE) / SECOND)

    SessionParams.toForeground()

    dateNowSpy.mockReturnValue(currentTime += MINUTE)
    SessionParams.updateAll()

    expect(SessionParams.getAll().sessionLength).toEqual((33 * MINUTE) / SECOND)

    SessionParams.toBackground()

    dateNowSpy.mockReturnValue(currentTime += 30 * MINUTE)
    SessionParams.updateAll()

    expect(SessionParams.getAll().sessionLength).toEqual((33 * MINUTE) / SECOND)

  })

  it('resets and continues counting from zero if still in foreground', () => {
    let params

    SessionParams.toForeground()

    dateNowSpy.mockReturnValue(currentTime += 6 * MINUTE)
    SessionParams.updateAll()

    params = SessionParams.getAll()

    expect(params.timeSpent).toEqual((6 * MINUTE) / SECOND)
    expect(params.sessionLength).toEqual((6 * MINUTE) / SECOND)

    SessionParams.reset()
    dateNowSpy.mockReturnValue(currentTime += 2 * MINUTE)

    params = SessionParams.getAll()

    expect(params.timeSpent).toEqual((2 * MINUTE) / SECOND)
    expect(params.sessionLength).toEqual((2 * MINUTE) / SECOND)
  })

  it('resets and returns zero if went to background', () => {
    let params

    SessionParams.toForeground()

    dateNowSpy.mockReturnValue(currentTime += 2 * MINUTE)
    SessionParams.updateAll()

    params = SessionParams.getAll()

    expect(params.timeSpent).toEqual((2 * MINUTE) / SECOND)
    expect(params.sessionLength).toEqual((2 * MINUTE) / SECOND)

    SessionParams.reset()
    SessionParams.toBackground()

    params = SessionParams.getAll()

    expect(params.timeSpent).toEqual(0)
    expect(params.sessionLength).toEqual(0)

    dateNowSpy.mockReturnValue(currentTime += 3 * MINUTE)

    params = SessionParams.getAll()

    expect(params.timeSpent).toEqual(0)
    expect(params.sessionLength).toEqual((3 * MINUTE) / SECOND)
  })

  it('includes time offset from the last preserved point', () => {
    let params

    SessionParams.toForeground()

    dateNowSpy.mockReturnValue(currentTime += 3 * MINUTE)
    SessionParams.updateAll()

    params = SessionParams.getAll()

    expect(params.timeSpent).toEqual((3 * MINUTE) / SECOND)
    expect(params.sessionLength).toEqual((3 * MINUTE) / SECOND)

    dateNowSpy.mockReturnValue(currentTime += 2 * MINUTE)

    params = SessionParams.getAll()

    expect(params.timeSpent).toEqual((5 * MINUTE) / SECOND)
    expect(params.sessionLength).toEqual((5 * MINUTE) / SECOND)

    SessionParams.updateAll()
    SessionParams.toBackground()

    dateNowSpy.mockReturnValue(currentTime += MINUTE)

    params = SessionParams.getAll()

    expect(params.timeSpent).toEqual((5 * MINUTE) / SECOND)
    expect(params.sessionLength).toEqual((6 * MINUTE) / SECOND)

    SessionParams.updateAll()
    SessionParams.toForeground()

    dateNowSpy.mockReturnValue(currentTime += MINUTE)

    params = SessionParams.getAll()

    expect(params.timeSpent).toEqual((6 * MINUTE) / SECOND)
    expect(params.sessionLength).toEqual((7 * MINUTE) / SECOND)
  })

})
