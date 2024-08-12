import Logger from './logger'
import { push } from './queue'

export interface ThirdPartySharingOptions {
  isEnabled: boolean;
  granularOptions: Record<string, Record<string, string>>;
  partnerSharingSettings: Record<string, Record<string, boolean>>;
}

export class ThirdPartySharing implements ThirdPartySharingOptions {
  private _isEnabled: boolean;
  private _granularOptions: Record<string, Record<string, string>> = {};
  private _partnerSharingSettings: Record<string, Record<string, boolean>> = {};

  constructor(isEnabled: boolean) {
    this._isEnabled = !!isEnabled
  }

  get isEnabled(): boolean {
    return this._isEnabled
  }

  get granularOptions(): Record<string, Record<string, string>> {
    return this._granularOptions
  }

  get partnerSharingSettings(): Record<string, Record<string, boolean>> {
    return this._partnerSharingSettings
  }

  public addGranularOption(partnerName: string, key: string, value: string) {
    if (!partnerName || !key || value === undefined) {
      Logger.error('Cannot add granular option, partnerName, key and value are mandatory');
      return;
    }

    const pair = { [key]: value };

    if (this.granularOptions[partnerName]) {
      this.granularOptions[partnerName] = { ...this.granularOptions[partnerName], ...pair };
    } else {
      this.granularOptions[partnerName] = pair;
    }
  }

  public addPartnerSharingSetting(partnerName: string, key: string, value: boolean) {
    if (!partnerName || !key || value === undefined) {
      Logger.error('Cannot add partner sharing setting, partnerName, key and value are mandatory');
      return;
    }

    const pair = { [key]: value };

    if (this.partnerSharingSettings[partnerName]) {
      this.partnerSharingSettings[partnerName] = { ...this.partnerSharingSettings[partnerName], ...pair };
    } else {
      this.partnerSharingSettings[partnerName] = pair;
    }
  }
}

export function trackThirdPartySharing(adjustThirdPartySharing: ThirdPartySharingOptions) {
  const params = {
    sharing: adjustThirdPartySharing.isEnabled ? 'enable' : 'disable',
    granularThirdPartySharingOptions: adjustThirdPartySharing.granularOptions,
    partnerSharingSettings: adjustThirdPartySharing.partnerSharingSettings
  }

  push({
    url: '/third_party_sharing',
    method: 'POST',
    params
  })
}
