export default class MongoEvent {
  constructor(dbAdress: string) {}

  async createEvent(event: any, dbName: string, collectionName: string) {}

  async getEventByID(id: string, dbName: string, collectionName: string) {
    return [
      {
        _id: '20191202',
        eventos: [
          {
            _id: '1575336000',
            favorited: true,
            visualized: false,
            link_bucket: [
              'https://storage.googleapis.com/subway-iguatemi-sc-alt-media/2019-12-02/0f8aac5ddbd050927fd10014a63680_1575336000.mp4'
            ],
            timestamp: 1575336000
          },
          {
            _id: '1575291600',
            favorited: true,
            visualized: false,
            link_bucket: [
              'https://storage.googleapis.com/subway-iguatemi-sc-alt-media/2019-12-02/10f2c75ddbd050927fd10014a63680_1575291600.mp4'
            ],
            timestamp: 1575291600
          }
        ]
      }
    ];
  }

  async getAll(dbName: string, collectionName: string) {}

  async queryEvents(query: any, projection: any, skip: number, limit: number, dbName: string, collectionName: string) {}

  async queryEventsByID(query: any, projection: any, dbName: string, collectionName: string) {
    return [
      {
        _id: '20191202',
        eventos: [
          {
            _id: '1575336000',
            favorited: true,
            visualized: false,
            link_bucket: [
              'https://storage.googleapis.com/subway-iguatemi-sc-alt-media/2019-12-02/0f8aac5ddbd050927fd10014a63680_1575336000.mp4'
            ],
            timestamp: 1575336000
          },
          {
            _id: '1575291600',
            favorited: true,
            visualized: false,
            link_bucket: [
              'https://storage.googleapis.com/subway-iguatemi-sc-alt-media/2019-12-02/10f2c75ddbd050927fd10014a63680_1575291600.mp4'
            ],
            timestamp: 1575291600
          }
        ]
      }
    ];
  }

  async countEvents(query: any, projection: any, dbName: string, collectionName: string) {}

  async deleteEvent(id: string, dbName: string, collectionName: string) {}

  async updateEvent(id: string, data: object, dbName: string, collectionName: string) {}

  async updateEventPush(id: string, data: object, dbName: string, collectionName: string) {}
}
