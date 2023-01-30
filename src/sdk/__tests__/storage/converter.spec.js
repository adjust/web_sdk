describe('test Converter utility', () => {
  describe('scheme import without test override', () => {
    jest.isolateModules(() => {
      const Converter = require('../../storage/converter')

      it('encodes values into short form if defined in scheme map', () => {

        expect(Converter.encodeValue('/session')).toBe(1)
        expect(Converter.encodeValue('/event')).toBe(2)
        expect(Converter.encodeValue('/gdpr_forget_device')).toBe(3)
        expect(Converter.encodeValue('GET')).toBe(1)
        expect(Converter.encodeValue('POST')).toBe(2)
        expect(Converter.encodeValue('PUT')).toBe(3)
        expect(Converter.encodeValue('DELETE')).toBe(4)
        expect(Converter.encodeValue('callback')).toBe(1)
        expect(Converter.encodeValue('partner')).toBe(2)
        expect(Converter.encodeValue('bla')).toBe('bla')

      })

      it('encodes and decodes primaries values', () => {

        expect(Converter.convertValues('queue', 'left', 123)).toBe(123)
        expect(Converter.convertValues('activityState', 'left', 'abc123')).toBe('abc123')
        expect(Converter.convertValues('globalParams', 'left', [123, 'callback'])).toEqual([123, 1])
        expect(Converter.convertValues('globalParams', 'left', [123, 'partner'])).toEqual([123, 2])

        expect(Converter.convertValues('queue', 'right', 123)).toBe(123)
        expect(Converter.convertValues('activityState', 'right', 'abc123')).toBe('abc123')
        expect(Converter.convertValues('globalParams', 'right', [123, 1])).toEqual([123, 'callback'])
        expect(Converter.convertValues('globalParams', 'right', [123, 2])).toEqual([123, 'partner'])

      })

      it('encodes and decodes queue record', () => {

        expect(Converter.convertRecord(
          'queue',
          'left',
          {
            url: '/session',
            timestamp: 123456,
            createdAt: 123456,
            params: {
              timeSpent: 1,
              sessionLength: 2,
              sessionCount: 3,
              eventCount: 3,
              lastInterval: 10,
              callbackParams: { key1: 'value1' },
              partnerParams: { key2: 'value2', key3: 'value3' },
              somethingDynamic: 'bla'
            }
          }
        )).toEqual({
          u: 1,
          t: 123456,
          ca: 123456,
          p: {
            ts: 1,
            sl: 2,
            sc: 3,
            ec: 3,
            li: 10,
            cp: { key1: 'value1' },
            pp: { key2: 'value2', key3: 'value3' },
            somethingDynamic: 'bla'
          }
        })

        expect(Converter.convertRecord(
          'queue',
          'left',
          {
            url: '/session',
            timestamp: 123456,
            params: {
              timeSpent: 1,
              sessionLength: 2,
              sessionCount: 3,
              eventCount: 3,
              lastInterval: 10,
              callbackParams: { key1: 'value1' },
              partnerParams: { key2: 'value2', key3: 'value3' },
              somethingDynamic: 'bla'
            }
          }
        )).toEqual({
          u: 1,
          t: 123456,
          p: {
            ts: 1,
            sl: 2,
            sc: 3,
            ec: 3,
            li: 10,
            cp: { key1: 'value1' },
            pp: { key2: 'value2', key3: 'value3' },
            somethingDynamic: 'bla'
          }
        })

        expect(Converter.convertRecord(
          'queue',
          'right',
          {
            u: 3,
            t: 6543321,
            m: 2,
            ca: 982734982,
            p: {
              ts: 10,
              sl: 2,
              sc: 5,
              ec: 4,
              li: 34,
              pp: { key: 'value' }
            }
          }
        )).toEqual({
          url: '/gdpr_forget_device',
          timestamp: 6543321,
          method: 'POST',
          createdAt: 982734982,
          params: {
            timeSpent: 10,
            sessionLength: 2,
            sessionCount: 5,
            eventCount: 4,
            lastInterval: 34,
            partnerParams: { key: 'value' }
          }
        })

      })

      it('encodes and decodes activityState record', () => {
        expect(Converter.convertRecord(
          'activityState',
          'left',
          {
            uuid: '123abc',
            timeSpent: 10,
            sessionLength: 20,
            sessionCount: 30,
            eventCount: 33,
            lastActive: 123456,
            lastInterval: 100,
            attribution: {
              adid: '7d6s7d6a8s8a7f',
              tracker_token: 'token1',
              tracker_name: 'tracker1',
              network: 'network1',
              campaign: 'campaign1',
              adgroup: 'adgroup1',
              creative: 'creative1',
              click_label: 'clicklabel1',
              state: 'installed'
            }
          }
        )).toEqual({
          u: '123abc',
          ts: 10,
          sl: 20,
          sc: 30,
          ec: 33,
          la: 123456,
          li: 100,
          at: {
            a: '7d6s7d6a8s8a7f',
            tt: 'token1',
            tn: 'tracker1',
            nt: 'network1',
            cm: 'campaign1',
            ag: 'adgroup1',
            cr: 'creative1',
            cl: 'clicklabel1',
            st: 1
          }
        })

        expect(Converter.convertRecord(
          'activityState',
          'right',
          {
            u: '123abc',
            ts: 1,
            sl: 5,
            sc: 5,
            ec: 4,
            la: 21413,
            li: 32,
            at: {
              a: 'asdfasdf',
              tt: 'token2',
              tn: 'tracker2',
              cr: 'creative3',
              st: 2
            }
          }
        )).toEqual({
          uuid: '123abc',
          timeSpent: 1,
          sessionLength: 5,
          sessionCount: 5,
          eventCount: 4,
          lastActive: 21413,
          lastInterval: 32,
          attribution: {
            adid: 'asdfasdf',
            tracker_token: 'token2',
            tracker_name: 'tracker2',
            creative: 'creative3',
            state: 'reattributed'
          }
        })
      })

      it('encodes and decodes globalParams record', () => {
        expect(Converter.convertRecord('globalParams', 'left', {
          key: 'key1',
          value: 'value1',
          type: 'callback'
        })).toEqual({
          k: 'key1',
          v: 'value1',
          t: 1
        })

        expect(Converter.convertRecord(
          'globalParams',
          'right',
          {
            k: 'key2',
            v: 'value2',
            t: 2
          }
        )).toEqual({
          key: 'key2',
          value: 'value2',
          type: 'partner'
        })

      })

      it('encodes and decodes multiple records', () => {

        expect(Converter.convertRecords(
          'globalParams',
          'left',
          [
            { key: 'key1', value: 'value1', type: 'callback' },
            { key: 'key2', value: 'value2', type: 'callback' },
            { key: 'key3', value: 'value3', type: 'partner' }
          ]
        )).toEqual([
          { k: 'key1', v: 'value1', t: 1 },
          { k: 'key2', v: 'value2', t: 1 },
          { k: 'key3', v: 'value3', t: 2 }
        ])

        expect(Converter.convertRecords(
          'globalParams',
          'right',
          [
            { k: 'key1', v: 'value1', t: 2 },
            { k: 'key2', v: 'value2', t: 1 },
            { k: 'key3', v: 'value3', t: 2 },
            { k: 'key4', v: 'value4', t: 2 }
          ]
        )).toEqual([
          { key: 'key1', value: 'value1', type: 'partner' },
          { key: 'key2', value: 'value2', type: 'callback' },
          { key: 'key3', value: 'value3', type: 'partner' },
          { key: 'key4', value: 'value4', type: 'partner' }
        ])

        expect(Converter.convertRecords(
          'queue',
          'left',
          [
            { url: '/session', method: 'POST', timestamp: 123456, createdAt: 123456, params: { timeSpent: 10, sessionLength: 12, sessionCount: 9, eventCount: 10, lastInterval: 10 } },
            { url: '/event', method: 'POST', timestamp: 28374628, params: { timeSpent: 4, sessionLength: 4, sessionCount: 9, eventCount: 11, lastInterval: 4, eventToken: '123abc' } },
            { url: '/event', method: 'POST', timestamp: 28374628, params: { timeSpent: 5, sessionLength: 6, sessionCount: 9, eventCount: 12, lastInterval: 5, eventToken: 'abc123', revenue: 100 } },
            { url: '/url', method: 'DELETE', timestamp: 123746, params: { custom: 'param' } }
          ]
        )).toEqual([
          { u: 1, m: 2, t: 123456, ca: 123456, p: { ts: 10, sl: 12, sc: 9, ec: 10, li: 10 } },
          { u: 2, m: 2, t: 28374628, p: { ts: 4, sl: 4, sc: 9, ec: 11, li: 4, et: '123abc' } },
          { u: 2, m: 2, t: 28374628, p: { ts: 5, sl: 6, sc: 9, ec: 12, li: 5, et: 'abc123', re: 100 } },
          { u: '/url', m: 4, t: 123746, p: { custom: 'param' } }
        ])

        expect(Converter.convertRecords(
          'queue',
          'right',
          [
            { u: 1, t: 12412, p: { ts: 10, sl: 12, sc: 9, ec: 10, li: 10 } },
            { u: 2, m: 2, t: 12312, ca: 12312, p: { ts: 4, sl: 4, sc: 9, ec: 11, li: 4, et: '123abc' } },
            { u: 3, m: 3, t: 3423452, ca: 3423452, p: { ts: 5, sl: 6, sc: 9, ec: 12, li: 5 } },
            { u: '/some-other-url', m: 1, t: 123746, p: { other: 'param' } }
          ]
        )).toEqual([
          { url: '/session', timestamp: 12412, params: { timeSpent: 10, sessionLength: 12, sessionCount: 9, eventCount: 10, lastInterval: 10 } },
          { url: '/event', method: 'POST', timestamp: 12312, createdAt: 12312, params: { timeSpent: 4, sessionLength: 4, sessionCount: 9, eventCount: 11, lastInterval: 4, eventToken: '123abc' } },
          { url: '/gdpr_forget_device', method: 'PUT', timestamp: 3423452, createdAt: 3423452, params: { timeSpent: 5, sessionLength: 6, sessionCount: 9, eventCount: 12, lastInterval: 5 } },
          { url: '/some-other-url', method: 'GET', timestamp: 123746, params: { other: 'param' } }
        ])

      })

      it('encodes and decodes eventDeduplication record', () => {
        expect(Converter.convertRecord(
          'eventDeduplication',
          'left',
          { internalId: 1, id: 'id1' }
        )).toEqual({ ii: 1, i: 'id1' })

        expect(Converter.convertRecord(
          'eventDeduplication',
          'right',
          { ii: 2, i: 'id2' }
        )).toEqual({ internalId: 2, id: 'id2' })
      })

      it('encodes and decodes preferences record', () => {
        expect(Converter.convertRecord(
          'preferences',
          'left',
          { sdkDisabled: { reason: 'general', pending: false } }
        )).toEqual({ sd: { r: 1, p: 0 } })

        expect(Converter.convertRecord(
          'preferences',
          'left',
          { sdkDisabled: { reason: 'gdpr', pending: false } }
        )).toEqual({ sd: { r: 2, p: 0 } })

        expect(Converter.convertRecord(
          'preferences',
          'left',
          { sdkDisabled: { reason: 'gdpr', pending: true } }
        )).toEqual({ sd: { r: 2, p: 1 } })

        expect(Converter.convertRecord(
          'preferences',
          'left',
          { sdkDisabled: { reason: 'gdpr' } }
        )).toEqual({ sd: { r: 2 } })

        expect(Converter.convertRecord(
          'preferences',
          'right',
          { sd: { r: 1, p: 0 } }
        )).toEqual({ sdkDisabled: { reason: 'general', pending: false } })

        expect(Converter.convertRecord(
          'preferences',
          'right',
          { sd: { r: 2, p: 0 } }
        )).toEqual({ sdkDisabled: { reason: 'gdpr', pending: false } })

        expect(Converter.convertRecord(
          'preferences',
          'right',
          { sd: { r: 2, p: 1 } }
        )).toEqual({ sdkDisabled: { reason: 'gdpr', pending: true } })

        expect(Converter.convertRecord(
          'preferences',
          'right',
          { sd: { r: 2 } }
        )).toEqual({ sdkDisabled: { reason: 'gdpr' } })

      })
    })
  })

  describe('scheme import with test override', () => {
    jest.isolateModules(() => {
      const someStoreScheme = {
        name: 'ss',
        scheme: {
          keyPath: 'id',
          fields: {
            id: {
              key: 'id',
              primary: true
            },
            name: 'n',
            surname: {
              key: 's',
              values: {
                bla: 'b',
                truc: 't'
              }
            }
          }
        }
      }

      const Scheme = require('../../storage/scheme')
      Scheme.default = { someStore: someStoreScheme }

      const Converter = require('../../storage/converter')

      it('encodes and decodes someStore record', () => {
        expect(Converter.convertRecord(
          'someStore',
          'left',
          {
            id: 123,
            name: 'pljas',
            surname: 'bla'
          }
        )).toEqual({
          id: 123,
          n: 'pljas',
          s: 'b'
        })

        expect(Converter.convertRecord(
          'someStore',
          'right',
          {
            id: 456,
            n: 'some-name',
            s: 'some-surname'
          }
        )).toEqual({
          id: 456,
          name: 'some-name',
          surname: 'some-surname'
        })

      })

    })
  })

})
