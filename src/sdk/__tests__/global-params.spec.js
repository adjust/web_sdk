/* eslint-disable */
import * as GlobalParams from '../global-params'
import * as StorageManager from '../storage-manager'

describe('global parameters functionality', () => {

  afterEach(() => {
    StorageManager.default.clear('globalParams')
    jest.clearAllMocks()
  })

  afterAll(() => {
    jest.restoreAllMocks()
    localStorage.clear()
  })

  it('stores global callback params and clean duplicates', () => {

    expect.assertions(2)

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
      })
  })

  it('stores global partner params and override repeating keys if adding them at later point', () => {

    expect.assertions(2)

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
      })
  })

  it('stores both callback and partner params and override repeating keys if adding them at later point', () => {

    expect.assertions(2)

    return GlobalParams.add([
      {key: 'key1', value: 'value1'},
      {key: 'key2', value: 'value2'},
      {key: 'key3', value: 'value3'},
      {key: 'key1', value: 'last value1'}
    ], 'callback')
      .then(() => GlobalParams.add([
        {key: 'key1', value: 'value1'},
        {key: 'key3', value: 'value3'},
      ], 'partner'))
      .then(() => GlobalParams.add([
        {key: 'key2', value: 'new value2'},
        {key: 'key4', value: 'value4'},
      ], 'callback'))
      .then(() => GlobalParams.add([
        {key: 'key2', value: 'value2'},
        {key: 'key3', value: 'new value3'},
      ], 'partner'))
      .then(() => GlobalParams.get())
      .then(({callbackParams, partnerParams}) => {
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
      })
      .then(() => GlobalParams.removeAll('partner'))
      .then(() => GlobalParams.get())
      .then(({callbackParams, partnerParams}) => {
        expect(callbackParams).toEqual([])
        expect(partnerParams).toEqual([])
      })

  })
})
