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

    if (type === 'order') {
      const orders = await Order.find({ _id: { $in: objectIds } });

      for (const order of orders) {
        const productId =
          typeof order.product === 'object'
            ? String(order.product._id)
            : String(order.product);

        await Product.findByIdAndUpdate(productId, {
          $inc: { stock: order.quantity },
        });
      }

      await Order.deleteMany({ _id: { $in: objectIds } });

      return NextResponse.json(
        { message: 'DELETED_SUCCESSFULLY' },
        { status: 200 }
      );
    }

    if (objectIds.length > 0) {
      await Model.deleteMany({ _id: { $in: objectIds } });
    }

    return NextResponse.json(
      { message: 'DELETED_SUCCESSFULLY' },
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
