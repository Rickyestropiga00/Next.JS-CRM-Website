import { getCurrentUser } from '@/lib/auth';
import { generateCustomId } from '@/lib/generate-id';
import dbConnect from '@/lib/mongodb';
import { notifyCustomerCreated } from '@/lib/notifications/customer-notification';
import Agents from '@/models/Agents';
import Customer from '@/models/Customer';
import { requirePermission } from '@/utils/requirePermissions';
import mongoose from 'mongoose';
import { NextResponse } from 'next/server';

const WITH_COMMENTS_COUNT = [
  {
    $lookup: {
      from: 'customercomments',
      localField: '_id',
      foreignField: 'customerId',
      as: '_comments',
    },
  },
  {
    $addFields: {
      commentsCount: { $size: '$_comments' },
      id: { $toString: '$customerId' },
    },
  },
  {
    $project: {
      _comments: 0,
    },
  },
];

export async function POST(req: Request) {
  try {
    await dbConnect();
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
      requirePermission(user.role, 'customer', 'create');
    } catch {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();

    const customerId = await generateCustomId(
      'customerId',
      (seq) => String(seq),
      30
    );
    body.customerId = customerId;

    const created = await Customer.create(body);

    await notifyCustomerCreated(created, {
      _id: user._id as mongoose.Types.ObjectId,
      name: user.name,
    });

    if (user.role === 'agent') {
      const agent = await Agents.findOne({ userId: user._id });

      if (agent) {
        await Agents.findByIdAndUpdate(agent._id, {
          $addToSet: {
            assignedCustomers: created._id,
          },
        });
      }
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
    const agentId = url.searchParams.get('agentId');

    if (agentId) {
      const currentAgent = await Agents.findById(agentId);
      const allAgents = await Agents.find({}, { assignedCustomers: 1 });
      const allAssignedCustomerIds = allAgents
        .map((a) => a.assignedCustomers || [])
        .flat();

      const assignedCustomers = await Customer.find({
        _id: { $in: currentAgent.assignedCustomers || [] },
      }).lean();

      const unassignedCustomers = await Customer.find({
        _id: { $nin: allAssignedCustomerIds || [] },
      });

      return NextResponse.json(
        {
          success: true,
          assigned: assignedCustomers,
          unAssigned: unassignedCustomers,
        },
        { status: 200 }
      );
    }

    const findRes = await Customer.aggregate(WITH_COMMENTS_COUNT);

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
