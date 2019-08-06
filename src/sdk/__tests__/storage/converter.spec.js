import * as Converter from '../../storage/converter'

describe('test Converter utility', () => {

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

    expect(Converter.convertValues({storeName: 'queue', dir: 'left', target: 123})).toEqual(123)
    expect(Converter.convertValues({storeName: 'activityState', dir: 'left', target: 'abc123'})).toEqual('abc123')
    expect(Converter.convertValues({storeName: 'globalParams', dir: 'left', target: [123, 'callback']})).toEqual([123, 1])
    expect(Converter.convertValues({storeName: 'globalParams', dir: 'left', target: [123, 'partner']})).toEqual([123, 2])

    expect(Converter.convertValues({storeName: 'queue', dir: 'right', target: 123})).toEqual(123)
    expect(Converter.convertValues({storeName: 'activityState', dir: 'right', target: 'abc123'})).toEqual('abc123')
    expect(Converter.convertValues({storeName: 'globalParams', dir: 'right', target: [123, 1]})).toEqual([123, 'callback'])
    expect(Converter.convertValues({storeName: 'globalParams', dir: 'right', target: [123, 2]})).toEqual([123, 'partner'])

  })

  it('encodes and decodes queue record', () => {

    expect(Converter.convertRecord({
      storeName: 'queue',
      dir: 'left',
      record: {
        url: '/session',
        timestamp: 123456,
        params: {
          createdAt: 123456,
          timeSpent: 1,
          sessionLength: 2,
          sessionCount: 3,
          eventCount: 3,
          lastInterval: 10,
          callbackParams: {key1: 'value1'},
          partnerParams: {key2: 'value2', key3: 'value3'},
          somethingDynamic: 'bla'
        }
      }
    })).toEqual({
      u: 1,
      t: 123456,
      p: {
        ca: 123456,
        ts: 1,
        sl: 2,
        sc: 3,
        ec: 3,
        li: 10,
        cp: {key1: 'value1'},
        pp: {key2: 'value2', key3: 'value3'},
        somethingDynamic: 'bla'
      }
    })

    expect(Converter.convertRecord({
      storeName: 'queue',
      dir: 'left',
      record: {
        url: '/session',
        timestamp: 123456,
        params: {
          createdAt: 123456,
          timeSpent: 1,
          sessionLength: 2,
          sessionCount: 3,
          eventCount: 3,
          lastInterval: 10,
          callbackParams: {key1: 'value1'},
          partnerParams: {key2: 'value2', key3: 'value3'},
          somethingDynamic: 'bla'
        }
      }
    })).toEqual({
      u: 1,
      t: 123456,
      p: {
        ca: 123456,
        ts: 1,
        sl: 2,
        sc: 3,
        ec: 3,
        li: 10,
        cp: {key1: 'value1'},
        pp: {key2: 'value2', key3: 'value3'},
        somethingDynamic: 'bla'
      }
    })

    expect(Converter.convertRecord({
      storeName: 'queue',
      dir: 'right',
      record: {
        u: 3,
        t: 6543321,
        m: 2,
        p: {
          ca: 982734982,
          ts: 10,
          sl: 2,
          sc: 5,
          ec: 4,
          li: 34,
          pp: {key: 'value'}
        }
      }
    })).toEqual({
      url: '/gdpr_forget_device',
      timestamp: 6543321,
      method: 'POST',
      params: {
        createdAt: 982734982,
        timeSpent: 10,
        sessionLength: 2,
        sessionCount: 5,
        eventCount: 4,
        lastInterval: 34,
        partnerParams: {key: 'value'}
      }
    })

  })

  it('encodes and decodes activityState record', () => {
    expect(Converter.convertRecord({
      storeName: 'activityState',
      dir: 'left',
      record: {
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
          click_label: 'clicklabel1'
        }
      }
    })).toEqual({
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
        cl: 'clicklabel1'
      }
    })

    expect(Converter.convertRecord({
      storeName: 'activityState',
      dir: 'right',
      record: {
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
          cr: 'creative3'
        }
      }
    })).toEqual({
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
        creative: 'creative3'
      }
    })
  })

  it('encodes and decodes globalParams record', () => {
    expect(Converter.convertRecord({
      storeName: 'globalParams',
      dir: 'left',
      record: {
        key: 'key1',
        value: 'value1',
        type: 'callback'
      }
    })).toEqual({
      k: 'key1',
      v: 'value1',
      t: 1
    })

    expect(Converter.convertRecord({
      storeName: 'globalParams',
      dir: 'right',
      record: {
        k: 'key2',
        v: 'value2',
        t: 2
      }
    })).toEqual({
      key: 'key2',
      value: 'value2',
      type: 'partner'
    })

  })

  it('encodes and decodes multiple records', () => {

    expect(Converter.convertRecords({
      storeName: 'globalParams',
      dir: 'left',
      records: [
        {key: 'key1', value: 'value1', type: 'callback'},
        {key: 'key2', value: 'value2', type: 'callback'},
        {key: 'key3', value: 'value3', type: 'partner'}
      ]
    })).toEqual([
      {k: 'key1', v: 'value1', t: 1},
      {k: 'key2', v: 'value2', t: 1},
      {k: 'key3', v: 'value3', t: 2}
    ])

    expect(Converter.convertRecords({
      storeName: 'globalParams',
      dir: 'right',
      records: [
        {k: 'key1', v: 'value1', t: 2},
        {k: 'key2', v: 'value2', t: 1},
        {k: 'key3', v: 'value3', t: 2},
        {k: 'key4', v: 'value4', t: 2}
      ]
    })).toEqual([
      {key: 'key1', value: 'value1', type: 'partner'},
      {key: 'key2', value: 'value2', type: 'callback'},
      {key: 'key3', value: 'value3', type: 'partner'},
      {key: 'key4', value: 'value4', type: 'partner'}
    ])

    expect(Converter.convertRecords({
      storeName: 'queue',
      dir: 'left',
      records: [
        {url: '/session', method: 'POST', timestamp: 123456, params: {createdAt: 123456, timeSpent: 10, sessionLength: 12, sessionCount: 9, eventCount: 10, lastInterval: 10}},
        {url: '/event', method: 'POST', timestamp: 28374628, params: {createdAt: 28374628, timeSpent: 4, sessionLength: 4, sessionCount: 9, eventCount: 11, lastInterval: 4, eventToken: '123abc'}},
        {url: '/event', method: 'POST', timestamp: 28374628, params: {createdAt: 28374628, timeSpent: 5, sessionLength: 6, sessionCount: 9, eventCount: 12, lastInterval: 5, eventToken: 'abc123', revenue: 100}},
        {url: '/url', method: 'DELETE', timestamp: 123746, params: {custom: 'param'}}
      ]
    })).toEqual([
      {u: 1, m: 2, t: 123456, p: {ca: 123456, ts: 10, sl: 12, sc: 9, ec: 10, li: 10}},
      {u: 2, m: 2, t: 28374628, p: {ca: 28374628, ts: 4, sl: 4, sc: 9, ec: 11, li: 4, et: '123abc'}},
      {u: 2, m: 2, t: 28374628, p: {ca: 28374628, ts: 5, sl: 6, sc: 9, ec: 12, li: 5, et: 'abc123', re: 100}},
      {u: '/url', m: 4, t: 123746, p: {custom: 'param'}}
    ])

    expect(Converter.convertRecords({
      storeName: 'queue',
      dir: 'right',
      records: [
        {u: 1, t: 12412, p: {ca: 12412, ts: 10, sl: 12, sc: 9, ec: 10, li: 10}},
        {u: 2, m: 2, t: 12312, p: {ca: 12312, ts: 4, sl: 4, sc: 9, ec: 11, li: 4, et: '123abc'}},
        {u: 3, m: 3, t: 3423452, p: {ca: 3423452, ts: 5, sl: 6, sc: 9, ec: 12, li: 5}},
        {u: '/some-other-url', m: 1, t: 123746, p: {other: 'param', ca: 123746}}
      ]
    })).toEqual([
      {url: '/session', timestamp: 12412, params: {createdAt: 12412, timeSpent: 10, sessionLength: 12, sessionCount: 9, eventCount: 10, lastInterval: 10}},
      {url: '/event', method: 'POST', timestamp: 12312, params: {createdAt: 12312, timeSpent: 4, sessionLength: 4, sessionCount: 9, eventCount: 11, lastInterval: 4, eventToken: '123abc'}},
      {url: '/gdpr_forget_device', method: 'PUT', timestamp: 3423452, params: {createdAt: 3423452, timeSpent: 5, sessionLength: 6, sessionCount: 9, eventCount: 12, lastInterval: 5}},
      {url: '/some-other-url', method: 'GET', timestamp: 123746, params: {other: 'param', createdAt: 123746}}
    ])

  })

  it('encodes and decodes disabled record', () => {
    expect(Converter.convertRecord({
      storeName: 'disabled',
      dir: 'left',
      record: {reason: 'general', pending: false}
    })).toEqual({r: 1, p: 0})

    expect(Converter.convertRecord({
      storeName: 'disabled',
      dir: 'left',
      record: {reason: 'gdpr', pending: false}
    })).toEqual({r: 2, p: 0})

    expect(Converter.convertRecord({
      storeName: 'disabled',
      dir: 'left',
      record: {reason: 'gdpr', pending: true}
    })).toEqual({r: 2, p: 1})

    expect(Converter.convertRecord({
      storeName: 'disabled',
      dir: 'left',
      record: {reason: 'gdpr'}
    })).toEqual({r: 2})

    expect(Converter.convertRecord({
      storeName: 'disabled',
      dir: 'right',
      record: {r: 1, p: 0}
    })).toEqual({reason: 'general', pending: false})

    expect(Converter.convertRecord({
      storeName: 'disabled',
      dir: 'right',
      record: {r: 2, p: 0}
    })).toEqual({reason: 'gdpr', pending: false})

    expect(Converter.convertRecord({
      storeName: 'disabled',
      dir: 'right',
      record: {r: 2, p: 1}
    })).toEqual({reason: 'gdpr', pending: true})

    expect(Converter.convertRecord({
      storeName: 'disabled',
      dir: 'right',
      record: {r: 2}
    })).toEqual({reason: 'gdpr'})

  })

})
