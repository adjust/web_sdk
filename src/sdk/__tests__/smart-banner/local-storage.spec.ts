import { storage } from '../../smart-banner/local-storage'

describe('Local storage', () => {

  beforeAll(() => {
    jest.spyOn(localStorage, 'getItem')
    jest.spyOn(localStorage, 'setItem')
  })

  afterAll(() => {
    localStorage.clear()
  })

  const key = 'test'
  const value = { data: 'test-data' }
  const lsKey = (key: string) => `adjust-smart-banner.${key}`

  it("writes record", () => {
    storage.setItem(key, value)

    const expected = JSON.stringify(value)

    expect(localStorage.setItem).toHaveBeenCalled()
    expect(localStorage.getItem(lsKey(key))).toEqual(expected)
  })

  it("reads record", () => {
    expect(storage.getItem(key)).toEqual(value)
    expect(localStorage.getItem).toHaveBeenCalled()
  })

  it("removes record", () => {
    storage.setItem(key, null)

    expect(localStorage.setItem).toHaveBeenCalled()
    expect(localStorage.getItem(lsKey(key))).toBeNull()
  })

  it("returns null when no such record", () => {
    expect(storage.getItem('not-exist')).toBeNull()
    expect(localStorage.getItem).toHaveBeenCalled()
  })

  it("does not throw on invalid JSON", () => {
    const key = 'invalid-record'
    localStorage.setItem(lsKey(key), '{hello":"world"}')

    let value
    expect(() => { value = storage.getItem(key) }).not.toThrow()
    expect(value).toBeNull()
  })
})
