import Logger from '../../logger'
import { DeviceOS } from '../detect-os'
import { request } from './network'

export enum Position {
  Top = 'top',
  Bottom = 'bottom'
}

export interface SmartBannerData {
  position: Position;
  imageUrl?: string;
  header: string;
  description: string;
  buttonText: string;
  dismissInterval: number;
  tracker: string;
  deeplinkPath?: string;
}

interface SmartBannerResponce {
  platform: DeviceOS,
  position: Position,
  tracker: string,
  deeplink_path: string,
  title: string;
  description: string;
  button_label: string;
  image_url?: string;
}

export function fetchSmartBannerData(appWebToken: string, deviceOs: DeviceOS): Promise<SmartBannerData | null> {
  const path = '/smart_banner'

  return request<SmartBannerResponce[]>(path, {'app_web_token': appWebToken})
    .then(banners => {
      const banner = banners.find(item => item.platform === deviceOs)

      if (!banner) {
        return null
      }

      const data: SmartBannerData = {
        position: banner.position,
        imageUrl: banner.image_url,
        header: banner.title,
        description: banner.description,
        buttonText: banner.button_label,
        dismissInterval: 24 * 60 * 60 * 1000, // 1 day in millis before show banner next time
        tracker: banner.tracker,
        deeplinkPath: banner.deeplink_path,
      }

      return data
    })
    .catch(error => {
      Logger.error('Network error occurred during loading Smart Banner: ' + JSON.stringify(error))
      return null
    })
}
