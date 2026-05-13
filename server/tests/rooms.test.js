process.env.JWT_SECRET = 'test_secret_key';
process.env.NODE_ENV = 'test';

const request = require('supertest');
const express = require('express');
const { sequelize } = require('../src/models/index');
const authRoutes = require('../src/routes/auth.routes');
const roomRoutes = require('../src/routes/room.routes');

const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/rooms', roomRoutes);

let token;

beforeAll(async () => {
  await sequelize.sync({ force: true });
  const res = await request(app)
    .post('/api/auth/register')
    .send({ username: 'roomuser', email: 'room@test.com', password: 'password123' });
  token = res.body.token;
});

afterAll(async () => {
  await sequelize.close();
});

describe('POST /api/rooms', () => {
  it('creates a room with valid token', async () => {
    const res = await request(app)
      .post('/api/rooms')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'general', description: 'General chat' });

    expect(res.statusCode).toBe(201);
    expect(res.body.name).toBe('general');
    expect(res.body.isPublic).toBe(true);
  });

  it('rejects duplicate room name', async () => {
    const res = await request(app)
      .post('/api/rooms')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'general' });

    expect(res.statusCode).toBe(409);
  });

  it('rejects missing room name', async () => {
    const res = await request(app)
      .post('/api/rooms')
      .set('Authorization', `Bearer ${token}`)
      .send({ description: 'no name' });

    expect(res.statusCode).toBe(400);
  });

  it('rejects unauthenticated request', async () => {
    const res = await request(app)
      .post('/api/rooms')
      .send({ name: 'secret' });

    expect(res.statusCode).toBe(401);
  });
});

describe('GET /api/rooms', () => {
  it('returns list of rooms', async () => {
    const res = await request(app)
      .get('/api/rooms')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });

  it('filters rooms by search query', async () => {
    await request(app)
      .post('/api/rooms')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'random' });

    const res = await request(app)
      .get('/api/rooms?search=gen')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.every(r => r.name.includes('gen'))).toBe(true);
  });
});

describe('GET /api/rooms/:id/messages', () => {
  it('returns empty messages for new room', async () => {
    const roomRes = await request(app)
      .post('/api/rooms')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'emptyroom' });

    const res = await request(app)
      .get(`/api/rooms/${roomRes.body.id}/messages`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(0);
  });
});