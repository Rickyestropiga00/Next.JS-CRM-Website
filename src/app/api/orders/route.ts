import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Product from '@/models/Product';
import Order from '@/models/Orders';
import '@/models/Customer';
import mongoose from 'mongoose';
import { generateCustomId } from '@/lib/generate-id';
import { getCurrentUser } from '@/lib/auth';
import { requirePermission } from '@/utils/requirePermissions';

import { notifyOrderCreated } from '@/lib/notifications/order-notification';

import { notifyLowStock } from '@/lib/notifications/product-notification';

export async function POST(req: Request) {
  try {
    await dbConnect();

    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
      requirePermission(user.role, 'order', 'create');
    } catch (err) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();

    const orderId = await generateCustomId(
      'orderId',
      (seq) => `ORD-${String(seq).padStart(3, '0')}`
    );
    body.orderId = orderId;

    const LOW_STOCK_THRESHOLD = 10;
    const product = await Product.findOneAndUpdate(
      {
        _id: body.product,
        stock: { $gte: body.quantity },
      },
      {
        $inc: { stock: -body.quantity },
      },
      {
        new: true,
      }
    );

    if (!product) {
      return Response.json(
        {
          field: 'quantity',
          error: 'INSUFFICIENT_STOCK',
        },
        { status: 400 }
      );
    }

    const currentStock = product.stock;
    const previousStock = currentStock + body.quantity;

    if (
      previousStock > LOW_STOCK_THRESHOLD &&
      currentStock <= LOW_STOCK_THRESHOLD
    ) {
      await notifyLowStock(product);
    }

    const created = await Order.create(body);

    try {
      await notifyOrderCreated(created, {
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
    const customerId = url.searchParams.get('customerId');

    const query: any = {};
    if (customerId) {
      query.customer = customerId;
    }
    const findRes = await Order.find(query)
      .populate({
        path: 'customer',
        select: 'name',
      })
      .populate({
        path: 'product',
        select: 'name productType code price image',
      })
      .lean();

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
