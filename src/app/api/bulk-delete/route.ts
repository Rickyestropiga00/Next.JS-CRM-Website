import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Customer from '@/models/Customer';
import Product from '@/models/Product';
import Order from '@/models/Orders';
import Agents from '@/models/Agents';
import mongoose from 'mongoose';

const modelMap: Record<string, mongoose.Model<any>> = {
  customer: Customer,
  product: Product,
  order: Order,
  agent: Agents,
};

export async function DELETE(req: Request) {
  try {
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type');

    if (!type || !modelMap[type]) {
      return NextResponse.json(
        { error: 'Invalid type provided' },
        { status: 400 }
      );
    }

    const { ids } = await req.json();

    if (!ids || !Array.isArray(ids)) {
      return NextResponse.json({ error: 'No IDs provided' }, { status: 400 });
    }

    const objectIds = await ids
      .filter((id: string) => mongoose.Types.ObjectId.isValid(id))
      .map((id: string) => new mongoose.Types.ObjectId(id));

    const Model = modelMap[type];

    if (objectIds.length > 0) {
      await Model.deleteMany({ _id: { $in: objectIds } });
    }

    const capitalizedType = type.charAt(0).toUpperCase() + type.slice(1);
    console.log('Incoming IDs:', ids);
    console.log('Valid ObjectIds:', objectIds);

    return NextResponse.json(
      { message: `${capitalizedType} deleted successfully` },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: 'Something Went Wrong' },
      { status: 500 }
    );
  }
}
