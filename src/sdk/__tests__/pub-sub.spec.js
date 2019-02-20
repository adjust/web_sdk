/* eslint-disable */
import * as PubSub from '../pub-sub'

describe('test publish-subscribe pattern', () => {

  const callbacks = {
    one: {cb: function () {}, id: null},
    two: {cb: function () {}, id: null},
    three: {cb: function () {}, id: null}
  }

  beforeAll(() => {
    jest.spyOn(callbacks.one, 'cb')
    jest.spyOn(callbacks.two, 'cb')
    jest.spyOn(callbacks.three, 'cb')

    callbacks.one.id = PubSub.subscribe('pretty-event', callbacks.one.cb)
    callbacks.two.id = PubSub.subscribe('ugly-event', callbacks.two.cb)
    callbacks.three.id =  PubSub.subscribe('pretty-event', callbacks.three.cb)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  afterAll(() => {
    jest.restoreAllMocks()
  })

  it('publishes pretty event', () => {

    PubSub.publish('pretty-event', 'something')

    expect(callbacks.one.cb).toHaveBeenCalledWith('pretty-event', 'something')
    expect(callbacks.three.cb).toHaveBeenCalledWith('pretty-event', 'something')
    expect(callbacks.two.cb).not.toHaveBeenCalled()

    expect(callbacks.one.cb.mock.calls.length).toBe(1)
    expect(callbacks.three.cb.mock.calls.length).toBe(1)
    expect(callbacks.two.cb.mock.calls.length).toBe(0)

  })

  it('publishes ugly event', () => {

    PubSub.publish('ugly-event', 'something-else')
    PubSub.publish('ugly-event', 'something-else')

    expect(callbacks.one.cb).not.toHaveBeenCalled()
    expect(callbacks.three.cb).not.toHaveBeenCalled()
    expect(callbacks.two.cb).toHaveBeenCalledWith('ugly-event', 'something-else')

    expect(callbacks.one.cb.mock.calls.length).toBe(0)
    expect(callbacks.three.cb.mock.calls.length).toBe(0)
    expect(callbacks.two.cb.mock.calls.length).toBe(2)

  })

  it('publishes event no one is subscribed to', () => {

    PubSub.publish('event-no-one-wants')

    expect(callbacks.one.cb).not.toHaveBeenCalled()
    expect(callbacks.two.cb).not.toHaveBeenCalled()
    expect(callbacks.three.cb).not.toHaveBeenCalled()

    expect(callbacks.one.cb.mock.calls.length).toBe(0)
    expect(callbacks.three.cb.mock.calls.length).toBe(0)
    expect(callbacks.two.cb.mock.calls.length).toBe(0)

  })

  it('unsubscribes previously subscribed callback "two" from ugly event', () => {

    PubSub.publish('pretty-event', 'something')

    expect(callbacks.one.cb).toHaveBeenCalledWith('pretty-event', 'something')
    expect(callbacks.one.cb.mock.calls.length).toBe(1)

    callbacks.one.cb.mockClear()

    PubSub.unsubscribe(callbacks.one.id)

    PubSub.publish('pretty-event', 'something')

    expect(callbacks.one.cb).not.toHaveBeenCalled()
    expect(callbacks.one.cb.mock.calls.length).toBe(0)

  })

  it('calls callback multiple times when subscribes to multiple events', () => {

    const callback = {cb: function () {}, id: null}

    jest.spyOn(callback, 'cb')

    callback.id = PubSub.subscribe('pretty-event', callback.cb)
    callback.id = PubSub.subscribe('ugly-event', callback.cb)

    PubSub.publish('pretty-event', 'something')
    PubSub.publish('ugly-event', 'something-else')

    expect(callback.cb.mock.calls[0]).toEqual(['pretty-event', 'something'])
    expect(callback.cb.mock.calls[1]).toEqual(['ugly-event', 'something-else'])
    expect(callback.cb.mock.calls.length).toBe(2)

    callback.cb.mockRestore()

  })
})

