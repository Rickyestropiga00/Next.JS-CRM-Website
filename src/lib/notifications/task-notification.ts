import User from '@/models/User';
import Agents from '@/models/Agents';
import { createNotification } from '../create-notification';
import { Types } from 'mongoose';
import { isNotificationEnabled } from './get-notification-preference';

type UserType = {
  name: string;
  _id: Types.ObjectId;
};

type NotifyTaskAssignParams = {
  taskId: string;
  taskTitle: string;
  agentId: string;
  assignedByUserId: string;
  user: UserType;
};

type TaskType = {
  title: string;
};

export async function notifyTaskCreated(task: TaskType, user: UserType) {
  const admins = await User.find({ role: 'admin', _id: { $ne: user._id } });

  await Promise.all(
    admins.map((admin) =>
      createNotification({
        userId: admin._id,
        type: 'task_new',
        title: 'New Task Created',
        message: `${user.name} created task: ${task.title}`,
        link: '/tasks',
      })
    )
  );
}

export async function notifyTaskAssign({
  taskId,
  taskTitle,
  agentId,
  assignedByUserId,
  user,
}: NotifyTaskAssignParams) {
  const assignedAgent = await Agents.findById(agentId);
  const admins = await User.find({ role: 'admin', _id: { $ne: user._id } });

  if (assignedAgent?.userId) {
    const enabled = await isNotificationEnabled(
      assignedAgent.userId,
      'task_assigned_to_agent'
    );
    if (!enabled) return;

    await createNotification({
      userId: String(assignedAgent.userId),
      type: 'task_assigned',
      title: 'New Task Assigned',
      message: `You have been assigned: "${taskTitle}"`,
      link: `/tasks/${taskId}`,
    });
  }

  await Promise.all(
    admins.map(async (admin) => {
      return await createNotification({
        userId: String(admin._id),
        type: 'task_assigned',
        title: 'Task Assigned',
        message: `${user.name} assigned task to ${assignedAgent.name}`,
        link: `/tasks`,
      });
    })
  );
}
type NotifyTaskStatusChangedParams = {
  taskId: string;
  taskTitle: string;
  oldColumn: string;
  newColumn: string;
  changedByUserId: string;
};

export async function notifyTaskStatusChanged({
  taskId,
  taskTitle,
  oldColumn,
  newColumn,
  changedByUserId,
}: NotifyTaskStatusChangedParams) {
  const changedBy = await User.findById(changedByUserId);

  if (!changedBy) return;

  const admins = await User.find({
    role: 'admin',
    _id: { $ne: changedBy._id },
  });

  if (!admins.length) return;

  const columnLabels: Record<string, string> = {
    todo: 'To Do',
    'in-progress': 'In Progress',
    inreview: 'In Review',
    done: 'Completed',
  };

  const from = columnLabels[oldColumn] ?? oldColumn;
  const to = columnLabels[newColumn] ?? newColumn;

  let title = 'Task Status Updated';
  let message = `${changedBy.name} moved "${taskTitle}" from ${from} to ${to}`;

  switch (newColumn) {
    case 'in-progress':
      title = 'Task Started';
      message = `${changedBy.name} started task "${taskTitle}"`;
      break;

    case 'inreview':
      title = 'Task In Review';
      message = `${changedBy.name} sent task "${taskTitle}" for review`;
      break;

    case 'done':
      title = 'Task Completed';
      message = `${changedBy.name} completed task "${taskTitle}"`;
      break;
  }

  await Promise.all(
    admins.map((admin) =>
      createNotification({
        userId: String(admin._id),
        type: 'task_status_changed',
        title,
        message,
        link: '/tasks',
      })
    )
  );
}
