# PlaySync - Complete Product Flow & Integration Guide

## 🎮 Product Overview

**PlaySync** is a real-time gaming platform that connects players, manages competitive games, enables live chat, tracks performance through scorecards, maintains leaderboards, and keeps users engaged with in-app notifications.

---

## 📊 System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     FRONTEND (React/Next.js)                 │
│  ┌──────────┬──────────┬──────────┬──────────┬───────────┐ │
│  │   Auth   │  Games   │   Chat   │ Scorecard│   Notif   │ │
│  │  Pages   │  Pages   │  Widget  │  Stats   │   Bell    │ │
│  └──────────┴──────────┴──────────┴──────────┴───────────┘ │
│                           │                                  │
│                    REST API + Socket.IO                      │
└───────────────────────────┼──────────────────────────────────┘
                            │
┌───────────────────────────┼──────────────────────────────────┐
│                    BACKEND (Node.js/Express)                 │
│                            │                                  │
│  ┌────────────────────────┼─────────────────────────────┐   │
│  │              API Gateway + Middleware                 │   │
│  │    (CORS, Auth JWT, Validation, Error Handling)      │   │
│  └────────────────────────┬─────────────────────────────┘   │
│                            │                                  │
│  ┌────────────────────────┴─────────────────────────────┐   │
│  │                Business Logic Layer                   │   │
│  │  ┌──────┬──────┬──────┬──────┬──────┬──────┬──────┐ │   │
│  │  │ Auth │ Game │ Chat │Score │Leader│Notif │Admin │ │   │
│  │  │Module│Module│Module│Module│Module│Module│Module│ │   │
│  │  └──────┴──────┴──────┴──────┴──────┴──────┴──────┘ │   │
│  └────────────────────────┬─────────────────────────────┘   │
│                            │                                  │
│  ┌────────────────────────┴─────────────────────────────┐   │
│  │              Real-time Communication Layer            │   │
│  │    Socket.IO Server (User Rooms, Game Rooms)        │   │
│  └────────────────────────┬─────────────────────────────┘   │
│                            │                                  │
│  ┌────────────────────────┴─────────────────────────────┐   │
│  │               Database Layer (MongoDB)                │   │
│  │   Users | Games | Chat | Scorecards | Notifications  │   │
│  └───────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────┘
```

---

## 🚀 Product Features & Capabilities

### 1️⃣ User Authentication & Management

**Features:**
- ✅ Secure user registration with email verification
- ✅ JWT-based login with refresh token rotation
- ✅ Password reset via OTP
- ✅ Role-based access (User/Admin)
- ✅ Profile management with avatar upload
- ✅ Account security (failed login tracking, account lockout)

**Frontend Integration:**
```javascript
// 1. Register
POST /api/v1/auth/register
Body: { fullName, email, password, phone, favoriteGame }
→ Creates account, sends verification email

// 2. Login
POST /api/v1/auth/login
Body: { email, password }
→ Returns { accessToken, refreshToken, user }

// 3. Update Profile
PATCH /api/v1/auth/profile
Body: { fullName, phone, favoriteGame, place, profilePicture }
→ Updates user profile

// 4. Password Reset
POST /api/v1/auth/forgot-password
POST /api/v1/auth/verify-reset-otp
POST /api/v1/auth/reset-password
```

---

### 2️⃣ Game Discovery & Management

**Features:**
- ✅ Create games (ONLINE/OFFLINE) with image upload
- ✅ Browse all games with filters and pagination
- ✅ Search games by title, category, status
- ✅ Join/leave games with eligibility checks
- ✅ Real-time slot updates (current players, available slots)
- ✅ Game status transitions (OPEN → FULL → ENDED)
- ✅ Creator controls (edit, delete, end game)
- ✅ Participant management (remove, ban users)

**Frontend Integration:**
```javascript
// 1. Browse Games
GET /api/v1/games?page=1&limit=20&category=ONLINE&status=OPEN&search=battle
→ Returns paginated game list with filters

// 2. Create Game
POST /api/v1/games
FormData: { title, description, category, maxPlayers, endTime, image }
→ Creates game, uploads image to Cloudinary

// 3. Get Game Details
GET /api/v1/games/:gameId
→ Returns full game details with participants

// 4. Join Game
POST /api/v1/games/:gameId/join
→ Adds user to game, emits real-time events, sends notification

// 5. Leave Game
POST /api/v1/games/:gameId/leave
→ Removes user from game, updates slots

// 6. My Games (Created)
GET /api/v1/games/my/created
→ Returns games created by user

// 7. My Games (Joined)
GET /api/v1/games/my/joined
→ Returns games user has joined

// 8. Update Game (Creator Only)
PATCH /api/v1/games/:gameId
→ Updates game details

// 9. End Game (Creator Only)
POST /api/v1/games/:gameId/end
→ Ends game, prevents new joins
```

**Real-time Updates (Socket.IO):**
```javascript
// Join discovery room for live updates
socket.emit('join:discovery');

// Listen for game events
socket.on('game:created', (data) => {
  // New game added to list
});

socket.on('game:updated', (data) => {
  // Game details changed
});

socket.on('game:slots:updated', (data) => {
  // Player count changed
});

socket.on('game:status:changed', (data) => {
  // Game status changed (OPEN → FULL)
});
```

---

### 3️⃣ Real-time Chat System

**Features:**
- ✅ Game-specific chat rooms
- ✅ Real-time message delivery
- ✅ Message history with pagination
- ✅ System messages for game events
- ✅ User presence tracking
- ✅ Typing indicators (future)
- ✅ @Mentions support (future)

**Frontend Integration:**
```javascript
// 1. Get Chat History
GET /api/v1/games/:gameId/chat/messages?page=1&limit=50
→ Returns paginated chat history

// 2. Send Message (via Socket.IO)
socket.emit('chat:message', {
  gameId: 'xxx',
  message: 'Hello everyone!'
});

// 3. Listen for Messages
socket.on('chat:message', (data) => {
  // Display new message
  console.log(data.user.fullName, data.message);
});

// 4. Listen for System Messages
socket.on('chat:system', (data) => {
  // Display system notification
  console.log(data.message); // "John Doe joined the game"
});

// 5. Join Chat Room
socket.emit('join:game', gameId);

// 6. Leave Chat Room
socket.emit('leave:game', gameId);
```

---

### 4️⃣ Scorecard & Performance Tracking

**Features:**
- ✅ Record game results (Wins, Losses, Draws, Kills, Deaths)
- ✅ Automatic K/D ratio calculation
- ✅ Historical performance tracking
- ✅ Game-specific statistics
- ✅ User performance dashboard
- ✅ Leaderboard integration

**Frontend Integration:**
```javascript
// 1. Create Scorecard (Post-Game)
POST /api/v1/scorecard
Body: {
  gameId: 'xxx',
  userId: 'yyy',
  wins: 1,
  losses: 0,
  draws: 0,
  kills: 15,
  deaths: 8
}
→ Calculates K/D ratio, updates stats

// 2. Get User Scorecards
GET /api/v1/scorecard/user/:userId?page=1&limit=20
→ Returns user's performance history

// 3. Get Game Scorecards
GET /api/v1/scorecard/game/:gameId?page=1&limit=20
→ Returns all scorecards for a specific game

// 4. Get Scorecard by ID
GET /api/v1/scorecard/:scorecardId
→ Returns detailed scorecard info

// 5. Update Scorecard
PATCH /api/v1/scorecard/:scorecardId
Body: { wins, losses, kills, deaths }
→ Updates statistics

// 6. Delete Scorecard
DELETE /api/v1/scorecard/:scorecardId
```

---

### 5️⃣ Leaderboard System

**Features:**
- ✅ Global ranking based on wins
- ✅ Top 100 players
- ✅ Cached results for performance
- ✅ Real-time rank updates
- ✅ User position tracking
- ✅ Performance metrics display

**Frontend Integration:**
```javascript
// Get Global Leaderboard
GET /api/v1/leaderboard?limit=100
→ Returns top players ranked by wins

// Response example:
{
  leaderboard: [
    {
      rank: 1,
      userId: 'xxx',
      username: 'ProGamer123',
      totalWins: 150,
      totalLosses: 30,
      totalKills: 2500,
      totalDeaths: 800,
      kdRatio: 3.125,
      profilePicture: 'url'
    },
    // ... more players
  ]
}
```

---

### 6️⃣ In-App Notification System ⭐ NEW

**Features:**
- ✅ Real-time push notifications via Socket.IO
- ✅ Persistent notification storage
- ✅ Unread count badge
- ✅ Mark as read functionality
- ✅ Notification types:
  - 🎮 Game Join (when someone joins your game)
  - ✅ Game Full (when game reaches capacity)
  - 💬 Chat Message (future: @mentions)
  - 🏆 Leaderboard rank change (future)
  - ❌ Game Cancelled (future)
  - 📢 System announcements

**Frontend Integration:**
```javascript
// 1. Get Notifications
GET /api/v1/notifications?page=1&limit=20&read=false&type=game_join
→ Returns paginated notifications + unread count

// 2. Get Unread Count
GET /api/v1/notifications/unread-count
→ Returns { unreadCount: 5 }

// 3. Mark as Read
PATCH /api/v1/notifications/:id/read
→ Marks single notification as read

// 4. Mark All as Read
PATCH /api/v1/notifications/read-all
→ Marks all notifications as read

// 5. Real-time (Socket.IO)
socket.emit('join:user', userId); // Join user room

socket.on('notification', (data) => {
  // New notification received
  showToast(data.title, data.message);
  updateBadge();
});

socket.on('notification:unread-count', ({ count }) => {
  // Update badge counter
  setBadgeCount(count);
});
```

---

### 7️⃣ Admin Dashboard

**Features:**
- ✅ User management (view, search, role management)
- ✅ Game moderation (view, delete, end games)
- ✅ Platform statistics
- ✅ Content moderation
- ✅ System health monitoring

**Frontend Integration:**
```javascript
// 1. Get All Users (Admin Only)
GET /api/v1/admin/users?page=1&limit=20&role=user&search=john
→ Returns paginated user list

// 2. Get User Stats
GET /api/v1/admin/stats
→ Returns platform statistics

// 3. Get All Games (Admin)
GET /api/v1/admin/games?page=1&status=OPEN
→ Returns all games with filters

// 4. Delete Game (Admin)
DELETE /api/v1/admin/games/:gameId
→ Removes game from platform

// 5. Update User Role
PATCH /api/v1/admin/users/:userId/role
Body: { role: 'admin' }
→ Changes user role
```

---

## 🎯 Complete User Journey Flows

### Flow 1: New User Registration to First Game

```
┌─────────────────────────────────────────────────────────────┐
│                    USER JOURNEY FLOW                         │
└─────────────────────────────────────────────────────────────┘

1. Landing Page
   ↓
2. Register Account
   POST /api/v1/auth/register
   → Email verification (future)
   ↓
3. Login
   POST /api/v1/auth/login
   → Receive JWT tokens
   → Store in localStorage/cookies
   ↓
4. Dashboard/Home
   → Socket.IO connection established
   → socket.emit('join:user', userId) // For notifications
   → socket.emit('join:discovery') // For game updates
   ↓
5. Browse Games
   GET /api/v1/games?status=OPEN&category=ONLINE
   → Display game cards with real-time slot updates
   → Filter by category, status, search
   ↓
6. View Game Details
   GET /api/v1/games/:gameId
   → Show title, description, image, participants
   → Display join button if eligible
   ↓
7. Join Game
   POST /api/v1/games/:gameId/join
   → Backend checks eligibility
   → Adds user to participants
   → Sends notification to creator
   → Emits real-time event
   ↓
8. Notification Received (Game Creator)
   socket.on('notification') // "John Doe joined your game"
   → Toast notification appears
   → Badge count updates
   ↓
9. Enter Game Chat
   socket.emit('join:game', gameId)
   GET /api/v1/games/:gameId/chat/messages
   → Load chat history
   → Send messages via Socket.IO
   ↓
10. Game Ends
    Creator: POST /api/v1/games/:gameId/end
    ↓
11. Record Scorecard
    POST /api/v1/scorecard
    Body: { gameId, userId, wins, kills, deaths }
    → Updates leaderboard automatically
    ↓
12. View Leaderboard
    GET /api/v1/leaderboard
    → See global rankings
    → Check personal position
```

---

### Flow 2: Creating and Managing a Game

```
┌─────────────────────────────────────────────────────────────┐
│              GAME CREATOR FLOW                               │
└─────────────────────────────────────────────────────────────┘

1. Click "Create Game" Button
   ↓
2. Fill Game Details Form
   - Title: "Friday Night Battle"
   - Description: "Competitive match"
   - Category: ONLINE
   - Max Players: 50
   - End Time: 2026-02-15T22:00:00Z
   - Upload Image (optional)
   ↓
3. Submit Form
   POST /api/v1/games
   FormData: { title, description, category, maxPlayers, endTime, image }
   → Backend uploads image to Cloudinary
   → Creates game in database
   → Emits real-time event to discovery room
   ↓
4. Game Created Successfully
   → Redirect to game detail page
   → socket.on('game:created') triggered for all browsers
   ↓
5. Players Start Joining
   For each join:
   → socket.on('game:player:joined')
   → Update participant list UI
   → Update slot count (48/50 available)
   → Notification received: "Alice joined your game"
   ↓
6. Game Becomes Full (50/50)
   → Status automatically changes to FULL
   → socket.on('game:status:changed')
   → Notification: "Your game is now FULL"
   → Join button disabled for new users
   ↓
7. Game in Progress
   → Chat active with all participants
   → Real-time messages flowing
   → Creator can remove/ban users if needed
   ↓
8. End Game
   POST /api/v1/games/:gameId/end
   → Status changes to ENDED
   → No more joins/leaves allowed
   → Ready for scorecard submission
   ↓
9. View Game History
   GET /api/v1/history?gameId=xxx
   → See all game events and participants
```

---

### Flow 3: Real-time Chat Experience

```
┌─────────────────────────────────────────────────────────────┐
│                CHAT SYSTEM FLOW                              │
└─────────────────────────────────────────────────────────────┘

1. User Joins Game
   POST /api/v1/games/:gameId/join
   ↓
2. Frontend Joins Chat Room
   socket.emit('join:game', gameId)
   ↓
3. Load Chat History
   GET /api/v1/games/:gameId/chat/messages?page=1&limit=50
   → Display last 50 messages
   → Scroll to bottom
   ↓
4. System Message Appears
   socket.on('chat:system')
   → "John Doe joined the game"
   → Displayed in gray/italic
   ↓
5. User Types Message
   → Optional: socket.emit('chat:typing') [future]
   ↓
6. User Sends Message
   socket.emit('chat:message', {
     gameId: 'xxx',
     message: 'Good luck everyone!'
   })
   ↓
7. Backend Processes
   → Saves to database
   → Validates message
   → Broadcasts to room
   ↓
8. All Participants Receive
   socket.on('chat:message', (data) => {
     // Display message with sender info
     profilePic: data.user.profilePicture,
     username: data.user.fullName,
     message: data.message,
     timestamp: data.createdAt
   })
   ↓
9. Future: @Mention Notification
   If message contains @username
   → Trigger notification to mentioned user
   → Highlight message in UI
```

---

### Flow 4: Notification System

```
┌─────────────────────────────────────────────────────────────┐
│            NOTIFICATION SYSTEM FLOW                          │
└─────────────────────────────────────────────────────────────┘

1. User Logs In
   → Frontend connects to Socket.IO
   → socket.emit('join:user', userId)
   ↓
2. Load Initial Notifications
   GET /api/v1/notifications?page=1&limit=20
   → Display in notification panel
   GET /api/v1/notifications/unread-count
   → Update badge counter
   ↓
3. Trigger Event Occurs
   Example: User B joins User A's game
   ↓
4. Backend Creates Notification
   NotificationService.notifyGameJoin(
     creatorId: User A,
     joinerUsername: "User B",
     gameId: "xxx",
     gameTitle: "Friday Battle"
   )
   ↓
5. Backend Saves to Database
   → Notification document created
   → read: false
   → createdAt: now
   ↓
6. Backend Emits via Socket.IO
   io.to('user:${userA}').emit('notification', {
     id: 'yyy',
     type: 'game_join',
     title: 'New Player Joined',
     message: 'User B joined your game "Friday Battle"',
     data: { gameId: 'xxx', username: 'User B' },
     read: false,
     createdAt: Date
   })
   ↓
7. Frontend Receives (User A)
   socket.on('notification', (data) => {
     // Show toast notification
     toast.success(data.title, data.message);
     
     // Update notification list
     setNotifications([data, ...notifications]);
     
     // Increment badge
     setBadgeCount(prev => prev + 1);
     
     // Play sound (optional)
     playNotificationSound();
   })
   ↓
8. User Clicks Notification Bell
   → Opens notification panel
   → Shows list of notifications
   → Unread notifications highlighted
   ↓
9. User Clicks Notification
   PATCH /api/v1/notifications/:id/read
   → Marks as read in database
   → socket.on('notification:read')
   → Update UI (remove highlight)
   → Decrement badge count
   → Navigate to related game (optional)
   ↓
10. User Clicks "Mark All as Read"
    PATCH /api/v1/notifications/read-all
    → All notifications marked as read
    → socket.on('notification:all-read')
    → Badge count → 0
    → All highlights removed
```

---

## 💡 Product Capabilities Summary

### What Your Product Can Do:

1. **User Management**
   - Secure authentication with JWT
   - Profile customization
   - Account security features
   - Password recovery

2. **Game Organization**
   - Create and manage gaming events
   - Browse and discover games
   - Real-time player slots tracking
   - Automatic status management
   - Image uploads for visual appeal

3. **Real-time Communication**
   - Live chat within games
   - Instant message delivery
   - System notifications for events
   - Presence awareness

4. **Performance Tracking**
   - Detailed scorecards
   - Win/Loss/Kill tracking
   - K/D ratio calculations
   - Historical statistics

5. **Competitive Rankings**
   - Global leaderboard
   - Top player showcasing
   - Performance-based ranking
   - Cached for speed

6. **Engagement & Retention**
   - Real-time notifications
   - Activity alerts
   - Game updates
   - Player interaction notifications

7. **Administration**
   - User management dashboard
   - Content moderation tools
   - Platform analytics
   - Game oversight

---

## 🔌 Frontend Integration Checklist

### Setup (One-time)

```javascript
// 1. Install dependencies
npm install socket.io-client axios zustand react-hot-toast

// 2. Create API client
// lib/api.ts
import axios from 'axios';

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000',
  timeout: 10000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 3. Create Socket.IO client
// lib/socket.ts
import { io } from 'socket.io-client';

export const socket = io(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000', {
  autoConnect: false,
  transports: ['websocket'],
});

// 4. Create auth store
// stores/authStore.ts
import create from 'zustand';

export const useAuthStore = create((set) => ({
  user: null,
  token: null,
  login: (user, token) => set({ user, token }),
  logout: () => set({ user: null, token: null }),
}));
```

### Implementation Examples

```javascript
// Game List Component
const GameList = () => {
  const [games, setGames] = useState([]);
  
  useEffect(() => {
    // Join discovery room for real-time updates
    socket.emit('join:discovery');
    
    // Fetch games
    api.get('/api/v1/games?status=OPEN')
      .then(res => setGames(res.data.data.games));
    
    // Listen for updates
    socket.on('game:slots:updated', (data) => {
      setGames(prev => prev.map(game => 
        game._id === data.gameId 
          ? { ...game, currentPlayers: data.currentPlayers }
          : game
      ));
    });
    
    return () => {
      socket.off('game:slots:updated');
    };
  }, []);
  
  return (
    <div>
      {games.map(game => (
        <GameCard key={game._id} game={game} />
      ))}
    </div>
  );
};

// Chat Component
const ChatBox = ({ gameId }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  
  useEffect(() => {
    // Join game room
    socket.emit('join:game', gameId);
    
    // Load history
    api.get(`/api/v1/games/${gameId}/chat/messages`)
      .then(res => setMessages(res.data.data.messages));
    
    // Listen for messages
    socket.on('chat:message', (msg) => {
      setMessages(prev => [...prev, msg]);
    });
    
    return () => {
      socket.emit('leave:game', gameId);
      socket.off('chat:message');
    };
  }, [gameId]);
  
  const sendMessage = () => {
    socket.emit('chat:message', {
      gameId,
      message: input
    });
    setInput('');
  };
  
  return (
    <div>
      <div className="messages">
        {messages.map(msg => (
          <div key={msg._id}>
            <strong>{msg.user.fullName}:</strong> {msg.message}
          </div>
        ))}
      </div>
      <input 
        value={input} 
        onChange={e => setInput(e.target.value)}
        onKeyPress={e => e.key === 'Enter' && sendMessage()}
      />
    </div>
  );
};

// Notification Bell Component
const NotificationBell = () => {
  const { userId } = useAuthStore();
  const [unreadCount, setUnreadCount] = useState(0);
  
  useEffect(() => {
    // Join user room
    socket.emit('join:user', userId);
    
    // Get initial count
    api.get('/api/v1/notifications/unread-count')
      .then(res => setUnreadCount(res.data.data.unreadCount));
    
    // Listen for new notifications
    socket.on('notification', (data) => {
      toast.success(data.title, { description: data.message });
      setUnreadCount(prev => prev + 1);
    });
    
    socket.on('notification:unread-count', ({ count }) => {
      setUnreadCount(count);
    });
    
    return () => {
      socket.off('notification');
      socket.off('notification:unread-count');
    };
  }, [userId]);
  
  return (
    <button className="relative">
      🔔
      {unreadCount > 0 && (
        <span className="badge">{unreadCount}</span>
      )}
    </button>
  );
};
```

---

## 📈 Performance Optimizations

1. **Database Indexes** - All critical queries indexed
2. **Pagination** - All list endpoints paginated
3. **Lean Queries** - Read-only operations use `.lean()`
4. **Caching** - Leaderboard results cached
5. **Socket.IO Rooms** - Targeted event broadcasting
6. **Image CDN** - Cloudinary for image optimization
7. **TTL Cleanup** - Auto-delete old notifications

---

## 🔒 Security Features

1. **JWT Authentication** - Secure token-based auth
2. **Password Hashing** - bcrypt with salt rounds
3. **Input Validation** - Zod schema validation
4. **Rate Limiting** - Prevent abuse (recommended to add)
5. **CORS Configuration** - Controlled origin access
6. **Role-based Access** - Admin vs User permissions
7. **Data Sanitization** - Prevent injection attacks

---

## 🎨 UI/UX Features to Implement

### Dashboard
- Game discovery grid with filters
- Quick stats (games joined, wins, rank)
- Recent notifications
- Active games section

### Game Detail Page
- Hero image banner
- Real-time participant list
- Live slot counter
- Chat sidebar
- Join/Leave buttons with status

### Notification Panel
- Dropdown with badge counter
- Grouped by type
- Mark as read on click
- Clear all button
- Click to navigate

### Leaderboard Page
- Top 100 table
- User highlight
- Avatar + stats
- Sortable columns
- Search functionality

### Profile Page
- Avatar upload
- Stats overview
- Game history
- Scorecard timeline
- Edit profile modal

---

## 📱 Progressive Enhancement Ideas

### Phase 1 (MVP) ✅ DONE
- User authentication
- Game CRUD
- Real-time chat
- Scorecards
- Leaderboard
- Notifications

### Phase 2 (Next Sprint)
- [ ] Email notifications
- [ ] Push notifications (Web Push API)
- [ ] @Mention functionality
- [ ] Game categories/tags
- [ ] Advanced search/filters
- [ ] User following system

### Phase 3 (Future)
- [ ] Video/Voice chat
- [ ] Tournaments
- [ ] Teams/Clans
- [ ] Achievements/Badges
- [ ] Rewards system
- [ ] Analytics dashboard

---

## 🌐 API Base URL

**Development:** `http://localhost:5000`  
**Production:** `https://your-domain.com`

**All endpoints prefixed with:** `/api/v1`

---

## 📞 Support & Documentation

- **Full API Docs:** [http://localhost:5000/swagger](http://localhost:5000/swagger)
- **Module READMEs:** See each module's README.md
- **Integration Example:** `src/modules/notification/FRONTEND_INTEGRATION.ts`

---

**Built with:** Node.js, Express, TypeScript, MongoDB, Socket.IO, Cloudinary  
**Frontend Stack:** React/Next.js, TailwindCSS, Socket.IO Client, Axios  
**Last Updated:** February 2026
