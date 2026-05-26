export type NotificationType =
  | 'order_new'
  | 'order_status'
  | 'customer_new'
  | 'customer_update'
  | 'task_assigned'
  | 'task_due'
  | 'task_complete'
  | 'agent_assigned'
  | 'system';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  createdAt: Date;
  link?: string;
  entityId?: string;
  actor?: {
    name: string;
    avatar?: string;
  };
}
