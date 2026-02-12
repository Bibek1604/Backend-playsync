/**
 * Notification System - Frontend Integration Example
 * How to integrate real-time notifications in your React/Next.js app
 */

import { io, Socket } from 'socket.io-client';
import { useEffect, useState } from 'react';

// ============================================================
// TYPES
// ============================================================

export enum NotificationType {
  GAME_JOIN = 'game_join',
  GAME_FULL = 'game_full',
  CHAT_MESSAGE = 'chat_message',
  LEADERBOARD = 'leaderboard',
  GAME_CANCEL = 'game_cancel',
  SYSTEM = 'system'
}

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  data: {
    gameId?: string;
    userId?: string;
    username?: string;
    gameTitle?: string;
    [key: string]: any;
  };
  read: boolean;
  createdAt: Date;
}

// ============================================================
// SOCKET.IO CLIENT SETUP
// ============================================================

let socket: Socket | null = null;

export const initializeNotificationSocket = (userId: string, token: string): Socket => {
  if (!socket) {
    socket = io(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000', {
      auth: { token },
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    // Join user room for notifications
    socket.on('connect', () => {
      console.log('✅ Socket connected');
      socket?.emit('join:user', userId);
    });

    socket.on('disconnect', () => {
      console.log('❌ Socket disconnected');
    });

    socket.on('error', (error) => {
      console.error('Socket error:', error);
    });
  }

  return socket;
};

export const disconnectNotificationSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

// ============================================================
// REACT HOOK - useNotifications
// ============================================================

interface UseNotificationsReturn {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  fetchNotifications: (page?: number, limit?: number) => Promise<void>;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
}

export const useNotifications = (userId: string, token: string): UseNotificationsReturn => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const socket = initializeNotificationSocket(userId, token);

    // Listen for new notifications
    socket.on('notification', (notification: Notification) => {
      console.log('📬 New notification:', notification);
      
      // Add to top of list
      setNotifications((prev) => [notification, ...prev]);
      
      // Increment unread count
      setUnreadCount((prev) => prev + 1);
      
      // Show toast notification
      showToast(notification);
    });

    // Listen for unread count updates
    socket.on('notification:unread-count', (data: { count: number }) => {
      console.log('📊 Unread count updated:', data.count);
      setUnreadCount(data.count);
    });

    // Listen for read events
    socket.on('notification:read', (data: { notificationId: string }) => {
      setNotifications((prev) =>
        prev.map((n) => (n.id === data.notificationId ? { ...n, read: true } : n))
      );
    });

    // Listen for all read events
    socket.on('notification:all-read', () => {
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    });

    // Fetch initial notifications
    fetchNotifications();

    return () => {
      socket.off('notification');
      socket.off('notification:unread-count');
      socket.off('notification:read');
      socket.off('notification:all-read');
    };
  }, [userId, token]);

  const fetchNotifications = async (page = 1, limit = 20) => {
    setLoading(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/notifications?page=${page}&limit=${limit}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();
      
      if (data.success) {
        setNotifications(data.data.notifications);
        setUnreadCount(data.data.unreadCount);
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/notifications/${notificationId}/read`,
        {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();
      
      if (data.success) {
        setNotifications((prev) =>
          prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
        );
      }
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/notifications/read-all`,
        {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();
      
      if (data.success) {
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
        setUnreadCount(0);
      }
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  return {
    notifications,
    unreadCount,
    loading,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
  };
};

// ============================================================
// HELPER FUNCTIONS
// ============================================================

const showToast = (notification: Notification) => {
  // Example using react-hot-toast or sonner
  // toast.success(notification.title, {
  //   description: notification.message,
  //   icon: getNotificationIcon(notification.type),
  // });
  
  console.log('🔔 Toast:', notification.title, notification.message);
};

const getNotificationIcon = (type: NotificationType): string => {
  switch (type) {
    case NotificationType.GAME_JOIN:
      return '👥';
    case NotificationType.GAME_FULL:
      return '✅';
    case NotificationType.CHAT_MESSAGE:
      return '💬';
    case NotificationType.LEADERBOARD:
      return '🏆';
    case NotificationType.GAME_CANCEL:
      return '❌';
    case NotificationType.SYSTEM:
      return '📢';
    default:
      return '🔔';
  }
};

// ============================================================
// REACT COMPONENT EXAMPLE
// ============================================================

export const NotificationBell: React.FC<{ userId: string; token: string }> = ({
  userId,
  token,
}) => {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications(
    userId,
    token
  );
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      {/* Bell Icon with Badge */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-full hover:bg-gray-100"
      >
        🔔
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-lg border">
          <div className="p-4 border-b flex justify-between items-center">
            <h3 className="font-semibold">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-sm text-blue-600 hover:underline"
              >
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                No notifications yet
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  onClick={() => !notification.read && markAsRead(notification.id)}
                  className={`p-4 border-b cursor-pointer hover:bg-gray-50 ${
                    !notification.read ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">
                      {getNotificationIcon(notification.type)}
                    </span>
                    <div className="flex-1">
                      <h4 className="font-medium text-sm">{notification.title}</h4>
                      <p className="text-sm text-gray-600 mt-1">
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(notification.createdAt).toLocaleString()}
                      </p>
                    </div>
                    {!notification.read && (
                      <div className="h-2 w-2 bg-blue-600 rounded-full" />
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================================
// USAGE IN APP
// ============================================================

/*
// In your layout or main component:

import { useAuth } from '@/hooks/useAuth';
import { NotificationBell } from '@/components/NotificationBell';

export default function DashboardLayout() {
  const { user, token } = useAuth();

  return (
    <div>
      <header>
        <nav>
          {user && <NotificationBell userId={user.id} token={token} />}
        </nav>
      </header>
      
      <main>{children}</main>
    </div>
  );
}
*/
