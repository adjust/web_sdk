import * as PubSub from '../../pub-sub'
import * as Queue from '../../queue'
import * as Session from '../../session'
import * as event from '../../event'
import * as sdkClick from '../../sdk-click'
import * as Identity from '../../identity'
import * as GlobalParams from '../../global-params'
import * as Logger from '../../logger'
import * as GdprForgetDevice from '../../gdpr-forget-device'
import * as Listeners from '../../listeners'
import * as Scheduler from '../../scheduler'
import Suite from './main.suite'
import { STORAGE_TYPES } from '../../constants'

jest.mock('../../logger')

const mockInit = () => Promise.resolve({ storage: null, type: STORAGE_TYPES.NO_STORAGE })
const mockGetType  = () => STORAGE_TYPES.NO_STORAGE

jest.mock('../../storage/storage', () => ({
    init: () => mockInit(),
    getType: () => mockGetType()
  }
))

describe('main entry point - test instance initiation when storage is not available', () => {

  beforeAll(() => {
    jest.spyOn(event, 'default')
    jest.spyOn(sdkClick, 'default')
    jest.spyOn(Queue, 'run')
    jest.spyOn(Queue, 'setOffline')
    jest.spyOn(Session, 'watch')
    jest.spyOn(GlobalParams, 'get')
    jest.spyOn(GlobalParams, 'add')
    jest.spyOn(GlobalParams, 'remove')
    jest.spyOn(GlobalParams, 'removeAll')
    jest.spyOn(Logger.default, 'error')
    jest.spyOn(Logger.default, 'log')
    jest.spyOn(Identity, 'start')
    jest.spyOn(PubSub, 'subscribe')
    jest.spyOn(GdprForgetDevice, 'check')
    jest.spyOn(Listeners, 'register')
    jest.spyOn(Scheduler, 'flush')
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  afterAll(() => {
    jest.restoreAllMocks()
  })

  it('prevents initiation if storage is not available', () => {
    const AdjustInstance = require('../../main').default

    const suite = Suite(AdjustInstance)

    AdjustInstance.initSdk(suite.config)

    expect.assertions(28)

    return Utils.flushPromises()
      .then(() => {
        expect(Logger.default.error).toHaveBeenCalledWith('Adjust SDK can not start, there is no storage available')
        suite.expectNotStart()
        suite.expectNotRunningStaticWhenNoStorage()
        return suite.expectNotRunningTrackEventWhenNoStorage()
      })

  })

})


