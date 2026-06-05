import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Product from '@/models/Product';
import Customer from '@/models/Customer';
import Order from '@/models/Orders';
import Agents from '@/models/Agents';
import Tasks from '@/models/Tasks';
import User from '@/models/User';
import mongoose from 'mongoose';
import { deleteAgentById } from '@/lib/agent-service';
import { getCurrentUser } from '@/lib/auth';
import { requirePermission } from '@/utils/requirePermissions';
import {
  notifyTaskAssign,
  notifyTaskStatusChanged,
} from '@/lib/notifications/task-notification';
import { notifyCustomerAssign } from '@/lib/notifications/customer-notification';
import { notifyShipmentUpdate } from '@/lib/notifications/order-notification';
import { notifyLowStock } from '@/lib/notifications/product-notification';

const modelMap: Record<string, mongoose.Model<any>> = {
  customer: Customer,
  product: Product,
  order: Order,
  agent: Agents,
  task: Tasks,
};
const resourceMap: Record<string, any> = {
  customer: 'customer',
  product: 'product',
  order: 'order',
  agent: 'agent',
  task: 'task',
};

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string; type: string }> }
) {
  try {
    await dbConnect();

    const { id, type } = await params;
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const resource = resourceMap[type];

    if (!resource) {
      return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
    }

    try {
      requirePermission(user.role, resource, 'update');
    } catch (err) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (!id || !type || !modelMap[type]) {
      return NextResponse.json(
        { error: 'Invalid type or ID' },
        { status: 400 }
      );
    }

    const body = await req.json();
    const Model = modelMap[type];

    if (type === 'task') {
      const existingTask = await Tasks.findById(id);

      if (!existingTask) {
        return NextResponse.json({ error: 'Task not found' }, { status: 404 });
      }

      const oldColumn = existingTask.column;

      const updatedTask = await Tasks.findByIdAndUpdate(
        id,
        { $set: body },
        { new: true }
      );

      if (!updatedTask) {
        return NextResponse.json({ error: 'Task not found' }, { status: 404 });
      }

      // Status change notification
      await notifyTaskStatusChanged({
        taskId: String(updatedTask._id),
        taskTitle: updatedTask.title,
        oldColumn,
        newColumn: body.column,
        changedByUserId: String(user._id),
      });

      return NextResponse.json(
        {
          message: 'Task updated successfully',
          data: updatedTask,
        },
        { status: 200 }
      );
    }

    if (type === 'agent') {
      const { assign = [], unassign = [], ...rest } = body;
      const existingAgent = await Agents.findById(id);
      if (!existingAgent) {
        return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
      }
      const existingUser = await User.findOne({
        email: rest.email,
        _id: { $ne: existingAgent.userId },
      });

      if (existingUser) {
        return NextResponse.json(
          {
            field: 'email',
            error: 'Email already exists',
          },
          { status: 400 }
        );
      }

      const update: any = { ...rest };

      if (assign.length) {
        update.$addToSet = {
          assignedCustomers: { $each: assign },
        };
      }

      if (unassign.length) {
        update.$pull = {
          assignedCustomers: { $in: unassign },
        };
      }

      const updatedAgent = await Agents.findByIdAndUpdate(id, update, {
        new: true,
      });

      if (assign.length > 0) {
        await notifyCustomerAssign({
          agentId: id,
          customerIds: assign,
          assignedByUserId: String(user._id),
        });
      }
      if (updatedAgent.userId) {
        await User.findByIdAndUpdate(updatedAgent.userId, {
          name: rest.name,
          email: rest.email,
          role: rest.role,
          status: rest.status,
        });
      }

      return NextResponse.json({
        success: true,
        message: `${capitalize(type)} updated successfully`,
        data: updatedAgent,
      });
    }

    if (type === 'order') {
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
    }

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
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const resource = resourceMap[type];

    if (!resource) {
      return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
    }

    try {
      requirePermission(user.role, resource, 'delete');
    } catch (err) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (!type || !modelMap[type]) {
      return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
    }
    if (!id || !type || !modelMap[type]) {
      return NextResponse.json(
        { error: 'Invalid type or ID' },
        { status: 400 }
      );
    }

    const Model = modelMap[type];
    if (type === 'agent') {
      await deleteAgentById(id);

      return NextResponse.json({
        message: 'Agent deleted successfully',
        success: true,
      });
    }
    if (type === 'order') {
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
    }

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
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string; type: string }> }
) {
  const body = await req.json();
  const { id, type } = await params;
  if (type === 'task') {
    await dbConnect();

    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const existingTask = await Tasks.findById(id);

    if (!existingTask) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    const updatedTask = await Tasks.findByIdAndUpdate(
      id,
      { $set: body },
      { new: true }
    );

    if (!updatedTask) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    if (body.agentId) {
      await notifyTaskAssign({
        taskId: updatedTask._id,
        taskTitle: updatedTask.title,
        agentId: body.agentId,
        assignedByUserId: String(user._id),
        user: {
          _id: user._id as mongoose.Types.ObjectId,
          name: user.name,
        },
      });
    }

    return NextResponse.json({
      message: 'Task updated successfully',
      data: updatedTask,
    });
  }

  const updatedAgent = await Agents.findByIdAndUpdate(
    id,
    { $set: body },
    { new: true }
  );

  return Response.json(updatedAgent);
}

function capitalize(word: string) {
  return word.charAt(0).toUpperCase() + word.slice(1);
}
