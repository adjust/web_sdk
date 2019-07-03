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
import {flushPromises, setDocumentProp} from './_helper'
import {MINUTE} from '../constants'

jest.mock('../logger')
jest.mock('../request')
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
    jest.spyOn(Queue, 'push')
    jest.spyOn(Queue, 'run').mockImplementation(() => {})
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
      let activityState

      Session.watch()

      dateNowSpy.mockReturnValue(currentTime)

      activityState = ActivityState.default.current

      expect.assertions(31)
      expect(setInterval).toHaveBeenCalledTimes(1)
      expect(activityState.timeSpent).toBeUndefined()
      expect(activityState.sessionLength).toBeUndefined()

      return flushPromises()
        .then(() => {
          Queue.push.mockClear() // clear mock happened when watch started
          Identity.persist.mockClear()

          dateNowSpy.mockReturnValue(currentTime += MINUTE)
          jest.advanceTimersByTime(MINUTE)

          return flushPromises()
        })
        .then(() => StorageManager.default.getFirst('activityState'))
        .then(record => {

          activityState = ActivityState.default.current

          expect(Identity.persist).toHaveBeenCalledTimes(1)
          expect(record.lastActive).toEqual(currentTime)
          expect(activityState.lastActive).toEqual(currentTime)
          expect(record.timeSpent).toEqual(60)
          expect(activityState.timeSpent).toEqual(60)
          expect(record.sessionLength).toEqual(60)
          expect(activityState.sessionLength).toEqual(60)


          dateNowSpy.mockReturnValue(currentTime += MINUTE)
          jest.advanceTimersByTime(MINUTE)

          return flushPromises()
        })
        .then(() => StorageManager.default.getFirst('activityState'))
        .then(record => {

          activityState = ActivityState.default.current

          expect(Identity.persist).toHaveBeenCalledTimes(2)
          expect(record.lastActive).toEqual(currentTime)
          expect(activityState.lastActive).toEqual(currentTime)
          expect(record.timeSpent).toEqual(120)
          expect(activityState.timeSpent).toEqual(120)
          expect(record.sessionLength).toEqual(120)
          expect(activityState.sessionLength).toEqual(120)

          dateNowSpy.mockReturnValue(currentTime += MINUTE)
          jest.advanceTimersByTime(MINUTE)

          return flushPromises()
        })
        .then(() => StorageManager.default.getFirst('activityState'))
        .then(record => {

          activityState = ActivityState.default.current

          expect(Identity.persist).toHaveBeenCalledTimes(3)
          expect(record.lastActive).toEqual(currentTime)
          expect(activityState.lastActive).toEqual(currentTime)
          expect(record.timeSpent).toEqual(180)
          expect(activityState.timeSpent).toEqual(180)
          expect(record.sessionLength).toEqual(180)
          expect(activityState.sessionLength).toEqual(180)

          currentLastActive = currentTime

          Session.destroy()

          dateNowSpy.mockReturnValue(currentTime += MINUTE)
          jest.advanceTimersByTime(MINUTE)

          return flushPromises()
        })
        .then(() => StorageManager.default.getFirst('activityState'))
        .then(record => {

          activityState = ActivityState.default.current

          expect(Identity.persist).toHaveBeenCalledTimes(3)
          expect(record.lastActive).toEqual(currentLastActive)
          expect(activityState.lastActive).toEqual(currentLastActive)
          expect(record.timeSpent).toEqual(180)
          expect(activityState.timeSpent).toEqual(180)
          expect(record.sessionLength).toEqual(180)
          expect(activityState.sessionLength).toEqual(180)

          return flushPromises()
        })
    })

    it('send install on initial run', () => {

      _reset()

      expect.assertions(3)

      return Identity.start()
        .then(() => {

          Session.watch()

          expect(Utilities.on).toHaveBeenCalled()

          return flushPromises()
            .then(() => {
              expect(Queue.push).toHaveBeenCalledWith({
                url: '/session',
                method: 'POST',
                params: {}
              })

              jest.runOnlyPendingTimers()

              return flushPromises()
            })
            .then(() => {
              expect(ActivityState.default.current.lastActive).toBeDefined()
            })

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
        .then(() => Identity.start())
        .then(() => {

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
              partnerParams: {some: 'thing', very: 'nice'}
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

      return Identity.persist()
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
          const activityState = ActivityState.default.current

          expect(activityState.lastActive).toBe(currentTime)
          expect(activityState.timeSpent).toEqual(60)
          expect(activityState.sessionLength).toEqual(60)
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
      let activityState

      Session.watch()

      dateNowSpy.mockReturnValue(currentTime)

      activityState = ActivityState.default.current

      expect.assertions(63)
      expect(setInterval).toHaveBeenCalledTimes(1) // from initial _checkSession call
      expect(clearInterval).toHaveBeenCalledTimes(1)
      expect(activityState.timeSpent).toBeUndefined()
      expect(activityState.sessionLength).toBeUndefined()

      return flushPromises()
        .then(() => {
          Queue.push.mockClear() // clear mock happened when watch started
          Identity.persist.mockClear()

          dateNowSpy.mockReturnValue(currentTime += 2 * MINUTE)
          jest.advanceTimersByTime(2 * MINUTE)

          return flushPromises()
        })
        .then(() => StorageManager.default.getFirst('activityState'))
        .then(record => {

          activityState = ActivityState.default.current

          // update within the timer (2 loops)
          expect(Identity.persist).toHaveBeenCalledTimes(2)
          expect(record.lastActive).toEqual(currentTime)
          expect(activityState.lastActive).toEqual(currentTime)
          expect(record.timeSpent).toEqual(120) // 2m
          expect(activityState.timeSpent).toEqual(120)
          expect(record.sessionLength).toEqual(120) // 2m
          expect(activityState.sessionLength).toEqual(120)

          currentLastActive = currentTime

          goToBackground()

          expect(clearInterval).toHaveBeenCalledTimes(2)

          return flushPromises()
        })
        .then(() => StorageManager.default.getFirst('activityState'))
        .then(record => {

          activityState = ActivityState.default.current

          expect(Identity.persist).toHaveBeenCalledTimes(3)
          expect(record.lastActive).toEqual(currentLastActive)
          expect(activityState.lastActive).toEqual(currentLastActive)
          expect(record.timeSpent).toEqual(120)
          expect(activityState.timeSpent).toEqual(120)
          expect(record.sessionLength).toEqual(120)
          expect(activityState.sessionLength).toEqual(120)

          dateNowSpy.mockReturnValue(currentTime += 5 * MINUTE)
          jest.advanceTimersByTime(5 * MINUTE)

          return flushPromises()
        })
        .then(() => StorageManager.default.getFirst('activityState'))
        .then(record => {

          activityState = ActivityState.default.current

          // nothing changed because we're in background
          expect(Identity.persist).toHaveBeenCalledTimes(3)
          expect(record.lastActive).toEqual(currentLastActive)
          expect(activityState.lastActive).toEqual(currentLastActive)
          expect(record.timeSpent).toEqual(120)
          expect(activityState.timeSpent).toEqual(120)
          expect(record.sessionLength).toEqual(120)
          expect(activityState.sessionLength).toEqual(120)

          dateNowSpy.mockReturnValue(currentTime += 10 * MINUTE)
          jest.advanceTimersByTime(10 * MINUTE)

          return flushPromises()
        })
        .then(() => StorageManager.default.getFirst('activityState'))
        .then(record => {

          activityState = ActivityState.default.current

          // again nothing changed because we're still in background
          expect(Identity.persist).toHaveBeenCalledTimes(3)
          expect(record.lastActive).toEqual(currentLastActive)
          expect(activityState.lastActive).toEqual(currentLastActive)
          expect(record.timeSpent).toEqual(120)
          expect(activityState.timeSpent).toEqual(120)
          expect(record.sessionLength).toEqual(120)
          expect(activityState.sessionLength).toEqual(120)

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

          activityState = ActivityState.default.current

          // update within the timer (4 loops)
          expect(Identity.persist).toHaveBeenCalledTimes(8) // 3 + 4 loops + 1 * session check
          expect(activityState.timeSpent).toEqual(360) // 2m + 4m
          expect(activityState.sessionLength).toEqual(2100) // 2m + (5m + 10m + 14m) + 4m

          return flushPromises()
        })
        .then(() => StorageManager.default.getFirst('activityState'))
        .then(record => {

          expect(record.lastActive).toEqual(currentTime)
          expect(ActivityState.default.current.lastActive).toEqual(currentTime)

          dateNowSpy.mockReturnValue(currentTime += 6 * MINUTE)
          jest.advanceTimersByTime(6 * MINUTE)

          activityState = ActivityState.default.current

          // update within the timer (6 loops)
          expect(Identity.persist).toHaveBeenCalledTimes(14) // 3 + 4 + 1 * session check + 6 loops
          expect(activityState.timeSpent).toEqual(720) // 2m + 4m + 6m
          expect(activityState.sessionLength).toEqual(2460) // 2m + (5m + 10m + 14m) + 4m + 6m

          return flushPromises()
        })
        .then(() => StorageManager.default.getFirst('activityState'))
        .then(record => {

          expect(record.lastActive).toEqual(currentTime)
          expect(ActivityState.default.current.lastActive).toEqual(currentTime)

          goToBackground()

          expect(clearInterval).toHaveBeenCalledTimes(4)

          dateNowSpy.mockReturnValue(currentTime += 31 * MINUTE)
          jest.advanceTimersByTime(31 * MINUTE)

          goToForeground()

          activityState = ActivityState.default.current

          expect(Identity.persist).toHaveBeenCalledTimes(15)
          expect(activityState.timeSpent).toEqual(720) // 2m + 4m + 6m
          expect(activityState.sessionLength).toEqual(2460) // 2m + (5m + 10m + 14m) + 4m + 6m

          return flushPromises()
        })
        .then(() => StorageManager.default.getFirst('activityState'))
        .then(record => {

          activityState = ActivityState.default.current

          expect(Identity.persist).toHaveBeenCalledTimes(16)
          expect(setInterval).toHaveBeenCalledTimes(3)
          expect(clearInterval).toHaveBeenCalledTimes(5)
          expect(record.lastActive).toEqual(currentTime)
          expect(activityState.lastActive).toEqual(currentTime)
          expect(record.timeSpent).toEqual(0)
          expect(activityState.timeSpent).toEqual(0)
          expect(record.sessionLength).toEqual(0)
          expect(activityState.sessionLength).toEqual(0)

          // session window reached, so request was sent
          expect(Queue.push).toHaveBeenCalledWith({
            url: '/session',
            method: 'POST',
            params: {}
          })

          dateNowSpy.mockReturnValue(currentTime += 10 * MINUTE)
          jest.advanceTimersByTime(10 * MINUTE)

          activityState = ActivityState.default.current

          expect(Identity.persist).toHaveBeenCalledTimes(26)
          expect(activityState.timeSpent).toEqual(600) // 10m
          expect(activityState.sessionLength).toEqual(600) // 10m

          return flushPromises()
        })
    })

    it('checks session if session window reached when back to foreground', () => {

      let currentTime = Date.now()

      dateNowSpy.mockReturnValue(currentTime)

      expect.assertions(3)

      return Identity.persist()
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
            params: {}
          })
        })
    })

    it('does not check session if session window was not reached when back to foreground', () => {

      let currentTime = Date.now()

      dateNowSpy.mockReturnValue(currentTime)

      expect.assertions(2)

      return Identity.persist()
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



