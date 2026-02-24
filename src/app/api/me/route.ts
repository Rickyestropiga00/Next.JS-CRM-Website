import { NextResponse } from 'next/server';
import { getCurrentUser, SESSION_KEY } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    const user = await getCurrentUser();
    const cookieStore = cookies();
    console.log('Cookies:', (await cookieStore).get(SESSION_KEY)?.value);

    if (!user) {
      return NextResponse.json({ user: null }, { status: 401 });
    }

    return NextResponse.json({
      user: {
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ user: null }, { status: 500 });
  }
}
