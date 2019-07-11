/* eslint class-methods-use-this: "off" */

import { Storage, StorageAdapter, Doc } from './storage';

const store = new Map<string, Map<string, any>>();

function getCollection(namespace: string, collectionName: string): Map<string, any> {
  return store.get(`${namespace}.${collectionName}`) || new Map<string, any>();
}

function setCollection(namespace: string, collectionName: string, collection: Map<string, any>): void {
  store.set(`${namespace}.${collectionName}`, collection);
}

export class Memory implements StorageAdapter {
  async count(namespace: string, collectionName: string): Promise<number> {
    const docs = await this.find(namespace, collectionName);
    return docs.length;
  }

  async find(namespace: string, collectionName: string): Promise<any[]> {
    const collection = getCollection(namespace, collectionName);
    return Array.from(collection.values());
  }

  async findById(namespace: string, collectionName: string, id: string): Promise<any> {
    const docs = await this.find(namespace, collectionName);
    return docs.find((doc): boolean => doc._id === id);
  }

  async save(namespace: string, collectionName: string, docs: any[]): Promise<any[]> {
    const collection = getCollection(namespace, collectionName);
    docs.forEach((doc): void => {
      collection.set(doc._id, doc);
    });
    setCollection(namespace, collectionName, collection);
    return docs;
  }

  async removeById(namespace: string, collectionName: string, id: string): Promise<number> {
    const collection = getCollection(namespace, collectionName);
    if (collection.delete(id)) {
      setCollection(namespace, collectionName, collection);
      return 1;
    }
    return 0;
  }

  async clear(namespace: string, collectionName: string): Promise<number> {
    const count = await this.count(namespace, collectionName);
    store.delete(`${namespace}.${collectionName}`);
    return count;
  }

  clearDatabase(namespace: string, exclude?: string[]): Promise<void> {
    throw new Error('Method not implemented.');
  }
}

export class MemoryStorage<T extends Doc> extends Storage<T> {
  get storageAdapter(): Memory {
    return new Memory();
  }
}
