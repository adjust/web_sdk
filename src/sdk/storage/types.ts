import { isObject } from '../utilities'

type Error = {
  name: string;
  message: string;
}

enum KeyRangeCondition {
  LowerBound = 'lowerBound',
  UpperBound = 'upperBound'
}

type StoredValue = string | number

type StoredRecordId = StoredValue | Array<StoredValue>

type StoredRecord = Record<string, StoredValue | Record<string, StoredValue>>

interface IStorage {
  getAll: (storeName: string, firstOnly?: boolean) => Promise<Array<StoredRecord>>;
  getFirst: (storeName: string) => Promise<Maybe<StoredRecord>>;
  getItem: (storeName: string, id: StoredRecordId) => Promise<StoredRecord>;
  filterBy: (storeName: string, by: StoredValue) => Promise<Array<StoredRecord>>;
  addItem: (storeName: string, target: StoredRecord) => Promise<StoredRecordId>;
  addBulk: (storeName: string, records: Array<StoredRecord>, overwrite: boolean) => Promise<Array<StoredRecordId>>;
  updateItem: (storeName: string, target: StoredRecord) => Promise<StoredRecordId>;
  deleteItem: (storeName: string, id: StoredRecordId) => Promise<StoredRecordId>;
  deleteBulk: (storeName: string, value: StoredValue, condition?: KeyRangeCondition) => Promise<Array<StoredRecordId>>;
  trimItems: (storeName: string, length: number) => Promise<Array<StoredRecordId>>;
  count: (storeName: string) => Promise<number>;
  clear: (storeName: string) => Promise<void>;
  destroy: () => void;
}

function valueIsRecord(value: StoredValue | Record<string, unknown>): value is Record<string, unknown> {
  return isObject(value)
}

export { IStorage, KeyRangeCondition, StoredValue, StoredRecord, StoredRecordId, Error, valueIsRecord }
