/* eslint-disable */
import * as QuickStorage from '../quick-storage'

describe('test low-level localStorage manipulation', () => {

  const queueRecords = [
    {timestamp: 1, url: '/url1'},
    {timestamp: 2, url: '/url2'}
  ]
  const activityStateRecords = [
    {uuid: 1, lastActive: 12345, attribution: {adid: 'blabla', tracker_token: '123abc'}}
  ]
  const globalParamsRecords = [
    {key: 'a-key', value: 'a-value', type: 'callback'},
    {key: 'eto', value: 'tako', type: 'callback'},
    {key: 'key1', value: 'value1', type: 'partner'}
  ]
  const disabledRecord = 'general'

  beforeAll(() => {
    jest.spyOn(localStorage, 'getItem')
    jest.spyOn(localStorage, 'setItem')
  })

  afterEach(() => {
    localStorage.clear()
  })

  it('throws when trying to run setter which is not defined', () => {

    expect(() => {
      QuickStorage.default.undefinedSetter = 'blah'
    }).toThrow(new TypeError('Cannot add property undefinedSetter, object is not extensible'))

  })

  it('has getters and setters which names match the sdk db scheme', () => {

    const queueProp = Object.getOwnPropertyDescriptor(QuickStorage.default, 'queue')
    const activityStateProp = Object.getOwnPropertyDescriptor(QuickStorage.default, 'activityState')
    const globalParamsProp = Object.getOwnPropertyDescriptor(QuickStorage.default, 'globalParams')
    const disabledProp = Object.getOwnPropertyDescriptor(QuickStorage.default, 'disabled')

    expect(queueProp.get).toBeDefined()
    expect(queueProp.set).toBeDefined()

    expect(activityStateProp.get).toBeDefined()
    expect(activityStateProp.set).toBeDefined()

    expect(globalParamsProp.get).toBeDefined()
    expect(globalParamsProp.set).toBeDefined()

    expect(disabledProp.get).toBeDefined()
    expect(disabledProp.set).toBeDefined()

  })

  it('returns empty result when no data in localStorage', () => {

    expect(QuickStorage.default.queue).toBeNull()
    expect(QuickStorage.default.activityState).toBeNull()
    expect(QuickStorage.default.globalParams).toBeNull()
    expect(QuickStorage.default.disabled).toBeNull()

    expect(localStorage.getItem).toHaveBeenCalledTimes(4)
    expect(localStorage.getItem.mock.calls[0][0]).toEqual('adjust-sdk.queue')
    expect(localStorage.getItem.mock.calls[1][0]).toEqual('adjust-sdk.activityState')
    expect(localStorage.getItem.mock.calls[2][0]).toEqual('adjust-sdk.globalParams')
    expect(localStorage.getItem.mock.calls[3][0]).toEqual('adjust-sdk.disabled')

  })

  it('sets and gets result from localStorage', () => {

    QuickStorage.default.queue = queueRecords
    QuickStorage.default.activityState = activityStateRecords
    QuickStorage.default.globalParams = globalParamsRecords
    QuickStorage.default.disabled = disabledRecord

    expect(localStorage.setItem).toHaveBeenCalledTimes(4)

    expect(QuickStorage.default.queue).toEqual(queueRecords)
    expect(QuickStorage.default.activityState).toEqual(activityStateRecords)
    expect(QuickStorage.default.globalParams).toEqual(globalParamsRecords)
    expect(QuickStorage.default.disabled).toEqual(disabledRecord)

    expect(localStorage.setItem.mock.calls[0][1]).toEqual(JSON.stringify(queueRecords))
    expect(localStorage.setItem.mock.calls[1][1]).toEqual(JSON.stringify(activityStateRecords))
    expect(localStorage.setItem.mock.calls[2][1]).toEqual(JSON.stringify(globalParamsRecords))
    expect(localStorage.setItem.mock.calls[3][1]).toEqual(JSON.stringify(disabledRecord))

  })

  it('clears data related to sdk from localStorage', () => {

    localStorage.setItem('should-stay-intact', 'something')

    QuickStorage.default.queue = queueRecords
    QuickStorage.default.activityState = activityStateRecords
    QuickStorage.default.globalParams = globalParamsRecords
    QuickStorage.default.disabled = disabledRecord

    expect(localStorage.getItem('should-stay-intact')).toBe('something')
    expect(localStorage.getItem('adjust-sdk.queue')).toEqual(JSON.stringify(queueRecords))
    expect(localStorage.getItem('adjust-sdk.activityState')).toEqual(JSON.stringify(activityStateRecords))
    expect(localStorage.getItem('adjust-sdk.globalParams')).toEqual(JSON.stringify(globalParamsRecords))
    expect(localStorage.getItem('adjust-sdk.disabled')).toEqual(JSON.stringify(disabledRecord))

    QuickStorage.default.clear()

    expect(QuickStorage.default.queue).toBeNull()
    expect(QuickStorage.default.activityState).toBeNull()
    expect(QuickStorage.default.globalParams).toBeNull()
    expect(QuickStorage.default.disabled).toEqual(disabledRecord)

    expect(localStorage.getItem('should-stay-intact')).toBe('something')
    expect(localStorage.getItem('adjust-sdk.queue')).toBeNull()
    expect(localStorage.getItem('adjust-sdk.activityState')).toBeNull()
    expect(localStorage.getItem('adjust-sdk.globalParams')).toBeNull()
    expect(localStorage.getItem('adjust-sdk.disabled')).toEqual(JSON.stringify(disabledRecord))

  })

})
