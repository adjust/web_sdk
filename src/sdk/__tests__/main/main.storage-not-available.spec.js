import * as PubSub from '../../pub-sub'
import * as Queue from '../../queue'
import * as Session from '../../session'
import * as event from '../../event'
import * as Identity from '../../identity'
import * as GlobalParams from '../../global-params'
import * as Logger from '../../logger'
import {
  config,
  expectNotStart,
  expectNotRunningTrackEvent,
  expectNotRunningStatic
} from './_main-helper'

jest.mock('../../logger')

describe('main entry point - test instance initiation when storage is not available', () => {

  beforeAll(() => {
    jest.spyOn(event, 'default')
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
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  afterAll(() => {
    jest.restoreAllMocks()
  })

  it('prevents initiation if storage is not available', () => {
    jest.doMock('../../storage-manager', () => { return null })

    const AdjustInstance = require('../../main').default

    AdjustInstance.init(config)

    expect(Logger.default.error).toHaveBeenCalledWith('Adjust SDK can not start, there is no storage available')
    expectNotStart()
    expectNotRunningStatic(AdjustInstance, true)
    expectNotRunningTrackEvent(AdjustInstance, true, true)

  })

})


