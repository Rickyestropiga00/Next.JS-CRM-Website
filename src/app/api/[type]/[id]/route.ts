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

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string; type: string }> }
) {
  try {
    await dbConnect();

    const { id, type } = await params;

    if (!id || !type || !modelMap[type]) {
      return NextResponse.json(
        { error: 'Invalid type or ID' },
        { status: 400 }
      );
    }

    const body = await req.json();
    const Model = modelMap[type];

    const updated = await Model.findByIdAndUpdate(id, body, { new: true });

    if (!updated) {
      return NextResponse.json({ error: `${type} not found` }, { status: 404 });
    }

    return NextResponse.json(
      { message: `${capitalize(type)} updated successfully`, data: updated },
      { status: 200 }
    );
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

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string; type: string }> }
) {
  try {
    await dbConnect();

    const { id, type } = await params;
    if (!id || !type || !modelMap[type]) {
      return NextResponse.json(
        { error: 'Invalid type or ID' },
        { status: 400 }
      );
    }

    const Model = modelMap[type];
    const deleted = await Model.findByIdAndDelete(id);

    if (!deleted) {
      return NextResponse.json(
        { error: `${capitalize(type)} not found` },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: `${capitalize(type)} deleted successfully`, data: deleted },
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

function capitalize(word: string) {
  return word.charAt(0).toUpperCase() + word.slice(1);
}
