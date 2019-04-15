/* eslint-disable */
import * as Config from '../config'
import * as Utilities from '../utilities'
import * as Session from '../session'
import * as StorageManager from '../storage-manager'
import * as Time from '../time'
import * as Queue from '../queue'
import * as Identity from '../identity'
import * as ActivityState from '../activity-state'
import {flushPromises} from './_helper'
import * as GlobalParams from '../global-params'

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
    jest.spyOn(Identity, 'updateActivityState')
    jest.spyOn(Queue.default, 'push').mockImplementation(() => {})
    jest.spyOn(Time, 'getTimestamp').mockReturnValue(now)

    Object.assign(Config.default.baseParams, {
      app_token: '123abc',
      environment: 'sandbox',
      os_name: 'ios'
    })
  })

  beforeEach(() => {
    StorageManager.default.addItem('activityState', {uuid: '123'}).then(Identity.startActivityState)
  })

  afterEach(() => {
    _reset()
    jest.clearAllMocks()
  })

  afterAll(() => {
    Object.assign(Config.default.baseParams, {
      app_token: '',
      environment: '',
      os_name: ''
    })

    jest.restoreAllMocks()
    jest.clearAllTimers()
  })

  describe('general functionality', () => {

    it('starts the session watch and throws error if calling watch multiple times', () => {
      expect(() => {
        Session.watchSession()
      }).not.toThrow()

      expect(() => {
        Session.watchSession()
      }).toThrow(new Error('Session watch already initiated'))
    })

    it('destroys session watch', () => {

      Session.watchSession()

      expect(() => {
        Session.watchSession()
      }).toThrow(new Error('Session watch already initiated'))

      Session.destroy()

      expect(Utilities.off).toHaveBeenCalled()
      expect(clearInterval).toHaveBeenCalled()

      expect(() => {
        Session.watchSession()
      }).not.toThrow()
    })

    it('sets last active timestamp when activity state exists and when not ignored', () => {

      expect.assertions(1)

      Session.setLastActive()

      return flushPromises()
        .then(() => {
          expect(Identity.updateActivityState).toHaveBeenCalledWith({lastActive: now})
        })

    })

    it('does not set last active timestamp when activity state does not exist and when ignored', () => {

      _reset()

      Identity.startActivityState()

      expect.assertions(1)

      Session.setLastActive(true)

      return flushPromises()
        .then(() => {
          expect(Identity.updateActivityState).not.toHaveBeenCalled()
        })
    })

    it('sets last active timestamp when activity state does not exist and when not ignored', () => {

      jest.spyOn(Identity, 'updateActivityState').mockImplementationOnce(() => {})

      _reset()

      Identity.startActivityState()

      expect.assertions(1)

      Session.setLastActive()

      return flushPromises()
        .then(() => {
          expect(Identity.updateActivityState).toHaveBeenCalledWith({lastActive: now})
        })
    })

    it('sets interval for last active timestamp to be updated every n seconds', () => {

      Session.watchSession()

      expect.assertions(9)

      expect(setInterval).toHaveBeenCalledTimes(1)

      return flushPromises()
        .then(() => {
          dateNowSpy.mockReturnValue(1551916800001)

          jest.runOnlyPendingTimers()

          return flushPromises()
        })
        .then(() => {

          expect(Identity.updateActivityState).toHaveBeenCalledTimes(1)
          expect(Identity.updateActivityState).toHaveBeenCalledWith({lastActive: 1551916800001})

          return flushPromises()
        })
        .then(() => {

          dateNowSpy.mockReturnValueOnce(1551916800002)

          jest.runOnlyPendingTimers()

          return flushPromises()
        })
        .then(() => {

          expect(Identity.updateActivityState).toHaveBeenCalledTimes(2)
          expect(Identity.updateActivityState).toHaveBeenCalledWith({lastActive: 1551916800002})

          return flushPromises()
        })
        .then(() => {

          dateNowSpy.mockReturnValueOnce(1551916800003)

          jest.runOnlyPendingTimers()

          return flushPromises()
        })
        .then(() => {

          expect(Identity.updateActivityState).toHaveBeenCalledTimes(3)
          expect(Identity.updateActivityState).toHaveBeenCalledWith({lastActive: 1551916800003})

          Session.destroy()

          return flushPromises()

        })
        .then(() => {

          dateNowSpy.mockReturnValueOnce(1551916800004)

          jest.runOnlyPendingTimers()

          return flushPromises()
        })
        .then(() => {

          expect(Identity.updateActivityState).toHaveBeenCalledTimes(3)
          expect(Identity.updateActivityState).toHaveBeenCalledWith({lastActive: 1551916800003})

          return flushPromises()
        })
    })

    it('send install on initial run', () => {

      _reset()

      Identity.startActivityState()

      Session.watchSession()

      expect.assertions(4)

      expect(Utilities.on).toHaveBeenCalled()
      expect(ActivityState.default.current).toBeNull()

      return flushPromises()
        .then(() => {
          expect(Queue.default.push).toHaveBeenCalledWith({
            url: '/session',
            method: 'POST',
            params: {
              created_at: now,
              app_token: '123abc',
              environment: 'sandbox',
              os_name: 'ios'
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

        Identity.startActivityState()

        Session.watchSession()

        expect(Utilities.on).toHaveBeenCalled()
        expect(ActivityState.default.current).toBeNull()

        return flushPromises()
      })
      .then(() => {

        expect(Queue.default.push).toHaveBeenCalledWith({
          url: '/session',
          method: 'POST',
          params: {
            created_at: now,
            app_token: '123abc',
            environment: 'sandbox',
            os_name: 'ios',
            callback_params: {key1: 'value1', key2: 'value2'},
            partner_params: {some: 'thing', very: 'nice'}
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

      return Session.setLastActive()
        .then(() => {
          Session.watchSession()

          expect(Utilities.on).toHaveBeenCalled()
          expect(ActivityState.default.current.lastActive).toBe(now)

          return flushPromises()
        })
        .then(() => {

          expect(Queue.default.push).not.toHaveBeenCalled()

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

      Session.watchSession()

      expect.assertions(11)
      expect(setInterval).toHaveBeenCalledTimes(1) // from initial _checkSession call
      expect(clearInterval).toHaveBeenCalledTimes(1)

      return flushPromises()
        .then(() => {
          expect(Identity.updateActivityState).not.toHaveBeenCalled()

          global.document.dispatchEvent(new Event('visibilitychange'))

          jest.runOnlyPendingTimers()

          expect(setInterval).toHaveBeenCalledTimes(1)
          expect(clearInterval).toHaveBeenCalledTimes(2)

          return flushPromises()
        })
        .then(() => {

          expect(Identity.updateActivityState).toHaveBeenCalledTimes(1)
          expect(Identity.updateActivityState).toHaveBeenCalledWith({lastActive: 1551916800001})

          jest.runOnlyPendingTimers()

          return flushPromises()
        })
        .then(() => {

          // nothing changed because timer is not running
          expect(Identity.updateActivityState).toHaveBeenCalledTimes(1)
          expect(Identity.updateActivityState).toHaveBeenCalledWith({lastActive: 1551916800001})

          dateNowSpy.mockReturnValueOnce(1551916800002)

          jest.runOnlyPendingTimers()

          return flushPromises()
        })
        .then(() => {
          // again nothing changed because timer is not running
          expect(Identity.updateActivityState).toHaveBeenCalledTimes(1)
          expect(Identity.updateActivityState).toHaveBeenCalledWith({lastActive: 1551916800001})
        })


    })

    it('restarts timer and stores last active state every n seconds when back to foreground', () => {

      global.document.testHidden = false

      dateNowSpy.mockReturnValue(1551916800001)

      Session.watchSession()

      expect.assertions(10)
      expect(setInterval).toHaveBeenCalledTimes(1) // from initial _checkSession call
      expect(clearInterval).toHaveBeenCalledTimes(1)

      return flushPromises()
        .then(() => {
          expect(Identity.updateActivityState).not.toHaveBeenCalled()

          global.document.dispatchEvent(new Event('visibilitychange'))

          jest.runOnlyPendingTimers()

          expect(setInterval).toHaveBeenCalledTimes(2)
          expect(clearInterval).toHaveBeenCalledTimes(2)

          return flushPromises()
        })
        .then(() => {

          expect(Identity.updateActivityState).not.toHaveBeenCalled()

          jest.runOnlyPendingTimers()

          return flushPromises()
        })
        .then(() => {

          // update within the timer
          expect(Identity.updateActivityState).toHaveBeenCalledTimes(1)
          expect(Identity.updateActivityState).toHaveBeenCalledWith({lastActive: 1551916800001})

          dateNowSpy.mockReturnValueOnce(1551916800002)

          jest.runOnlyPendingTimers()

          return flushPromises()
        })
        .then(() => {
          // update within the timer (second run)
          expect(Identity.updateActivityState).toHaveBeenCalledTimes(2)
          expect(Identity.updateActivityState).toHaveBeenCalledWith({lastActive: 1551916800002})
        })

    })

    it('checks session if session window reached when back to foreground', () => {

      dateNowSpy.mockReturnValue(now)

      expect.assertions(2)

      return Session.setLastActive()
        .then(() => {

          global.document.testHidden = false

          Session.watchSession()

          jest.runOnlyPendingTimers()

          return flushPromises()
        })
        .then(() => {

          expect(Queue.default.push).not.toHaveBeenCalled()

          return Identity.updateActivityState(Object.assign({}, ActivityState.default.current, {lastActive: now + Config.default.sessionWindow}))
        })
        .then(() => {

          global.document.dispatchEvent(new Event('visibilitychange'))

          jest.runOnlyPendingTimers()

          return flushPromises()
        })
        .then(() => {
          expect(Queue.default.push).toHaveBeenCalledTimes(1)
        })
    })

    it('does not check session if session window wasn not reached when back to foreground', () => {

      dateNowSpy.mockReturnValue(now)

      expect.assertions(2)

      return Session.setLastActive()
        .then(() => {

          global.document.testHidden = false

          Session.watchSession()

          jest.runOnlyPendingTimers()

          return flushPromises()
        })
        .then(() => {

          expect(Queue.default.push).not.toHaveBeenCalled()

          return Identity.updateActivityState(Object.assign({}, ActivityState.default.current, {lastActive: now + Config.default.sessionWindow - 1}))
        })
        .then(() => {

          global.document.dispatchEvent(new Event('visibilitychange'))

          jest.runOnlyPendingTimers()

          return flushPromises()
        })
        .then(() => {
          expect(Queue.default.push).not.toHaveBeenCalled()
        })
    })
  })
})



