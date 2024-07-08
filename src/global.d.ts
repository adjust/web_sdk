type Nullable<T> = T | null

type Maybe<T> = T | undefined

interface Window {
  indexedDB: Maybe<IDBFactory>
  mozIndexedDB: Maybe<IDBFactory>
  webkitIndexedDB: Maybe<IDBFactory>
  msIndexedDB: Maybe<IDBFactory>
}

interface IDBError extends Event {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  target: any
}

interface IDBRequest<T> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onerror: ((this: IDBRequest<T>, ev: IDBError) => any) | null;
}

interface IDBVersionChangeEventTarget extends EventTarget {
  result: IDBDatabase
  transaction: IDBTransaction
}

interface IDBVersionChangeEvent {
  target: IDBVersionChangeEventTarget
}

interface IDBOpenDBEventTarget extends EventTarget {
  result: IDBDatabase | null
}

interface IDBOpenDBEvent extends Event {
  target: IDBOpenDBEventTarget
}

interface IDBOpenDBRequest extends IDBRequest<IDBDatabase> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onsuccess: ((this: IDBOpenDBRequest, ev: IDBOpenDBEvent) => any) | null;
}

interface OpenIDBCursorEventTarget extends EventTarget {
  result: IDBCursorWithValue | null
}

interface OpenIDBCursorEvent extends Event {
  target: OpenIDBCursorEventTarget
}

interface OpenIDBCursorRequest extends IDBRequest<IDBCursorWithValue | null> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onsuccess: ((this: OpenIDBCursorRequest, ev: OpenIDBCursorEvent) => any) | null;
}
