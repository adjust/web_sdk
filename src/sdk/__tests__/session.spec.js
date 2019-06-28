/* eslint-disable */
import * as Config from '../config'
import * as Utilities from '../utilities'
import * as Session from '../session'
import * as StorageManager from '../storage-manager'
import * as Queue from '../queue'
import * as Identity from '../identity'
import * as ActivityState from '../activity-state'
import * as GlobalParams from '../global-params'
import * as Logger from '../logger'
import * as SessionParams from '../session-params'
import {flushPromises, setDocumentProp} from './_helper'
import {MINUTE} from '../constants'

jest.mock('../logger')
jest.useFakeTimers()

function goToForeground () {
  setDocumentProp('hidden', false)
  global.document.dispatchEvent(new Event('visibilitychange'))
  jest.runOnlyPendingTimers()
}

function goToBackground () {
  setDocumentProp('hidden', true)
  global.document.dispatchEvent(new Event('visibilitychange'))
  jest.runOnlyPendingTimers()
}

describe('test session functionality', () => {

  const _reset = () => {
    Session.destroy()
    Identity.destroy()
    localStorage.clear()
  }

  beforeAll(() => {
    jest.spyOn(Utilities, 'on')
    jest.spyOn(Utilities, 'off')
    jest.spyOn(Identity, 'persist')
    jest.spyOn(Identity, 'sync').mockImplementation(() => Promise.resolve({}))
    jest.spyOn(Queue, 'push').mockImplementation(() => {})
    jest.spyOn(Logger.default, 'error')
  })

  beforeEach(() => {
    StorageManager.default.addItem('activityState', {uuid: '123'}).then(Identity.start)
  })

  afterEach(() => {
    _reset()
    jest.clearAllMocks()
  })

  afterAll(() => {
    jest.restoreAllMocks()
    jest.clearAllTimers()
  })

  describe('general functionality', () => {

    let dateNowSpy

    beforeAll(() => {
      dateNowSpy = jest.spyOn(Date, 'now')
    })

    afterAll(() => {
      dateNowSpy.mockRestore()
    })

    it('starts the session watch and logs error and returns if calling watch multiple times', () => {
      Session.watch()

      expect(Logger.default.error).not.toHaveBeenCalled()

      Session.watch()

      expect(Logger.default.error).toHaveBeenCalledWith('Session watch already initiated')
    })

    it('destroys session watch', () => {

      Session.watch() // 1st attempt

      Session.watch() // 2nd attempt

      expect(Logger.default.error).toHaveBeenCalledWith('Session watch already initiated')
      Logger.default.error.mockClear()

      Session.destroy()

      expect(Utilities.off).toHaveBeenCalled()
      expect(clearInterval).toHaveBeenCalled()

      Session.watch()

      expect(Logger.default.error).not.toHaveBeenCalled()
    })

    it('sets interval for last active timestamp to be updated every n seconds', () => {

      let currentTime = Date.now()
      let currentLastActive
      let sessionParams

      Session.watch()

      dateNowSpy.mockReturnValue(currentTime)

      sessionParams = SessionParams.getAll()

      expect.assertions(23)
      expect(setInterval).toHaveBeenCalledTimes(1)
      expect(sessionParams.timeSpent).toEqual(0)
      expect(sessionParams.sessionLength).toEqual(0)

      return flushPromises()
        .then(() => {
          dateNowSpy.mockReturnValue(currentTime += MINUTE)
          jest.advanceTimersByTime(MINUTE)

          return flushPromises()
        })
        .then(() => StorageManager.default.getFirst('activityState'))
        .then(activityState => {

          sessionParams = SessionParams.getAll()

          expect(Identity.persist).toHaveBeenCalledTimes(1)
          expect(activityState.lastActive).toEqual(currentTime)
          expect(ActivityState.default.current.lastActive).toEqual(currentTime)
          expect(sessionParams.timeSpent).toEqual(60)
          expect(sessionParams.sessionLength).toEqual(60)

          dateNowSpy.mockReturnValue(currentTime += MINUTE)
          jest.advanceTimersByTime(MINUTE)

          return flushPromises()
        })
        .then(() => StorageManager.default.getFirst('activityState'))
        .then(activityState => {

          sessionParams = SessionParams.getAll()

          expect(Identity.persist).toHaveBeenCalledTimes(2)
          expect(activityState.lastActive).toEqual(currentTime)
          expect(ActivityState.default.current.lastActive).toEqual(currentTime)
          expect(sessionParams.timeSpent).toEqual(120)
          expect(sessionParams.sessionLength).toEqual(120)

          dateNowSpy.mockReturnValue(currentTime += MINUTE)
          jest.advanceTimersByTime(MINUTE)

          return flushPromises()
        })
        .then(() => StorageManager.default.getFirst('activityState'))
        .then(activityState => {

          sessionParams = SessionParams.getAll()

          expect(Identity.persist).toHaveBeenCalledTimes(3)
          expect(activityState.lastActive).toEqual(currentTime)
          expect(ActivityState.default.current.lastActive).toEqual(currentTime)
          expect(sessionParams.timeSpent).toEqual(180)
          expect(sessionParams.sessionLength).toEqual(180)

          currentLastActive = currentTime

          Session.destroy()

          dateNowSpy.mockReturnValue(currentTime += MINUTE)
          jest.advanceTimersByTime(MINUTE)

          return flushPromises()
        })
        .then(() => StorageManager.default.getFirst('activityState'))
        .then(activityState => {

          sessionParams = SessionParams.getAll()

          expect(Identity.persist).toHaveBeenCalledTimes(3)
          expect(activityState.lastActive).toEqual(currentLastActive)
          expect(ActivityState.default.current.lastActive).toEqual(currentLastActive)
          expect(sessionParams.timeSpent).toEqual(0)
          expect(sessionParams.sessionLength).toEqual(0)

          return flushPromises()
        })
    })

    it('send install on initial run', () => {

      _reset()

      Identity.start()

      Session.watch()

      expect.assertions(3)

      expect(Utilities.on).toHaveBeenCalled()

      return flushPromises()
        .then(() => {
          expect(Queue.push).toHaveBeenCalledWith({
            url: '/session',
            method: 'POST',
            params: {
              timeSpent: 0,
              sessionLength: 0
            }
          })

          jest.runOnlyPendingTimers()

          return flushPromises()
        })
        .then(() => {
          expect(ActivityState.default.current.lastActive).toBeDefined()
        })

    })

    it('send install on initial run and append global params', () => {

      _reset()

      const callbackParams = [
        {key: 'key1', value: 'value1'},
        {key: 'key2', value: 'value2'}
      ]
      const partnerParams = [
        {key: 'some', value: 'thing'},
        {key: 'very', value: 'nice'}
      ]

      expect.assertions(3)

      return Promise.all([
        GlobalParams.add(callbackParams, 'callback'),
        GlobalParams.add(partnerParams, 'partner')
      ])
      .then(() => {

        Identity.start()

        Session.watch()

        expect(Utilities.on).toHaveBeenCalled()

        return flushPromises()
      })
      .then(() => {

        expect(Queue.push).toHaveBeenCalledWith({
          url: '/session',
          method: 'POST',
          params: {
            callbackParams: {key1: 'value1', key2: 'value2'},
            partnerParams: {some: 'thing', very: 'nice'},
            timeSpent: 0,
            sessionLength: 0
          }
        })

        jest.runOnlyPendingTimers()

        return flushPromises()
      })
      .then(() => {
        expect(ActivityState.default.current.lastActive).toBeDefined()
      })

    })

    it('skips initial install track if already tracked', () => {

      let currentTime = Date.now()

      dateNowSpy.mockReturnValue(currentTime)

      expect.assertions(6)

      return Identity.updateLastActive()
        .then(() => {
          Session.watch()

          expect(Utilities.on).toHaveBeenCalled()
          expect(ActivityState.default.current.lastActive).toBe(currentTime)

          return flushPromises()
        })
        .then(() => {

          expect(Queue.push).not.toHaveBeenCalled()

          dateNowSpy.mockReturnValue(currentTime += MINUTE)
          jest.advanceTimersByTime(MINUTE)

          return flushPromises()
        })
        .then(() => {
          const sessionParams = SessionParams.getAll()

          expect(ActivityState.default.current.lastActive).toBe(currentTime)
          expect(sessionParams.timeSpent).toEqual(60)
          expect(sessionParams.sessionLength).toEqual(60)
        })

    })

  })

  describe('simulate switch to background/foreground', () => {

    let dateNowSpy

    beforeAll(() => {
      dateNowSpy = jest.spyOn(Date, 'now')
    })

    afterAll(() => {
      dateNowSpy.mockRestore()
    })

    it('ignores visibility change if session watch not started', () => {

      global.document.dispatchEvent(new Event('visibilitychange'))

      jest.runOnlyPendingTimers()

      expect(setInterval).not.toHaveBeenCalled()
      expect(clearInterval).not.toHaveBeenCalled()

    })

    it('measures time spent when going to background and then back to foreground', () => {

      let currentTime = Date.now()
      let currentLastActive
      let sessionParams

      Session.watch()

      dateNowSpy.mockReturnValue(currentTime)

      sessionParams = SessionParams.getAll()

      expect.assertions(51)
      expect(setInterval).toHaveBeenCalledTimes(1) // from initial _checkSession call
      expect(clearInterval).toHaveBeenCalledTimes(1)
      expect(sessionParams.timeSpent).toEqual(0)
      expect(sessionParams.sessionLength).toEqual(0)

      return flushPromises()
        .then(() => {
          Queue.push.mockClear() // clear mock happened when watch started

          expect(Identity.persist).not.toHaveBeenCalled()

          dateNowSpy.mockReturnValue(currentTime += 2 * MINUTE)
          jest.advanceTimersByTime(2 * MINUTE)

          return flushPromises()
        })
        .then(() => StorageManager.default.getFirst('activityState'))
        .then(activityState => {

          sessionParams = SessionParams.getAll()

          // update within the timer (2 loops)
          expect(Identity.persist).toHaveBeenCalledTimes(2)
          expect(activityState.lastActive).toEqual(currentTime)
          expect(ActivityState.default.current.lastActive).toEqual(currentTime)
          expect(sessionParams.timeSpent).toEqual(120) // 2m
          expect(sessionParams.sessionLength).toEqual(120) // 2m

          currentLastActive = currentTime

          goToBackground()

          expect(clearInterval).toHaveBeenCalledTimes(2)

          return flushPromises()
        })
        .then(() => StorageManager.default.getFirst('activityState'))
        .then(activityState => {

          sessionParams = SessionParams.getAll()

          expect(Identity.persist).toHaveBeenCalledTimes(3)
          expect(activityState.lastActive).toEqual(currentLastActive)
          expect(ActivityState.default.current.lastActive).toEqual(currentLastActive)
          expect(sessionParams.timeSpent).toEqual(120)
          expect(sessionParams.sessionLength).toEqual(120)

          dateNowSpy.mockReturnValue(currentTime += 5 * MINUTE)
          jest.advanceTimersByTime(5 * MINUTE)

          return flushPromises()
        })
        .then(() => StorageManager.default.getFirst('activityState'))
        .then(activityState => {

          sessionParams = SessionParams.getAll()

          // nothing changed because we're in background
          expect(Identity.persist).toHaveBeenCalledTimes(3)
          expect(activityState.lastActive).toEqual(currentLastActive)
          expect(ActivityState.default.current.lastActive).toEqual(currentLastActive)
          expect(sessionParams.timeSpent).toEqual(120)
          expect(sessionParams.sessionLength).toEqual(420) // 2m + (5m)

          dateNowSpy.mockReturnValue(currentTime += 10 * MINUTE)
          jest.advanceTimersByTime(10 * MINUTE)

          return flushPromises()
        })
        .then(() => StorageManager.default.getFirst('activityState'))
        .then(activityState => {

          sessionParams = SessionParams.getAll()

          // again nothing changed because we're still in background
          expect(Identity.persist).toHaveBeenCalledTimes(3)
          expect(activityState.lastActive).toEqual(currentLastActive)
          expect(ActivityState.default.current.lastActive).toEqual(currentLastActive)
          expect(sessionParams.timeSpent).toEqual(120)
          expect(sessionParams.sessionLength).toEqual(1020) // 2m + (5m + 10m)

          dateNowSpy.mockReturnValue(currentTime += 14 * MINUTE)
          jest.advanceTimersByTime(14 * MINUTE)

          goToForeground() // after 5 + 10 + 14 = 29m

          return flushPromises()
        })
        .then(() => {

          expect(setInterval).toHaveBeenCalledTimes(2)
          expect(clearInterval).toHaveBeenCalledTimes(3)

          // no session window reached, so request was not sent
          expect(Queue.push).not.toHaveBeenCalled()

          dateNowSpy.mockReturnValue(currentTime += 4 * MINUTE)
          jest.advanceTimersByTime(4 * MINUTE)

          sessionParams = SessionParams.getAll()

          // update within the timer (4 loops)
          expect(Identity.persist).toHaveBeenCalledTimes(7) // 3 + 4 loops
          expect(sessionParams.timeSpent).toEqual(360) // 2m + 4m
          expect(sessionParams.sessionLength).toEqual(2100) // 2m + (5m + 10m + 14m) + 4m

          return flushPromises()
        })
        .then(() => StorageManager.default.getFirst('activityState'))
        .then(activityState => {

          expect(activityState.lastActive).toEqual(currentTime)
          expect(ActivityState.default.current.lastActive).toEqual(currentTime)

          dateNowSpy.mockReturnValue(currentTime += 6 * MINUTE)
          jest.advanceTimersByTime(6 * MINUTE)

          sessionParams = SessionParams.getAll()

          // update within the timer (6 loops)
          expect(Identity.persist).toHaveBeenCalledTimes(13) // 3 + 4 + 6 loops
          expect(sessionParams.timeSpent).toEqual(720) // 2m + 4m + 6m
          expect(sessionParams.sessionLength).toEqual(2460) // 2m + (5m + 10m + 14m) + 4m + 6m

          return flushPromises()
        })
        .then(() => StorageManager.default.getFirst('activityState'))
        .then(activityState => {

          expect(activityState.lastActive).toEqual(currentTime)
          expect(ActivityState.default.current.lastActive).toEqual(currentTime)

          currentLastActive = currentTime

          goToBackground()

          expect(clearInterval).toHaveBeenCalledTimes(4)

          dateNowSpy.mockReturnValue(currentTime += 31 * MINUTE)
          jest.advanceTimersByTime(31 * MINUTE)

          goToForeground()

          sessionParams = SessionParams.getAll()

          expect(sessionParams.timeSpent).toEqual(720) // 2m + 4m + 6m
          expect(sessionParams.sessionLength).toEqual(2460) // 2m + (5m + 10m + 14m) + 4m + 6m

          return flushPromises()
        })
        .then(() => StorageManager.default.getFirst('activityState'))
        .then(activityState => {

          sessionParams = SessionParams.getAll()

          expect(setInterval).toHaveBeenCalledTimes(3)
          expect(clearInterval).toHaveBeenCalledTimes(5)
          expect(activityState.lastActive).toEqual(currentLastActive)
          expect(ActivityState.default.current.lastActive).toEqual(currentLastActive)
          expect(sessionParams.timeSpent).toEqual(0)
          expect(sessionParams.sessionLength).toEqual(0)

          // session window reached, so request was sent
          expect(Queue.push).toHaveBeenCalledWith({
            url: '/session',
            method: 'POST',
            params: {
              timeSpent: 720,
              sessionLength: 2460
            }
          })

          dateNowSpy.mockReturnValue(currentTime += 10 * MINUTE)
          jest.advanceTimersByTime(10 * MINUTE)

          sessionParams = SessionParams.getAll()

          expect(sessionParams.timeSpent).toEqual(600) // 10m
          expect(sessionParams.sessionLength).toEqual(600) // 10m

          return flushPromises()
        })
    })

    it('checks session if session window reached when back to foreground', () => {

      let currentTime = Date.now()

      dateNowSpy.mockReturnValue(currentTime)

      expect.assertions(3)

      return Identity.updateLastActive()
        .then(() => {

          Session.watch()

          goToBackground()

          jest.runOnlyPendingTimers()

          return flushPromises()
        })
        .then(() => {

          dateNowSpy.mockReturnValue(currentTime += Config.default.sessionWindow)

          expect(Queue.push).not.toHaveBeenCalled()

          goToForeground()

          return flushPromises()
        })
        .then(() => {
          expect(Queue.push).toHaveBeenCalledTimes(1)
          expect(Queue.push).toHaveBeenCalledWith({
            url: '/session',
            method: 'POST',
            params: {
              timeSpent: 0,
              sessionLength: 0
            }
          })
        })
    })

    it('does not check session if session window was not reached when back to foreground', () => {

      let currentTime = Date.now()

      dateNowSpy.mockReturnValue(currentTime)

      expect.assertions(2)

      return Identity.updateLastActive()
        .then(() => {

          Session.watch()

          goToBackground()

          return flushPromises()
        })
        .then(() => {

          dateNowSpy.mockReturnValue(currentTime += Config.default.sessionWindow - 1)

          expect(Queue.push).not.toHaveBeenCalled()

          goToForeground()

          return flushPromises()
        })
        .then(() => {
          expect(Queue.push).not.toHaveBeenCalled()
        })
    })
  })
})



