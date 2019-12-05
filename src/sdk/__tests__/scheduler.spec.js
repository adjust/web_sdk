import * as Scheduler from '../scheduler'

describe('test scheduler functionality', () => {

  let dateNowSpy
  let currentTime = Date.now()

  beforeAll(() => {
    dateNowSpy = jest.spyOn(Date, 'now')
  })

  afterEach(() => {
    Scheduler.destroy()
    jest.clearAllMocks()
  })

  afterAll(() => {
    jest.restoreAllMocks()
  })

  it('delay some actions and flush them after', () => {

    dateNowSpy
      .mockReturnValueOnce(currentTime)
      .mockReturnValueOnce(currentTime+1)

    const action1 = jest.fn()
    const action2 = jest.fn()

    Scheduler.delay(action1)
    Scheduler.delay(action2)

    expect(action1).not.toHaveBeenCalled()
    expect(action2).not.toHaveBeenCalled()

    Scheduler.flush()

    expect(action1).toHaveBeenCalledWith(currentTime)
    expect(action2).toHaveBeenCalledWith(currentTime+1)
  })

  it('destroys before flush', () => {

    dateNowSpy.mockReturnValueOnce(currentTime)

    const action = jest.fn()

    Scheduler.delay(action)

    expect(action).not.toHaveBeenCalled()

    Scheduler.destroy()
    Scheduler.flush()

    expect(action).not.toHaveBeenCalled()
  })
})
