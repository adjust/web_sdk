/* eslint-disable */
import * as Identity from '../identity'
import * as Storage from '../storage'

describe('test identity methods', () => {

  beforeAll(() => {
    jest.spyOn(Identity, 'getUuid')
    jest.spyOn(Identity, 'getCurrent')
    jest.spyOn(Storage.default, 'getItem')
    jest.spyOn(Storage.default, 'addItem')
  })
  afterEach(() => {
    jest.clearAllMocks()
    localStorage.clear()
  })
  afterAll(() => {
    jest.restoreAllMocks()
  })

  it('returns uuid if exists, otherwise generates new one and preserves it (without sync)', () => {

    const current1 = Identity.getUuid()

    expect(Storage.default.addItem).not.toHaveBeenCalled()
    expect(Storage.default.getItem).not.toHaveBeenCalled()

    Storage.default.addItem.mockClear()
    Storage.default.getItem.mockClear()

    const current2 = Identity.getUuid()

    expect(current1.uuid).toEqual(current2.uuid)
    expect(Storage.default.addItem).not.toHaveBeenCalled()
    expect(Storage.default.getItem).not.toHaveBeenCalled()


  })

  it('returns uuid if exists, otherwise generates new one and preserves it (with sync)', () => {

    const current1 = Identity.getUuid(true)

    expect(Storage.default.addItem).toHaveBeenCalledTimes(1)
    expect(Storage.default.getItem).not.toHaveBeenCalled()

    Storage.default.addItem.mockClear()
    Storage.default.getItem.mockClear()

    const current2 = Identity.getUuid(true)

    expect(current1.uuid).toEqual(current2.uuid)
    expect(Storage.default.addItem).not.toHaveBeenCalled()
    expect(Storage.default.getItem).toHaveBeenCalledTimes(1)

  })

  it ('returns current user if exists, otherwise generates new one and preserves it', () => {

    let uuid1
    let uuid2

    expect.assertions(5)

    return Identity.getCurrent()
      .then(user => {

        uuid1 = user.uuid

        expect(Storage.default.addItem).toHaveBeenCalledTimes(1)
        expect(Storage.default.getItem).not.toHaveBeenCalled()

        Storage.default.addItem.mockClear()
        Storage.default.getItem.mockClear()

        return Identity.getCurrent()
      })
      .then(user => {

        uuid2 = user.uuid

        expect(uuid1).toEqual(uuid2)
        expect(Storage.default.addItem).not.toHaveBeenCalled()
        expect(Storage.default.getItem).toHaveBeenCalledTimes(1)

      })

  })
})
