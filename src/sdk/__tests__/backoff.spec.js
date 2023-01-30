import * as backOff from '../backoff'

describe('backOff strategy functionality', () => {

  const oldEnv = global.process.env.NODE_ENV
  let mathRandomSpy

  beforeAll(() => {
    global.process.env.NODE_ENV = 'development'

    mathRandomSpy = jest.spyOn(Math, 'random')
  })

  afterAll(() => {
    global.process.env.NODE_ENV = oldEnv
    jest.restoreAllMocks()
  })

  it('tries out strategy without jitter effect', () => {
    expect(backOff.default(1, 'test')).toBe(100)
    expect(backOff.default(2, 'test')).toBe(200)
    expect(backOff.default(3, 'test')).toBe(300)
  })

  it('tries out long strategy with jitter effect', () => {

    mathRandomSpy
      .mockReturnValueOnce(0.65647)
      .mockReturnValueOnce(0.17364)
      .mockReturnValueOnce(0.43112)

    expect(backOff.default(1, 'long')).toBe(99388)
    expect(backOff.default(2, 'long')).toBe(140837)
    expect(backOff.default(3, 'long')).toBe(343469)
  })

  it('tries out short strategy with jitter effect', () => {

    mathRandomSpy
      .mockReturnValueOnce(0.153)
      .mockReturnValueOnce(0.342)
      .mockReturnValueOnce(0.675)
      .mockReturnValueOnce(0.786)

    expect(backOff.default(1, 'short')).toBe(115)
    expect(backOff.default(2, 'short')).toBe(268)
    expect(backOff.default(3, 'short')).toBe(670)
    expect(backOff.default(16, 'short')).toBe(3214800)

  })

})
