# PlaySync API Response Documentation

## Authentication Endpoints

### 1. User Registration
**Endpoint:** `POST /auth/register/user`

**Request Body:**
```json
{
  "fullName": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "fullName": "John Doe",
      "email": "john@example.com",
      "role": "user"
    }
  }
}
```

**Error Response - Email Already In Use (400):**
```json
{
  "success": false,
  "message": "Email already in use"
}
```

**Error Response - Validation Failed (400):**
```json
{
  "success": false,
  "message": "fullName: String must contain at least 2 character(s), email: Invalid email address, password: String must contain at least 6 character(s)"
}
```

---

### 2. Admin Registration
**Endpoint:** `POST /auth/register/admin`

**Request Body:**
```json
{
  "fullName": "Admin User",
  "email": "admin@example.com",
  "password": "admin123",
  "adminCode": "your-super-secret-key-2025"
}
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "Admin registered successfully",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "507f1f77bcf86cd799439012",
      "fullName": "Admin User",
      "email": "admin@example.com",
      "role": "admin"
    }
  }
}
```

**Error Response - Invalid Admin Code (401):**
```json
{
  "success": false,
  "message": "Invalid admin code"
}
```

**Error Response - Email Already In Use (400):**
```json
{
  "success": false,
  "message": "Email already in use"
}
```

**Error Response - Missing Admin Code (400):**
```json
{
  "success": false,
  "message": "adminCode: Invalid input: expected string, received undefined"
}
```

---

### 3. Login (User or Admin)
**Endpoint:** `POST /auth/login`

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "fullName": "John Doe",
      "email": "john@example.com",
      "role": "user"
    }
  }
}
```

**Error Response - Invalid Credentials (401):**
```json
{
  "success": false,
  "message": "Invalid email or password"
}
```

**Error Response - Validation Failed (400):**
```json
{
  "success": false,
  "message": "email: Invalid email address, password: String must contain at least 6 character(s)"
}
```

---

### 4. Refresh Token
**Endpoint:** `POST /auth/refresh-token`

**Request Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Token refreshed successfully",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "fullName": "John Doe",
      "email": "john@example.com",
      "role": "user"
    }
  }
}
```

**Error Response - Invalid Token (401):**
```json
{
  "success": false,
  "message": "Invalid refresh token"
}
```

**Error Response - Missing Token (400):**
```json
{
  "success": false,
  "message": "Refresh token required"
}
```

---

## User Profile Endpoints

### 5. Get User Profile
**Endpoint:** `GET /users/me`

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "fullName": "John Doe",
    "email": "john@example.com",
    "role": "user",
    "isVerified": false,
    "createdAt": "2026-01-05T10:30:00Z",
    "updatedAt": "2026-01-05T10:30:00Z"
  }
}
```

**Error Response - Unauthorized (401):**
```json
{
  "success": false,
  "message": "Unauthorized"
}
```

---

### 6. Update User Profile
**Endpoint:** `PUT /users/me`

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Request Body:**
```json
{
  "fullName": "Updated Name"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "fullName": "Updated Name",
    "email": "john@example.com",
    "role": "user",
    "isVerified": false,
    "createdAt": "2026-01-05T10:30:00Z",
    "updatedAt": "2026-01-05T10:35:00Z"
  }
}
```

---

### 7. List All Users
**Endpoint:** `GET /users`

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Success Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "fullName": "John Doe",
      "email": "john@example.com",
      "role": "user",
      "isVerified": false,
      "createdAt": "2026-01-05T10:30:00Z",
      "updatedAt": "2026-01-05T10:30:00Z"
    },
    {
      "_id": "507f1f77bcf86cd799439012",
      "fullName": "Admin User",
      "email": "admin@example.com",
      "role": "admin",
      "isVerified": false,
      "createdAt": "2026-01-05T10:32:00Z",
      "updatedAt": "2026-01-05T10:32:00Z"
    }
  ]
}
```

---

## Status Codes

| Code | Meaning |
|------|---------|
| 200 | OK - Request successful |
| 201 | Created - Resource successfully created |
| 400 | Bad Request - Invalid input or validation failed |
| 401 | Unauthorized - Missing or invalid authentication |
| 403 | Forbidden - User doesn't have permission |
| 500 | Internal Server Error - Server error |

---

## Token Details

- **Access Token Duration:** 15 minutes (default)
- **Refresh Token Duration:** 7 days (default)
- **Token Format:** JWT (JSON Web Token)
- **Token Location:** Response `data.accessToken` and `data.refreshToken`
- **Authorization Header:** `Authorization: Bearer {accessToken}`

---

## Error Response Format

All errors follow this format:
```json
{
  "success": false,
  "message": "Error description"
}
```
