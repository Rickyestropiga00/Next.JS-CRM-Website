'use client';

import { useNotifications } from '@/context/notification-context';
import { getNotificationIcon } from '@/lib/notification';
import { formatDistanceToNow } from 'date-fns';
import type { Notification } from '@/types/notification';
import { useRouter } from 'next/navigation';
import { Agent } from '@/types/interface';

export function NotificationItem({
  notification: n,
  onClose,
  onOpenComment,
}: {
  notification: Notification;
  onClose?: () => void;
  onOpenComment?: (agent: Agent, commentId: string | undefined) => void;
}) {
  const { markAsRead } = useNotifications();
  const router = useRouter();

  const displayDate =
    n.type === 'comment' && n.meta?.lastCommentAt
      ? new Date(n.meta.lastCommentAt)
      : new Date(n.createdAt);

  const handleClick = () => {
    markAsRead(String(n._id));
    if (n.type === 'comment') {
      if (n.meta?.agentId) {
        onOpenComment?.(n.meta.agent, n.meta.commentId ?? undefined);
      }
      return;
    }
    if (n.link) {
      router.push(n.link);
    }
    onClose?.();
  };

  return (
    <div
      className={`flex gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 
                   transition cursor-pointer ${
                     !n.read ? 'bg-blue-50/50 dark:bg-blue-950/20' : ''
                   }`}
      onClick={handleClick}
    >
      {/* Icon */}
      <div className="flex-shrink-0 mt-0.5">{getNotificationIcon(n.type)}</div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
          {n.title}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2">
          {n.message}
        </p>
        <p className="text-[10px] text-gray-400 mt-1">
          {formatDistanceToNow(displayDate, { addSuffix: true })}
        </p>
      </div>

      {/* Unread dot */}
      {!n.read && (
        <div className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full mt-1.5" />
      )}
    </div>
  );
}
