/* eslint no-underscore-dangle: "off" */

import isString from 'lodash/isString';
import isArray from 'lodash/isArray';
import { Doc } from '@kinveysdk/storage';
import { Kmd } from '@kinveysdk/kmd';
import { getApiVersion } from '@kinveysdk/app';
import { KinveyError } from '@kinveysdk/errors';
import { DataStoreNetwork, FindNetworkOptions, NetworkOptions } from './network';

export interface MultiInsertResult<T extends Doc> {
  entities: T[];
  errors: KinveyError[];
}

export class NetworkStore<T extends Doc> {
  public collectionName: string;

  constructor(collectionName: string) {
    if (!isString(collectionName)) {
      throw new KinveyError('A collectionName is required and must be a string.');
    }

    this.collectionName = collectionName;
  }

  async find(query?: any, options?: FindNetworkOptions): Promise<T[]> {
    const network = new DataStoreNetwork(this.collectionName);
    const response = await network.find(query, options);
    return response.data;
  }

  create(doc: T, options?: NetworkOptions): Promise<T>
  create(docs: T[], options?: NetworkOptions): Promise<MultiInsertResult<T>>
  async create(docs: any, options?: NetworkOptions): Promise<any> {
    const batchSize = 100;
    const apiVersion = getApiVersion();

    if (apiVersion !== 5 && isArray(docs)) {
      throw new KinveyError('Unable to create an array of docs. Please create docs one by one.');
    }

    if (isArray(docs) && docs.length > batchSize) {
      let i = 0;

      const batchCreate = async (result: MultiInsertResult<T> = { entities: [], errors: [] }): Promise<MultiInsertResult<T>> => {
        if (i >= docs.length) {
          return result;
        }

        const batch = docs.slice(i, i + batchSize);
        i += batch.length;
        const batchResult = await this.create(batch as T[], options);
        return batchCreate({
          entities: result.entities.concat(batchResult.entities),
          errors: result.errors.concat(batchResult.errors)
        });
      };

      return batchCreate();
    }

    const network = new DataStoreNetwork(this.collectionName);
    const response = await network.create(docs, options);
    return response.data;
  }

  async update(doc: T, options?: NetworkOptions): Promise<T> {
    if (isArray(doc)) {
      throw new KinveyError('Unable to update an array of docs. Please update docs one by one.');
    }

    if (!doc._id) {
      throw new KinveyError('The doc does not contain an _id. An _id is required to update the doc.');
    }

    const network = new DataStoreNetwork(this.collectionName);
    const response = await network.update(doc, options);
    return response.data;
  }

  save(doc: T, options?: NetworkOptions): Promise<T>
  save(docs: T[], options?: NetworkOptions): Promise<T[]>
  save(docs: any, options?: NetworkOptions): Promise<any> {
    if (!isArray(docs)) {
      const kmd = new Kmd(docs._kmd);

      if (docs._id && !kmd.isLocal()) {
        return this.update(docs, options);
      }
    }

    return this.create(docs, options);
  }
}
