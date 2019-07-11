import * as GlobalParams from '../global-params'
import * as Logger from '../logger'

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

  it('stores global callback params and clean duplicates', () => {

    expect.assertions(4)

    return GlobalParams.add([
      {key: 'key1', value: 'value1'},
      {key: 'key2', value: 'value2'},
      {key: 'key1', value: 'last value1'}
    ]).then(() => GlobalParams.get())
      .then(({callbackParams, partnerParams}) => {
        expect(callbackParams).toEqual([
          {key: 'key1', value: 'last value1', type: 'callback'},
          {key: 'key2', value: 'value2', type: 'callback'}
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
          {key: 'key1', value: 'new value1', type: 'partner'},
          {key: 'key2', value: 'value2', type: 'partner'},
          {key: 'key3', value: 'new value3', type: 'partner'}
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
          {key: 'key1', value: 'last value1', type: 'callback'},
          {key: 'key2', value: 'new value2', type: 'callback'},
          {key: 'key3', value: 'value3', type: 'callback'},
          {key: 'key4', value: 'value4', type: 'callback'}
        ])
        expect(partnerParams).toEqual([
          {key: 'key1', value: 'value1', type: 'partner'},
          {key: 'key2', value: 'value2', type: 'partner'},
          {key: 'key3', value: 'new value3', type: 'partner'}
        ])
      })
  })

  it('removes specified global parameters', () => {

    expect.assertions(2)

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
      .then(() => GlobalParams.remove('key1', 'partner'))
      .then(() => GlobalParams.get())
      .then(({callbackParams, partnerParams}) => {
        expect(callbackParams).toEqual([
          {key: 'key1', value: 'value1', type: 'callback'},
          {key: 'key3', value: 'value3', type: 'callback'}
        ])
        expect(partnerParams).toEqual([
          {key: 'key3', value: 'value3', type: 'partner'}
        ])
      })

  })

  it('removes all callback or partner global parameters', () => {

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
      .then(() => GlobalParams.removeAll('callback'))
      .then(() => GlobalParams.get())
      .then(({callbackParams, partnerParams}) => {
        expect(callbackParams).toEqual([])
        expect(partnerParams).toEqual([
          {key: 'key1', value: 'value1', type: 'partner'},
          {key: 'key3', value: 'value3', type: 'partner'}
        ])

        return GlobalParams.removeAll('partner')
      })
      .then(() => GlobalParams.get())
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
          {key: 'key1', value: 'value1', type: 'callback'},
          {key: 'key2', value: 'value2', type: 'callback'},
          {key: 'key3', value: 'value3', type: 'callback'}
        ])
        expect(partnerParams).toEqual([
          {key: 'key1', value: 'value1', type: 'partner'},
          {key: 'key3', value: 'value3', type: 'partner'}
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
