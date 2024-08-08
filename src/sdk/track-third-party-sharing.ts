import Logger from './logger'
import { push } from './queue'

export interface ThirdPartySharingOptions {
  isEnabled: boolean | null;
  granularOptions: Record<string, Record<string, string>>;
  partnerSharingSettings: Record<string, Record<string, boolean>>;
}

export class ThirdPartySharing implements ThirdPartySharingOptions {
  private _isEnabled: boolean | null;
  private _granularOptions: Record<string, Record<string, string>> = {};
  private _partnerSharingSettings: Record<string, Record<string, boolean>> = {};

  constructor(isEnabled?: boolean) {
    if (isEnabled === null || isEnabled === undefined) {
      this._isEnabled = null
    } else {
      this._isEnabled = isEnabled
    }
  }

  get isEnabled(): boolean | null {
    return this._isEnabled
  }

  get granularOptions(): Record<string, Record<string, string>> {
    return this._granularOptions
  }

  get partnerSharingSettings(): Record<string, Record<string, boolean>> {
    return this._partnerSharingSettings
  }

  public addGranularOption({ partnerName, key, value }: { partnerName: string, key: string, value: string }) {
    if (!partnerName || !key) {
      Logger.error("Cannot add granular option, partnerName and key are mandatory");
      return;
    }

    const pair = { key: value };

    if (this.granularOptions[partnerName]) {
      this.granularOptions[partnerName] = { ...this.granularOptions[partnerName], ...pair };
    } else {
      this.granularOptions[partnerName] = pair;
    }
  }

  public addPartnerSharingSetting({ partnerName, key, value }: { partnerName: string, key: string, value: boolean }) {
    if (!partnerName || !key) {
      Logger.error("Cannot add partner sharing setting, partnerName and key are mandatory");
      return;
    }

    const pair = { key: value };

    if (this.partnerSharingSettings[partnerName]) {
      this.partnerSharingSettings[partnerName] = { ...this.granularOptions[partnerName], ...pair };
    } else {
      this.partnerSharingSettings[partnerName] = pair;
    }
  }
}

export function trackThirdPartySharing(adjustThirdPartySharing: ThirdPartySharingOptions) {
  let params = {}
  if (adjustThirdPartySharing.isEnabled !== null || adjustThirdPartySharing.isEnabled !== undefined) {
    params = { 'sharing': adjustThirdPartySharing.isEnabled ? 'enable' : 'disable' }
  }
  params = {
    ...params,
    'granular_third_party_sharing_options': adjustThirdPartySharing.granularOptions,
    'partner_sharing_settings': adjustThirdPartySharing.partnerSharingSettings
  }

  push({
    url: '/third_party_sharing',
    method: 'POST',
    params
  })
}
