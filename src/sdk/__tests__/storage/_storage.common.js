import * as SchemeMap from '../../storage/scheme-map'

export default function runSuite (Storage) {
  const _storeNames = SchemeMap.default.storeNames

  return () => {
    afterEach(() => {
      Storage.clear(_storeNames.queue)
      Storage.clear(_storeNames.activityState)
      Storage.clear(_storeNames.globalParams)
    })

    afterAll(() => {
      Storage.destroy()
      localStorage.clear()
    })

    it('returns rows from particular store', () => {

      // prepare some rows manually
      const queueSet = [
        {timestamp: 1, url: '/url1'},
        {timestamp: 2, url: '/url2'},
        {timestamp: 3, url: '/url3'}
      ]

      expect.assertions(4)

      return Storage.getAll('test')
        .catch(error => {

          expect(error.name).toEqual('NotFoundError')
          expect(error.message).toEqual('No objectStore named test in this database')

          return Storage.getAll(_storeNames.queue)
        })
        .then(result => {

          expect(result).toEqual([])

          return Storage.addBulk(_storeNames.queue, queueSet)
        })
        .then(() => Storage.getAll(_storeNames.queue))
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

      return Storage.getFirst(_storeNames.activityState)
        .then(result => {
          expect(result).toBeUndefined()
        })

    })

    it('returns empty array if no rows present', () => {

      expect.assertions(1)

      return Storage.getAll(_storeNames.queue)
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

      return Storage.addBulk(_storeNames.queue, queueSet)
        .then(() => Storage.getFirst(_storeNames.queue))
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

      return Storage.addBulk(_storeNames.activityState, activityStateSet)
        .then(() => Storage.getItem(_storeNames.activityState, 2))
        .then(result => {
          expect(result).toEqual({uuid: 2, lastActive: 12346})

          return Storage.getItem(_storeNames.activityState, 3)
        })
        .catch(error => {
          expect(error.name).toEqual('NotRecordFoundError')
          expect(error.message).toEqual('Requested record not found in activityState store')
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

      return Storage.addBulk(_storeNames.globalParams, globalParamsSet)
        .then(() => Storage.getItem(_storeNames.globalParams, ['key1', 'callback']))
        .then(result => {
          expect(result).toEqual({key: 'key1', value: 'cvalue1', type: 'callback'})

          return Storage.getItem(_storeNames.globalParams, ['key3', 'callback'])
        })
        .catch(error => {
          expect(error.name).toEqual('NotRecordFoundError')
          expect(error.message).toEqual('Requested record not found in globalParams store')
        })

    })

    it('adds items to the queue store', () => {

      expect.assertions(5)

      return Storage.addItem(_storeNames.queue, {timestamp: 1, url: '/url1'})
        .then(id => {

          expect(id).toEqual(1)

          return Storage.getAll(_storeNames.queue)
        })
        .then(result => {

          expect(result).toEqual([
            {timestamp: 1, url: '/url1'}
          ])

          return Storage.addItem(_storeNames.queue, {timestamp: 2, url: '/url2'})
        })
        .then(id => {

          expect(id).toEqual(2)

          return Storage.getAll(_storeNames.queue)
        })
        .then(result => {

          expect(result).toEqual([
            {timestamp: 1, url: '/url1'},
            {timestamp: 2, url: '/url2'}
          ])

          return Storage.addItem(_storeNames.queue, {timestamp: 2, url: '/url2'})
        })
        .catch(error => {
          expect(error.name).toBe('ConstraintError')
        })

    })

    it('adds items to the globalParams store - with composite key', () => {

      expect.assertions(7)

      return Storage.addItem(_storeNames.globalParams, {key: 'key1', value: 'value1', type: 'callback'})
        .then((id) => {

          expect(id).toEqual(['key1', 'callback'])

          return Storage.getAll(_storeNames.globalParams)
        })
        .then(result => {

          expect(result).toEqual([
            {key: 'key1', value: 'value1', type: 'callback'}
          ])

          return Storage.addItem(_storeNames.globalParams, {key: 'key2', value: 'value2', type: 'callback'})
        })
        .then(id => {

          expect(id).toEqual(['key2', 'callback'])

          return Storage.getAll(_storeNames.globalParams)
        })
        .then(result => {

          expect(result).toEqual([
            {key: 'key1', value: 'value1', type: 'callback'},
            {key: 'key2', value: 'value2', type: 'callback'}
          ])

          return Storage.addItem(_storeNames.globalParams, {key: 'key1', value: 'value1', type: 'partner'})
        })
        .then(id => {

          expect(id).toEqual(['key1', 'partner'])

          return Storage.getAll(_storeNames.globalParams)
        })
        .then(result => {

          expect(result).toEqual([
            {key: 'key1', value: 'value1', type: 'callback'},
            {key: 'key2', value: 'value2', type: 'callback'},
            {key: 'key1', value: 'value1', type: 'partner'}
          ])

          return Storage.addItem(_storeNames.globalParams, {key: 'key1', value: 'value1', type: 'callback'})
        })
        .catch(error => {
          expect(error.name).toBe('ConstraintError')
        })

    })

    it('updates items in the activityState store', () => {

      // prepare some rows manually
      const activityStateSet = [
        {uuid: 1, lastActive: 12345},
        {uuid: 2, lastActive: 12346}
      ]

      expect.assertions(8)

      return Storage.addBulk(_storeNames.activityState, activityStateSet)
        .then(() => Storage.updateItem(_storeNames.activityState, {uuid: 1, lastActive: 12347, attribution: {adid: 'something'}}))
        .then(update => {

          expect(update).toEqual(1)

          return Storage.getAll(_storeNames.activityState)
        })
        .then(result => {

          expect(result).toEqual([
            {uuid: 1, lastActive: 12347, attribution: {adid: 'something'}},
            {uuid: 2, lastActive: 12346}
          ])

          return Storage.updateItem(_storeNames.activityState, {uuid: 1, lastActive: 12348})
        })
        .then(update => {

          expect(update).toEqual(1)

          return Storage.getItem(_storeNames.activityState, 1)
        })
        .then(result => {

          expect(result).toEqual({uuid: 1, lastActive: 12348})

          return Storage.updateItem(_storeNames.activityState, {uuid: 2, lastActive: 12349, attribution: {adid: 'something'}})
        })
        .then(update => {

          expect(update).toEqual(2)

          return Storage.getAll(_storeNames.activityState)
        })
        .then(result => {

          expect(result).toEqual([
            {uuid: 1, lastActive: 12348},
            {uuid: 2, lastActive: 12349, attribution: {adid: 'something'}}
          ])

          return Storage.updateItem(_storeNames.activityState, {uuid: 3, lastActive: 12350})
        })
        .then(update => {

          expect(update).toEqual(3)

          return Storage.getAll(_storeNames.activityState)
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

      return Storage.addBulk(_storeNames.globalParams, globalParamsSet)
        .then(() => Storage.updateItem(_storeNames.globalParams, {key: 'key1', value: 'updated value1', type: 'callback'}))
        .then(update => {

          expect(update).toEqual(['key1', 'callback'])

          return Storage.getAll(_storeNames.globalParams)
        })
        .then(result => {

          expect(result).toEqual([
            {key: 'key1', value: 'updated value1', type: 'callback'},
            {key: 'key2', value: 'value2', type: 'callback'},
            {key: 'key1', value: 'value1', type: 'partner'}
          ])

          return Storage.updateItem(_storeNames.globalParams, {key: 'key2', value: 'updated value2', type: 'callback'})
        })
        .then(update => {

          expect(update).toEqual(['key2', 'callback'])

          return Storage.getAll(_storeNames.globalParams)
        })
        .then(result => {

          expect(result).toEqual([
            {key: 'key1', value: 'updated value1', type: 'callback'},
            {key: 'key2', value: 'updated value2', type: 'callback'},
            {key: 'key1', value: 'value1', type: 'partner'}
          ])

          return Storage.updateItem(_storeNames.globalParams, {key: 'key2', value: 'value2', type: 'partner'})
        })
        .then(update => {

          expect(update).toEqual(['key2', 'partner'])

          return Storage.getAll(_storeNames.globalParams)
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

      return Storage.addBulk(_storeNames.queue, queueSet)
        .then(() => Storage.getAll(_storeNames.queue))
        .then(result => {

          expect(result).toEqual([
            {timestamp: 1, url: '/url1'},
            {timestamp: 2, url: '/url2'},
            {timestamp: 3, url: '/url3'}
          ])

          return Storage.deleteItem(_storeNames.queue, 2)
        })
        .then(deleted => {

          expect(deleted).toEqual(2)

          return Storage.getAll(_storeNames.queue)
        })
        .then(result => {

          expect(result).toEqual([
            {timestamp: 1, url: '/url1'},
            {timestamp: 3, url: '/url3'}
          ])

          return Storage.deleteItem(_storeNames.queue, 1)
        })
        .then(deleted => {

          expect(deleted).toEqual(1)

          return Storage.getAll(_storeNames.queue)
        })
        .then(result => {

          expect(result).toEqual([
            {timestamp: 3, url: '/url3'}
          ])

          return Storage.deleteItem(_storeNames.queue, 5)
        })
        .then(deleted => {

          expect(deleted).toEqual(5)

          return Storage.getAll(_storeNames.queue)
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

      return Storage.addBulk(_storeNames.globalParams, globalParamsSet)
        .then(() => Storage.deleteItem(_storeNames.globalParams, ['key2', 'callback']))
        .then(deleted => {

          expect(deleted).toEqual(['key2', 'callback'])

          return Storage.getAll(_storeNames.globalParams)
        })
        .then(result => {

          expect(result).toEqual([
            {key: 'key1', value: 'value1', type: 'callback'},
            {key: 'key1', value: 'value1', type: 'partner'},
            {key: 'key2', value: 'value2', type: 'partner'}
          ])

          return Storage.deleteItem(_storeNames.globalParams, ['key1', 'partner'])
        })
        .then(deleted => {

          expect(deleted).toEqual(['key1', 'partner'])

          return Storage.getAll(_storeNames.globalParams)
        })
        .then(result => {

          expect(result).toEqual([
            {key: 'key1', value: 'value1', type: 'callback'},
            {key: 'key2', value: 'value2', type: 'partner'}
          ])

          return Storage.deleteItem(_storeNames.globalParams, ['key5', 'callback'])
        })
        .then(deleted => {

          expect(deleted).toEqual(['key5', 'callback'])

          return Storage.getAll(_storeNames.globalParams)
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

      return Storage.addBulk(_storeNames.queue, queueSet)
        .then(() => Storage.getAll(_storeNames.queue))
        .then(result => {

          expect(result).toEqual([
            {timestamp: 1552701608300, url: '/url1'},
            {timestamp: 1552705208300, url: '/url2'},
            {timestamp: 1552911178981, url: '/url3'}
          ])

          return Storage.deleteBulk(_storeNames.queue, {upperBound: 1552705208300})
        })
        .then(deleted => {
          expect(deleted).toEqual([
            {timestamp: 1552701608300, url: '/url1'},
            {timestamp: 1552705208300, url: '/url2'},
          ])
        })
        .then(() => Storage.getAll(_storeNames.queue))
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

      return Storage.addBulk(_storeNames.globalParams, globalParamsSet)
        .then(() => Storage.getAll(_storeNames.globalParams))
        .then(result => {
          expect(result).toEqual([
            {key: 'key1', value: 'value1', type: 'callback'},
            {key: 'key2', value: 'value2', type: 'callback'},
            {key: 'key3', value: 'value3', type: 'callback'},
            {key: 'key4', value: 'value4', type: 'callback'},
            {key: 'key1', value: 'value1', type: 'partner'},
            {key: 'key2', value: 'value2', type: 'partner'}
          ])

          return Storage.deleteBulk(_storeNames.globalParams, 'partner')
        })
        .then(deleted => {
          expect(deleted).toEqual([
            {key: 'key1', value: 'value1', type: 'partner'},
            {key: 'key2', value: 'value2', type: 'partner'}
          ])

          return Storage.getAll(_storeNames.globalParams)
        })
        .then(result => {
          expect(result).toEqual([
            {key: 'key1', value: 'value1', type: 'callback'},
            {key: 'key2', value: 'value2', type: 'callback'},
            {key: 'key3', value: 'value3', type: 'callback'},
            {key: 'key4', value: 'value4', type: 'callback'}
          ])

          return Storage.deleteBulk(_storeNames.globalParams, 'callback')
        })
        .then(deleted => {
          expect(deleted).toEqual([
            {key: 'key1', value: 'value1', type: 'callback'},
            {key: 'key2', value: 'value2', type: 'callback'},
            {key: 'key3', value: 'value3', type: 'callback'},
            {key: 'key4', value: 'value4', type: 'callback'}
          ])

          return Storage.getAll(_storeNames.globalParams)
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

      return Storage.addBulk(_storeNames.queue, queueSet)
        .then(() => Storage.getAll(_storeNames.queue))
        .then(result => {

          expect(result).toEqual([
            {timestamp: 1, url: '/url1'},
            {timestamp: 2, url: '/url2'}
          ])

          return Storage.clear(_storeNames.queue)
        })
        .then(() => Storage.getAll(_storeNames.queue))
        .then(result => {
          expect(result).toEqual([])
        })

    })

    describe('performing add bulk operation', () => {

      it('fails when array is not provided', () => {

        expect.assertions(4)

        return Storage.addBulk(_storeNames.globalParams, [])
          .catch(error => {
            expect(error.name).toEqual('NoTargetDefined')
            expect(error.message).toEqual('No array provided to perform add bulk operation into globalParams store')

            return Storage.addBulk(_storeNames.queue)
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

        return Storage.addBulk(_storeNames.globalParams, globalParamsSet1)
          .then(result => {
            expect(result).toEqual([['bla', 'callback'], ['key1', 'callback'], ['eto', 'partner']])

            return Storage.addBulk(_storeNames.globalParams, globalParamsSet2)
          })
          .then(result => {
            expect(result).toEqual([['key2', 'callback'], ['par', 'partner']])

            return Storage.getAll(_storeNames.globalParams)
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

        return Storage.addBulk(_storeNames.globalParams, globalParamsSet1)
          .then(result => {
            expect(result).toEqual([['bla', 'callback'], ['key1', 'callback'], ['eto', 'partner']])

            return Storage.addBulk(_storeNames.globalParams, globalParamsSet2, true)
          })
          .then(result => {
            expect(result).toEqual([['key1', 'callback'], ['par', 'partner'], ['bla', 'partner']])

            return Storage.getAll(_storeNames.globalParams)
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

        return Storage.addBulk(_storeNames.globalParams, globalParamsSet1)
          .then(result => {
            expect(result).toEqual([['bla', 'callback'], ['key1', 'callback'], ['eto', 'partner']])

            return Storage.addBulk(_storeNames.globalParams, globalParamsSet2)
          })
          .catch(error => {
            expect(error.name).toEqual('ConstraintError')
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

        return Storage.addBulk(_storeNames.globalParams, globalParamsSet)
          .then(() => Promise.all([
            Storage.filterBy(_storeNames.globalParams, 'callback'),
            Storage.filterBy(_storeNames.globalParams, 'partner')
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
  }
}

