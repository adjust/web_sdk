/* eslint-disable */
import * as identity from '../identity'
import * as Storage from '../storage'

describe('test identity methods', () => {

  beforeAll(() => {
    jest.spyOn(identity, 'default')
    jest.spyOn(Storage.default, 'getFirst')
    jest.spyOn(Storage.default, 'addItem')
  })
  afterEach(() => {
    jest.clearAllMocks()
    localStorage.clear()
  })
  afterAll(() => {
    jest.restoreAllMocks()
  })

  it('returns activity state if exists, otherwise generates new one and preserves it', () => {

    let uuid1
    let uuid2

    return identity.default()
      .then(activityState => {

        uuid1 = activityState.uuid

        expect(Storage.default.addItem).toHaveBeenCalledTimes(1)
        expect(Storage.default.getFirst).toHaveBeenCalledTimes(1)

        Storage.default.addItem.mockClear()
        Storage.default.getFirst.mockClear()

        return identity.default()
      })
      .then(activityState => {

        uuid2 = activityState.uuid

        expect(uuid1).toEqual(uuid2)
        expect(Storage.default.addItem).not.toHaveBeenCalled()
        expect(Storage.default.getFirst).toHaveBeenCalledTimes(1)

      })
  })
})
