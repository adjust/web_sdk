/*describe('Promise-based urlStrategyRetries tests', () => {

    it('does not override custom url', () => {
      const customUrl = 'custom-url'
      Config.set({ ...options, customUrl })

      expect.assertions(2)

      return urlStrategyRetries(sendRequestMock, testEndpoints)
        .catch(reason => expect(reason).toEqual({ code: 'NO_CONNECTION' }))
        .then(() => expect(sendRequestMock).toHaveBeenCalledWith({ app: customUrl, gdpr: customUrl }))
    })

    it('retries to send request to endpoints iteratively', () => {
      expect.assertions(5)

      return urlStrategyRetries(sendRequestMock, testEndpoints)
        .catch(reason => expect(reason).toEqual({ code: 'NO_CONNECTION' }))
        .then(() => {
          expect(sendRequestMock).toHaveBeenCalledTimes(3)
          expect(sendRequestMock).toHaveBeenCalledWith({ app: testEndpoints.default.app, gdpr: testEndpoints.default.gdpr })
          expect(sendRequestMock).toHaveBeenCalledWith({ app: testEndpoints.india.app, gdpr: testEndpoints.india.gdpr })
          expect(sendRequestMock).toHaveBeenCalledWith({ app: testEndpoints.china.app, gdpr: testEndpoints.china.gdpr })
        })
    })

    it('prefers Indian enpoint and does not try reach Chinese one when india url strategy set', () => {
      Config.set({ ...options, urlStrategy: UrlStrategy.India })

      expect.assertions(4)

      return urlStrategyRetries(sendRequestMock, testEndpoints)
        .catch(reason => expect(reason).toEqual({ code: 'NO_CONNECTION' }))
        .then(() => {
          expect(sendRequestMock).toHaveBeenCalledTimes(2)
          expect(sendRequestMock).toHaveBeenCalledWith({ app: testEndpoints.india.app, gdpr: testEndpoints.india.gdpr })
          expect(sendRequestMock).toHaveBeenCalledWith({ app: testEndpoints.default.app, gdpr: testEndpoints.default.gdpr })
        })
    })

    it('prefers Chinese enpoint and does not try reach Indian one when china url strategy set', () => {
      Config.set({ ...options, urlStrategy: UrlStrategy.China })

      expect.assertions(4)

      return urlStrategyRetries(sendRequestMock, testEndpoints)
        .catch(reason => expect(reason).toEqual({ code: 'NO_CONNECTION' }))
        .then(() => {
          expect(sendRequestMock).toHaveBeenCalledTimes(2)
          expect(sendRequestMock).toHaveBeenCalledWith({ app: testEndpoints.china.app, gdpr: testEndpoints.china.gdpr })
          expect(sendRequestMock).toHaveBeenCalledWith({ app: testEndpoints.default.app, gdpr: testEndpoints.default.gdpr })
        })
    })

    describe('data residency', () => {

      it.each([
        DataResidency.EU,
        DataResidency.US,
        DataResidency.TR
      ])('tries to reach only regional endpoint if data residency set', (dataResidency) => {
        Config.set({ ...options, dataResidency: dataResidency })

        expect.assertions(3)

        return urlStrategyRetries(sendRequestMock, testEndpoints)
          .catch(reason => expect(reason).toEqual({ code: 'NO_CONNECTION' }))
          .then(() => {
            expect(sendRequestMock).toHaveBeenCalledTimes(1)
            expect(sendRequestMock).toHaveBeenCalledWith({ app: testEndpoints[dataResidency].app, gdpr: testEndpoints[dataResidency].gdpr })
          })

      })

      it.each([
        [UrlStrategy.China, DataResidency.EU],
        [UrlStrategy.China, DataResidency.US],
        [UrlStrategy.China, DataResidency.TR],
        [UrlStrategy.India, DataResidency.EU],
        [UrlStrategy.India, DataResidency.US],
        [UrlStrategy.India, DataResidency.TR]
      ])('drops url strategy if data residency set', (urlStrategy, dataResidency) => {
        Config.set({ ...options, urlStrategy: urlStrategy, dataResidency: dataResidency })

        expect.assertions(4)

        return urlStrategyRetries(sendRequestMock, testEndpoints)
          .catch(reason => expect(reason).toEqual({ code: 'NO_CONNECTION' }))
          .then(() => {
            expect(Logger.default.warn).toHaveBeenCalledWith('Both urlStrategy and dataResidency are set in config, urlStartegy would be ignored')
            expect(sendRequestMock).toHaveBeenCalledTimes(1)
            expect(sendRequestMock).toHaveBeenCalledWith({ app: testEndpoints[dataResidency].app, gdpr: testEndpoints[dataResidency].gdpr })
          })
      })
    })

    it('stops to iterate endpoints if connected succesfully', () => {
      const sendRequestMock = jest.fn()
        .mockImplementationOnce(() => Promise.reject({ code: 'NO_CONNECTION' }))
        .mockImplementationOnce(() => Promise.resolve())

      expect.assertions(1)

      return urlStrategyRetries(sendRequestMock, testEndpoints)
        .then(() => expect(sendRequestMock).toHaveBeenCalledTimes(2))
    })

    it('does not iterate endpoints if another error happened', () => {
      const sendRequestMock = jest.fn(() => Promise.reject({ code: 'UNKNOWN' }))

      expect.assertions(1)

      return urlStrategyRetries(sendRequestMock, testEndpoints)
        .catch(() => expect(sendRequestMock).toHaveBeenCalledTimes(1))
    })

  })*/
