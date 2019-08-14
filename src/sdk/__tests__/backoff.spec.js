import * as backOff from '../backoff'

describe('backOff strategy functionality', () => {

  const oldEnv = global.__ADJUST__ENV
  let mathRandomSpy

  beforeAll(() => {
    global.__ADJUST__ENV = 'development'

    mathRandomSpy = jest.spyOn(Math, 'random')
  })

  afterAll(() => {
    global.__ADJUST__ENV = oldEnv
    jest.restoreAllMocks()
  })

  it('tries out strategy without jitter effect', () => {
    expect(backOff.default(1, 'test')).toEqual(100)
    expect(backOff.default(2, 'test')).toEqual(200)
    expect(backOff.default(3, 'test')).toEqual(300)
  })

  it('tries out long strategy with jitter effect', () => {

    mathRandomSpy
      .mockReturnValueOnce(0.65647)
      .mockReturnValueOnce(0.17364)
      .mockReturnValueOnce(0.43112)

    expect(backOff.default(1, 'long')).toEqual(99388)
    expect(backOff.default(2, 'long')).toEqual(140837)
    expect(backOff.default(3, 'long')).toEqual(343469)
  })

  it('tries out short strategy with jitter effect', () => {

    mathRandomSpy
      .mockReturnValueOnce(0.153)
      .mockReturnValueOnce(0.342)
      .mockReturnValueOnce(0.675)
      .mockReturnValueOnce(0.786)

    expect(backOff.default(1, 'short')).toEqual(115)
    expect(backOff.default(2, 'short')).toEqual(268)
    expect(backOff.default(3, 'short')).toEqual(670)
    expect(backOff.default(16, 'short')).toEqual(3214800)

  })

})
