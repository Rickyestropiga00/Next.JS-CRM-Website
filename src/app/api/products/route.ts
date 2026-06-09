import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Product from '@/models/Product';
import mongoose from 'mongoose';
import { generateCustomId } from '@/lib/generate-id';
import { getCurrentUser } from '@/lib/auth';
import { requirePermission } from '@/utils/requirePermissions';
import { notifyProductCreated } from '@/lib/notifications/product-notification';

export async function POST(req: Request) {
  try {
    await dbConnect();

    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
      requirePermission(user.role, 'product', 'create');
    } catch (err) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    let body: any = {};

    const formData = await req.formData();
    body = Object.fromEntries(formData.entries());

    // convert numbers
    body.price = parseFloat(body.price);
    body.stock = parseInt(body.stock);

    const file = formData.get('image') as File;

    if (file && file.size > 0) {
      const arrayBuffer = await file.arrayBuffer();
      body.image = Buffer.from(arrayBuffer);
      body.imageType = file.type;
    } else {
      // ✅ fallback image from public folder
      const baseUrl = new URL(req.url).origin;
      const response = await fetch(`${baseUrl}/products/product-1.webp`);
      const arrayBuffer = await response.arrayBuffer();

      body.image = Buffer.from(arrayBuffer);
      body.imageType = 'image/webp';
    }

    // generate productId
    const productId = await generateCustomId(
      'productId',
      (seq) => `PRD-${String(seq).padStart(3, '0')}`
    );
    body.productId = productId;

    // default status if missing
    if (!body.status) body.status = 'Active';

    const created = await Product.create(body);

    try {
      await notifyProductCreated(created, {
        _id: user._id as mongoose.Types.ObjectId,
        name: user.name,
      });
    } catch (err) {
      console.error('Notification failed:', err);
    }

    return NextResponse.json(created, { status: 201 });
  } catch (error: any) {
    console.error(error);
    if (error?.cause?.code === 11000) {
      const field = Object.keys(error.cause.keyValue)[0];
      const code = `${field.toUpperCase()}_ALREADY_EXISTS`;

      return NextResponse.json({ field, error: code }, { status: 400 });
    }
    if (error.name === 'ValidationError') {
      return NextResponse.json({ error: 'VALIDATION_ERROR' }, { status: 400 });
    }

    return NextResponse.json(
      { error: 'SOMETHING_WENT_WRONG' },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    await dbConnect();

    const url = new URL(req.url);

    const findRes = await Product.find();

    return NextResponse.json(
      {
        success: true,
        data: findRes,
      },
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
