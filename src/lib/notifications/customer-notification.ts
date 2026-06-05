import User from '@/models/User';
import { createNotification } from '../create-notification';
import { Types } from 'mongoose';
import Agents from '@/models/Agents';
import Customer from '@/models/Customer';
import { isNotificationEnabled } from './get-notification-preference';

type CustomerType = {
  name: string;
  customerId: string;
  _id: string;
};

type UserType = {
  name: string;
  _id: Types.ObjectId;
};

export async function notifyCustomerCreated(
  customer: CustomerType,
  user: UserType
) {
  const admins = await User.find({ role: 'admin', _id: { $ne: user._id } });

  await Promise.all(
    admins.map(async (admin) => {
      const enabled = await isNotificationEnabled(admin._id, 'customer_new');
      if (!enabled) return;
      return createNotification({
        userId: admin._id,
        type: 'customer_new',
        title: 'New Customer Created',
        message: `${user.name} created customer: ${customer.name}`,
        link: `/customers?highlight=${customer.customerId}`,
      });
    })
  );
}

type NotifyCustomerAssignParams = {
  agentId: string;
  customerIds: string[];
  assignedByUserId: string;
};

export async function notifyCustomerAssign({
  agentId,
  customerIds,
  assignedByUserId,
}: NotifyCustomerAssignParams) {
  const [agent, assignedBy, customers] = await Promise.all([
    Agents.findById(agentId),
    User.findById(assignedByUserId),
    Customer.find({ _id: { $in: customerIds } }),
  ]);

  if (!agent || !assignedBy) return;

  const customerNames = customers.map((c) => c.name).join(', ');

  if (agent.userId) {
    await createNotification({
      userId: agent.userId,
      type: 'customer_assigned',
      title: 'Customer Assigned',
      message: `${assignedBy.name} assigned ${
        customers.length
      } customer(s) to you${customerNames ? `: ${customerNames}` : ''}`,
      link: '/customers',
    });
  }

  const admins = await User.find({
    role: 'admin',
    _id: { $ne: assignedBy._id },
  });

  await Promise.all(
    admins.map(async (admin) => {
      const enabled = await isNotificationEnabled(
        admin._id,
        'customer_assigned'
      );
      return createNotification({
        userId: admin._id,
        type: 'customer_assigned',
        title: 'Customer Assigned',
        message: `${assignedBy.name} assigned ${customers.length} customer(s) to ${agent.name}`,
        link: '/agent',
      });
    })
  );
}
