import User from '@/models/User';
import { NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const user = await User.findOne({
      email,
    });

    if (!user) {
      return NextResponse.json({ error: 'Cannot find email' }, { status: 404 });
    }

    const token = crypto.randomBytes(32).toString('hex');
    const expire = new Date(Date.now() + 1000 * 60 * 10);
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    await User.findByIdAndUpdate(user._id, {
      resetPasswordToken: tokenHash,
      resetPasswordExpires: expire,
    });
    console.log(token);
    const resetLink =
      `${process.env.APP_URL}` + `/reset-password?token=${tokenHash}`;
    console.log(resetLink);
    return NextResponse.json({ success: true, resetLink }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 400 }
    );
  }
}
