# 🏗️ Backend Structure & Architecture

## 📁 Current Project Structure

```
playsync-backend/
├── src/
│   ├── app.ts                      # Express app configuration & Swagger setup
│   ├── server.ts                   # Server entry point & cron jobs
│   │
│   ├── modules/                    # Feature modules
│   │   ├── auth/                   # Authentication module
│   │   │   ├── auth.controller.ts  # HTTP handlers
│   │   │   ├── auth.service.ts     # Business logic
│   │   │   ├── auth.repository.ts  # Database operations
│   │   │   ├── auth.model.ts       # Mongoose schema
│   │   │   ├── auth.routes.ts      # Route definitions
│   │   │   ├── auth.dto.ts         # Data transfer objects
│   │   │   ├── auth.middleware.ts  # Auth middleware
│   │   │   ├── auth.seeder.ts      # Seed admin user
│   │   │   └── auth.swagger.ts     # Swagger documentation
│   │   │
│   │   ├── game/                   # Game module
│   │   │   ├── game.controller.ts  # HTTP handlers
│   │   │   ├── game.service.ts     # Business logic
│   │   │   ├── game.repository.ts  # Database operations
│   │   │   ├── game.model.ts       # Mongoose schema
│   │   │   ├── game.routes.ts      # Route definitions
│   │   │   ├── game.dto.ts         # Validation schemas
│   │   │   ├── game.types.ts       # TypeScript types
│   │   │   ├── game.middleware.ts  # Game-specific middleware
│   │   │   ├── game.uploader.ts    # Cloudinary image upload
│   │   │   └── game.swagger.ts     # Swagger documentation
│   │   │
│   │   └── profile/                # Profile module
│   │       ├── profile.controller.ts
│   │       ├── profile.service.ts
│   │       ├── profile.routes.ts
│   │       └── profile.uploader.ts
│   │
│   ├── Share/                      # Shared utilities
│   │   ├── config/
│   │   │   ├── db.ts              # MongoDB connection
│   │   │   ├── jwt.ts             # JWT configuration
│   │   │   └── cloudinary.ts      # Cloudinary config
│   │   └── utils/
│   │       ├── apiResponse.ts     # Standard response format
│   │       ├── AppError.ts        # Custom error class
│   │       ├── asyncHandler.ts    # Async error wrapper
│   │       ├── errorHandler.ts    # Global error handler
│   │       ├── logger.ts          # Pino logger
│   │       ├── validateDto.ts     # Zod validation middleware
│   │       └── pagination.middleware.ts
│   │
│   ├── jobs/                       # Background jobs
│   │   └── game.cleanup.job.ts    # Auto-end expired games
│   │
│   └── websocket/                  # WebSocket server
│       └── socket.server.ts       # Socket.IO configuration
│
├── uploads/                        # Local file uploads (temporary)
├── dist/                          # Compiled JavaScript
├── .env                           # Environment variables
├── package.json                   # Dependencies
├── tsconfig.json                  # TypeScript config
└── README.md                      # Project documentation
```

---

## 🔄 Request Flow Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND CLIENT                          │
│  (React/Next.js/Vue with Axios/Fetch + React Query/SWR)        │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            │ HTTP/HTTPS Request
                            │ (REST API)
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                      EXPRESS.JS SERVER                           │
│                    (Port 5000 - app.ts)                         │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                   MIDDLEWARE CHAIN                               │
├─────────────────────────────────────────────────────────────────┤
│  1. CORS Handler           → Allow cross-origin requests        │
│  2. Body Parser            → Parse JSON/FormData                │
│  3. Logger                 → Log requests (Pino)                │
│  4. Auth Middleware        → Verify JWT token                   │
│  5. Validation (Zod)       → Validate request data              │
│  6. File Upload (Multer)   → Handle image uploads               │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                         ROUTER                                   │
│               (Route to specific module)                         │
├─────────────────────────────────────────────────────────────────┤
│  /api/v1/auth/*     → Auth Routes                              │
│  /api/v1/games/*    → Game Routes                              │
│  /api/v1/profile/*  → Profile Routes                           │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                      CONTROLLER                                  │
│            (Handle HTTP request/response)                        │
├─────────────────────────────────────────────────────────────────┤
│  • Extract request data                                         │
│  • Call service layer                                           │
│  • Format response                                              │
│  • Handle errors                                                │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                       SERVICE                                    │
│              (Business logic layer)                              │
├─────────────────────────────────────────────────────────────────┤
│  • Validate business rules                                      │
│  • Process data                                                 │
│  • Call repository                                              │
│  • Call external services (Cloudinary)                          │
│  • Orchestrate operations                                       │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                     REPOSITORY                                   │
│             (Database operations)                                │
├─────────────────────────────────────────────────────────────────┤
│  • CRUD operations                                              │
│  • Complex queries                                              │
│  • Transactions                                                 │
│  • Data aggregation                                             │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                    MONGOOSE MODEL                                │
│              (Schema & validation)                               │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                    MONGODB DATABASE                              │
│         (Persistent data storage)                                │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔐 Authentication Flow

```
┌─────────────┐
│  FRONTEND   │
└──────┬──────┘
       │
       │ 1. POST /auth/register or /auth/login
       │    { email, password }
       ▼
┌──────────────┐
│   BACKEND    │
└──────┬───────┘
       │
       │ 2. Validate credentials
       │ 3. Generate JWT tokens
       │    - accessToken (15min)
       │    - refreshToken (7 days)
       ▼
┌──────────────┐
│   FRONTEND   │
└──────┬───────┘
       │
       │ 4. Store tokens
       │    localStorage/sessionStorage
       │
       │ 5. Add to all requests
       │    Authorization: Bearer <token>
       ▼
┌──────────────┐
│   BACKEND    │
└──────┬───────┘
       │
       │ 6. Verify token in middleware
       │ 7. Attach user to request
       │    req.user = decoded token
       ▼
┌──────────────┐
│  CONTROLLER  │
└──────────────┘
```

---

## 🎮 Game Operations Flow

### Create Game Flow
```
Frontend                 Backend                    Database
   │                        │                          │
   │ 1. Create Game Form    │                          │
   │    (with image)        │                          │
   ├───────────────────────>│                          │
   │                        │                          │
   │                        │ 2. Validate JWT          │
   │                        │ 3. Validate data (Zod)   │
   │                        │ 4. Upload image          │
   │                        │    (Cloudinary)          │
   │                        │                          │
   │                        │ 5. Save game             │
   │                        ├─────────────────────────>│
   │                        │                          │
   │                        │<─────────────────────────┤
   │                        │ 6. Return game data      │
   │<───────────────────────┤                          │
   │                        │                          │
   │ 7. Update UI           │                          │
```

### Join Game Flow
```
Frontend                 Backend                    Database
   │                        │                          │
   │ 1. Click "Join"        │                          │
   ├───────────────────────>│                          │
   │  POST /games/:id/join  │                          │
   │                        │                          │
   │                        │ 2. Verify authenticated  │
   │                        │ 3. Check game status     │
   │                        │ 4. Check if not full     │
   │                        │ 5. Check not already     │
   │                        │    joined                │
   │                        │                          │
   │                        │ 6. Add to participants   │
   │                        │ 7. Increment count       │
   │                        ├─────────────────────────>│
   │                        │                          │
   │                        │<─────────────────────────┤
   │<───────────────────────┤                          │
   │                        │                          │
   │ 8. Show success        │                          │
   │ 9. Refresh game list   │                          │
```

---

## 🗄️ Database Schema Relationships

```
┌─────────────────────┐
│       User          │
│─────────────────────│
│ _id                 │◄────────┐
│ fullName            │         │
│ email               │         │
│ password (hashed)   │         │
│ role                │         │ creatorId
│ isVerified          │         │
│ profilePicture      │         │
│ refreshToken        │         │
└─────────────────────┘         │
         │                      │
         │ userId               │
         │                      │
         ▼                      │
┌─────────────────────┐         │
│       Game          │         │
│─────────────────────│         │
│ _id                 │         │
│ title               │         │
│ description         │         │
│ category            │         │
│ maxPlayers          │         │
│ currentPlayers      │         │
│ status              │         │
│ imageUrl            │         │
│ creatorId           ├─────────┘
│ participants[]      │◄────┐
│   - userId          │     │
│   - joinedAt        │     │
│   - status          │     │
│ startTime           │     │
│ endTime             │     │
│ endedAt             │     │
└─────────────────────┘     │
                            │
                            │ References User._id
```

---

## 🔧 Key Technologies Stack

### Backend
- **Runtime**: Node.js v18+
- **Framework**: Express.js 4.22
- **Language**: TypeScript 5.9
- **Database**: MongoDB + Mongoose 9.0
- **Authentication**: JWT (jsonwebtoken)
- **Validation**: Zod 4.2
- **File Upload**: Multer + Cloudinary
- **API Documentation**: Swagger (swagger-jsdoc, swagger-ui-express)
- **Logger**: Pino
- **Cron Jobs**: node-cron
- **WebSocket**: Socket.IO (for future real-time features)

### Recommended Frontend Stack
- **Framework**: React 18+ or Next.js 14+
- **HTTP Client**: Axios
- **State Management**: React Query / Zustand
- **Routing**: React Router v6
- **Form Handling**: React Hook Form
- **Validation**: Zod (same as backend)
- **UI Library**: Material-UI, Tailwind CSS, or Shadcn/ui

---

## 📡 API Response Patterns

### Success Response
```typescript
{
  success: true,
  message: "Operation successful",
  data: {
    // Actual data
  }
}
```

### Error Response
```typescript
{
  success: false,
  message: "Error occurred",
  errorCode: "VALIDATION_ERROR",
  errors: [
    {
      field: "email",
      message: "Invalid email format"
    }
  ]
}
```

### Pagination Response
```typescript
{
  success: true,
  message: "Games retrieved successfully",
  data: {
    games: [...],
    pagination: {
      currentPage: 1,
      totalPages: 5,
      totalItems: 100,
      itemsPerPage: 20,
      hasNextPage: true,
      hasPrevPage: false
    }
  }
}
```

---

## 🚀 Deployment Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    CLOUD DEPLOYMENT                     │
└─────────────────────────────────────────────────────────┘

Frontend (Vercel/Netlify)          Backend (Railway/Render)
        │                                   │
        │                                   │
        │                          ┌────────┴────────┐
        │                          │  Node.js Server │
        │                          │   (Express.js)  │
        │                          └────────┬────────┘
        │                                   │
        ├───────── API Calls ───────────────┤
        │         (REST/HTTP)               │
        │                                   │
        │                          ┌────────┴────────┐
        │                          │   MongoDB Atlas │
        │                          │   (Database)    │
        │                          └─────────────────┘
        │
        │                          ┌─────────────────┐
        └──── Static CDN ──────────│   Cloudinary    │
                                   │  (Image Host)   │
                                   └─────────────────┘
```

---

## 💾 Environment Variables Required

```env
# Server
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/playsync

# JWT
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=15m
REFRESH_TOKEN_SECRET=your-refresh-token-secret
REFRESH_TOKEN_EXPIRES_IN=7d

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Admin
ADMIN_CODE=your-super-secret-key-2025

# CORS
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
```

---

## ✅ Features Implemented

- ✅ User authentication (register, login, logout)
- ✅ Admin authentication with secret code
- ✅ JWT token management with refresh
- ✅ Game CRUD operations
- ✅ Game join/leave functionality
- ✅ Image upload to Cloudinary
- ✅ Input validation with Zod
- ✅ Pagination support
- ✅ Search and filtering
- ✅ Automatic game cleanup (cron job)
- ✅ Swagger API documentation
- ✅ Error handling
- ✅ Request logging
- ✅ Profile management

---

## 🎯 Next Steps for Frontend

1. **Setup Project**: Create React/Next.js app
2. **Install Dependencies**: axios, react-query, react-router-dom
3. **Create API Client**: With interceptors for auth
4. **Build Auth Flow**: Login, register, token refresh
5. **Create Components**: Game cards, forms, lists
6. **Add State Management**: Context API or Zustand
7. **Implement Features**: Join games, create games, profile
8. **Add Real-time**: Socket.IO for live updates
9. **Deploy**: Vercel/Netlify for frontend

---

**Documentation Complete! 🎉**

For detailed implementation, see:
- `FRONTEND_INTEGRATION_GUIDE.md` - Complete React integration
- `API_QUICK_REFERENCE.md` - Quick copy-paste examples
- Swagger UI: http://localhost:5000/swagger
