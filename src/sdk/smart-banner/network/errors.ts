export interface NetworkError {
  status: number;
  code?: string;
  message: string;
}

export const NoConnectionError: NetworkError = {
  status: 0,
  code: 'NO_CONNECTION', // for compatibility with UrlStrategy
  message: 'No internet connectivity'
}
