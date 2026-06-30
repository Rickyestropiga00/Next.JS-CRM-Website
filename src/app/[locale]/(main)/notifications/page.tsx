'use client';

import { useState, useMemo } from 'react';
import { useNotifications } from '@/context/notification-context';
import { getNotificationIcon } from '@/lib/notification';
import { formatDistanceToNow } from 'date-fns';
import type { Notification } from '@/types/notification';
import { Button } from '@/components/ui/button';
import { CheckCheck, Trash2, BellOff, X } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { Agent } from '@/types/interface';

const CommentPopover = dynamic(
  () =>
    import('./components/comment-popover').then((mod) => ({
      default: mod.CommentPopover,
    })),
  { ssr: false }
);

type FilterTab =
  | 'all'
  | 'unread'
  | 'order'
  | 'customer'
  | 'task'
  | 'agent'
  | 'system';

const FILTER_TABS: { key: FilterTab; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'unread', label: 'Unread' },
  { key: 'order', label: 'Orders' },
  { key: 'customer', label: 'Customers' },
  { key: 'task', label: 'Tasks' },
  { key: 'agent', label: 'Agents' },
  { key: 'system', label: 'System' },
];

function getDisplayDate(n: Notification): Date {
  return n.type === 'comment' && n.meta?.lastCommentAt
    ? new Date(n.meta.lastCommentAt)
    : new Date(n.createdAt);
}

function filterNotifications(
  notifications: Notification[],
  tab: FilterTab
): Notification[] {
  switch (tab) {
    case 'unread':
      return notifications.filter((n) => !n.read);
    case 'order':
      return notifications.filter((n) => n.type.startsWith('order'));
    case 'customer':
      return notifications.filter((n) => n.type.startsWith('customer'));
    case 'task':
      return notifications.filter((n) => n.type.startsWith('task'));
    case 'agent':
      return notifications.filter((n) => n.type.startsWith('agent'));
    case 'system':
      return notifications.filter((n) => n.type === 'system');
    default:
      return notifications;
  }
}

function groupByDate(
  notifications: Notification[]
): Record<string, Notification[]> {
  const groups: Record<string, Notification[]> = {};
  const now = new Date();

  for (const n of notifications) {
    const d = getDisplayDate(n);
    const diffDays = Math.floor(
      (now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24)
    );

    let label: string;
    if (diffDays === 0) label = 'Today';
    else if (diffDays === 1) label = 'Yesterday';
    else if (diffDays < 7) label = 'This Week';
    else label = 'Older';

    if (!groups[label]) groups[label] = [];
    groups[label].push(n);
  }

  return groups;
}

type NotificationRowProps = {
  notification: Notification;
  onOpenComment: (agent: Agent, commentId: string | undefined) => void;
};

function NotificationRow({
  notification: n,
  onOpenComment,
}: NotificationRowProps) {
  const { markAsRead, remove } = useNotifications();
  const router = useRouter();

  const handleClick = async () => {
    await markAsRead(String(n._id));

    if (n.type === 'comment') {
      if (n.meta?.agentId) {
        onOpenComment(n.meta.agent, n.meta.commentId ?? undefined);
      }
      return;
    }

    if (n.link) {
      router.push(n.link);
    }
  };

  return (
    <div
      className={`group flex items-start gap-4 px-5 py-4 rounded-xl border transition-all cursor-pointer
        ${
          !n.read
            ? 'bg-blue-50/60 border-blue-100 dark:bg-blue-950/20 dark:border-blue-900/40'
            : 'bg-background border-border hover:bg-muted/40'
        }`}
      onClick={handleClick}
    >
      {/* Icon */}
      <div
        className={`mt-0.5 flex-shrink-0 p-2 rounded-lg 
        ${!n.read ? 'bg-blue-100 dark:bg-blue-900/40' : 'bg-muted'}`}
      >
        {getNotificationIcon(n.type)}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p
              className={`text-sm font-semibold truncate ${
                !n.read ? 'text-foreground' : 'text-muted-foreground'
              }`}
            >
              {n.title}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2 leading-relaxed">
              {n.message}
            </p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {!n.read && (
              <span className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1" />
            )}
            <button
              onClick={(e) => {
                e.stopPropagation();
                remove(String(n._id));
              }}
              className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-muted text-muted-foreground hover:text-destructive"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
        <p className="text-[10px] text-muted-foreground/60 mt-1.5">
          {formatDistanceToNow(getDisplayDate(n), { addSuffix: true })}
        </p>
      </div>
    </div>
  );
}

export default function NotificationsPage() {
  const { notifications, unreadCount, markAllAsRead, clearAll } =
    useNotifications();
  const [activeTab, setActiveTab] = useState<FilterTab>('all');
  const [openCommentPopover, setOpenCommentPopover] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [activeCommentId, setActiveCommentId] = useState<string | undefined>(
    undefined
  );

  const filtered = useMemo(
    () => filterNotifications(notifications, activeTab),
    [notifications, activeTab]
  );
  const grouped = useMemo(() => groupByDate(filtered), [filtered]);
  const groupOrder = ['Today', 'Yesterday', 'This Week', 'Older'];

  const tabCounts: Partial<Record<FilterTab, number>> = {
    unread: notifications.filter((n) => !n.read).length,
    order: notifications.filter((n) => n.type.startsWith('order')).length,
    customer: notifications.filter((n) => n.type.startsWith('customer')).length,
    task: notifications.filter((n) => n.type.startsWith('task')).length,
    agent: notifications.filter((n) => n.type.startsWith('agent')).length,
    system: notifications.filter((n) => n.type === 'system').length,
  };

  const handleOpenComment = (agent: Agent, commentId: string | undefined) => {
    setSelectedAgent(agent);
    setActiveCommentId(commentId);
    setOpenCommentPopover(true);
  };

  return (
    <>
      <div className="w-full space-y-6 py-2 mt-3">
        {/* Header */}
        <div className="flex justify-between flex-wrap gap-2">
          {/* Filter Tabs */}
          <Select
            value={activeTab}
            onValueChange={(value) => setActiveTab(value as FilterTab)}
          >
            <SelectTrigger className="w-[160px] h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {FILTER_TABS.map((tab) => {
                const count =
                  tab.key === 'all' ? notifications.length : tabCounts[tab.key];
                return (
                  <SelectItem key={tab.key} value={tab.key} className="text-xs">
                    <span className="flex items-center gap-2">
                      {tab.label}
                      {count !== undefined && count > 0 && (
                        <span className="text-[10px] bg-muted text-muted-foreground px-1.5 py-0.5 rounded-full">
                          {count}
                        </span>
                      )}
                    </span>
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 flex-wrap">
              {unreadCount > 0 && (
                <Button
                  variant="outline"
                  onClick={markAllAsRead}
                  className="text-xs gap-1.5"
                >
                  <CheckCheck className="w-4 h-4" />
                  Mark all read
                </Button>
              )}
              {notifications.length > 0 && (
                <Button
                  variant="outline"
                  type="button"
                  onClick={clearAll}
                  className="text-xs gap-1.5 text-destructive hover:text-destructive"
                >
                  <Trash2 className="w-4 h-4" />
                  Clear all
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Notification List */}
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="p-4 bg-muted rounded-full mb-4">
              <BellOff className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium text-muted-foreground">
              No notifications
            </p>
            <p className="text-xs text-muted-foreground/60 mt-1">
              {activeTab === 'unread'
                ? "You're all caught up!"
                : 'Nothing here yet.'}
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {groupOrder.map((group) => {
              const items = grouped[group];
              if (!items?.length) return null;
              return (
                <div key={group} className="space-y-2">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-1">
                    {group}
                  </p>
                  <div className="space-y-2">
                    {items.map((n) => (
                      <NotificationRow
                        key={n._id}
                        notification={n}
                        onOpenComment={handleOpenComment}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <CommentPopover
        isOpen={openCommentPopover}
        agent={selectedAgent}
        activeCommentId={activeCommentId}
        onClose={() => {
          setOpenCommentPopover(false);
          setSelectedAgent(null);
          setActiveCommentId(undefined);
        }}
      />
    </>
  );
}
