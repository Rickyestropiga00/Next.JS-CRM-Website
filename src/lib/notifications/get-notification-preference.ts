import NotificationPreference from '@/models/NotificationPreference';
import { Types } from 'mongoose';
type NotificationKey =
  | 'customer_new'
  | 'customer_assigned'
  | 'order_new'
  | 'shipment_update'
  | 'task_assigned_to_agent'
  | 'product_low_stock';
export async function isNotificationEnabled(
  userId: Types.ObjectId,
  type: NotificationKey
): Promise<boolean> {
  const prefs = await NotificationPreference.findOne({ userId });
  if (!prefs) return true;

  return prefs[type] ?? true;
}
