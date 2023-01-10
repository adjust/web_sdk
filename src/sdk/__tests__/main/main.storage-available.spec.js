import * as PubSub from '../../pub-sub'
import * as Queue from '../../queue'
import * as Session from '../../session'
import * as event from '../../event'
import * as sdkClick from '../../sdk-click'
import * as Config from '../../config'
import * as Identity from '../../identity'
import * as GlobalParams from '../../global-params'
import * as Logger from '../../logger'
import * as GdprForgetDevice from '../../gdpr-forget-device'
import * as Attribution from '../../attribution'
import * as Storage from '../../storage/storage'
import * as Listeners from '../../listeners'
import * as Scheduler from '../../scheduler'
import * as ActivityState from '../../activity-state'
import * as Preferences from '../../preferences'
import AdjustInstance from '../../main'
import OtherInstance from '../../main'
import Suite from './main.suite'

jest.mock('../../http')
jest.mock('../../logger')
jest.useFakeTimers()

describe('main entry point - test instance initiation when storage is available', () => {

  const suite = Suite(AdjustInstance)
  let sessionWatchSpy

  beforeAll(() => {
    jest.spyOn(event, 'default')
    jest.spyOn(sdkClick, 'default')
    jest.spyOn(Queue, 'run')
    jest.spyOn(Queue, 'setOffline')
    jest.spyOn(Queue, 'push')
    jest.spyOn(Queue, 'destroy')
    jest.spyOn(Session, 'destroy')
    jest.spyOn(GlobalParams, 'get')
    jest.spyOn(GlobalParams, 'add')
    jest.spyOn(GlobalParams, 'remove')
    jest.spyOn(GlobalParams, 'removeAll')
    jest.spyOn(Logger.default, 'error')
    jest.spyOn(Logger.default, 'log')
    jest.spyOn(Identity, 'start')
    jest.spyOn(Identity, 'destroy')
    jest.spyOn(PubSub, 'subscribe')
    jest.spyOn(PubSub, 'destroy')
    jest.spyOn(GdprForgetDevice, 'check')
    jest.spyOn(Attribution, 'check')
    jest.spyOn(Attribution, 'destroy')
    jest.spyOn(Storage.default, 'destroy')
    jest.spyOn(Listeners, 'register')
    jest.spyOn(Listeners, 'destroy')
    jest.spyOn(Scheduler, 'flush')
    jest.spyOn(ActivityState.default, 'getWebUUID')
    jest.spyOn(ActivityState.default, 'getAttribution')

    sessionWatchSpy = jest.spyOn(Session, 'watch')
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  afterAll(() => {
    jest.clearAllTimers()
    jest.restoreAllMocks()
    suite.teardown()
  })

  describe('uninitiated instance', () => {

    afterEach(() => {
      jest.clearAllMocks()
      suite.teardown()
    })

    it('logs an error and return when not all parameters provided', () => {

      AdjustInstance.initSdk()

      expect.assertions(2)

      return Utils.flushPromises()
        .then(() => {

          expect(Logger.default.error).toHaveBeenLastCalledWith('You must define appToken and environment')

          AdjustInstance.initSdk({appToken: 'a-token'})

          return Utils.flushPromises()
            .then(() => {
              expect(Logger.default.error).toHaveBeenLastCalledWith('You must define environment')
            })
        })
    })

    it('logs an error and return when trying to track event before init', async () => {
      expect.assertions(2)

      const reason = 'Adjust SDK can not track event, sdk instance is not initialized'

      await expect(AdjustInstance.trackEvent()).rejects.toBe(reason)
      expect(Logger.default.error).toHaveBeenLastCalledWith(reason)
    })

    it('moo-moo', () => {

      global.history.pushState({}, '', '?adjust_referrer=param%3Dvalue&something=else')

      expect.assertions(7)

      AdjustInstance.initSdk(suite.config)

      return Utils.flushPromises()
        .then(() => {
          expect(PubSub.subscribe).toHaveBeenCalledWith('sdk:installed', expect.any(Function))

          const trackEventPromise = AdjustInstance.trackEvent({eventToken: 'bla123'})
          expect(Logger.default.log).toHaveBeenLastCalledWith('Running track event is delayed until Adjust SDK is up')

          return Utils.flushPromises()
            .then(() => {

              let requests = Queue.push.mock.calls.map(call => call[0].url)

              expect(requests[0]).toBe('/session')
              expect(requests[1]).toBe('/sdk_click')

              PubSub.publish('sdk:installed')
              jest.runOnlyPendingTimers()

              expect(Logger.default.log).toHaveBeenLastCalledWith('Delayed track event task is running now')

              return Utils.flushPromises()
                .then(() => {
                  requests = Queue.push.mock.calls.map(call => call[0].url)
                  expect(requests[2]).toBe('/event')
                  expect(trackEventPromise).toResolve()

                  global.history.pushState({}, '', '?')
                })
            })
        })
    })

    it('runs session first and then sdk-click request', () => {

      global.history.pushState({}, '', '?adjust_referrer=param%3Dvalue&something=else')

      AdjustInstance.initSdk(suite.config)

      expect.assertions(2)

      return Utils.flushPromises()
        .then(() => {
          PubSub.publish('sdk:installed')
          jest.runOnlyPendingTimers()

          const requests = Queue.push.mock.calls.map(call => call[0].url)

          expect(requests[0]).toBe('/session')
          expect(requests[1]).toBe('/sdk_click')

          global.history.pushState({}, '', '?')
        })
    })

    it('respect the order of events tracked', () => {
      expect.assertions(9)

      AdjustInstance.initSdk(suite.config)

      return Utils.flushPromises()
        .then(() => {
          PubSub.publish('sdk:installed')
          jest.runOnlyPendingTimers()

          AdjustInstance.trackEvent({eventToken: 'bla1'})
          AdjustInstance.trackEvent({eventToken: 'bla2'})

          return Utils.flushPromises()
            .then(() => {

            AdjustInstance.trackEvent({eventToken: 'bla3'})
            AdjustInstance.trackEvent({eventToken: 'bla4'})
            AdjustInstance.trackEvent({eventToken: 'bla5'})

            return Utils.flushPromises()
          })
        })
        .then(() => {
          const requests = Queue.push.mock.calls

          expect(requests[0][0].url).toBe('/session')
          expect(requests[1][0].url).toBe('/event')
          expect(requests[1][0].params.eventToken).toBe('bla1')
          expect(requests[2][0].url).toBe('/event')
          expect(requests[2][0].params.eventToken).toBe('bla2')
          expect(requests[3][0].url).toBe('/event')
          expect(requests[3][0].params.eventToken).toBe('bla3')
          expect(requests[4][0].url).toBe('/event')
          expect(requests[4][0].params.eventToken).toBe('bla4')
        })

    })

    it('ignores attribution change event when no attribution callback provided', () => {

      const newConfig = {...suite.config, attributionCallback: null}

      AdjustInstance.initSdk(newConfig)

      suite.expectNotAttributionCallback()

      return Utils.flushPromises()
    })

    it('shuts down asynchronously', () => {

      const shutDownNumOfAssertions = suite.expectShutDown(true).assertions
      const allDownNumOfAssertions = suite.expectAllDown(true).assertions

      expect.assertions(1 + shutDownNumOfAssertions + allDownNumOfAssertions)

      AdjustInstance.initSdk(suite.config)

      return Utils.flushPromises()
        .then(() => {
          PubSub.publish('sdk:installed')
          jest.runOnlyPendingTimers()

          // for example disable has been done in another tab
          PubSub.publish('sdk:shutdown')

          jest.runOnlyPendingTimers()

          expect(Logger.default.log).toHaveBeenCalledWith('Adjust SDK has been shutdown due to asynchronous disable')

          suite.expectAllDown()
          suite.expectShutDown()
        })
    })

    it('restores after asynchronously restarted', () => {

      AdjustInstance.initSdk(suite.config)

      return Utils.flushPromises()
        .then(() => {
          PubSub.publish('sdk:installed')
          jest.runOnlyPendingTimers()

          // disable
          AdjustInstance.stop()
          jest.runOnlyPendingTimers()

          expect(Logger.default.log).toHaveBeenCalledWith('Adjust SDK disable process is now finished')

          // wait for the next session just allow to use expectAllUp_Async to simplify check
          jest.advanceTimersByTime(Config.default.sessionWindow)

          // enable asynchronously:

          // - clear disable state from prefs
          Preferences.setDisabled(null)

          // - fire visibility change event as like as SDK was moved foreground
          Utils.setDocumentProp('hidden', false)
          global.document.dispatchEvent(new Event('visibilitychange'))
          jest.runOnlyPendingTimers()

          return Utils.flushPromises()
        })
        .then(() => {
          jest.runOnlyPendingTimers()

          // check the instance re-enabled
          const a = suite.expectAllUp_Async()

          expect(Logger.default.log).toHaveBeenCalledWith('Adjust SDK has been restarted due to asynchronous enable')

          expect.assertions(a.assertions + 2) // 2 assertions are for expecting certain messages been logged

          return a.promise
        })
    })

    it('cancels sdk start due to some error happened in the chain', () => {

      const shutDownNumOfAssertions = suite.expectShutDown(true).assertions
      const allDownNumOfAssertions = suite.expectAllDown(true).assertions

      expect.assertions(1 + shutDownNumOfAssertions + allDownNumOfAssertions)

      sessionWatchSpy.mockRejectedValueOnce({error: 'An error!'})

      AdjustInstance.initSdk(suite.config)

      return Utils.flushPromises()
        .then(() => {
          expect(Logger.default.error).toHaveBeenCalledWith('Adjust SDK start has been canceled due to an error', {error: 'An error!'})
          suite.expectAllDown()
          suite.expectShutDown()
        })
    })

    describe('marketing opt-out - queue order check', () => {
      it('disables third-party sharing before init when running the sdk for the first time', () => {
        AdjustInstance.disableThirdPartySharing()
        AdjustInstance.initSdk(suite.config)

        expect.assertions(3)

        return Utils.flushPromises()
          .then(() => {
            PubSub.publish('sdk:installed')
            jest.runOnlyPendingTimers()

            const requests = Queue.push.mock.calls

            expect(requests.length).toBe(2)
            expect(requests[0][0].url).toBe('/disable_third_party_sharing')
            expect(requests[1][0].url).toBe('/session')
          })
      })

      it('disables third-party sharing before init when not running sdk for the first time', () => {
        return Storage.default.addItem('activityState', {uuid: 'bla', installed: true})
          .then(() => {
            AdjustInstance.disableThirdPartySharing()
            AdjustInstance.initSdk(suite.config)

            expect.assertions(3)

            return Utils.flushPromises()
              .then(() => {
                PubSub.publish('sdk:installed')
                jest.runOnlyPendingTimers()

                const requests = Queue.push.mock.calls

                expect(requests.length).toBe(2)
                expect(requests[0][0].url).toBe('/session')
                expect(requests[1][0].url).toBe('/disable_third_party_sharing')
              })
          })
      })

      it('disables third-party sharing asynchronously after init', () => {
        AdjustInstance.initSdk(suite.config)

        expect.assertions(3)

        return Utils.flushPromises()
          .then(() => {
            PubSub.publish('sdk:installed')
            jest.runOnlyPendingTimers()

            AdjustInstance.disableThirdPartySharing()

            const requests = Queue.push.mock.calls

            expect(requests.length).toBe(2)
            expect(requests[0][0].url).toBe('/session')
            expect(requests[1][0].url).toBe('/disable_third_party_sharing')

            return Utils.flushPromises()
          })
      })

      it('disables third-party sharing synchronously after init', () => {
        AdjustInstance.initSdk(suite.config)
        AdjustInstance.disableThirdPartySharing()
        expect.assertions(3)

        return Utils.flushPromises()
          .then(() => {
            PubSub.publish('sdk:installed')
            jest.runOnlyPendingTimers()

            const requests = Queue.push.mock.calls

            expect(requests.length).toBe(2)
            expect(requests[0][0].url).toBe('/session')
            expect(requests[1][0].url).toBe('/disable_third_party_sharing')

            return Utils.flushPromises()
          })
      })

      describe('test multiple marketing opt-out requests in a row', () => {
        it('prevents multiple opt-out requests when requesting opt-out multiple times before init', () => {
          AdjustInstance.disableThirdPartySharing()
          AdjustInstance.disableThirdPartySharing()
          AdjustInstance.initSdk(suite.config)

          expect.assertions(8)

          expect(Logger.default.log).toHaveBeenCalledTimes(3)
          expect(Logger.default.log).toHaveBeenCalledWith('Adjust SDK will run third-party sharing opt-out request after initialisation')
          expect(Logger.default.log).toHaveBeenCalledWith('Third-party sharing opt-out is now started')
          expect(Logger.default.log).toHaveBeenCalledWith('Adjust SDK already queued third-party sharing opt-out request')

          return Utils.flushPromises()
            .then(() => {
              PubSub.publish('sdk:installed')
              jest.runOnlyPendingTimers()

              const requests = Queue.push.mock.calls

              expect(Logger.default.log).toHaveBeenCalledWith('Adjust SDK is running pending third-party sharing opt-out request')
              expect(requests.length).toBe(2)
              expect(requests[0][0].url).toBe('/disable_third_party_sharing')
              expect(requests[1][0].url).toBe('/session')

              return Utils.flushPromises()
            })
        })

        it('prevents multiple opt-out requests when requesting opt-out multiple times synchronously after init', () => {
          expect.assertions(8)

          AdjustInstance.initSdk(suite.config)

          return Utils.flushPromises()
            .then(() => {

              AdjustInstance.disableThirdPartySharing()
              AdjustInstance.disableThirdPartySharing()

              const logCallsCount = Logger.default.log.mock.calls.length
              expect(Logger.default.log).toHaveBeenNthCalledWith(logCallsCount - 1, 'Running disable third-party sharing is delayed until Adjust SDK is up')
              expect(Logger.default.log).toHaveBeenNthCalledWith(logCallsCount, 'Running disable third-party sharing is delayed until Adjust SDK is up')

              return Utils.flushPromises()
                .then(() => {
                  PubSub.publish('sdk:installed')
                  jest.runOnlyPendingTimers()

                  const requests = Queue.push.mock.calls

                  expect(Logger.default.log).toHaveBeenCalledWith('Delayed disable third-party sharing task is running now')
                  expect(Logger.default.log).toHaveBeenCalledWith('Third-party sharing opt-out is now started')
                  expect(Logger.default.log).toHaveBeenCalledWith('Adjust SDK already queued third-party sharing opt-out request')
                  expect(requests.length).toBe(2)
                  expect(requests[0][0].url).toBe('/session')
                  expect(requests[1][0].url).toBe('/disable_third_party_sharing')

                  return Utils.flushPromises()
                })
            })
        })

        it('prevents multiple opt-out requests when requesting opt-out multiple times synchronously before and after init', () => {
          AdjustInstance.disableThirdPartySharing()
          AdjustInstance.initSdk(suite.config)

          return Utils.flushPromises()
            .then(() => {

              AdjustInstance.disableThirdPartySharing()

              expect.assertions(9)

              expect(Logger.default.log).toHaveBeenCalledWith('Adjust SDK will run third-party sharing opt-out request after initialisation')
              expect(Logger.default.log).toHaveBeenCalledWith('Third-party sharing opt-out is now started')
              expect(Logger.default.log).toHaveBeenCalledWith('Running disable third-party sharing is delayed until Adjust SDK is up')

              return Utils.flushPromises()
                .then(() => {
                  PubSub.publish('sdk:installed')
                  jest.runOnlyPendingTimers()

                  const requests = Queue.push.mock.calls

                  expect(Logger.default.log).toHaveBeenCalledWith('Adjust SDK is running pending third-party sharing opt-out request')
                  expect(Logger.default.log).toHaveBeenCalledWith('Delayed disable third-party sharing task is running now')
                  expect(Logger.default.log).toHaveBeenCalledWith('Adjust SDK already queued third-party sharing opt-out request')
                  expect(requests.length).toBe(2)
                  expect(requests[0][0].url).toBe('/disable_third_party_sharing')
                  expect(requests[1][0].url).toBe('/session')

                  return Utils.flushPromises()
                })
            })
        })

        it('prevents multiple opt-out requests when requesting opt-out multiple times asynchronously before and after init', () => {
          AdjustInstance.disableThirdPartySharing()
          AdjustInstance.initSdk(suite.config)

          expect.assertions(7)

          expect(Logger.default.log).toHaveBeenCalledWith('Adjust SDK will run third-party sharing opt-out request after initialisation')
          expect(Logger.default.log).toHaveBeenCalledWith('Third-party sharing opt-out is now started')

          return Utils.flushPromises()
            .then(() => {
              PubSub.publish('sdk:installed')
              jest.runOnlyPendingTimers()

              AdjustInstance.disableThirdPartySharing()

              const requests = Queue.push.mock.calls

              expect(Logger.default.log).toHaveBeenCalledWith('Adjust SDK is running pending third-party sharing opt-out request')
              expect(Logger.default.log).toHaveBeenCalledWith('Adjust SDK already queued third-party sharing opt-out request')
              expect(requests.length).toBe(2)
              expect(requests[0][0].url).toBe('/disable_third_party_sharing')
              expect(requests[1][0].url).toBe('/session')

              return Utils.flushPromises()
            })
        })

        it('prevents multiple opt-out requests when requesting opt-out multiple times synchronously and then asynchronously after init', () => {
          AdjustInstance.initSdk(suite.config)

          return Utils.flushPromises()
            .then(() => {
              expect.assertions(7)

              AdjustInstance.disableThirdPartySharing()

              expect(Logger.default.log).toHaveBeenLastCalledWith('Running disable third-party sharing is delayed until Adjust SDK is up')

              return Utils.flushPromises()
                .then(() => {
                  PubSub.publish('sdk:installed')
                  jest.runOnlyPendingTimers()

                  AdjustInstance.disableThirdPartySharing()

                  const requests = Queue.push.mock.calls

                  expect(Logger.default.log).toHaveBeenCalledWith('Delayed disable third-party sharing task is running now')
                  expect(Logger.default.log).toHaveBeenCalledWith('Third-party sharing opt-out is now started')
                  expect(Logger.default.log).toHaveBeenCalledWith('Adjust SDK already queued third-party sharing opt-out request')
                  expect(requests.length).toBe(2)
                  expect(requests[0][0].url).toBe('/session')
                  expect(requests[1][0].url).toBe('/disable_third_party_sharing')

                  return Utils.flushPromises()
                })
            })
        })

        it('prevents multiple opt-out requests when requesting opt-out multiple times asynchronously after init', () => {
          AdjustInstance.initSdk(suite.config)

          expect.assertions(5)

          return Utils.flushPromises()
            .then(() => {

              return Utils.flushPromises()
                .then(() => {
                  PubSub.publish('sdk:installed')
                  jest.runOnlyPendingTimers()

                  AdjustInstance.disableThirdPartySharing()
                  AdjustInstance.disableThirdPartySharing()

                  const requests = Queue.push.mock.calls

                  expect(Logger.default.log).toHaveBeenCalledWith('Third-party sharing opt-out is now started')
                  expect(Logger.default.log).toHaveBeenCalledWith('Adjust SDK already queued third-party sharing opt-out request')
                  expect(requests.length).toBe(2)
                  expect(requests[0][0].url).toBe('/session')
                  expect(requests[1][0].url).toBe('/disable_third_party_sharing')

                  return Utils.flushPromises()
                })
            })
        })
      })
    })
  })

  describe('initiated instance', () => {
    beforeAll(() => {
      suite.teardown()
      AdjustInstance.initSdk(suite.config)
      return Utils.flushPromises()
    })

    it('sets basic configuration', () => {

      const a = suite.expectStart_Async()

      return a.promise.then(() => {
        expect.assertions(a.assertions)
      })
    })

    it('calls client-defined attribution callback when attribution is changed', () => {
      return suite.expectAttributionCallback()
    })

    it('tests if single instance is returned', () => {

      OtherInstance.initSdk({
        appToken: 'some-other-app-token',
        environment: 'sandbox'
      })

      const baseParams = Config.default.getBaseParams()

      expect(Logger.default.error).toHaveBeenCalledWith('You already initiated your instance')
      expect(AdjustInstance).toBe(OtherInstance)
      expect(baseParams.appToken).toBe('some-app-token')
      expect(baseParams.environment).toBe('production')
    })

    it('runs all static methods', () => {
      suite.expectRunningStatic()
    })

    it('runs track event', async () => {
      expect.assertions(2)

      PubSub.publish('sdk:installed')
      jest.runOnlyPendingTimers()

      await expect(AdjustInstance.trackEvent({ eventToken: 'blabla' })).toResolve()

      expect(event.default).toHaveBeenCalledWith({ eventToken: 'blabla' }, undefined)
    })
  })
})
