import { getCurrentUser } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import NotificationPreference from '@/models/NotificationPreference';
import { NextResponse } from 'next/server';

const ALLOWED_FIELDS: Record<string, string[]> = {
  admin: [
    'customer_new',
    'customer_assigned',
    'order_new',
    'order_shipment_update',
    'task_assigned_to_agent',
    'system_product_low_stock',
    'comment',
  ],
  agent: [
    'customer_assigned',
    'order_new',
    'order_shipment_update',
    'task_assigned_to_agent',
    'comment',
  ],
};

const DEFAULTS: Record<string, boolean> = {
  customer_new: true,
  customer_assigned: true,
  order_new: true,
  order_shipment_update: true,
  task_assigned_to_agent: true,
  system_product_low_stock: true,
  comment: true,
};

export async function GET() {
  await dbConnect();
  const user = await getCurrentUser();

  if (!user)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const prefs = await NotificationPreference.findOne({ userId: user._id });
  const allowed = ALLOWED_FIELDS[user.role] ?? ALLOWED_FIELDS['agent'];

  const response = Object.fromEntries(
    allowed.map((key) => [
      key,
      prefs?.[key as keyof typeof prefs] ?? DEFAULTS[key],
    ])
  );

  return NextResponse.json(response);
}

export async function POST(req: Request) {
  await dbConnect();
  const user = await getCurrentUser();

  if (!user)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const allowed = ALLOWED_FIELDS[user.role] ?? ALLOWED_FIELDS['agent'];

  const update = Object.fromEntries(
    Object.entries(body)
      .filter(([k]) => allowed.includes(k))
      .filter(([, v]) => typeof v === 'boolean')
  );

  if (Object.keys(update).length === 0)
    return NextResponse.json({ error: 'No valid fields' }, { status: 400 });

  await NotificationPreference.findOneAndUpdate(
    { userId: user._id },
    { userId: user._id, ...update },
    { upsert: true, new: true }
  );

  return NextResponse.json({ ok: true });
}
