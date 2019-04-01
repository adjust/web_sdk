/* eslint-disable */
import * as Identity from '../identity'
import * as Storage from '../storage'

describe('test identity methods', () => {

  beforeAll(() => {
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

    expect.assertions(5)

    return Identity.checkActivityState()
      .then(activityState => {

        uuid1 = activityState.uuid

        expect(Storage.default.addItem).toHaveBeenCalledTimes(1)
        expect(Storage.default.getFirst).toHaveBeenCalledTimes(1)

        Storage.default.addItem.mockClear()
        Storage.default.getFirst.mockClear()

        return Identity.checkActivityState()
      })
      .then(activityState => {

        uuid2 = activityState.uuid

        expect(uuid1).toEqual(uuid2)
        expect(Storage.default.addItem).not.toHaveBeenCalled()
        expect(Storage.default.getFirst).toHaveBeenCalledTimes(1)

      })
  })

  it('returns empty object if activity state does not exist', () => {

    expect.assertions(3)

    return Identity.getActivityState()
      .then(activityState => {
        expect(activityState).toBeUndefined()

        return Identity.checkActivityState()
      })
      .then(() => Identity.getActivityState())
      .then(activityState => {
        expect(activityState).not.toBeUndefined()
        expect(activityState.uuid).not.toBeUndefined()
      })

  })
})
