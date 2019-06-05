/* eslint-disable */
import * as Config from '../config'
import * as Utilities from '../utilities'
import * as Session from '../session'
import * as StorageManager from '../storage-manager'
import * as Time from '../time'
import * as Queue from '../queue'
import * as Identity from '../identity'
import * as ActivityState from '../activity-state'
import * as GlobalParams from '../global-params'
import * as Logger from '../logger'
import {flushPromises} from './_helper'

jest.mock('../logger')
jest.useFakeTimers()

const now = 1551916800000
let dateNowSpy

describe('test session functionality', () => {

  const _reset = () => {
    Session.destroy()
    Identity.destroy()
    localStorage.clear()
  }

  beforeAll(() => {
    dateNowSpy = jest.spyOn(Date, 'now').mockReturnValue(now)

    jest.spyOn(Utilities, 'on')
    jest.spyOn(Utilities, 'off')
    jest.spyOn(Identity, 'updateLastActive')
    jest.spyOn(Identity, 'sync').mockImplementation(() => Promise.resolve({}))
    jest.spyOn(Queue, 'push').mockImplementation(() => {})
    jest.spyOn(Time, 'getTimestamp').mockReturnValue(now)
    jest.spyOn(Logger.default, 'error')

    Object.assign(Config.default.baseParams, {
      appToken: '123abc',
      environment: 'sandbox',
      osName: 'ios'
    })
  })

  beforeEach(() => {
    StorageManager.default.addItem('activityState', {uuid: '123'}).then(Identity.start)
  })

  afterEach(() => {
    _reset()
    jest.clearAllMocks()
  })

  afterAll(() => {
    Config.default.destroy()

    jest.restoreAllMocks()
    jest.clearAllTimers()
  })

  describe('general functionality', () => {

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

      Session.watch()

      expect.assertions(13)

      expect(setInterval).toHaveBeenCalledTimes(1)

      return flushPromises()
        .then(() => {
          dateNowSpy.mockReturnValue(1551916800001)

          jest.runOnlyPendingTimers()

          return flushPromises()
        })
        .then(() => StorageManager.default.getFirst('activityState'))
        .then(activityState => {

          expect(Identity.updateLastActive).toHaveBeenCalledTimes(1)
          expect(activityState.lastActive).toEqual(1551916800001)
          expect(ActivityState.default.current.lastActive).toEqual(1551916800001)

          return flushPromises()
        })
        .then(() => {

          dateNowSpy.mockReturnValueOnce(1551916800002)

          jest.runOnlyPendingTimers()

          return flushPromises()
        })
        .then(() => StorageManager.default.getFirst('activityState'))
        .then(activityState => {

          expect(Identity.updateLastActive).toHaveBeenCalledTimes(2)
          expect(activityState.lastActive).toEqual(1551916800002)
          expect(ActivityState.default.current.lastActive).toEqual(1551916800002)

          return flushPromises()
        })
        .then(() => {

          dateNowSpy.mockReturnValueOnce(1551916800003)

          jest.runOnlyPendingTimers()

          return flushPromises()
        })
        .then(() => StorageManager.default.getFirst('activityState'))
        .then(activityState => {

          expect(Identity.updateLastActive).toHaveBeenCalledTimes(3)
          expect(activityState.lastActive).toEqual(1551916800003)
          expect(ActivityState.default.current.lastActive).toEqual(1551916800003)

          Session.destroy()

          return flushPromises()

        })
        .then(() => {

          dateNowSpy.mockReturnValueOnce(1551916800004)

          jest.runOnlyPendingTimers()

          return flushPromises()
        })
        .then(() => StorageManager.default.getFirst('activityState'))
        .then(activityState => {

          expect(Identity.updateLastActive).toHaveBeenCalledTimes(3)
          expect(activityState.lastActive).toEqual(1551916800003)
          expect(ActivityState.default.current.lastActive).toEqual(1551916800003)

          return flushPromises()
        })
    })

    it('send install on initial run', () => {

      _reset()

      Identity.start()

      Session.watch()

      expect.assertions(4)

      expect(Utilities.on).toHaveBeenCalled()
      expect(ActivityState.default.current).toBeNull()

      return flushPromises()
        .then(() => {
          expect(Queue.push).toHaveBeenCalledWith({
            url: '/session',
            method: 'POST',
            params: {
              createdAt: now,
              appToken: '123abc',
              environment: 'sandbox',
              osName: 'ios'
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

      expect.assertions(4)

      return Promise.all([
        GlobalParams.add(callbackParams, 'callback'),
        GlobalParams.add(partnerParams, 'partner')
      ])
      .then(() => {

        Identity.start()

        Session.watch()

        expect(Utilities.on).toHaveBeenCalled()
        expect(ActivityState.default.current).toBeNull()

        return flushPromises()
      })
      .then(() => {

        expect(Queue.push).toHaveBeenCalledWith({
          url: '/session',
          method: 'POST',
          params: {
            createdAt: now,
            appToken: '123abc',
            environment: 'sandbox',
            osName: 'ios',
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

      dateNowSpy.mockReturnValue(now)

      expect.assertions(4)

      return Identity.updateLastActive()
        .then(() => {
          Session.watch()

          expect(Utilities.on).toHaveBeenCalled()
          expect(ActivityState.default.current.lastActive).toBe(now)

          return flushPromises()
        })
        .then(() => {

          expect(Queue.push).not.toHaveBeenCalled()

          dateNowSpy.mockReturnValue(1551916800002)

          jest.runOnlyPendingTimers()

          return flushPromises()
        })
        .then(() => {
          expect(ActivityState.default.current.lastActive).toBe(1551916800002)
        })

    })

  })

  describe('simulate switch to background/foreground', () => {

    it('ignores visibility change if session watch not started', () => {

      global.document.dispatchEvent(new Event('visibilitychange'))

      jest.runOnlyPendingTimers()

      expect(setInterval).not.toHaveBeenCalled()
      expect(clearInterval).not.toHaveBeenCalled()

    })

    it('stops timer and stores last active state if went to background', () => {

      global.document.testHidden = true

      dateNowSpy.mockReturnValue(1551916800001)

      Session.watch()

      expect.assertions(14)
      expect(setInterval).toHaveBeenCalledTimes(1) // from initial _checkSession call
      expect(clearInterval).toHaveBeenCalledTimes(1)

      return flushPromises()
        .then(() => {
          expect(Identity.updateLastActive).not.toHaveBeenCalled()

          global.document.dispatchEvent(new Event('visibilitychange'))

          jest.runOnlyPendingTimers()

          expect(setInterval).toHaveBeenCalledTimes(1)
          expect(clearInterval).toHaveBeenCalledTimes(2)

          return flushPromises()
        })
        .then(() => StorageManager.default.getFirst('activityState'))
        .then(activityState => {

          expect(Identity.updateLastActive).toHaveBeenCalledTimes(1)
          expect(activityState.lastActive).toEqual(1551916800001)
          expect(ActivityState.default.current.lastActive).toEqual(1551916800001)

          jest.runOnlyPendingTimers()

          return flushPromises()
        })
        .then(() => StorageManager.default.getFirst('activityState'))
        .then(activityState => {

          // nothing changed because timer is not running
          expect(Identity.updateLastActive).toHaveBeenCalledTimes(1)
          expect(activityState.lastActive).toEqual(1551916800001)
          expect(ActivityState.default.current.lastActive).toEqual(1551916800001)

          dateNowSpy.mockReturnValueOnce(1551916800002)

          jest.runOnlyPendingTimers()

          return flushPromises()
        })
        .then(() => StorageManager.default.getFirst('activityState'))
        .then(activityState => {
          // again nothing changed because timer is not running
          expect(Identity.updateLastActive).toHaveBeenCalledTimes(1)
          expect(activityState.lastActive).toEqual(1551916800001)
          expect(ActivityState.default.current.lastActive).toEqual(1551916800001)
        })


    })

    it('restarts timer and stores last active state every n seconds when back to foreground', () => {

      global.document.testHidden = false

      dateNowSpy.mockReturnValue(1551916800001)

      Session.watch()

      expect.assertions(11)
      expect(setInterval).toHaveBeenCalledTimes(1) // from initial _checkSession call
      expect(clearInterval).toHaveBeenCalledTimes(1)

      return flushPromises()
        .then(() => {
          expect(Identity.updateLastActive).not.toHaveBeenCalled()

          global.document.dispatchEvent(new Event('visibilitychange'))

          jest.runOnlyPendingTimers()

          return flushPromises()
        })
        .then(() => StorageManager.default.getFirst('activityState'))
        .then(activityState => {

          expect(setInterval).toHaveBeenCalledTimes(2)
          expect(clearInterval).toHaveBeenCalledTimes(2)

          // update within the timer
          expect(Identity.updateLastActive).toHaveBeenCalledTimes(1)
          expect(activityState.lastActive).toEqual(1551916800001)
          expect(ActivityState.default.current.lastActive).toEqual(1551916800001)

          dateNowSpy.mockReturnValueOnce(1551916800002)

          jest.runOnlyPendingTimers()

          return flushPromises()
        })
        .then(() => StorageManager.default.getFirst('activityState'))
        .then(activityState => {
          // update within the timer (second run)
          expect(Identity.updateLastActive).toHaveBeenCalledTimes(2)
          expect(activityState.lastActive).toEqual(1551916800002)
          expect(ActivityState.default.current.lastActive).toEqual(1551916800002)
        })

    })

    it('checks session if session window reached when back to foreground', () => {

      dateNowSpy.mockReturnValue(now)

      expect.assertions(3)

      return Identity.updateLastActive()
        .then(() => {

          global.document.testHidden = false

          Session.watch()

          jest.runOnlyPendingTimers()

          return flushPromises()
        })
        .then(() => {

          dateNowSpy.mockReturnValue(now + Config.default.sessionWindow)

          expect(Queue.push).not.toHaveBeenCalled()

          global.document.dispatchEvent(new Event('visibilitychange'))

          jest.runOnlyPendingTimers()

          return flushPromises()
        })
        .then(() => {
          expect(Queue.push).toHaveBeenCalledTimes(1)
          expect(Queue.push).toHaveBeenCalledWith({
            url: '/session',
            method: 'POST',
            params: {
              createdAt: now,
              appToken: '123abc',
              environment: 'sandbox',
              osName: 'ios'
            }
          })
        })
    })

    it('does not check session if session window was not reached when back to foreground', () => {

      dateNowSpy.mockReturnValue(now)

      expect.assertions(2)

      return Identity.updateLastActive()
        .then(() => {

          global.document.testHidden = false

          Session.watch()

          jest.runOnlyPendingTimers()

          return flushPromises()
        })
        .then(() => {

          dateNowSpy.mockReturnValue(now + Config.default.sessionWindow - 1)

          expect(Queue.push).not.toHaveBeenCalled()

          global.document.dispatchEvent(new Event('visibilitychange'))

          jest.runOnlyPendingTimers()

          return flushPromises()
        })
        .then(() => {
          expect(Queue.push).not.toHaveBeenCalled()
        })
    })
  })
})



