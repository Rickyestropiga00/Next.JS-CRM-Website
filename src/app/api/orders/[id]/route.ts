import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Product from '@/models/Product';
import Order from '@/models/Orders';
import { getCurrentUser } from '@/lib/auth';
import { requirePermission } from '@/utils/requirePermissions';
import { notifyShipmentUpdate } from '@/lib/notifications/order-notification';
import { notifyLowStock } from '@/lib/notifications/product-notification';

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();

    const { id } = await params;
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
      requirePermission(user.role, 'order', 'update');
    } catch (err) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (!id) {
      return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
    }

    const body = await req.json();

    const existingOrder = await Order.findById(id);

    if (!existingOrder) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const oldProductId =
      typeof existingOrder.product === 'object'
        ? String(existingOrder.product._id)
        : String(existingOrder.product);

    const newProductId =
      typeof body.product === 'object'
        ? String(body.product._id)
        : String(body.product);

    const oldQty = existingOrder.quantity;
    const newQty = body.quantity;

    const LOW_STOCK_THRESHOLD = 10;

    if (oldProductId === newProductId) {
      const diff = newQty - oldQty;

      if (diff > 0) {
        const product = await Product.findOneAndUpdate(
          {
            _id: newProductId,
            stock: { $gte: diff },
          },
          { $inc: { stock: -diff } },
          { new: true }
        );

        if (!product) {
          return NextResponse.json(
            { errors: { quantity: 'Insufficient stock' } },
            { status: 400 }
          );
        }

        const previousStock = product.stock + diff;
        const currentStock = product.stock;

        if (
          previousStock > LOW_STOCK_THRESHOLD &&
          currentStock <= LOW_STOCK_THRESHOLD
        ) {
          await notifyLowStock(product);
        }
      }

      if (diff < 0) {
        await Product.findByIdAndUpdate(newProductId, {
          $inc: { stock: Math.abs(diff) },
        });
      }
    } else {
      await Product.findByIdAndUpdate(oldProductId, {
        $inc: { stock: oldQty },
      });

      const newProduct = await Product.findOneAndUpdate(
        {
          _id: newProductId,
          stock: { $gte: newQty },
        },
        { $inc: { stock: -newQty } },
        { new: true }
      );

      if (!newProduct) {
        return NextResponse.json(
          { errors: { quantity: 'Insufficient stock' } },
          { status: 400 }
        );
      }

      const previousStock = newProduct.stock + newQty;
      const currentStock = newProduct.stock;

      if (
        previousStock > LOW_STOCK_THRESHOLD &&
        currentStock <= LOW_STOCK_THRESHOLD
      ) {
        await notifyLowStock(newProduct);
      }
    }

    const updated = await Order.findByIdAndUpdate(id, body, { new: true });

    const statusChanged = body.status && body.status !== existingOrder.status;
    if (statusChanged && updated) {
      await notifyShipmentUpdate({
        order: updated,
        newStatus: updated.status,
        changedByUserId: String(user._id),
      });
    }

    return NextResponse.json(
      { message: 'Order updated successfully', data: updated },
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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();

    const { id } = await params;
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
      requirePermission(user.role, 'order', 'delete');
    } catch (err) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (!id) {
      return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
    }

    const order = await Order.findById(id);

    if (order) {
      const productId =
        typeof order.product === 'object'
          ? String(order.product._id)
          : String(order.product);

      const quantity = order.quantity;

      await Product.findByIdAndUpdate(productId, {
        $inc: { stock: quantity },
      });
    }

    const deleted = await Order.findByIdAndDelete(id);

    if (!deleted) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json(
      { message: 'Order deleted successfully', data: deleted },
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
