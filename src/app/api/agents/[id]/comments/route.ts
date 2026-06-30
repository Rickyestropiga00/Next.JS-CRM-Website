import { getCurrentUser } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import { notifyAgentComment } from '@/lib/notifications/agent-notification';
import AgentComments from '@/models/AgentComments';
import Agents from '@/models/Agents';
import { NextResponse } from 'next/server';

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { id } = await params;
    const agent = await Agents.findById(id);
    const agentId = id;

    const { content, author } = await req.json();

    if (!content || !content.trim()) {
      return NextResponse.json(
        { error: 'Comment cannot be empty' },
        { status: 400 }
      );
    }

    const comment = await AgentComments.create({
      agentId,
      content: content.trim(),
      author: author || 'admin',
    });

    try {
      await notifyAgentComment(agent);
    } catch (error) {
      console.error('Notification failed:', error);
    }

    return NextResponse.json(comment, { status: 201 });
  } catch (error) {
    console.error('Create comment error: ', error);
    return NextResponse.json(
      { error: 'Failed to create comment' },
      { status: 500 }
    );
  }
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;
    const agentId = id;

    const comments = await AgentComments.find({ agentId })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json(comments);
  } catch (error) {
    console.error('Fetch comment error', error);

    return NextResponse.json(
      { error: 'Failed fetching comment' },
      { status: 500 }
    );
  }
}
