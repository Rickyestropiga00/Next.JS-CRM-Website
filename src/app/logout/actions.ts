'use server';

import { cookies } from 'next/headers';
import { SESSION_KEY } from '@/lib/auth';

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_KEY);
} 