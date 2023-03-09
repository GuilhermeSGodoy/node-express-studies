import Mongo from '../dbs/mongo/Mongo'

export default class MongoEvent extends Mongo {
  constructor(dbAdress: string, logger?: any) {
    super(dbAdress, logger)
  }

  async createEvent(event: any, dbName: string, collectionName: string) {
    return this.save(dbName, collectionName, event)
  }

  async getEventByID(id: string, dbName: string, collectionName: string) {
    return this.load(dbName, collectionName, { _id: id })
  }

  async getAll(dbName: string, collectionName: string) {
    return this.load(dbName, collectionName, {})
  }

  async queryEvents(query: any, projection: any, skip: number, limit: number, dbName: string, collectionName: string) {
    return this.loadPipeline(dbName, collectionName, [
      {
        $match: query
      },
      {
        $project: {
          eventos: {
            $filter: {
              input: '$eventos',
              as: 'event',
              cond: { $and: projection }
            }
          }
        }
      },
      { $unwind: '$eventos' },
      { $sort: { 'eventos.timestamp': 1 } },
      { $skip: skip },
      { $limit: limit },
      {
        $group: {
          _id: '$_id',
          eventos: { $push: '$eventos' }
        }
      }
    ])
  }

  async queryEventsByID(query: any, projection: any, dbName: string, collectionName: string) {
    return this.loadPipeline(dbName, collectionName, [
      {
        $match: query
      },
      {
        $project: {
          eventos: {
            $filter: {
              input: '$eventos',
              as: 'event',
              cond: { $and: projection }
            }
          }
        }
      },
      { $unwind: '$eventos' },
      {
        $group: {
          _id: '$_id',
          eventos: { $push: '$eventos' }
        }
      }
    ])
  }

  async countEvents(query: any, projection: any, dbName: string, collectionName: string) {
    return this.loadPipeline(dbName, collectionName, [
      {
        $match: query
      },
      {
        $project: {
          eventos: {
            $filter: {
              input: '$eventos',
              as: 'event',
              cond: { $and: projection }
            }
          }
        }
      },
      { $unwind: '$eventos' },
      { $count: 'length' }
    ])
  }

  async deleteEvent(id: string, dbName: string, collectionName: string) {
    return this.delete(dbName, collectionName, { _id: id })
  }

  async updateEvent(id: string, data: object, dbName: string, collectionName: string) {
    return this.update(dbName, collectionName, { _id: id }, { $set: data }, { upsert: true })
  }

  async updateEventPush(id: string, data: object, dbName: string, collectionName: string) {
    return this.update(dbName, collectionName, { _id: id }, { $addToSet: { eventos: { $each: data } } })
  }
}
