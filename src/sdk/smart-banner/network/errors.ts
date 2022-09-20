export interface NetworkError {
  status: number;
  message: string;
}

export const NoConnectionError: NetworkError = {
  status: 0,
  message: 'No internet connectivity'
}
