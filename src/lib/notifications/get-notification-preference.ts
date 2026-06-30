import NotificationPreference from '@/models/NotificationPreference';
import { Types } from 'mongoose';
type NotificationKey =
  | 'customer_new'
  | 'customer_assigned'
  | 'order_new'
  | 'order_shipment_update'
  | 'task_assigned_to_agent'
  | 'system_product_low_stock'
  | 'comment';
export async function isNotificationEnabled(
  userId: Types.ObjectId,
  type: NotificationKey
): Promise<boolean> {
  const prefs = await NotificationPreference.findOne({ userId });
  if (!prefs) return true;

  return prefs[type] ?? true;
}
