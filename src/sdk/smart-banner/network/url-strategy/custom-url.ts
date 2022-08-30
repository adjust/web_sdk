export namespace CustomUrl {
  let getPreferredUrlsWithOption = (customUrl: string) => {

    return [{
      endpointName: `Custom (${customUrl})`,
      app: customUrl,
      gdpr: customUrl
    }]
  }

  export function preferredUrlsGetter(customUrl: string) {
    return () => getPreferredUrlsWithOption(customUrl)
  }
}
