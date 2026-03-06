import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';

export const runtime = 'nodejs';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  await dbConnect();

  const { id } = await params;

  const user = await User.findById(id);

  if (!user || !user.avatar) {
    return new NextResponse('No image', { status: 404 });
  }

  return new NextResponse(user.avatar, {
    status: 200,
    headers: {
      'Content-Type': user.avatarType || 'image/png',
      //'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
}
