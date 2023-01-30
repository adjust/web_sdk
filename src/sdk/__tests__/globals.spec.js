describe('test global constants', () => {
  describe('test default values', () => {
    jest.isolateModules(() => {
      global.__ADJUST__NAMESPACE = undefined
      global.__ADJUST__SDK_VERSION = undefined
      const Globals = require('../globals')

      it('falls back to default values', () => {
        expect(Globals.default.namespace).toBe('adjust-sdk')
        expect(Globals.default.version).toBe('5.0.0')
      })
    })
  })

  describe('test globally set values', () => {
    jest.isolateModules(() => {
      global.__ADJUST__NAMESPACE = 'adjust-web-sdk'
      global.__ADJUST__SDK_VERSION = '6.0.0'
      const Globals = require('../globals')

      it('sets global values', () => {
        expect(Globals.default.namespace).toBe('adjust-web-sdk')
        expect(Globals.default.version).toBe('6.0.0')
      })
    })
  })
})
