import { parseJson } from '../../smart-banner/utilities'

describe('Utilities tests', () => {
  describe('parseJson', () => {

    it('returns parsed object for valid JSON string', () => {
      const expectedObj = {key: 'value'}
      const stringToParse = '{"key": "value"}'

      expect(parseJson(stringToParse)).toEqual(expectedObj)
    })

    it('returns null for invalid JSON string', () => {
      const stringToParse = '{"key": "value}'

      expect(parseJson(stringToParse)).toBeNull()
    })

    it('returns null for no parameter or empty one passed', () => {
      expect(parseJson(null)).toBeNull()
      expect(parseJson(undefined)).toBeNull()
      expect(parseJson('')).toBeNull()
    })
  })
})
