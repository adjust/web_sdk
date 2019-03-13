/* eslint-disable */
import * as Identity from '../identity'
import * as Storage from '../storage'

describe('test identity methods', () => {

  beforeAll(() => {
    jest.spyOn(Identity, 'getUuid')
    jest.spyOn(Storage, 'setItem')
    jest.spyOn(Storage, 'getItem')
  })
  afterEach(() => {
    jest.clearAllMocks()
  })
  afterAll(() => {
    jest.restoreAllMocks()
  })

  it('returns uuid if exists, otherwise generates new one and preserves it', () => {

    const uuid1 = Identity.getUuid()

    expect(Storage.getItem).toHaveBeenCalledTimes(1)
    expect(Storage.setItem).toHaveBeenCalledTimes(1)

    Storage.setItem.mockClear()
    Storage.getItem.mockClear()

    const uuid2 = Identity.getUuid()

    expect(uuid1).toEqual(uuid2)
    expect(Storage.getItem).toHaveBeenCalledTimes(1)
    expect(Storage.setItem).not.toHaveBeenCalled()

  })
})
