import * as Listeners from '../listeners'

describe('test global event listeners and properties', () => {
  afterAll(() => {
    jest.restoreAllMocks()
  })

  describe('test internet connection status', () => {

    beforeAll(() => {
      Listeners.register()

      jest.spyOn(Listeners, 'on')
      jest.spyOn(Listeners, 'off')
    })

    it('bind to online and offline events', () => {

      expect(Listeners.isConnected()).toBeTruthy()

      global.window.dispatchEvent(new Event('offline'))

      expect(Listeners.isConnected()).toBeFalsy()

      global.window.dispatchEvent(new Event('online'))

      expect(Listeners.isConnected()).toBeTruthy()
    })

    it('unbind from online and offline events', () => {

      expect(Listeners.isConnected()).toBeTruthy()

      global.window.dispatchEvent(new Event('offline'))

      expect(Listeners.isConnected()).toBeFalsy()

      Listeners.destroy()

      global.window.dispatchEvent(new Event('online'))

      expect(Listeners.isConnected()).toBeFalsy()
    })
  })

  describe('test global event listeners', () => {
    const clickCallback = jest.fn()
    const originalAddEventListener = global.document.addEventListener
    const originalRemoveEventListener = global.document.removeEventListener
    let addEventListenerSpy
    let removeEventListenerSpy

    beforeAll(() => {
      addEventListenerSpy = jest.spyOn(global.document, 'addEventListener')
      removeEventListenerSpy = jest.spyOn(global.document, 'removeEventListener')
    })

    beforeEach(() => {
      jest.clearAllMocks()
    })

    afterAll(() => {
      global.document.addEventListener = originalAddEventListener
      global.document.removeEventListener = originalRemoveEventListener
    })

    it('subscribes to particular global event', () => {

      Listeners.on(global.document, 'click', clickCallback)
      expect(addEventListenerSpy).toHaveBeenCalledWith('click', clickCallback, false)

      global.document.dispatchEvent(new Event('click'))

      expect(clickCallback).toHaveBeenCalledTimes(1)

      Listeners.off(global.document, 'click', clickCallback)
    })

    it('unsubscribes from particular global event', () => {

      Listeners.on(global.document, 'click', clickCallback)

      Listeners.off(global.document, 'click', clickCallback)
      expect(removeEventListenerSpy).toHaveBeenCalledWith('click', clickCallback, false)

      global.document.dispatchEvent(new Event('click'))

      expect(clickCallback).not.toHaveBeenCalled()
    })

    it('ignores global event when event listening not supported', () => {

      Utils.setGlobalProp(global.document, 'addEventListener')
      Utils.setGlobalProp(global.document, 'removeEventListener')

      Listeners.on(global.document, 'click', clickCallback)
      expect(addEventListenerSpy).not.toHaveBeenCalled()

      global.document.dispatchEvent(new Event('click'))

      expect(clickCallback).not.toHaveBeenCalled()

      Listeners.off(global.document, 'click', clickCallback)
      expect(removeEventListenerSpy).not.toHaveBeenCalled()
    })

  })

  describe('test for Page Visibility API access', () => {
    const origHidden = global.document.hidden
    let hSpy
    let mozSpy
    let msSpy
    let oSpy
    let webkitSpy

    beforeAll(() => {
      Utils.setGlobalProp(global.document, 'hidden')
      Utils.setGlobalProp(global.document, 'mozHidden')
      Utils.setGlobalProp(global.document, 'msHidden')
      Utils.setGlobalProp(global.document, 'oHidden')
      Utils.setGlobalProp(global.document, 'webkitHidden')

      hSpy = jest.spyOn(global.document, 'hidden', 'get')
      mozSpy = jest.spyOn(global.document, 'mozHidden', 'get')
      msSpy = jest.spyOn(global.document, 'msHidden', 'get')
      oSpy = jest.spyOn(global.document, 'oHidden', 'get')
      webkitSpy = jest.spyOn(global.document, 'webkitHidden', 'get')
    })

    afterAll(() => {
      global.document.hidden = origHidden
      delete global.document.mozHidden
      delete global.document.msHidden
      delete global.document.oHidden
      delete global.document.webkitHidden
    })

    it('check access when hidden prop is available', () => {
      hSpy.mockReturnValueOnce(true)

      expect(Listeners.getVisibilityApiAccess()).toEqual({
        hidden: 'hidden',
        visibilityChange: 'visibilitychange'
      })
    })

    it('check access when mozHidden prop is available', () => {
      mozSpy.mockReturnValueOnce(true)

      expect(Listeners.getVisibilityApiAccess()).toEqual({
        hidden: 'mozHidden',
        visibilityChange: 'mozvisibilitychange'
      })
    })

    it('check access when msHidden prop is available', () => {
      msSpy.mockReturnValueOnce(true)

      expect(Listeners.getVisibilityApiAccess()).toEqual({
        hidden: 'msHidden',
        visibilityChange: 'msvisibilitychange'
      })
    })

    it('check access when oHidden prop is available', () => {
      oSpy.mockReturnValueOnce(true)

      expect(Listeners.getVisibilityApiAccess()).toEqual({
        hidden: 'oHidden',
        visibilityChange: 'ovisibilitychange'
      })
    })

    it('check access when webkitHidden prop is available', () => {
      webkitSpy.mockReturnValueOnce(true)

      expect(Listeners.getVisibilityApiAccess()).toEqual({
        hidden: 'webkitHidden',
        visibilityChange: 'webkitvisibilitychange'
      })
    })

    it('returns null when no access available', () => {
      expect(Listeners.getVisibilityApiAccess()).toBeNull()
    })

  })
})
