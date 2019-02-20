/* eslint-disable */
import {buildList, isEmpty, isObject} from '../utilities'

describe('test for utility methods', () => {
  describe('tests for buildList', () => {
    it('builds human readable list', () => {

      const array1 = ['one', 'two', 'three']
      const array2 = ['something', 'very', 'nice', 'boring']

      expect(buildList(array1)).toBe('one, two and three')
      expect(buildList(array2)).toBe('something, very, nice and boring')

    })

    it('builds list with two elements', () => {

      const array = ['one', 'two']

      expect(buildList(array)).toBe('one and two')

    })

    it('returns single element when only one', () => {

      const array = ['one']

      expect(buildList(array)).toBe('one')

    })

    it('returns empty string when list is empty', () => {

      const array = []

      expect(buildList(array)).toBe('')

    })
  })

  describe('tests for isEmpty', () => {
    it('returns true if object is empty', () => {
      expect(isEmpty({})).toBeTruthy()
    })

    it('returns false if object is not empty', () => {
      expect(isEmpty({something: 'exists'})).toBeFalsy()
    })
  })

  describe('tests for isObject', () => {
    it('returns false if not object', () => {
      expect(isObject('string')).toBeFalsy()
      expect(isObject(1000)).toBeFalsy()
      expect(isObject(null)).toBeFalsy()
    })

    it('returns true if it is object', () => {
      expect(isObject({})).toBeTruthy()
      expect(isObject({la: 'lala'})).toBeTruthy()
    })
  })

})
