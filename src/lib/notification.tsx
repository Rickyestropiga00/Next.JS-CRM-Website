import { NotificationType } from '@/types/notification';
import {
  User,
  Users,
  AlertCircle,
  Package,
  Truck,
  ClipboardList,
  Clock,
  CheckCircle2,
  Bell,
  AlertTriangle,
  MessageSquare,
} from 'lucide-react';

export function getNotificationIcon(type: NotificationType) {
  const map: Record<NotificationType, React.ReactNode> = {
    // ORDERS
    order_new: <Package className="w-4 h-4 text-green-500" />,
    order_shipment_update: <Truck className="w-4 h-4 text-blue-500" />,

    // CUSTOMERS
    customer_new: <User className="w-4 h-4 text-emerald-500" />,
    customer_update: <User className="w-4 h-4 text-indigo-500" />,
    customer_assigned: <Users className="w-4 h-4 text-teal-500" />,

    // TASKS
    task_new: <ClipboardList className="w-4 h-4 text-orange-500" />,
    task_assigned: <Users className="w-4 h-4 text-orange-500" />,
    task_status_changed: <Clock className="w-4 h-4 text-yellow-500" />,
    task_due: <AlertCircle className="w-4 h-4 text-red-500" />,
    task_complete: <CheckCircle2 className="w-4 h-4 text-green-500" />,

    // AGENTS
    agent_new: <User className="w-4 h-4 text-purple-500" />,

    // PRODUCTS
    system_product_low_stock: (
      <AlertTriangle className="w-4 h-4 text-red-500" />
    ),

    // SYSTEM
    system: <Bell className="w-4 h-4 text-gray-500" />,
    comment: <MessageSquare className="w-4 h-4 text-blue-500" />,
  };

  return map[type] ?? map.system;
}
