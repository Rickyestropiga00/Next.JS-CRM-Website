import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';

export const config = {
  api: {
    bodyParser: false,
  },
};

export async function PUT(req: Request) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (!req.headers.get('content-type')?.includes('multipart/form-data')) {
      return NextResponse.json(
        { error: 'Invalid Content-Type' },
        { status: 400 }
      );
    }

    const formData = await req.formData();
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const phone = formData.get('phone') as string;
    const company = formData.get('company') as string;
    const location = formData.get('location') as string;
    const avatarFile = formData.get('avatar') as Blob | null;
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

    if (avatarFile && avatarFile.size > 0) {
      const buffer = Buffer.from(await avatarFile.arrayBuffer());
      user.avatar = buffer;
      user.avatarType = avatarFile.type || 'image/png';
      console.log('Avatar uploaded, bytes:', buffer.byteLength);
    }
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
