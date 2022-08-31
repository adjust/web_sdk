export interface Network {
  endpoint: string;
  request: <T>(path: string, params?: Record<string, string | number | boolean>) => Promise<T>;
}

export class NetworkDecorator implements Network {
  constructor(protected network: Network) { }

  public get endpoint(): string {
    return this.network.endpoint
  }

  public set endpoint(value: string) {
    this.network.endpoint = value
  }

  request<T>(path: string, params?: Record<string, string | number | boolean>): Promise<T> {
    return this.network.request(path, params)
  }
}
