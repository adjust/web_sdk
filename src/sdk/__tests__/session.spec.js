import * as Config from '../config'
import * as Listeners from '../listeners'
import * as Session from '../session'
import * as Storage from '../storage/storage'
import * as Queue from '../queue'
import * as Identity from '../identity'
import * as ActivityState from '../activity-state'
import * as GlobalParams from '../global-params'
import * as Logger from '../logger'
import * as http from '../http'
import * as Time from '../time'
import * as PubSub from '../pub-sub'
import {MINUTE, SECOND} from '../constants'

jest.mock('../logger')
jest.mock('../http')
jest.mock('../url-strategy')
jest.useFakeTimers()

function goToForeground () {
  Utils.setDocumentProp('hidden', false)
  global.document.dispatchEvent(new Event('visibilitychange'))
  jest.runOnlyPendingTimers()
}

function goToBackground () {
  Utils.setDocumentProp('hidden', true)
  global.document.dispatchEvent(new Event('visibilitychange'))
  jest.runOnlyPendingTimers()
}

describe('test session functionality', () => {

  let pvaSpy
  const _reset = () => {
    Session.destroy()
    Identity.destroy()
    localStorage.clear()
    ActivityState.default.current = {eventCount: 0, sessionCount: 0}
  }

  beforeAll(() => {
    jest.spyOn(http, 'default')
    jest.spyOn(Listeners, 'on')
    jest.spyOn(Listeners, 'off')
    jest.spyOn(Identity, 'persist')
    jest.spyOn(Identity, 'sync').mockImplementation(() => Promise.resolve({}))
    jest.spyOn(Queue, 'push')
    jest.spyOn(Queue, 'run').mockImplementation(() => {})
    jest.spyOn(Logger.default, 'error')
    jest.spyOn(Logger.default, 'log')
    jest.spyOn(Time, 'getTimestamp').mockReturnValue('some-time')
    jest.spyOn(PubSub, 'publish')
    jest.spyOn(PubSub, 'subscribe')
    jest.spyOn(ActivityState.default, 'updateInstalled')
    jest.spyOn(ActivityState.default, 'updateSessionLength')
    jest.spyOn(global, 'clearTimeout')
    jest.spyOn(global, 'setInterval')
    jest.spyOn(global, 'clearInterval')

    pvaSpy = jest.spyOn(Listeners, 'getVisibilityApiAccess')
  })

  beforeEach(() => {
    return Storage.default.addItem('activityState', {uuid: '123'}).then(Identity.start)
  })

  afterEach(() => {
    _reset()
    jest.clearAllMocks()
  })

  afterAll(() => {
    jest.restoreAllMocks()
    jest.clearAllTimers()
  })

  function expectStarted () {
    expect(PubSub.subscribe).toHaveBeenCalledWith('session:finished', expect.any(Function))
    expect(Listeners.on).toHaveBeenCalled()
    expect(Session.isRunning()).toBeTruthy()

    PubSub.subscribe.mockClear()
    Listeners.on.mockClear()

    return Utils.flushPromises()
  }

  function expectNotStartedAgainButRunning () {
    expect(PubSub.subscribe).not.toHaveBeenCalled()
    expect(Listeners.on).not.toHaveBeenCalled()
    expect(Session.isRunning()).toBeTruthy()
  }

  function expectDestroyed () {
    expect(Listeners.off).toHaveBeenCalled()
    expect(clearTimeout).toHaveBeenCalled()
    expect(Session.isRunning()).toBeFalsy()

    Listeners.off.mockClear()
    clearTimeout.mockClear()
  }

  describe('general functionality', () => {

    let dateNowSpy

    beforeAll(() => {
      dateNowSpy = jest.spyOn(Date, 'now')
    })

    afterAll(() => {
      dateNowSpy.mockRestore()
    })

    it('starts the session watch and rejects if calling watch multiple times', () => {

      expect.assertions(7)

      Session.watch() // 1st attempt

      return expectStarted() // +3
        .then(() => Session.watch()) // 2nd attempt
        .catch(error => {

          expectNotStartedAgainButRunning() // +3

          expect(error).toEqual({
            interrupted: true,
            message: 'Session watch already initiated'
          })
        })
    })

    it('subscribes on session:finished event and on visibility change event when Page Visibility Api is available', () => {

      // by default Page Visibility is available

      Session.watch()

      expectStarted()

      Session.destroy()

      expectDestroyed()

      // clear mock after _restoreAfterAsyncEnable was subscribed to visibilityChange event in session.destroy function
      Listeners.on.mockClear()

      // when Page Visibility Api is not available
      pvaSpy.mockReturnValueOnce(null)

      Session.watch()

      expect(PubSub.subscribe).toHaveBeenCalledWith('session:finished', expect.any(Function))
      expect(Listeners.on).not.toHaveBeenCalled()
      expect(Session.isRunning()).toBeTruthy()

      Session.destroy()

      expect(Listeners.off).not.toHaveBeenCalled()
      expect(clearTimeout).not.toHaveBeenCalled()
      expect(Session.isRunning()).toBeFalsy()
    })

    it('destroys session watch', () => {

      Session.watch()

      expectStarted()

      Session.destroy()

      expectDestroyed()

      Session.watch()

      return expectStarted()
    })

    it('updates installed flag when session:finished event is recognized with successful session request', () => {

      Session.watch()

      expect.assertions(6)

      expect(ActivityState.default.current.installed).toBeUndefined()

      return Storage.default.getFirst('activityState')
        .then(activityState => {
          expect(activityState.installed).toBeUndefined()

          PubSub.publish('session:finished', {adid: 'bla'})

          jest.runOnlyPendingTimers()

          expect(ActivityState.default.updateInstalled).toHaveBeenCalled()
          expect(ActivityState.default.current.installed).toBeTruthy()
          expect(activityState.installed).toBeUndefined()

          return Storage.default.getFirst('activityState')
        })
        .then(activityState => {
          expect(activityState.installed).toBeTruthy()

          return Utils.flushPromises()
        })
    })

    it('ignores update of installed flag when session:finished event is recognized with unsuccessful session request', () => {

      Session.watch()

      expect.assertions(7)

      expect(ActivityState.default.current.installed).toBeUndefined()

      return Storage.default.getFirst('activityState')
        .then(activityState => {
          expect(activityState.installed).toBeUndefined()

          PubSub.publish('session:finished', Utils.errorResponse('SERVER_INTERNAL_ERROR'))

          jest.runOnlyPendingTimers()

          expect(ActivityState.default.updateInstalled).not.toHaveBeenCalled()
          expect(ActivityState.default.current.installed).toBeUndefined()
          expect(activityState.installed).toBeUndefined()
          expect(Logger.default.error).toHaveBeenCalledWith('Session was not successful, error was returned from the server:', 'An error')

          return Storage.default.getFirst('activityState')
        })
        .then(activityState => {
          expect(activityState.installed).toBeUndefined()

          return Utils.flushPromises()
        })
    })

    it('updates last active timestamp every n seconds', () => {

      let currentTime = Date.now()
      let currentLastActive
      let activityState

      Session.watch()

      dateNowSpy.mockReturnValue(currentTime)

      activityState = ActivityState.default.current

      expect.assertions(40)
      expect(setInterval).toHaveBeenCalledTimes(1)
      expect(activityState.timeSpent).toBe(0)
      expect(activityState.sessionLength).toBe(0)
      expect(activityState.lastInterval).toEqual(-1)

      return Utils.flushPromises()
        .then(() => {
          Queue.push.mockClear() // clear mock happened when watch started
          Identity.persist.mockClear()

          dateNowSpy.mockReturnValue(currentTime += MINUTE)
          jest.advanceTimersByTime(MINUTE)

          return Utils.flushPromises()
        })
        .then(() => Storage.default.getFirst('activityState'))
        .then(record => {

          activityState = ActivityState.default.current

          expect(Identity.persist).toHaveBeenCalledTimes(1)
          expect(record.lastActive).toEqual(currentTime)
          expect(activityState.lastActive).toEqual(currentTime)
          expect(record.timeSpent).toBe(60)
          expect(activityState.timeSpent).toBe(60)
          expect(record.sessionLength).toBe(60)
          expect(activityState.sessionLength).toBe(60)
          expect(record.lastInterval).toBe(60)
          expect(activityState.lastInterval).toBe(60)


          dateNowSpy.mockReturnValue(currentTime += MINUTE)
          jest.advanceTimersByTime(MINUTE)

          return Utils.flushPromises()
        })
        .then(() => Storage.default.getFirst('activityState'))
        .then(record => {

          activityState = ActivityState.default.current

          expect(Identity.persist).toHaveBeenCalledTimes(2)
          expect(record.lastActive).toEqual(currentTime)
          expect(activityState.lastActive).toEqual(currentTime)
          expect(record.timeSpent).toBe(120)
          expect(activityState.timeSpent).toBe(120)
          expect(record.sessionLength).toBe(120)
          expect(activityState.sessionLength).toBe(120)
          expect(record.lastInterval).toBe(60)
          expect(activityState.lastInterval).toBe(60)

          dateNowSpy.mockReturnValue(currentTime += MINUTE)
          jest.advanceTimersByTime(MINUTE)

          return Utils.flushPromises()
        })
        .then(() => Storage.default.getFirst('activityState'))
        .then(record => {

          activityState = ActivityState.default.current

          expect(Identity.persist).toHaveBeenCalledTimes(3)
          expect(record.lastActive).toEqual(currentTime)
          expect(activityState.lastActive).toEqual(currentTime)
          expect(record.timeSpent).toBe(180)
          expect(activityState.timeSpent).toBe(180)
          expect(record.sessionLength).toBe(180)
          expect(activityState.sessionLength).toBe(180)
          expect(record.lastInterval).toBe(60)
          expect(activityState.lastInterval).toBe(60)

          currentLastActive = currentTime

          Session.destroy()

          dateNowSpy.mockReturnValue(currentTime += MINUTE)
          jest.advanceTimersByTime(MINUTE)

          return Utils.flushPromises()
        })
        .then(() => Storage.default.getFirst('activityState'))
        .then(record => {

          activityState = ActivityState.default.current

          expect(Identity.persist).toHaveBeenCalledTimes(3)
          expect(record.lastActive).toEqual(currentLastActive)
          expect(activityState.lastActive).toEqual(currentLastActive)
          expect(record.timeSpent).toBe(180)
          expect(activityState.timeSpent).toBe(180)
          expect(record.sessionLength).toBe(180)
          expect(activityState.sessionLength).toBe(180)
          expect(record.lastInterval).toBe(60)
          expect(activityState.lastInterval).toBe(60)

          return Utils.flushPromises()
        })
    })

    it('send install on initial run', () => {

      _reset()

      expect.assertions(5)

      return Identity.start()
        .then(() => {

          Session.watch()

          expect(Listeners.on).toHaveBeenCalled()

          return Utils.flushPromises()
        })
        .then(() => {
          PubSub.publish('session:finished', {adid: 'bla'})

          expect(Queue.push).toHaveBeenCalledWith({
            url: '/session',
            method: 'POST',
            params: {
              callbackParams: null,
              partnerParams: null
            }
          }, {auto: true})

          jest.runOnlyPendingTimers()

          expect(http.default).toHaveBeenCalledWith({
            endpoint: 'app',
            url: '/session',
            method: 'POST',
            params: {
              attempts: 1,
              createdAt: 'some-time',
              lastInterval: 0,
              timeSpent: 0,
              sessionLength: 0,
              sessionCount: 1
            }
          })
          expect(ActivityState.default.current.installed).toBeTruthy()

          return Utils.flushPromises()
        })
        .then(() => {
          expect(ActivityState.default.current.lastActive).toBeDefined()
        })

    })

    it('send install on initial run and append global params', () => {

      let currentTime = Date.now()

      dateNowSpy.mockReturnValue(currentTime)

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
        .then(() => Identity.start())
        .then(() => {

          Session.watch()

          expect(Listeners.on).toHaveBeenCalled()

          dateNowSpy.mockReturnValue(currentTime += 60 * SECOND)
          jest.advanceTimersByTime(60 * SECOND)

          return Utils.flushPromises()
        })
        .then(() => {

          expect(Queue.push).toHaveBeenCalledWith({
            url: '/session',
            method: 'POST',
            params: {
              callbackParams: {key1: 'value1', key2: 'value2'},
              partnerParams: {some: 'thing', very: 'nice'}
            }
          }, {auto: true})

          jest.advanceTimersByTime(150)

          expect(http.default).toHaveBeenCalledWith({
            endpoint: 'app',
            url: '/session',
            method: 'POST',
            params: {
              attempts: 1,
              createdAt: 'some-time',
              lastInterval: 60,
              timeSpent: 60,
              sessionLength: 60,
              sessionCount: 1,
              callbackParams: {key1: 'value1', key2: 'value2'},
              partnerParams: {some: 'thing', very: 'nice'}
            }
          })

          return Utils.flushPromises()
        })
        .then(() => {
          expect(ActivityState.default.current.lastActive).toBeDefined()
        })

    })

    it('skips initial install track if already tracked', () => {

      let currentTime = Date.now()

      dateNowSpy.mockReturnValue(currentTime)

      expect.assertions(6)

      ActivityState.default.current = {...ActivityState.default.current, sessionCount: 1}

      return Identity.persist()
        .then(() => {
          Session.watch()

          expect(Listeners.on).toHaveBeenCalled()
          expect(ActivityState.default.current.lastActive).toBe(currentTime)

          return Utils.flushPromises()
        })
        .then(() => {

          expect(Queue.push).not.toHaveBeenCalled()

          dateNowSpy.mockReturnValue(currentTime += MINUTE)
          jest.advanceTimersByTime(MINUTE)

          return Utils.flushPromises()
        })
        .then(() => {
          const activityState = ActivityState.default.current

          expect(activityState.lastActive).toBe(currentTime)
          expect(activityState.timeSpent).toBe(60)
          expect(activityState.sessionLength).toBe(60)
        })

    })

    it('checks attribution if session already tracked', () => {

      let currentTime = Date.now()

      dateNowSpy.mockReturnValue(currentTime)

      expect.assertions(2)

      ActivityState.default.current = {...ActivityState.default.current, sessionCount: 1}

      return Identity.persist()
        .then(() => {
          ActivityState.default.current = {...ActivityState.default.current, attribution: null}

          Session.watch()

          return Utils.flushPromises()
        })
        .then(() => {
          expect(Queue.push).not.toHaveBeenCalled()
          expect(PubSub.publish).toHaveBeenCalledWith('attribution:check')
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

      ActivityState.default.current = {...ActivityState.default.current, attribution: null}

      Session.watch()

      dateNowSpy.mockReturnValue(currentTime)

      activityState = ActivityState.default.current

      expect.assertions(76)
      expect(setInterval).toHaveBeenCalledTimes(1) // from initial _checkSession call
      expect(clearInterval).toHaveBeenCalledTimes(1)
      expect(activityState.timeSpent).toBe(0)
      expect(activityState.sessionLength).toBe(0)
      expect(activityState.lastInterval).toEqual(-1)

      PubSub.publish('session:finished', {adid: 'bla'})
      jest.runOnlyPendingTimers()

      return Utils.flushPromises()
        .then(() => {
          Queue.push.mockClear() // clear mock happened when watch started
          Identity.persist.mockClear()

          dateNowSpy.mockReturnValue(currentTime += 2 * MINUTE)
          jest.advanceTimersByTime(2 * MINUTE)

          return Utils.flushPromises()
        })
        .then(() => Storage.default.getFirst('activityState'))
        .then(record => {

          activityState = ActivityState.default.current

          // update within the timer (2 loops)
          expect(Identity.persist).toHaveBeenCalledTimes(2)
          expect(record.lastActive).toEqual(currentTime)
          expect(activityState.lastActive).toEqual(currentTime)
          expect(record.timeSpent).toBe(120) // 2m
          expect(activityState.timeSpent).toBe(120)
          expect(record.sessionLength).toBe(120) // 2m
          expect(activityState.sessionLength).toBe(120)

          currentLastActive = currentTime

          goToBackground()

          expect(clearInterval).toHaveBeenCalledTimes(2)

          return Utils.flushPromises()
        })
        .then(() => Storage.default.getFirst('activityState'))
        .then(record => {

          activityState = ActivityState.default.current

          expect(Identity.persist).toHaveBeenCalledTimes(3)
          expect(record.lastActive).toEqual(currentLastActive)
          expect(activityState.lastActive).toEqual(currentLastActive)
          expect(record.timeSpent).toBe(120)
          expect(activityState.timeSpent).toBe(120)
          expect(record.sessionLength).toBe(120)
          expect(activityState.sessionLength).toBe(120)

          dateNowSpy.mockReturnValue(currentTime += 5 * MINUTE)
          jest.advanceTimersByTime(5 * MINUTE)

          return Utils.flushPromises()
        })
        .then(() => Storage.default.getFirst('activityState'))
        .then(record => {

          activityState = ActivityState.default.current

          // nothing changed because we're in background
          expect(Identity.persist).toHaveBeenCalledTimes(3)
          expect(record.lastActive).toEqual(currentLastActive)
          expect(activityState.lastActive).toEqual(currentLastActive)
          expect(record.timeSpent).toBe(120)
          expect(activityState.timeSpent).toBe(120)
          expect(record.sessionLength).toBe(120)
          expect(activityState.sessionLength).toBe(120)

          dateNowSpy.mockReturnValue(currentTime += 10 * MINUTE)
          jest.advanceTimersByTime(10 * MINUTE)

          return Utils.flushPromises()
        })
        .then(() => Storage.default.getFirst('activityState'))
        .then(record => {

          activityState = ActivityState.default.current

          // again nothing changed because we're still in background
          expect(Identity.persist).toHaveBeenCalledTimes(3)
          expect(record.lastActive).toEqual(currentLastActive)
          expect(activityState.lastActive).toEqual(currentLastActive)
          expect(record.timeSpent).toBe(120)
          expect(activityState.timeSpent).toBe(120)
          expect(record.sessionLength).toBe(120)
          expect(activityState.sessionLength).toBe(120)

          dateNowSpy.mockReturnValue(currentTime += 14 * MINUTE)
          jest.advanceTimersByTime(14 * MINUTE)

          goToForeground() // after 5 + 10 + 14 = 29m

          return Utils.flushPromises()
        })
        .then(() => {
          expect(Identity.sync).toHaveBeenCalledTimes(1)
          expect(ActivityState.default.updateSessionLength).toHaveBeenCalledTimes(1)

          expect(ActivityState.default.current.lastInterval).toBe(1740) // 29m

          expect(setInterval).toHaveBeenCalledTimes(2)
          expect(clearInterval).toHaveBeenCalledTimes(3)

          // no session window reached, so request was not sent
          expect(Queue.push).not.toHaveBeenCalled()
          expect(PubSub.publish).toHaveBeenCalledWith('attribution:check')

          PubSub.publish.mockClear()

          dateNowSpy.mockReturnValue(currentTime += 4 * MINUTE)
          jest.advanceTimersByTime(4 * MINUTE)

          activityState = ActivityState.default.current

          // update within the timer (4 loops)
          expect(Identity.persist).toHaveBeenCalledTimes(8) // 3 + 4 loops + 1 * session check
          expect(activityState.timeSpent).toBe(360) // 2m + 4m
          expect(activityState.sessionLength).toBe(2100) // 2m + (5m + 10m + 14m) + 4m

          return Utils.flushPromises()
        })
        .then(() => Storage.default.getFirst('activityState'))
        .then(record => {

          expect(record.lastActive).toEqual(currentTime)
          expect(ActivityState.default.current.lastActive).toEqual(currentTime)

          dateNowSpy.mockReturnValue(currentTime += 6 * MINUTE)
          jest.advanceTimersByTime(6 * MINUTE)

          activityState = ActivityState.default.current

          // update within the timer (6 loops)
          expect(Identity.persist).toHaveBeenCalledTimes(14) // 3 + 4 + 1 * session check + 6 loops
          expect(activityState.timeSpent).toBe(720) // 2m + 4m + 6m
          expect(activityState.sessionLength).toBe(2460) // 2m + (5m + 10m + 14m) + 4m + 6m

          return Utils.flushPromises()
        })
        .then(() => Storage.default.getFirst('activityState'))
        .then(record => {

          expect(record.lastActive).toEqual(currentTime)
          expect(ActivityState.default.current.lastActive).toEqual(currentTime)

          goToBackground()

          expect(clearInterval).toHaveBeenCalledTimes(4)

          dateNowSpy.mockReturnValue(currentTime += 31 * MINUTE)
          jest.advanceTimersByTime(31 * MINUTE)

          ActivityState.default.current = {...ActivityState.default.current, attribution: {adid: 'bla'}}

          return Utils.flushPromises()
        })
        .then(() => {
          activityState = ActivityState.default.current

          expect(Identity.persist).toHaveBeenCalledTimes(15)
          expect(activityState.timeSpent).toBe(720) // 2m + 4m + 6m
          expect(activityState.sessionLength).toBe(2460) // 2m + (5m + 10m + 14m) + 4m + 6m

          goToForeground() // immediately resolves Identity.sync promise
          expect(Identity.sync).toHaveBeenCalledTimes(2) // it's a second time when going foreground

          return Promise.resolve() // resolving second promise from chain (corresponds to Identity.sync().then())
            .then(() => {
              expect(ActivityState.default.updateSessionLength).toHaveBeenCalledTimes(2)
              expect(ActivityState.default.current.lastActive).toEqual(currentTime)
              expect(ActivityState.default.current.timeSpent).toBe(720) // 2m + 4m + 6m
              expect(ActivityState.default.current.sessionLength).toBe(2460) // 2m + (5m + 10m + 14m) + 4m + 6m
              expect(ActivityState.default.current.lastInterval).toBe(1860) // 31m
            })
            .then(Utils.flushPromises) // resolving pending promises
        })
        .then(() => Storage.default.getFirst('activityState'))
        .then(record => {

          activityState = ActivityState.default.current

          expect(Identity.persist).toHaveBeenCalledTimes(16)
          expect(setInterval).toHaveBeenCalledTimes(3)
          expect(clearInterval).toHaveBeenCalledTimes(5)
          expect(record.lastActive).toEqual(currentTime)
          expect(activityState.lastActive).toEqual(currentTime)
          expect(record.timeSpent).toBe(0)
          expect(activityState.timeSpent).toBe(0)
          expect(record.sessionLength).toBe(0)
          expect(activityState.sessionLength).toBe(0)

          // session window reached, so request was sent
          expect(Queue.push).toHaveBeenCalledWith({
            url: '/session',
            method: 'POST',
            params: {
              callbackParams: null,
              partnerParams: null
            }
          }, {auto: true})
          expect(PubSub.publish).not.toHaveBeenCalled()

          jest.runOnlyPendingTimers()

          expect(http.default).toHaveBeenCalledWith({
            endpoint: 'app',
            url: '/session',
            method: 'POST',
            params: {
              attempts: 1,
              createdAt: 'some-time',
              sessionCount: 2,
              timeSpent: 720,
              sessionLength: 2460,
              lastInterval: 1860 // 31 minutes
            }
          })

          dateNowSpy.mockReturnValue(currentTime += 10 * MINUTE)
          jest.advanceTimersByTime(10 * MINUTE)

          activityState = ActivityState.default.current

          expect(Identity.persist).toHaveBeenCalledTimes(27)
          expect(activityState.timeSpent).toBe(600) // 10m
          expect(activityState.sessionLength).toBe(600) // 10m

          return Utils.flushPromises()
        })
    })

    it('checks session if session window reached when back to foreground', () => {

      let currentTime = Date.now()

      dateNowSpy.mockReturnValue(currentTime)

      expect.assertions(4)

      ActivityState.default.current = {...ActivityState.default.current, sessionCount: 1}

      return Identity.persist()
        .then(() => {

          Session.watch()

          dateNowSpy.mockReturnValue(currentTime += 2 * MINUTE)
          jest.advanceTimersByTime(2 * MINUTE)

          goToBackground()

          return Utils.flushPromises()
        })
        .then(() => {

          dateNowSpy.mockReturnValue(currentTime += Config.default.sessionWindow)

          expect(Queue.push).not.toHaveBeenCalled()

          goToForeground()

          return Utils.flushPromises()
        })
        .then(() => {
          expect(Queue.push).toHaveBeenCalledTimes(1)
          expect(Queue.push).toHaveBeenCalledWith({
            url: '/session',
            method: 'POST',
            params: {
              callbackParams: null,
              partnerParams: null
            }
          }, {auto: true})

          jest.runOnlyPendingTimers()

          expect(http.default).toHaveBeenCalledWith({
            endpoint: 'app',
            url: '/session',
            method: 'POST',
            params: {
              attempts: 1,
              createdAt: 'some-time',
              sessionCount: 2, // +1 simulated initial session
              timeSpent: 120,
              sessionLength: 120,
              lastInterval: 1800 // 30 minutes
            }
          })

          return Utils.flushPromises()
        })
    })

    it('does not check session if session window was not reached when back to foreground', () => {

      let currentTime = Date.now()

      dateNowSpy.mockReturnValue(currentTime)

      expect.assertions(2)

      ActivityState.default.current = {...ActivityState.default.current, sessionCount: 1}

      return Identity.persist()
        .then(() => {

          Session.watch()

          dateNowSpy.mockReturnValue(currentTime += 2 * MINUTE)
          jest.advanceTimersByTime(2 * MINUTE)

          goToBackground()

          return Utils.flushPromises()
        })
        .then(() => {

          dateNowSpy.mockReturnValue(currentTime += Config.default.sessionWindow - SECOND)

          expect(Queue.push).not.toHaveBeenCalled()

          goToForeground()

          return Utils.flushPromises()
        })
        .then(() => {
          expect(Queue.push).not.toHaveBeenCalled()
        })
    })

    it('checks for new session when window reached after session watch restart', () => {

      let currentTime = Date.now()

      dateNowSpy.mockReturnValue(currentTime)

      expect.assertions(4)

      ActivityState.default.current = {...ActivityState.default.current, sessionCount: 1}

      return Identity.persist()
        .then(() => {

          Session.watch()

          dateNowSpy.mockReturnValue(currentTime += 40 * SECOND)
          jest.advanceTimersByTime(40 * SECOND)

          goToBackground()
          Session.destroy()

          return Utils.flushPromises()
        })
        .then(() => {

          dateNowSpy.mockReturnValue(currentTime += Config.default.sessionWindow + 5 * MINUTE) // + 35 minutes
          jest.advanceTimersByTime(Config.default.sessionWindow + 5 * MINUTE)

          goToForeground()

          Session.watch()

          expect(Queue.push).not.toHaveBeenCalled()

          return Utils.flushPromises()
        })
        .then(() => {
          expect(Queue.push).toHaveBeenCalledTimes(1)
          expect(Queue.push).toHaveBeenCalledWith({
            url: '/session',
            method: 'POST',
            params: {
              callbackParams: null,
              partnerParams: null
            }
          }, {auto: true})

          jest.runOnlyPendingTimers()

          expect(http.default).toHaveBeenCalledWith({
            endpoint: 'app',
            url: '/session',
            method: 'POST',
            params: {
              attempts: 1,
              createdAt: 'some-time',
              sessionCount: 2, // +1 simulated initial session
              timeSpent: 40,
              sessionLength: 40,
              lastInterval: 2100 // 35 minutes
            }
          })

          return Utils.flushPromises()
        })
    })

    it('prevents check for new session when window reached after session watch restart when still in background', () => {

      let currentTime = Date.now()

      dateNowSpy.mockReturnValue(currentTime)

      expect.assertions(3)

      ActivityState.default.current = {...ActivityState.default.current, sessionCount: 1}

      return Identity.persist()
        .then(() => {

          Session.watch()

          dateNowSpy.mockReturnValue(currentTime += 40 * SECOND)
          jest.advanceTimersByTime(40 * SECOND)

          goToBackground()
          Session.destroy()

          return Utils.flushPromises()
        })
        .then(() => {

          dateNowSpy.mockReturnValue(currentTime += Config.default.sessionWindow + 5 * MINUTE) // + 35 minutes
          jest.advanceTimersByTime(Config.default.sessionWindow + 5 * MINUTE)

          return Session.watch()
        })
        .then(() => {
          expect(Logger.default.log).toHaveBeenCalledWith('Session request attempt canceled because the tab is still hidden')

          expect(Queue.push).not.toHaveBeenCalled()

          jest.runOnlyPendingTimers()

          expect(http.default).not.toHaveBeenCalled()
        })
    })
  })
})



