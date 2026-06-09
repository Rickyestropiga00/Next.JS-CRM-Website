import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Tasks from '@/models/Tasks';
import mongoose from 'mongoose';
import { getCurrentUser } from '@/lib/auth';
import { requirePermission } from '@/utils/requirePermissions';
import {
  notifyTaskAssign,
  notifyTaskStatusChanged,
} from '@/lib/notifications/task-notification';

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();

    const { id } = await params;
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
      requirePermission(user.role, 'task', 'update');
    } catch (err) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (!id) {
      return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
    }

    const body = await req.json();

    const existingTask = await Tasks.findById(id);

    if (!existingTask) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    const oldColumn = existingTask.column;

    const updatedTask = await Tasks.findByIdAndUpdate(
      id,
      { $set: body },
      { new: true }
    );

    if (!updatedTask) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    // Status change notification
    await notifyTaskStatusChanged({
      taskId: String(updatedTask._id),
      taskTitle: updatedTask.title,
      oldColumn,
      newColumn: body.column,
      changedByUserId: String(user._id),
    });

    return NextResponse.json(
      {
        message: 'Task updated successfully',
        data: updatedTask,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error(error);
    if (error?.cause?.code === 11000) {
      const field = Object.keys(error.cause.keyValue)[0];

      return NextResponse.json(
        {
          field,
          error: `${
            field.charAt(0).toUpperCase() + field.slice(1)
          } already exists`,
        },
        { status: 400 }
      );
    }
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map((err: any) => err.message);

      return NextResponse.json({ error: errors[0] }, { status: 400 });
    }
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();

    const { id } = await params;
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
      requirePermission(user.role, 'task', 'delete');
    } catch (err) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (!id) {
      return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
    }

    const deleted = await Tasks.findByIdAndDelete(id);

    if (!deleted) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    return NextResponse.json(
      { message: 'Task deleted successfully', data: deleted },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    );
  }
}
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const body = await req.json();
  const { id } = await params;

  await dbConnect();

  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const existingTask = await Tasks.findById(id);

  if (!existingTask) {
    return NextResponse.json({ error: 'Task not found' }, { status: 404 });
  }

  const updatedTask = await Tasks.findByIdAndUpdate(
    id,
    { $set: body },
    { new: true }
  );

  if (!updatedTask) {
    return NextResponse.json({ error: 'Task not found' }, { status: 404 });
  }

  if (body.agentId) {
    await notifyTaskAssign({
      taskId: updatedTask._id,
      taskTitle: updatedTask.title,
      agentId: body.agentId,
      assignedByUserId: String(user._id),
      user: {
        _id: user._id as mongoose.Types.ObjectId,
        name: user.name,
      },
    });
  }

  return NextResponse.json({
    message: 'Task updated successfully',
    data: updatedTask,
  });
}
