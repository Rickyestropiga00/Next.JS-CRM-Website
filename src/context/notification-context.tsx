'use client';
import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from 'react';
import { Notification } from '@/types/notification';

interface NotificationContextValue {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (n: Omit<Notification, 'id' | 'read' | 'createdAt'>) => void;
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
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('crm_notifications');
    if (saved) setNotifications(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem('crm_notifications', JSON.stringify(notifications));
  }, [notifications]);

  const addNotification = useCallback(
    (n: Omit<Notification, 'id' | 'read' | 'createdAt'>) => {
      setNotifications((prev) => [
        {
          ...n,
          id: crypto.randomUUID(),
          read: false,
          createdAt: new Date(),
        },
        ...prev,
      ]);
    },
    []
  );

  const markAsRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const remove = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const clearAll = useCallback(() => setNotifications([]), []);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount: notifications.filter((n) => !n.read).length,
        addNotification,
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
