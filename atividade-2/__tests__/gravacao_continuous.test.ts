import app from '../src/app';
import * as request from 'supertest';
import SUCCESS from '../src/utils/success';
import * as data from './data';

jest.mock('../src/dbs/mongo/Mongo');
jest.mock('../src/utils/MongoEvent');

test('Recover camera', async () => {
  await request(app).get('/estabelecimento/camera').set('Authorization', `Bearer ${data.testMasterToken}`).send().expect(200);
});

test('Recover camera dia', async () => {
  await request(app).get('/estabelecimento/camera/dia').set('Authorization', `Bearer ${data.testMasterToken}`).send().expect(200);
});

test('Recover camera dia query', async () => {
  await request(app)
    .get('/estabelecimento/camera/dia/query?_id=camera')
    .set('Authorization', `Bearer ${data.testMasterToken}`)
    .send()
    .expect(200);
});

test('Create camera dia', async () => {
  const response = await request(app)
    .post('/estabelecimento/camera/dia')
    .set('Authorization', `Bearer ${data.testMasterToken}`)
    .send(data.gravacao)
    .expect(201);
  expect(response.text).toEqual(SUCCESS.OPERATIONS.CREATE_EVENT);
});

test('Update camera dia', async () => {
  const response = await request(app)
    .put('/estabelecimento/camera/dia')
    .set('Authorization', `Bearer ${data.testMasterToken}`)
    .send(data.gravacao)
    .expect(200);
  expect(response.text).toEqual(SUCCESS.OPERATIONS.UPDATE_EVENT);
});

test('Update camera dia id', async () => {
  const response = await request(app)
    .put('/estabelecimento/camera/dia/id')
    .set('Authorization', `Bearer ${data.testMasterToken}`)
    .send(data.event)
    .expect(200);
  expect(response.text).toEqual(SUCCESS.OPERATIONS.UPDATE_EVENT);
});

test('Delete camera dia id', async () => {
  await request(app).delete('/estabelecimento/camera/dia/id').set('Authorization', `Bearer ${data.testMasterToken}`).send().expect(204);
});

test('Delete camera dia', async () => {
  await request(app).delete('/estabelecimento/camera/dia').set('Authorization', `Bearer ${data.testMasterToken}`).send().expect(204);
});
