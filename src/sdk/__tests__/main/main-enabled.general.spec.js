import * as PubSub from '../../pub-sub'
import * as Queue from '../../queue'
import * as Session from '../../session'
import * as event from '../../event'
import * as sdkClick from '../../sdk-click'
import * as Identity from '../../identity'
import * as GlobalParams from '../../global-params'
import * as Logger from '../../logger'
import * as StorageManager from '../../storage/storage-manager'
import * as Attribution from '../../attribution'
import * as State from '../../state'
import * as GdprForgetDevice from '../../gdpr-forget-device'
import AdjustInstance from '../../main.js'
import Suite from './main.suite'

jest.mock('../../request')
jest.mock('../../logger')
jest.useFakeTimers()

describe('main entry point - test enable/disable when in initially enabled state', () => {

  const suite = Suite(AdjustInstance)

  beforeAll(() => {
    const now = Date.now()
    jest.spyOn(Date, 'now').mockImplementation(() => now + Utils.randomInRange(1000, 9999))
    jest.spyOn(event, 'default')
    jest.spyOn(sdkClick, 'default')
    jest.spyOn(Queue, 'run')
    jest.spyOn(Queue, 'setOffline')
    jest.spyOn(Queue, 'destroy')
    jest.spyOn(Session, 'watch')
    jest.spyOn(Session, 'destroy')
    jest.spyOn(GlobalParams, 'get')
    jest.spyOn(GlobalParams, 'add')
    jest.spyOn(GlobalParams, 'remove')
    jest.spyOn(GlobalParams, 'removeAll')
    jest.spyOn(Logger.default, 'error')
    jest.spyOn(Logger.default, 'log')
    jest.spyOn(Identity, 'start')
    jest.spyOn(Identity, 'disable')
    jest.spyOn(Identity, 'enable')
    jest.spyOn(Identity, 'destroy')
    jest.spyOn(PubSub, 'subscribe')
    jest.spyOn(PubSub, 'destroy')
    jest.spyOn(Attribution, 'check')
    jest.spyOn(Attribution, 'destroy')
    jest.spyOn(StorageManager.default, 'destroy')
    jest.spyOn(GdprForgetDevice, 'check')
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  afterAll(() => {
    jest.clearAllTimers()
    jest.restoreAllMocks()
    State.default.disabled = null
  })


  describe('sdk: init -> disable -> enable', () => {
    afterAll(() => {
      suite.teardown()
    })

    it('initiates and runs all static methods and track event', () => {

      AdjustInstance.init(suite.config)

      const a1 = suite.expectRunningStatic()
      const a2 = suite.expectRunningTrackEvent()
      const a3 = suite.expectStart()

      expect.assertions(a1.assertions + a2.assertions + a3.assertions)

      return a3.promise
    })

    it('disables sdk with shutdown', () => {

      AdjustInstance.disable()

      expect(Logger.default.log).toHaveBeenCalledTimes(1)
      expect(Logger.default.log).toHaveBeenCalledWith('Adjust SDK has been disabled')
      expect(Identity.disable).toHaveBeenCalled()

      suite.expectShutDown()
    })

    it('prevents running all static methods and track event', () => {
      suite.expectNotRunningStatic()
      suite.expectNotRunningTrackEvent()
    })

    it('fails to disable already disabled sdk', () => {

      AdjustInstance.disable()

      expect(Logger.default.log).toHaveBeenLastCalledWith('Adjust SDK is already disabled')

      suite.expectNotShutDown()
    })

    it('enables sdk with restart', () => {

      AdjustInstance.enable()

      const a = suite.expectStart()

      expect.assertions(3 + a.assertions)

      expect(Logger.default.log).toHaveBeenCalledTimes(1)
      expect(Logger.default.log).toHaveBeenCalledWith('Adjust SDK has been enabled')
      expect(Identity.enable).toHaveBeenCalled()

      return a.promise
    })
  })

  describe('sdk: init and disable and enable', () => {
    afterAll(() => {
      suite.teardown()
    })

    it('initiates, disables and enables one after another', () => {
      expect.assertions(5)

      AdjustInstance.init(suite.config)
      AdjustInstance.disable()
      AdjustInstance.enable()

      expect(Logger.default.log).toHaveBeenCalledWith('Adjust SDK has been disabled')
      expect(Logger.default.log).toHaveBeenCalledWith('Adjust SDK has been enabled')
      expect(Identity.disable).toHaveBeenCalled()
      expect(Identity.enable).toHaveBeenCalled()

      return Utils.flushPromises()
        .then(() => {
          expect(Logger.default.log).toHaveBeenCalledWith('Adjust SDK start already in progress')
        })
    })

    it('ensures that everything is up', () => {
      const a = suite.expectAllUp()

      expect.assertions(a.assertions)

      return a.promise
    })
  })

  describe('sdk: init -> enable -> disable', () => {
    afterAll(() => {
      suite.teardown()
    })

    it('initiates and runs all static methods and track event', () => {

      AdjustInstance.init(suite.config)

      const a1 = suite.expectRunningStatic()
      const a2 = suite.expectRunningTrackEvent()
      const a3 = suite.expectStart()

      expect.assertions(a1.assertions + a2.assertions + a3.assertions)

      return a3.promise
    })

    it('fails to enable already enabled sdk', () => {

      AdjustInstance.enable()

      expect(Logger.default.log).toHaveBeenLastCalledWith('Adjust SDK is already enabled')

      suite.expectNotStart(true)
    })

    it('disables sdk with shutdown', () => {

      AdjustInstance.disable()

      expect(Logger.default.log).toHaveBeenCalledTimes(1)
      expect(Logger.default.log).toHaveBeenCalledWith('Adjust SDK has been disabled')
      expect(Identity.disable).toHaveBeenCalled()

      suite.expectShutDown()
    })

    it('prevents running all static methods and track event', () => {
      suite.expectNotRunningStatic()
      suite.expectNotRunningTrackEvent()
    })
  })

  describe('sdk: disable -> init -> enable', () => {
    afterAll(() => {
      suite.teardown()
    })

    it('disables sdk without shutdown', () => {

      AdjustInstance.disable()

      expect(Logger.default.log).toHaveBeenCalledTimes(1)
      expect(Logger.default.log).toHaveBeenCalledWith('Adjust SDK has been disabled')
      expect(Identity.disable).toHaveBeenCalled()

      suite.expectNotShutDown()
    })

    it('prevents running all static methods and track event', () => {
      suite.expectNotRunningStatic()
      suite.expectNotRunningTrackEvent()
    })

    it('initiates and still prevents running all static methods and track event', () => {

      AdjustInstance.init(suite.config)

      expect(Logger.default.log).toHaveBeenCalledWith('Adjust SDK is disabled, can not start the sdk')

      suite.expectNotStart()
      suite.expectNotRunningStatic()
      suite.expectNotRunningTrackEvent()
    })

    it('fails to disable already disabled sdk', () => {

      AdjustInstance.disable()

      expect(Logger.default.log).toHaveBeenLastCalledWith('Adjust SDK is already disabled')

      suite.expectNotShutDown()
    })

    it('enables sdk with restart', () => {

      AdjustInstance.enable()

      const a = suite.expectStart()

      expect.assertions(3 + a.assertions)

      expect(Logger.default.log).toHaveBeenCalledTimes(1)
      expect(Logger.default.log).toHaveBeenCalledWith('Adjust SDK has been enabled')
      expect(Identity.enable).toHaveBeenCalled()

      return a.promise
    })
  })

  describe('sdk: enable -> init -> disable', () => {

    afterAll(() => {
      suite.teardown()
    })

    it('runs all static methods', () => {
      suite.expectRunningStatic()
    })

    it('prevents running track event', () => {
      suite.expectNotRunningTrackEvent(true)
    })

    it('fails to enable already enabled sdk', () => {

      AdjustInstance.enable()

      expect(Logger.default.log).toHaveBeenLastCalledWith('Adjust SDK is already enabled')

      suite.expectNotStart(true)
    })

    it('initiates and runs all static methods and track event', () => {

      AdjustInstance.init(suite.config)

      expect.assertions(19)

      const a1 = suite.expectRunningStatic()
      const a2 = suite.expectRunningTrackEvent()
      const a3 = suite.expectStart()

      expect.assertions(a1.assertions + a2.assertions + a3.assertions)

      return a3.promise
    })

    it('fails again to enable already enabled sdk', () => {

      AdjustInstance.enable()

      expect(Logger.default.log).toHaveBeenLastCalledWith('Adjust SDK is already enabled')

      suite.expectNotStart(true)
    })

    it('disables sdk with shutdown', () => {

      AdjustInstance.disable()

      expect(Logger.default.log).toHaveBeenCalledTimes(1)
      expect(Logger.default.log).toHaveBeenCalledWith('Adjust SDK has been disabled')
      expect(Identity.disable).toHaveBeenCalled()

      suite.expectShutDown()
    })
  })

  describe('sdk: enable and init and disable', () => {
    afterAll(() => {
      suite.teardown()
    })

    it('enables, initiates and disable one after another', () => {

      AdjustInstance.enable()
      AdjustInstance.init(suite.config)
      AdjustInstance.disable()

      expect(Logger.default.log).toHaveBeenCalledWith('Adjust SDK is already enabled')
      expect(Logger.default.log).toHaveBeenCalledWith('Adjust SDK has been disabled')
      expect(Identity.disable).toHaveBeenCalled()

      return Utils.flushPromises()
    })

    it('ensures that everything is shutdown', () => {
      suite.expectAllDown()
    })
  })

  describe('sdk: disable -> enable -> init', () => {
    afterAll(() => {
      suite.teardown()
    })

    it('disables sdk without shutdown', () => {

      AdjustInstance.disable()

      expect(Logger.default.log).toHaveBeenCalledTimes(1)
      expect(Logger.default.log).toHaveBeenCalledWith('Adjust SDK has been disabled')
      expect(Identity.disable).toHaveBeenCalled()

      suite.expectNotShutDown()
    })

    it('enables sdk without restart', () => {

      AdjustInstance.enable()

      expect(Logger.default.log).toHaveBeenCalledTimes(1)
      expect(Logger.default.log).toHaveBeenCalledWith('Adjust SDK has been enabled')
      expect(Identity.enable).toHaveBeenCalled()

      suite.expectNotStart()
    })

    it('initiates and runs all static methods and track event', () => {

      AdjustInstance.init(suite.config)

      expect.assertions(19)

      const a1 = suite.expectRunningStatic()
      const a2 = suite.expectRunningTrackEvent()
      const a3 = suite.expectStart()

      expect.assertions(a1.assertions + a2.assertions + a3.assertions)

      return a3.promise
    })
  })

  describe('sdk: enable -> disable -> init', () => {
    afterAll(() => {
      suite.teardown()
    })

    it('fails to enable already enabled sdk', () => {

      AdjustInstance.enable()

      expect(Logger.default.log).toHaveBeenLastCalledWith('Adjust SDK is already enabled')

      suite.expectNotStart(true)
    })

    it('disables sdk without shutdown', () => {

      AdjustInstance.disable()

      expect(Logger.default.log).toHaveBeenCalledTimes(1)
      expect(Logger.default.log).toHaveBeenCalledWith('Adjust SDK has been disabled')
      expect(Identity.disable).toHaveBeenCalled()

      suite.expectNotShutDown()
    })

    it('initiates and prevents running all static methods and track event', () => {

      AdjustInstance.init(suite.config)

      expect(Logger.default.log).toHaveBeenCalledWith('Adjust SDK is disabled, can not start the sdk')

      suite.expectNotStart()
      suite.expectNotRunningStatic()
      suite.expectNotRunningTrackEvent()
    })
  })

})


