export const SECOND = 1000
export const MINUTE = SECOND * 60
export const HOUR = MINUTE * 60
export const DAY = HOUR * 24

export enum DISABLE_REASONS {
  REASON_GENERAL = 'general',
  REASON_GDPR = 'gdpr'
}

export const HTTP_ERRORS = {
  'TRANSACTION_ERROR': 'XHR transaction failed due to an error',
  'SERVER_MALFORMED_RESPONSE': 'Response from server is malformed',
  'SERVER_INTERNAL_ERROR': 'Internal error occurred on the server',
  'SERVER_CANNOT_PROCESS': 'Server was not able to process the request, probably due to error coming from the client',
  'NO_CONNECTION': 'No internet connectivity',
  'SKIP': 'Skipping slower attempt',
  'MISSING_URL': 'Url is not provided'
}

export enum STORAGE_TYPES {
  NO_STORAGE = 'noStorage',
  INDEXED_DB = 'indexedDB',
  LOCAL_STORAGE = 'localStorage'
}

export const PUB_SUB_EVENTS = {
  WEB_UUID_CREATED: 'activity:web_uuid',
  ATTRIBUTION_RECEIVED: 'activity:attribution',
}
