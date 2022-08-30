import { CustomUrl } from '../../../../smart-banner/network/url-strategy/custom-url'

describe('CustomUrl', () => {
  it('returns urls map with custom url', () => {
    const url = 'custom.url'

    const expectedUrlMap = {
      endpointName: `Custom (${url})`,
      app: url,
      gdpr: url
    }

    const resultingFn = CustomUrl.preferredUrlsGetter(url)

    expect(resultingFn).toEqual(expect.any(Function))
    expect(resultingFn()).toEqual([expectedUrlMap])
  })
})
