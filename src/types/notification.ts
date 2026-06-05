export type NotificationType =
  | 'order_new'
  | 'order_status'
  | 'customer_new'
  | 'customer_update'
  | 'customer_assigned'
  | 'task_new'
  | 'task_assigned'
  | 'task_due'
  | 'task_status_changed'
  | 'task_complete'
  | 'agent_new'
  | 'product_low_stock'
  | 'system';

export interface Notification {
  _id?: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  createdAt: Date;
  link?: string;
  entityId?: string;
  targetUserId?: string;
  actor?: {
    name: string;
    avatar?: string;
  };
}
