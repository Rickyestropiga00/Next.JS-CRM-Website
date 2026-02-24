import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Tasks from '@/models/Tasks';

export async function POST(req: Request) {
  try {
    await dbConnect();

    const body = await req.json();

    const task = await Tasks.create(body);

    return NextResponse.json(task, { status: 201 });
  } catch (error: any) {
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map((err: any) => err.message);

      return NextResponse.json(
        { error: errors[0] }, // first error message
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    );
  }
}
