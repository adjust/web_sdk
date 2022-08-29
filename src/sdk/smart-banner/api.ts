import Logger from '../logger'
import { DeviceOS } from './detect-os'
import { Network } from './network'

export enum Position {
  Top = 'top',
  Bottom = 'bottom'
}

export interface SmartBannerData {
  appId: string;
  appName: string;
  position: Position;
  imageUrl?: string;
  header: string;
  description: string;
  buttonText: string;
  dismissInterval: number;
  trackerToken: string;
  deeplinkPath?: string;
}

interface SmartBannerResponse {
  app: {
    name: string;
    default_store_app_id: string;
  };
  platform: DeviceOS;
  position: Position;
  tracker_token: string;
  deeplink_path: string;
  title: string;
  description: string;
  button_label: string;
  image_url?: string;
}

/**
 * Ensures response contains general info: title, description, button_label and tracker_token and converts response
 * to SmartBannerData
 */
function validate(response: Partial<SmartBannerResponse>): SmartBannerData | null {
  const { title, description, button_label, tracker_token } = response

  if (title && description && button_label && tracker_token) {
    return {
      appId: response.app?.default_store_app_id || '',
      appName: response.app?.name || '',
      position: response.position || Position.Bottom,
      imageUrl: response.image_url,
      header: title,
      description: description,
      buttonText: button_label,
      trackerToken: tracker_token,
      deeplinkPath: response.deeplink_path,
      dismissInterval: 24 * 60 * 60 * 1000, // 1 day in millis before show banner next time
    }
  }

  return null
}

export function fetchSmartBannerData(webToken: string, deviceOs: DeviceOS, network: Network): Promise<SmartBannerData | null> {
  const path = '/smart_banner'

  return network.request<Partial<SmartBannerResponse>[]>(path, { 'app_web_token': webToken })
    .then(banners => {
      const banner = banners.find(item => item.platform === deviceOs)

      if (!banner) {
        return null
      }

      return validate(banner)
    })
    .catch(error => {
      Logger.error('Network error occurred during loading Smart Banner: ' + JSON.stringify(error))
      return null
    })
}
