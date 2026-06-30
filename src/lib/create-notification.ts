import Notification from '@/models/Notification';

interface CreateNotificationParams {
  userId: string;
  type: string;
  title: string;
  message: string;
  link?: string | null;
  meta?: {
    agentId?: string;
    commentId?: string;
    userId?: string;
    [key: string]: any;
  };
}

export async function createNotification({
  userId,
  type,
  title,
  message,
  link,
  meta,
}: CreateNotificationParams) {
  return await Notification.create({
    userId,
    type,
    title,
    message,
    link: link || '',
    meta: meta || '',
    read: false,
  });
}
