# PlaySync - Frontend Integration Architecture

Visual guide for frontend developers to understand how to integrate with PlaySync backend.

---

## 📱 Application Pages & Features

```
┌─────────────────────────────────────────────────────────────────┐
│                      FRONTEND STRUCTURE                          │
└─────────────────────────────────────────────────────────────────┘

📄 Landing Page (Public)
   ├── Hero Section
   ├── Features Overview
   ├── Login/Register Buttons
   └── Browse Games Preview

📄 Auth Pages
   ├── /login
   ├── /register
   ├── /forgot-password
   └── /reset-password

📄 Dashboard (Protected)
   ├── Header
   │   ├── Logo
   │   ├── Search Bar
   │   ├── Notification Bell 🔔 (unread count badge)
   │   └── User Menu (Avatar + Dropdown)
   │
   ├── Sidebar
   │   ├── Home
   │   ├── Browse Games
   │   ├── My Games
   │   ├── Leaderboard
   │   ├── Profile
   │   └── Admin (if admin role)
   │
   └── Main Content Area

📄 Browse Games Page
   ├── Filters (Category, Status, Search)
   ├── Sort Options
   ├── Game Grid/List
   │   └── Game Card
   │       ├── Image
   │       ├── Title
   │       ├── Status Badge (OPEN/FULL/ENDED)
   │       ├── Slots Counter (23/50)
   │       ├── Creator Info
   │       └── Join Button
   └── Pagination

📄 Game Detail Page
   ├── Hero Banner (Game Image)
   ├── Game Info Section
   │   ├── Title & Description
   │   ├── Category & Status
   │   ├── Time Remaining
   │   ├── Creator Info
   │   └── Action Buttons (Join/Leave/Edit/Delete)
   │
   ├── Participants Section
   │   ├── Current Count (23/50)
   │   ├── Participant Grid (Avatars)
   │   └── See All Modal
   │
   └── Live Chat Sidebar
       ├── Message List (auto-scroll)
       ├── Message Input
       └── Send Button

📄 My Games Page
   ├── Tabs: Created | Joined
   ├── Filter by Status
   └── Game List

📄 Profile Page
   ├── Avatar Upload
   ├── Edit Profile Form
   ├── Stats Overview
   │   ├── Total Games Played
   │   ├── Win Rate
   │   ├── K/D Ratio
   │   └── Current Rank
   └── Recent Scorecards

📄 Leaderboard Page
   ├── Top 100 Table
   │   ├── Rank
   │   ├── Avatar
   │   ├── Username
   │   ├── Wins
   │   ├── K/D Ratio
   │   └── Highlight Current User
   └── Search Filter

📄 Admin Dashboard (Admin Only)
   ├── Platform Stats Cards
   ├── User Management Table
   ├── Game Moderation Panel
   └── Content Reports
```

---

## 🔄 Complete Data Flow Examples

### Example 1: User Creates and Manages a Game

```
┌─────────────────────────────────────────────────────────────────┐
│ SCENARIO: User creates a game and players join                  │
└─────────────────────────────────────────────────────────────────┘

Step 1: Navigate to Create Game
┌──────────────────────┐
│  Frontend Action     │  Click "Create Game" button
└──────────────────────┘
           ↓
┌──────────────────────┐
│  UI Updates          │  Show Create Game modal/page
└──────────────────────┘

Step 2: Fill Form
┌──────────────────────┐
│  User Input          │  ✏️ Title: "Friday Night Valorant"
│                      │  ✏️ Description: "Competitive 5v5"
│                      │  ✏️ Category: ONLINE
│                      │  📷 Upload Image
│                      │  👥 Max Players: 10
│                      │  📅 End Time: Tomorrow 9 PM
└──────────────────────┘
           ↓
┌──────────────────────┐
│  Frontend Validation │  Validate all fields (Zod client-side)
└──────────────────────┘
           ↓
┌──────────────────────┐
│  API Call            │  POST /api/v1/games
│                      │  FormData with image
│                      │  Authorization: Bearer {token}
└──────────────────────┘
           ↓
┌──────────────────────┐
│  Backend Processing  │  ✅ Validate data (Zod)
│                      │  ✅ Upload image to Cloudinary
│                      │  ✅ Save to MongoDB
│                      │  ✅ Emit Socket.IO event
└──────────────────────┘
           ↓
┌──────────────────────┐
│  Response Received   │  { success: true, data: { game } }
└──────────────────────┘
           ↓
┌──────────────────────┐
│  Frontend Actions    │  ✅ Show success toast
│                      │  ✅ Redirect to game detail page
│                      │  ✅ Update UI state
└──────────────────────┘

Step 3: Real-time Updates (Other Users)
┌──────────────────────┐
│  Socket.IO Event     │  socket.on('game:created')
└──────────────────────┘
           ↓
┌──────────────────────┐
│  Browse Games Page   │  ✅ New game appears in list
│                      │  ✅ No page refresh needed!
└──────────────────────┘

Step 4: Player B Joins the Game
┌──────────────────────┐
│  Player B Action     │  Click "Join Game" button
└──────────────────────┘
           ↓
┌──────────────────────┐
│  API Call            │  POST /api/v1/games/:gameId/join
└──────────────────────┘
           ↓
┌──────────────────────┐
│  Backend Processing  │  ✅ Check eligibility
│                      │  ✅ Add to participants
│                      │  ✅ Increment currentPlayers
│                      │  ✅ Create notification for creator
│                      │  ✅ Send system chat message
│                      │  ✅ Emit Socket.IO events
└──────────────────────┘
           ↓
┌────────────────────────────────────────────────────────────┐
│  Multiple Real-time Updates Triggered:                     │
├────────────────────────────────────────────────────────────┤
│  1. Game Room (all participants)                           │
│     socket.on('game:player:joined')                        │
│     → Update participant list                              │
│     → Update slot counter (1/10 → 2/10)                    │
│                                                             │
│  2. Discovery Room (browse page viewers)                   │
│     socket.on('game:slots:updated')                        │
│     → Update slot count in game card                       │
│                                                             │
│  3. Creator's User Room (notification)                     │
│     socket.on('notification')                              │
│     → Show toast: "Player B joined your game"             │
│     → Increment notification badge                         │
│                                                             │
│  4. Game Chat Room                                          │
│     socket.on('chat:system')                               │
│     → Display: "Player B joined the game"                  │
└────────────────────────────────────────────────────────────┘

Step 5: Game Reaches Capacity (10/10)
┌──────────────────────┐
│  Last Player Joins   │  POST /api/v1/games/:gameId/join
└──────────────────────┘
           ↓
┌──────────────────────┐
│  Backend Auto-Update │  ✅ currentPlayers = 10
│                      │  ✅ status = "FULL"
│                      │  ✅ Create "Game Full" notification
│                      │  ✅ Emit status change event
└──────────────────────┘
           ↓
┌──────────────────────┐
│  Real-time Updates   │  socket.on('game:status:changed')
│                      │  → Status badge: OPEN → FULL
│                      │  → Join button disabled
│                      │  → Creator notification received
└──────────────────────┘
```

---

### Example 2: Real-time Chat Flow

```
┌─────────────────────────────────────────────────────────────────┐
│ SCENARIO: User sends message in game chat                       │
└─────────────────────────────────────────────────────────────────┘

Step 1: Enter Game Detail Page
┌──────────────────────┐
│  Component Mount     │  useEffect triggered
└──────────────────────┘
           ↓
┌──────────────────────┐
│  Socket.IO Setup     │  socket.emit('join:game', gameId)
└──────────────────────┘
           ↓
┌──────────────────────┐
│  Load Chat History   │  GET /api/v1/games/:gameId/chat/messages
└──────────────────────┘
           ↓
┌──────────────────────┐
│  Display Messages    │  Render last 50 messages
│                      │  Auto-scroll to bottom
└──────────────────────┘

Step 2: User Types Message
┌──────────────────────┐
│  Input Field         │  ✏️ "Good luck everyone!"
└──────────────────────┘
           ↓
┌──────────────────────┐
│  Optional: Typing    │  socket.emit('chat:typing', true)
│  Indicator           │  → Show "User is typing..." to others
└──────────────────────┘

Step 3: Send Message
┌──────────────────────┐
│  User Action         │  Click Send / Press Enter
└──────────────────────┘
           ↓
┌──────────────────────┐
│  Socket.IO Emit      │  socket.emit('chat:message', {
│                      │    gameId: 'xxx',
│                      │    message: 'Good luck everyone!'
│                      │  })
└──────────────────────┘
           ↓
┌──────────────────────┐
│  Backend Processing  │  ✅ Validate message
│                      │  ✅ Save to database
│                      │  ✅ Get user details
│                      │  ✅ Broadcast to room
└──────────────────────┘
           ↓
┌────────────────────────────────────────────────────────────┐
│  All Participants Receive (Real-time):                     │
├────────────────────────────────────────────────────────────┤
│  socket.on('chat:message', (data) => {                     │
│    // data = {                                             │
│    //   _id: 'msg123',                                     │
│    //   user: {                                            │
│    //     fullName: 'John Doe',                            │
│    //     profilePicture: 'https://...'                    │
│    //   },                                                 │
│    //   message: 'Good luck everyone!',                    │
│    //   messageType: 'user',                               │
│    //   createdAt: '2026-02-13T15:30:00Z'                  │
│    // }                                                    │
│                                                             │
│    // Frontend Updates:                                    │
│    setMessages(prev => [...prev, data]);                  │
│    scrollToBottom();                                       │
│    playMessageSound();                                     │
│  });                                                        │
└────────────────────────────────────────────────────────────┘

Step 4: Future Enhancement - @Mention
┌──────────────────────┐
│  User Types          │  ✏️ "@Alice nice shot!"
└──────────────────────┘
           ↓
┌──────────────────────┐
│  Backend Detects     │  Parse message for @mentions
│                      │  Extract mentioned user IDs
└──────────────────────┘
           ↓
┌──────────────────────┐
│  Send Notification   │  POST notification to mentioned user
│                      │  type: 'chat_message'
│                      │  message: "You were mentioned in chat"
└──────────────────────┘
           ↓
┌──────────────────────┐
│  Alice Receives      │  socket.on('notification')
│                      │  → Toast notification
│                      │  → Message highlighted in chat
└──────────────────────┘
```

---

### Example 3: Notification Flow

```
┌─────────────────────────────────────────────────────────────────┐
│ SCENARIO: User receives and manages notifications               │
└─────────────────────────────────────────────────────────────────┘

Step 1: User Logs In
┌──────────────────────┐
│  After Login         │  Socket.IO connection established
└──────────────────────┘
           ↓
┌──────────────────────┐
│  Join User Room      │  socket.emit('join:user', userId)
└──────────────────────┘
           ↓
┌──────────────────────┐
│  Load Notifications  │  GET /api/v1/notifications?page=1
│                      │  GET /api/v1/notifications/unread-count
└──────────────────────┘
           ↓
┌──────────────────────┐
│  Update UI           │  📬 Badge shows unread count (5)
└──────────────────────┘

Step 2: Trigger Event Occurs (Someone joins user's game)
┌──────────────────────┐
│  Backend Event       │  User B joins User A's game
└──────────────────────┘
           ↓
┌──────────────────────┐
│  Create Notification │  NotificationService.notifyGameJoin()
│                      │  → Save to database
└──────────────────────┘
           ↓
┌──────────────────────┐
│  Emit via Socket.IO  │  io.to('user:${userA}').emit('notification', {
│                      │    id: 'notif123',
│                      │    type: 'game_join',
│                      │    title: 'New Player Joined',
│                      │    message: 'User B joined your game',
│                      │    data: { gameId, username: 'User B' },
│                      │    read: false,
│                      │    createdAt: '...'
│                      │  })
└──────────────────────┘
           ↓
┌────────────────────────────────────────────────────────────┐
│  User A's Frontend Receives:                               │
├────────────────────────────────────────────────────────────┤
│  socket.on('notification', (data) => {                     │
│    // 1. Show Toast                                        │
│    toast.success(data.title, {                             │
│      description: data.message,                            │
│      icon: '👥',                                            │
│      duration: 4000                                        │
│    });                                                      │
│                                                             │
│    // 2. Update Notification List                          │
│    setNotifications(prev => [data, ...prev]);             │
│                                                             │
│    // 3. Update Badge Count                                │
│    setUnreadCount(prev => prev + 1);                       │
│                                                             │
│    // 4. Play Sound                                        │
│    playNotificationSound();                                │
│                                                             │
│    // 5. Browser Notification (if permitted)               │
│    new Notification(data.title, {                          │
│      body: data.message,                                   │
│      icon: '/logo.png'                                     │
│    });                                                      │
│  });                                                        │
└────────────────────────────────────────────────────────────┘

Step 3: User Opens Notification Panel
┌──────────────────────┐
│  Click Bell Icon     │  Toggle notification dropdown
└──────────────────────┘
           ↓
┌──────────────────────┐
│  Display List        │  📬 New Player Joined (unread)
│                      │  💬 New message in chat (unread)
│                      │  ✅ Game is Full (read)
│                      │  👥 Player left game (read)
│                      │
│                      │  [Mark all as read] button
└──────────────────────┘

Step 4: Click on Notification
┌──────────────────────┐
│  User Action         │  Click notification item
└──────────────────────┘
           ↓
┌──────────────────────┐
│  Mark as Read        │  PATCH /api/v1/notifications/:id/read
└──────────────────────┘
           ↓
┌──────────────────────┐
│  Backend Updates     │  ✅ Update database
│                      │  ✅ Emit socket event
└──────────────────────┘
           ↓
┌──────────────────────┐
│  Frontend Updates    │  socket.on('notification:read')
│                      │  → Remove highlight
│                      │  → Decrement badge (5 → 4)
│                      │  → Optional: Navigate to game
└──────────────────────┘

Step 5: Mark All as Read
┌──────────────────────┐
│  User Action         │  Click "Mark all as read"
└──────────────────────┘
           ↓
┌──────────────────────┐
│  API Call            │  PATCH /api/v1/notifications/read-all
└──────────────────────┘
           ↓
┌──────────────────────┐
│  Backend Updates     │  ✅ Update all unread → read
│                      │  ✅ Return modifiedCount
│                      │  ✅ Emit socket event
└──────────────────────┘
           ↓
┌──────────────────────┐
│  Frontend Updates    │  socket.on('notification:all-read')
│                      │  → Remove all highlights
│                      │  → Badge count = 0
└──────────────────────┘
```

---

## 🎨 Frontend Component Structure

```javascript
// Suggested React component hierarchy

App
├── AuthProvider (Context)
│   └── Socket Provider (Context)
│
├── PublicLayout
│   ├── LandingPage
│   ├── LoginPage
│   └── RegisterPage
│
└── ProtectedLayout
    ├── Header
    │   ├── Logo
    │   ├── SearchBar
    │   ├── NotificationBell ⭐
    │   │   ├── Badge (unread count)
    │   │   └── NotificationDropdown
    │   │       ├── NotificationList
    │   │       │   └── NotificationItem (map)
    │   │       └── MarkAllReadButton
    │   └── UserMenu
    │
    ├── Sidebar
    │   └── Navigation Links
    │
    └── Main Content
        ├── DashboardPage
        │   ├── StatsCards
        │   ├── FeaturedGames
        │   └── RecentActivity
        │
        ├── BrowseGamesPage
        │   ├── FilterBar
        │   ├── GameGrid
        │   │   └── GameCard (map) ⭐
        │   │       ├── GameImage
        │   │       ├── GameInfo
        │   │       ├── StatusBadge
        │   │       ├── SlotCounter ⭐ (real-time)
        │   │       └── JoinButton
        │   └── Pagination
        │
        ├── GameDetailPage ⭐
        │   ├── GameHero
        │   ├── GameInfo
        │   ├── ActionButtons
        │   ├── ParticipantList ⭐ (real-time)
        │   └── ChatSidebar ⭐
        │       ├── MessageList (real-time)
        │       └── MessageInput (Socket.IO)
        │
        ├── MyGamesPage
        │   ├── Tabs (Created/Joined)
        │   └── GameList
        │
        ├── ProfilePage
        │   ├── ProfileHeader
        │   ├── EditProfileForm
        │   ├── StatsSection
        │   └── ScorecardTimeline
        │
        ├── LeaderboardPage
        │   ├── RankTable
        │   │   └── PlayerRow (map)
        │   └── CurrentUserHighlight
        │
        └── AdminDashboard (if admin)
            ├── StatsCards
            ├── UserManagement
            └── GameModeration
```

---

## 🔌 State Management Recommendation

```javascript
// Zustand stores structure

// 1. Auth Store
const useAuthStore = create((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  login: (user, token) => set({ user, token, isAuthenticated: true }),
  logout: () => set({ user: null, token: null, isAuthenticated: false }),
  updateUser: (updates) => set((state) => ({ user: { ...state.user, ...updates } }))
}));

// 2. Notification Store
const useNotificationStore = create((set) => ({
  notifications: [],
  unreadCount: 0,
  addNotification: (notification) => set((state) => ({
    notifications: [notification, ...state.notifications],
    unreadCount: state.unreadCount + 1
  })),
  markAsRead: (id) => set((state) => ({
    notifications: state.notifications.map(n =>
      n.id === id ? { ...n, read: true } : n
    ),
    unreadCount: state.unreadCount - 1
  })),
  markAllAsRead: () => set((state) => ({
    notifications: state.notifications.map(n => ({ ...n, read: true })),
    unreadCount: 0
  })),
  setNotifications: (notifications, unreadCount) => 
    set({ notifications, unreadCount })
}));

// 3. Game Store
const useGameStore = create((set) => ({
  games: [],
  selectedGame: null,
  filters: { status: 'OPEN', category: null },
  setGames: (games) => set({ games }),
  updateGame: (gameId, updates) => set((state) => ({
    games: state.games.map(g => g._id === gameId ? { ...g, ...updates } : g),
    selectedGame: state.selectedGame?._id === gameId 
      ? { ...state.selectedGame, ...updates }
      : state.selectedGame
  })),
  setSelectedGame: (game) => set({ selectedGame: game }),
  setFilters: (filters) => set({ filters })
}));

// 4. Chat Store (per game)
const useChatStore = create((set) => ({
  messages: {},
  addMessage: (gameId, message) => set((state) => ({
    messages: {
      ...state.messages,
      [gameId]: [...(state.messages[gameId] || []), message]
    }
  })),
  setMessages: (gameId, messages) => set((state) => ({
    messages: { ...state.messages, [gameId]: messages }
  }))
}));
```

---

## 🚀 Performance Best Practices

### 1. API Call Optimization
```javascript
// Use React Query for caching
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Games list with cache
const { data, isLoading } = useQuery({
  queryKey: ['games', filters],
  queryFn: () => api.get('/games', { params: filters }),
  staleTime: 30000, // Cache for 30 seconds
  cacheTime: 5 * 60 * 1000 // Keep in cache for 5 minutes
});

// Optimistic updates
const queryClient = useQueryClient();
const joinGameMutation = useMutation({
  mutationFn: (gameId) => api.post(`/games/${gameId}/join`),
  onMutate: async (gameId) => {
    // Optimistically update UI
    await queryClient.cancelQueries(['games']);
    const previousGames = queryClient.getQueryData(['games']);
    
    queryClient.setQueryData(['games'], (old) => ({
      ...old,
      games: old.games.map(g => 
        g._id === gameId 
          ? { ...g, currentPlayers: g.currentPlayers + 1 }
          : g
      )
    }));
    
    return { previousGames };
  },
  onError: (err, variables, context) => {
    // Rollback on error
    queryClient.setQueryData(['games'], context.previousGames);
  }
});
```

### 2. Socket.IO Optimization
```javascript
// Singleton socket instance
// lib/socket.ts
let socket = null;

export const getSocket = () => {
  if (!socket) {
    socket = io(API_URL, { /* config */ });
  }
  return socket;
};

// Cleanup on unmount
useEffect(() => {
  const socket = getSocket();
  
  socket.on('notification', handleNotification);
  
  return () => {
    socket.off('notification', handleNotification);
  };
}, []);
```

### 3. Image Optimization
```javascript
// Use Next.js Image component
import Image from 'next/image';

<Image
  src={game.imageUrl}
  alt={game.title}
  width={400}
  height={300}
  loading="lazy"
  placeholder="blur"
  blurDataURL="/placeholder.jpg"
/>
```

### 4. List Virtualization
```javascript
// For long lists (leaderboard, notifications)
import { useVirtualizer } from '@tanstack/react-virtual';

const virtualizer = useVirtualizer({
  count: notifications.length,
  getScrollElement: () => parentRef.current,
  estimateSize: () => 80, // Estimated row height
  overscan: 5
});
```

---

## ✅ Integration Checklist

### Phase 1: Setup
- [ ] Install dependencies (axios, socket.io-client, react-query, zustand)
- [ ] Create API client with interceptors
- [ ] Setup Socket.IO singleton
- [ ] Create authentication flow
- [ ] Setup protected routes

### Phase 2: Core Features
- [ ] User registration/login
- [ ] Dashboard layout with header/sidebar
- [ ] Browse games with filters
- [ ] Game detail page
- [ ] Join/leave game functionality
- [ ] Real-time slot updates

### Phase 3: Real-time Features
- [ ] Socket.IO connection on login
- [ ] Real-time chat implementation
- [ ] Live game updates
- [ ] Notification bell component
- [ ] Real-time notification delivery

### Phase 4: Additional Features
- [ ] Profile page with edit
- [ ] Scorecard creation
- [ ] Leaderboard display
- [ ] My games (created/joined)
- [ ] Admin dashboard (if applicable)

### Phase 5: Polish
- [ ] Toast notifications (react-hot-toast/sonner)
- [ ] Loading states
- [ ] Error handling
- [ ] Empty states
- [ ] Responsive design
- [ ] Accessibility (ARIA labels)

---

## 📦 Recommended Dependencies

```json
{
  "dependencies": {
    "react": "^18.2.0",
    "next": "^14.0.0",
    "axios": "^1.6.0",
    "socket.io-client": "^4.6.0",
    "@tanstack/react-query": "^5.0.0",
    "zustand": "^4.4.0",
    "react-hook-form": "^7.48.0",
    "zod": "^3.22.0",
    "@hookform/resolvers": "^3.3.0",
    "sonner": "^1.2.0",
    "date-fns": "^2.30.0",
    "clsx": "^2.0.0",
    "tailwindcss": "^3.3.0"
  }
}
```

---

**Frontend Guide Version:** 1.0.0  
**Last Updated:** February 2026  
**Compatible Backend Version:** 1.0.0
