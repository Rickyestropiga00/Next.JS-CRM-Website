import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';

export async function GET(req: Request) {
  try {
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const role = searchParams.get('role');

    const users = await User.find({ role }).lean();

    return NextResponse.json(users, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: 'FAILED_TO_FETCH_USERS' },
      { status: 500 }
    );
  }
}
