'use server';

import { z } from 'zod';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { hardcodedUser, SESSION_KEY } from '@/lib/auth';

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export async function loginAction(prevState: { error: string }, formData: FormData) {
  const email = formData.get('email');
  const password = formData.get('password');
  const result = schema.safeParse({ email, password });
  if (!result.success) {
    return { error: 'Invalid input' };
  }
  if (
    email === hardcodedUser.email &&
    password === hardcodedUser.password
  ) {
    const cookieStore = await cookies();
    cookieStore.set(SESSION_KEY, 'active', { httpOnly: true, secure: true, path: '/' });
    redirect('/dashboard');
  }
  return { error: 'Invalid credentials' };
} 