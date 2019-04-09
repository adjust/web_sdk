/* eslint-disable */
import * as QuickStorage from '../quick-storage'

describe('test low-level localStorage manipulation', () => {

  const queueSet = [
    {timestamp: 1, url: '/url1'},
    {timestamp: 2, url: '/url2'}
  ]
  const activityStateSet = [
    {uuid: 1, lastActive: 12345, attribution: {adid: 'blabla', tracker_token: '123abc'}}
  ]
  const eventParamsSet = [
    {key: 'a-key', value: 'a-value', type: 'callback'},
    {key: 'eto', value: 'tako', type: 'callback'},
    {key: 'key1', value: 'value1', type: 'partner'}
  ]

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
    const eventParamsProp = Object.getOwnPropertyDescriptor(QuickStorage.default, 'eventParams')

    expect(queueProp.get).toBeDefined()
    expect(queueProp.set).toBeDefined()

    expect(activityStateProp.get).toBeDefined()
    expect(activityStateProp.set).toBeDefined()

    expect(eventParamsProp.get).toBeDefined()
    expect(eventParamsProp.set).toBeDefined()

  })

  it('returns empty result when no data in localStorage', () => {

    expect(QuickStorage.default.queue).toBeNull()
    expect(QuickStorage.default.activityState).toBeNull()
    expect(QuickStorage.default.eventParams).toBeNull()

    expect(localStorage.getItem).toHaveBeenCalledTimes(3)
    expect(localStorage.getItem.mock.calls[0][0]).toEqual('adjust-sdk.queue')
    expect(localStorage.getItem.mock.calls[1][0]).toEqual('adjust-sdk.activityState')
    expect(localStorage.getItem.mock.calls[2][0]).toEqual('adjust-sdk.eventParams')

  })

  it('sets and gets result from localStorage', () => {

    QuickStorage.default.queue = queueSet
    QuickStorage.default.activityState = activityStateSet
    QuickStorage.default.eventParams = eventParamsSet

    expect(localStorage.setItem).toHaveBeenCalledTimes(3)

    expect(QuickStorage.default.queue).toEqual(queueSet)
    expect(QuickStorage.default.activityState).toEqual(activityStateSet)
    expect(QuickStorage.default.eventParams).toEqual(eventParamsSet)

    expect(localStorage.setItem.mock.calls[0][1]).toEqual(JSON.stringify(queueSet))
    expect(localStorage.setItem.mock.calls[1][1]).toEqual(JSON.stringify(activityStateSet))
    expect(localStorage.setItem.mock.calls[2][1]).toEqual(JSON.stringify(eventParamsSet))

  })

  it('clears data related to sdk from localStorage', () => {

    localStorage.setItem('should-stay-intact', 'something')

    QuickStorage.default.queue = queueSet
    QuickStorage.default.activityState = activityStateSet
    QuickStorage.default.eventParams = eventParamsSet

    expect(localStorage.getItem('should-stay-intact')).toBe('something')
    expect(localStorage.getItem('adjust-sdk.queue')).toEqual(JSON.stringify(queueSet))
    expect(localStorage.getItem('adjust-sdk.activityState')).toEqual(JSON.stringify(activityStateSet))
    expect(localStorage.getItem('adjust-sdk.eventParams')).toEqual(JSON.stringify(eventParamsSet))

    QuickStorage.default.clear()

    expect(QuickStorage.default.queue).toBeNull()
    expect(QuickStorage.default.activityState).toBeNull()
    expect(QuickStorage.default.eventParams).toBeNull()

    expect(localStorage.getItem('should-stay-intact')).toBe('something')
    expect(localStorage.getItem('adjust-sdk.queue')).toBeNull()
    expect(localStorage.getItem('adjust-sdk.activityState')).toBeNull()
    expect(localStorage.getItem('adjust-sdk.eventParams')).toBeNull()

  })

})
