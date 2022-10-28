import { parseJson } from '../utilities'
import { Storage } from './storage'

export class LocalStorage implements Storage {
  constructor(private storageName: string = 'adjust-smart-banner') {}

  setItem(key: string, value: any): void {
    localStorage.setItem(`${this.storageName}.${key}`, JSON.stringify(value))
  }

  getItem(key: string): any | null {
    const value = localStorage.getItem(`${this.storageName}.${key}`)
    return parseJson(value)
  }

  removeItem(key: string): void {
    localStorage.removeItem(`${this.storageName}.${key}`)
  }
}
