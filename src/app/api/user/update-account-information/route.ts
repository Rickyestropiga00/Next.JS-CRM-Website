import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';

export async function PUT(req: Request) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name, email, phone, company, location } = await req.json();
    if (!name || !email) {
      return NextResponse.json(
        { error: 'Name and Email are required' },
        { status: 400 }
      );
    }

    const existingUser = await User.findOne({
      email: email.toLowerCase(),
      _id: { $ne: user._id },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email already in use' },
        { status: 400 }
      );
    }

    await dbConnect();

    user.name = name;
    user.email = email.toLowerCase();
    user.phone = phone;
    user.company = company;
    user.location = location;

    await user.save();
    return NextResponse.json(
      { message: 'Account information updated successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
