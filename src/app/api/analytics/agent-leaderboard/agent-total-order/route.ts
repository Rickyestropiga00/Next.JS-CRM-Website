import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Agents from '@/models/Agents';
import Order from '@/models/Orders';

export async function GET() {
  await dbConnect();
  const agents = await Agents.find().lean();

  const leaderboard = await Promise.all(
    agents.map(async (agent) => {
      const totalOrders = await Order.countDocuments({
        customer: {
          $in: agent.assignedCustomers || [],
        },
      });

      return {
        agent: agent.name,
        orders: totalOrders,
      };
    })
  );

  return NextResponse.json(leaderboard);
}
