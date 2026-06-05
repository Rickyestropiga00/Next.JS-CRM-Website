import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Notification from '@/models/Notification';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
  try {
    await dbConnect();

    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const notifications = await Notification.find({
      userId: user._id,
    }).sort({ createdAt: -1 });

    return NextResponse.json(notifications);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch notifications' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    await dbConnect();

    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await req.json();

    const notification = await Notification.create({
      userId: body.userId,
      type: body.type,
      title: body.title,
      message: body.message,
      link: body.link || '',
      read: false,
    });

    return NextResponse.json(notification, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create notification' },
      { status: 500 }
    );
  }
}

export async function PATCH() {
  try {
    await dbConnect();
    const user = await getCurrentUser();
    if (!user)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await Notification.updateMany({ userId: user._id }, { read: true });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: 'Failed to update notifications' },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    await dbConnect();
    const user = await getCurrentUser();
    if (!user)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await Notification.deleteMany({ userId: user._id });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: 'Failed to delete notifications' },
      { status: 500 }
    );
  }
}
