import * as GlobalParams from '../global-params'
import * as Logger from '../logger'
import * as StorageManager from '../storage/storage-manager'

jest.mock('../logger')

describe('global parameters functionality', () => {

  beforeAll(() => {
    jest.spyOn(Logger.default, 'log')
  })

  afterEach(() => {
    localStorage.clear()
    jest.clearAllMocks()
  })

  afterAll(() => {
    jest.restoreAllMocks()
    localStorage.clear()
  })

  it('returns empty arrays if there are no global callback parameters', () => {

    expect.assertions(4)

    return GlobalParams.get()
      .then(({callbackParams, partnerParams}) => {
        expect(callbackParams).toEqual([])
        expect(partnerParams).toEqual([])

        jest.spyOn(StorageManager.default, 'filterBy')
          .mockReturnValue(null)

        return GlobalParams.get()
      })
      .then(({callbackParams, partnerParams}) => {
        expect(callbackParams).toEqual([])
        expect(partnerParams).toEqual([])

        StorageManager.default.filterBy.mockRestore()
      })
  })

  it('stores global callback params and clean duplicates', () => {

    expect.assertions(5)

    return GlobalParams.add([
      {key: 'key1', value: 'value1'},
      {key: 'key2', value: 'value2'},
      {key: 'key1', value: 'last value1'}
    ], 'callback')
      .then(result => {
        expect(result).toEqual([
          ['key1', 'callback'],
          ['key2', 'callback']
        ])
        return GlobalParams.get()
      })
      .then(({callbackParams, partnerParams}) => {
        expect(callbackParams).toEqual([
          {key: 'key1', value: 'last value1'},
          {key: 'key2', value: 'value2'}
        ])
        expect(partnerParams).toEqual([])
        expect(Logger.default.log).toHaveBeenCalledTimes(1)
        expect(Logger.default.log).toHaveBeenCalledWith('Following callback parameters have been saved: key1:last value1, key2:value2')
      })
  })

  it('stores global partner params and override repeating keys if adding them at later point', () => {

    expect.assertions(6)

    return GlobalParams.add([
      {key: 'key1', value: 'value1'},
      {key: 'key2', value: 'value2'},
      {key: 'key3', value: 'value3'}
    ], 'partner')
      .then(() => GlobalParams.add([
        {key: 'key1', value: 'new value1'},
        {key: 'key3', value: 'new value3'}
      ], 'partner'))
      .then(() => GlobalParams.get())
      .then(({callbackParams, partnerParams}) => {
        expect(callbackParams).toEqual([])
        expect(partnerParams).toEqual([
          {key: 'key1', value: 'new value1'},
          {key: 'key2', value: 'value2'},
          {key: 'key3', value: 'new value3'}
        ])
        expect(Logger.default.log).toHaveBeenCalledTimes(3)
        expect(Logger.default.log.mock.calls[0][0]).toEqual('Following partner parameters have been saved: key1:value1, key2:value2, key3:value3')
        expect(Logger.default.log.mock.calls[1][0]).toEqual('Following partner parameters have been saved: key1:new value1, key3:new value3')
        expect(Logger.default.log.mock.calls[2][0]).toEqual('Keys: key1, key3 already existed so their values have been updated')
      })
  })

  it('stores both callback and partner params and override repeating keys if adding them at later point', () => {

    expect.assertions(9)

    return GlobalParams.add([
      {key: 'key1', value: 'value1'},
      {key: 'key2', value: 'value2'},
      {key: 'key3', value: 'value3'},
      {key: 'key1', value: 'last value1'}
    ], 'callback')
      .then(() => {

        expect(Logger.default.log.mock.calls[0][0]).toEqual('Following callback parameters have been saved: key1:last value1, key2:value2, key3:value3')

        return GlobalParams.add([
          {key: 'key1', value: 'value1'},
          {key: 'key3', value: 'value3'}
        ], 'partner')
      })
      .then(() => {

        expect(Logger.default.log.mock.calls[1][0]).toEqual('Following partner parameters have been saved: key1:value1, key3:value3')

        return GlobalParams.add([
          {key: 'key2', value: 'new value2'},
          {key: 'key4', value: 'value4'},
        ], 'callback')
      })
      .then(() => {

        expect(Logger.default.log.mock.calls[2][0]).toEqual('Following callback parameters have been saved: key2:new value2, key4:value4')
        expect(Logger.default.log.mock.calls[3][0]).toEqual('Keys: key2 already existed so their values have been updated')

        return GlobalParams.add([
          {key: 'key2', value: 'value2'},
          {key: 'key3', value: 'new value3'},
        ], 'partner')
      })
      .then(() => GlobalParams.get())
      .then(({callbackParams, partnerParams}) => {

        expect(Logger.default.log).toHaveBeenCalledTimes(6)
        expect(Logger.default.log.mock.calls[4][0]).toEqual('Following partner parameters have been saved: key2:value2, key3:new value3')
        expect(Logger.default.log.mock.calls[5][0]).toEqual('Keys: key3 already existed so their values have been updated')

        expect(callbackParams).toEqual([
          {key: 'key1', value: 'last value1'},
          {key: 'key2', value: 'new value2'},
          {key: 'key3', value: 'value3'},
          {key: 'key4', value: 'value4'}
        ])
        expect(partnerParams).toEqual([
          {key: 'key1', value: 'value1'},
          {key: 'key2', value: 'value2'},
          {key: 'key3', value: 'new value3'}
        ])
      })
  })

  it('removes specified global parameters', () => {

    expect.assertions(7)

    return GlobalParams.add([
      {key: 'key1', value: 'value1'},
      {key: 'key2', value: 'value2'},
      {key: 'key3', value: 'value3'}
    ], 'callback')
      .then(() => GlobalParams.add([
        {key: 'key1', value: 'value1'},
        {key: 'key3', value: 'value3'}
      ], 'partner'))
      .then(() => GlobalParams.remove('key2', 'callback'))
      .then(result => {
        expect(result).toEqual(['key2', 'callback'])
        return GlobalParams.remove('key1', 'partner')
      })
      .then(result => {
        expect(result).toEqual(['key1', 'partner'])
        return GlobalParams.get()
      })
      .then(({callbackParams, partnerParams}) => {
        expect(callbackParams).toEqual([
          {key: 'key1', value: 'value1'},
          {key: 'key3', value: 'value3'}
        ])
        expect(partnerParams).toEqual([
          {key: 'key3', value: 'value3'}
        ])
      })
      .then(() => GlobalParams.remove('key3', 'callback'))
      .then(result => {
        expect(result).toEqual(['key3', 'callback'])
        return GlobalParams.get()
      })
      .then(({callbackParams, partnerParams}) => {
        expect(callbackParams).toEqual([
          {key: 'key1', value: 'value1'}
        ])
        expect(partnerParams).toEqual([
          {key: 'key3', value: 'value3'}
        ])
      })

  })

  it('removes all callback or partner global parameters', () => {

    expect.assertions(6)

    const callbackParams = [
      {key: 'key1', value: 'value1'},
      {key: 'key2', value: 'value2'},
      {key: 'key3', value: 'value3'}
    ]

    const partnerParams = [
      {key: 'key1', value: 'value1'},
      {key: 'key3', value: 'value3'}
    ]

    return GlobalParams.add(callbackParams, 'callback')
      .then(() => GlobalParams.add(partnerParams, 'partner'))
      .then(() => GlobalParams.removeAll('callback'))
      .then(result => {
        expect(result).toEqual(callbackParams.map(p => [p.key, 'callback']))
        return GlobalParams.get()
      })
      .then(({callbackParams, partnerParams}) => {
        expect(callbackParams).toEqual([])
        expect(partnerParams).toEqual([
          {key: 'key1', value: 'value1'},
          {key: 'key3', value: 'value3'}
        ])

        return GlobalParams.removeAll('partner')
      })
      .then(result => {
        expect(result).toEqual(partnerParams.map(p => [p.key, 'partner']))
        return GlobalParams.get()
      })
      .then(({callbackParams, partnerParams}) => {
        expect(callbackParams).toEqual([])
        expect(partnerParams).toEqual([])
      })

  })

  it('clears globalParams store', () => {

    expect.assertions(4)

    return GlobalParams.add([
      {key: 'key1', value: 'value1'},
      {key: 'key2', value: 'value2'},
      {key: 'key3', value: 'value3'}
    ], 'callback')
      .then(() => GlobalParams.add([
        {key: 'key1', value: 'value1'},
        {key: 'key3', value: 'value3'}
      ], 'partner'))
      .then(() => GlobalParams.get())
      .then(({callbackParams, partnerParams}) => {
        expect(callbackParams).toEqual([
          {key: 'key1', value: 'value1'},
          {key: 'key2', value: 'value2'},
          {key: 'key3', value: 'value3'}
        ])
        expect(partnerParams).toEqual([
          {key: 'key1', value: 'value1'},
          {key: 'key3', value: 'value3'}
        ])

        return GlobalParams.clear()
      })
      .then(() => GlobalParams.get())
      .then(({callbackParams, partnerParams}) => {
        expect(callbackParams).toEqual([])
        expect(partnerParams).toEqual([])
      })

  })
})
