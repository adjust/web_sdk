export interface Network {
  readonly endpoint: string;
  request: <T>(path: string, params?: Record<string, string | number | boolean>) => Promise<T>;
}
