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
})
