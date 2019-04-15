/* eslint-disable */
import * as LocalStorage from '../localstorage'
import * as Identity from '../identity'
import * as ActivityState from '../activity-state'
import * as QuickStorage from '../quick-storage'

describe('LocalStorage usage', () => {

  afterEach(() => {
    localStorage.clear()
  })

  afterAll(() => {
    LocalStorage.default.destroy()
  })

  it('checks if localStorage is supported', () => {

    const original = window.localStorage
    let supported = LocalStorage.default.isSupported()

    expect(supported).toBeTruthy()
    expect(() => {
      LocalStorage.default.isSupported(true)
    }).not.toThrow()

    delete window.localStorage

    supported = LocalStorage.default.isSupported()

    expect(supported).toBeFalsy()
    expect(() => {
      LocalStorage.default.isSupported(true)
    }).toThrow(new Error('LocalStorage is not supported in this browser'))

    window.localStorage = original
  })

  it('returns rows from particular store', () => {

    expect.assertions(4)

    LocalStorage.default.getAll('test')
      .catch(error => {
        expect(error.name).toBe('NotFoundError')
        expect(error.message).toBe('No store named test in this storage')
      })

    LocalStorage.default.getAll('queue')
      .then(result => {
        expect(result).toEqual([])
      })

    // prepare some rows manually
    QuickStorage.default.queue = [
      {timestamp: 1, url: '/url1'},
      {timestamp: 2, url: '/url2'},
      {timestamp: 3, url: '/url3'}
    ]

    LocalStorage.default.getAll('queue')
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

    return LocalStorage.default.getFirst('activityState')
      .then(result => {
        expect(result).toBeUndefined()
      })

  })

  it('returns empty array if no rows present', () => {

    expect.assertions(1)

    return LocalStorage.default.getAll('queue')
      .then(result => {
        expect(result).toEqual([])
      })

  })

  it('returns first row from particular store', () => {

    // prepare some rows manually
    QuickStorage.default.queue = [
      {timestamp: 1552701608300, url: '/url1'},
      {timestamp: 1552705208300, url: '/url2'},
      {timestamp: 1552911178981, url: '/url3'},
    ]

    expect.assertions(1)

    return LocalStorage.default.getFirst('queue')
      .then(result => {
        expect(result).toEqual({timestamp: 1552701608300, url: '/url1'})
      })

  })

  it('gets item from the activityState store', () => {

    // prepare some rows manually
    QuickStorage.default.activityState = [
      {uuid: 1, lastActive: 12345},
      {uuid: 2, lastActive: 12346}
    ]

    expect.assertions(3)

    return LocalStorage.default.getItem('activityState', 2)
      .then(result => {
        expect(result).toEqual({uuid: 2, lastActive: 12346})

        return LocalStorage.default.getItem('activityState', 3)
      })
      .catch(error => {
        expect(error.name).toEqual('NotFoundError')
        expect(error.message).toEqual('No record found uuid => 3 in activityState store')
      })

  })

  it('gets item from the globalParams store - with composite key', () => {

    // prepare some rows manually
    QuickStorage.default.globalParams = [
      {key: 'key1', value: 'cvalue1', type: 'callback'},
      {key: 'key2', value: 'cvalue2', type: 'callback'},
      {key: 'key1', value: 'pvalue1', type: 'partner'}
    ]

    expect.assertions(3)

    return LocalStorage.default.getItem('globalParams', ['key1', 'callback'])
      .then(result => {
        expect(result).toEqual({key: 'key1', value: 'cvalue1', type: 'callback'})

        return LocalStorage.default.getItem('globalParams', ['key3', 'callback'])
      })
      .catch(error => {
        expect(error.name).toEqual('NotFoundError')
        expect(error.message).toEqual('No record found key:type => key3:callback in globalParams store')
      })

  })

  it('adds items to the queue store', () => {

    expect.assertions(8)

    return LocalStorage.default.addItem('queue', {timestamp: 1, url: '/url1'})
      .then(id => {

        expect(id).toEqual(1)

        return LocalStorage.default.getAll('queue')
      })
      .then(result => {

        expect(result).toEqual([
          {timestamp: 1, url: '/url1'}
        ])

        return LocalStorage.default.addItem('queue', {timestamp: 2, url: '/url2'})
      })
      .then(id => {

        expect(id).toEqual(2)

        return LocalStorage.default.getAll('queue')
      })
      .then(result => {

        expect(result).toEqual([
          {timestamp: 1, url: '/url1'},
          {timestamp: 2, url: '/url2'}
        ])

        return LocalStorage.default.addItem('queue', {timestamp: 3, url: '/url3'})
      })
      .then(id => {

        expect(id).toEqual(3)

        return LocalStorage.default.getAll('queue')
      })
      .then(result => {

        expect(result).toEqual([
          {timestamp: 1, url: '/url1'},
          {timestamp: 2, url: '/url2'},
          {timestamp: 3, url: '/url3'}
        ])

        return LocalStorage.default.addItem('queue', {timestamp: 2, url: '/url2'})
      })
      .catch(error => {
        expect(error.name).toBe('ConstraintError')
        expect(error.message).toBe('Item timestamp => 2 already exists')
      })

  })

  it('adds items to the globalParams store - with composite key', () => {

    expect.assertions(8)

    return LocalStorage.default.addItem('globalParams', {key: 'key1', value: 'value1', type: 'callback'})
      .then((id) => {

        expect(id).toEqual(['key1', 'callback'])

        return LocalStorage.default.getAll('globalParams')
      })
      .then(result => {

        expect(result).toEqual([
          {key: 'key1', value: 'value1', type: 'callback'}
        ])

        return LocalStorage.default.addItem('globalParams', {key: 'key2', value: 'value2', type: 'callback'})
      })
      .then(id => {

        expect(id).toEqual(['key2', 'callback'])

        return LocalStorage.default.getAll('globalParams')
      })
      .then(result => {

        expect(result).toEqual([
          {key: 'key1', value: 'value1', type: 'callback'},
          {key: 'key2', value: 'value2', type: 'callback'}
        ])

        return LocalStorage.default.addItem('globalParams', {key: 'key1', value: 'value1', type: 'partner'})
      })
      .then(id => {

        expect(id).toEqual(['key1', 'partner'])

        return LocalStorage.default.getAll('globalParams')
      })
      .then(result => {

        expect(result).toEqual([
          {key: 'key1', value: 'value1', type: 'callback'},
          {key: 'key2', value: 'value2', type: 'callback'},
          {key: 'key1', value: 'value1', type: 'partner'}
        ])

        return LocalStorage.default.addItem('globalParams', {key: 'key1', value: 'value1', type: 'callback'})
      })
      .catch(error => {
        expect(error.name).toBe('ConstraintError')
        expect(error.message).toBe('Item key:type => key1:callback already exists')
      })

  })

  it('updates items in the activityState store', () => {

    // prepare some rows manually
    QuickStorage.default.activityState = [
      {uuid: 1, lastActive: 12345},
      {uuid: 2, lastActive: 12346}
    ]

    expect.assertions(8)

    return LocalStorage.default.updateItem('activityState', {uuid: 1, lastActive: 12347, attribution: {adid: 'something'}})
      .then(update => {

        expect(update).toEqual(1)

        return LocalStorage.default.getAll('activityState')
      })
      .then(result => {

        expect(result).toEqual([
          {uuid: 1, lastActive: 12347, attribution: {adid: 'something'}},
          {uuid: 2, lastActive: 12346}
        ])

        return LocalStorage.default.updateItem('activityState', {uuid: 1, lastActive: 12348})
      })
      .then(update => {

        expect(update).toEqual(1)

        return LocalStorage.default.getItem('activityState', 1)
      })
      .then(result => {

        expect(result).toEqual({uuid: 1, lastActive: 12348})

        return LocalStorage.default.updateItem('activityState', {uuid: 2, lastActive: 12349, attribution: {adid: 'something'}})
      })
      .then(update => {

        expect(update).toEqual(2)

        return LocalStorage.default.getAll('activityState')
      })
      .then(result => {

        expect(result).toEqual([
          {uuid: 1, lastActive: 12348},
          {uuid: 2, lastActive: 12349, attribution: {adid: 'something'}}
        ])

        return LocalStorage.default.updateItem('activityState', {uuid: 3, lastActive: 12350})
      })
      .then(update => {

        expect(update).toEqual(3)

        return LocalStorage.default.getAll('activityState')
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
    QuickStorage.default.globalParams = [
      {key: 'key1', value: 'value1', type: 'callback'},
      {key: 'key2', value: 'value2', type: 'callback'},
      {key: 'key1', value: 'value1', type: 'partner'}
    ]

    expect.assertions(6)

    return LocalStorage.default.updateItem('globalParams', {key: 'key1', value: 'updated value1', type: 'callback'})
      .then(update => {

        expect(update).toEqual(['key1', 'callback'])

        return LocalStorage.default.getAll('globalParams')
      })
      .then(result => {

        expect(result).toEqual([
          {key: 'key1', value: 'updated value1', type: 'callback'},
          {key: 'key2', value: 'value2', type: 'callback'},
          {key: 'key1', value: 'value1', type: 'partner'}
        ])

        return LocalStorage.default.updateItem('globalParams', {key: 'key2', value: 'updated value2', type: 'callback'})
      })
      .then(update => {

        expect(update).toEqual(['key2', 'callback'])

        return LocalStorage.default.getAll('globalParams')
      })
      .then(result => {

        expect(result).toEqual([
          {key: 'key1', value: 'updated value1', type: 'callback'},
          {key: 'key2', value: 'updated value2', type: 'callback'},
          {key: 'key1', value: 'value1', type: 'partner'}
        ])

        return LocalStorage.default.updateItem('globalParams', {key: 'key2', value: 'value2', type: 'partner'})
      })
      .then(update => {

        expect(update).toEqual(['key2', 'partner'])

        return LocalStorage.default.getAll('globalParams')
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
    QuickStorage.default.queue = [
      {timestamp: 1, url: '/url1'},
      {timestamp: 2, url: '/url2'},
      {timestamp: 3, url: '/url3'},
      {timestamp: 4, url: '/url4'}
    ]

    expect.assertions(6)

    return LocalStorage.default.deleteItem('queue', 2)
      .then(deleted => {

        expect(deleted).toEqual(2)

        return LocalStorage.default.getAll('queue')
      })
      .then(result => {

        expect(result).toEqual([
          {timestamp: 1, url: '/url1'},
          {timestamp: 3, url: '/url3'},
          {timestamp: 4, url: '/url4'}
        ])

        return LocalStorage.default.deleteItem('queue', 4)
      })
      .then(deleted => {

        expect(deleted).toEqual(4)

        return LocalStorage.default.getAll('queue')
      })
      .then(result => {

        expect(result).toEqual([
          {timestamp: 1, url: '/url1'},
          {timestamp: 3, url: '/url3'}
        ])

        return LocalStorage.default.deleteItem('queue', 5)
      })
      .then(deleted => {

        expect(deleted).toEqual(5)

        return LocalStorage.default.getAll('queue')
      })
      .then(result => {

        expect(result).toEqual([
          {timestamp: 1, url: '/url1'},
          {timestamp: 3, url: '/url3'}
        ])
      })

  })

  it('deletes item by item in the globalParams store - with composite key', () => {

    // prepare some rows manually
    QuickStorage.default.globalParams = [
      {key: 'key1', value: 'value1', type: 'callback'},
      {key: 'key2', value: 'value2', type: 'callback'},
      {key: 'key1', value: 'value1', type: 'partner'},
      {key: 'key2', value: 'value2', type: 'partner'}
    ]

    expect.assertions(6)

    return LocalStorage.default.deleteItem('globalParams', ['key2', 'callback'])
      .then(deleted => {

        expect(deleted).toEqual(['key2', 'callback'])

        return LocalStorage.default.getAll('globalParams')
      })
      .then(result => {

        expect(result).toEqual([
          {key: 'key1', value: 'value1', type: 'callback'},
          {key: 'key1', value: 'value1', type: 'partner'},
          {key: 'key2', value: 'value2', type: 'partner'}
        ])

        return LocalStorage.default.deleteItem('globalParams', ['key1', 'partner'])
      })
      .then(deleted => {

        expect(deleted).toEqual(['key1', 'partner'])

        return LocalStorage.default.getAll('globalParams')
      })
      .then(result => {

        expect(result).toEqual([
          {key: 'key1', value: 'value1', type: 'callback'},
          {key: 'key2', value: 'value2', type: 'partner'}
        ])

        return LocalStorage.default.deleteItem('globalParams', ['key5', 'callback'])
      })
      .then(deleted => {

        expect(deleted).toEqual(['key5', 'callback'])

        return LocalStorage.default.getAll('globalParams')
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
    QuickStorage.default.queue = [
      {timestamp: 1552701608300, url: '/url1'},
      {timestamp: 1552705208300, url: '/url2'},
      {timestamp: 1552911178981, url: '/url3'},
    ]

    expect.assertions(3)

    return LocalStorage.default.getAll('queue')
      .then(result => {

        expect(result).toEqual([
          {timestamp: 1552701608300, url: '/url1'},
          {timestamp: 1552705208300, url: '/url2'},
          {timestamp: 1552911178981, url: '/url3'}
        ])

        return LocalStorage.default.deleteBulk('queue', {upperBound: 1552705208300})
      })
      .then(deleted => {
        expect(deleted).toEqual([
          {timestamp: 1552701608300, url: '/url1'},
          {timestamp: 1552705208300, url: '/url2'},
        ])
      })
      .then(() => LocalStorage.default.getAll('queue'))
      .then(result => {
        expect(result).toEqual([
          {timestamp: 1552911178981, url: '/url3'}
        ])
      })

  })

  it ('deletes items in bulk by type from the globalParams store - with composite key', () => {

    // prepare some rows manually
    QuickStorage.default.globalParams = [
      {key: 'key4', value: 'value4', type: 'callback'},
      {key: 'key2', value: 'value2', type: 'callback'},
      {key: 'key2', value: 'value2', type: 'partner'},
      {key: 'key3', value: 'value3', type: 'callback'},
      {key: 'key1', value: 'value1', type: 'partner'},
      {key: 'key1', value: 'value1', type: 'callback'}
    ]

    expect.assertions(5)

    return LocalStorage.default.getAll('globalParams')
      .then(result => {
        expect(result).toEqual([
          {key: 'key1', value: 'value1', type: 'callback'},
          {key: 'key2', value: 'value2', type: 'callback'},
          {key: 'key3', value: 'value3', type: 'callback'},
          {key: 'key4', value: 'value4', type: 'callback'},
          {key: 'key1', value: 'value1', type: 'partner'},
          {key: 'key2', value: 'value2', type: 'partner'}
        ])

        return LocalStorage.default.deleteBulk('globalParams', 'partner')
      })
      .then(deleted => {
        expect(deleted).toEqual([
          {key: 'key1', value: 'value1', type: 'partner'},
          {key: 'key2', value: 'value2', type: 'partner'}
        ])

        return LocalStorage.default.getAll('globalParams')
      })
      .then(result => {
        expect(result).toEqual([
          {key: 'key1', value: 'value1', type: 'callback'},
          {key: 'key2', value: 'value2', type: 'callback'},
          {key: 'key3', value: 'value3', type: 'callback'},
          {key: 'key4', value: 'value4', type: 'callback'}
        ])

        return LocalStorage.default.deleteBulk('globalParams', 'callback')
      })
      .then(deleted => {
        expect(deleted).toEqual([
          {key: 'key1', value: 'value1', type: 'callback'},
          {key: 'key2', value: 'value2', type: 'callback'},
          {key: 'key3', value: 'value3', type: 'callback'},
          {key: 'key4', value: 'value4', type: 'callback'}
        ])

        return LocalStorage.default.getAll('globalParams')
      })
      .then(result => {
        expect(result).toEqual([])
      })

  })

  it('clears items from the queue store', () => {

    // prepare some rows manually
    QuickStorage.default.queue = [
      {timestamp: 1, url: '/url1'},
      {timestamp: 2, url: '/url2'}
    ]

    expect.assertions(2)

    return LocalStorage.default.getAll('queue')
      .then(result => {

        expect(result).toEqual([
          {timestamp: 1, url: '/url1'},
          {timestamp: 2, url: '/url2'}
        ])

        return LocalStorage.default.clear('queue')
      })
      .then(() => LocalStorage.default.getAll('queue'))
      .then(result => {
        expect(result).toEqual([])
      })

  })

  it('restores activityState record from the running memory when db gets destroyed', () => {

    let activityState = null

    return Identity.startActivityState()
      .then(() => {

        LocalStorage.default.destroy()
        localStorage.clear()

        activityState = ActivityState.default.current

        expect(activityState.uuid).toBeDefined()

        return LocalStorage.default.getFirst('activityState')
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

      return LocalStorage.default.addBulk('globalParams', [])
        .catch(error => {
          expect(error.name).toEqual('NoTargetDefined')
          expect(error.message).toEqual('No array provided to perform add bulk operation into globalParams store')

          return LocalStorage.default.addBulk('queue')
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

      return LocalStorage.default.addBulk('globalParams', globalParamsSet1)
        .then(result => {
          expect(result).toEqual([['bla', 'callback'], ['key1', 'callback'], ['eto', 'partner']])

          return LocalStorage.default.addBulk('globalParams', globalParamsSet2)
        })
        .then(result => {
          expect(result).toEqual([['key2', 'callback'], ['par', 'partner']])

          return LocalStorage.default.getAll('globalParams')
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

      return LocalStorage.default.addBulk('globalParams', globalParamsSet1)
        .then(result => {
          expect(result).toEqual([['bla', 'callback'], ['key1', 'callback'], ['eto', 'partner']])

          return LocalStorage.default.addBulk('globalParams', globalParamsSet2, true)
        })
        .then(result => {
          expect(result).toEqual([['key1', 'callback'], ['par', 'partner'], ['bla', 'partner']])

          return LocalStorage.default.getAll('globalParams')
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

    it('adds rows into globalParams store and throw error when adding existing key', () => {

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

      expect.assertions(3)

      return LocalStorage.default.addBulk('globalParams', globalParamsSet1)
        .then(result => {
          expect(result).toEqual([['bla', 'callback'], ['key1', 'callback'], ['eto', 'partner']])

          return LocalStorage.default.addBulk('globalParams', globalParamsSet2)
        })
        .catch(error => {
          expect(error.name).toEqual('ConstraintError')
          expect(error.message).toEqual('Items with key:type => key1:callback,eto:partner already exist')
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

      return LocalStorage.default.addBulk('globalParams', globalParamsSet)
        .then(() => Promise.all([
          LocalStorage.default.filterBy('globalParams', 'callback'),
          LocalStorage.default.filterBy('globalParams', 'partner')
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

})
