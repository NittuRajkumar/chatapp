process.env.JWT_SECRET = 'test_secret_key';
process.env.NODE_ENV = 'test';

const request = require('supertest');
const express = require('express');
const { sequelize, Message } = require('../src/models/index');
const authRoutes = require('../src/routes/auth.routes');
const roomRoutes = require('../src/routes/room.routes');
const messageRoutes = require('../src/routes/message.routes');

const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/messages', messageRoutes);

let token, otherToken, userId, roomId, messageId;

beforeAll(async () => {
  await sequelize.sync({ force: true });

  const u1 = await request(app).post('/api/auth/register')
    .send({ username: 'msguser', email: 'msg@test.com', password: 'password123' });
  token = u1.body.token;
  userId = u1.body.user.id;

  const u2 = await request(app).post('/api/auth/register')
    .send({ username: 'other', email: 'other@test.com', password: 'password123' });
  otherToken = u2.body.token;

  const room = await request(app).post('/api/rooms')
    .set('Authorization', `Bearer ${token}`)
    .send({ name: 'testroom' });
  roomId = room.body.id;

  const msg = await Message.create({
    content: 'Hello world',
    senderId: userId,
    roomId,
  });
  messageId = msg.id;
});

afterAll(async () => {
  await sequelize.close();
});

describe('PUT /api/messages/:id', () => {
  it('edits own message', async () => {
    const res = await request(app)
      .put(`/api/messages/${messageId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ content: 'Edited content' });

    expect(res.statusCode).toBe(200);
    expect(res.body.content).toBe('Edited content');
    expect(res.body.isEdited).toBe(true);
  });

  it("rejects editing another user's message", async () => {
    const res = await request(app)
      .put(`/api/messages/${messageId}`)
      .set('Authorization', `Bearer ${otherToken}`)
      .send({ content: 'Hacked' });

    expect(res.statusCode).toBe(403);
  });

  it('rejects empty content', async () => {
    const res = await request(app)
      .put(`/api/messages/${messageId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ content: '' });

    expect(res.statusCode).toBe(400);
  });
});

describe('DELETE /api/messages/:id', () => {
  it('soft deletes own message', async () => {
    const msg = await Message.create({ content: 'to delete', senderId: userId, roomId });

    const res = await request(app)
      .delete(`/api/messages/${msg.id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.isDeleted).toBe(true);
  });

  it("rejects deleting another user's message", async () => {
    const msg = await Message.create({ content: 'other msg', senderId: userId, roomId });

    const res = await request(app)
      .delete(`/api/messages/${msg.id}`)
      .set('Authorization', `Bearer ${otherToken}`);

    expect(res.statusCode).toBe(403);
  });
});