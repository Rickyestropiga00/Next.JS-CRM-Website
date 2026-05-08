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
  { params }: { params: Promise<{ id: string }> }
) {
  const body = await req.json();
  const { id } = await params;

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
