import { cookies } from 'next/headers';

export const hardcodedUser = {
  email: 'test@example.com',
  password: 'password123',
};

const SESSION_KEY = 'crm_session';

export async function isAuthenticated() {
  const cookieStore = await cookies();
  return cookieStore.get(SESSION_KEY)?.value === 'active';
}

export { SESSION_KEY }; 