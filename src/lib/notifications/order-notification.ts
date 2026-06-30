import User from '@/models/User';
import { createNotification } from '../create-notification';
import { Types } from 'mongoose';
import { isNotificationEnabled } from './get-notification-preference';
import { Order } from '@/types/interface';
import Agents from '@/models/Agents';

type UserType = {
  name: string;
  _id: Types.ObjectId;
};
type OrderType = {
  orderId: string;
  _id: string;
  customer: string;
};

export async function notifyOrderCreated(created: OrderType, user: UserType) {
  const admins = await User.find({ role: 'admin', _id: { $ne: user._id } });

  const agent = await Agents.findOne({
    assignedCustomers: created.customer,
  }).populate('userId');

  if (agent?.userId) {
    console.log({
      customer: created.customer,
      agentId: agent?._id,
      userId: agent?.userId?._id,
      userName: agent?.userId?.name,
    });
    await createNotification({
      userId: String(agent.userId._id),
      type: 'order_new',
      title: 'New Order',
      message: `${user.name} created order ${created.orderId}`,
      link: `/orders?highlight=${created.orderId}`,
    });
  }

  await Promise.all(
    admins.map(async (admin) => {
      const enabled = await isNotificationEnabled(admin._id, 'order_new');
      if (!enabled) return;
      return createNotification({
        userId: String(admin._id),
        type: 'order_new',
        title: 'New Order',
        message: `${user.name} created order: ${created.orderId}`,
        link: `/orders?highlight=${created.orderId}`,
      });
    })
  );
}

type notifyShipmentUpdateParams = {
  order: Order;
  newStatus: string;
  changedByUserId: string;
};

export async function notifyShipmentUpdate({
  order,
  newStatus,
  changedByUserId,
}: notifyShipmentUpdateParams) {
  const changedBy = await User.findById(changedByUserId);

  if (!changedBy) return;

  const admins = await User.find({
    role: 'admin',
    _id: { $ne: changedBy._id },
  });

  if (!admins.length) return;

  const shippingLabels: Record<string, string> = {
    pending: 'Pending',
    'in transit': 'In Transit',
    completed: 'Completed',
    canceled: 'Canceled',
  };

  const message = `${changedBy.name} updated "${order.orderId}" to ${
    shippingLabels[newStatus.toLowerCase()]
  }`;

  await Promise.all(
    admins.map(async (admin) => {
      const enabled = await isNotificationEnabled(
        admin._id,
        'order_shipment_update'
      );
      if (!enabled) return;
      return createNotification({
        userId: String(admin._id),
        type: 'order_shipment_update',
        title: 'Order Status Update',
        message,
        link: `/orders?highlight=${order.orderId}`,
      });
    })
  );
}
