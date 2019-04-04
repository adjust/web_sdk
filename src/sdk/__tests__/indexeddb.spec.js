/* eslint-disable */
import fakeIDB from 'fake-indexeddb'
import * as IDBKeyRange from 'fake-indexeddb/lib/FDBKeyRange'
import * as IndexedDB from '../indexeddb'
import * as Identity from '../identity'
import * as ActivityState from '../activity-state'

describe('IndexedDB usage', () => {

  window.indexedDB = fakeIDB
  window.IDBKeyRange = IDBKeyRange

  afterEach(() => {
    IndexedDB.default.clear('queue')
    IndexedDB.default.clear('activityState')
  })

  afterAll(() => {
    IndexedDB.default.destroy()
  })

  it('checks if indexedDB is supported', () => {

    let supported = IndexedDB.default.isSupported()

    expect(supported).toBeTruthy()
    expect(() => {
      IndexedDB.default.isSupported(true)
    }).not.toThrow()

    delete window.indexedDB

    supported = IndexedDB.default.isSupported()

    expect(supported).toBeFalsy()
    expect(() => {
      IndexedDB.default.isSupported(true)
    }).toThrow(new Error('IndexedDB is not supported in this browser'))

    window.indexedDB = fakeIDB

  })

  it('returns rows from particular store', () => {

    expect.assertions(4)

    return IndexedDB.default.getAll('test')
      .catch(error => {

        expect(error.name).toEqual('NotFoundError')
        expect(error.message).toEqual('No objectStore named test in this database')

        return IndexedDB.default.getAll('queue')
      })
      .then(result => {

        expect(result).toEqual([])

        return IndexedDB.default.addItem('queue', {timestamp: 1, url: '/url1'})
      })
      .then(() => IndexedDB.default.addItem('queue', {timestamp: 2, url: '/url2'}))
      .then(() => IndexedDB.default.addItem('queue', {timestamp: 3, url: '/url3'}))
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

    expect.assertions(1)

    return IndexedDB.default.addItem('queue', {timestamp: 1552701608300, url: '/url1'})
      .then(() => IndexedDB.default.addItem('queue', {timestamp: 1552705208300, url: '/url2'}))
      .then(() => IndexedDB.default.addItem('queue', {timestamp: 1552911178981, url: '/url3'}))
      .then(() => IndexedDB.default.getFirst('queue'))
      .then(result => {
        expect(result).toEqual({timestamp: 1552701608300, url: '/url1'})
      })

  })

  it('gets item from the activityState store', () => {

    expect.assertions(3)

    return IndexedDB.default.addItem('activityState', {uuid: 1, lastActive: 12345})
      .then(() => IndexedDB.default.addItem('activityState', {uuid: 2, lastActive: 12346}))
      .then(() => IndexedDB.default.getItem('activityState', 2))
      .then(result => {
        expect(result).toEqual({uuid: 2, lastActive: 12346})

        return IndexedDB.default.getItem('activityState', 3)
      })
      .catch(error => {
        expect(error.name).toEqual('NotFoundError')
        expect(error.message).toEqual('No record found with uuid 3 in activityState store')
      })

  })

  it('adds items to the queue store', () => {

    expect.assertions(5)

    return IndexedDB.default.addItem('queue', {timestamp: 1, url: '/url1'}, true)
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

  it('updates items in the activityState store', () => {

    expect.assertions(8)

    return IndexedDB.default.addItem('activityState', {uuid: 1, lastActive: 12345})
      .then(() => IndexedDB.default.addItem('activityState', {uuid: 2, lastActive: 12346}))
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

  it('deletes item by item in the queue store', () => {

    expect.assertions(7)

    return IndexedDB.default.addItem('queue', {timestamp: 1, url: '/url1'})
      .then(() => IndexedDB.default.addItem('queue', {timestamp: 2, url: '/url2'}))
      .then(() => IndexedDB.default.addItem('queue', {timestamp: 3, url: '/url3'}))
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

  it ('deletes items until certain bound from the queue store', () => {

    expect.assertions(3)

    return IndexedDB.default.addItem('queue', {timestamp: 1552701608300, url: '/url1'})
      .then(() => IndexedDB.default.addItem('queue', {timestamp: 1552705208300, url: '/url2'}))
      .then(() => IndexedDB.default.addItem('queue', {timestamp: 1552911178981, url: '/url3'}))
      .then(() => IndexedDB.default.getAll('queue'))
      .then(result => {

        expect(result).toEqual([
          {timestamp: 1552701608300, url: '/url1'},
          {timestamp: 1552705208300, url: '/url2'},
          {timestamp: 1552911178981, url: '/url3'}
        ])

        return IndexedDB.default.deleteBulk('queue', 1552705208300)
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

  it('clears items from the queue store', () => {

    expect.assertions(2)

    return IndexedDB.default.addItem('queue', {timestamp: 1, url: '/url1'})
      .then(() => IndexedDB.default.addItem('queue', {timestamp: 2, url: '/url2'}))
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

    return Identity.startActivityState()
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

})
