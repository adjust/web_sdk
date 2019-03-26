/* eslint-disable */
import * as Storage from '../storage'

describe('sets the available storage', () => {

  it('sets localStorage as a storage in jest env', () => {

    expect(Storage.default.type).toBe('localStorage')

  })

})
