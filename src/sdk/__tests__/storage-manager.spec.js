/* eslint-disable */
import * as StorageManager from '../storage-manager'

describe('sets the available storage', () => {

  it('sets localStorage as a storage in jest env', () => {

    expect(StorageManager.default.type).toBe('localStorage')

  })

})