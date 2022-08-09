import * as PubSub from '../pub-sub'

jest.useFakeTimers()

describe('test publish-subscribe pattern', () => {

  const callbacks = {
    one: {cb: jest.fn(), id: null},
    two: {cb: jest.fn(), id: null},
    three: {cb: jest.fn(), id: null}
  }

  beforeAll(() => {
    jest.spyOn(global, 'setTimeout')

    callbacks.one.id = PubSub.subscribe('pretty-event', callbacks.one.cb)
    callbacks.two.id = PubSub.subscribe('ugly-event', callbacks.two.cb)
    callbacks.three.id =  PubSub.subscribe('pretty-event', callbacks.three.cb)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  afterAll(() => {
    PubSub.destroy()
    jest.restoreAllMocks()
    jest.clearAllTimers()
  })

  it('publishes pretty event', () => {

    PubSub.publish('pretty-event', 'something')

    jest.runAllTimers()

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

    jest.runAllTimers()

    expect(callbacks.one.cb).not.toHaveBeenCalled()
    expect(callbacks.three.cb).not.toHaveBeenCalled()
    expect(callbacks.two.cb).toHaveBeenCalledWith('ugly-event', 'something-else')

    expect(callbacks.one.cb.mock.calls.length).toBe(0)
    expect(callbacks.three.cb.mock.calls.length).toBe(0)
    expect(callbacks.two.cb.mock.calls.length).toBe(2)

  })

  it('publishes event no one is subscribed to', () => {

    PubSub.publish('event-no-one-wants')

    jest.runAllTimers()

    expect(callbacks.one.cb).not.toHaveBeenCalled()
    expect(callbacks.two.cb).not.toHaveBeenCalled()
    expect(callbacks.three.cb).not.toHaveBeenCalled()

    expect(callbacks.one.cb.mock.calls.length).toBe(0)
    expect(callbacks.three.cb.mock.calls.length).toBe(0)
    expect(callbacks.two.cb.mock.calls.length).toBe(0)

  })

  it('unsubscribes previously subscribed callback "two" from ugly event', () => {

    PubSub.publish('pretty-event', 'something')

    jest.runAllTimers()

    expect(callbacks.one.cb).toHaveBeenCalledWith('pretty-event', 'something')
    expect(callbacks.one.cb.mock.calls.length).toBe(1)

    callbacks.one.cb.mockClear()

    PubSub.unsubscribe(callbacks.one.id)

    PubSub.publish('pretty-event', 'something')

    jest.runAllTimers()

    expect(callbacks.one.cb).not.toHaveBeenCalled()
    expect(callbacks.one.cb.mock.calls.length).toBe(0)

  })

  it('ignores unsubscribe when id not provided', () => {

    const callback = jest.fn()

    PubSub.subscribe('some-event', callback)
    PubSub.publish('some-event', 'something')

    jest.runAllTimers()

    expect(callback).toHaveBeenCalledWith('some-event', 'something')
    expect(callback).toHaveBeenCalledTimes(1)

    PubSub.unsubscribe()

    PubSub.publish('some-event', 'something-else')

    jest.runAllTimers()

    expect(callback).toHaveBeenCalledWith('some-event', 'something-else')
    expect(callback).toHaveBeenCalledTimes(2)

  })

  it('calls callback multiple times when subscribes to multiple events', () => {

    const callback = {cb: jest.fn(), id: null}

    callback.id = PubSub.subscribe('pretty-event', callback.cb)
    callback.id = PubSub.subscribe('ugly-event', callback.cb)

    PubSub.publish('pretty-event', 'something')
    PubSub.publish('ugly-event', 'something-else')

    jest.runAllTimers()

    expect(callback.cb.mock.calls[0]).toEqual(['pretty-event', 'something'])
    expect(callback.cb.mock.calls[1]).toEqual(['ugly-event', 'something-else'])
    expect(callback.cb.mock.calls.length).toBe(2)

    callback.cb.mockRestore()

  })

  it('destroys all cashed callbacks', () => {

    const callback1 = jest.fn()
    const callback2 = jest.fn()

    PubSub.subscribe('event1', callback1)
    PubSub.subscribe('event2', callback2)

    PubSub.publish('event1', {})
    PubSub.publish('event2', {})

    jest.runAllTimers()

    expect(callback1).toHaveBeenCalledTimes(1)
    expect(callback1).toHaveBeenCalledWith('event1', {})
    expect(callback2).toHaveBeenCalledTimes(1)
    expect(callback2).toHaveBeenCalledWith('event2', {})

    callback1.mockClear()
    callback2.mockClear()

    PubSub.destroy()

    PubSub.publish('event1')
    PubSub.publish('event2')

    jest.runAllTimers()

    expect(callback1).not.toHaveBeenCalled()
    expect(callback2).not.toHaveBeenCalled()

  })

  it('subscribes to many events', () => {

    const ids = []
    const callbacks = []
    const callback1 = jest.fn()
    const callback2 = jest.fn()
    const callback3 = jest.fn()
    const callback4 = 'not-a-function'
    let randomId

    for (let i = 0; i < 30; i += 1) {
      const callback = jest.fn()
      callbacks.push(callback)
      ids.push(PubSub.subscribe(`event-${i}`, callback))

      if (i === 5) {
        PubSub.subscribe(`event-${i}`, callback1)
        randomId = PubSub.subscribe(`event-${i}`, callback2)
        PubSub.subscribe(`event-${i}`, callback3)
        PubSub.subscribe(`event-${i}`, callback4)
      }
    }

    PubSub.publish('event-5', {})

    jest.runAllTimers()

    expect(callbacks[5]).toHaveBeenCalledWith('event-5', {})
    expect(callback1).toHaveBeenCalledWith('event-5', {})
    expect(callback2).toHaveBeenCalledWith('event-5', {})
    expect(callback3).toHaveBeenCalledWith('event-5', {})
    expect(setTimeout).toHaveBeenCalledTimes(4)

    callbacks[5].mockClear()
    callback1.mockClear()
    callback2.mockClear()
    callback3.mockClear()
    setTimeout.mockClear()

    PubSub.unsubscribe(ids[5])
    PubSub.unsubscribe(randomId)

    PubSub.publish('event-5', {})

    jest.runAllTimers()

    expect(callbacks[5]).not.toHaveBeenCalled()
    expect(callback1).toHaveBeenCalledWith('event-5', {})
    expect(callback2).not.toHaveBeenCalled()
    expect(callback3).toHaveBeenCalledWith('event-5', {})
    expect(setTimeout).toHaveBeenCalledTimes(2)

  })


})

