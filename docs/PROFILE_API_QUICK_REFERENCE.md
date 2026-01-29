# 🚀 Profile API - Quick Reference Card

## Base URL
```
http://localhost:5000/api/v1
```

---

## 🔐 Authentication

### Register (No Token)
```javascript
POST /auth/register/user
{
  "fullName": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "confirmPassword": "password123"
}
```

### Login (Get Token)
```javascript
POST /auth/login
{
  "email": "john@example.com",
  "password": "password123"
}
// Returns: { accessToken, refreshToken, user }
```

---

## 📱 Profile Endpoints

### 1. Get Profile
```javascript
GET /profile
Headers: Authorization: Bearer {token}
```

### 2. Update Profile (Text)
```javascript
PUT /profile
Headers: 
  Authorization: Bearer {token}
  Content-Type: application/json
Body: {
  "fullName": "John Doe",
  "phone": "9876543210",
  "favoriteGame": "FIFA 24",
  "place": "Kathmandu"
}
```

### 3. Update Profile (With Image)
```javascript
PUT /profile
Headers: Authorization: Bearer {token}
Content-Type: multipart/form-data
FormData:
  fullName: "John Doe"
  phone: "9876543210"
  favoriteGame: "FIFA 24"
  place: "Kathmandu"
  profilePicture: [File] (jpg/png, max 2MB)
```

### 4. Change Password
```javascript
PUT /profile/change-password
Headers: 
  Authorization: Bearer {token}
  Content-Type: application/json
Body: {
  "currentPassword": "old123",
  "newPassword": "new456",
  "confirmNewPassword": "new456"
}
```

---

## 📋 Profile Fields

| Field | Type | Editable | Required | Notes |
|-------|------|----------|----------|-------|
| fullName | String | ✅ | ✅ | Min 2 chars |
| email | String | ❌ | ✅ | Read-only |
| phone | String | ✅ | ❌ | Optional |
| favoriteGame | String | ✅ | ❌ | Optional |
| place | String | ✅ | ❌ | Optional |
| profilePicture | String | ✅ | ❌ | URL path |

---

## 🖼️ Image Upload Rules

- **Field name:** `profilePicture`
- **Formats:** jpg, jpeg, png
- **Max size:** 2MB
- **Saved as:** `{userId}-{timestamp}.{ext}`
- **Location:** `/uploads/` folder
- **Access URL:** `http://localhost:5000/uploads/{filename}`

---

## ⚡ Quick Code Snippets

### Fetch Profile
```javascript
const token = localStorage.getItem('accessToken');
const response = await fetch('http://localhost:5000/api/v1/profile', {
  headers: { 'Authorization': `Bearer ${token}` }
});
const data = await response.json();
```

### Update Profile
```javascript
const token = localStorage.getItem('accessToken');
const response = await fetch('http://localhost:5000/api/v1/profile', {
  method: 'PUT',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    fullName: 'John Doe',
    phone: '9876543210'
  })
});
```

### Upload Image
```javascript
const formData = new FormData();
formData.append('fullName', 'John Doe');
formData.append('profilePicture', fileInput.files[0]);

const token = localStorage.getItem('accessToken');
const response = await fetch('http://localhost:5000/api/v1/profile', {
  method: 'PUT',
  headers: { 'Authorization': `Bearer ${token}` },
  body: formData
});
```

### Change Password
```javascript
const token = localStorage.getItem('accessToken');
const response = await fetch('http://localhost:5000/api/v1/profile/change-password', {
  method: 'PUT',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    currentPassword: 'old123',
    newPassword: 'new456',
    confirmNewPassword: 'new456'
  })
});
```

---

## ❌ Common Errors

| Status | Message | Solution |
|--------|---------|----------|
| 401 | Unauthorized | Login again |
| 401 | Current password is incorrect | Check password |
| 400 | Passwords do not match | Fix confirmation |
| 413 | File too large | Compress image |
| 400 | Only jpg/png allowed | Change format |

---

## ✅ Response Format

### Success
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { /* result */ }
}
```

### Error
```json
{
  "message": "Error description",
  "errorCode": "INTERNAL_ERROR"
}
```

---

## 🔒 Security Checklist

- ✅ Always send `Authorization: Bearer {token}` header
- ✅ Store token securely (localStorage/sessionStorage)
- ✅ Validate file size before upload (max 2MB)
- ✅ Validate file type (jpg/png only)
- ✅ Handle 401 errors (redirect to login)
- ✅ Clear token on logout
- ✅ Use HTTPS in production

---

## 📞 Need Help?

See full documentation: `docs/PROFILE_API_FRONTEND_GUIDE.md`
