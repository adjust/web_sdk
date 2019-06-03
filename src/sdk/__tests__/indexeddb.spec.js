/* eslint-disable */
import fakeIDB from 'fake-indexeddb'
import * as IDBKeyRange from 'fake-indexeddb/lib/FDBKeyRange'
import * as IndexedDB from '../indexeddb'
import * as Identity from '../identity'
import * as ActivityState from '../activity-state'
import * as QuickStorage from '../quick-storage'
import * as Logger from '../logger'

jest.mock('../logger')

describe('IndexedDB usage', () => {

  window.indexedDB = fakeIDB
  window.IDBKeyRange = IDBKeyRange

  beforeAll(() => {
    jest.spyOn(Logger.default, 'error')
  })

  afterEach(() => {
    IndexedDB.default.clear('queue')
    IndexedDB.default.clear('activityState')
    IndexedDB.default.clear('globalParams')
  })

  afterAll(() => {
    IndexedDB.default.destroy()
    localStorage.clear()
    jest.restoreAllMocks()
  })

  it('checks if indexedDB is supported', () => {

    let supported = IndexedDB.default.isSupported()

    expect(supported).toBeTruthy()
    expect(Logger.default.error).not.toHaveBeenCalled()

    delete window.indexedDB

    supported = IndexedDB.default.isSupported()

    expect(supported).toBeFalsy()
    expect(Logger.default.error).toHaveBeenCalledWith('IndexedDB is not supported in this browser')

    window.indexedDB = fakeIDB

  })

  it('returns rows from particular store', () => {

    // prepare some rows manually
    const queueSet = [
      {timestamp: 1, url: '/url1'},
      {timestamp: 2, url: '/url2'},
      {timestamp: 3, url: '/url3'}
    ]

    expect.assertions(4)

    return IndexedDB.default.getAll('test')
      .catch(error => {

        expect(error.name).toEqual('NotFoundError')
        expect(error.message).toEqual('No objectStore named test in this database')

        return IndexedDB.default.getAll('queue')
      })
      .then(result => {

        expect(result).toEqual([])

        return IndexedDB.default.addBulk('queue', queueSet)
      })
      .then(() => IndexedDB.default.getAll('queue'))
      .then(result => {
        expect(result).toEqual([
          {timestamp: 1, url: '/url1'},
          {timestamp: 2, url: '/url2'},
          {timestamp: 3, url: '/url3'}
        ])
      })
  })

  it('returns undefined if no row present', () => {

    expect.assertions(1)

    return IndexedDB.default.getFirst('activityState')
      .then(result => {
        expect(result).toBeUndefined()
      })

  })

  it('returns empty array if no rows present', () => {

    expect.assertions(1)

    return IndexedDB.default.getAll('queue')
      .then(result => {
        expect(result).toEqual([])
      })

  })

  it('returns first row from particular store', () => {

    // prepare some rows manually
    const queueSet = [
      {timestamp: 1552701608300, url: '/url1'},
      {timestamp: 1552705208300, url: '/url2'},
      {timestamp: 1552911178981, url: '/url3'}
    ]

    expect.assertions(1)

    return IndexedDB.default.addBulk('queue', queueSet)
      .then(() => IndexedDB.default.getFirst('queue'))
      .then(result => {
        expect(result).toEqual({timestamp: 1552701608300, url: '/url1'})
      })

  })

  it('gets item from the activityState store', () => {

    // prepare some rows manually
    const activityStateSet = [
      {uuid: 1, lastActive: 12345},
      {uuid: 2, lastActive: 12346}
    ]

    expect.assertions(3)

    return IndexedDB.default.addBulk('activityState', activityStateSet)
      .then(() => IndexedDB.default.getItem('activityState', 2))
      .then(result => {
        expect(result).toEqual({uuid: 2, lastActive: 12346})

        return IndexedDB.default.getItem('activityState', 3)
      })
      .catch(error => {
        expect(error.name).toEqual('NotFoundError')
        expect(error.message).toEqual('No record found uuid => 3 in activityState store')
      })

  })

  it('gets item from the globalParams store - with composite key', () => {

    // prepare some rows manually
    const globalParamsSet = [
      {key: 'key1', value: 'cvalue1', type: 'callback'},
      {key: 'key2', value: 'cvalue2', type: 'callback'},
      {key: 'key1', value: 'pvalue1', type: 'partner'}
    ]

    expect.assertions(3)

    return IndexedDB.default.addBulk('globalParams', globalParamsSet)
      .then(() => IndexedDB.default.getItem('globalParams', ['key1', 'callback']))
      .then(result => {
        expect(result).toEqual({key: 'key1', value: 'cvalue1', type: 'callback'})

        return IndexedDB.default.getItem('globalParams', ['key3', 'callback'])
      })
      .catch(error => {
        expect(error.name).toEqual('NotFoundError')
        expect(error.message).toEqual('No record found key:type => key3:callback in globalParams store')
      })

  })

  it('adds items to the queue store', () => {

    expect.assertions(5)

    return IndexedDB.default.addItem('queue', {timestamp: 1, url: '/url1'})
      .then(id => {

        expect(id).toEqual(1)

        return IndexedDB.default.getAll('queue')
      })
      .then(result => {

        expect(result).toEqual([
          {timestamp: 1, url: '/url1'}
        ])

        return IndexedDB.default.addItem('queue', {timestamp: 2, url: '/url2'})
      })
      .then(id => {

        expect(id).toEqual(2)

        return IndexedDB.default.getAll('queue')
      })
      .then(result => {

        expect(result).toEqual([
          {timestamp: 1, url: '/url1'},
          {timestamp: 2, url: '/url2'}
        ])

        return IndexedDB.default.addItem('queue', {timestamp: 2, url: '/url2'})
      })
      .catch(error => {
        expect(error.target._error.name).toBe('ConstraintError')
      })

  })

  it('adds items to the globalParams store - with composite key', () => {

    expect.assertions(7)

    return IndexedDB.default.addItem('globalParams', {key: 'key1', value: 'value1', type: 'callback'})
      .then((id) => {

        expect(id).toEqual(['key1', 'callback'])

        return IndexedDB.default.getAll('globalParams')
      })
      .then(result => {

        expect(result).toEqual([
          {key: 'key1', value: 'value1', type: 'callback'}
        ])

        return IndexedDB.default.addItem('globalParams', {key: 'key2', value: 'value2', type: 'callback'})
      })
      .then(id => {

        expect(id).toEqual(['key2', 'callback'])

        return IndexedDB.default.getAll('globalParams')
      })
      .then(result => {

        expect(result).toEqual([
          {key: 'key1', value: 'value1', type: 'callback'},
          {key: 'key2', value: 'value2', type: 'callback'}
        ])

        return IndexedDB.default.addItem('globalParams', {key: 'key1', value: 'value1', type: 'partner'})
      })
      .then(id => {

        expect(id).toEqual(['key1', 'partner'])

        return IndexedDB.default.getAll('globalParams')
      })
      .then(result => {

        expect(result).toEqual([
          {key: 'key1', value: 'value1', type: 'callback'},
          {key: 'key2', value: 'value2', type: 'callback'},
          {key: 'key1', value: 'value1', type: 'partner'}
        ])

        return IndexedDB.default.addItem('globalParams', {key: 'key1', value: 'value1', type: 'callback'})
      })
      .catch(error => {
        expect(error.target._error.name).toBe('ConstraintError')
      })

  })

  it('updates items in the activityState store', () => {

    // prepare some rows manually
    const activityStateSet = [
      {uuid: 1, lastActive: 12345},
      {uuid: 2, lastActive: 12346}
    ]

    expect.assertions(8)

    return IndexedDB.default.addBulk('activityState', activityStateSet)
      .then(() => IndexedDB.default.updateItem('activityState', {uuid: 1, lastActive: 12347, attribution: {adid: 'something'}}))
      .then(update => {

        expect(update).toEqual(1)

        return IndexedDB.default.getAll('activityState')
      })
      .then(result => {

        expect(result).toEqual([
          {uuid: 1, lastActive: 12347, attribution: {adid: 'something'}},
          {uuid: 2, lastActive: 12346}
        ])

        return IndexedDB.default.updateItem('activityState', {uuid: 1, lastActive: 12348})
      })
      .then(update => {

        expect(update).toEqual(1)

        return IndexedDB.default.getItem('activityState', 1)
      })
      .then(result => {

        expect(result).toEqual({uuid: 1, lastActive: 12348})

        return IndexedDB.default.updateItem('activityState', {uuid: 2, lastActive: 12349, attribution: {adid: 'something'}})
      })
      .then(update => {

        expect(update).toEqual(2)

        return IndexedDB.default.getAll('activityState')
      })
      .then(result => {

        expect(result).toEqual([
          {uuid: 1, lastActive: 12348},
          {uuid: 2, lastActive: 12349, attribution: {adid: 'something'}}
        ])

        return IndexedDB.default.updateItem('activityState', {uuid: 3, lastActive: 12350})
      })
      .then(update => {

        expect(update).toEqual(3)

        return IndexedDB.default.getAll('activityState')
      })
      .then(result => {

        expect(result).toEqual([
          {uuid: 1, lastActive: 12348},
          {uuid: 2, lastActive: 12349, attribution: {adid: 'something'}},
          {uuid: 3, lastActive: 12350}
        ])
      })

  })

  it('updates items in the globalParams store - with composite key', () => {

    // prepare some rows manually
    const globalParamsSet = [
      {key: 'key1', value: 'value1', type: 'callback'},
      {key: 'key2', value: 'value2', type: 'callback'},
      {key: 'key1', value: 'value1', type: 'partner'}
    ]

    expect.assertions(6)

    return IndexedDB.default.addBulk('globalParams', globalParamsSet)
      .then(() => IndexedDB.default.updateItem('globalParams', {key: 'key1', value: 'updated value1', type: 'callback'}))
      .then(update => {

        expect(update).toEqual(['key1', 'callback'])

        return IndexedDB.default.getAll('globalParams')
      })
      .then(result => {

        expect(result).toEqual([
          {key: 'key1', value: 'updated value1', type: 'callback'},
          {key: 'key2', value: 'value2', type: 'callback'},
          {key: 'key1', value: 'value1', type: 'partner'}
        ])

        return IndexedDB.default.updateItem('globalParams', {key: 'key2', value: 'updated value2', type: 'callback'})
      })
      .then(update => {

        expect(update).toEqual(['key2', 'callback'])

        return IndexedDB.default.getAll('globalParams')
      })
      .then(result => {

        expect(result).toEqual([
          {key: 'key1', value: 'updated value1', type: 'callback'},
          {key: 'key2', value: 'updated value2', type: 'callback'},
          {key: 'key1', value: 'value1', type: 'partner'}
        ])

        return IndexedDB.default.updateItem('globalParams', {key: 'key2', value: 'value2', type: 'partner'})
      })
      .then(update => {

        expect(update).toEqual(['key2', 'partner'])

        return IndexedDB.default.getAll('globalParams')
      })
      .then(result => {
        expect(result).toEqual([
          {key: 'key1', value: 'updated value1', type: 'callback'},
          {key: 'key2', value: 'updated value2', type: 'callback'},
          {key: 'key1', value: 'value1', type: 'partner'},
          {key: 'key2', value: 'value2', type: 'partner'}
        ])
      })

  })

  it('deletes item by item in the queue store', () => {

    // prepare some rows manually
    const queueSet = [
      {timestamp: 1, url: '/url1'},
      {timestamp: 2, url: '/url2'},
      {timestamp: 3, url: '/url3'}
    ]

    expect.assertions(7)

    return IndexedDB.default.addBulk('queue', queueSet)
      .then(() => IndexedDB.default.getAll('queue'))
      .then(result => {

        expect(result).toEqual([
          {timestamp: 1, url: '/url1'},
          {timestamp: 2, url: '/url2'},
          {timestamp: 3, url: '/url3'}
        ])

        return IndexedDB.default.deleteItem('queue', 2)
      })
      .then(deleted => {

        expect(deleted).toEqual(2)

        return IndexedDB.default.getAll('queue')
      })
      .then(result => {

        expect(result).toEqual([
          {timestamp: 1, url: '/url1'},
          {timestamp: 3, url: '/url3'}
        ])

        return IndexedDB.default.deleteItem('queue', 1)
      })
      .then(deleted => {

        expect(deleted).toEqual(1)

        return IndexedDB.default.getAll('queue')
      })
      .then(result => {

        expect(result).toEqual([
          {timestamp: 3, url: '/url3'}
        ])

        return IndexedDB.default.deleteItem('queue', 5)
      })
      .then(deleted => {

        expect(deleted).toEqual(5)

        return IndexedDB.default.getAll('queue')
      })
      .then(result => {
        expect(result).toEqual([
          {timestamp: 3, url: '/url3'}
        ])
      })

  })

  it('deletes item by item in the globalParams store - with composite key', () => {

    // prepare some rows manually
    const globalParamsSet = [
      {key: 'key1', value: 'value1', type: 'callback'},
      {key: 'key2', value: 'value2', type: 'callback'},
      {key: 'key1', value: 'value1', type: 'partner'},
      {key: 'key2', value: 'value2', type: 'partner'}
    ]

    expect.assertions(6)

    return IndexedDB.default.addBulk('globalParams', globalParamsSet)
      .then(() => IndexedDB.default.deleteItem('globalParams', ['key2', 'callback']))
      .then(deleted => {

        expect(deleted).toEqual(['key2', 'callback'])

        return IndexedDB.default.getAll('globalParams')
      })
      .then(result => {

        expect(result).toEqual([
          {key: 'key1', value: 'value1', type: 'callback'},
          {key: 'key1', value: 'value1', type: 'partner'},
          {key: 'key2', value: 'value2', type: 'partner'}
        ])

        return IndexedDB.default.deleteItem('globalParams', ['key1', 'partner'])
      })
      .then(deleted => {

        expect(deleted).toEqual(['key1', 'partner'])

        return IndexedDB.default.getAll('globalParams')
      })
      .then(result => {

        expect(result).toEqual([
          {key: 'key1', value: 'value1', type: 'callback'},
          {key: 'key2', value: 'value2', type: 'partner'}
        ])

        return IndexedDB.default.deleteItem('globalParams', ['key5', 'callback'])
      })
      .then(deleted => {

        expect(deleted).toEqual(['key5', 'callback'])

        return IndexedDB.default.getAll('globalParams')
      })
      .then(result => {

        expect(result).toEqual([
          {key: 'key1', value: 'value1', type: 'callback'},
          {key: 'key2', value: 'value2', type: 'partner'}
        ])
      })

  })

  it ('deletes items until certain bound from the queue store', () => {

    // prepare some rows manually
    const queueSet = [
      {timestamp: 1552701608300, url: '/url1'},
      {timestamp: 1552705208300, url: '/url2'},
      {timestamp: 1552911178981, url: '/url3'}
    ]

    expect.assertions(3)

    return IndexedDB.default.addBulk('queue', queueSet)
      .then(() => IndexedDB.default.getAll('queue'))
      .then(result => {

        expect(result).toEqual([
          {timestamp: 1552701608300, url: '/url1'},
          {timestamp: 1552705208300, url: '/url2'},
          {timestamp: 1552911178981, url: '/url3'}
        ])

        return IndexedDB.default.deleteBulk('queue', {upperBound: 1552705208300})
      })
      .then(deleted => {
        expect(deleted).toEqual([
          {timestamp: 1552701608300, url: '/url1'},
          {timestamp: 1552705208300, url: '/url2'},
        ])
      })
      .then(() => IndexedDB.default.getAll('queue'))
      .then(result => {
        expect(result).toEqual([
          {timestamp: 1552911178981, url: '/url3'}
        ])
      })

  })

  it ('deletes items in bulk by type from the globalParams store - with composite key', () => {

    // prepare some rows manually
    const globalParamsSet = [
      {key: 'key4', value: 'value4', type: 'callback'},
      {key: 'key2', value: 'value2', type: 'callback'},
      {key: 'key2', value: 'value2', type: 'partner'},
      {key: 'key3', value: 'value3', type: 'callback'},
      {key: 'key1', value: 'value1', type: 'partner'},
      {key: 'key1', value: 'value1', type: 'callback'}
    ]

    expect.assertions(5)

    return IndexedDB.default.addBulk('globalParams', globalParamsSet)
      .then(() => IndexedDB.default.getAll('globalParams'))
      .then(result => {
        expect(result).toEqual([
          {key: 'key1', value: 'value1', type: 'callback'},
          {key: 'key2', value: 'value2', type: 'callback'},
          {key: 'key3', value: 'value3', type: 'callback'},
          {key: 'key4', value: 'value4', type: 'callback'},
          {key: 'key1', value: 'value1', type: 'partner'},
          {key: 'key2', value: 'value2', type: 'partner'}
        ])

        return IndexedDB.default.deleteBulk('globalParams', 'partner')
      })
      .then(deleted => {
        expect(deleted).toEqual([
          {key: 'key1', value: 'value1', type: 'partner'},
          {key: 'key2', value: 'value2', type: 'partner'}
        ])

        return IndexedDB.default.getAll('globalParams')
      })
      .then(result => {
        expect(result).toEqual([
          {key: 'key1', value: 'value1', type: 'callback'},
          {key: 'key2', value: 'value2', type: 'callback'},
          {key: 'key3', value: 'value3', type: 'callback'},
          {key: 'key4', value: 'value4', type: 'callback'}
        ])

        return IndexedDB.default.deleteBulk('globalParams', 'callback')
      })
      .then(deleted => {
        expect(deleted).toEqual([
          {key: 'key1', value: 'value1', type: 'callback'},
          {key: 'key2', value: 'value2', type: 'callback'},
          {key: 'key3', value: 'value3', type: 'callback'},
          {key: 'key4', value: 'value4', type: 'callback'}
        ])

        return IndexedDB.default.getAll('globalParams')
      })
      .then(result => {
        expect(result).toEqual([])
      })

  })

  it('clears items from the queue store', () => {

    // prepare some rows manually
    const queueSet = [
      {timestamp: 1, url: '/url1'},
      {timestamp: 2, url: '/url2'}
    ]

    expect.assertions(2)

    return IndexedDB.default.addBulk('queue', queueSet)
      .then(() => IndexedDB.default.getAll('queue'))
      .then(result => {

        expect(result).toEqual([
          {timestamp: 1, url: '/url1'},
          {timestamp: 2, url: '/url2'}
        ])

        return IndexedDB.default.clear('queue')
      })
      .then(() => IndexedDB.default.getAll('queue'))
      .then(result => {
        expect(result).toEqual([])
      })

  })

  it('restores activityState record from the running memory when db gets destroyed', () => {

    expect.assertions(3)

    let activityState = null

    return Identity.start()
      .then(() => {

        IndexedDB.default.destroy()
        fakeIDB._databases.clear()

        activityState = ActivityState.default.current

        expect(activityState.uuid).toBeDefined()

        return IndexedDB.default.getFirst('activityState')
      })
      .then(stored => {

        expect(stored).toEqual(activityState)
        expect(stored.uuid).toBeDefined()

        Identity.destroy()
      })
  })

  describe('performing add bulk operation', () => {

    it('fails when array is not provided', () => {

      expect.assertions(4)

      return IndexedDB.default.addBulk('globalParams', [])
        .catch(error => {
          expect(error.name).toEqual('NoTargetDefined')
          expect(error.message).toEqual('No array provided to perform add bulk operation into globalParams store')

          return IndexedDB.default.addBulk('queue')
        })
        .catch(error => {
          expect(error.name).toEqual('NoTargetDefined')
          expect(error.message).toEqual('No array provided to perform add bulk operation into queue store')
        })

    })

    it('adds rows into globalParams store', () => {

      const globalParamsSet1 = [
        {key: 'bla', value: 'truc', type: 'callback'},
        {key: 'key1', value: 'value1', type: 'callback'},
        {key: 'eto', value: 'tako', type: 'partner'}
      ]

      const globalParamsSet2 = [
        {key: 'key2', value: 'value2', type: 'callback'},
        {key: 'par', value: 'tner', type: 'partner'}
      ]

      expect.assertions(3)

      return IndexedDB.default.addBulk('globalParams', globalParamsSet1)
        .then(result => {
          expect(result).toEqual([['bla', 'callback'], ['key1', 'callback'], ['eto', 'partner']])

          return IndexedDB.default.addBulk('globalParams', globalParamsSet2)
        })
        .then(result => {
          expect(result).toEqual([['key2', 'callback'], ['par', 'partner']])

          return IndexedDB.default.getAll('globalParams')
        })
        .then(result => {
          expect(result).toEqual([
            {key: 'bla', value: 'truc', type: 'callback'},
            {key: 'key1', value: 'value1', type: 'callback'},
            {key: 'key2', value: 'value2', type: 'callback'},
            {key: 'eto', value: 'tako', type: 'partner'},
            {key: 'par', value: 'tner', type: 'partner'}
          ])
        })
    })

    it('adds rows into globalParams store and overwrite existing key at later point', () => {

      const globalParamsSet1 = [
        {key: 'bla', value: 'truc', type: 'callback'},
        {key: 'key1', value: 'value1', type: 'callback'},
        {key: 'eto', value: 'tako', type: 'partner'}
      ]

      const globalParamsSet2 = [
        {key: 'key1', value: 'new key1 value', type: 'callback'},
        {key: 'par', value: 'tner', type: 'partner'},
        {key: 'bla', value: 'truc', type: 'partner'}
      ]

      expect.assertions(3)

      return IndexedDB.default.addBulk('globalParams', globalParamsSet1)
        .then(result => {
          expect(result).toEqual([['bla', 'callback'], ['key1', 'callback'], ['eto', 'partner']])

          return IndexedDB.default.addBulk('globalParams', globalParamsSet2, true)
        })
        .then(result => {
          expect(result).toEqual([['key1', 'callback'], ['par', 'partner'], ['bla', 'partner']])

          return IndexedDB.default.getAll('globalParams')
        })
        .then(result => {
          expect(result).toEqual([
            {key: 'bla', value: 'truc', type: 'callback'},
            {key: 'key1', value: 'new key1 value', type: 'callback'},
            {key: 'bla', value: 'truc', type: 'partner'},
            {key: 'eto', value: 'tako', type: 'partner'},
            {key: 'par', value: 'tner', type: 'partner'}
          ])
        })
    })

    it('adds rows into globalParams store and catches an error when adding existing key', () => {

      const globalParamsSet1 = [
        {key: 'bla', value: 'truc', type: 'callback'},
        {key: 'key1', value: 'value1', type: 'callback'},
        {key: 'eto', value: 'tako', type: 'partner'}
      ]

      const globalParamsSet2 = [
        {key: 'key1', value: 'new key1 value', type: 'callback'},
        {key: 'par', value: 'tner', type: 'partner'},
        {key: 'eto', value: 'tako', type: 'partner'}
      ]

      expect.assertions(2)

      return IndexedDB.default.addBulk('globalParams', globalParamsSet1)
        .then(result => {
          expect(result).toEqual([['bla', 'callback'], ['key1', 'callback'], ['eto', 'partner']])

          return IndexedDB.default.addBulk('globalParams', globalParamsSet2)
        })
        .catch(error => {
          expect(error.target._error.name).toEqual('ConstraintError')
        })
    })

    it('returns callback and partner params from the globalParams store', () => {

      const globalParamsSet = [
        {key: 'key1', value: 'value1', type: 'callback'},
        {key: 'key2', value: 'value2', type: 'partner'},
        {key: 'key3', value: 'value3', type: 'partner'},
        {key: 'key4', value: 'value4', type: 'callback'},
        {key: 'key5', value: 'value5', type: 'callback'},
      ]

      expect.assertions(2)

      return IndexedDB.default.addBulk('globalParams', globalParamsSet)
        .then(() => Promise.all([
          IndexedDB.default.filterBy('globalParams', 'callback'),
          IndexedDB.default.filterBy('globalParams', 'partner')
        ]))
        .then(([callbackParams, partnerParams]) => {
          expect(callbackParams).toEqual([
            {key: 'key1', value: 'value1', type: 'callback'},
            {key: 'key4', value: 'value4', type: 'callback'},
            {key: 'key5', value: 'value5', type: 'callback'},
          ])
          expect(partnerParams).toEqual([
            {key: 'key2', value: 'value2', type: 'partner'},
            {key: 'key3', value: 'value3', type: 'partner'}
          ])
        })
    })

  })

  describe('tests in case indexedDB got supported due to a browser upgrade', () => {

    const queueSet = [
      {timestamp: 1, url: '/url1'},
      {timestamp: 2, url: '/url2'}
    ]
    const activityStateSet = [
      {uuid: 1, lastActive: 12345, attribution: {adid: 'blabla', tracker_token: '123abc', tracker_name: 'tracker', network: 'bla'}}
    ]

    beforeEach(() => {
      Identity.destroy()
      localStorage.clear()
      fakeIDB._databases.clear()
      IndexedDB.default.destroy()
    })

    it('returns empty results when migration is not available', () => {

      expect.assertions(2)

      return IndexedDB.default.getFirst('activityState')
        .then(result => {
          expect(result).toBeUndefined()

          return IndexedDB.default.getAll('queue')
        })
        .then(result => {
          expect(result).toEqual([])
        })

    })

    it('returns result migrated from the localStorage when upgraded within restarted window session', () => {

      // prepare some rows manually
      QuickStorage.default.queue = queueSet
      QuickStorage.default.activityState = activityStateSet

      expect.assertions(4)

      return IndexedDB.default.getFirst('activityState')
        .then(result => {
          expect(result).toEqual(activityStateSet[0])

          return IndexedDB.default.getAll('queue')
        })
        .then(result => {
          expect(result).toEqual(queueSet)
          expect(QuickStorage.default.queue).toBeNull()
          expect(QuickStorage.default.activityState).toBeNull()
        })
    })

    it('returns result migrated from localStorage for queue when upgraded in the middle of the window session', () => {

      expect.assertions(6)

      let inMemoryActivityState = null

      return Identity.start()
        .then(() => {

          inMemoryActivityState = ActivityState.default.current

          expect(inMemoryActivityState.uuid).toBeDefined()

          // prepare some rows manually
          QuickStorage.default.queue = queueSet
          QuickStorage.default.activityState = activityStateSet

          IndexedDB.default.destroy()
          fakeIDB._databases.clear()

          return IndexedDB.default.getFirst('activityState')
        })
        .then(result => {

          expect(result).toEqual(inMemoryActivityState)
          expect(result.uuid).toBeDefined()

          return IndexedDB.default.getAll('queue')
        })
        .then(result => {
          expect(result).toEqual(queueSet)
          expect(QuickStorage.default.queue).toBeNull()
          expect(QuickStorage.default.activityState).toBeNull()
        })

    })


  })

})
