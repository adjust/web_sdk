import { StorageFactory } from '../../../smart-banner/storage/factory'
import { LocalStorage } from '../../../smart-banner/storage/local-storage'
import { InMemoryStorage } from '../../../smart-banner/storage/in-memory-storage'

jest.mock('../../../smart-banner/storage/local-storage')
jest.mock('../../../smart-banner/storage/in-memory-storage')

describe('StorageFactory', () => {

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('creates LocalStorage by default', () => {
    StorageFactory.createStorage()

    expect(LocalStorage).toHaveBeenCalledTimes(1)
    expect(InMemoryStorage).not.toHaveBeenCalled()
  })

  it('creates InMemoryStorage if LocalStorage not supported', () => {
    jest.spyOn(window, 'localStorage', 'get').mockImplementationOnce(() => {
      throw new Error('EmulatedSecurityError')
    })

    StorageFactory.createStorage()

    expect(InMemoryStorage).toHaveBeenCalledTimes(1)
    expect(LocalStorage).not.toHaveBeenCalled()
  })
})
