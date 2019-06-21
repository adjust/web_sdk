/* eslint-disable */
import * as TimeSpent from '../time-spent'
import * as ActivityState from '../activity-state'
import {MINUTE, SECOND} from '../constants'

describe('time spent functionality', () => {

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
    TimeSpent.reset()
  })

  it('returns zero initially', () => {
    TimeSpent.toForeground()

    dateNowSpy.mockReturnValue(currentTime)
    TimeSpent.update()

    expect(TimeSpent.get()).toEqual(0)
  })

  it('returns zero after some time when not in foreground', () => {
    TimeSpent.toBackground()

    dateNowSpy.mockReturnValue(currentTime += 2 * MINUTE)
    TimeSpent.update()

    expect(TimeSpent.get()).toEqual(0)
  })

  it('returns positive number after some time when in foreground', () => {
    TimeSpent.toForeground()

    dateNowSpy.mockReturnValue(currentTime += 3 * MINUTE)
    TimeSpent.update()

    expect(TimeSpent.get()).toEqual((3 * MINUTE) / SECOND)

    dateNowSpy.mockReturnValue(currentTime += 5 * MINUTE)
    TimeSpent.update()

    expect(TimeSpent.get()).toEqual((8 * MINUTE) / SECOND)

    TimeSpent.toBackground()

    dateNowSpy.mockReturnValue(currentTime += MINUTE)
    TimeSpent.update()

    expect(TimeSpent.get()).toEqual((8 * MINUTE) / SECOND)
  })

  it('resets and continues counting from zero if still in foreground', () => {
    TimeSpent.toForeground()

    dateNowSpy.mockReturnValue(currentTime += 6 * MINUTE)
    TimeSpent.update()

    expect(TimeSpent.get()).toEqual((6 * MINUTE) / SECOND)

    TimeSpent.reset()
    dateNowSpy.mockReturnValue(currentTime += 2 * MINUTE)

    expect(TimeSpent.get()).toEqual((2 * MINUTE) / SECOND)
  })

  it('resets and returns zero if went to background', () => {
    TimeSpent.toForeground()

    dateNowSpy.mockReturnValue(currentTime += 2 * MINUTE)
    TimeSpent.update()

    expect(TimeSpent.get()).toEqual((2 * MINUTE) / SECOND)

    TimeSpent.reset()
    TimeSpent.toBackground()
    dateNowSpy.mockReturnValue(currentTime += 3 * MINUTE)

    expect(TimeSpent.get()).toEqual(0)
  })

  it('includes time offset from the last preserved point', () => {
    TimeSpent.toForeground()

    dateNowSpy.mockReturnValue(currentTime += 3 * MINUTE)
    TimeSpent.update()

    expect(TimeSpent.get()).toEqual((3 * MINUTE) / SECOND)

    dateNowSpy.mockReturnValue(currentTime += 2 * MINUTE)

    expect(TimeSpent.get()).toEqual((5 * MINUTE) / SECOND)

    TimeSpent.update()
    TimeSpent.toBackground()

    dateNowSpy.mockReturnValue(currentTime += MINUTE)

    expect(TimeSpent.get()).toEqual((5 * MINUTE) / SECOND)

    TimeSpent.toForeground()

    dateNowSpy.mockReturnValue(currentTime += MINUTE)

    expect(TimeSpent.get()).toEqual((6 * MINUTE) / SECOND)
  })

})
