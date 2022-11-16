import { InMemoryStorage } from '../../../smart-banner/storage/in-memory-storage'

describe('In-memory storage', () => {
  let storage: InMemoryStorage

  beforeEach(() => {
    storage = new InMemoryStorage
  })

  const key = 'test'
  const value = { data: 'test-data' }

  it('writes record', () => {
    storage.setItem(key, value)

    expect(storage['items'][key]).toEqual(value)
  })

  it('reads stored record', () => {
    storage['items'][key] = value

    const actual = storage.getItem(key)

    expect(actual).toEqual(value)
  })

  it('removes record', () => {
    storage['items'][key] = value

    expect(storage.getItem(key)).toEqual(value)

    storage.removeItem(key)

    expect(storage['items'][key]).toBeUndefined()
  })

  it('returns null when no such record', () => {
    const noExistentValue = storage.getItem(key)

    expect(noExistentValue).toBeNull()
  })
})
