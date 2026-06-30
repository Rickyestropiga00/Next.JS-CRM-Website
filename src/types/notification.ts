export type NotificationType =
  | 'order_new'
  | 'order_shipment_update'
  | 'customer_new'
  | 'customer_update'
  | 'customer_assigned'
  | 'task_new'
  | 'task_assigned'
  | 'task_due'
  | 'task_status_changed'
  | 'task_complete'
  | 'agent_new'
  | 'system_product_low_stock'
  | 'comment'
  | 'system';

export interface Notification {
  _id?: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  createdAt: Date;
  link?: string;
  meta?: {
    agentId?: string;
    commentId?: string;
    userId?: string;
    [key: string]: any;
  };
  targetUserId?: string;
  actor?: {
    name: string;
    avatar?: string;
  };
}
