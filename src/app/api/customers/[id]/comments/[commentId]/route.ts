import dbConnect from '@/lib/mongodb';
import CustomerComment from '@/models/CustomerComment';
import { NextResponse } from 'next/server';

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ commentId: string }> }
) {
  try {
    await dbConnect();
    const { commentId } = await params;

    const deleted = await CustomerComment.findByIdAndDelete(commentId);

    if (!deleted) {
      return NextResponse.json({ error: 'Comment not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Comment deleted' }, { status: 200 });
  } catch (error) {
    console.error('Delete comment error: ', error);
    return NextResponse.json(
      { error: 'Failed to delete comment' },
      { status: 500 }
    );
  }
}
