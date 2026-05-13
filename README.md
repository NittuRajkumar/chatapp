# ChatApp — Real-Time Chat Application

A full-stack real-time chat application built with React.js, Node.js, Express.js, Socket.io, and SQLite.

## Live Demo

- **Frontend:** https://chatapp-frontend.vercel.app
- **Backend:** https://chatapp-backend.onrender.com

---

## Features

- JWT-based user authentication (register, login, logout)
- Public chat rooms — create, join, search
- Private direct messaging (DMs) between users
- Real-time messaging via Socket.io
- Typing indicators (live, per room/DM)
- Online/offline user presence
- Message read receipts for DMs (✓✓)
- Message editing and soft deletion
- @mention notifications with bell badge
- Unread message badges per room
- Markdown support in messages (bold, italic, code, lists)
- Responsive dark UI — works on mobile and desktop

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React.js, Vite, Tailwind CSS |
| State | Context API (Auth, Chat, Socket, Presence, Notif) |
| Rich Text | react-markdown, remark-gfm, rehype-sanitize |
| Backend | Node.js, Express.js |
| Real-time | Socket.io |
| Auth | JWT + bcryptjs |
| Database | SQLite + Sequelize ORM |
| Testing | Jest + Supertest |
| Deployment | Vercel (frontend), Render (backend) |

---

## Project Structure
chatapp/
├── client/ # React frontend (Vite)
│ ├── src/
│ │ ├── components/ # Sidebar, ChatWindow, MessageBubble, etc.
│ │ ├── context/ # AuthContext, ChatContext, SocketContext, etc.
│ │ ├── pages/ # LoginPage, RegisterPage, DashboardPage
│ │ └── utils/ # axios instance
│ └── package.json
├── server/ # Node.js backend
│ ├── src/
│ │ ├── controllers/ # auth, room, message, conversation controllers
│ │ ├── middleware/ # authenticateJWT, validateInput
│ │ ├── models/ # Sequelize models (User, Room, Message, etc.)
│ │ ├── routes/ # Express route definitions
│ │ └── socket/ # Socket.io event handlers
│ ├── tests/ # Jest + Supertest test suites
│ └── package.json
└── README.md


---

## Database Schema
users
id, username, email, passwordHash, avatarUrl, status, lastSeen, createdAt

rooms
id, name, description, isPublic, createdById, createdAt

conversations
id, isPrivate, createdById, createdAt

conversation_users (junction)
userId, conversationId, joinedAt, lastReadAt

messages
id, content, senderId, roomId*, conversationId*, isEdited, isDeleted, readAt, createdAt, updatedAt
(* one of roomId or conversationId is set, not both)

mentions
id, messageId, mentionedUserId


### Relationships
- `User` hasMany `Messages` (as sender)
- `Room` hasMany `Messages`
- `Conversation` belongsToMany `Users` through `ConversationUsers`
- `Message` belongsTo `User` (sender), `Room`, or `Conversation`
- `Message` hasMany `Mentions`

---

## Local Setup

### Prerequisites
- Node.js 18+
- npm 9+

### 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/chatapp.git
cd chatapp
```

### 2. Backend setup

```bash
cd server
npm install
```

Create `server/.env`:

PORT=5000
JWT_SECRET=your_super_secret_key_here
CLIENT_URL=http://localhost:5173
NODE_ENV=development


Start the backend:

```bash
npm run dev
```

The server runs at `http://localhost:5000`. SQLite database (`chat.sqlite`) is created automatically on first run via Sequelize sync.

### 3. Frontend setup

Open a new terminal:

```bash
cd client
npm install
```

Create `client/.env`:

VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000


Start the frontend:

```bash
npm run dev
```

The app runs at `http://localhost:5173`.

---

## Running Tests

```bash
cd server
npm test
```

Tests use an in-memory SQLite database — your `chat.sqlite` is never touched.

**Test coverage:**
- `auth.test.js` — register, login, /me endpoint (9 tests)
- `rooms.test.js` — create, list, search, message history (6 tests)
- `messages.test.js` — edit, delete, authorization (5 tests)

---

## Architecture Overview

### Frontend
The React app uses five Context providers layered in `App.jsx`:
- **AuthContext** — user identity, JWT token, login/logout
- **SocketContext** — single Socket.io connection, auto-connects on login
- **ChatContext** — rooms list, DM list, active conversation, messages
- **PresenceContext** — online status map, typing indicators (driven by socket events)
- **NotifContext** — @mention notifications, unread room badges

### Backend
Express handles REST (auth, rooms, messages, conversations). Socket.io handles all real-time events. The socket middleware verifies the JWT on every connection, attaches `socket.user`, and sets the user status to `online` in the DB.

### Socket Event Flow (message send)
Client emits message:send → server saves to SQLite
→ broadcasts message:new to room
→ parses @mentions → saves to mentions table
→ emits notification:mention to mentioned user's socket


### Real-time Presence
On `connection` — user status set to `online`, broadcast `user:status`  
On `disconnect` — user status set to `offline`, broadcast `user:status`

---

