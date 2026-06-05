'use client';
import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from 'react';
import { Notification } from '@/types/notification';
import { useUser } from '@/hooks/use-user';

interface NotificationContextValue {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (n: Omit<Notification, 'id' | 'read' | 'createdAt'>) => void;
  addNotificationForUser: (
    userId: string,
    n: Omit<Notification, 'id' | 'read' | 'createdAt'>
  ) => void;
  fetchNotifications: () => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  remove: (id: string) => void;
  clearAll: () => void;
}

const NotificationContext = createContext<NotificationContextValue | null>(
  null
);

export function NotificationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useUser();
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch('/api/notifications');
      const data = await res.json();

      setNotifications(Array.isArray(data) ? data.filter((n) => n?._id) : []);
    } catch (error) {
      console.error(error);
    }
  }, []);

  useEffect(() => {
    if (!user?._id) return;
    fetchNotifications();

    const interval = setInterval(fetchNotifications, 30_000);
    return () => clearInterval(interval);
  }, [fetchNotifications, user?._id]);

  const addNotification = useCallback(
    async (n: Omit<Notification, 'id' | 'read' | 'createdAt'>) => {
      try {
        await fetch('/api/notifications', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...n,
            userId: user?._id,
            read: false,
          }),
        });

        await fetchNotifications();
      } catch (error) {
        console.error(error);
      }
    },
    [user?._id, fetchNotifications]
  );
  const addNotificationForUser = useCallback(
    async (
      userId: string,
      n: Omit<Notification, 'id' | 'read' | 'createdAt'>
    ) => {
      try {
        await fetch('/api/notifications', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...n,
            userId,
            read: false,
          }),
        });
      } catch (error) {
        console.error(error);
      }
    },
    []
  );

  const markAsRead = useCallback(
    async (id: string) => {
      await fetch(`/api/notifications/${id}`, { method: 'PATCH' });

      await fetchNotifications();
    },
    [fetchNotifications]
  );

  const markAllAsRead = useCallback(async () => {
    await fetch('/api/notifications', { method: 'PATCH' });
    await fetchNotifications();
  }, [fetchNotifications]);

  const remove = useCallback(
    async (id: string) => {
      await fetch(`/api/notifications/${id}`, { method: 'DELETE' });
      await fetchNotifications();
    },
    [fetchNotifications]
  );

  const clearAll = useCallback(async () => {
    await fetch('/api/notifications', { method: 'DELETE' });
    await fetchNotifications();
  }, [fetchNotifications]);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount: notifications.filter((n) => !n.read).length,
        addNotification,
        addNotificationForUser,
        fetchNotifications,
        markAsRead,
        markAllAsRead,
        remove,
        clearAll,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export const useNotifications = () => {
  const ctx = useContext(NotificationContext);
  if (!ctx)
    throw new Error(
      'useNotifications must be used within NotificationProvider'
    );
  return ctx;
};
