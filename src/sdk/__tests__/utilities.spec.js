/* eslint-disable */
import * as Utilities from '../utilities'

describe('test for utility methods', () => {
  describe('tests for buildList', () => {
    it('builds human readable list', () => {

      const array1 = ['one', 'two', 'three']
      const array2 = ['something', 'very', 'nice', 'boring']

      expect(Utilities.buildList(array1)).toBe('one, two and three')
      expect(Utilities.buildList(array2)).toBe('something, very, nice and boring')

    })

    it('builds list with two elements', () => {

      const array = ['one', 'two']

      expect(Utilities.buildList(array)).toBe('one and two')

    })

    it('returns single element when only one', () => {

      const array = ['one']

      expect(Utilities.buildList(array)).toBe('one')

    })

    it('returns empty string when list is empty', () => {

      const array = []

      expect(Utilities.buildList(array)).toBe('')

    })
  })

  describe('tests for isEmpty', () => {
    it('returns true if object is empty', () => {
      expect(Utilities.isEmpty({})).toBeTruthy()
    })

    it('returns false if object is not empty', () => {
      expect(Utilities.isEmpty({something: 'exists'})).toBeFalsy()
    })
  })

  describe('tests for isObject', () => {
    it('returns false if not object', () => {
      expect(Utilities.isObject('string')).toBeFalsy()
      expect(Utilities.isObject(1000)).toBeFalsy()
      expect(Utilities.isObject(null)).toBeFalsy()
    })

    it('returns true if it is object', () => {
      expect(Utilities.isObject({})).toBeTruthy()
      expect(Utilities.isObject({la: 'lala'})).toBeTruthy()
    })
  })

  describe('tests for getTimestamp', () => {

    it('formats when negative timezone offset', () => {

      let date = new Date(2018, 3, 15, 13, 8, 30)

      jest.spyOn(date, 'getTimezoneOffset').mockReturnValue(-330)

      expect(Utilities.getTimestamp(date)).toEqual('2018-04-15T13:08:30.000Z+0530')

    })

    it('formats when positive timezone offset', () => {

      let date = new Date(2017, 10, 6, 9, 40, 4, 45)

      jest.spyOn(date, 'getTimezoneOffset').mockReturnValue(60)

      expect(Utilities.getTimestamp(date)).toEqual('2017-11-06T09:40:04.045Z-0100')

    })

    it('formats when no timezone offset', () => {

      let date = new Date(2018, 1, 5, 12, 9, 0, 301)

      jest.spyOn(date, 'getTimezoneOffset').mockReturnValue(0)

      expect(Utilities.getTimestamp(date)).toEqual('2018-02-05T12:09:00.301Z+0000')

    })


    it('formats when midnight', () => {

      let date = new Date(2018, 5, 25)

      jest.spyOn(date, 'getTimezoneOffset').mockReturnValue(0)

      expect(Utilities.getTimestamp(date)).toEqual('2018-06-25T00:00:00.000Z+0000')

    })

    it('calculates the difference between two dates', () => {

      let date1 = '2019-01-01T09:00:01.111Z+0100'
      let date2 = '2019-02-15T15:10:12.100Z+0100'

      expect(Utilities.timePassed(date1, date2)).toEqual(46)
      expect(Utilities.timePassed(date1)).toEqual(0)

    })

  })

})
