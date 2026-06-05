import Notification from '@/models/Notification';

interface CreateNotificationParams {
  userId: string;
  type: string;
  title: string;
  message: string;
  link?: string;
}

export async function createNotification({
  userId,
  type,
  title,
  message,
  link,
}: CreateNotificationParams) {
  return await Notification.create({
    userId,
    type,
    title,
    message,
    link: link || '',
    read: false,
  });
}
