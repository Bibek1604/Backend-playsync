# 🚀 Frontend Integration Guide - PlaySync Backend

## 📚 Table of Contents
1. [Backend Structure Overview](#backend-structure-overview)
2. [API Endpoints Reference](#api-endpoints-reference)
3. [Authentication Flow](#authentication-flow)
4. [Frontend Setup Guide](#frontend-setup-guide)
5. [React/Next.js Implementation](#reactnextjs-implementation)
6. [State Management](#state-management)
7. [API Client Setup](#api-client-setup)
8. [Example Components](#example-components)

---

## 🏗️ Backend Structure Overview

### Base URL
```
Development: http://localhost:5000
Production: https://your-domain.com
```

### API Version
```
/api/v1
```

### Response Format
All API responses follow this structure:

**Success Response:**
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { /* response data */ }
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "Error message",
  "errorCode": "ERROR_CODE",
  "errors": [
    {
      "field": "fieldName",
      "message": "Validation error"
    }
  ]
}
```

---

## 📋 API Endpoints Reference

### 🔐 Authentication APIs

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| POST | `/api/v1/auth/register/user` | ❌ | Register new user |
| POST | `/api/v1/auth/register/admin` | ❌ | Register admin (requires code) |
| POST | `/api/v1/auth/login` | ❌ | Login user/admin |
| POST | `/api/v1/auth/refresh-token` | ❌ | Refresh access token |
| POST | `/api/v1/auth/logout` | ✅ | Logout current user |
| GET | `/api/v1/auth/users` | ✅ (Admin) | Get all users |

### 🎮 Game APIs

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| POST | `/api/v1/games` | ✅ | Create new game |
| GET | `/api/v1/games` | ❌ | Get all games (with filters) |
| GET | `/api/v1/games/:id` | ❌ | Get game by ID |
| GET | `/api/v1/games/my/created` | ✅ | Get my created games |
| GET | `/api/v1/games/my/joined` | ✅ | Get games I joined |
| PATCH | `/api/v1/games/:id` | ✅ | Update game (creator only) |
| DELETE | `/api/v1/games/:id` | ✅ | Delete game (creator only) |
| POST | `/api/v1/games/:id/join` | ✅ | Join a game |
| POST | `/api/v1/games/:id/leave` | ✅ | Leave a game |

### 👤 Profile APIs

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| GET | `/api/v1/profile` | ✅ | Get current user profile |
| PATCH | `/api/v1/profile` | ✅ | Update profile |
| POST | `/api/v1/profile/avatar` | ✅ | Upload profile avatar |

---

## 🔑 Authentication Flow

### 1. Registration Flow
```javascript
// Register User
POST /api/v1/auth/register/user
{
  "fullName": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "confirmPassword": "password123"
}

// Response
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "...",
      "fullName": "John Doe",
      "email": "john@example.com",
      "role": "user"
    }
  }
}
```

### 2. Login Flow
```javascript
// Login
POST /api/v1/auth/login
{
  "email": "john@example.com",
  "password": "password123"
}

// Response
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

### 3. Token Management
```javascript
// Store tokens in localStorage/secure storage
localStorage.setItem('accessToken', data.accessToken);
localStorage.setItem('refreshToken', data.refreshToken);
localStorage.setItem('user', JSON.stringify(data.user));

// Add to API requests
headers: {
  'Authorization': `Bearer ${accessToken}`
}
```

### 4. Token Refresh Flow
```javascript
// When access token expires (401 error)
POST /api/v1/auth/refresh-token
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}

// Response - new tokens
{
  "success": true,
  "data": {
    "accessToken": "NEW_TOKEN",
    "refreshToken": "NEW_REFRESH_TOKEN"
  }
}
```

---

## 🎨 Frontend Setup Guide

### Option 1: React + Axios Setup

#### 1. Install Dependencies
```bash
npm install axios react-router-dom
npm install @tanstack/react-query # For data fetching
npm install zustand # For state management (optional)
```

#### 2. Create API Client (`src/lib/api.js`)
```javascript
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api/v1';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - Handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If 401 and not already retried
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        const { data } = await axios.post(`${API_BASE_URL}/auth/refresh-token`, {
          refreshToken,
        });

        // Update tokens
        localStorage.setItem('accessToken', data.data.accessToken);
        localStorage.setItem('refreshToken', data.data.refreshToken);

        // Retry original request with new token
        originalRequest.headers.Authorization = `Bearer ${data.data.accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed - logout user
        localStorage.clear();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
```

#### 3. Create API Services (`src/services/`)

**Auth Service (`src/services/authService.js`):**
```javascript
import api from '../lib/api';

export const authService = {
  // Register user
  register: async (userData) => {
    const { data } = await api.post('/auth/register/user', userData);
    return data;
  },

  // Login
  login: async (credentials) => {
    const { data } = await api.post('/auth/login', credentials);
    
    // Store tokens
    localStorage.setItem('accessToken', data.data.accessToken);
    localStorage.setItem('refreshToken', data.data.refreshToken);
    localStorage.setItem('user', JSON.stringify(data.data.user));
    
    return data;
  },

  // Logout
  logout: async () => {
    try {
      await api.post('/auth/logout');
    } finally {
      localStorage.clear();
    }
  },

  // Get current user
  getCurrentUser: () => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  // Check if authenticated
  isAuthenticated: () => {
    return !!localStorage.getItem('accessToken');
  },
};
```

**Game Service (`src/services/gameService.js`):**
```javascript
import api from '../lib/api';

export const gameService = {
  // Get all games with filters
  getAllGames: async (filters = {}) => {
    const params = new URLSearchParams();
    
    if (filters.category) params.append('category', filters.category);
    if (filters.status) params.append('status', filters.status);
    if (filters.search) params.append('search', filters.search);
    if (filters.page) params.append('page', filters.page);
    if (filters.limit) params.append('limit', filters.limit);

    const { data } = await api.get(`/games?${params}`);
    return data;
  },

  // Get game by ID
  getGameById: async (id, includeDetails = false) => {
    const { data } = await api.get(`/games/${id}?details=${includeDetails}`);
    return data;
  },

  // Create game
  createGame: async (gameData) => {
    const formData = new FormData();
    formData.append('title', gameData.title);
    formData.append('category', gameData.category);
    formData.append('maxPlayers', gameData.maxPlayers);
    formData.append('endTime', gameData.endTime);
    
    if (gameData.description) {
      formData.append('description', gameData.description);
    }
    
    if (gameData.image) {
      formData.append('image', gameData.image);
    }

    const { data } = await api.post('/games', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },

  // Update game
  updateGame: async (id, gameData) => {
    const formData = new FormData();
    
    Object.keys(gameData).forEach((key) => {
      if (gameData[key] !== undefined && gameData[key] !== null) {
        formData.append(key, gameData[key]);
      }
    });

    const { data } = await api.patch(`/games/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },

  // Delete game
  deleteGame: async (id) => {
    const { data } = await api.delete(`/games/${id}`);
    return data;
  },

  // Join game
  joinGame: async (id) => {
    const { data } = await api.post(`/games/${id}/join`);
    return data;
  },

  // Leave game
  leaveGame: async (id) => {
    const { data } = await api.post(`/games/${id}/leave`);
    return data;
  },

  // Get my created games
  getMyCreatedGames: async (filters = {}) => {
    const params = new URLSearchParams(filters);
    const { data } = await api.get(`/games/my/created?${params}`);
    return data;
  },

  // Get my joined games
  getMyJoinedGames: async (filters = {}) => {
    const params = new URLSearchParams(filters);
    const { data } = await api.get(`/games/my/joined?${params}`);
    return data;
  },
};
```

**Profile Service (`src/services/profileService.js`):**
```javascript
import api from '../lib/api';

export const profileService = {
  // Get profile
  getProfile: async () => {
    const { data } = await api.get('/profile');
    return data;
  },

  // Update profile
  updateProfile: async (profileData) => {
    const { data } = await api.patch('/profile', profileData);
    return data;
  },

  // Upload avatar
  uploadAvatar: async (file) => {
    const formData = new FormData();
    formData.append('avatar', file);

    const { data } = await api.post('/profile/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },
};
```

---

## ⚛️ React/Next.js Implementation

### 1. Context for Authentication (`src/context/AuthContext.jsx`)
```javascript
import { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load user from localStorage on mount
    const currentUser = authService.getCurrentUser();
    setUser(currentUser);
    setLoading(false);
  }, []);

  const login = async (credentials) => {
    const response = await authService.login(credentials);
    setUser(response.data.user);
    return response;
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
  };

  const register = async (userData) => {
    const response = await authService.register(userData);
    return response;
  };

  const value = {
    user,
    login,
    logout,
    register,
    isAuthenticated: !!user,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
```

### 2. Protected Route Component (`src/components/ProtectedRoute.jsx`)
```javascript
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return children;
};
```

### 3. Login Component Example
```javascript
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login({ email, password });
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <h1>Login</h1>
      {error && <div className="error">{error}</div>}
      
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        
        <button type="submit" disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
    </div>
  );
};
```

### 4. Games List Component with React Query
```javascript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { gameService } from '../services/gameService';

export const GamesList = () => {
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState({
    category: '',
    status: 'OPEN',
    page: 1,
    limit: 20,
  });

  // Fetch games
  const { data, isLoading, error } = useQuery({
    queryKey: ['games', filters],
    queryFn: () => gameService.getAllGames(filters),
  });

  // Join game mutation
  const joinGameMutation = useMutation({
    mutationFn: (gameId) => gameService.joinGame(gameId),
    onSuccess: () => {
      queryClient.invalidateQueries(['games']);
      alert('Successfully joined game!');
    },
    onError: (error) => {
      alert(error.response?.data?.message || 'Failed to join game');
    },
  });

  if (isLoading) return <div>Loading games...</div>;
  if (error) return <div>Error loading games</div>;

  return (
    <div className="games-list">
      <h1>Available Games</h1>
      
      {/* Filters */}
      <div className="filters">
        <select 
          value={filters.category}
          onChange={(e) => setFilters({ ...filters, category: e.target.value })}
        >
          <option value="">All Categories</option>
          <option value="ONLINE">Online</option>
          <option value="OFFLINE">Offline</option>
        </select>
        
        <select 
          value={filters.status}
          onChange={(e) => setFilters({ ...filters, status: e.target.value })}
        >
          <option value="OPEN">Open</option>
          <option value="FULL">Full</option>
          <option value="ENDED">Ended</option>
        </select>
      </div>

      {/* Games Grid */}
      <div className="games-grid">
        {data?.data?.games?.map((game) => (
          <div key={game._id} className="game-card">
            {game.imageUrl && <img src={game.imageUrl} alt={game.title} />}
            <h3>{game.title}</h3>
            <p>{game.description}</p>
            <p>Players: {game.currentPlayers}/{game.maxPlayers}</p>
            <p>Status: {game.status}</p>
            <p>Category: {game.category}</p>
            
            {game.status === 'OPEN' && (
              <button 
                onClick={() => joinGameMutation.mutate(game._id)}
                disabled={joinGameMutation.isLoading}
              >
                Join Game
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="pagination">
        <button 
          disabled={filters.page === 1}
          onClick={() => setFilters({ ...filters, page: filters.page - 1 })}
        >
          Previous
        </button>
        <span>Page {filters.page} of {data?.data?.pagination?.totalPages}</span>
        <button 
          disabled={filters.page >= data?.data?.pagination?.totalPages}
          onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
        >
          Next
        </button>
      </div>
    </div>
  );
};
```

### 5. Create Game Form Component
```javascript
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { gameService } from '../services/gameService';

export const CreateGameForm = () => {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'ONLINE',
    maxPlayers: 10,
    endTime: '',
    image: null,
  });

  const createGameMutation = useMutation({
    mutationFn: gameService.createGame,
    onSuccess: () => {
      queryClient.invalidateQueries(['games']);
      alert('Game created successfully!');
      // Reset form
      setFormData({
        title: '',
        description: '',
        category: 'ONLINE',
        maxPlayers: 10,
        endTime: '',
        image: null,
      });
    },
    onError: (error) => {
      alert(error.response?.data?.message || 'Failed to create game');
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    createGameMutation.mutate(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="create-game-form">
      <h2>Create New Game</h2>

      <input
        type="text"
        placeholder="Game Title"
        value={formData.title}
        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
        required
      />

      <textarea
        placeholder="Description (optional)"
        value={formData.description}
        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
      />

      <select
        value={formData.category}
        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
      >
        <option value="ONLINE">Online</option>
        <option value="OFFLINE">Offline</option>
      </select>

      <input
        type="number"
        placeholder="Max Players"
        min="1"
        max="1000"
        value={formData.maxPlayers}
        onChange={(e) => setFormData({ ...formData, maxPlayers: parseInt(e.target.value) })}
        required
      />

      <input
        type="datetime-local"
        value={formData.endTime}
        onChange={(e) => setFormData({ ...formData, endTime: new Date(e.target.value).toISOString() })}
        required
      />

      <input
        type="file"
        accept="image/*"
        onChange={(e) => setFormData({ ...formData, image: e.target.files[0] })}
      />

      <button type="submit" disabled={createGameMutation.isLoading}>
        {createGameMutation.isLoading ? 'Creating...' : 'Create Game'}
      </button>
    </form>
  );
};
```

---

## 🔄 State Management with Zustand (Optional)

```javascript
// src/store/useAuthStore.js
import create from 'zustand';
import { authService } from '../services/authService';

export const useAuthStore = create((set) => ({
  user: authService.getCurrentUser(),
  isAuthenticated: authService.isAuthenticated(),
  
  login: async (credentials) => {
    const response = await authService.login(credentials);
    set({ user: response.data.user, isAuthenticated: true });
    return response;
  },
  
  logout: async () => {
    await authService.logout();
    set({ user: null, isAuthenticated: false });
  },
  
  updateUser: (user) => set({ user }),
}));
```

---

## 📱 App.js Setup

```javascript
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { Dashboard } from './pages/Dashboard';
import { GamesList } from './pages/GamesList';
import { CreateGame } from './pages/CreateGame';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            
            <Route path="/games" element={<GamesList />} />
            
            <Route
              path="/games/create"
              element={
                <ProtectedRoute>
                  <CreateGame />
                </ProtectedRoute>
              }
            />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
```

---

## 🌐 Environment Variables

Create `.env` file in frontend root:

```env
REACT_APP_API_URL=http://localhost:5000/api/v1
REACT_APP_SOCKET_URL=http://localhost:5000
```

---

## 🎯 Best Practices

### 1. Error Handling
```javascript
// Create error handler utility
export const handleApiError = (error) => {
  if (error.response) {
    // Server responded with error
    return error.response.data.message || 'Server error';
  } else if (error.request) {
    // Request made but no response
    return 'Network error - please check your connection';
  } else {
    // Something else happened
    return 'An unexpected error occurred';
  }
};
```

### 2. Loading States
```javascript
const { data, isLoading, error, refetch } = useQuery({
  queryKey: ['games'],
  queryFn: gameService.getAllGames,
  retry: 3,
  staleTime: 5000,
});
```

### 3. Optimistic Updates
```javascript
const deleteMutation = useMutation({
  mutationFn: gameService.deleteGame,
  onMutate: async (gameId) => {
    // Cancel any outgoing refetches
    await queryClient.cancelQueries(['games']);
    
    // Snapshot the previous value
    const previousGames = queryClient.getQueryData(['games']);
    
    // Optimistically update
    queryClient.setQueryData(['games'], (old) => 
      old.filter(game => game._id !== gameId)
    );
    
    return { previousGames };
  },
  onError: (err, gameId, context) => {
    // Rollback on error
    queryClient.setQueryData(['games'], context.previousGames);
  },
});
```

---

## 🚀 Quick Start Checklist

- [ ] Install dependencies (`axios`, `react-router-dom`, `@tanstack/react-query`)
- [ ] Create API client with interceptors
- [ ] Set up authentication context
- [ ] Create service files for each module
- [ ] Implement protected routes
- [ ] Add env variables
- [ ] Build login/register pages
- [ ] Create game listing and management pages
- [ ] Test authentication flow
- [ ] Test all game operations

---

## 📖 Additional Resources

- **Swagger UI**: `http://localhost:5000/swagger`
- **React Query Docs**: https://tanstack.com/query
- **Axios Docs**: https://axios-http.com
- **React Router**: https://reactrouter.com

---

**Happy Coding! 🎮**
