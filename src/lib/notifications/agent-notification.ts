import User from '@/models/User';
import { createNotification } from '../create-notification';
import { Types } from 'mongoose';

type AgentType = {
  name: string;
};

type UserType = {
  name: string;
  _id: Types.ObjectId;
};

export async function notifyAgentCreated(agent: AgentType, user: UserType) {
  const admins = await User.find({ role: 'admin', _id: { $ne: user._id } });

  await Promise.all(
    admins.map((admin) =>
      createNotification({
        userId: admin._id,
        type: 'agent_new',
        title: 'New Agent Created',
        message: `${user.name} created customer: ${agent.name}`,
        link: '/agent',
      })
    )
  );
}
