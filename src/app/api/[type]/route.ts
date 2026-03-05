import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Product from '@/models/Product';
import Customer from '@/models/Customer';
import Order from '@/models/Orders';
import Agents from '@/models/Agents';
import Tasks from '@/models/Tasks';
import mongoose from 'mongoose';

const modelMap: Record<string, mongoose.Model<any>> = {
  customer: Customer,
  product: Product,
  order: Order,
  agent: Agents,
  task: Tasks,
};

export async function POST(
  req: Request,
  { params }: { params: Promise<{ type: string }> }
) {
  try {
    await dbConnect();

    const { type } = await params;

    if (!type || !modelMap[type]) {
      return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
    }

    const body = await req.json();
    const Model = await modelMap[type];

    const created = await Model.create(body);

    return NextResponse.json(created, { status: 201 });
  } catch (error: any) {
    console.error(error);
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
