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

  describe('tests for isValidJSON', () => {
    it('returns false if not valid json', () => {
      expect(Utilities.isValidJson('some string')).toBeFalsy()
      expect(Utilities.isValidJson('{bla:}')).toBeFalsy()
      expect(Utilities.isValidJson('{bla:"test"}')).toBeFalsy()
      expect(Utilities.isValidJson(null)).toBeFalsy()
      expect(Utilities.isValidJson('')).toBeFalsy()
      expect(Utilities.isValidJson(123)).toBeFalsy()
    })
    it('returns true if valid json', () => {
      expect(Utilities.isValidJson('{"bla":"test"}')).toBeTruthy()
      expect(Utilities.isValidJson('{"bla":"test", "bla2":{"test": "bla"}}')).toBeTruthy()
      expect(Utilities.isValidJson('{}')).toBeTruthy()
    })
  })

  describe('test for findIndex', () => {
    it('returns an index of an element if found', () => {
      expect(Utilities.findIndex([{
        id: 1, text: 'bla'
      }, {
        id: 2, text: 'smor'
      }, {
        id: 3, text: 'trt'
      }], 'id', 2)).toEqual(1)
    })

    it('returns -1 if not found', () => {
      expect(Utilities.findIndex([{
        id: 1, text: 'bla'
      }, {
        id: 2, text: 'smor'
      }, {
        id: 3, text: 'trt'
      }], 'id', 4)).toEqual(-1)
    })
  })

  describe('test for extend', () => {
    it('extends existing object', () => {

      let obj = {name: 'something', year: 2018}

      Utilities.extend(obj, {test: 'bla'})

      expect(obj).toEqual({name: 'something', year: 2018, test: 'bla'})

      Utilities.extend(obj, {year: 2019})

      expect(obj).toEqual({name: 'something', year: 2019, test: 'bla'})
    })

    it('clones from another object', () => {

      let obj1 = {name: 'something', year: 2018}
      let obj2 = Utilities.extend({test: 'bla'}, obj1)
      let obj3 = Utilities.extend({}, obj2, {year: 2019})

      expect(obj1).toEqual({name: 'something', year: 2018})
      expect(obj2).toEqual({test: 'bla', name: 'something', year: 2018})
      expect(obj3).toEqual({test: 'bla', name: 'something', year: 2019})
    })
  })
})
