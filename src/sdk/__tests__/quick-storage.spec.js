/* eslint-disable */
import * as QuickStorage from '../quick-storage'

describe('test low-level localStorage manipulation', () => {

  const schemeDef = {
    queue: {primaryKey: 'timestamp'},
    activityState: {primaryKey: 'uuid'}
  }
  const queueSet = [
    {timestamp: 1, url: '/url1'},
    {timestamp: 2, url: '/url2'}
  ]
  const activityStateSet = [
    {uuid: 1, lastActive: 12345, attribution: {adid: 'blabla', tracker_token: '123abc'}}
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

    const schemeProp = Object.getOwnPropertyDescriptor(QuickStorage.default, '_scheme')
    const queueProp = Object.getOwnPropertyDescriptor(QuickStorage.default, 'queue')
    const activityStateProp = Object.getOwnPropertyDescriptor(QuickStorage.default, 'activityState')

    expect(schemeProp.get).toBeDefined()
    expect(schemeProp.set).toBeDefined()

    expect(queueProp.get).toBeDefined()
    expect(queueProp.set).toBeDefined()

    expect(activityStateProp.get).toBeDefined()
    expect(activityStateProp.set).toBeDefined()

  })

  it('returns empty result when no data in localStorage', () => {

    expect(QuickStorage.default._scheme).toBeNull()
    expect(QuickStorage.default.queue).toBeNull()
    expect(QuickStorage.default.activityState).toBeNull()

    expect(localStorage.getItem).toHaveBeenCalledTimes(3)
    expect(localStorage.getItem.mock.calls[0][0]).toEqual('adjust-sdk._scheme')
    expect(localStorage.getItem.mock.calls[1][0]).toEqual('adjust-sdk.queue')
    expect(localStorage.getItem.mock.calls[2][0]).toEqual('adjust-sdk.activityState')

  })

  it('sets and gets result from localStorage', () => {

    QuickStorage.default._scheme = schemeDef
    QuickStorage.default.queue = queueSet
    QuickStorage.default.activityState = activityStateSet

    expect(localStorage.setItem).toHaveBeenCalledTimes(3)

    expect(QuickStorage.default._scheme).toEqual(schemeDef)
    expect(QuickStorage.default.queue).toEqual(queueSet)
    expect(QuickStorage.default.activityState).toEqual(activityStateSet)

    expect(localStorage.setItem.mock.calls[0][1]).toEqual(JSON.stringify(schemeDef))
    expect(localStorage.setItem.mock.calls[1][1]).toEqual(JSON.stringify(queueSet))
    expect(localStorage.setItem.mock.calls[2][1]).toEqual(JSON.stringify(activityStateSet))

  })

  it('clears data related to sdk from localStorage', () => {

    localStorage.setItem('should-stay-intact', 'something')

    QuickStorage.default._scheme = schemeDef
    QuickStorage.default.queue = queueSet
    QuickStorage.default.activityState = activityStateSet

    expect(localStorage.getItem('should-stay-intact')).toBe('something')
    expect(localStorage.getItem('adjust-sdk._scheme')).toEqual(JSON.stringify(schemeDef))
    expect(localStorage.getItem('adjust-sdk.queue')).toEqual(JSON.stringify(queueSet))
    expect(localStorage.getItem('adjust-sdk.activityState')).toEqual(JSON.stringify(activityStateSet))

    QuickStorage.default.clear()

    expect(QuickStorage.default._scheme).toBeNull()
    expect(QuickStorage.default.queue).toBeNull()
    expect(QuickStorage.default.activityState).toBeNull()

    expect(localStorage.getItem('should-stay-intact')).toBe('something')
    expect(localStorage.getItem('adjust-sdk._scheme')).toBeNull()
    expect(localStorage.getItem('adjust-sdk.queue')).toBeNull()
    expect(localStorage.getItem('adjust-sdk.activityState')).toBeNull()

  })

})
