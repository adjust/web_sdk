export interface Storage {
  setItem(key: string, value: any): void;
  getItem(key: string): any | null;
  removeItem(key: string): void;
}
