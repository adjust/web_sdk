import { Storage } from './storage'

export class InMemoryStorage implements Storage {
  private items: Record<string, any> = {}

  public setItem(key: string, value: any): void {
    this.items[key] = value
  }

  public getItem(key: string): any | null {
    return Object.prototype.hasOwnProperty.call(this.items, key) ? this.items[key] : null
  }

  public removeItem(key: string): void {
    delete this.items[key]
  }
}
