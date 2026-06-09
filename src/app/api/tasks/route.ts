import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Agents from '@/models/Agents';
import Tasks from '@/models/Tasks';
import mongoose from 'mongoose';
import { getCurrentUser } from '@/lib/auth';
import { requirePermission } from '@/utils/requirePermissions';
import { notifyTaskCreated } from '@/lib/notifications/task-notification';

export async function POST(req: Request) {
  try {
    await dbConnect();

    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
      requirePermission(user.role, 'task', 'create');
    } catch (err) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();

    if (user.role === 'agent') {
      const agent = await Agents.findOne({ userId: user._id });

      if (agent) {
        body.agentId = agent._id;
      }
    }

    const created = await Tasks.create(body);

    try {
      if (user.role === 'agent') {
        await notifyTaskCreated(created, {
          _id: user._id as mongoose.Types.ObjectId,
          name: user.name,
        });
      }
    } catch (err) {
      console.error('Notification failed:', err);
    }

    return NextResponse.json(created, { status: 201 });
  } catch (error: any) {
    console.error(error);
    if (error?.cause?.code === 11000) {
      const field = Object.keys(error.cause.keyValue)[0];
      const code = `${field.toUpperCase()}_ALREADY_EXISTS`;

      return NextResponse.json({ field, error: code }, { status: 400 });
    }
    if (error.name === 'ValidationError') {
      return NextResponse.json({ error: 'VALIDATION_ERROR' }, { status: 400 });
    }

    return NextResponse.json(
      { error: 'SOMETHING_WENT_WRONG' },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    await dbConnect();

    const findRes = await Tasks.find();

    return NextResponse.json(
      {
        success: true,
        data: findRes,
      },
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
