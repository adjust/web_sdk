import * as QuickStorage from '../../storage/quick-storage'

describe('test low-level localStorage manipulation', () => {

  const stores = QuickStorage.default.stores
  const storeNames = QuickStorage.default.names
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
  const disabledRecord = {reason: 'general', pending: false}
  const disabledRecordEncoded = {r: 1, p: 0}

  beforeAll(() => {
    jest.spyOn(localStorage, 'getItem')
    jest.spyOn(localStorage, 'setItem')
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

    const queueProp = Object.getOwnPropertyDescriptor(stores, storeNames.queue)
    const activityStateProp = Object.getOwnPropertyDescriptor(stores, storeNames.activityState)
    const globalParamsProp = Object.getOwnPropertyDescriptor(stores, storeNames.globalParams)
    const disabledProp = Object.getOwnPropertyDescriptor(stores, storeNames.disabled)

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

    expect(stores[storeNames.queue]).toBeNull()
    expect(stores[storeNames.activityState]).toBeNull()
    expect(stores[storeNames.globalParams]).toBeNull()
    expect(stores[storeNames.disabled]).toBeNull()

    expect(localStorage.getItem).toHaveBeenCalledTimes(4)
    expect(localStorage.getItem.mock.calls[0][0]).toEqual(`adjust-sdk.${storeNames.queue}`)
    expect(localStorage.getItem.mock.calls[1][0]).toEqual(`adjust-sdk.${storeNames.activityState}`)
    expect(localStorage.getItem.mock.calls[2][0]).toEqual(`adjust-sdk.${storeNames.globalParams}`)
    expect(localStorage.getItem.mock.calls[3][0]).toEqual(`adjust-sdk.${storeNames.disabled}`)

  })

  it('sets and gets result from localStorage', () => {

    stores[storeNames.queue] = queueRecords
    stores[storeNames.activityState] = activityStateRecords
    stores[storeNames.globalParams] = globalParamsRecords
    stores[storeNames.disabled] = disabledRecord

    expect(localStorage.setItem).toHaveBeenCalledTimes(4)

    expect(stores[storeNames.queue]).toEqual(queueRecords)
    expect(stores[storeNames.activityState]).toEqual(activityStateRecords)
    expect(stores[storeNames.globalParams]).toEqual(globalParamsRecords)
    expect(stores[storeNames.disabled]).toEqual(disabledRecord)

    expect(localStorage.setItem.mock.calls[0][1]).toEqual(JSON.stringify(queueRecords))
    expect(localStorage.setItem.mock.calls[1][1]).toEqual(JSON.stringify(activityStateRecords))
    expect(localStorage.setItem.mock.calls[2][1]).toEqual(JSON.stringify(globalParamsRecords))
    expect(localStorage.setItem.mock.calls[3][1]).toEqual(JSON.stringify(disabledRecordEncoded))

  })

  it('clears data related to sdk from localStorage', () => {

    localStorage.setItem('should-stay-intact', 'something')

    stores[storeNames.queue] = queueRecords
    stores[storeNames.activityState] = activityStateRecords
    stores[storeNames.globalParams] = globalParamsRecords
    stores[storeNames.disabled] = disabledRecord

    expect(localStorage.getItem('should-stay-intact')).toBe('something')
    expect(localStorage.getItem(`adjust-sdk.${storeNames.queue}`)).toEqual(JSON.stringify(queueRecords))
    expect(localStorage.getItem(`adjust-sdk.${storeNames.activityState}`)).toEqual(JSON.stringify(activityStateRecords))
    expect(localStorage.getItem(`adjust-sdk.${storeNames.globalParams}`)).toEqual(JSON.stringify(globalParamsRecords))
    expect(localStorage.getItem(`adjust-sdk.${storeNames.disabled}`)).toEqual(JSON.stringify(disabledRecordEncoded))

    QuickStorage.default.clear()

    expect(stores[storeNames.queue]).toBeNull()
    expect(stores[storeNames.activityState]).toBeNull()
    expect(stores[storeNames.globalParams]).toBeNull()
    expect(stores[storeNames.disabled]).toEqual(disabledRecord)

    expect(localStorage.getItem('should-stay-intact')).toBe('something')
    expect(localStorage.getItem(`adjust-sdk.${storeNames.queue}`)).toBeNull()
    expect(localStorage.getItem(`adjust-sdk.${storeNames.activityState}`)).toBeNull()
    expect(localStorage.getItem(`adjust-sdk.${storeNames.globalParams}`)).toBeNull()
    expect(localStorage.getItem(`adjust-sdk.${storeNames.disabled}`)).toEqual(JSON.stringify(disabledRecordEncoded))

  })

})
