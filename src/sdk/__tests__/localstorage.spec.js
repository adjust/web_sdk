/* eslint-disable */
import * as LocalStorage from '../localstorage'

describe('LocalStorage usage', () => {

  afterEach(() => {
    localStorage.clear()
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
    window.localStorage.setItem(`${__ADJUST__NAMESPACE}.queue`, JSON.stringify([
      {timestamp: 1, url: '/url1'},
      {timestamp: 2, url: '/url2'},
      {timestamp: 3, url: '/url3'}
    ]))

    LocalStorage.default.getAll('queue')
      .then(result => {
        expect(result).toEqual([
          {timestamp: 1, url: '/url1'},
          {timestamp: 2, url: '/url2'},
          {timestamp: 3, url: '/url3'}
        ])
      })

  })

  it('returns first row from particular store', () => {

    // prepare some rows manually
    window.localStorage.setItem(`${__ADJUST__NAMESPACE}.queue`, JSON.stringify([
      {timestamp: 1552701608300, url: '/url1'},
      {timestamp: 1552705208300, url: '/url2'},
      {timestamp: 1552911178981, url: '/url3'},
    ]))

    expect.assertions(1)

    return LocalStorage.default.getFirst('queue')
      .then(result => {
        expect(result).toEqual({timestamp: 1552701608300, url: '/url1'})
      })

  })

  it('gets item from the user store', () => {

    // prepare some rows manually
    window.localStorage.setItem(`${__ADJUST__NAMESPACE}.user`, JSON.stringify([
      {uuid: 1, lastActive: 12345},
      {uuid: 2, lastActive: 12346}
    ]))

    expect.assertions(3)

    return LocalStorage.default.getItem('user', 2)
      .then(result => {
        expect(result).toEqual({uuid: 2, lastActive: 12346})

        return LocalStorage.default.getItem('user', 3)
      })
      .catch(error => {
        expect(error.name).toEqual('NotFoundError')
        expect(error.message).toEqual('No record found with uuid 3 in user store')
      })

  })

  it('adds items to the queue store', () => {

    expect.assertions(5)

    return LocalStorage.default.addItem('queue', {timestamp: 1, url: '/url1'})
      .then(() => LocalStorage.default.getAll('queue'))
      .then(result => {

        expect(result).toEqual([
          {timestamp: 1, url: '/url1'}
        ])

        return LocalStorage.default.addItem('queue', {timestamp: 2, url: '/url2'})
      })
      .then(() => LocalStorage.default.getAll('queue'))
      .then(result => {

        expect(result).toEqual([
          {timestamp: 1, url: '/url1'},
          {timestamp: 2, url: '/url2'}
        ])

        return LocalStorage.default.addItem('queue', {timestamp: 3, url: '/url3'})
      })
      .then(() => LocalStorage.default.getAll('queue'))
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
        expect(error.message).toBe('Item with timestamp 2 already exists')
      })

  })

  it('updates items to the queue store', () => {

    // prepare some rows manually
    window.localStorage.setItem(`${__ADJUST__NAMESPACE}.user`, JSON.stringify([
      {uuid: 1, lastActive: 12345},
      {uuid: 2, lastActive: 12346}
    ]))

    expect.assertions(3)

    return LocalStorage.default.updateItem('user', {uuid: 1, lastActive: 12347, attribution: {adid: 'something'}})
      .then(() => LocalStorage.default.getAll('user'))
      .then(result => {

        expect(result).toEqual([
          {uuid: 1, lastActive: 12347, attribution: {adid: 'something'}},
          {uuid: 2, lastActive: 12346}
        ])

        return LocalStorage.default.updateItem('user', {uuid: 2, lastActive: 12348})
      })
      .then(() => LocalStorage.default.getAll('user'))
      .then(result => {

        expect(result).toEqual([
          {uuid: 1, lastActive: 12347, attribution: {adid: 'something'}},
          {uuid: 2, lastActive: 12348}
        ])

        return LocalStorage.default.updateItem('user', {uuid: 3, lastActive: 12349})
      })
      .then(() => LocalStorage.default.getAll('user'))
      .then(result => {

        expect(result).toEqual([
          {uuid: 1, lastActive: 12347, attribution: {adid: 'something'}},
          {uuid: 2, lastActive: 12348},
          {uuid: 3, lastActive: 12349}
        ])
      })

  })

  it('deletes item by item in the queue store', () => {

    // prepare some rows manually
    window.localStorage.setItem(`${__ADJUST__NAMESPACE}.queue`, JSON.stringify([
      {timestamp: 1, url: '/url1'},
      {timestamp: 2, url: '/url2'},
      {timestamp: 3, url: '/url3'},
      {timestamp: 4, url: '/url4'}
    ]))

    expect.assertions(3)

    return LocalStorage.default.deleteItem('queue', 2)
      .then(() => LocalStorage.default.getAll('queue'))
      .then(result => {

        expect(result).toEqual([
          {timestamp: 1, url: '/url1'},
          {timestamp: 3, url: '/url3'},
          {timestamp: 4, url: '/url4'}
        ])

        return LocalStorage.default.deleteItem('queue', 4)
      })
      .then(() => LocalStorage.default.getAll('queue'))
      .then(result => {

        expect(result).toEqual([
          {timestamp: 1, url: '/url1'},
          {timestamp: 3, url: '/url3'}
        ])

        return LocalStorage.default.deleteItem('queue', 5)
      })
      .then(() => LocalStorage.default.getAll('queue'))
      .then(result => {

        expect(result).toEqual([
          {timestamp: 1, url: '/url1'},
          {timestamp: 3, url: '/url3'}
        ])
      })

  })

  it ('deletes items until certain bound from the queue store', () => {

    // prepare some rows manually
    window.localStorage.setItem(`${__ADJUST__NAMESPACE}.queue`, JSON.stringify([
      {timestamp: 1552701608300, url: '/url1'},
      {timestamp: 1552705208300, url: '/url2'},
      {timestamp: 1552911178981, url: '/url3'},
    ]))

    expect.assertions(3)

    return LocalStorage.default.getAll('queue')
      .then(result => {

        expect(result).toEqual([
          {timestamp: 1552701608300, url: '/url1'},
          {timestamp: 1552705208300, url: '/url2'},
          {timestamp: 1552911178981, url: '/url3'}
        ])

        return LocalStorage.default.deleteBulk('queue', 1552705208300)
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

  it('clears items from the queue store', () => {

    // prepare some rows manually
    window.localStorage.setItem(`${__ADJUST__NAMESPACE}.queue`, JSON.stringify([
      {timestamp: 1, url: '/url1'},
      {timestamp: 2, url: '/url2'}
    ]))

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

})
