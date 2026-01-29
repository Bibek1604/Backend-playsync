# PlaySync Backend

A modern, secure authentication system built with Node.js, Express, and TypeScript. Includes user registration, login, JWT-based authentication with access/refresh tokens, and user profile management.

## 🚀 Features

- **User Authentication**
  - User registration with email validation
  - Admin registration with secret code validation
  - Secure login with password hashing (bcryptjs)
  - Dual JWT token system (access + refresh tokens)

- **User Management**
  - User profile retrieval
  - Profile updates
  - Avatar image upload
  - User listing for admins
  - Role-based access control

- **Security**
  - Password hashing with bcryptjs
  - JWT token verification
  - Environment variable secrets management
  - Input validation with Zod schemas
  - Admin-only operations with secret code

- **Developer Experience**
  - Full TypeScript support
  - Comprehensive error handling
  - Custom error classes with status codes
  - Production-ready logging with Pino
  - Express middleware for JWT verification

## 📋 Technology Stack

| Technology | Version | Purpose |
|-----------|---------|---------|
| **Node.js** | 18+ | JavaScript runtime |
| **TypeScript** | 5.9.3 | Type-safe JavaScript |
| **Express** | Latest | Web framework |
| **MongoDB** | Latest | NoSQL database |
| **Mongoose** | Latest | MongoDB ODM |
| **JWT** | jsonwebtoken | Token authentication |
| **Bcryptjs** | Latest | Password hashing |
| **Zod** | Latest | Schema validation |
| **Pino** | Latest | Logging |
| **ts-node-dev** | Latest | Development server |

## 📁 Project Structure

```
playsync-backend/
├── src/
│   ├── modules/
│   │   ├── auth/                    # Authentication module
│   │   │   ├── auth.controller.ts   # Request handlers
│   │   │   ├── auth.service.ts      # Business logic
│   │   │   ├── auth.model.ts        # User schema & interface
│   │   │   ├── auth.repository.ts   # Database access
│   │   │   ├── auth.routes.ts       # Route definitions
│   │   │   ├── auth.dto.ts          # Data transfer objects
│   │   │   └── auth.middleware.ts   # JWT verification
│   │   └── users/                   # User profile module
│   │       ├── users.controller.ts  # Request handlers
│   │       ├── users.service.ts     # Business logic
│   │       └── users.routes.ts      # Route definitions
│   ├── config/
│   │   ├── db.ts                    # MongoDB connection
│   │   ├── jwt.ts                   # Token signing/verification
│   │   └── redis.ts                 # Redis configuration
│   ├── utils/
│   │   ├── appError.ts              # Custom error class
│   │   ├── asyncHandler.ts          # Async handler wrapper
│   │   ├── validateDto.ts           # Validation middleware
│   │   ├── errorHandler.ts          # Global error handler
│   │   ├── logger.ts                # Pino logger config
│   │   ├── constants.ts             # App constants
│   │   ├── pagination.ts            # Pagination utilities
│   │   └── responseFormatter.ts     # Response formatting
│   ├── websocket/
│   │   ├── socket.server.ts         # Socket.IO setup
│   │   ├── chat.socket.ts           # Chat events
│   │   └── room.socket.ts           # Room events
│   ├── app.ts                       # Express app setup
│   └── server.ts                    # Server entry point
├── .env                             # Environment variables
├── .env.example                     # Environment template
├── package.json                     # Dependencies
├── tsconfig.json                    # TypeScript config
├── README.md                        # This file
└── API_RESPONSES.md                 # API documentation

```

## 🔧 Installation

### Prerequisites
- Node.js 18+ and npm/yarn
- MongoDB running locally or MongoDB Atlas connection string
- Git

### Steps

1. **Clone the repository**
```bash
git clone https://github.com/Bibek1604/Backend-playsync.git
cd Backend-playsync
```

2. **Install dependencies**
```bash
npm install
```

3. **Setup environment variables**
```bash
cp .env.example .env
```

Edit `.env` with your configuration:
```env
# Server
PORT=5000

# Database
MONGO_URI=mongodb://localhost:27017/playsync

# JWT Secrets
JWT_SECRET=playsync_secret
JWT_ACCESS_SECRET=super_access_secret
JWT_REFRESH_SECRET=super_refresh_secret

# Admin
ADMIN_SECRET=your-super-secret-key-2025

# Logging (optional)
LOG_LEVEL=debug
NODE_ENV=development
```

## 🚀 Running the Project

### Development Mode
```bash
npm run dev
```
Starts the server with hot reload at `http://localhost:5000`

### Production Mode
```bash
npm run build
npm start
```

### Check Swagger Docs
After starting the server, visit:
```
http://localhost:5000/swagger
```

## 🔐 Authentication Flow

### 1. User Registration
```
POST /auth/register/user
├── Validate input with Zod schema
├── Check if email already exists
├── Hash password with bcryptjs
├── Create user in MongoDB
├── Generate access token (15 minutes)
├── Generate refresh token (7 days)
└── Return tokens + user data
```

### 2. User Login
```
POST /auth/login
├── Validate input
├── Find user by email
├── Compare password hash
├── Generate new tokens
└── Return tokens + user data
```

### 3. Access Protected Routes
```
GET /users/me (with Authorization header)
├── Extract token from "Authorization: Bearer <token>"
├── Verify JWT signature
├── Attach user to request object
└── Process request
```

### 4. Token Refresh
```
POST /auth/refresh-token
├── Validate refresh token
├── Check token signature
├── Verify token hasn't been revoked
├── Generate new access token
├── Generate new refresh token
└── Return new tokens
```

## 📚 API Endpoints

### Authentication Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|-------|
| POST | `/auth/register/user` | Register new user | ❌ No |
| POST | `/auth/register/admin` | Register new admin | ❌ No |
| POST | `/auth/login` | Login user/admin | ❌ No |
| POST | `/auth/refresh-token` | Refresh access token | ❌ No |

### User Profile Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|-------|
| POST | `/profile` | Create user profile | ✅ Yes |
| GET | `/profile` | Get user profile | ✅ Yes |
| PUT | `/profile` | Update user profile | ✅ Yes |
| PATCH | `/profile/name` | Update user name | ✅ Yes |
| PATCH | `/profile/reset-password` | Reset password | ✅ Yes |
| POST | `/profile/avatar` | Upload avatar image | ✅ Yes |
| DELETE | `/profile` | Delete user profile | ✅ Yes |

## 📖 Example Requests

### Common Error Codes
| Status | Message | Cause |
|--------|---------|-------|
| 400 | Email already in use | Registration with existing email |
| 400 | Invalid email or password | Login with wrong credentials |
| 401 | Invalid admin code | Admin registration with wrong code |
| 401 | Unauthorized | Missing/invalid JWT token |
| 401 | Invalid refresh token | Refresh with expired/invalid token |

### Upload Avatar Image

**Endpoint:** `POST /api/v1/profile/avatar`

**Headers:**
```
Authorization: Bearer <your-jwt-token>
Content-Type: multipart/form-data
```

**Body (form-data):**
- `avatar`: Select an image file (max 5MB, image types only)

**Response:**
```json
{
  "success": true,
  "message": "Avatar uploaded successfully",
  "data": {
    "id": "...",
    "userId": "...",
    "avatar": "/uploads/avatars/avatar-1234567890-123456789.jpg",
    // ... other profile fields
  }
}
```

**Note:** Uploaded images are accessible at `http://localhost:5000/uploads/avatars/filename`

## 🛠️ Development

### Available Scripts

```bash
# Start development server
npm run dev

# Build TypeScript
npm run build

# Start production server
npm start

# Run tests (when available)
npm test

# Lint code
npm run lint
```

### Project Dependencies

**Core:**
- `express` - Web framework
- `typescript` - Type safety
- `mongoose` - MongoDB ODM
- `jsonwebtoken` - JWT tokens

**Utilities:**
- `zod` - Schema validation
- `bcryptjs` - Password hashing
- `dotenv` - Environment variables
- `pino` - Logging
- `cors` - Cross-origin requests

**Development:**
- `ts-node-dev` - Hot reload for TypeScript
- `@types/node` - Node.js types
- `@types/express` - Express types

## 🔐 Security Features

✅ **Password Security**
- Passwords hashed with bcryptjs (10 salt rounds)
- Pre-save Mongoose hook ensures automatic hashing

✅ **Token Security**
- Separate secrets for access and refresh tokens
- Short-lived access tokens (15 minutes)
- Long-lived refresh tokens (7 days)
- JWT signature verification on protected routes

✅ **Input Validation**
- Zod schema validation on all endpoints
- Email format validation
- Password strength requirements
- Admin secret code validation

✅ **Role-Based Access Control**
- User and Admin roles
- Middleware-based authorization
- Profile endpoints restricted to authenticated users

## 📝 Environment Variables

Create a `.env` file with:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
MONGO_URI=mongodb://localhost:27017/playsync

# JWT Secrets (Change these in production!)
JWT_SECRET=playsync_secret
JWT_ACCESS_SECRET=super_access_secret
JWT_REFRESH_SECRET=super_refresh_secret

# Admin Configuration
ADMIN_SECRET=your-super-secret-key-2025

# Optional
LOG_LEVEL=debug


Made with ❤️ by Bibek1604
