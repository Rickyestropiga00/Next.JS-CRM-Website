import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Agents from '@/models/Agents';
import User from '@/models/User';
import { deleteAgentById } from '@/lib/agent-service';
import { getCurrentUser } from '@/lib/auth';
import { requirePermission } from '@/utils/requirePermissions';
import { notifyCustomerAssign } from '@/lib/notifications/customer-notification';
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
      requirePermission(user.role, 'agent', 'update');
    } catch (err) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (!id) {
      return NextResponse.json({ error: 'Invalid  ID' }, { status: 400 });
    }

    const body = await req.json();

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

    if (!updatedAgent) {
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
    }

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
      message: 'Agent updated successfully',
      data: updatedAgent,
    });
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
      requirePermission(user.role, 'agent', 'delete');
    } catch (err) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (!id) {
      return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
    }

    await deleteAgentById(id);

    return NextResponse.json({
      message: 'Agent deleted successfully',
      success: true,
    });
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
