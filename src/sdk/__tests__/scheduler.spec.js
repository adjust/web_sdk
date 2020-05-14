import * as Scheduler from '../scheduler'
import * as Logger from '../logger'

jest.mock('../logger')

describe('test scheduler functionality', () => {

  let dateNowSpy
  let currentTime = Date.now()

  beforeAll(() => {
    dateNowSpy = jest.spyOn(Date, 'now')

    jest.spyOn(Logger.default, 'log')
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
    const action3 = 'not-a-method'

    Scheduler.delay(action1, 'action one')
    Scheduler.delay(action2, 'action two')
    Scheduler.delay(action3, 'action three')

    expect(action1).not.toHaveBeenCalled()
    expect(action2).not.toHaveBeenCalled()

    Scheduler.flush()

    expect(action1).toHaveBeenCalledWith(currentTime)
    expect(action2).toHaveBeenCalledWith(currentTime+1)
    expect(Logger.default.log).toHaveBeenCalledTimes(2)
    expect(Logger.default.log).toHaveBeenCalledWith('Delayed action one task is running now')
    expect(Logger.default.log).toHaveBeenCalledWith('Delayed action two task is running now')
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
