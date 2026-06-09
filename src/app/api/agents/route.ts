import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Agents from '@/models/Agents';
import mongoose from 'mongoose';
import { generateCustomId } from '@/lib/generate-id';
import { createUser, findUserByEmail, getCurrentUser } from '@/lib/auth';
import { requirePermission } from '@/utils/requirePermissions';
import { notifyAgentCreated } from '@/lib/notifications/agent-notification';

export async function POST(req: Request) {
  await dbConnect();

  const session = await mongoose.startSession();

  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    requirePermission(user.role, 'agent', 'create');

    session.startTransaction();

    const body = await req.json();

    const existingUser = await findUserByEmail(body.email);
    if (existingUser) {
      return NextResponse.json(
        { error: 'EMAIL_ALREADY_EXISTS' },
        { status: 400 }
      );
    }

    const agentId = await generateCustomId(
      'agentId',
      (seq) => `A${String(seq).padStart(2, '0')}`,
      30
    );

    const cleanName = body.name.replace(/\s+/g, '');
    const tempPassword = `${cleanName}123`;

    const newUser = await createUser(
      body.email,
      tempPassword,
      body.name,
      session
    );

    const [created] = await Agents.create(
      [
        {
          ...body,
          agentId,
          userId: newUser._id,
        },
      ],
      { session }
    );

    await session.commitTransaction();

    await session.commitTransaction();

    try {
      await notifyAgentCreated(created, {
        _id: user._id as mongoose.Types.ObjectId,
        name: user.name,
      });
    } catch (err) {
      console.error('Notification failed:', err);
    }

    return NextResponse.json(created, { status: 201 });
  } catch (error: any) {
    await session.abortTransaction();

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
  } finally {
    session.endSession();
  }
}

export async function GET() {
  try {
    await dbConnect();

    const findRes = await Agents.find();

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
