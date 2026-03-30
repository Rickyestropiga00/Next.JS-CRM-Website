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

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
    }
    const product = await Product.findById(id);
    if (!product || !product.image) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    return new Response(product.image, {
      status: 200,
      headers: {
        'Content-Type': product.imageType || 'image/png',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    );
  }
}

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

    const formData = await req.formData();
    const file = formData.get('image') as File;

    if (!file) {
      return NextResponse.json({ error: 'No image uploaded' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    const Model = modelMap[type];

    const updated = await Model.findByIdAndUpdate(
      id,
      {
        image: buffer,
        imageType: file.type,
      },
      { new: true }
    );

    return NextResponse.json({
      message: 'Image updated successfully',
      data: updated,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    );
  }
}
