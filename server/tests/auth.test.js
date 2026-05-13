process.env.JWT_SECRET = 'test_secret_key';
process.env.NODE_ENV = 'test';

const request = require('supertest');
const express = require('express');
const { sequelize } = require('../src/models/index');
const authRoutes = require('../src/routes/auth.routes');

const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);

beforeAll(async () => {
  await sequelize.sync({ force: true });
});

afterAll(async () => {
  await sequelize.close();
});

describe('POST /api/auth/register', () => {
  it('registers a new user and returns token', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ username: 'testuser', email: 'test@test.com', password: 'password123' });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('token');
    expect(res.body.user.username).toBe('testuser');
  });

  it('rejects duplicate email', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ username: 'other2', email: 'test@test.com', password: 'password123' });

    expect(res.statusCode).toBe(409);
    expect(res.body.message).toBe('Email already registered');
  });

  it('rejects duplicate username', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ username: 'testuser', email: 'unique@test.com', password: 'password123' });

    expect(res.statusCode).toBe(409);
    expect(res.body.message).toBe('Username taken');
  });

  it('rejects missing fields', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ username: 'nopass' });

    expect(res.statusCode).toBe(400);
  });
});

describe('POST /api/auth/login', () => {
  it('logs in with correct credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@test.com', password: 'password123' });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('token');
    expect(res.body.user.status).toBe('online');
  });

  it('rejects wrong password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@test.com', password: 'wrongpass' });

    expect(res.statusCode).toBe(401);
    expect(res.body.message).toBe('Invalid credentials');
  });

  it('rejects non-existent email', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'nobody@test.com', password: 'password123' });

    expect(res.statusCode).toBe(401);
  });

  it('rejects missing fields', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@test.com' });

    expect(res.statusCode).toBe(400);
  });
});

describe('GET /api/auth/me', () => {
  it('returns user data with valid token', async () => {
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@test.com', password: 'password123' });

    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${loginRes.body.token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.username).toBe('testuser');
  });

  it('rejects request without token', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.statusCode).toBe(401);
  });

  it('rejects invalid token', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', 'Bearer invalidtoken');
    expect(res.statusCode).toBe(401);
  });
});