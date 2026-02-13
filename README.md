# PlaySync Backend

> A comprehensive real-time gaming platform backend built with Node.js, Express, TypeScript, MongoDB, and Socket.IO

## 🎮 Overview

PlaySync is a modern gaming platform that connects players, manages competitive games, enables real-time chat, tracks performance through scorecards, maintains leaderboards, and keeps users engaged with in-app notifications.

## ✨ Key Features

- 🔐 **Secure Authentication** - JWT-based auth with access/refresh tokens
- 🎮 **Game Management** - Create, browse, join, and manage gaming events
- 💬 **Real-time Chat** - Live messaging within game rooms via Socket.IO
- 📊 **Performance Tracking** - Detailed scorecards with K/D ratios and statistics
- 🏆 **Leaderboard System** - Global rankings with cached results
- 🔔 **In-app Notifications** - Real-time push notifications for user engagement
- 👑 **Admin Dashboard** - User and content moderation tools
- 📱 **RESTful API** - Clean, well-documented endpoints
- ⚡ **WebSocket Support** - Real-time updates with Socket.IO rooms
- 🔒 **Role-based Access** - User and Admin roles with proper authorization

## 📚 Documentation

### Essential Guides

- **[Product Flow & Integration](PRODUCT_FLOW.md)** - Complete system architecture, user journeys, and feature capabilities
- **[API Reference](API_REFERENCE.md)** - Comprehensive API endpoint documentation with examples
- **[Frontend Integration Guide](FRONTEND_INTEGRATION_GUIDE.md)** - Visual guide for frontend developers with React/Next.js examples

### Module Documentation

- [Authentication Module](src/modules/auth/) - User registration, login, JWT tokens, password reset
- [Game Module](src/modules/game/) - Game CRUD, join/leave, real-time updates
- [Chat Module](src/modules/chat/) - Real-time messaging with Socket.IO
- [Scorecard Module](src/modules/scorecard/) - Performance tracking and statistics
- [Leaderboard Module](src/modules/leaderboard/) - Global rankings
- [Notification Module](src/modules/notification/README.md) - In-app notification system
- [Admin Module](src/modules/admin/) - Platform administration

## 🚀 Quick Start

### Prerequisites

```bash
Node.js >= 18.x
MongoDB >= 6.x
npm or yarn
```

### Installation

```bash
# Clone the repository
git clone https://github.com/Bibek1604/Backend-playsync.git
cd Backend-playsync

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env
# Edit .env with your configuration

# Start MongoDB (if local)
mongod

# Run development server
npm run dev
```

### Environment Variables

```env
# Server
PORT=5000
NODE_ENV=development

# Database
MONGO_URI=mongodb://localhost:27017/playsync

# JWT
JWT_SECRET=your-secret-key-here
JWT_REFRESH_SECRET=your-refresh-secret-here
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Frontend
CLIENT_URL=http://localhost:3000

# Cloudinary (for image uploads)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Email (for password reset)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
```

## 📖 API Documentation

Interactive API documentation available at:

```
http://localhost:5000/swagger
```

## 🏗️ Architecture

```
Backend (Node.js/Express/TypeScript)
├── REST API Endpoints (/api/v1)
├── Socket.IO Server (Real-time)
├── MongoDB Database
├── Cloudinary Integration (Images)
└── JWT Authentication

Modules:
├── Auth (Authentication & Authorization)
├── Game (Game Management)
├── Chat (Real-time Messaging)
├── Scorecard (Performance Tracking)
├── Leaderboard (Rankings)
├── Notification (In-app Alerts)
├── History (Activity Logging)
└── Admin (Platform Management)
```

## 🔌 Socket.IO Events

The platform uses Socket.IO for real-time communication:

### Rooms
- `user:${userId}` - User-specific notifications
- `game:${gameId}` - Game-specific events and chat
- `discovery` - Global game updates

### Events
- `notification` - New notifications
- `game:player:joined` - Player joined game
- `game:status:changed` - Game status updated
- `chat:message` - New chat message
- `chat:system` - System messages

See [Frontend Integration Guide](FRONTEND_INTEGRATION_GUIDE.md) for complete Socket.IO implementation.

## 🛣️ API Endpoints Overview

### Authentication
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/logout` - User logout
- `GET /api/v1/auth/profile` - Get user profile
- `PATCH /api/v1/auth/profile` - Update profile

### Games
- `GET /api/v1/games` - Browse games (with filters)
- `POST /api/v1/games` - Create game
- `GET /api/v1/games/:id` - Get game details
- `POST /api/v1/games/:id/join` - Join game
- `POST /api/v1/games/:id/leave` - Leave game
- `PATCH /api/v1/games/:id` - Update game (creator)
- `DELETE /api/v1/games/:id` - Delete game (creator)

### Chat
- `GET /api/v1/games/:gameId/chat/messages` - Get chat history
- Socket.IO for real-time messaging

### Scorecards
- `POST /api/v1/scorecard` - Create scorecard
- `GET /api/v1/scorecard/user/:userId` - Get user scorecards
- `GET /api/v1/scorecard/game/:gameId` - Get game scorecards

### Leaderboard
- `GET /api/v1/leaderboard` - Get global rankings

### Notifications
- `GET /api/v1/notifications` - Get user notifications
- `PATCH /api/v1/notifications/:id/read` - Mark as read
- `PATCH /api/v1/notifications/read-all` - Mark all as read

See [API Reference](API_REFERENCE.md) for complete documentation.

## 🧪 Testing

```bash
# Run tests (when implemented)
npm test

# Test specific endpoints
curl http://localhost:5000/api/v1/games
```

## 📦 Tech Stack

- **Runtime:** Node.js 18+
- **Framework:** Express.js
- **Language:** TypeScript
- **Database:** MongoDB with Mongoose
- **Real-time:** Socket.IO
- **Authentication:** JWT (jsonwebtoken)
- **Validation:** Zod
- **File Upload:** Cloudinary
- **Documentation:** Swagger/OpenAPI
- **Security:** bcryptjs, helmet, cors

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 👥 Authors

- **Bibek** - [GitHub](https://github.com/Bibek1604)

## 🙏 Acknowledgments

- Express.js team for the excellent framework
- Socket.IO for real-time capabilities
- MongoDB team for the database
- All contributors and supporters

---

**For detailed integration instructions, see:**
- [Product Flow & Features](PRODUCT_FLOW.md)
- [API Documentation](API_REFERENCE.md)
- [Frontend Integration](FRONTEND_INTEGRATION_GUIDE.md)

**Version:** 1.0.0  
**Last Updated:** February 2026
