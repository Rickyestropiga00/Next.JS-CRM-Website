import dbConnect from '@/lib/mongodb';
import CustomerComment from '@/models/CustomerComment';
import { NextResponse } from 'next/server';

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;
    const customerId = id;

    const { content, author } = await req.json();

    if (!content || !content.trim()) {
      return NextResponse.json(
        { error: 'Comment cannot be empty' },
        { status: 400 }
      );
    }

    const comment = await CustomerComment.create({
      customerId,
      content: content.trim(),
      author: author || 'admin',
    });

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
    const customerId = id;

    const comments = await CustomerComment.find({ customerId })
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
