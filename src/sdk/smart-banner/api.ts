import { DeviceOS } from './detect-os'

export enum Position {
  Top = 'top',
  Bottom = 'bottom'
}

export interface SmartBannerData {
  image: string;
  header: string;
  description: string;
  buttonText: string;
  dismissInterval: number;
  position: Position;
}

export function fetchSmartBannerData(appWebToken: string, deviceOs: DeviceOS): Promise<SmartBannerData | null> {
  return Promise.resolve({
    image: '',
    header: 'Adjust Smart Banners',
    description: 'Not so smart actually, but deep links do the magic anyway ololol',
    buttonText: 'Let\'s go!',
    dismissInterval: 24 * 60 * 60 * 1000, // 1 day in millis before show banner next time
    position: Position.Top
  })
}
