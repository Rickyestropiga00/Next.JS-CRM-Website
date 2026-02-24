import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Agents from '@/models/Agents';

export async function POST(req: Request) {
  try {
    await dbConnect();
    const body = await req.json();

    const agent = await Agents.create(body);

    return NextResponse.json(agent, { status: 201 });
  } catch (error: any) {
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

    // Regular mongoose validation
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
