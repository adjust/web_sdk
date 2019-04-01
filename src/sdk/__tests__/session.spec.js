/* eslint-disable */
import * as Config from '../config'
import * as Utilities from '../utilities'
import * as Session from '../session'
import * as Storage from '../storage'
import * as Time from '../time'
import * as Queue from '../queue'
import * as identity from '../identity'
import {flushPromises} from './_helper'

jest.useFakeTimers()

const now = 1551916800000
let dateNowSpy

describe('test session functionality', () => {

  beforeAll(() => {
    dateNowSpy = jest.spyOn(Date, 'now').mockReturnValue(now)

    jest.spyOn(Utilities, 'on')
    jest.spyOn(Utilities, 'off')
    jest.spyOn(Storage.default, 'updateItem')
    jest.spyOn(Queue.default, 'push').mockImplementation(() => {})
    jest.spyOn(Time, 'getTimestamp').mockReturnValue(now)

    Object.assign(Config.default.baseParams, {
      app_token: '123abc',
      environment: 'sandbox',
      os_name: 'ios'
    })
  })

  afterEach(() => {
    Session.destroy()
    localStorage.clear()
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

    it('sets last active timestamp directly', () => {

      expect.assertions(2)

      return Session.setLastActive()
        .then(() => {
          expect(Storage.default.updateItem.mock.calls[0][0]).toBe('activityState')
          expect(Storage.default.updateItem.mock.calls[0][1]).toMatchObject({lastActive: now})
        })

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

          expect(Storage.default.updateItem).toHaveBeenCalledTimes(1)
          expect(Storage.default.updateItem.mock.calls[0][1]).toMatchObject({lastActive: 1551916800001})

          return flushPromises()
        })
        .then(() => {

          dateNowSpy.mockReturnValueOnce(1551916800002)

          jest.runOnlyPendingTimers()

          return flushPromises()
        })
        .then(() => {

          expect(Storage.default.updateItem).toHaveBeenCalledTimes(2)
          expect(Storage.default.updateItem.mock.calls[1][1]).toMatchObject({lastActive: 1551916800002})

          return flushPromises()
        })
        .then(() => {

          dateNowSpy.mockReturnValueOnce(1551916800003)

          jest.runOnlyPendingTimers()

          return flushPromises()
        })
        .then(() => {

          expect(Storage.default.updateItem).toHaveBeenCalledTimes(3)
          expect(Storage.default.updateItem.mock.calls[2][1]).toMatchObject({lastActive: 1551916800003})

          Session.destroy()

          return flushPromises()

        })
        .then(() => {

          dateNowSpy.mockReturnValueOnce(1551916800004)

          jest.runOnlyPendingTimers()

          return flushPromises()
        })
        .then(() => {

          expect(Storage.default.updateItem).toHaveBeenCalledTimes(3)
          expect(Storage.default.updateItem.mock.calls[2][1]).toMatchObject({lastActive: 1551916800003})

          return flushPromises()
        })
    })

    it('send install on initial run', () => {

      Session.watchSession()

      expect.assertions(4)

      expect(Utilities.on).toHaveBeenCalled()

      return identity.default()
        .then(current => {

          expect(current.lastActive).toBeUndefined()

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
              os_name: 'ios'
            }
          })

          jest.runOnlyPendingTimers()

          return flushPromises()
        })
        .then(identity.default)
        .then(current => {
          expect(current.lastActive).not.toBeUndefined()
        })

    })

    it('skips initial install track if already tracked', () => {

      dateNowSpy.mockReturnValue(now)

      expect.assertions(4)

      return Session.setLastActive()
        .then(() => {
          Session.watchSession()

          expect(Utilities.on).toHaveBeenCalled()

          return identity.default()
        })
        .then(current => {

          expect(current.lastActive).toBe(now)

          return flushPromises()
        })
        .then(() => {

          expect(Queue.default.push).not.toHaveBeenCalled()

          dateNowSpy.mockReturnValue(1551916800002)

          jest.runOnlyPendingTimers()

          return flushPromises()
        })
        .then(identity.default)
        .then(current => {
          expect(current.lastActive).toBe(1551916800002)
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
          expect(Storage.default.updateItem).not.toHaveBeenCalled()

          global.document.dispatchEvent(new Event('visibilitychange'))

          jest.runOnlyPendingTimers()

          expect(setInterval).toHaveBeenCalledTimes(1)
          expect(clearInterval).toHaveBeenCalledTimes(2)

          return flushPromises()
        })
        .then(() => {

          expect(Storage.default.updateItem).toHaveBeenCalledTimes(1)
          expect(Storage.default.updateItem.mock.calls[0][1]).toMatchObject({lastActive: 1551916800001})

          jest.runOnlyPendingTimers()

          return flushPromises()
        })
        .then(() => {

          // nothing changed because timer is not running
          expect(Storage.default.updateItem).toHaveBeenCalledTimes(1)
          expect(Storage.default.updateItem.mock.calls[0][1]).toMatchObject({lastActive: 1551916800001})

          dateNowSpy.mockReturnValueOnce(1551916800002)

          jest.runOnlyPendingTimers()

          return flushPromises()
        })
        .then(() => {
          // again nothing changed because timer is not running
          expect(Storage.default.updateItem).toHaveBeenCalledTimes(1)
          expect(Storage.default.updateItem.mock.calls[0][1]).toMatchObject({lastActive: 1551916800001})
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
          expect(Storage.default.updateItem).not.toHaveBeenCalled()

          global.document.dispatchEvent(new Event('visibilitychange'))

          jest.runOnlyPendingTimers()

          expect(setInterval).toHaveBeenCalledTimes(2)
          expect(clearInterval).toHaveBeenCalledTimes(2)

          return flushPromises()
        })
        .then(() => {

          expect(Storage.default.updateItem).not.toHaveBeenCalled()

          jest.runOnlyPendingTimers()

          return flushPromises()
        })
        .then(() => {

          // update within the timer
          expect(Storage.default.updateItem).toHaveBeenCalledTimes(1)
          expect(Storage.default.updateItem.mock.calls[0][1]).toMatchObject({lastActive: 1551916800001})

          dateNowSpy.mockReturnValueOnce(1551916800002)

          jest.runOnlyPendingTimers()

          return flushPromises()
        })
        .then(() => {
          // update within the timer (second run)
          expect(Storage.default.updateItem).toHaveBeenCalledTimes(2)
          expect(Storage.default.updateItem.mock.calls[1][1]).toMatchObject({lastActive: 1551916800002})
        })

    })

    it('checks session if certain time passed when back to foreground', () => {

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

          return identity.default()
        })
        .then(current => {
          return Storage.default.updateItem('activityState', Object.assign({}, current, {lastActive: now + Config.default.sessionWindow}))
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
  })
})



