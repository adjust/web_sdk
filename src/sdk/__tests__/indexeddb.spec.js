/* eslint-disable */
import fakeIDB from 'fake-indexeddb'
import * as IDBKeyRange from 'fake-indexeddb/lib/FDBKeyRange'
import * as IndexedDB from '../indexeddb'

describe('IndexedDB usage', () => {

  window.indexedDB = fakeIDB
  window.IDBKeyRange = IDBKeyRange

  afterEach(() => {
    IndexedDB.default.clear('queue')
    IndexedDB.default.clear('user')
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
      .then(() => {
        return IndexedDB.default.addItem('queue', {timestamp: 2, url: '/url2'})
      })
      .then(() => {
        return IndexedDB.default.addItem('queue', {timestamp: 3, url: '/url3'})
      })
      .then(() => {
        return IndexedDB.default.getAll('queue')
      })
      .then(result => {
        expect(result).toEqual([
          {timestamp: 1, url: '/url1'},
          {timestamp: 2, url: '/url2'},
          {timestamp: 3, url: '/url3'}
        ])
      })
  })

  it('returns first row from particular store', () => {

    expect.assertions(1)

    return IndexedDB.default.addItem('queue', {timestamp: 1552701608300, url: '/url1'})
      .then(() => {
        return IndexedDB.default.addItem('queue', {timestamp: 1552705208300, url: '/url2'})
      })
      .then(() => {
        return IndexedDB.default.addItem('queue', {timestamp: 1552911178981, url: '/url3'})
      })
      .then(() => {
        return IndexedDB.default.getFirst('queue')
      })
      .then(result => {
        expect(result).toEqual({timestamp: 1552701608300, url: '/url1'})
      })

  })

  it('gets item from the user store', () => {

    expect.assertions(3)

    return IndexedDB.default.addItem('user', {uuid: 1, lastActive: 12345})
      .then(() => IndexedDB.default.addItem('user', {uuid: 2, lastActive: 12346}))
      .then(() => IndexedDB.default.getItem('user', 2))
      .then(result => {
        expect(result).toEqual({uuid: 2, lastActive: 12346})

        return IndexedDB.default.getItem('user', 3)
      })
      .catch(error => {
        expect(error.name).toEqual('NotFoundError')
        expect(error.message).toEqual('No record found with uuid 3 in user store')
      })

  })

  it('adds items to the queue store', () => {

    expect.assertions(3)

    return IndexedDB.default.addItem('queue', {timestamp: 1, url: '/url1'}, true)
      .then(() => IndexedDB.default.getAll('queue'))
      .then(result => {

        expect(result).toEqual([
          {timestamp: 1, url: '/url1'}
        ])

        return IndexedDB.default.addItem('queue', {timestamp: 2, url: '/url2'})
      })
      .then(() => IndexedDB.default.getAll('queue'))
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

  it('updates items in the user store', () => {

    expect.assertions(3)

    return IndexedDB.default.addItem('user', {uuid: 1, lastActive: 12345})
      .then(() => {
        return IndexedDB.default.addItem('user', {uuid: 2, lastActive: 12346})
      })
      .then(() => {
        return IndexedDB.default.updateItem('user', {uuid: 1, lastActive: 12347, attribution: {adid: 'something'}})
      })
      .then(() => IndexedDB.default.getAll('user'))
      .then(result => {

        expect(result).toEqual([
          {uuid: 1, lastActive: 12347, attribution: {adid: 'something'}},
          {uuid: 2, lastActive: 12346}
        ])

        return IndexedDB.default.updateItem('user', {uuid: 2, lastActive: 12348})
      })
      .then(() => IndexedDB.default.getAll('user'))
      .then(result => {

        expect(result).toEqual([
          {uuid: 1, lastActive: 12347, attribution: {adid: 'something'}},
          {uuid: 2, lastActive: 12348}
        ])

        return IndexedDB.default.updateItem('user', {uuid: 3, lastActive: 12349})
      })
      .then(() => IndexedDB.default.getAll('user'))
      .then(result => {

        expect(result).toEqual([
          {uuid: 1, lastActive: 12347, attribution: {adid: 'something'}},
          {uuid: 2, lastActive: 12348},
          {uuid: 3, lastActive: 12349}
        ])
      })

  })

  it('deletes item by item in the queue store', () => {

    expect.assertions(4)

    return IndexedDB.default.addItem('queue', {timestamp: 1, url: '/url1'})
      .then(() => {
        return IndexedDB.default.addItem('queue', {timestamp: 2, url: '/url2'})
      })
      .then(() => {
        return IndexedDB.default.addItem('queue', {timestamp: 3, url: '/url3'})
      })
      .then(() => IndexedDB.default.getAll('queue'))
      .then(result => {

        expect(result).toEqual([
          {timestamp: 1, url: '/url1'},
          {timestamp: 2, url: '/url2'},
          {timestamp: 3, url: '/url3'}
        ])

        return IndexedDB.default.deleteItem('queue', 2)
      })
      .then(() => IndexedDB.default.getAll('queue'))
      .then(result => {

        expect(result).toEqual([
          {timestamp: 1, url: '/url1'},
          {timestamp: 3, url: '/url3'}
        ])

        return IndexedDB.default.deleteItem('queue', 1)
      })
      .then(() => IndexedDB.default.getAll('queue'))
      .then(result => {

        expect(result).toEqual([
          {timestamp: 3, url: '/url3'}
        ])

        return IndexedDB.default.deleteItem('queue', 5)
      })
      .then(() => IndexedDB.default.getAll('queue'))
      .then(result => {

        expect(result).toEqual([
          {timestamp: 3, url: '/url3'}
        ])
      })

  })

  it ('deletes items until certain bound from the queue store', () => {

    expect.assertions(3)

    return IndexedDB.default.addItem('queue', {timestamp: 1552701608300, url: '/url1'})
      .then(() => {
        return IndexedDB.default.addItem('queue', {timestamp: 1552705208300, url: '/url2'})
      })
      .then(() => {
        return IndexedDB.default.addItem('queue', {timestamp: 1552911178981, url: '/url3'})
      })
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
      .then(() => {
        return IndexedDB.default.addItem('queue', {timestamp: 2, url: '/url2'})
      })
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

})
