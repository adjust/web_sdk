interface IStorage {
  getAll: (storeName: string, firstOnly: boolean) => Promise<any | Array<any>>;
  getFirst: (storeName: string) => Promise<any>;
  getItem: (storeName: string, target: any) => Promise<any>;
  filterBy: (storeName: string, by: string) => Promise<any>;
  addItem: (storeName: string, target) => Promise<any>;
  addBulk: (storeName: string, target, overwrite: boolean) => Promise<any>;
  updateItem: (storeName: string, target) => Promise<any>;
  deleteItem: (storeName: string, target) => Promise<any>;
  deleteBulk: (storeName: string, value: any, condition?: 'lowerBound' | 'upperBound') => Promise<any>;
  trimItems: (storeName: string, length: number) => Promise<any>;
  count: (storeName: string) => Promise<number>;
  clear: (storeName: string) => void;
  destroy: () => void;
}

type Error = {
  name: string;
  message: string;
}

export {
  IStorage, Error
}
