import { NotificationType } from '@/types/notification';
import {
  ShoppingCart,
  User,
  CheckSquare,
  Users,
  AlertCircle,
} from 'lucide-react';

export function getNotificationIcon(type: NotificationType) {
  const map: Record<NotificationType, React.ReactNode> = {
    order_new: <ShoppingCart className="w-4 h-4 text-green-500" />,
    order_status: <ShoppingCart className="w-4 h-4 text-blue-500" />,
    customer_new: <User className="w-4 h-4 text-purple-500" />,
    customer_update: <User className="w-4 h-4 text-indigo-500" />,
    task_assigned: <CheckSquare className="w-4 h-4 text-orange-500" />,
    task_due: <CheckSquare className="w-4 h-4 text-red-500" />,
    task_complete: <CheckSquare className="w-4 h-4 text-green-500" />,
    agent_assigned: <Users className="w-4 h-4 text-teal-500" />,
    system: <AlertCircle className="w-4 h-4 text-gray-500" />,
  };
  return map[type] ?? map.system;
}
