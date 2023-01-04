import * as QuickStorage from '../../storage/quick-storage'

describe('test low-level localStorage manipulation', () => {

  const stores = QuickStorage.default.stores
  const storeNames = QuickStorage.default.storeNames
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
  const preferencesRecord = {sdkDisabled: {reason: 'general', pending: false}}
  const preferencesRecordEncoded = {sd: {r: 1, p: 0}}

  beforeAll(() => {
    jest.spyOn(localStorage, 'getItem')
    jest.spyOn(localStorage, 'setItem')
  })

  beforeEach(() => {
    jest.clearAllMocks()
    localStorage.clear()
  })

  afterEach(() => {
    localStorage.clear()
  })

  it('throws when trying to run setter which is not defined', () => {

    expect(() => {
      stores.undefinedSetter = 'blah'
    }).toThrow(new TypeError('Cannot add property undefinedSetter, object is not extensible'))

  })

  it('has getters and setters which names match the sdk db scheme', () => {

    const queueProp = Object.getOwnPropertyDescriptor(stores, storeNames.queue.name)
    const activityStateProp = Object.getOwnPropertyDescriptor(stores, storeNames.activityState.name)
    const globalParamsProp = Object.getOwnPropertyDescriptor(stores, storeNames.globalParams.name)
    const preferencesProp = Object.getOwnPropertyDescriptor(stores, storeNames.preferences.name)

    expect(queueProp.get).toBeDefined()
    expect(queueProp.set).toBeDefined()

    expect(activityStateProp.get).toBeDefined()
    expect(activityStateProp.set).toBeDefined()

    expect(globalParamsProp.get).toBeDefined()
    expect(globalParamsProp.set).toBeDefined()

    expect(preferencesProp.get).toBeDefined()
    expect(preferencesProp.set).toBeDefined()

  })

  it('returns empty result when no data in localStorage', () => {

    expect(stores[storeNames.queue.name]).toBeNull()
    expect(stores[storeNames.activityState.name]).toBeNull()
    expect(stores[storeNames.globalParams.name]).toBeNull()
    expect(stores[storeNames.preferences.name]).toBeNull()

    expect(localStorage.getItem).toHaveBeenCalledTimes(4)
    expect(localStorage.getItem.mock.calls[0][0]).toBe(`adjust-sdk.${storeNames.queue.name}`)
    expect(localStorage.getItem.mock.calls[1][0]).toBe(`adjust-sdk.${storeNames.activityState.name}`)
    expect(localStorage.getItem.mock.calls[2][0]).toBe(`adjust-sdk.${storeNames.globalParams.name}`)
    expect(localStorage.getItem.mock.calls[3][0]).toBe(`adjust-sdk.${storeNames.preferences.name}`)

  })

  it('sets and gets result from localStorage', () => {

    stores[storeNames.queue.name] = queueRecords
    stores[storeNames.activityState.name] = activityStateRecords
    stores[storeNames.globalParams.name] = globalParamsRecords
    stores[storeNames.preferences.name] = preferencesRecord

    expect(localStorage.setItem).toHaveBeenCalledTimes(4)

    expect(stores[storeNames.queue.name]).toEqual(queueRecords)
    expect(stores[storeNames.activityState.name]).toEqual(activityStateRecords)
    expect(stores[storeNames.globalParams.name]).toEqual(globalParamsRecords)
    expect(stores[storeNames.preferences.name]).toEqual(preferencesRecord)

    expect(localStorage.setItem.mock.calls[0][1]).toEqual(JSON.stringify(queueRecords))
    expect(localStorage.setItem.mock.calls[1][1]).toEqual(JSON.stringify(activityStateRecords))
    expect(localStorage.setItem.mock.calls[2][1]).toEqual(JSON.stringify(globalParamsRecords))
    expect(localStorage.setItem.mock.calls[3][1]).toEqual(JSON.stringify(preferencesRecordEncoded))

  })

  it('clears data related to sdk from localStorage', () => {

    localStorage.setItem('should-stay-intact', 'something')

    stores[storeNames.queue.name] = queueRecords
    stores[storeNames.activityState.name] = activityStateRecords
    stores[storeNames.globalParams.name] = globalParamsRecords
    stores[storeNames.preferences.name] = preferencesRecord

    expect(localStorage.getItem('should-stay-intact')).toBe('something')
    expect(localStorage.getItem(`adjust-sdk.${storeNames.queue.name}`)).toEqual(JSON.stringify(queueRecords))
    expect(localStorage.getItem(`adjust-sdk.${storeNames.activityState.name}`)).toEqual(JSON.stringify(activityStateRecords))
    expect(localStorage.getItem(`adjust-sdk.${storeNames.globalParams.name}`)).toEqual(JSON.stringify(globalParamsRecords))
    expect(localStorage.getItem(`adjust-sdk.${storeNames.preferences.name}`)).toEqual(JSON.stringify(preferencesRecordEncoded))

    QuickStorage.default.clear()

    expect(stores[storeNames.queue.name]).toBeNull()
    expect(stores[storeNames.activityState.name]).toBeNull()
    expect(stores[storeNames.globalParams.name]).toBeNull()
    expect(stores[storeNames.preferences.name]).toEqual(preferencesRecord)

    expect(localStorage.getItem('should-stay-intact')).toBe('something')
    expect(localStorage.getItem(`adjust-sdk.${storeNames.queue.name}`)).toBeNull()
    expect(localStorage.getItem(`adjust-sdk.${storeNames.activityState.name}`)).toBeNull()
    expect(localStorage.getItem(`adjust-sdk.${storeNames.globalParams.name}`)).toBeNull()
    expect(localStorage.getItem(`adjust-sdk.${storeNames.preferences.name}`)).toEqual(JSON.stringify(preferencesRecordEncoded))

  })

})
