import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Product from '@/models/Product';
import Customer from '@/models/Customer';
import Order from '@/models/Orders';
import Agents from '@/models/Agents';
import Tasks from '@/models/Tasks';
import mongoose from 'mongoose';
import { generateCustomId } from '@/lib/generate-id';

const modelMap: Record<string, mongoose.Model<any>> = {
  customer: Customer,
  product: Product,
  order: Order,
  agent: Agents,
  task: Tasks,
};

export async function POST(
  req: Request,
  { params }: { params: Promise<{ type: string }> }
) {
  try {
    await dbConnect();

    const { type } = await params;

    if (!type || !modelMap[type]) {
      return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
    }

    const Model = await modelMap[type];

    let body: any = {};

    if (type === 'product') {
      const formData = await req.formData();
      body = Object.fromEntries(formData.entries());

      // convert numbers
      body.price = parseFloat(body.price);
      body.stock = parseInt(body.stock);

      const file = formData.get('image') as File;

      if (file && file.size > 0) {
        const arrayBuffer = await file.arrayBuffer();
        body.image = Buffer.from(arrayBuffer);
        body.imageType = file.type;
      } else {
        // ✅ fallback image from public folder
        const baseUrl = new URL(req.url).origin;
        const response = await fetch(`${baseUrl}/products/product-1.webp`);
        const arrayBuffer = await response.arrayBuffer();

        body.image = Buffer.from(arrayBuffer);
        body.imageType = 'image/webp';
      }

      // generate productId
      const productId = await generateCustomId(
        'productId',
        (seq) => `PRD-${String(seq).padStart(3, '0')}`
      );
      body.productId = productId;

      // default status if missing
      if (!body.status) body.status = 'Active';
    } else {
      // For other types, keep using JSON
      body = await req.json();
    }

    if (type === 'order') {
      const orderId = await generateCustomId(
        'orderId',
        (seq) => `ORD-${String(seq).padStart(3, '0')}`
      );
      body.orderId = orderId;
    }

    if (type === 'customer') {
      // Static mock data uses IDs 1–30, so real DB IDs start at 31
      const customerId = await generateCustomId(
        'customerId',
        (seq) => String(seq),
        30
      );
      body.customerId = customerId;
    }

    if (type === 'agent') {
      // Static mock data uses A01–A30, so real DB IDs start at A31
      const agentId = await generateCustomId(
        'agentId',
        (seq) => `A${String(seq).padStart(2, '0')}`,
        30
      );
      body.agentId = agentId;
    }

    const created = await Model.create(body);

    return NextResponse.json(created, { status: 201 });
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

export async function GET(
  req: Request,
  { params }: { params: Promise<{ type: string }> }
) {
  try {
    await dbConnect();
    const { type } = await params;
    const url = new URL(req.url);
    const agentId = url.searchParams.get('agentId');
    const customerId = url.searchParams.get('customerId');
    if (!type || !modelMap[type]) {
      return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
    }
    const Model = await modelMap[type];

    if (type === 'customer' && agentId) {
      const currentAgent = await Agents.findById(agentId);
      const allAgents = await Agents.find({}, { assignedCustomers: 1 });
      const allAssignedCustomerIds = allAgents
        .map((a) => a.assignedCustomers || [])
        .flat();

      const assignedCustomers = await Customer.find({
        _id: { $in: currentAgent.assignedCustomers || [] },
      });

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

    let findRes;

    if (type === 'order') {
      const query: any = {};
      if (customerId) {
        query.customer = customerId;
      }
      findRes = await Model.find(query)
        .populate({
          path: 'customer',
          select: 'name',
        })
        .populate({
          path: 'product',
          select: 'name productType code price image',
        })
        .lean();
    } else {
      findRes = await Model.find();
    }

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
