'use server';

import { z } from 'zod';
import { findUserByEmail, createUser } from '@/lib/auth';

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export async function registerAction(
  prevState: { error: string; success?: boolean },
  formData: FormData
) {
  const name = formData.get('name');
  const email = formData.get('email');
  const password = formData.get('password');
  const result = registerSchema.safeParse({ name, email, password });
  if (!result.success) {
    return { error: result.error.errors[0].message , success: false };
  }
  try {
    // Check if user already exists
    const existingUser = await findUserByEmail(result.data.email);
    if (existingUser) {
      return { error: 'Email already registered', success: false };
    }
    // Create new user
    await createUser(result.data.email, result.data.password, result.data.name);
    return { error: '', success: true };
  } catch (error) {
    console.error('Registration error:', error);
    return { error: 'An error occurred during registration' };
  }
}
