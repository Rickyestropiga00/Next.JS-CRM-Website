'use server';

import { z } from 'zod';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { findUserByEmail, verifyPassword, SESSION_KEY } from '@/lib/auth';
import { error } from 'console';
import { isRedirectError } from "next/dist/client/components/redirect-error";

const loginSchema = z.object({
  email: z.string().email('Invalid Email Address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export async function loginAction(
  prevState: { error: string },
  formData: FormData
) {
  const email = formData.get('email');
  const password = formData.get('password');
  // Validate input
  const result = loginSchema.safeParse({ email, password });
  if (!result.success) {
    return { error: result.error.errors[0].message };
  }
  try {
    // Find user in database
    const user = await findUserByEmail(result.data.email);
    
    if (!user) {
      return { error: 'Invalid email or password' };
    }
    // Verify password
    const isValid = await verifyPassword(result.data.password, user.password);
    
    if (!isValid) {
      return { error: 'Invalid email or password' };
    }
    // Create session (store user ID in cookie)
    const cookieStore = await cookies();
    const userId = user._id?.toString?.() || user.id;

    if (!userId) {
      return { error: "User ID missing" };
    }

    cookieStore.set(SESSION_KEY, userId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });
    console.log("LOGIN SUCCESS:", {
      inputEmail: result.data.email,
      dbEmail: user.email,
      userId,
    });
    redirect('/dashboard');
  } catch (error) {
    if (isRedirectError(error)) { throw error; }
    console.error('Login error:', error);
    return { error: 'An error occurred during login' };
  }
}
