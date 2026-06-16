import { NextResponse } from 'next/server';
import Agents from '@/models/Agents';
import dbConnect from '@/lib/mongodb';

export async function GET() {
  try {
    await dbConnect();

    const agents = await Agents.find().lean();

    const data = agents.map((agent) => ({
      agent: agent.name,
      customers: agent.assignedCustomers?.length || 0,
    }));

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch agent total customers' },
      { status: 500 }
    );
  }
}
