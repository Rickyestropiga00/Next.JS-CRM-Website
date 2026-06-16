import dbConnect from '@/lib/mongodb';
import Agents from '@/models/Agents';
import Order from '@/models/Orders';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    await dbConnect();

    const agents = await Agents.find().lean();

    const revenueData = await Promise.all(
      agents.map(async (agent) => {
        const result = await Order.aggregate([
          {
            $match: {
              customer: {
                $in: agent.assignedCustomers || [],
              },
              status: 'Completed',
            },
          },
          {
            $group: {
              _id: null,
              revenue: { $sum: '$total' },
            },
          },
        ]);

        return {
          agent: agent.name,
          revenue: result[0]?.revenue || 0,
        };
      })
    );

    return NextResponse.json(revenueData);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch agent revenue' },
      { status: 500 }
    );
  }
}
