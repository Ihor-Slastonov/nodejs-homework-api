const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
require('dotenv').config();

const { DB_HOST } = process.env;

mongoose.set('strictQuery', true);

describe('test login controller', () => {
  beforeAll(() => mongoose.connect(DB_HOST));
  afterAll(() => mongoose.disconnect(DB_HOST));

  test('the response must have a status code 200', async () => {
    const response = await request(app).post('/api/users/login').send({
      password: '111111',
      email: 'Gorec@gor.com',
    });
    expect(response.status).toBe(200);
  });

  test('the response should return a token', async () => {
    const response = await request(app).post('/api/users/login').send({
      password: '111111',
      email: 'Gorec@gor.com',
    });
    expect(response.body.data.token).toBeDefined();
  });

  test('the response should return a user object with two fields email and subscription, which have the data type String', async () => {
    const response = await request(app).post('/api/users/login').send({
      password: '111111',
      email: 'Gorec@gor.com',
    });
    const { user } = response.body.data;
    expect(typeof user).toBe('object');
    expect(user).toHaveProperty('email');
    expect(user).toHaveProperty('subscription');
    expect(typeof user.email).toBe('string');
    expect(typeof user.subscription).toBe('string');
  });
});
