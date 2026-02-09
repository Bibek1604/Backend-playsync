# 🎯 Quick API Reference - PlaySync Backend

## Base URL
```
http://localhost:5000/api/v1
```

---

## 📝 Quick Copy-Paste Examples

### 1️⃣ Register User
```bash
curl -X POST http://localhost:5000/api/v1/auth/register/user \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "confirmPassword": "password123"
  }'
```

### 2️⃣ Login
```bash
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

**Save the accessToken from response!**

### 3️⃣ Create Game
```bash
curl -X POST http://localhost:5000/api/v1/games \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Epic Battle",
    "description": "Join us for an epic gaming session",
    "category": "ONLINE",
    "maxPlayers": 50,
    "endTime": "2026-02-15T20:00:00Z"
  }'
```

### 4️⃣ Get All Games
```bash
curl http://localhost:5000/api/v1/games?category=ONLINE&status=OPEN&page=1&limit=20
```

### 5️⃣ Join Game
```bash
curl -X POST http://localhost:5000/api/v1/games/GAME_ID/join \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### 6️⃣ Leave Game
```bash
curl -X POST http://localhost:5000/api/v1/games/GAME_ID/leave \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### 7️⃣ Update Game
```bash
curl -X PATCH http://localhost:5000/api/v1/games/GAME_ID \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Updated Title",
    "maxPlayers": 100
  }'
```

### 8️⃣ Delete Game
```bash
curl -X DELETE http://localhost:5000/api/v1/games/GAME_ID \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### 9️⃣ Get My Profile
```bash
curl http://localhost:5000/api/v1/profile \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### 🔟 Update Profile
```bash
curl -X PATCH http://localhost:5000/api/v1/profile \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "John Updated",
    "bio": "Gaming enthusiast"
  }'
```

---

## 🔑 Authentication Headers

For all protected endpoints, include:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 📊 Common Query Parameters

### Games List
```
?category=ONLINE          # Filter: ONLINE or OFFLINE
&status=OPEN             # Filter: OPEN, FULL, or ENDED
&search=battle           # Search in title/description
&page=1                  # Page number
&limit=20                # Items per page (max 100)
```

### Example
```
http://localhost:5000/api/v1/games?category=ONLINE&status=OPEN&search=battle&page=1&limit=20
```

---

## ✅ Response Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request (validation error) |
| 401 | Unauthorized (missing/invalid token) |
| 403 | Forbidden (no permission) |
| 404 | Not Found |
| 500 | Server Error |

---

## 🎮 Game Object Structure

```json
{
  "_id": "507f1f77bcf86cd799439011",
  "title": "Epic Battle",
  "description": "Join us for gaming",
  "category": "ONLINE",
  "maxPlayers": 50,
  "currentPlayers": 12,
  "status": "OPEN",
  "imageUrl": "https://cloudinary.com/...",
  "creatorId": "507f191e810c19729de860ea",
  "participants": [
    {
      "userId": "507f191e810c19729de860ea",
      "joinedAt": "2026-02-09T10:00:00Z",
      "status": "ACTIVE"
    }
  ],
  "startTime": "2026-02-09T10:00:00Z",
  "endTime": "2026-02-15T20:00:00Z",
  "createdAt": "2026-02-09T10:00:00Z",
  "updatedAt": "2026-02-09T10:00:00Z"
}
```

---

## 📱 Frontend Integration Snippets

### React Hook for Login
```javascript
const [user, setUser] = useState(null);
const [token, setToken] = useState(localStorage.getItem('accessToken'));

const login = async (email, password) => {
  const response = await fetch('http://localhost:5000/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  
  const data = await response.json();
  
  if (data.success) {
    localStorage.setItem('accessToken', data.data.accessToken);
    localStorage.setItem('refreshToken', data.data.refreshToken);
    setUser(data.data.user);
    setToken(data.data.accessToken);
  }
  
  return data;
};
```

### Fetch with Token
```javascript
const fetchGames = async () => {
  const token = localStorage.getItem('accessToken');
  
  const response = await fetch('http://localhost:5000/api/v1/games', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  return await response.json();
};
```

### Create Game with Image
```javascript
const createGame = async (gameData, imageFile) => {
  const formData = new FormData();
  formData.append('title', gameData.title);
  formData.append('category', gameData.category);
  formData.append('maxPlayers', gameData.maxPlayers);
  formData.append('endTime', gameData.endTime);
  
  if (gameData.description) {
    formData.append('description', gameData.description);
  }
  
  if (imageFile) {
    formData.append('image', imageFile);
  }
  
  const token = localStorage.getItem('accessToken');
  
  const response = await fetch('http://localhost:5000/api/v1/games', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: formData
  });
  
  return await response.json();
};
```

---

## 🛠️ Testing Tools

- **Swagger UI**: http://localhost:5000/swagger
- **Postman**: Import endpoints from Swagger
- **Thunder Client** (VS Code extension): Great for quick testing

---

## 💡 Tips

1. **Always check token expiry**: Implement token refresh logic
2. **Handle errors gracefully**: Show user-friendly messages
3. **Use loading states**: Better UX during API calls
4. **Validate input**: Client-side validation before API calls
5. **Cache responses**: Use React Query or SWR for better performance

---

## 🚀 Get Started in 3 Steps

1. **Test in Swagger**: http://localhost:5000/swagger
2. **Copy API client code** from FRONTEND_INTEGRATION_GUIDE.md
3. **Build your first component** using the examples above

**Good Luck! 🎉**
