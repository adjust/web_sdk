/* eslint-disable */
import * as Config from '../config'
import * as Utilities from '../utilities'
import * as Session from '../session'
import * as Storage from '../storage'
import * as Time from '../time'
import * as Queue from '../queue'

jest.useFakeTimers()

const now = 1551916800000
let dateNowSpy

function flushPromises() {
  return new Promise(resolve => setImmediate(resolve))
}

describe('test session functionality', () => {

  beforeAll(() => {
    dateNowSpy = jest.spyOn(Date, 'now').mockReturnValue(now)

    jest.spyOn(Utilities, 'on')
    jest.spyOn(Utilities, 'off')
    jest.spyOn(Storage, 'setItem')
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

      Session.setLastActive()

      expect(Storage.setItem).toHaveBeenCalledWith('lastActive', now)

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

      dateNowSpy.mockReturnValue(1551916800001)

      Session.watchSession()

      expect.assertions(9)
      expect(setInterval).toHaveBeenCalledTimes(1)

      jest.runOnlyPendingTimers()

      expect(Storage.setItem).toHaveBeenCalledTimes(1)
      expect(Storage.setItem).toHaveBeenLastCalledWith('lastActive', 1551916800001)

      return flushPromises()
        .then(() => {

          dateNowSpy.mockReturnValueOnce(1551916800002)

          jest.runOnlyPendingTimers()

          expect(Storage.setItem).toHaveBeenCalledTimes(2)
          expect(Storage.setItem).toHaveBeenLastCalledWith('lastActive', 1551916800002)

          return flushPromises()
        })
        .then(() => {

          dateNowSpy.mockReturnValueOnce(1551916800003)

          jest.runOnlyPendingTimers()

          expect(Storage.setItem).toHaveBeenCalledTimes(3)
          expect(Storage.setItem).toHaveBeenLastCalledWith('lastActive', 1551916800003)

          Session.destroy()

          return flushPromises()
        })
        .then(() => {

          dateNowSpy.mockReturnValueOnce(1551916800004)

          jest.runOnlyPendingTimers()

          expect(Storage.setItem).toHaveBeenCalledTimes(3)
          expect(Storage.setItem).toHaveBeenLastCalledWith('lastActive', 1551916800003)

          return flushPromises()
        })
    })

    it('send install on initial run', () => {

      Session.watchSession()

      expect(Utilities.on).toHaveBeenCalled()
      expect(Storage.getItem('lastActive', 0)).toBe(0)

      jest.runOnlyPendingTimers()

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
      expect(Storage.getItem('lastActive', 0)).not.toBe(0)

    })

    it('skips initial install track if already tracked', () => {

      Storage.setItem('lastActive', now)

      Session.watchSession()

      expect(Utilities.on).toHaveBeenCalled()
      expect(Storage.getItem('lastActive', 0)).toBe(now)

      dateNowSpy.mockReturnValue(1551916800002)

      jest.runOnlyPendingTimers()

      expect(Queue.default.push).not.toHaveBeenCalled()
      expect(Storage.getItem('lastActive', 0)).toBe(1551916800002)

    })

  })

  describe('simulate switch to background/foreground', () => {

    it('ignores visibility change if session watch not started', () => {

      global.document.dispatchEvent(new Event('visibilitychange'))

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
      expect(Storage.setItem).not.toHaveBeenCalled()

      global.document.dispatchEvent(new Event('visibilitychange'))

      expect(setInterval).toHaveBeenCalledTimes(1)
      expect(clearInterval).toHaveBeenCalledTimes(2)
      expect(Storage.setItem).toHaveBeenCalledTimes(1)
      expect(Storage.setItem).toHaveBeenCalledWith('lastActive', 1551916800001)

      jest.runOnlyPendingTimers()

      // nothing changed because timer is not running
      expect(Storage.setItem).toHaveBeenCalledTimes(1)
      expect(Storage.setItem).toHaveBeenCalledWith('lastActive', 1551916800001)

      return flushPromises()
        .then(() => {

          dateNowSpy.mockReturnValueOnce(1551916800002)

          jest.runOnlyPendingTimers()

          // again nothing changed because timer is not running
          expect(Storage.setItem).toHaveBeenCalledTimes(1)
          expect(Storage.setItem).toHaveBeenCalledWith('lastActive', 1551916800001)
        })
    })

    it('restarts timer and stores last active state every n seconds when back to foreground', () => {

      global.document.testHidden = false

      dateNowSpy.mockReturnValue(1551916800001)

      Session.watchSession()

      expect.assertions(10)
      expect(clearInterval).toHaveBeenCalledTimes(1) // from initial _checkSession call
      expect(setInterval).toHaveBeenCalledTimes(1)
      expect(Storage.setItem).not.toHaveBeenCalled()

      global.document.dispatchEvent(new Event('visibilitychange'))

      expect(clearInterval).toHaveBeenCalledTimes(2)
      expect(setInterval).toHaveBeenCalledTimes(2)
      expect(Storage.setItem).not.toHaveBeenCalled()

      jest.runOnlyPendingTimers()

      // update within the timer
      expect(Storage.setItem).toHaveBeenCalledTimes(1)
      expect(Storage.setItem).toHaveBeenCalledWith('lastActive', 1551916800001)

      return flushPromises()
        .then(() => {

          dateNowSpy.mockReturnValueOnce(1551916800002)

          jest.runOnlyPendingTimers()

          // update within the timer (second run)
          expect(Storage.setItem).toHaveBeenCalledTimes(2)
          expect(Storage.setItem).toHaveBeenLastCalledWith('lastActive', 1551916800002)

        })

    })

    it('checks session if certain time passed when back to foreground', () => {

      Storage.setItem('lastActive', now) // prevent initial session tracking

      dateNowSpy.mockReturnValue(now)

      global.document.testHidden = false

      Session.watchSession()

      jest.runOnlyPendingTimers()

      expect(Queue.default.push).not.toHaveBeenCalled()

      Storage.setItem('lastActive', now + Config.default.sessionWindow)

      global.document.dispatchEvent(new Event('visibilitychange'))

      expect(Queue.default.push).toHaveBeenCalledTimes(1)

    })
  })
})



