'use client';

import { useNotifications } from '@/context/notification-context';
import { CheckCheck, Trash2 } from 'lucide-react';
import { NotificationItem } from './notification-item';
import Link from 'next/link';

export function NotificationPanel({ onClose }: { onClose: () => void }) {
  const { notifications, markAllAsRead, clearAll } = useNotifications();

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40" onClick={onClose} />

      {/* Panel */}
      <div className="absolute right-0 top-10 z-50 w-80 bg-white dark:bg-gray-900  border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b  border-gray-100 dark:border-gray-800">
          <h3 className="font-semibold text-sm">Notifications</h3>
          <div className="flex gap-2">
            <button
              onClick={markAllAsRead}
              title="Mark all read"
              className="text-gray-400 hover:text-blue-500 transition"
            >
              <CheckCheck className="w-4 h-4" />
            </button>
            <button
              onClick={clearAll}
              title="Clear all"
              className="text-gray-400 hover:text-red-500 transition"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* List */}
        <div className="max-h-96 overflow-y-auto divide-y divide-gray-50 dark:divide-gray-800">
          {notifications.length === 0 ? (
            <p className="text-center text-sm text-gray-400 py-8">
              No notifications
            </p>
          ) : (
            notifications.map((n, index) => (
              <NotificationItem
                key={String(n._id ?? index)}
                notification={n}
                onClose={onClose}
              />
            ))
          )}
        </div>

        {/* Footer */}
        {notifications.length > 0 && (
          <div className="px-4 py-2 border-t border-gray-100 dark:border-gray-800">
            <Link
              href="/notifications"
              className="text-xs text-blue-500 hover:underline"
              onClick={onClose}
            >
              View all notifications →
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
