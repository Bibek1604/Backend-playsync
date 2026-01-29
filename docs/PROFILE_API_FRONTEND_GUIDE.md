# 📱 Profile API - Frontend Integration Guide

**Version:** 1.0  
**Base URL:** `http://localhost:5000/api/v1`  
**Last Updated:** January 29, 2026

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Authentication Flow](#authentication-flow)
3. [Profile Endpoints](#profile-endpoints)
4. [Request/Response Examples](#request-response-examples)
5. [Frontend Implementation Examples](#frontend-implementation-examples)
6. [Error Handling](#error-handling)
7. [File Upload Guide](#file-upload-guide)
8. [Best Practices](#best-practices)

---

## 🎯 Overview

The Profile API allows users to:
- ✅ View their profile information
- ✅ Update profile fields (name, phone, favorite game, location)
- ✅ Upload/update profile picture (jpg/png, max 2MB)
- ✅ Change password securely

**All profile endpoints require JWT authentication.**

---

## 🔐 Authentication Flow

### Step 1: Register User (No Token)

```http
POST /api/v1/auth/register/user
Content-Type: application/json
```

**Request Body:**
```json
{
  "fullName": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "confirmPassword": "password123"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "65f1a2b3c4d5e6f7g8h9i0j1",
      "fullName": "John Doe",
      "email": "john@example.com",
      "role": "user"
    }
  }
}
```

**⚠️ Note:** Registration does NOT return a token. User must login separately.

---

### Step 2: Login (Get Token)

```http
POST /api/v1/auth/login
Content-Type: application/json
```

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "65f1a2b3c4d5e6f7g8h9i0j1",
      "fullName": "John Doe",
      "email": "john@example.com",
      "role": "user"
    }
  }
}
```

**🔑 Store the `accessToken` securely (localStorage/sessionStorage/secure cookie)**

---

## 📡 Profile Endpoints

### 1. Get Profile

**Endpoint:** `GET /api/v1/profile`  
**Auth Required:** ✅ Yes  
**Content-Type:** N/A (GET request)

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Profile fetched successfully",
  "data": {
    "fullName": "John Doe",
    "email": "john@example.com",
    "phone": "9876543210",
    "favoriteGame": "FIFA 24",
    "place": "Kathmandu, Nepal",
    "profilePicture": "/uploads/65f1a2b3c4d5e6f7g8h9i0j1-1738145678901.jpg"
  }
}
```

---

### 2. Update Profile (Text Fields Only)

**Endpoint:** `PUT /api/v1/profile`  
**Auth Required:** ✅ Yes  
**Content-Type:** `application/json`

**Headers:**
```
Authorization: Bearer {accessToken}
Content-Type: application/json
```

**Request Body:**
```json
{
  "fullName": "John Doe Updated",
  "phone": "9876543210",
  "favoriteGame": "FIFA 24",
  "place": "Kathmandu, Nepal"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "fullName": "John Doe Updated",
    "email": "john@example.com",
    "phone": "9876543210",
    "favoriteGame": "FIFA 24",
    "place": "Kathmandu, Nepal",
    "profilePicture": "/uploads/65f1a2b3c4d5e6f7g8h9i0j1-1738145678901.jpg"
  }
}
```

**📝 Notes:**
- Only send fields you want to update
- Email is read-only (cannot be changed)
- Existing profilePicture is preserved if not sent

---

### 3. Update Profile (With Image Upload)

**Endpoint:** `PUT /api/v1/profile`  
**Auth Required:** ✅ Yes  
**Content-Type:** `multipart/form-data`

**Headers:**
```
Authorization: Bearer {accessToken}
Content-Type: multipart/form-data
```

**Form Data:**
```
fullName: "John Doe"
phone: "9876543210"
favoriteGame: "FIFA 24"
place: "Kathmandu"
profilePicture: [File object] (jpg/png, max 2MB)
```

**Response (200):**
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "fullName": "John Doe",
    "email": "john@example.com",
    "phone": "9876543210",
    "favoriteGame": "FIFA 24",
    "place": "Kathmandu",
    "profilePicture": "/uploads/65f1a2b3c4d5e6f7g8h9i0j1-1738145678901.jpg"
  }
}
```

**📸 Image Requirements:**
- Field name: `profilePicture` (exact spelling)
- Formats: `.jpg`, `.jpeg`, `.png`
- Max size: 2MB
- Filename pattern: `{userId}-{timestamp}.{ext}`

**🖼️ Access uploaded image:**
```
http://localhost:5000/uploads/65f1a2b3c4d5e6f7g8h9i0j1-1738145678901.jpg
```

---

### 4. Change Password

**Endpoint:** `PUT /api/v1/profile/change-password`  
**Auth Required:** ✅ Yes  
**Content-Type:** `application/json`

**Headers:**
```
Authorization: Bearer {accessToken}
Content-Type: application/json
```

**Request Body:**
```json
{
  "currentPassword": "oldpassword123",
  "newPassword": "newpassword456",
  "confirmNewPassword": "newpassword456"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Password changed successfully"
}
```

**🔒 Security Notes:**
- Current password is verified before change
- New password must match confirmation
- Password is hashed with bcrypt (strength 12)
- User stays logged in (tokens NOT invalidated)

---

## 💻 Frontend Implementation Examples

### React/JavaScript Example

```javascript
// API Configuration
const API_BASE_URL = 'http://localhost:5000/api/v1';

// Get token from storage
const getToken = () => localStorage.getItem('accessToken');

// 1. Get Profile
const getProfile = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/profile`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getToken()}`
      }
    });
    
    const data = await response.json();
    
    if (data.success) {
      console.log('Profile:', data.data);
      return data.data;
    } else {
      throw new Error(data.message);
    }
  } catch (error) {
    console.error('Error fetching profile:', error);
    throw error;
  }
};

// 2. Update Profile (Text Only)
const updateProfile = async (profileData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/profile`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${getToken()}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(profileData)
    });
    
    const data = await response.json();
    
    if (data.success) {
      console.log('Profile updated:', data.data);
      return data.data;
    } else {
      throw new Error(data.message);
    }
  } catch (error) {
    console.error('Error updating profile:', error);
    throw error;
  }
};

// 3. Update Profile with Image
const updateProfileWithImage = async (formData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/profile`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${getToken()}`
        // Don't set Content-Type - browser will set it with boundary
      },
      body: formData // FormData object
    });
    
    const data = await response.json();
    
    if (data.success) {
      console.log('Profile updated with image:', data.data);
      return data.data;
    } else {
      throw new Error(data.message);
    }
  } catch (error) {
    console.error('Error updating profile with image:', error);
    throw error;
  }
};

// 4. Change Password
const changePassword = async (passwordData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/profile/change-password`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${getToken()}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(passwordData)
    });
    
    const data = await response.json();
    
    if (data.success) {
      console.log('Password changed successfully');
      return true;
    } else {
      throw new Error(data.message);
    }
  } catch (error) {
    console.error('Error changing password:', error);
    throw error;
  }
};
```

---

### React Component Example

```jsx
import React, { useState, useEffect } from 'react';

const ProfilePage = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    favoriteGame: '',
    place: ''
  });
  
  const [selectedFile, setSelectedFile] = useState(null);

  // Fetch profile on mount
  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch('http://localhost:5000/api/v1/profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        setProfile(data.data);
        setFormData({
          fullName: data.data.fullName,
          phone: data.data.phone,
          favoriteGame: data.data.favoriteGame,
          place: data.data.place
        });
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    
    // Validate file
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert('File size must be less than 2MB');
        return;
      }
      
      if (!['image/jpeg', 'image/jpg', 'image/png'].includes(file.type)) {
        alert('Only JPG and PNG files are allowed');
        return;
      }
      
      setSelectedFile(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('accessToken');
      const formDataToSend = new FormData();
      
      // Add text fields
      formDataToSend.append('fullName', formData.fullName);
      formDataToSend.append('phone', formData.phone);
      formDataToSend.append('favoriteGame', formData.favoriteGame);
      formDataToSend.append('place', formData.place);
      
      // Add file if selected
      if (selectedFile) {
        formDataToSend.append('profilePicture', selectedFile);
      }

      const response = await fetch('http://localhost:5000/api/v1/profile', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formDataToSend
      });

      const data = await response.json();

      if (data.success) {
        setProfile(data.data);
        alert('Profile updated successfully!');
        setSelectedFile(null);
      } else {
        throw new Error(data.message);
      }
    } catch (err) {
      setError(err.message);
      alert('Error updating profile: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !profile) return <div>Loading...</div>;
  if (error && !profile) return <div>Error: {error}</div>;

  return (
    <div className="profile-page">
      <h1>My Profile</h1>
      
      {/* Display current profile picture */}
      {profile?.profilePicture && (
        <div className="profile-picture">
          <img 
            src={`http://localhost:5000${profile.profilePicture}`} 
            alt="Profile" 
            style={{ width: 150, height: 150, borderRadius: '50%' }}
          />
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div>
          <label>Full Name:</label>
          <input
            type="text"
            name="fullName"
            value={formData.fullName}
            onChange={handleInputChange}
            required
          />
        </div>

        <div>
          <label>Email (Read-only):</label>
          <input
            type="email"
            value={profile?.email || ''}
            disabled
          />
        </div>

        <div>
          <label>Phone:</label>
          <input
            type="text"
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
          />
        </div>

        <div>
          <label>Favorite Game:</label>
          <input
            type="text"
            name="favoriteGame"
            value={formData.favoriteGame}
            onChange={handleInputChange}
          />
        </div>

        <div>
          <label>Location:</label>
          <input
            type="text"
            name="place"
            value={formData.place}
            onChange={handleInputChange}
          />
        </div>

        <div>
          <label>Profile Picture:</label>
          <input
            type="file"
            accept="image/jpeg,image/jpg,image/png"
            onChange={handleFileChange}
          />
          {selectedFile && <p>Selected: {selectedFile.name}</p>}
        </div>

        <button type="submit" disabled={loading}>
          {loading ? 'Updating...' : 'Update Profile'}
        </button>
      </form>
    </div>
  );
};

export default ProfilePage;
```

---

### Change Password Component

```jsx
import React, { useState } from 'react';

const ChangePasswordForm = () => {
  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    setPasswords({
      ...passwords,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    // Validate passwords match
    if (passwords.newPassword !== passwords.confirmNewPassword) {
      setError('New passwords do not match');
      setLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch('http://localhost:5000/api/v1/profile/change-password', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(passwords)
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(true);
        setPasswords({
          currentPassword: '',
          newPassword: '',
          confirmNewPassword: ''
        });
        alert('Password changed successfully!');
      } else {
        throw new Error(data.message);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="change-password-form">
      <h2>Change Password</h2>
      
      {error && <div className="error">{error}</div>}
      {success && <div className="success">Password changed successfully!</div>}

      <form onSubmit={handleSubmit}>
        <div>
          <label>Current Password:</label>
          <input
            type="password"
            name="currentPassword"
            value={passwords.currentPassword}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label>New Password:</label>
          <input
            type="password"
            name="newPassword"
            value={passwords.newPassword}
            onChange={handleChange}
            required
            minLength={8}
          />
        </div>

        <div>
          <label>Confirm New Password:</label>
          <input
            type="password"
            name="confirmNewPassword"
            value={passwords.confirmNewPassword}
            onChange={handleChange}
            required
            minLength={8}
          />
        </div>

        <button type="submit" disabled={loading}>
          {loading ? 'Changing...' : 'Change Password'}
        </button>
      </form>
    </div>
  );
};

export default ChangePasswordForm;
```

---

## ⚠️ Error Handling

### Common Error Responses

#### 401 Unauthorized (No/Invalid Token)
```json
{
  "message": "Unauthorized",
  "errorCode": "INTERNAL_ERROR"
}
```

**Solution:** User needs to login again

---

#### 401 Wrong Current Password
```json
{
  "message": "Current password is incorrect",
  "errorCode": "INTERNAL_ERROR"
}
```

**Solution:** Ask user to re-enter current password

---

#### 400 Validation Error
```json
{
  "message": "New password and confirmation do not match",
  "errorCode": "INTERNAL_ERROR"
}
```

**Solution:** Fix validation on frontend

---

#### 413 File Too Large
```json
{
  "message": "File too large",
  "errorCode": "INTERNAL_ERROR"
}
```

**Solution:** Compress image or choose smaller file

---

### Error Handling Best Practices

```javascript
const handleApiError = (error, response) => {
  if (response?.status === 401) {
    // Token expired or invalid
    localStorage.removeItem('accessToken');
    window.location.href = '/login';
  } else if (response?.status === 413) {
    alert('File is too large. Maximum size is 2MB.');
  } else if (response?.status === 400) {
    alert(error.message || 'Validation error');
  } else {
    alert('An error occurred. Please try again.');
  }
};
```

---

## 📤 File Upload Guide

### Creating FormData for Image Upload

```javascript
// Example: Upload profile with image
const uploadProfileWithImage = (profileData, imageFile) => {
  const formData = new FormData();
  
  // Add text fields
  formData.append('fullName', profileData.fullName);
  formData.append('phone', profileData.phone);
  formData.append('favoriteGame', profileData.favoriteGame);
  formData.append('place', profileData.place);
  
  // Add image file
  formData.append('profilePicture', imageFile);
  
  return fetch('http://localhost:5000/api/v1/profile', {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${getToken()}`
      // DO NOT set Content-Type header - browser sets it automatically
    },
    body: formData
  });
};
```

### File Validation

```javascript
const validateImageFile = (file) => {
  const maxSize = 2 * 1024 * 1024; // 2MB
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
  
  if (!file) {
    return { valid: false, error: 'No file selected' };
  }
  
  if (file.size > maxSize) {
    return { valid: false, error: 'File size must be less than 2MB' };
  }
  
  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: 'Only JPG and PNG files are allowed' };
  }
  
  return { valid: true };
};

// Usage
const handleFileSelect = (e) => {
  const file = e.target.files[0];
  const validation = validateImageFile(file);
  
  if (!validation.valid) {
    alert(validation.error);
    e.target.value = ''; // Clear input
    return;
  }
  
  setSelectedFile(file);
};
```

### Image Preview Before Upload

```javascript
const [imagePreview, setImagePreview] = useState(null);

const handleFileChange = (e) => {
  const file = e.target.files[0];
  
  if (file) {
    // Validate file
    const validation = validateImageFile(file);
    if (!validation.valid) {
      alert(validation.error);
      return;
    }
    
    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
    
    setSelectedFile(file);
  }
};

// In JSX
{imagePreview && (
  <img src={imagePreview} alt="Preview" style={{ width: 150, height: 150 }} />
)}
```

---

## ✅ Best Practices

### 1. Token Management

```javascript
// Store token securely
const saveToken = (token) => {
  localStorage.setItem('accessToken', token);
  // Or use secure httpOnly cookie
};

// Get token
const getToken = () => {
  return localStorage.getItem('accessToken');
};

// Clear token on logout
const logout = () => {
  localStorage.removeItem('accessToken');
  window.location.href = '/login';
};
```

---

### 2. API Service Layer

```javascript
// api/profileService.js
class ProfileService {
  constructor() {
    this.baseURL = 'http://localhost:5000/api/v1';
  }

  getAuthHeaders() {
    const token = localStorage.getItem('accessToken');
    return {
      'Authorization': `Bearer ${token}`
    };
  }

  async getProfile() {
    const response = await fetch(`${this.baseURL}/profile`, {
      headers: this.getAuthHeaders()
    });
    return this.handleResponse(response);
  }

  async updateProfile(data) {
    const response = await fetch(`${this.baseURL}/profile`, {
      method: 'PUT',
      headers: {
        ...this.getAuthHeaders(),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
    return this.handleResponse(response);
  }

  async updateProfileWithImage(formData) {
    const response = await fetch(`${this.baseURL}/profile`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: formData
    });
    return this.handleResponse(response);
  }

  async changePassword(passwordData) {
    const response = await fetch(`${this.baseURL}/profile/change-password`, {
      method: 'PUT',
      headers: {
        ...this.getAuthHeaders(),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(passwordData)
    });
    return this.handleResponse(response);
  }

  async handleResponse(response) {
    const data = await response.json();
    
    if (!response.ok) {
      if (response.status === 401) {
        localStorage.removeItem('accessToken');
        window.location.href = '/login';
      }
      throw new Error(data.message || 'Request failed');
    }
    
    return data;
  }
}

export default new ProfileService();
```

---

### 3. Loading States

```javascript
const [loading, setLoading] = useState(false);

const updateProfile = async (data) => {
  setLoading(true);
  try {
    const result = await ProfileService.updateProfile(data);
    // Handle success
  } catch (error) {
    // Handle error
  } finally {
    setLoading(false);
  }
};
```

---

### 4. Form Validation

```javascript
const validateProfileForm = (formData) => {
  const errors = {};
  
  if (!formData.fullName || formData.fullName.trim().length < 2) {
    errors.fullName = 'Full name must be at least 2 characters';
  }
  
  if (formData.phone && !/^\d{10}$/.test(formData.phone)) {
    errors.phone = 'Phone must be 10 digits';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};
```

---

## 🔗 Quick Reference

| Endpoint | Method | Auth | Content-Type | Purpose |
|----------|--------|------|--------------|---------|
| `/profile` | GET | ✅ | N/A | Get profile |
| `/profile` | PUT | ✅ | `application/json` | Update text fields |
| `/profile` | PUT | ✅ | `multipart/form-data` | Update with image |
| `/profile/change-password` | PUT | ✅ | `application/json` | Change password |

---

## 📞 Support

For issues or questions:
- Check error messages in API response
- Verify token is valid and not expired
- Ensure Content-Type matches request body format
- Check file size and format for uploads

---

**Happy Coding! 🚀**
