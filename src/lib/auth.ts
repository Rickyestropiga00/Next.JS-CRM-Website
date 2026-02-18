import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';
import dbConnect from './mongodb';
import User, { IUser } from '@/models/User';

const SESSION_KEY = 'crm_session';

// Find user by ID
export async function findUserById(id: string) {
  await dbConnect();
  return await User.findById(id); 
}

// Hash password
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(12);
  return bcrypt.hash(password, salt);
}

// Find user by email
export async function findUserByEmail(email: string): Promise<IUser | null> {
  await dbConnect();
  return await User.findOne({ email: email.toLowerCase() });
}

// Verify password
export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return await bcrypt.compare(password, hashedPassword);
}

// Create new user
export async function createUser(email: string, password: string, name: string): Promise<IUser> {
  await dbConnect();
  const hashedPassword = await hashPassword(password);
  const user = await User.create({
    email: email.toLowerCase(),
    password: hashedPassword,
    name,
  });
  return user;
}

// Check if user is authenticated
export async function isAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const session = cookieStore.get(SESSION_KEY)?.value;
  return !!session;
}
// Get current user from session
export async function getCurrentUser(): Promise<IUser | null> {
  const cookieStore = await cookies();
  const userId = cookieStore.get(SESSION_KEY)?.value;
  
  if (!userId) return null;
  
  await dbConnect();
  return User.findById(userId).select('-password');
}
export { SESSION_KEY };
