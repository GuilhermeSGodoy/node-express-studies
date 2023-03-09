// eslint-disable-next-line no-unused-vars
import { MongoClient, FilterQuery, UpdateQuery, UpdateOneOptions } from 'mongodb';

export default class Mongo {
  protected _connection: MongoClient;
  protected dbAdress: string;
  protected logger: any;
  constructor(dbAdress: string, logger?: any) {
    this.dbAdress = dbAdress;
    if (logger) {
      this.logger = logger;
    }
  }

  private async initialize() {
    try {
      this._connection = await MongoClient.connect(`mongodb://${this.dbAdress}`, { useUnifiedTopology: true });
      if (this.logger) {
        this.logger.info(`[mongo] ${this.dbAdress} connected`);
      } else {
        console.log('[mongo] connected', this.dbAdress);
      }
    } catch (error) {
      if (this.logger) {
        this.logger.info(`[mongo] error ${this.dbAdress}\n${error}`);
      } else {
        console.log('[mongo] error', this.dbAdress, error);
      }
    }
  }

  async save(dbName: string, collectionName: string, docs: any) {
    if (!this._connection) await this.initialize();
    return this._connection.db(dbName).collection(collectionName).insertOne(docs);
  }

  async update(
    dbName: string,
    collectionName: string,
    filter: FilterQuery<any>,
    update: UpdateQuery<any> | Partial<any>,
    options?: UpdateOneOptions
  ) {
    if (!this._connection) await this.initialize();
    return this._connection.db(dbName).collection(collectionName).updateOne(filter, update, options);
  }

  async load(dbName: string, collectionName: string, query?: FilterQuery<any>) {
    if (!this._connection) await this.initialize();
    return this._connection.db(dbName).collection(collectionName).find(query).toArray();
  }

  async loadMap(dbName: string, collectionName: string, query: FilterQuery<any>, f: any) {
    if (!this._connection) await this.initialize();
    return this._connection.db(dbName).collection(collectionName).find(query).map(f).toArray();
  }

  async loadPipeline(dbName: string, collectionName: string, pipeline?: object[]) {
    if (!this._connection) await this.initialize();
    return this._connection.db(dbName).collection(collectionName).aggregate(pipeline).toArray();
  }

  async delete(dbName: string, collectionName: string, filter: FilterQuery<any>) {
    if (!this._connection) await this.initialize();
    return this._connection.db(dbName).collection(collectionName).deleteOne(filter);
  }

  async drop(dbName: string, collectionName: string) {
    if (!this._connection) await this.initialize();
    return this._connection.db(dbName).collection(collectionName).drop();
  }
}
