# 📚 PlaySync API Documentation

Welcome to the PlaySync API documentation! This folder contains all the resources your frontend team needs to integrate with the backend.

---

## 📁 Documentation Files

### 1. **PROFILE_API_FRONTEND_GUIDE.md** 📖
**Complete integration guide for frontend developers**

Contains:
- ✅ Full authentication flow (register → login)
- ✅ All profile endpoints with examples
- ✅ React/JavaScript implementation examples
- ✅ Complete React components (Profile Page, Change Password)
- ✅ Error handling guide
- ✅ File upload implementation
- ✅ Best practices and security tips

**👉 Start here if you're building the frontend from scratch!**

---

### 2. **PROFILE_API_QUICK_REFERENCE.md** ⚡
**Quick reference card for experienced developers**

Contains:
- ✅ All endpoints at a glance
- ✅ Quick code snippets
- ✅ Field reference table
- ✅ Common errors and solutions
- ✅ Security checklist

**👉 Use this for quick lookups during development!**

---

### 3. **PlaySync_Profile_API.postman_collection.json** 🚀
**Postman collection for API testing**

Features:
- ✅ All auth and profile endpoints pre-configured
- ✅ Automatic token saving after login
- ✅ Example request bodies
- ✅ Ready to import and test

**👉 Import this into Postman to test the API immediately!**

**How to import:**
1. Open Postman
2. Click "Import" button
3. Select this JSON file
4. Collection will appear in your sidebar
5. Update `baseUrl` variable if needed (default: `http://localhost:5000/api/v1`)

---

## 🎯 Quick Start for Frontend Developers

### Step 1: Read the Guide
Start with `PROFILE_API_FRONTEND_GUIDE.md` to understand:
- How authentication works
- What endpoints are available
- How to structure your API calls

### Step 2: Test with Postman
Import `PlaySync_Profile_API.postman_collection.json` and:
- Register a test user
- Login to get a token
- Test all profile endpoints
- See actual request/response formats

### Step 3: Implement in Your App
Use the code examples from the guide:
- Copy the API service layer
- Implement the React components
- Add error handling
- Test file uploads

### Step 4: Reference as Needed
Keep `PROFILE_API_QUICK_REFERENCE.md` open while coding for:
- Quick endpoint lookups
- Code snippet copying
- Error troubleshooting

---

## 🔗 API Endpoints Summary

### Authentication
- `POST /auth/register/user` - Register new user (no token)
- `POST /auth/login` - Login and get access token

### Profile (All require Bearer token)
- `GET /profile` - Get user profile
- `PUT /profile` - Update profile (text + optional image)
- `PUT /profile/change-password` - Change password

---

## 🖼️ Profile Fields

| Field | Type | Editable | Required |
|-------|------|----------|----------|
| fullName | String | ✅ | ✅ |
| email | String | ❌ | ✅ |
| phone | String | ✅ | ❌ |
| favoriteGame | String | ✅ | ❌ |
| place | String | ✅ | ❌ |
| profilePicture | String (URL) | ✅ | ❌ |

---

## 📸 Image Upload Specs

- **Field name:** `profilePicture`
- **Formats:** JPG, JPEG, PNG
- **Max size:** 2MB
- **Content-Type:** `multipart/form-data`
- **Saved to:** `/uploads/` folder
- **URL format:** `/uploads/{userId}-{timestamp}.{ext}`
- **Access:** `http://localhost:5000/uploads/{filename}`

---

## 🔒 Authentication

All profile endpoints require JWT authentication:

```javascript
headers: {
  'Authorization': 'Bearer {accessToken}'
}
```

Get the token from the login endpoint and store it securely.

---

## ⚠️ Common Issues & Solutions

### Issue: 401 Unauthorized
**Solution:** Token expired or invalid. Login again.

### Issue: File upload not working
**Solution:** 
- Use `multipart/form-data` (not JSON)
- Field name must be exactly `profilePicture`
- Don't set Content-Type header manually (browser sets it)

### Issue: "File too large"
**Solution:** Compress image to under 2MB

### Issue: "Only jpg/png allowed"
**Solution:** Convert image to JPG or PNG format

---

## 💡 Tips for Frontend Developers

1. **Token Management**
   - Store token in localStorage or sessionStorage
   - Clear token on logout
   - Handle 401 errors by redirecting to login

2. **File Upload**
   - Validate file size/type on frontend before upload
   - Show image preview before uploading
   - Use FormData for multipart requests

3. **Error Handling**
   - Always check `response.ok` before parsing JSON
   - Display user-friendly error messages
   - Log errors for debugging

4. **Loading States**
   - Show loading spinner during API calls
   - Disable submit buttons while loading
   - Provide feedback on success/error

5. **Form Validation**
   - Validate on frontend before API call
   - Match backend validation rules
   - Show inline error messages

---

## 🧪 Testing Checklist

- [ ] Register new user
- [ ] Login and receive token
- [ ] Get profile (should show empty fields initially)
- [ ] Update profile text fields
- [ ] Upload profile picture
- [ ] View uploaded image in browser
- [ ] Change password
- [ ] Login with new password
- [ ] Handle errors (wrong password, file too large, etc.)

---

## 📞 Need Help?

1. Check the full guide: `PROFILE_API_FRONTEND_GUIDE.md`
2. Use quick reference: `PROFILE_API_QUICK_REFERENCE.md`
3. Test in Postman: `PlaySync_Profile_API.postman_collection.json`
4. Contact backend team if issues persist

---

## 🚀 Happy Coding!

Everything you need is in this folder. Start with the full guide, test with Postman, and implement using the code examples. Good luck! 🎉
