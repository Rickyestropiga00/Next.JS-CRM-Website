// Script to seed initial admin user
// TODO: Implement admin user creation script
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { hashPassword } from '@/lib/auth';
async function createAdminUser() {
  await dbConnect();

  const name = process.env.ADMIN_NAME;
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  const existingAdmin = await User.findOne({ email: email });
  if (existingAdmin) {
    console.log('Admin user already exists');
    return;
  }

  if (!password) {
    throw new Error('ADMIN_PASSWORD is missing in .env');
  }

  const hashedPassword = await hashPassword(password);
  const admin = new User({
    name: name,
    email: email,
    password: hashedPassword,
    role: 'admin',
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  await admin.save();
  console.log('Admin user created');
}

createAdminUser()
  .then(() => {
    console.log('Seeding complete');
    process.exit(0);
  })
  .catch((err) => {
    console.error('Error seeding admin user:', err);
    process.exit(1);
  });
