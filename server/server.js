require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const helmet = require('helmet');
const syncDb = require('./src/config/syncDb');
const initSocket = require('./src/socket/index');

const authRoutes = require('./src/routes/auth.routes');
const roomRoutes = require('./src/routes/room.routes');
const conversationRoutes = require('./src/routes/conversation.routes');
const messageRoutes = require('./src/routes/message.routes');
const userRoutes = require('./src/routes/user.routes');

const app = express();
const server = http.createServer(app);

app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(express.json());

app.get('/health', (req, res) => res.json({ status: 'ok' }));
app.use('/api/auth', authRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/conversations', conversationRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/users', userRoutes);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong' });
});

initSocket(server);

const PORT = process.env.PORT || 5000;

syncDb().then(() => {
  server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});