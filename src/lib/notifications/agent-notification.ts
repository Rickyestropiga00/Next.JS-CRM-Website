import User from '@/models/User';
import { createNotification } from '../create-notification';
import { Types } from 'mongoose';
import { Agent, AgentCommentType } from '@/types/interface';
import Agents from '@/models/Agents';
import AgentComments from '@/models/AgentComments';
import Notification from '@/models/Notification';
import { isNotificationEnabled } from './get-notification-preference';

type AgentType = {
  agentId: string;
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
        link: '/agents',
      })
    )
  );
}

export async function notifyAgentComment(commentedAgent: Agent) {
  if (!commentedAgent?.userId) return;

  const enabled = await isNotificationEnabled(
    new Types.ObjectId(commentedAgent.userId._id),
    'comment'
  );
  if (!enabled) return;

  const agentObj = await Agents.findById(commentedAgent._id).lean();
  const comments = await AgentComments.find({ agentId: commentedAgent._id })
    .sort({ createdAt: -1 })
    .lean();

  const triggeredCommentId = comments[0]?._id
    ? String(comments[0]._id)
    : undefined;

  const userId = String(commentedAgent.userId);
  const agentId = String(commentedAgent._id);

  await Notification.findOneAndUpdate(
    {
      userId,
      type: 'comment',
      'meta.agentId': agentId,
    },
    {
      $set: {
        title: 'New Comment',
        message: 'You have a new comment',
        read: false,
        meta: {
          agentId,
          commentId: triggeredCommentId,
          lastCommentAt: new Date(),
          agent: {
            ...agentObj,
            comments,
          },
        },
      },
    },
    {
      upsert: true,
      new: true,
    }
  );
}
