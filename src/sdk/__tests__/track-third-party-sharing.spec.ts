import {
  trackThirdPartySharing,
  ThirdPartySharing
} from '../track-third-party-sharing';
import * as Logger from '../logger'

jest.mock('../logger')

describe('third party sharing functionality', () => {
  beforeAll(() => {
    jest.spyOn(Logger.default, 'warn')
    jest.spyOn(Logger.default, 'error')
  })

  afterAll(() => {
    jest.restoreAllMocks()
    jest.clearAllTimers()
  })

  describe('ThirdPartySharing class', () => {
    it.each([
      //[value, expected, logsWarning]
      [true, true, false],
      [false, false, false],
      [0, false, true],
      [undefined, false, true],
      [null, false, true],
      [1, true, true],
      ['string', true, true],
    ])('initialises with isEnabled flag', (value, expected, logsWarning) => {
      const options = new ThirdPartySharing(value as any)
      expect(options.isEnabled).toBe(expected)

      if (logsWarning) {
        expect(Logger.default.warn).toHaveBeenCalledWith(`isEnabled should be boolean, converting ${value} results ${expected}`)
      }
    })

    describe('granular options', () => {
      it('adds granular option', () => {
        const options = new ThirdPartySharing(true)
        options.addGranularOption('partnerName', 'optionKey', 'value')

        expect(options.granularOptions).toEqual({ 'partnerName': { 'optionKey': 'value' } })
      })

      it('adds multiple granular options', () => {
        const options = new ThirdPartySharing(true)
        options.addGranularOption('partner_1', 'optionKey', '1')
        options.addGranularOption('partner_2', 'optionKey', '0')

        expect(options.granularOptions).toEqual({ 'partner_1': { 'optionKey': '1' }, 'partner_2': { 'optionKey': '0' } })
      })

      it('adds multiple granular options to single partnerName', () => {
        const options = new ThirdPartySharing(true)
        options.addGranularOption('partnerName', 'key_1', '1')
        options.addGranularOption('partnerName', 'key_2', '0')

        expect(options.granularOptions).toEqual({ 'partnerName': { 'key_1': '1', 'key_2': '0' } })
      })

      it('replaces granular option with same partnerName and key', () => {
        const options = new ThirdPartySharing(true)
        options.addGranularOption('partnerName', 'key', 'first')
        options.addGranularOption('partnerName', 'key', 'second')

        expect(options.granularOptions).toEqual({ 'partnerName': { 'key': 'second' } })
      })

      it.each([
        ['partnerName', 'key', undefined],
        ['partnerName', undefined, undefined],
        [undefined, 'key', 'value'],
        ['partner', '', 'value'],
        ['', 'key', 'value'],
        ['', '', ''],
      ])('logs an error if any parameter is absent', (partnerName, key, value) => {
        const options = new ThirdPartySharing(true)
        options.addGranularOption(partnerName as any, key as any, value as any)

        expect(Logger.default.error).toHaveBeenCalledWith('Cannot add granular option, partnerName, key and value are mandatory')
      })
    })

    describe('partner sharing settings', () => {
      it('adds partner sharing setting', () => {
        const options = new ThirdPartySharing(true)
        options.addPartnerSharingSetting('partnerName', 'optionKey', true)

        expect(options.partnerSharingSettings).toEqual({ 'partnerName': { 'optionKey': true } })
      })

      it('adds multiple partner sharing settings', () => {
        const options = new ThirdPartySharing(true)
        options.addPartnerSharingSetting('partner_1', 'optionKey', true)
        options.addPartnerSharingSetting('partner_2', 'optionKey', false)

        expect(options.partnerSharingSettings).toEqual({ 'partner_1': { 'optionKey': true }, 'partner_2': { 'optionKey': false } })
      })

      it('adds partner sharing settings to single partnerName', () => {
        const options = new ThirdPartySharing(true)
        options.addPartnerSharingSetting('partnerName', 'key_1', true)
        options.addPartnerSharingSetting('partnerName', 'key_2', false)

        expect(options.partnerSharingSettings).toEqual({ 'partnerName': { 'key_1': true, 'key_2': false } })
      })

      it('replaces partner sharing setting with same partnerName and key', () => {
        const options = new ThirdPartySharing(true)
        options.addPartnerSharingSetting('partnerName', 'key', true)
        options.addPartnerSharingSetting('partnerName', 'key', false)

        expect(options.partnerSharingSettings).toEqual({ 'partnerName': { 'key': false } })
      })

      it.each([
        ['partnerName', 'key', undefined],
        ['partnerName', undefined, undefined],
        [undefined, 'key', true],
        ['partner', '', true],
        ['', 'key', true],
        ['', '', true],
      ])('logs an error if any parameter is absent', (partnerName, key, value) => {
        const options = new ThirdPartySharing(true)
        options.addPartnerSharingSetting(partnerName as any, key as any, value as any)

        expect(Logger.default.error).toHaveBeenCalledWith('Cannot add granular option, partnerName, key and value are mandatory')
      })
    })

  })

})
